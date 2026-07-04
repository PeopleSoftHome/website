import { cover } from '../cover';
import type { BlogPost } from '../types';

export const BLOG_HR_DATA_SECURITY: BlogPost = {
  id: 'blog-3',
  slug: 'hr-data-security',
  title: 'HR SaaS 数据安全 checklist：等保三级只是起点',
  excerpt: '员工数据是企业最敏感的资产之一。本文梳理 HR 系统选型时必须验证的 12 项安全能力。',
  content: `## 数据安全为何是 HR SaaS 的生命线
从身份信息到薪酬数据，HR 系统存储着企业最核心的人员数据。

## 12 项核心能力
1. 传输加密与存储加密
2. 细粒度权限控制
3. 操作审计日志
4. 数据脱敏与分级
5. 异地备份与灾备
6. 第三方安全认证
7. 隐私合规框架
8. API 访问控制
9. 员工自助授权
10. 数据生命周期管理
11. 渗透测试与漏洞响应
12. 供应商安全评估`,
  coverImage: cover('数据安全'),
  createdAt: '2026-05-08T08:00:00.000Z',
  updatedAt: '2026-05-08T08:00:00.000Z',
  category: { id: 'cat-insight', name: '行业洞察', slug: 'insight' },
  tags: [{ id: 't5', name: '数据安全' }, { id: 't6', name: '合规' }],
  status: 'PUBLISHED',
};

export const BLOG_HR_DATA_SECURITY_EN: BlogPost = {
  id: 'blog-3',
  slug: 'hr-data-security',
  title: 'HR SaaS Data Security Checklist: Level-3 Compliance Is Just the Start',
  excerpt: 'Employee data is among an enterprise\'s most sensitive assets. This article outlines 12 security capabilities to verify when selecting an HR system.',
  content: `## Why Data Security Is the Lifeline of HR SaaS
From identity information to payroll data, HR systems store the most critical personnel data.

## 12 Core Capabilities
1. Encryption in transit and at rest
2. Granular permission control
3. Audit logs
4. Data masking and classification
5. Off-site backup and disaster recovery
6. Third-party security certifications
7. Privacy compliance framework
8. API access control
9. Employee self-service authorization
10. Data lifecycle management
11. Penetration testing and vulnerability response
12. Vendor security assessment`,
  coverImage: cover('Data Security'),
  createdAt: '2026-05-08T08:00:00.000Z',
  updatedAt: '2026-05-08T08:00:00.000Z',
  category: { id: 'cat-insight', name: 'Industry Insight', slug: 'insight' },
  tags: [{ id: 't5', name: 'Data Security' }, { id: 't6', name: 'Compliance' }],
  status: 'PUBLISHED',
};
