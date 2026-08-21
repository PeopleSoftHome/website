import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import type Redis from 'ioredis';
import type { Cluster } from 'ioredis';
import { REDIS_CLIENT } from '@shared/redis/redis.module';
import { ToolDefinition, ToolInvocationRequest, TOOL_REGISTRY_VERSION, ToolRisk } from './tool-registry.types';
import type { GovernanceDecision, GovernancePolicy } from './platform-governance.types';

type ToolHandler = (input: unknown, request: ToolInvocationRequest) => Promise<unknown>;
const RISK_RANK: Record<ToolRisk, number> = { low: 1, medium: 2, high: 3, critical: 4 };
const GOVERNANCE_KEY = 'ai:governance:policy:enterprise-default';
const TOOL_PREFIX = 'ai:tool:';
const AUDIT_INDEX_KEY = 'ai:tool:audit:index';
const AUDIT_KEY_PREFIX = 'ai:tool:audit:';

const DEFAULT_POLICY: GovernancePolicy = {
  id: 'enterprise-default',
  version: '1.1.0',
  name: 'Enterprise Default Governance',
  enabled: true,
  maxRisk: 'medium',
  allowedTools: ['analyze_workforce', 'search_product', 'get_case', 'find_policy', 'analyze_workforce_demo', 'apply_workforce_action_demo'],
  blockedDataClasses: ['raw_credentials', 'payment_card_data', 'private_keys'],
  requireHumanApprovalFor: ['high-risk-tool', 'external-side-effect', 'bulk-write'],
  maxStepsPerRun: 20,
  maxCostUsd: 2,
  retentionDays: 30,
  auditRequired: true,
};

@Injectable()
export class ToolRegistryService {
  private readonly tools = new Map<string, ToolDefinition>();
  private readonly handlers = new Map<string, ToolHandler>();

  constructor(private readonly config: ConfigService, private readonly redis: Redis | Cluster) {
    void this.ensurePolicy();
  }

  register(definition: ToolDefinition, handler: ToolHandler) {
    if (definition.id.includes('/')) throw new Error('Tool id must not contain /');
    const key = `${definition.id}@${definition.version}`;
    this.tools.set(key, definition);
    this.handlers.set(key, handler);
    void this.redis.set(`${TOOL_PREFIX}${key}`, JSON.stringify(definition));
    return { registryVersion: TOOL_REGISTRY_VERSION, id: definition.id, version: definition.version };
  }

  async list() {
    const merged = new Map([...this.tools.values()].map((tool) => [`${tool.id}@${tool.version}`, tool]));
    const keys = await this.redis.keys(`${TOOL_PREFIX}*`);
    if (keys.length) {
      const persisted = await this.redis.mget(...keys);
      for (const raw of persisted) {
        if (!raw) continue;
        try {
          const tool = JSON.parse(raw) as ToolDefinition;
          merged.set(`${tool.id}@${tool.version}`, tool);
        } catch {
          // Ignore malformed persisted entries; registration on workers remains authoritative.
        }
      }
    }
    return [...merged.values()];
  }

  async get(id: string, version?: string) {
    const versions = (await this.list()).filter((tool) => tool.id === id);
    if (!versions.length) throw new NotFoundException(`Tool ${id} not found`);
    if (version) {
      const match = versions.find((tool) => tool.version === version);
      if (!match) throw new NotFoundException(`Tool ${id}@${version} not found`);
      return match;
    }
    return versions.sort((a, b) => b.version.localeCompare(a.version))[0];
  }

  async invoke(request: ToolInvocationRequest) {
    const definition = await this.get(request.toolId, request.version);
    const key = `${definition.id}@${definition.version}`;
    const handler = this.handlers.get(key);
    if (!handler) throw new NotFoundException(`Handler for ${key} not found on this worker`);

    this.assertPermission(definition, request);
    this.assertWorkspaceScope(definition, request);
    const governance = await this.evaluateGovernance(definition, request);

    if (!governance.allowed && !governance.requiresApproval) {
      await this.audit({ executionId: null, request, definition, governance, status: 'denied' });
      throw new ForbiddenException(`Tool governance denied invocation: ${governance.reasons.join('; ')}`);
    }
    if (governance.requiresApproval && !request.context.approvalToken) {
      await this.audit({ executionId: null, request, definition, governance, status: 'awaiting_human_approval' });
      return { executionId: null, governance, status: 'awaiting_human_approval' };
    }

    const executionId = randomUUID();
    const result = await handler(request.input, request);
    await this.audit({ executionId, request, definition, governance, status: 'completed' });
    return { executionId, tool: { id: definition.id, version: definition.version }, governance, result };
  }

