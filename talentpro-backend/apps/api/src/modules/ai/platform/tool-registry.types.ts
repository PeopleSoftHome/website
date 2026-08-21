export const TOOL_REGISTRY_VERSION = '1.0.0';

export type ToolRisk = 'low' | 'medium' | 'high' | 'critical';

export interface ToolDataScope {
  workspaceScoped: boolean;
  resourceTypes: string[];
  fields?: string[];
}

export interface ToolPermission {
  permission: string;
  roles?: string[];
}

export interface ToolDefinition {
  id: string;
  version: string;
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  permissions: ToolPermission[];
  dataScope: ToolDataScope;
  risk: ToolRisk;
  auditRequired: boolean;
  sideEffects: boolean;
}

export interface ToolInvocationContext {
  userId: string;
  workspaceId?: string | null;
  roles: string[];
  permissions: string[];
  requestId: string;
}

export interface ToolInvocationRequest {
  toolId: string;
  version?: string;
  input: unknown;
  context: ToolInvocationContext;
}
