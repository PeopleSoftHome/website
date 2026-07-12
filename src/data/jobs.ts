/**
 * 招聘职位静态 Fallback 数据
 * 当 CMS / API 不可用时作为降级数据使用
 * v4.3.0: 新增，支持 SSR/SSG 预渲染 /careers/[id]
 */

export interface Job {
  id: string;
  title: string;
  type: string;
  department: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  summary?: string;
  description?: string;
  requirements?: string;
  responsibilities?: string;
  experience?: string;
  education?: string;
  headcount?: number;
  createdAt?: string;
}

const JOBS_ZH: Job[] = [
  {
    id: 'job-senior-frontend',
    title: '高级前端工程师',
    type: '社招',
    department: '研发部',
    location: '北京',
    salaryMin: 30,
    salaryMax: 50,
    summary: '负责 TalentPro 核心产品前端架构设计与开发。',
    description: '负责 TalentPro 核心产品前端架构设计与开发。\n\n你将参与高性能、可扩展的 B2B SaaS 前端系统建设，推动工程化、组件化与性能优化，主导营销门户与 Admin 配置化改造。',
    requirements: '- 5 年以上前端开发经验\n- 精通 Vue 3 / React / TypeScript\n- 熟悉工程化、性能优化与单元测试\n- 有大型 SSR/SSG 项目经验优先',
    responsibilities: '- 负责核心产品前端架构设计\n- 参与技术选型、代码评审与性能优化\n- 指导初中级工程师成长\n- 推动前端工程化与组件库建设',
    experience: '5 年以上',
    education: '本科及以上',
    headcount: 2,
    createdAt: '2026-06-01T00:00:00.000Z',
  },
  {
    id: 'job-ai-algorithm',
    title: 'AI 算法工程师',
    type: '社招',
    department: 'AI Lab',
    location: '北京 / 上海',
    salaryMin: 35,
    salaryMax: 60,
    summary: '负责 TalentPro AI Family 系列产品的算法研发。',
    description: '负责 TalentPro AI Family 系列产品的算法研发。\n\n你将聚焦大语言模型、推荐系统、NLP 在 HR 场景的应用，打造行业领先的 AI 招聘与人才管理解决方案。',
    requirements: '- 计算机、数学等相关专业硕士及以上学历\n- 熟悉 PyTorch / TensorFlow，有 LLM 微调经验\n- 有 NLP、推荐系统或知识图谱项目经验',
    responsibilities: '- 负责 AI 招聘、AI 面试等核心算法研发\n- 构建与优化人才匹配、简历解析模型\n- 跟踪前沿技术并落地到产品',
    experience: '3 年以上',
    education: '硕士及以上',
    headcount: 3,
    createdAt: '2026-06-01T00:00:00.000Z',
  },
  {
    id: 'job-product-manager-recruit',
    title: '产品经理（招聘方向）',
    type: '社招',
    department: '产品部',
    location: '北京',
    salaryMin: 25,
    salaryMax: 45,
    summary: '负责招聘管理系统的产品规划与迭代。',
    description: '负责招聘管理系统的产品规划与迭代。\n\n你将深入理解企业招聘全链路痛点，设计并推动 AI 驱动的招聘产品方案落地。',
    requirements: '- 3 年以上 B 端 SaaS 产品经验\n- 有 HR / 招聘 / ATS 产品背景优先\n- 具备出色的需求分析、项目推动能力',
    responsibilities: '- 负责招聘管理系统产品规划与迭代\n- 深入客户现场，挖掘招聘场景痛点\n- 协同设计、研发、算法推动功能上线',
    experience: '3 年以上',
    education: '本科及以上',
    headcount: 2,
    createdAt: '2026-06-01T00:00:00.000Z',
  },
  {
    id: 'job-customer-success',
    title: '客户成功经理',
    type: '社招',
    department: '客户成功部',
    location: '上海 / 深圳',
    salaryMin: 20,
    salaryMax: 40,
    summary: '负责中大型客户全生命周期管理。',
    description: '负责中大型客户全生命周期管理。\n\n你将作为客户与产品、交付团队的桥梁，确保客户成功上线并持续创造价值。',
    requirements: '- 3 年以上 SaaS 客户成功或实施经验\n- 具备出色的沟通、项目管理能力\n- 有 HR SaaS 或大型企业服务经验优先',
    responsibilities: '- 负责中大型客户全生命周期管理\n- 制定并落地客户成功计划\n- 推动客户增购、续约与口碑传播',
    experience: '3 年以上',
    education: '本科及以上',
    headcount: 4,
    createdAt: '2026-06-01T00:00:00.000Z',
  },
  {
    id: 'job-management-trainee',
    title: '2026 届管培生',
    type: '校招',
    department: '管培生项目',
    location: '北京',
    salaryMin: 15,
    salaryMax: 25,
    summary: '为期 18 个月的轮岗培养计划。',
    description: '为期 18 个月的轮岗培养计划。\n\n你将在产品、研发、客户成功等核心部门轮岗，快速成长为独当一面的专业人才。',
    requirements: '- 2026 届本科及以上学历\n- 对 HR SaaS / AI 领域有热情\n- 具备优秀的学习能力与自驱力',
    responsibilities: '- 参与核心部门轮岗学习\n- 承担具体项目并输出成果\n- 完成管培生培养计划各阶段目标',
    experience: '应届生',
    education: '本科及以上',
    headcount: 10,
    createdAt: '2026-06-01T00:00:00.000Z',
  },
  {
    id: 'job-frontend-intern',
    title: '前端开发实习生',
    type: '实习',
    department: '研发部',
    location: '北京',
    salaryMin: 5,
    salaryMax: 8,
    summary: '参与前端组件库和营销门户开发。',
    description: '参与前端组件库和营销门户开发。\n\n你将有机会接触 Vue 3 + Nuxt + TypeScript 技术栈，参与真实产品功能开发。',
    requirements: '- 计算机相关专业在校生\n- 熟悉 HTML / CSS / JavaScript\n- 了解 Vue 或 React 优先',
    responsibilities: '- 参与前端组件与页面开发\n- 协助修复 Bug 与优化性能\n- 参与代码评审与技术分享',
    experience: '在校生',
    education: '本科及以上',
    headcount: 5,
    createdAt: '2026-06-01T00:00:00.000Z',
  },
];

