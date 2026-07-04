/**
 * 「为什么选我们」数据（SEC-10 WhyUsSection）
 * v4.2.0：支持按 locale 返回对应语言数据
 */

const WHY_US_TABS_ZH = [
  {
    id: 'product',
    label: '产品创新',
    metrics: [
      { num: '2000+', label: '产品特性',    desc: '一体化 HR SaaS 年度持续迭代，紧跟业务场景需求' },
      { num: '200+',  label: '生态伙伴',    desc: '链接全行业生态伙伴，构建开放的 HR 生态系统' },
      { num: '10大',  label: 'AI Agent',   desc: '多场景智能助手，覆盖 HR 全业务链路' },
      { num: '18大',  label: '角色工作台',  desc: '新生代员工全职涯体验，人人都有专属工作台' },
    ],
  },
  {
    id: 'brand',
    label: '品牌保障',
    metrics: [
      { num: '20+年', label: '专业沉淀',    desc: '人才管理技术积累，深耕 HR SaaS 领域' },
      { num: '24家',  label: '分支机构',    desc: '原厂实施，本地化服务，快速响应客户需求' },
      { num: 'IDC',   label: '连续九年第一', desc: '中国 HR SaaS 市场连续九年占有率第一' },
      { num: '106%',  label: 'NDR 净留存',  desc: '客户持续信任，续约率业界最高水平' },
    ],
  },
  {
    id: 'success',
    label: '客户成功',
    metrics: [
      { num: '5S',    label: '实施服务体系', desc: '领先的客户成功服务，确保系统稳定上线' },
      { num: '1100+', label: 'BCA 认证',    desc: '赋能 HRIS 专业人才成长，建设专业服务能力' },
      { num: '7×24',  label: '全天候支持',  desc: '1 小时内迅速响应，确保业务连续性' },
      { num: '3万+',  label: '共享资源',    desc: 'HR 成长社区，实战资源共享共建' },
    ],
  },
];

const WHY_US_TABS_EN = [
  {
    id: 'product',
    label: 'Product Innovation',
    metrics: [
      { num: '2000+', label: 'Product Features', desc: 'Integrated HR SaaS continuously iterated annually to meet evolving business needs' },
      { num: '200+',  label: 'Ecosystem Partners', desc: 'Connecting industry-wide partners to build an open HR ecosystem' },
      { num: '10',    label: 'AI Agents',        desc: 'Intelligent assistants covering the full HR workflow' },
      { num: '18',    label: 'Role Workbenches', desc: 'Personalized workspaces for every role across the employee lifecycle' },
    ],
  },
  {
    id: 'brand',
    label: 'Brand Trust',
    metrics: [
      { num: '20+', label: 'Years of Expertise', desc: 'Two decades of talent management technology depth in HR SaaS' },
      { num: '24',  label: 'Regional Offices',   desc: 'First-party implementation with localized, rapid-response service' },
      { num: '#1',  label: 'IDC 9 Years',        desc: "China's #1 HR SaaS market share for nine consecutive years" },
      { num: '106%', label: 'Net Dollar Retention', desc: 'Industry-leading renewal rates reflect sustained client trust' },
    ],
  },
  {
    id: 'success',
    label: 'Customer Success',
    metrics: [
      { num: '5S',    label: 'Implementation Framework', desc: 'Industry-leading service model ensures stable, on-time go-live' },
      { num: '1100+', label: 'BCA Certified',            desc: 'Growing a certified HRIS talent community' },
      { num: '24/7',  label: 'Always-On Support',        desc: '1-hour response SLA to ensure business continuity' },
      { num: '30K+',  label: 'Shared Resources',         desc: 'HR community with real-world templates and best practices' },
    ],
  },
];

/** 底部统计数字条（带 count-up） */
const STATS_BAR_ZH = [
  { target: 6000,  suffix: '+',   label: '中大型企业客户' },
  { target: 15,    suffix: '亿+', label: '日数据处理条数' },
  { target: 1600,  suffix: '万+', label: '年专业测评人次' },
  { target: 800,   suffix: '万+', label: '年完成面试场次' },
  { target: 10,    suffix: '亿+', label: '年用户打卡量' },
  { target: 9000,  suffix: '万+', label: '年学习人次' },
];

const STATS_BAR_EN = [
  { target: 6000, suffix: '+',   label: 'Enterprise Clients' },
  { target: 15,   suffix: 'B+',  label: 'Daily Data Records' },
  { target: 1600, suffix: 'M+',  label: 'Annual Assessments' },
  { target: 800,  suffix: 'M+',  label: 'Annual Interviews' },
  { target: 10,   suffix: 'B+',  label: 'Annual Clock-ins' },
  { target: 9000, suffix: 'M+',  label: 'Annual Learners' },
];

export function getWhyUs(locale?: string) {
  if (locale === 'zh' || locale === 'zh-TW') return WHY_US_TABS_ZH;
  return WHY_US_TABS_EN;
}

export function getStatsBar(locale?: string) {
  if (locale === 'zh' || locale === 'zh-TW') return STATS_BAR_ZH;
  return STATS_BAR_EN;
}

/** 兼容旧直接引用：默认中文 */
export const WHY_US_TABS = WHY_US_TABS_ZH;
export const STATS_BAR = STATS_BAR_ZH;
