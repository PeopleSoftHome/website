/**
 * Shared common types used across the API layer.
 */

export interface UserPermission {
  resource: string;
  action: string;
}

export interface UserRoleContext {
  name: string;
  permissions?: UserPermission[];
}

/**
 * JWT-authenticated user payload attached to requests by Passport.
 */
export interface UserContext {
  id: string;
  workspaceId?: string;
  role?: UserRoleContext;
}

/**
 * Generic plain object shape for dynamic JSON/config fields.
 */
export type JsonObject = Record<string, unknown>;
