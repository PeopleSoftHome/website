export const EVENT_CONTRACT_VERSION = '1';

export type DomainEventName =
  | 'lead.created.v1'
  | 'workspace.updated.v1'
  | 'media.created.v1'
  | 'ai.request.completed.v1'
  | 'ai.request.failed.v1';

export interface DomainEvent<TPayload = unknown> {
  id: string;
  type: DomainEventName;
  version: typeof EVENT_CONTRACT_VERSION;
  occurredAt: string;
  producer: string;
  correlationId?: string;
  actorId?: string;
  workspaceId?: string;
  payload: TPayload;
}

export function createDomainEvent<TPayload>(input: {
  id: string;
  type: DomainEventName;
  producer: string;
  payload: TPayload;
  correlationId?: string;
  actorId?: string;
  workspaceId?: string;
}): DomainEvent<TPayload> {
  return {
    ...input,
    version: EVENT_CONTRACT_VERSION,
    occurredAt: new Date().toISOString(),
  };
}
