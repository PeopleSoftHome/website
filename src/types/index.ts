/**
 * Shared TypeScript types for TalentPro portal.
 * This file will grow as more modules are migrated from JS to TS.
 */

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
}

export interface CmsItem {
  id: string;
  slug: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
