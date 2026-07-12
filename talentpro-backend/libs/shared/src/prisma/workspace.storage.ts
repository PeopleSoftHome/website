import { AsyncLocalStorage } from 'async_hooks';

export const workspaceStorage = new AsyncLocalStorage<string | null>();
