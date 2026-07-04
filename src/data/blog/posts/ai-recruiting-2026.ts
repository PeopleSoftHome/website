import { cover } from '../cover';
import type { BlogPost } from '../types';

export const BLOG_AI_RECRUITING_2026: BlogPost = {
  id: 'blog-1',
  slug: 'ai-recruiting-2026',
  title: '2026 AI 招聘深度指南：从简历筛选到智能面试的落地路径',
  excerpt: 'AI 招聘已从概念验证进入规模化落地阶段。本文拆解简历解析、人岗匹配、AI 面试、Offer 预测四大核心环节的实现要点。',
  content: `## 一、AI 招聘的核心价值
在人才竞争日益激烈的今天，招聘效率直接决定企业的人才密度。AI 招聘通过自动化处理重复性工作，让 HR 回归高价值沟通。

## 二、简历解析的技术演进
从规则模板到深度学习，现代简历解析引擎能够处理 50+ 种格式，关键信息提取准确率超过 95%。

## 三、人岗匹配的关键指标
匹配评分不应只看关键词重叠，而应结合岗位胜任力模型、候选人潜力、文化契合度等多维因素。

## 四、AI 面试的最佳实践
AI 面试官适合初筛场景，能够 7×24 小时工作，但仍需人类 HR 参与终面与关键决策。

## 五、落地建议
1. 从岗位数量大、流程标准化的职位开始试点
2. 建立算法公平性审查机制
3. 持续收集用人部门反馈，迭代模型`,
  coverImage: cover('AI 招聘'),
  createdAt: '2026-05-20T10:00:00.000Z',
  updatedAt: '2026-05-20T10:00:00.000Z',
  category: { id: 'cat-ai', name: 'AI 专栏', slug: 'ai' },
  tags: [{ id: 't1', name: 'AI 招聘' }, { id: 't2', name: '人岗匹配' }],
  status: 'PUBLISHED',
};

export const BLOG_AI_RECRUITING_2026_EN: BlogPost = {
  id: 'blog-1',
  slug: 'ai-recruiting-2026',
  title: '2026 AI Recruiting Deep Dive: From Resume Screening to Smart Interviews',
  excerpt: 'AI recruiting has moved from proof of concept to scaled deployment. This article breaks down the implementation essentials of resume parsing, job-candidate matching, AI interviews, and offer prediction.',
  content: `## 1. The Core Value of AI Recruiting
In today's fierce talent competition, recruiting efficiency directly determines an organization's talent density. AI recruiting automates repetitive work so HR can return to high-value communication.

## 2. The Evolution of Resume Parsing
From rule templates to deep learning, modern resume parsers handle 50+ formats with key information extraction accuracy above 95%.

## 3. Key Metrics for Job-Candidate Matching
Matching scores should not rely solely on keyword overlap. They should combine job competency models, candidate potential, and cultural fit.

## 4. Best Practices for AI Interviews
AI interviewers are ideal for initial screening, working 24/7, but human HR should still own final interviews and key decisions.

## 5. Deployment Recommendations
1. Start with high-volume, standardized roles.
2. Establish algorithmic fairness review mechanisms.
3. Continuously collect hiring-manager feedback to iterate models.`,
  coverImage: cover('AI Recruiting'),
  createdAt: '2026-05-20T10:00:00.000Z',
  updatedAt: '2026-05-20T10:00:00.000Z',
  category: { id: 'cat-ai', name: 'AI Column', slug: 'ai' },
  tags: [{ id: 't1', name: 'AI Recruiting' }, { id: 't2', name: 'Job Matching' }],
  status: 'PUBLISHED',
};
