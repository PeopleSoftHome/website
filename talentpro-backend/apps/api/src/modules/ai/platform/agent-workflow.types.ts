export const AGENT_SCHEMA_VERSION = '1.0.0';
export const WORKFLOW_SCHEMA_VERSION = '1.0.0';

export interface AgentDefinition {
  id: string;
  version: string;
  name: string;
  description: string;
  systemPolicy: string;
  tools: string[];
  allowedRisk: 'low' | 'medium' | 'high';
  memory: { enabled: boolean; maxItems: number };
  governancePolicyId: string;
}

export type WorkflowNode =
  | { id: string; type: 'input'; name: string; schema: Record<string, unknown> }
  | { id: string; type: 'tool'; toolId: string; version?: string; input: Record<string, unknown> }
  | { id: string; type: 'agent'; agentId: string; version?: string; input: Record<string, unknown> }
  | { id: string; type: 'condition'; expression: string }
  | { id: string; type: 'output'; name: string };

export interface WorkflowDefinition {
  id: string;
  version: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: Array<{ from: string; to: string; when?: string }>;
  timeoutMs: number;
  maxSteps: number;
  governancePolicyId: string;
}
