import { PrismaClient, PostStatus, CommentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding rich sample data...');

  // Get admin user
  const admin = await prisma.user.findFirst({
    where: { email: 'admin@talentpro.com' },
    include: { workspace: true },
  });
  if (!admin) {
    console.error('❌ Admin user not found. Run npm run db:seed first.');
    process.exit(1);
  }

  const workspaceId = admin.workspaceId || '';
  const authorId = admin.id;

  // ─── Blog Categories ───
  const blogCats = await Promise.all([
    prisma.blogCategory.upsert({
      where: { slug: 'hr-insights' },
      update: {},
      create: { name: 'HR 洞察', slug: 'hr-insights', description: '人力资源行业深度分析与趋势', sortOrder: 0 },
    }),
    prisma.blogCategory.upsert({
      where: { slug: 'product-updates' },
      update: {},
      create: { name: '产品更新', slug: 'product-updates', description: 'TalentPro 最新功能与版本发布', sortOrder: 1 },
    }),
    prisma.blogCategory.upsert({
      where: { slug: 'ai-research' },
      update: {},
      create: { name: 'AI 研究', slug: 'ai-research', description: '人工智能在 HR 领域的应用研究', sortOrder: 2 },
    }),
    prisma.blogCategory.upsert({
      where: { slug: 'customer-stories' },
      update: {},
      create: { name: '客户故事', slug: 'customer-stories', description: '企业数字化转型成功案例', sortOrder: 3 },
    }),
  ]);

  // ─── Blog Tags ───
  const blogTags = await Promise.all([
    prisma.tag.upsert({ where: { slug: 'ai' }, update: {}, create: { name: 'AI', slug: 'ai' } }),
    prisma.tag.upsert({ where: { slug: 'recruitment' }, update: {}, create: { name: '招聘', slug: 'recruitment' } }),
    prisma.tag.upsert({ where: { slug: 'talent-management' }, update: {}, create: { name: '人才管理', slug: 'talent-management' } }),
    prisma.tag.upsert({ where: { slug: 'digital-transformation' }, update: {}, create: { name: '数字化转型', slug: 'digital-transformation' } }),
    prisma.tag.upsert({ where: { slug: 'compensation' }, update: {}, create: { name: '薪酬福利', slug: 'compensation' } }),
    prisma.tag.upsert({ where: { slug: 'performance' }, update: {}, create: { name: '绩效管理', slug: 'performance' } }),
    prisma.tag.upsert({ where: { slug: 'compliance' }, update: {}, create: { name: '合规', slug: 'compliance' } }),
    prisma.tag.upsert({ where: { slug: 'remote-work' }, update: {}, create: { name: '远程办公', slug: 'remote-work' } }),
  ]);

  const tagMap = Object.fromEntries(blogTags.map((t) => [t.slug, t.id]));
  const catMap = Object.fromEntries(blogCats.map((c) => [c.slug, c.id]));

  // ─── Blog Posts ───
  const postsData = [
    {
      title: 'AI 如何重塑 2026 年的招聘格局',
      slug: 'ai-transforms-recruitment-2026',
      excerpt: '从简历筛选到智能面试，AI 正在重新定义企业招聘的每一个环节。探索大语言模型如何帮助 HR 团队提升 300% 的招聘效率。',
      content: '# AI 如何重塑招聘\n\n随着大语言模型的快速发展，HR 领域迎来了前所未有的变革...',
      coverImage: '/assets/blog-ai-recruit.jpg',
      categorySlug: 'ai-research',
      tagSlugs: ['ai', 'recruitment'],
    },
    {
      title: 'TalentPro 3.0 正式发布：全新 AI Family 赋能 HR 全场景',
      slug: 'talentpro-3-0-ai-family-release',
      excerpt: '历经 18 个月研发，TalentPro 3.0 携 AI 面试官、AI 薪酬顾问、AI 合规助手等 8 大智能体正式亮相。',
      content: '# TalentPro 3.0 发布\n\n我们很高兴宣布...',
      coverImage: '/assets/blog-release.jpg',
      categorySlug: 'product-updates',
      tagSlugs: ['ai', 'talent-management'],
    },
    {
      title: '某头部互联网公司千人校招实践：从 3 个月到 3 周',
      slug: 'top-internet-campus-recruitment-case',
      excerpt: '通过 TalentPro AI 面试官和智能排班系统，这家互联网巨头将校招周期压缩了 75%，候选人满意度提升至 92%。',
      content: '# 千人校招实践\n\n每年的校招季对 HR 团队来说都是一场硬仗...',
      coverImage: '/assets/blog-case-1.jpg',
      categorySlug: 'customer-stories',
      tagSlugs: ['recruitment', 'digital-transformation'],
    },
    {
      title: '2026 薪酬趋势报告：AI 工程师薪资涨幅领跑全行业',
      slug: '2026-salary-trend-report',
      excerpt: '基于 TalentPro 平台 50 万+ 薪酬数据分析，AI 相关岗位薪资同比增长 35%，远程办公岗位薪酬差距正在缩小。',
      content: '# 2026 薪酬趋势\n\n数据驱动的薪酬决策...',
      coverImage: '/assets/blog-salary.jpg',
      categorySlug: 'hr-insights',
      tagSlugs: ['compensation', 'remote-work'],
    },
    {
      title: '远程办公时代，如何构建高绩效分布式团队',
      slug: 'high-performance-remote-team',
      excerpt: '混合办公已成常态。本文分享 5 家世界 500 强企业通过数字化工具实现远程团队绩效提升的最佳实践。',
      content: '# 远程团队管理\n\n地理不再是边界...',
      coverImage: '/assets/blog-remote.jpg',
      categorySlug: 'hr-insights',
      tagSlugs: ['remote-work', 'performance'],
    },
    {
      title: 'GDPR 与《个人信息保护法》双合规指南',
      slug: 'gdpr-pip-compliance-guide',
      excerpt: '企业全球化进程中，数据合规成为 HR 系统的核心挑战。TalentPro 内置的 PII 加密与合规审计功能详解。',
      content: '# 数据合规指南\n\n在全球化的今天...',
      coverImage: '/assets/blog-compliance.jpg',
      categorySlug: 'hr-insights',
      tagSlugs: ['compliance', 'digital-transformation'],
    },
    {
      title: 'AI 面试官：让初筛效率提升 10 倍的秘密',
      slug: 'ai-interviewer-10x-efficiency',
      excerpt: 'TalentPro AI 面试官已服务超过 100 万次面试。本文揭秘其背后的多模态评估算法与公平性保障机制。',
      content: '# AI 面试官揭秘\n\n传统的简历筛选...',
      coverImage: '/assets/blog-ai-interview.jpg',
      categorySlug: 'ai-research',
      tagSlugs: ['ai', 'recruitment'],
    },
    {
      title: '制造业 HR 数字化转型：从手工台账到智能预测',
      slug: 'manufacturing-hr-digital-transformation',
      excerpt: '某大型制造企业通过 TalentPro 实现了考勤、排班、绩效的全流程数字化，人力成本降低 18%。',
      content: '# 制造业数字化\n\n传统制造业的 HR 管理...',
      coverImage: '/assets/blog-manufacturing.jpg',
      categorySlug: 'customer-stories',
      tagSlugs: ['digital-transformation', 'talent-management'],
    },
    {
      title: 'OKR 还是 KPI？绩效管理工具选型指南',
      slug: 'okr-vs-kpi-guide',
      excerpt: '没有最好的工具，只有最适合的工具。本文对比 OKR 与 KPI 的适用场景，并提供落地实施 checklist。',
      content: '# OKR vs KPI\n\n绩效管理是永恒的话题...',
      coverImage: '/assets/blog-performance.jpg',
      categorySlug: 'hr-insights',
      tagSlugs: ['performance'],
    },
    {
      title: 'TalentPro 接入 DeepSeek：国产大模型赋能 HR 场景',
      slug: 'talentpro-deepseek-integration',
      excerpt: '国内首款基于 DeepSeek 大模型的 HR SaaS 解决方案正式上线，支持智能 JD 生成、简历解析、面试评估等场景。',
      content: '# DeepSeek 集成\n\n大模型技术正在...',
      coverImage: '/assets/blog-deepseek.jpg',
      categorySlug: 'product-updates',
      tagSlugs: ['ai', 'digital-transformation'],
    },
    {
      title: 'Z 世代员工管理：从「管控」到「赋能」的思维转变',
      slug: 'gen-z-employee-management',
      excerpt: '95 后、00 后已成为职场主力。他们的职业诉求与管理方式与前辈截然不同，HR 如何因应？',
      content: '# Z 世代管理\n\n新一代职场人...',
      coverImage: '/assets/blog-gen-z.jpg',
      categorySlug: 'hr-insights',
      tagSlugs: ['talent-management', 'remote-work'],
    },
    {
      title: '从入职到离职：员工全生命周期数字化管理实践',
      slug: 'employee-lifecycle-digital-management',
      excerpt: '某金融集团通过 TalentPro 搭建了覆盖入职、转正、晋升、调岗、离职的完整数字化链路，效率提升 40%。',
      content: '# 全生命周期管理\n\n员工是企业最宝贵的资产...',
      coverImage: '/assets/blog-lifecycle.jpg',
      categorySlug: 'customer-stories',
      tagSlugs: ['talent-management', 'digital-transformation'],
    },
  ];

  for (const p of postsData) {
    await prisma.blogPost.upsert({
      where: { slug_workspaceId: { slug: p.slug, workspaceId } },
      update: {},
      create: {
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content,
        coverImage: p.coverImage,
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(Date.now() - Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000)), // random within 60 days
        authorId,
        categoryId: catMap[p.categorySlug],
        workspaceId,
        tags: { connect: p.tagSlugs.map((s) => ({ id: tagMap[s] })) },
      },
    });
  }

  // ─── Forum Categories ───
  const forumCats = await Promise.all([
    prisma.forumCategory.upsert({
      where: { id: 'seed-forum-1' },
      update: {},
      create: { name: '产品交流', description: 'TalentPro 产品使用经验分享', sortOrder: 0 },
    }),
    prisma.forumCategory.upsert({
      where: { id: 'seed-forum-2' },
      update: {},
      create: { name: 'HR 讨论', description: '人力资源行业话题讨论', sortOrder: 1 },
    }),
    prisma.forumCategory.upsert({
      where: { id: 'seed-forum-3' },
      update: {},
      create: { name: '技术问答', description: 'API、集成、二次开发技术问题', sortOrder: 2 },
    }),
    prisma.forumCategory.upsert({
      where: { id: 'seed-forum-4' },
      update: {},
      create: { name: '招聘互助', description: '招聘信息、内推、求职交流', sortOrder: 3 },
    }),
  ]);

  // ─── Forum Topics & Posts ───
  const topicsData = [
    {
      title: '如何配置智能排班规则？三班倒场景求助',
      content: '我们工厂有三班倒需求，想咨询如何配置复杂排班规则。目前遇到的问题是夜班津贴自动计算不准确...',
      categoryIdx: 0,
      viewCount: 342,
    },
    {
      title: 'AI 面试官的评估准确度如何？有真实数据吗',
      content: '最近打算引入 AI 面试官，但管理层担心评估偏差。有没有已经上线的公司分享一下实际效果？',
      categoryIdx: 0,
      viewCount: 528,
    },
    {
      title: '2026 年校招开启，大家今年的 HC 情况怎么样',
      content: '春招季到了，听说不少公司缩减了校招名额。想了解一下各行业今年的招聘形势...',
      categoryIdx: 1,
      viewCount: 891,
    },
    {
      title: '分享一份薪酬调研模板，涵盖互联网、金融、制造',
      content: '整理了 2025Q4 到 2026Q1 的薪酬数据，按岗位、级别、城市做了细分，供大家参考...',
      categoryIdx: 1,
      viewCount: 1205,
    },
    {
      title: 'Webhook 对接钉钉审批流，返回 401 怎么解决',
      content: '按照文档配置了 Webhook，但推送事件时一直返回 401。已确认 token 和签名都正确...',
      categoryIdx: 2,
      viewCount: 186,
    },
    {
      title: 'API 限流策略咨询：每秒 100 次请求够用吗',
      content: '我们目前有 3000 名员工，每天打卡、审批等操作频繁。想确认一下 API 限流的建议配置...',
      categoryIdx: 2,
      viewCount: 267,
    },
    {
      title: '【内推】某头部互联网公司招聘 HRIS 工程师',
      content: 'Base 北京/上海，P6-P8 都有 HC，要求有 HR SaaS 或企业内部系统开发经验...',
      categoryIdx: 3,
      viewCount: 445,
    },
    {
      title: '跳槽季想换工作，有没有好用的简历优化工具推荐',
      content: '工作三年，准备跳槽。发现自己的简历写得太业余了，求推荐好用的简历优化工具或模板...',
      categoryIdx: 3,
      viewCount: 678,
    },
    {
      title: 'TalentPro 3.0 的 AI 薪酬顾问实测：省了我们两周工作量',
      content: '上周试用了新版的 AI 薪酬顾问，直接导出了完整的薪酬诊断报告。以前这个工作要两个人做两周...',
      categoryIdx: 0,
      viewCount: 412,
    },
    {
      title: '绩效考核季，如何设计公平透明的 360 评估流程',
      content: '又到了年中绩效评估的时候了。去年因为评估标准不透明导致了不少投诉，今年想改进一下...',
      categoryIdx: 1,
      viewCount: 556,
    },
    {
      title: '使用 SSO 单点登录集成 Azure AD 的踩坑记录',
      content: '刚完成了 Azure AD 的 SSO 集成，记录下遇到的一些坑，希望能帮到后面的人...',
      categoryIdx: 2,
      viewCount: 198,
    },
    {
      title: '【招聘】某新能源车企急招薪酬绩效经理',
      content: '年薪 40-60W，14 薪，要求 5 年以上制造业薪酬绩效经验，熟悉宽带薪酬设计...',
      categoryIdx: 3,
      viewCount: 389,
    },
  ];

  for (let i = 0; i < topicsData.length; i++) {
    const t = topicsData[i];
    const topic = await prisma.forumTopic.upsert({
      where: { id: `rich-topic-${i}` },
      update: {},
      create: {
        id: `rich-topic-${i}`,
        categoryId: forumCats[t.categoryIdx].id,
        authorId,
        title: t.title,
        content: t.content,
        viewCount: t.viewCount,
        replyCount: Math.floor(Math.random() * 15),
      },
    });

    // Add 2-5 replies per topic
    const replyCount = 2 + Math.floor(Math.random() * 4);
    for (let r = 0; r < replyCount; r++) {
      await prisma.forumPost.create({
        data: {
          topicId: topic.id,
          authorId,
          content: `这是第 ${r + 1} 条回复。非常赞同楼主的观点，我们也遇到了类似的情况...`,
          workspaceId,
        },
      }).catch(() => {}); // ignore duplicates
    }
  }

  // ─── Resource Categories ───
  const resCats = await Promise.all([
    prisma.resourceCategory.upsert({
      where: { slug: 'report' },
      update: {},
      create: { name: '白皮书', slug: 'report', sortOrder: 0 },
    }),
    prisma.resourceCategory.upsert({
      where: { slug: 'case-study' },
      update: {},
      create: { name: '客户案例', slug: 'case-study', sortOrder: 1 },
    }),
    prisma.resourceCategory.upsert({
      where: { slug: 'video' },
      update: {},
      create: { name: '视频教程', slug: 'video', sortOrder: 2 },
    }),
    prisma.resourceCategory.upsert({
      where: { slug: 'toolkit' },
      update: {},
      create: { name: '工具模板', slug: 'toolkit', sortOrder: 3 },
    }),
  ]);

  const resCatMap = Object.fromEntries(resCats.map((c) => [c.slug, c.id]));

  // ─── Resources ───
  const resourcesData = [
    {
      title: '《2026 HR 数智化成熟度模型白皮书》',
      slug: 'hr-digital-2026',
      description: '整合 567 家企业调研洞察，构建 HR 数智化成熟度五级模型，附自评工具。',
      type: 'WHITEPAPER',
      categorySlug: 'report',
    },
    {
      title: '《AI 在人力资源领域的应用全景报告》',
      slug: 'ai-hr-landscape-2026',
      description: '覆盖招聘、培训、绩效、薪酬等 12 个场景，深度解析 AI 技术应用现状与趋势。',
      type: 'WHITEPAPER',
      categorySlug: 'report',
    },
    {
      title: '某头部互联网公司：AI 面试官校招实践',
      slug: 'case-ai-interview-campus',
      description: '从 3000 份简历到 200 场 AI 面试，校招效率提升 300% 的完整复盘。',
      type: 'CASE_STUDY',
      categorySlug: 'case-study',
    },
    {
      title: '制造业数字化转型：从手工台账到智能预测',
      slug: 'case-manufacturing-digital',
      description: '某大型制造企业 18 个月数字化 journey，人力成本降低 18% 的关键路径。',
      type: 'CASE_STUDY',
      categorySlug: 'case-study',
    },
    {
      title: 'TalentPro 3.0 新功能速览（15 分钟）',
      slug: 'video-talentpro-3-overview',
      description: '产品总监亲自演示 AI Family 八大智能体，带你快速上手 3.0 版本。',
      type: 'VIDEO',
      categorySlug: 'video',
    },
    {
      title: '薪酬诊断工具：一键生成薪酬竞争力报告',
      slug: 'video-compensation-diagnosis',
      description: '演示如何使用 AI 薪酬顾问完成市场对标、内部公平性分析与调薪建议。',
      type: 'VIDEO',
      categorySlug: 'video',
    },
    {
      title: '2026 薪酬调研 Excel 模板（含公式）',
      slug: 'toolkit-salary-template',
      description: '覆盖 50+ 城市、200+ 岗位的薪酬调研模板，内置市场分位值计算公式。',
      type: 'ARTICLE',
      categorySlug: 'toolkit',
    },
    {
      title: 'OKR 落地实施 Checklist + 模板',
      slug: 'toolkit-okr-checklist',
      description: '从目标制定到复盘的全流程 checklist，附部门级与个人级 OKR 模板。',
      type: 'ARTICLE',
      categorySlug: 'toolkit',
    },
    {
      title: '《个人信息保护法》合规自查清单',
      slug: 'compliance-checklist-pip',
      description: 'HR 系统数据合规 68 项检查点，帮助企业快速完成合规自查与整改。',
      type: 'WHITEPAPER',
      categorySlug: 'report',
    },
    {
      title: '某金融集团：员工全生命周期数字化实践',
      slug: 'case-finance-lifecycle',
      description: '覆盖入职、转正、晋升、调岗、离职的完整数字化链路，效率提升 40%。',
      type: 'CASE_STUDY',
      categorySlug: 'case-study',
    },
  ];

  for (const r of resourcesData) {
    await prisma.resource.upsert({
      where: { slug: r.slug },
      update: {},
      create: {
        categoryId: resCatMap[r.categorySlug],
        slug: r.slug,
        title: r.title,
        description: r.description,
        type: r.type as any,
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)),
        viewCount: Math.floor(Math.random() * 2000),
        downloadCount: Math.floor(Math.random() * 500),
      },
    });
  }

  // ─── Case Studies ───
  const caseStudiesData = [
    {
      slug: 'case-mengniu-ai-recruit',
      title: '蒙牛乳业：AI 面试官助力校招效率提升 300%',
      subtitle: '从 3000 份简历到 200 场 AI 面试，校招周期从 3 个月缩短到 3 周',
      industry: '快消品',
      companyName: '蒙牛乳业',
      excerpt: '通过 TalentPro AI 面试官和智能排班系统，蒙牛将校招周期压缩了 75%，候选人满意度提升至 92%。',
      challenge: '蒙牛每年校招需要处理超过 3000 份简历，传统初筛方式耗时耗力，HR 团队在校招季经常加班到深夜。同时，各地分公司的招聘标准不统一，导致人才质量参差不齐。',
      solution: '引入 TalentPro AI 面试官进行自动化初筛，系统自动评估候选人的专业能力、沟通表达和文化匹配度。同时通过数字化招聘平台统一全国分公司的招聘流程和标准。',
      results: '校招效率提升 300%，初筛时间从人均 30 分钟缩短到 5 分钟。候选人满意度从 72% 提升至 92%。HR 团队校招季加班时间减少 60%。',
      featured: true,
      metrics: [
        { label: '效率提升', value: '300%', beforeValue: '100%' },
        { label: '初筛时间', value: '5分钟', beforeValue: '30分钟' },
        { label: '满意度', value: '92%', beforeValue: '72%' },
      ],
    },
    {
      slug: 'case-byd-manufacturing',
      title: '比亚迪：制造业复杂考勤数字化变革',
      subtitle: '5000+ 考勤规则自动处理，薪资核算时间从 5 天缩短到半天',
      industry: '制造业',
      companyName: '比亚迪',
      excerpt: '通过 TalentPro 假勤管理系统，比亚迪实现了 5000+ 考勤规则的自动化处理，薪资核算效率提升 10 倍。',
      challenge: '比亚迪拥有超过 30 万名员工，分布在全国多个生产基地，考勤制度极其复杂。传统的手工考勤统计方式导致每月薪资核算需要 5 天时间，错误率高达 3%。',
      solution: '部署 TalentPro 假勤管理系统，将 5000+ 考勤规则数字化，实现自动排班、智能打卡匹配和异常自动预警。与薪酬系统打通，实现考勤数据自动同步。',
      results: '薪资核算时间从 5 天缩短到半天，错误率从 3% 降至 0.1%。员工考勤投诉减少 80%。HR 团队每月节省约 2000 工时。',
      featured: true,
      metrics: [
        { label: '核算时间', value: '0.5天', beforeValue: '5天' },
        { label: '错误率', value: '0.1%', beforeValue: '3%' },
        { label: '投诉减少', value: '80%', beforeValue: '-' },
      ],
    },
    {
      slug: 'case-jd-retail',
      title: '京东：零售旺季批量招聘的数字化实践',
      subtitle: 'AI 初筛 + 批量 Offer，招聘效率提升 5 倍',
      industry: '零售电商',
      companyName: '京东',
      excerpt: '通过 TalentPro 招聘管理系统和 AI 初筛功能，京东在 618 大促期间快速完成 5000+ 临时员工的招聘。',
      challenge: '每逢 618、双 11 等大促节点，京东需要在短时间内招聘 5000+ 临时员工。传统的招聘流程无法满足如此大规模的批量招聘需求，导致业务等人才的情况频发。',
      solution: '启用 TalentPro 批量招聘功能和 AI 初筛，系统自动完成简历解析、初评和排序。同时通过移动端快速完成入职手续，实现从投递到上岗的全程数字化。',
      results: '招聘效率提升 5 倍，单个候选人从投递到上岗的平均时间从 7 天缩短到 1.5 天。大促期间零用工缺口，业务满意度达到 95%。',
      featured: false,
      metrics: [
        { label: '效率提升', value: '5x', beforeValue: '1x' },
        { label: '到岗时间', value: '1.5天', beforeValue: '7天' },
        { label: '业务满意度', value: '95%', beforeValue: '70%' },
      ],
    },
    {
      slug: 'case-pingan-finance',
      title: '平安集团：九宫格人才盘点的数字化升级',
      subtitle: '从传统纸质评估到 AI 驱动的数字化盘点，人才识别准确率提升 40%',
      industry: '金融',
      companyName: '平安集团',
      excerpt: '通过 TalentPro 盘点发展系统，平安集团实现了人才盘点的全流程数字化，科学识别高潜人才。',
      challenge: '平安集团拥有超过 20 万员工，传统的九宫格人才盘点依赖纸质评估和人工汇总，耗时长、主观性强。每年盘点季，HR 团队需要花费 2 个月时间完成全集团的人才评估。',
      solution: '引入 TalentPro 盘点发展系统，将九宫格评估数字化。系统通过多维度数据采集和 AI 算法，自动生成分层分级的人才画像和继任建议。',
      results: '人才盘点时间从 2 个月缩短到 2 周。高潜人才识别准确率提升 40%。干部继任计划覆盖率从 60% 提升至 95%。',
      featured: false,
      metrics: [
        { label: '盘点时间', value: '2周', beforeValue: '2月' },
        { label: '识别准确率', value: '+40%', beforeValue: '基准' },
        { label: '继任覆盖率', value: '95%', beforeValue: '60%' },
      ],
    },
  ];

  for (const cs of caseStudiesData) {
    const caseStudy = await prisma.caseStudy.upsert({
      where: { slug: cs.slug },
      update: {},
      create: {
        slug: cs.slug,
        title: cs.title,
        subtitle: cs.subtitle,
        industry: cs.industry,
        companyName: cs.companyName,
        excerpt: cs.excerpt,
        challenge: cs.challenge,
        solution: cs.solution,
        results: cs.results,
        featured: cs.featured,
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(Date.now() - Math.floor(Math.random() * 120 * 24 * 60 * 60 * 1000)),
        workspaceId,
      },
    });

    for (const m of cs.metrics) {
      await prisma.caseStudyMetric.upsert({
        where: { id: `${cs.slug}-${m.label}` },
        update: {},
        create: {
          id: `${cs.slug}-${m.label}`,
          caseStudyId: caseStudy.id,
          label: m.label,
          value: m.value,
          beforeValue: m.beforeValue,
        },
      });
    }
  }

  // ─── News ───
  const newsData = [
    {
      slug: 'talentpro-3-0-release',
      title: 'TalentPro 3.0 正式发布：AI Family 赋能 HR 全场景',
      summary: '历经 18 个月研发，TalentPro 3.0 携 AI 面试官、AI 薪酬顾问、AI 合规助手等 8 大智能体正式亮相，覆盖招聘、绩效、薪酬、学习等 50+ HR 场景。',
      content: '# TalentPro 3.0 正式发布\n\n2026 年 5 月，TalentPro 正式发布了 3.0 版本...',
      category: 'product',
      author: '张明远',
      featured: true,
    },
    {
      slug: 'idc-market-share-2026',
      title: 'IDC 报告：TalentPro 连续五年 HR SaaS 市场占有率第一',
      summary: '根据 IDC 最新发布的《中国人力资源 SaaS 市场跟踪报告》，TalentPro 以 23.6% 的市场份额连续五年蝉联第一。',
      content: '# IDC 连续五年第一\n\nIDC 最新报告显示...',
      category: 'company',
      author: '李思涵',
      featured: true,
    },
    {
      slug: 'ai-hr-summit-2026',
      title: '2026 AI+HR 全球峰会在京举办，TalentPro 斩获三项大奖',
      summary: '在近日举办的 2026 AI+HR 全球峰会上，TalentPro 凭借 AI Family 系列产品斩获「最佳 AI 应用奖」「最佳用户体验奖」和「最佳创新奖」三项大奖。',
      content: '# AI+HR 全球峰会\n\n2026 年 4 月...',
      category: 'event',
      author: '王建国',
      featured: false,
    },
    {
      slug: 'deepseek-integration',
      title: 'TalentPro 接入 DeepSeek：国产大模型赋能 HR 场景',
      summary: '国内首款基于 DeepSeek 大模型的 HR SaaS 解决方案正式上线，支持智能 JD 生成、简历解析、面试评估等场景。',
      content: '# DeepSeek 集成\n\n大模型技术正在深刻改变 HR 行业...',
      category: 'product',
      author: '陈晓东',
      featured: false,
    },
  ];

  for (const n of newsData) {
    await prisma.news.upsert({
      where: { slug: n.slug },
      update: {},
      create: {
        slug: n.slug,
        title: n.title,
        summary: n.summary,
        content: n.content,
        category: n.category,
        author: n.author,
        featured: n.featured,
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)),
        workspaceId,
      },
    });
  }

  // ─── Jobs ───
  const jobsData = [
    {
      title: '高级前端工程师',
      department: '研发部',
      location: '北京',
      type: 'social',
      experience: '3-5年',
      salaryMin: 25,
      salaryMax: 45,
      description: '负责 TalentPro 核心产品的前端架构设计与开发，推动前端工程化建设。',
      responsibilities: '1. 负责核心产品模块的前端开发\n2. 参与前端技术选型与架构设计\n3. 推动前端工程化、组件化建设\n4. 指导初中级工程师成长',
      requirements: '1. 3 年以上前端开发经验\n2. 精通 Vue3 / React 等主流框架\n3. 熟悉前端工程化工具链\n4. 具备良好的代码规范和工程思维',
      benefits: '五险一金、补充医疗保险、年度体检、弹性工作、股票期权',
      tags: ['Vue', 'React', 'TypeScript'],
    },
    {
      title: 'AI 算法工程师',
      department: 'AI 实验室',
      location: '北京/上海',
      type: 'social',
      experience: '3-5年',
      salaryMin: 35,
      salaryMax: 60,
      description: '负责 TalentPro AI Family 系列产品的算法研发，包括 NLP、推荐系统、多模态评估等方向。',
      responsibilities: '1. 负责 AI 产品的算法研发与优化\n2. 参与大语言模型在 HR 场景的落地\n3. 构建和优化模型训练 pipeline\n4. 发表高水平学术论文',
      requirements: '1. 计算机/数学/统计等相关专业硕士及以上\n2. 扎实的机器学习理论基础\n3. 熟悉 PyTorch / TensorFlow\n4. 有 NLP 或推荐系统经验优先',
      benefits: '五险一金、补充医疗保险、年度体检、弹性工作、科研经费',
      tags: ['NLP', 'LLM', 'PyTorch'],
    },
    {
      title: '产品经理（招聘方向）',
      department: '产品部',
      location: '北京',
      type: 'social',
      experience: '3-5年',
      salaryMin: 25,
      salaryMax: 40,
      description: '负责 TalentPro 招聘管理系统的产品规划与迭代，深入理解 HR 业务场景。',
      responsibilities: '1. 负责招聘系统的产品规划\n2. 深入客户现场调研需求\n3. 输出 PRD 并推动项目落地\n4. 监控产品数据并持续优化',
      requirements: '1. 3 年以上 B 端产品经验\n2. 有 HR SaaS 或招聘系统经验优先\n3. 具备优秀的逻辑思维和沟通能力\n4. 对 AI 技术在 HR 领域的应用有热情',
      benefits: '五险一金、补充医疗保险、年度体检、弹性工作',
      tags: ['B端产品', 'HR SaaS'],
    },
    {
      title: '客户成功经理',
      department: '客户成功部',
      location: '上海/深圳',
      type: 'social',
      experience: '2-4年',
      salaryMin: 18,
      salaryMax: 30,
      description: '负责中大型客户的全生命周期管理，帮助客户成功落地 TalentPro 解决方案。',
      responsibilities: '1. 负责客户的 onboarding 和培训\n2. 定期回访并收集客户需求\n3. 推动客户续约和增购\n4. 协调内部资源解决客户问题',
      requirements: '1. 2 年以上 SaaS 客户成功经验\n2. 优秀的沟通能力和服务意识\n3. 有 HR 行业背景优先\n4. 能适应出差',
      benefits: '五险一金、补充医疗保险、年度体检、弹性工作',
      tags: ['客户成功', 'SaaS'],
    },
    {
      title: '2026 届管培生',
      department: '轮岗',
      location: '北京',
      type: 'campus',
      experience: '应届生',
      salaryMin: 15,
      salaryMax: 20,
      description: '为期 18 个月的轮岗培养计划，深入了解 HR SaaS 全业务链路。',
      responsibilities: '1. 在研发、产品、销售等部门轮岗\n2. 参与实际项目并产出成果\n3. 完成管培生培养计划中的各项任务',
      requirements: '1. 2026 届本科及以上学历\n2. 计算机、人力资源、工商管理等相关专业\n3. 具备优秀的学习能力和抗压能力\n4. 对 HR 科技领域有浓厚兴趣',
      benefits: '五险一金、补充医疗保险、年度体检、导师制、培训基金',
      tags: ['管培生', '应届生'],
    },
    {
      title: '前端开发实习生',
      department: '研发部',
      location: '北京',
      type: 'intern',
      experience: '在校生',
      salaryMin: 5,
      salaryMax: 8,
      description: '参与 TalentPro 前端组件库和营销门户的开发工作。',
      responsibilities: '1. 参与前端组件开发\n2. 编写单元测试和技术文档\n3. 协助完成日常需求开发',
      requirements: '1. 计算机相关专业在校生\n2. 熟悉 HTML/CSS/JavaScript\n3. 了解 Vue 或 React 框架\n4. 每周至少出勤 4 天',
      benefits: '实习补贴、转正机会、技术导师一对一指导',
      tags: ['实习', '前端'],
    },
  ];

  for (const j of jobsData) {
    await prisma.job.upsert({
      where: { id: `job-${j.title}` },
      update: {},
      create: {
        title: j.title,
        department: j.department,
        location: j.location,
        type: j.type,
        experience: j.experience,
        salaryMin: j.salaryMin,
        salaryMax: j.salaryMax,
        description: j.description,
        responsibilities: j.responsibilities,
        requirements: j.requirements,
        benefits: j.benefits,
        tags: j.tags,
        status: 'open',
        workspaceId,
      },
    });
  }

  // ─── Team Members ───
  const teamData = [
    {
      name: '张伟',
      role: '创始人兼 CEO',
      title: '首席执行官',
      bio: '前华为 HR 产品线总经理，深耕人力资源科技领域 20 年。曾主导多个世界 500 强企业 HR 数字化转型项目。',
      department: 'leadership',
      featured: true,
    },
    {
      name: '李芳',
      role: '联合创始人兼 CTO',
      title: '首席技术官',
      bio: '前阿里云资深技术专家，专注于企业级 SaaS 架构设计。主导 TalentPro 技术架构从 1.0 到 3.0 的演进。',
      department: 'leadership',
      featured: true,
    },
    {
      name: '王强',
      role: 'AI 实验室负责人',
      title: '首席科学家',
      bio: '清华大学计算机博士，前百度 NLP 核心研发。发表顶会论文 30+ 篇，专注于大语言模型在 HR 领域的应用研究。',
      department: 'engineering',
      featured: true,
    },
    {
      name: '陈静',
      role: '产品副总裁',
      title: '产品负责人',
      bio: '前 SAP SuccessFactors 产品总监，10 年 B 端产品经验。带领产品团队完成 TalentPro 全产品矩阵的设计与迭代。',
      department: 'product',
      featured: true,
    },
    {
      name: '刘洋',
      role: '客户成功负责人',
      title: '客户成功副总裁',
      bio: '前 Salesforce 大中华区客户成功总监。建立 TalentPro 5S 实施服务体系，客户续约率业界领先。',
      department: 'sales',
      featured: false,
    },
  ];

  for (const tm of teamData) {
    await prisma.teamMember.upsert({
      where: { id: `team-${tm.name}` },
      update: {},
      create: {
        name: tm.name,
        role: tm.role,
        title: tm.title,
        bio: tm.bio,
        department: tm.department,
        featured: tm.featured,
      },
    });
  }

  // ─── Partners ───
  const partnersData = [
    {
      name: '华为云',
      website: 'https://www.huaweicloud.com',
      description: 'TalentPro 基于华为云构建高可用基础设施，为客户提供稳定可靠的 SaaS 服务。',
      type: 'technology',
      level: 'strategic',
      featured: true,
    },
    {
      name: '德勤咨询',
      website: 'https://www2.deloitte.com',
      description: '联合为企业提供 HR 数字化转型咨询服务，将 TalentPro 产品能力与德勤管理咨询经验深度融合。',
      type: 'consulting',
      level: 'premier',
      featured: true,
    },
    {
      name: '钉钉',
      website: 'https://www.dingtalk.com',
      description: 'TalentPro 与钉钉深度集成，实现组织架构同步、审批流程打通、消息通知互通。',
      type: 'technology',
      level: 'strategic',
      featured: true,
    },
    {
      name: '北森',
      website: 'https://www.beisen.com',
      description: '在人才测评领域深度合作，TalentPro 集成北森测评工具，为客户提供更完整的人才评估方案。',
      type: 'technology',
      level: 'partner',
      featured: false,
    },
    {
      name: '用友',
      website: 'https://www.yonyou.com',
      description: 'TalentPro 与用友 NC Cloud 实现财务人事数据互通，为企业提供一体化管理解决方案。',
      type: 'technology',
      level: 'partner',
      featured: false,
    },
  ];

  for (const p of partnersData) {
    await prisma.partner.upsert({
      where: { id: `partner-${p.name}` },
      update: {},
      create: {
        name: p.name,
        website: p.website,
        description: p.description,
        type: p.type,
        level: p.level,
        featured: p.featured,
      },
    });
  }

  console.log('✅ Rich sample data seeded!');
  console.log(`   - Blog posts: ${postsData.length}`);
  console.log(`   - Forum topics: ${topicsData.length}`);
  console.log(`   - Resources: ${resourcesData.length}`);
  console.log(`   - Case studies: ${caseStudiesData.length}`);
  console.log(`   - News: ${newsData.length}`);
  console.log(`   - Jobs: ${jobsData.length}`);
  console.log(`   - Team members: ${teamData.length}`);
  console.log(`   - Partners: ${partnersData.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
