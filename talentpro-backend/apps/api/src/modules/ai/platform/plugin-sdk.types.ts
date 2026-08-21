export const PLUGIN_MANIFEST_VERSION = '1.0.0';

export interface PluginPermission {
  permission: string;
  rationale: string;
}

export interface PluginManifest {
  id: string;
  version: string;
  name: string;
  description: string;
  publisher: { id: string; name: string };
  apiVersion: 'v1';
  tools?: string[];
  agents?: string[];
  permissions: PluginPermission[];
  events?: string[];
  ui?: { entrypoint?: string; slots?: string[] };
  security: {
    signed: boolean;
    checksum?: string;
    sandbox: 'isolated';
  };
}

export interface PluginContext {
  userId: string;
  workspaceId?: string | null;
  locale: string;
  requestId: string;
}

export interface PluginLifecycle {
  onInstall?: (context: PluginContext) => Promise<void>;
  onEnable?: (context: PluginContext) => Promise<void>;
  onDisable?: (context: PluginContext) => Promise<void>;
  onUninstall?: (context: PluginContext) => Promise<void>;
}
