export const KNOWLEDGE_GRAPH_SCHEMA_VERSION = '1.0.0';

export interface KnowledgeEntity {
  id: string;
  type: string;
  name: string;
  workspaceId?: string | null;
  properties: Record<string, unknown>;
  source?: { type: string; id: string; confidence?: number };
}

export interface KnowledgeRelation {
  id: string;
  fromEntityId: string;
  toEntityId: string;
  type: string;
  workspaceId?: string | null;
  properties?: Record<string, unknown>;
  confidence?: number;
}

export interface KnowledgeGraphQuery {
  workspaceId?: string | null;
  entityType?: string;
  entityId?: string;
  relationType?: string;
  depth?: number;
  limit?: number;
}

export interface KnowledgeGraphResult {
  schemaVersion: string;
  entities: KnowledgeEntity[];
  relations: KnowledgeRelation[];
}
