import { PrismaClient, LeadStatus, UserStatus, PostStatus, CommentStatus, AppStatus, PricingModel } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Roles & Permissions ───
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: { name: 'SUPER_ADMIN', description: '超级管理员' },
  });
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN', description: '管理员' },
  });
  const editorRole = await prisma.role.upsert({
    where: { name: 'EDITOR' },
    update: {},
    create: { name: 'EDITOR', description: '编辑' },
  });
  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: { name: 'USER', description: '普通用户' },
  });

  // Permissions
  const resources = [
    'user', 'role', 'page', 'product', 'industry', 'testimonial',
    'resource', 'blog_post', 'forum_topic', 'demo_booking', 'setting',
    'media', 'audit_log', 'email_template',
    'workspace', 'lead', 'cart', 'payment', 'marketplace_app',
    'marketplace_category', 'marketplace_vendor', 'marketplace_review',
    'subscription', 'notification', 'download', 'case_study', 'news', 'job',
    'forum_category', 'forum_post', 'comment', 'blog_category', 'blog_tag',
    'ai', 'analytics', 'export', 'experiment', 'cms', 'sensitive_word', 'auth',
  ];
  const actions = ['create', 'read', 'update', 'delete'];
  for (const resource of resources) {
    for (const action of actions) {
      await prisma.permission.upsert({
        where: { resource_action: { resource, action } },
        update: {},
        create: { resource, action },
      });
    }
  }

  // Non-CRUD permissions used by specific controllers
  const extraPermissions = [
    { resource: 'cart', action: 'manage' },
    { resource: 'payment', action: 'manage' },
    { resource: 'export', action: 'run' },
    { resource: 'analytics', action: 'write' },
    { resource: 'ai', action: 'generate' },
    { resource: 'ai', action: 'generate-image' },
    { resource: 'ai', action: 'chat' },
    { resource: 'auth', action: 'logout' },
    { resource: 'workspace', action: 'invite' },
  ];
  for (const { resource, action } of extraPermissions) {
    await prisma.permission.upsert({
      where: { resource_action: { resource, action } },
      update: {},
      create: { resource, action },
    });
  }

  // Assign all permissions to SUPER_ADMIN
  const allPerms = await prisma.permission.findMany();
  await prisma.role.update({
    where: { id: superAdminRole.id },
    data: { permissions: { connect: allPerms.map((p) => ({ id: p.id })) } },
  });

  // Assign admin-level permissions to ADMIN (all except audit_log/sensitive_word delete)
  const adminPerms = allPerms.filter(
    (p) => !(p.resource === 'audit_log' && p.action === 'delete') && !(p.resource === 'sensitive_word' && p.action === 'delete'),
  );
  await prisma.role.update({
    where: { id: adminRole.id },
    data: { permissions: { connect: adminPerms.map((p) => ({ id: p.id })) } },
  });

  // Assign content permissions to EDITOR
  const editorResources = [
    'page', 'product', 'industry', 'testimonial', 'resource', 'blog_post',
    'case_study', 'news', 'job', 'forum_topic', 'forum_post', 'comment',
    'blog_category', 'blog_tag', 'forum_category', 'cms', 'media', 'email_template',
  ];
  const editorPerms = allPerms.filter(
    (p) => editorResources.includes(p.resource) && ['create', 'read', 'update'].includes(p.action),
  );
  await prisma.role.update({
    where: { id: editorRole.id },
    data: { permissions: { connect: editorPerms.map((p) => ({ id: p.id })) } },
  });

  // ─── Default Admin User ───
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error('❌ SEED_ADMIN_PASSWORD 环境变量未设置，种子执行中断');
    console.error('   请设置: export SEED_ADMIN_PASSWORD=YourSecurePassword123!');
    process.exit(1);
  }
  if (adminPassword.length < 8) {
    console.error('❌ SEED_ADMIN_PASSWORD 必须至少8位');
    process.exit(1);
  }
  const hashedPassword = await bcrypt.hash(adminPassword, 12);
  let adminUser = await prisma.user.findFirst({ where: { email: 'admin@talentpro.com' } });
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@talentpro.com',
        password: hashedPassword,
        name: '系统管理员',
        status: UserStatus.ACTIVE,
        roleId: superAdminRole.id,
      },
    });
  }

  // ─── Product Tabs & Products ───
  const hrSaasTab = await prisma.productTab.upsert({
    where: { slug: 'hr-saas' },
    update: {},
    create: { label: '一体化 HR SaaS', slug: 'hr-saas', icon: 'building', sortOrder: 0 },
  });
  const aiFamilyTab = await prisma.productTab.upsert({
    where: { slug: 'ai-family' },
    update: {},
    create: { label: 'AI Family', slug: 'ai-family', icon: 'bot', sortOrder: 1 },
  });

  await prisma.product.upsert({
    where: { slug: 'recruit' },
    update: {},
    create: {
      tabId: hrSaasTab.id, slug: 'recruit', name: '招聘管理系统',
      tagline: '全流程数字化招聘', description: '覆盖校招社招全场景',
      icon: 'users', sortOrder: 0,
    },
  });
  await prisma.product.upsert({
    where: { slug: 'ai-recruit' },
    update: {},
    create: {
      tabId: aiFamilyTab.id, slug: 'ai-recruit', name: 'AI 招聘助手',
      tagline: '智能简历筛选、JD生成', description: '让招聘更快更准',
      icon: 'bot', sortOrder: 0,
    },
  });

  // ─── Industries ───
  await prisma.industry.upsert({
    where: { slug: 'manufacturing' },
    update: {},
    create: {
      slug: 'manufacturing', label: '制造业', icon: 'factory',
      features: [
        { badge: '特色一', title: '智能排班与考勤', desc: '5000+ 考勤规则自动处理' },
        { badge: '特色二', title: '试工管理场景', desc: '扫码入系统，全流程线上化' },
        { badge: '特色三', title: '人员资质合规追踪', desc: '持续追踪岗位资质备案' },
      ],
      isPublished: true, sortOrder: 0,
    },
  });

  // ─── Testimonials ───
  await prisma.testimonial.upsert({
    where: { id: 'seed-1' },
    update: {},
    create: {
      industry: '互联网', product: 'AI 面试官',
      text: 'TalentPro 的 AI 面试官彻底改变了我们的校招流程。',
      name: '王志远', title: '某头部互联网公司 · 招聘负责人',
      sortOrder: 0, isActive: true,
    },
  });

  // ─── Resource Categories ───
  const reportCat = await prisma.resourceCategory.upsert({
    where: { slug: 'report' },
    update: {},
    create: { name: '白皮书', slug: 'report', sortOrder: 0 },
  });

  // ─── Resources ───
  await prisma.resource.upsert({
    where: { slug: 'hr-digital-2026' },
    update: {},
    create: {
      categoryId: reportCat.id, slug: 'hr-digital-2026',
      title: '《2026 HR 数智化成熟度模型白皮书》',
      description: '整合 567 家企业调研洞察',
      type: 'WHITEPAPER', status: PostStatus.PUBLISHED,
      publishedAt: new Date(),
    },
  });

  // ─── Navigation ───
  const headerNav = await prisma.navigation.upsert({
    where: { key: 'header' },
    update: {},
    create: { key: 'header', label: '顶部导航', location: 'header' },
  });
  await prisma.navItem.createMany({
    data: [
      { navigationId: headerNav.id, label: 'AI Family', href: '#ai-family', sortOrder: 0 },
      { navigationId: headerNav.id, label: '产品', href: '#products', sortOrder: 1 },
      { navigationId: headerNav.id, label: '解决方案', href: '#solutions', sortOrder: 2 },
      { navigationId: headerNav.id, label: '客户案例', href: '#cases', sortOrder: 3 },
      { navigationId: headerNav.id, label: '资源中心', href: '#resources', sortOrder: 4 },
    ],
    skipDuplicates: true,
  });

  // ─── Translations ───
  const translations = [
    { locale: 'zh-CN', key: 'nav.demo', value: '预约演示', context: 'nav' },
    { locale: 'zh-CN', key: 'hero.title', value: '用 TalentPro 重新定义人才管理', context: 'hero' },
    { locale: 'en', key: 'nav.demo', value: 'Book a Demo', context: 'nav' },
    { locale: 'en', key: 'hero.title', value: 'Redefine Talent Management with TalentPro', context: 'hero' },
  ];
  for (const t of translations) {
    await prisma.translation.upsert({
      where: { locale_key: { locale: t.locale, key: t.key } },
      update: { value: t.value },
      create: t,
    });
  }

  // ─── Blog Categories ───
  const blogCat = await prisma.blogCategory.upsert({
    where: { slug: 'hr-insights' },
    update: {},
    create: { name: 'HR 洞察', slug: 'hr-insights', description: '人力资源行业深度分析与趋势', sortOrder: 0 },
  });

  // ─── Blog Tags ───
  const aiTag = await prisma.tag.upsert({
    where: { slug: 'ai' },
    update: {},
    create: { name: 'AI', slug: 'ai' },
  });
  const recruitTag = await prisma.tag.upsert({
    where: { slug: 'recruitment' },
    update: {},
    create: { name: '招聘', slug: 'recruitment' },
  });

  // ─── Blog Posts ───
  await prisma.blogPost.upsert({
    where: { id: '' }, // upsert with compound unique requires id fallback; seed uses create path
    update: {},
    create: {
      title: 'AI 如何重塑 2026 年的招聘格局',
      slug: 'ai-transforms-recruitment-2026',
      excerpt: '从简历筛选到智能面试，AI 正在重新定义企业招聘的每一个环节。',
      content: '# AI 如何重塑招聘\n\n随着大语言模型的快速发展，HR 领域迎来了前所未有的变革...',
      coverImage: '/assets/blog-ai-recruit.jpg',
      status: PostStatus.PUBLISHED,
      publishedAt: new Date(),
      authorId: adminUser.id,
      categoryId: blogCat.id,
      tags: { connect: [{ id: aiTag.id }, { id: recruitTag.id }] },
    },
  });

  // ─── Forum Categories ───
  const forumCat = await prisma.forumCategory.upsert({
    where: { id: 'seed-forum-1' },
    update: {},
    create: { name: '产品交流', description: 'TalentPro 产品使用经验分享', sortOrder: 0 },
  });

  // ─── Forum Topics ───
  await prisma.forumTopic.upsert({
    where: { id: 'seed-topic-1' },
    update: {},
    create: {
      categoryId: forumCat.id,
      authorId: adminUser.id,
      title: '如何配置智能排班规则？',
      content: '我们工厂有三班倒需求，想咨询如何配置复杂排班规则...',
      viewCount: 128,
      replyCount: 0,
    },
  });

  // ─── System Settings ───
  const settings = [
    { key: 'site.name', value: 'TalentPro', category: 'site' },
    { key: 'site.logo', value: '/assets/logo.svg', category: 'site' },
    { key: 'site.icp', value: process.env.SEED_SITE_ICP || '京ICP备【请配置】号', category: 'site' },
    { key: 'contact.phone', value: '400-888-8888', category: 'contact' },
    { key: 'contact.email', value: 'contact@talentpro.com', category: 'contact' },
  ];
  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  // ─── Email Templates ───
  await prisma.emailTemplate.upsert({
    where: { key: 'demo-booking-success' },
    update: {},
    create: {
      key: 'demo-booking-success',
      subject: '【TalentPro】预约演示成功',
      body: '您好 {name}，\n\n您已成功预约 TalentPro 产品演示，我们的顾问将在 1 个工作日内与您联系。',
      html: '<p>您好 <strong>{name}</strong>，</p><p>您已成功预约 TalentPro 产品演示。</p>',
    },
  });

  // ─── Demo Bookings ───
  await prisma.demoBooking.create({
    data: {
      name: '张三', company: '示例科技有限公司',
      phone: '13800138000', email: 'zhangsan@example.com',
      products: ['招聘管理', 'AI Family'], scale: 'SCALE_200_PLUS',
      status: LeadStatus.NEW, source: 'WEBSITE',
    },
  });

  // ─── Marketplace Categories ───
  const categories = [
    { slug: 'recruitment', name: '招聘与人才获取', icon: 'users', sortOrder: 0 },
    { slug: 'compensation', name: '薪酬与福利', icon: 'dollar-sign', sortOrder: 1 },
    { slug: 'performance', name: '绩效与目标', icon: 'target', sortOrder: 2 },
    { slug: 'learning', name: '学习与发展', icon: 'book-open', sortOrder: 3 },
    { slug: 'experience', name: '员工体验', icon: 'heart', sortOrder: 4 },
    { slug: 'compliance', name: '合规与安全', icon: 'shield', sortOrder: 5 },
    { slug: 'ai', name: 'AI 与自动化', icon: 'bot', sortOrder: 6 },
    { slug: 'analytics', name: '数据与分析', icon: 'bar-chart-2', sortOrder: 7 },
  ];
  for (const c of categories) {
    await prisma.appCategory.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  // ─── Marketplace Vendors ───
  const vendors = [
    { slug: 'talentai-lab', name: 'TalentAI Lab', description: '专注 AI 人才技术', contactEmail: 'contact@talentai.lab', verified: true },
    { slug: 'paytech', name: 'PayTech 科技', description: '薪酬科技服务商', contactEmail: 'contact@paytech.cn', verified: true },
    { slug: 'goalforge', name: 'GoalForge', description: '目标管理工具专家', contactEmail: 'contact@goalforge.io', verified: true },
    { slug: 'educloud', name: 'EduCloud', description: '企业学习平台', contactEmail: 'contact@educloud.com', verified: true },
    { slug: 'peoplesense', name: 'PeopleSense', description: '员工体验洞察', contactEmail: 'contact@peoplesense.co', verified: true },
    { slug: 'legaltech-hr', name: 'LegalTech HR', description: 'HR 合规科技', contactEmail: 'contact@legaltech.hr', verified: true },
    { slug: 'datavibe', name: 'DataVibe', description: 'HR 数据分析', contactEmail: 'contact@datavibe.ai', verified: true },
    { slug: 'campushire', name: 'CampusHire', description: '校园招聘专家', contactEmail: 'contact@campushire.edu', verified: true },
    { slug: 'flexbenefit', name: 'FlexBenefit', description: '弹性福利平台', contactEmail: 'contact@flexbenefit.com', verified: true },
    { slug: 'talentgraph', name: 'TalentGraph', description: '人才图谱技术', contactEmail: 'contact@talentgraph.io', verified: true },
    { slug: 'firstday', name: 'FirstDay', description: '入职体验科技', contactEmail: 'contact@firstday.app', verified: true },
  ];
  for (const v of vendors) {
    await prisma.appVendor.upsert({
      where: { slug: v.slug },
      update: {},
      create: v,
    });
  }

  // ─── Marketplace Apps ───
  const catMap: Record<string, string> = {};
  const vendMap: Record<string, string> = {};
  for (const c of await prisma.appCategory.findMany()) catMap[c.slug] = c.id;
  for (const v of await prisma.appVendor.findMany()) vendMap[v.slug] = v.id;

  const apps = [
    {
      slug: 'smart-resume-screen', name: '智能简历筛选 Pro', tagline: 'AI 驱动的简历解析与智能匹配',
      categoryId: catMap['recruitment'], vendorId: vendMap['talentai-lab'],
      iconUrl: "",
      pricingModel: PricingModel.SUBSCRIPTION, status: AppStatus.PUBLISHED,
      featured: true, ratingAvg: 4.8, ratingCount: 342, installCount: 12580,
      description: '基于深度学习的简历解析引擎，支持 50+ 格式自动识别。',
      pricingTiers: [{ name: '基础版', priceMonthly: 299, desc: '每月 500 份简历解析' }],
    },
    {
      slug: 'payroll-auto-calc', name: '薪酬自动核算助手', tagline: '一键算薪，合规无忧',
      categoryId: catMap['compensation'], vendorId: vendMap['paytech'],
      iconUrl: "",
      pricingModel: PricingModel.SUBSCRIPTION, status: AppStatus.PUBLISHED,
      featured: true, ratingAvg: 4.6, ratingCount: 215, installCount: 8920,
      description: '自动关联考勤、绩效、社保数据，支持全国 300+ 城市个税政策。',
      pricingTiers: [{ name: '标准版', priceMonthly: 599, desc: '最多 200 人' }],
    },
    {
      slug: 'okr-copilot', name: 'OKR 协同助手', tagline: '目标对齐，执行落地',
      categoryId: catMap['performance'], vendorId: vendMap['goalforge'],
      iconUrl: "",
      pricingModel: PricingModel.FREE, status: AppStatus.PUBLISHED,
      featured: true, ratingAvg: 4.7, ratingCount: 428, installCount: 23100,
      description: '从目标制定到执行复盘的全流程 OKR 管理工具。',
      pricingTiers: [{ name: '免费版', priceMonthly: 0, desc: '最多 10 人' }],
    },
    {
      slug: 'lms-microlearning', name: '微课学习平台', tagline: '碎片化学习，体系化成长',
      categoryId: catMap['learning'], vendorId: vendMap['educloud'],
      iconUrl: "",
      pricingModel: PricingModel.SUBSCRIPTION, status: AppStatus.PUBLISHED,
      featured: false, ratingAvg: 4.5, ratingCount: 189, installCount: 7650,
      description: '支持微课、直播、考试、证书全链路学习管理。',
      pricingTiers: [{ name: '成长版', priceMonthly: 499, desc: '最多 100 人' }],
    },
    {
      slug: 'employee-pulse', name: '员工心声洞察', tagline: '实时感知员工情绪，主动干预留存',
      categoryId: catMap['experience'], vendorId: vendMap['peoplesense'],
      iconUrl: "",
      pricingModel: PricingModel.SUBSCRIPTION, status: AppStatus.PUBLISHED,
      featured: true, ratingAvg: 4.9, ratingCount: 156, installCount: 5420,
      description: '通过匿名问卷、情绪分析、离职预警等多维数据洞察员工满意度。',
      pricingTiers: [{ name: '调研版', priceMonthly: 399, desc: '每月 1 次调研' }],
    },
    {
      slug: 'compliance-guard', name: '合规卫士', tagline: '自动追踪法规变化，降低用工风险',
      categoryId: catMap['compliance'], vendorId: vendMap['legaltech-hr'],
      iconUrl: "",
      pricingModel: PricingModel.ONE_TIME, status: AppStatus.PUBLISHED,
      featured: false, ratingAvg: 4.4, ratingCount: 98, installCount: 3890,
      description: '实时追踪全国劳动法规、个税政策、社保基数变化。',
      pricingTiers: [{ name: '标准版', priceMonthly: 699, desc: '基础法规追踪' }],
    },
    {
      slug: 'ai-interview-bot', name: 'AI 面试机器人', tagline: '7×24 自动面试，精准评估潜力',
      categoryId: catMap['ai'], vendorId: vendMap['talentai-lab'],
      iconUrl: "",
      pricingModel: PricingModel.SUBSCRIPTION, status: AppStatus.PUBLISHED,
      featured: true, ratingAvg: 4.9, ratingCount: 512, installCount: 18760,
      description: '基于大语言模型的智能面试官，支持多种面试模式。',
      pricingTiers: [{ name: '试用版', priceMonthly: 0, desc: '每月 50 次面试' }],
    },
    {
      slug: 'hr-analytics-pro', name: 'HR 数据洞察 Pro', tagline: '400+ 指标，一键生成高管报表',
      categoryId: catMap['analytics'], vendorId: vendMap['datavibe'],
      iconUrl: "",
      pricingModel: PricingModel.SUBSCRIPTION, status: AppStatus.PUBLISHED,
      featured: true, ratingAvg: 4.7, ratingCount: 267, installCount: 9340,
      description: '预置 400+ HR 行业指标与高管驾驶舱模板。',
      pricingTiers: [{ name: '分析版', priceMonthly: 799, desc: '标准报表' }],
    },
    {
      slug: 'campus-recruit-suite', name: '校园招聘套件', tagline: '从宣讲到 Offer，校招全流程数字化',
      categoryId: catMap['recruitment'], vendorId: vendMap['campushire'],
      iconUrl: "",
      pricingModel: PricingModel.SUBSCRIPTION, status: AppStatus.PUBLISHED,
      featured: false, ratingAvg: 4.5, ratingCount: 178, installCount: 6540,
      description: '覆盖校招宣讲、简历收集、AI 初筛、在线测评全链路。',
      pricingTiers: [{ name: '校招季', priceMonthly: 1299, desc: '单季度使用' }],
    },
    {
      slug: 'benefits-marketplace', name: '弹性福利商城', tagline: '员工自选福利，企业成本可控',
      categoryId: catMap['compensation'], vendorId: vendMap['flexbenefit'],
      iconUrl: "",
      pricingModel: PricingModel.SUBSCRIPTION, status: AppStatus.PUBLISHED,
      featured: false, ratingAvg: 4.3, ratingCount: 134, installCount: 4780,
      description: '集成保险、体检、健身、餐饮等 1000+ 福利商品。',
      pricingTiers: [{ name: 'Starter', priceMonthly: 299, desc: '最多 100 人' }],
    },
    {
      slug: 'talent-map-360', name: '人才地图 360', tagline: '可视化人才分布，精准决策继任',
      categoryId: catMap['analytics'], vendorId: vendMap['talentgraph'],
      iconUrl: "",
      pricingModel: PricingModel.ONE_TIME, status: AppStatus.PUBLISHED,
      featured: false, ratingAvg: 4.6, ratingCount: 203, installCount: 7120,
      description: '基于九宫格、能力模型、绩效数据自动生成企业人才地图。',
      pricingTiers: [{ name: '团队版', priceMonthly: 599, desc: '单部门' }],
    },
    {
      slug: 'onboarding-experience', name: '入职体验管家', tagline: '让新人第一天就感受到归属',
      categoryId: catMap['experience'], vendorId: vendMap['firstday'],
      iconUrl: "",
      pricingModel: PricingModel.FREE, status: AppStatus.PUBLISHED,
      featured: true, ratingAvg: 4.8, ratingCount: 312, installCount: 15680,
      description: '从 Offer 接受到转正的全周期入职管理。',
      pricingTiers: [{ name: '免费版', priceMonthly: 0, desc: '最多 20 人/月' }],
    },
  ];
  for (const a of apps) {
    await prisma.app.upsert({
      where: { slug: a.slug },
      update: {},
      create: a as any,
    });
  }

  console.log('✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