  private assertPermission(definition: ToolDefinition, request: ToolInvocationRequest) {
    if (!definition.permissions.length) return;
    const allowed = definition.permissions.some((rule) => {
      const roleAllowed = !rule.roles?.length || rule.roles.some((role) => request.context.roles.includes(role));
      return roleAllowed && request.context.permissions.includes(rule.permission);
    });
    if (!allowed) throw new ForbiddenException('Tool permission denied');
  }

  private assertWorkspaceScope(definition: ToolDefinition, request: ToolInvocationRequest) {
    if (definition.dataScope.workspaceScoped && !request.context.workspaceId) throw new ForbiddenException('Workspace context is required for this tool');
  }

  private async evaluateGovernance(definition: ToolDefinition, request: ToolInvocationRequest): Promise<GovernanceDecision> {
    const policy = await this.loadPolicy();
    if (!policy.enabled) return { allowed: true, reasons: [], requiresApproval: false, policyVersion: policy.version };
    const reasons: string[] = [];
    if (!policy.allowedTools.includes(definition.id) && !policy.allowedTools.includes('*')) reasons.push(`tool ${definition.id} is not allowlisted`);
    if (RISK_RANK[definition.risk] > RISK_RANK[policy.maxRisk]) reasons.push(`risk ${definition.risk} exceeds maxRisk ${policy.maxRisk}`);
    const blocked = (request.context.dataClasses || []).filter((value) => policy.blockedDataClasses.includes(value));
    if (blocked.length) reasons.push(`blocked data classes: ${blocked.join(', ')}`);
    const steps = request.context.steps ?? 1;
    if (steps > policy.maxStepsPerRun) reasons.push(`step budget exceeded: ${steps} > ${policy.maxStepsPerRun}`);
    const cost = request.context.estimatedCostUsd ?? 0;
    if (policy.maxCostUsd !== undefined && cost > policy.maxCostUsd) reasons.push(`cost budget exceeded: ${cost} > ${policy.maxCostUsd}`);
    if (reasons.length) return { allowed: false, reasons, requiresApproval: false, policyVersion: policy.version };
    const approvalReason = definition.risk === 'high' || definition.risk === 'critical' ? 'high-risk-tool' : definition.sideEffects && definition.auditRequired ? 'external-side-effect' : definition.name.toLowerCase().includes('bulk') ? 'bulk-write' : null;
    const requiresApproval = Boolean(approvalReason && policy.requireHumanApprovalFor.includes(approvalReason));
    return { allowed: !requiresApproval || Boolean(request.context.approvalToken), reasons: requiresApproval ? [`human approval required: ${approvalReason}`] : [], requiresApproval, policyVersion: policy.version };
  }

  private async ensurePolicy() {
    try {
      const raw = await this.redis.get(GOVERNANCE_KEY);
      if (!raw) {
        await this.redis.set(GOVERNANCE_KEY, JSON.stringify(DEFAULT_POLICY));
        return;
      }
      const current = JSON.parse(raw) as GovernancePolicy;
      if (current.version !== DEFAULT_POLICY.version) await this.redis.set(GOVERNANCE_KEY, JSON.stringify(DEFAULT_POLICY));
    } catch {
      // Runtime invocation will surface Redis errors in production rather than silently bypassing governance.
    }
  }

  private async loadPolicy(): Promise<GovernancePolicy> {
    const raw = await this.redis.get(GOVERNANCE_KEY);
    if (!raw) throw new Error('AI governance policy is unavailable');
    try { return JSON.parse(raw) as GovernancePolicy; } catch { throw new Error('AI governance policy is invalid'); }
  }

  private async audit(payload: { executionId: string | null; request: ToolInvocationRequest; definition: ToolDefinition; governance: GovernanceDecision; status: string }) {
    if (!this.config.get<boolean>('AI_GOVERNANCE_AUDIT', true)) return;
    const id = randomUUID();
    const retentionSeconds = Math.max(86_400, Number(payload.definition.auditRequired ? DEFAULT_POLICY.retentionDays : 7) * 86_400);
    const record = { id, at: new Date().toISOString(), executionId: payload.executionId, status: payload.status, userId: payload.request.context.userId, workspaceId: payload.request.context.workspaceId || null, requestId: payload.request.context.requestId, toolId: payload.definition.id, version: payload.definition.version, governance: payload.governance };
    await this.redis.set(`${AUDIT_KEY_PREFIX}${id}`, JSON.stringify(record), 'EX', retentionSeconds);
    await this.redis.zadd(AUDIT_INDEX_KEY, Date.now(), id);
    await this.redis.zremrangebyscore(AUDIT_INDEX_KEY, 0, Date.now() - retentionSeconds * 1000);
  }
}
