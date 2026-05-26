import { PrismaClient, LeadStatus, UserStatus, PostStatus } from '@prisma/client';
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

  // Assign all permissions to SUPER_ADMIN
  const allPerms = await prisma.permission.findMany();
  await prisma.role.update({
    where: { id: superAdminRole.id },
    data: { permissions: { connect: allPerms.map((p) => ({ id: p.id })) } },
  });

  // ─── Default Admin User ───
  const hashedPassword = await bcrypt.hash('admin123456', 12);
  await prisma.user.upsert({
    where: { email: 'admin@talentpro.com' },
    update: {},
    create: {
      email: 'admin@talentpro.com',
      password: hashedPassword,
      name: '系统管理员',
      status: UserStatus.ACTIVE,
      roleId: superAdminRole.id,
    },
  });

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
      type: 'report', status: PostStatus.PUBLISHED,
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

  // ─── Demo Bookings ───
  await prisma.demoBooking.create({
    data: {
      name: '张三', company: '示例科技有限公司',
      phone: '13800138000', email: 'zhangsan@example.com',
      products: ['招聘管理', 'AI Family'], scale: '500-999人',
      status: LeadStatus.NEW, source: 'website',
    },
  });

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
