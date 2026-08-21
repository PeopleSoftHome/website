import { Inject, Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import type Redis from 'ioredis';
import type { Cluster } from 'ioredis';
import { randomBytes, randomUUID } from 'crypto';
import { REDIS_CLIENT } from '@shared/redis/redis.module';
import { AiGatewayService } from './ai-gateway.service';
import { ToolRegistryService } from './platform/tool-registry.service';
import type { ToolInvocationRequest } from './platform/tool-registry.types';
import type { UserContext } from '@shared/types';

export const DEMO_AGENT_CONTEXT = {
  userId: 'public-demo-user', workspaceId: 'demo-workspace', roles: ['DEMO_USER'], permissions: ['ai:demo:analyze', 'ai:demo:action'],
  dataScope: { workspaceId: 'demo-workspace', dataClasses: ['aggregated_workforce_metrics'], fields: ['hiring_funnel', 'engagement', 'capacity', 'cost'] },
} as const;

type DemoPrompt = { id: string; question: string; metrics: string[]; finding: string; decision: string; action: string };
interface AgentActionJob { actionKey: string; action: Record<string, unknown> }
interface PendingApproval { approvalId: string; nonce: string; promptId: string; requestId: string; expiresAt: number; status: 'pending' | 'approved' }

const PROMPTS: DemoPrompt[] = [
  { id: 'hiring-efficiency', question: 'Why did hiring efficiency drop this quarter?', metrics: ['12,481 workforce signals', 'conversion by funnel stage', 'offer acceptance rate'], finding: '3 conversion bottlenecks in high-friction funnel stages', decision: 'Rebalance recruiter capacity', action: 'Shift 18 recruiter hours to the highest-friction funnel stages' },
  { id: 'attrition-risk', question: 'Which teams are most at risk of regrettable attrition?', metrics: ['7,208 engagement signals', 'manager pulse', 'team-level risk trend'], finding: '2 teams with rising attrition risk', decision: 'Launch manager interventions', action: 'Create targeted manager check-ins for the two highest-risk teams' },
  { id: 'workforce-cost', question: 'Where can we reduce workforce cost without slowing growth?', metrics: ['31 cost and capacity metrics', 'workflow volume', 'approval cycle time'], finding: '4 low-leverage activities', decision: 'Automate repeatable workflows', action: 'Automate four repeatable approvals and recover 126 hours / month' },
];

@Injectable()
export class AgentDemoService {
  constructor(
    private readonly gateway: AiGatewayService,
    private readonly config: ConfigService,
    private readonly tools: ToolRegistryService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis | Cluster,
    @InjectQueue('agent-actions') private readonly actionQueue: Queue<AgentActionJob>,
  ) {
    this.tools.register({
      id: 'analyze_workforce_demo', version: '1.0.0', name: 'Analyze workforce demo', description: 'Analyze workspace-scoped aggregated workforce metrics for the product demo.',
      inputSchema: { type: 'object', required: ['promptId'] }, outputSchema: { type: 'object' },
      permissions: [{ permission: 'ai:demo:analyze', roles: ['DEMO_USER'] }], dataScope: { workspaceScoped: true, resourceTypes: ['aggregated_workforce_metrics'] }, risk: 'low', auditRequired: true, sideEffects: false,
    }, async (input: unknown) => {
      const promptId = typeof input === 'object' && input !== null && 'promptId' in input ? String((input as { promptId: unknown }).promptId) : PROMPTS[0].id;
      const prompt = PROMPTS.find((item) => item.id === promptId) || PROMPTS[0];
      return { metrics: prompt.metrics, finding: prompt.finding, decision: prompt.decision, workspaceId: DEMO_AGENT_CONTEXT.workspaceId };
    });

    this.tools.register({
      id: 'apply_workforce_action_demo', version: '1.0.0', name: 'Apply workforce demo action', description: 'Queue a synthetic demo workflow action after explicit human approval.',
      inputSchema: { type: 'object', required: ['promptId', 'requestId'] }, outputSchema: { type: 'object' },
      permissions: [{ permission: 'ai:demo:action', roles: ['DEMO_USER', 'ADMIN', 'SUPER_ADMIN'] }], dataScope: { workspaceScoped: true, resourceTypes: ['aggregated_workforce_metrics'] }, risk: 'low', auditRequired: true, sideEffects: true,
    }, async (input: unknown) => {
      const payload = input as { promptId: string; requestId: string; approvalId: string; approverId: string };
      const prompt = PROMPTS.find((item) => item.id === payload.promptId) || PROMPTS[0];
      return this.queueAction(prompt, payload.requestId, payload.approvalId, payload.approverId);
    });
  }

  async run(input: { promptId?: string; apply?: boolean; locale?: string }) {
    const prompt = PROMPTS.find((item) => item.id === input.promptId) || PROMPTS[0];
    const requestId = randomUUID();
    const providerConfigured = this.isProviderConfigured();
    const production = this.config.get('APP_ENV', 'development') === 'production';
    if ((production || this.config.get('AGENT_DEMO_REQUIRE_PROVIDER', 'false') === 'true') && !providerConfigured) throw new ServiceUnavailableException('Agent demo requires a configured LLM provider');

    const context = { userId: DEMO_AGENT_CONTEXT.userId, workspaceId: DEMO_AGENT_CONTEXT.workspaceId, roles: [...DEMO_AGENT_CONTEXT.roles], permissions: [...DEMO_AGENT_CONTEXT.permissions], requestId, dataClasses: [...DEMO_AGENT_CONTEXT.dataScope.dataClasses], steps: input.apply ? 2 : 1, estimatedCostUsd: 0 };
    const analysisInvocation = await this.tools.invoke({ toolId: 'analyze_workforce_demo', version: '1.0.0', input: { promptId: prompt.id }, context });
    const toolResult = analysisInvocation.result as { metrics: string[]; finding: string; decision: string };

    const response = await this.gateway.chat({ subject: `agent-demo:${DEMO_AGENT_CONTEXT.workspaceId}`, locale: input.locale || 'en', message: prompt.question, history: [{ role: 'system', content: ['You are the TalentPro workforce agent demo.', `User=${DEMO_AGENT_CONTEXT.userId}`, `Workspace=${DEMO_AGENT_CONTEXT.workspaceId}`, `Role=${DEMO_AGENT_CONTEXT.roles.join(',')}`, `Permissions=${DEMO_AGENT_CONTEXT.permissions.join(',')}`, `DataScope=${DEMO_AGENT_CONTEXT.dataScope.dataClasses.join(',')}`, `ToolResult=${JSON.stringify(toolResult)}`, 'Do not invent data outside this scope.'].join('\n') }] });

    let action: unknown = null;
    if (input.apply) {
      const approvalId = randomUUID();
      const pending: PendingApproval = { approvalId, nonce: randomBytes(32).toString('hex'), promptId: prompt.id, requestId, expiresAt: Date.now() + 10 * 60_000, status: 'pending' };
      await this.redis.set(`ai:agent:approval:${approvalId}`, JSON.stringify(pending), 'EX', 600);
      action = { status: 'awaiting_human_approval', approvalId, expiresAt: pending.expiresAt };
    }

    return { requestId, providerConfigured, context: DEMO_AGENT_CONTEXT, tool: { id: 'analyze_workforce_demo', version: '1.0.0', risk: 'low', dataScope: DEMO_AGENT_CONTEXT.dataScope, result: toolResult }, analysis: { question: prompt.question, response: response.content, finding: prompt.finding, decision: prompt.decision, action: prompt.action }, action };
  }

  async approve(approvalId: string, user: UserContext) {
    const raw = await this.redis.get(`ai:agent:approval:${approvalId}`);
    if (!raw) throw new UnauthorizedException('Approval request not found or expired');
    const pending = JSON.parse(raw) as PendingApproval;
    if (pending.status !== 'pending' || pending.expiresAt < Date.now()) throw new UnauthorizedException('Approval request is no longer valid');
    const approverId = user.userId || (user as unknown as { id?: string }).id || 'unknown-admin';
    const context = { userId: approverId, workspaceId: DEMO_AGENT_CONTEXT.workspaceId, roles: [...(user.roles || []), 'ADMIN'], permissions: [...(user.permissions || []), 'ai:demo:action'], requestId: pending.requestId, dataClasses: [...DEMO_AGENT_CONTEXT.dataScope.dataClasses], steps: 2, estimatedCostUsd: 0, approvalToken: pending.nonce };
    const invocation = await this.tools.invoke({ toolId: 'apply_workforce_action_demo', version: '1.0.0', input: { promptId: pending.promptId, requestId: pending.requestId, approvalId, approverId }, context });
    await this.redis.del(`ai:agent:approval:${approvalId}`);
    return invocation;
  }

  private async queueAction(prompt: DemoPrompt, requestId: string, approvalId: string, approverId: string) {
    const action = { id: randomUUID(), requestId, toolId: 'apply_workforce_action_demo', workspaceId: DEMO_AGENT_CONTEXT.workspaceId, permission: 'ai:demo:action', approval: 'human-approved', approvalId, approverId, action: prompt.action, createdAt: new Date().toISOString(), status: 'queued' };
    const actionKey = `ai:demo:action:${action.id}`;
    await this.redis.set(actionKey, JSON.stringify(action), 'EX', 86_400);
    const job = await this.actionQueue.add('apply-workforce-action', { actionKey, action });
    return { ...action, jobId: job.id };
  }

  private isProviderConfigured() { return Boolean(this.config.get('OPENAI_API_KEY') || this.config.get('AZURE_OPENAI_API_KEY') || this.config.get('ANTHROPIC_API_KEY')); }
}
