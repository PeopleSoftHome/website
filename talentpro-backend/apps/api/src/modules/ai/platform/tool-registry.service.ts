import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  ToolDefinition,
  ToolInvocationRequest,
  TOOL_REGISTRY_VERSION,
} from './tool-registry.types';

type ToolHandler = (input: unknown, request: ToolInvocationRequest) => Promise<unknown>;

@Injectable()
export class ToolRegistryService {
  private readonly tools = new Map<string, ToolDefinition>();
  private readonly handlers = new Map<string, ToolHandler>();

  register(definition: ToolDefinition, handler: ToolHandler) {
    if (definition.id.includes('/')) {
      throw new Error('Tool id must not contain /');
    }
    this.tools.set(`${definition.id}@${definition.version}`, definition);
    this.handlers.set(`${definition.id}@${definition.version}`, handler);
    return { registryVersion: TOOL_REGISTRY_VERSION, id: definition.id, version: definition.version };
  }

  list() {
    return [...this.tools.values()];
  }

  get(id: string, version?: string) {
    const versions = [...this.tools.values()].filter((tool) => tool.id === id);
    if (!versions.length) throw new NotFoundException(`Tool ${id} not found`);
    if (version) {
      const match = versions.find((tool) => tool.version === version);
      if (!match) throw new NotFoundException(`Tool ${id}@${version} not found`);
      return match;
    }
    return versions.sort((a, b) => b.version.localeCompare(a.version))[0];
  }

  async invoke(request: ToolInvocationRequest) {
    const definition = this.get(request.toolId, request.version);
    const key = `${definition.id}@${definition.version}`;
    const handler = this.handlers.get(key);
    if (!handler) throw new NotFoundException(`Handler for ${key} not found`);

    if (definition.permissions.length) {
      const allowed = definition.permissions.some((rule) => {
        const roleAllowed = !rule.roles?.length || rule.roles.some((r) => request.context.roles.includes(r));
        return roleAllowed && request.context.permissions.includes(rule.permission);
      });
      if (!allowed) throw new ForbiddenException('Tool permission denied');
    }

    if (definition.dataScope.workspaceScoped && !request.context.workspaceId) {
      throw new ForbiddenException('Workspace context is required for this tool');
    }

    const executionId = randomUUID();
    return {
      executionId,
      tool: { id: definition.id, version: definition.version },
      result: await handler(request.input, request),
    };
  }
}
