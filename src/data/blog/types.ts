export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

export interface BlogTag {
  id: string;
  name: string;
}

export type BlogStatus = 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  createdAt: string;
  updatedAt: string;
  category: BlogCategory;
  tags: BlogTag[];
  status: BlogStatus;
}
