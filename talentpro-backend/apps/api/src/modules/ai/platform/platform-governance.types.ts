export const GOVERNANCE_POLICY_VERSION = '1.0.0';

export interface GovernancePolicy {
  id: string;
  version: string;
  name: string;
  enabled: boolean;
  maxRisk: 'low' | 'medium' | 'high';
  allowedTools: string[];
  blockedDataClasses: string[];
  requireHumanApprovalFor: Array<'high-risk-tool' | 'external-side-effect' | 'bulk-write'>;
  maxStepsPerRun: number;
  maxCostUsd?: number;
  retentionDays: number;
  auditRequired: boolean;
}

export interface GovernanceDecision {
  allowed: boolean;
  reasons: string[];
  requiresApproval: boolean;
  policyVersion: string;
}