const JOBS_EN: Job[] = [
  {
    id: 'job-senior-frontend',
    title: 'Senior Frontend Engineer',
    type: 'Full-time',
    department: 'Engineering',
    location: 'Beijing',
    salaryMin: 30,
    salaryMax: 50,
    summary: 'Responsible for frontend architecture and development of TalentPro core products.',
    description: 'Responsible for frontend architecture and development of TalentPro core products.\n\nYou will build high-performance, scalable B2B SaaS frontend systems and drive engineering, componentization, and performance optimization.',
    requirements: '- 5+ years of frontend development experience\n- Proficient in Vue 3 / React / TypeScript\n- Familiar with engineering practices, performance optimization, and unit testing\n- Experience with large SSR/SSG projects preferred',
    responsibilities: '- Design frontend architecture for core products\n- Participate in technology selection, code review, and performance optimization\n- Mentor junior and mid-level engineers\n- Drive frontend engineering and component library initiatives',
    experience: '5+ years',
    education: "Bachelor's degree or above",
    headcount: 2,
    createdAt: '2026-06-01T00:00:00.000Z',
  },
  {
    id: 'job-ai-algorithm',
    title: 'AI Algorithm Engineer',
    type: 'Full-time',
    department: 'AI Lab',
    location: 'Beijing / Shanghai',
    salaryMin: 35,
    salaryMax: 60,
    summary: 'Responsible for algorithm R&D of TalentPro AI Family products.',
    description: 'Responsible for algorithm R&D of TalentPro AI Family products.\n\nYou will focus on large language models, recommendation systems, and NLP applications in HR scenarios.',
    requirements: "- Master's degree or above in Computer Science, Mathematics, or related fields\n- Familiar with PyTorch / TensorFlow and LLM fine-tuning\n- Experience in NLP, recommendation systems, or knowledge graphs",
    responsibilities: '- Develop core algorithms for AI recruiting and AI interviewing\n- Build and optimize talent matching and resume parsing models\n- Track cutting-edge technologies and land them in products',
    experience: '3+ years',
    education: "Master's degree or above",
    headcount: 3,
    createdAt: '2026-06-01T00:00:00.000Z',
  },
  {
    id: 'job-product-manager-recruit',
    title: 'Product Manager (Recruiting)',
    type: 'Full-time',
    department: 'Product',
    location: 'Beijing',
    salaryMin: 25,
    salaryMax: 45,
    summary: 'Responsible for product planning and iteration of the recruitment management system.',
    description: 'Responsible for product planning and iteration of the recruitment management system.\n\nYou will deeply understand enterprise recruiting pain points and design AI-driven product solutions.',
    requirements: '- 3+ years of B2B SaaS product experience\n- Background in HR / recruiting / ATS products preferred\n- Strong requirement analysis and project execution skills',
    responsibilities: '- Plan and iterate the recruitment management system\n- Conduct customer research to identify recruiting pain points\n- Collaborate with design, engineering, and algorithm teams to ship features',
    experience: '3+ years',
    education: "Bachelor's degree or above",
    headcount: 2,
    createdAt: '2026-06-01T00:00:00.000Z',
  },
  {
    id: 'job-customer-success',
    title: 'Customer Success Manager',
    type: 'Full-time',
    department: 'Customer Success',
    location: 'Shanghai / Shenzhen',
    salaryMin: 20,
    salaryMax: 40,
    summary: 'Responsible for full lifecycle management of mid-to-large enterprise customers.',
    description: 'Responsible for full lifecycle management of mid-to-large enterprise customers.\n\nYou will serve as the bridge between customers and product/delivery teams to ensure successful onboarding and continuous value creation.',
    requirements: '- 3+ years of SaaS customer success or implementation experience\n- Excellent communication and project management skills\n- Experience in HR SaaS or enterprise services preferred',
    responsibilities: '- Manage full lifecycle of mid-to-large enterprise customers\n- Develop and execute customer success plans\n- Drive upsell, renewal, and word-of-mouth referrals',
    experience: '3+ years',
    education: "Bachelor's degree or above",
    headcount: 4,
    createdAt: '2026-06-01T00:00:00.000Z',
  },
  {
    id: 'job-management-trainee',
    title: '2026 Management Trainee',
    type: 'Campus',
    department: 'Management Trainee Program',
    location: 'Beijing',
    salaryMin: 15,
    salaryMax: 25,
    summary: 'An 18-month rotation program for fast-track development.',
    description: 'An 18-month rotation program for fast-track development.\n\nYou will rotate across core departments including Product, Engineering, and Customer Success to grow into an independent professional.',
    requirements: '- 2026 graduates with bachelor degree or above\n- Passion for HR SaaS and AI\n- Strong learning ability and self-drive',
    responsibilities: '- Participate in rotations across core departments\n- Own specific projects and deliver results\n- Complete milestones of the trainee program',
    experience: 'New graduate',
    education: "Bachelor's degree or above",
    headcount: 10,
    createdAt: '2026-06-01T00:00:00.000Z',
  },
  {
    id: 'job-frontend-intern',
    title: 'Frontend Development Intern',
    type: 'Internship',
    department: 'Engineering',
    location: 'Beijing',
    salaryMin: 5,
    salaryMax: 8,
    summary: 'Participate in frontend component library and marketing portal development.',
    description: 'Participate in frontend component library and marketing portal development.\n\nYou will have the opportunity to work with Vue 3 + Nuxt + TypeScript and contribute to real product features.',
    requirements: '- Currently enrolled in Computer Science or related major\n- Familiar with HTML / CSS / JavaScript\n- Knowledge of Vue or React preferred',
    responsibilities: '- Develop frontend components and pages\n- Help fix bugs and optimize performance\n- Participate in code review and tech sharing',
    experience: 'Student',
    education: "Bachelor's degree or above",
    headcount: 5,
    createdAt: '2026-06-01T00:00:00.000Z',
  },
];

export function getJobs(locale?: string): Job[] {
  if (locale === 'en') return JOBS_EN;
  return JOBS_ZH;
}

export function getJobMap(locale?: string): Record<string, Job> {
  return Object.fromEntries(getJobs(locale).map((j) => [j.id, j]));
}

/** 兼容旧直接引用：默认中文 */
export const JOBS = JOBS_ZH;
export const JOB_MAP = Object.fromEntries(JOBS_ZH.map((j) => [j.id, j]));
