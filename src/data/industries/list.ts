/**
 * 行业方案 lightweight 列表数据
 * v2.0.0: 支持按 locale 返回对应语言数据
 */

const INDUSTRY_TABS_ZH = [
  {
    id: 'mfg',
    slug: 'manufacturing',
    label: '制造业',
    shortLabel: '制造',
    icon: 'factory',
    heroTitle: '制造业 HR 数字化转型方案',
    heroDesc: '应对劳动力短缺、成本上升、合规趋严三大挑战，TalentPro 为制造业提供从蓝领招聘到智能排班、从资质合规到薪酬核算的全链路数字化解决方案，助力制造企业降本增效、稳健扩张。',
    features: [
      {
        badge: '特色一',
        title: '智能排班与考勤',
        desc: '员工打卡自动匹配班次，应对复杂排班场景，5000+ 考勤规则自动处理，移动端即时排班，大幅提升生产效率。',
      },
      {
        badge: '特色二',
        title: '试工管理场景',
        desc: '试工期间扫码入系统，实现打卡、评价、录用全流程线上化管理，让蓝领招聘更高效合规。',
      },
      {
        badge: '特色三',
        title: '人员资质合规追踪',
        desc: '持续追踪研发、质量等岗位资质备案，提醒到期时间，在线签署培训协议，满足制造业严格合规要求。',
      },
    ],
    stats: [
      { value: '5000+', label: '考勤规则支持' },
      { value: '200+', label: '制造客户' },
      { value: '99.9%', label: '算薪准确率' },
      { value: '< 1s', label: '打卡响应' },
    ],
    screenshot: {
      title: '制造业 · 车间考勤看板',
      type: 'table',
      rows: [
        { name: '张三', shift: '早班', time: '08:01', status: 'green', label: '正常' },
        { name: '李四', shift: '早班', time: '08:03', status: 'green', label: '正常' },
        { name: '王五', shift: '中班', time: '—', status: 'orange', label: '待打卡' },
        { name: '赵六', shift: '夜班', time: '20:00', status: 'blue', label: '已排班' },
      ],
      tip: '张三焊工资质将于 30 天后到期，请及时安排复训',
    },
  },
  {
    id: 'retail',
    slug: 'retail',
    label: '零售连锁',
    shortLabel: '零售',
    icon: 'store',
    heroTitle: '零售连锁行业人力效能提升方案',
    heroDesc: '门店扩张快、人员流动大、排班复杂是零售行业 HR 的三大难题。TalentPro 提供从店长招聘到门店排班、从人才培养到多店管控的一站式解决方案，让零售 HR 跟上业务扩张步伐。',
    features: [
      {
        badge: '特色一',
        title: '店长招聘工作台',
        desc: '快速处理简历、安排面试及 Offer 发放，全流程跟进招聘环节，保证门店正常运营。',
      },
      {
        badge: '特色二',
        title: '门店人才培养',
        desc: '定期针对性培训，店长随时掌握店员学习进度，AI 学习助手提供个性化培养方案。',
      },
      {
        badge: '特色三',
        title: '多门店人事管理',
        desc: '支持数百家门店统一管控，快速入离职办理，灵活班次管理，保障薪资准时发放。',
      },
    ],
    stats: [
      { value: '500+', label: '门店统一管控' },
      { value: '50+', label: '零售品牌客户' },
      { value: '3 天', label: '新店人员到位' },
      { value: '15%', label: '人效提升' },
    ],
    screenshot: {
      title: '零售 · 门店管理看板',
      type: 'metrics',
      metrics: [
        { value: '47', label: '待面试候选人', color: 'var(--primary)' },
        { value: '12', label: '本月新入职', color: 'var(--success)' },
        { value: '8', label: '今日培训人数', color: 'var(--ai-purple)' },
        { value: '96%', label: '出勤完成率', color: '#F59E0B' },
      ],
    },
  },
  {
    id: 'internet',
    slug: 'internet',
    label: '互联网',
    shortLabel: '互联网',
    icon: 'monitor',
    heroTitle: '互联网敏捷组织人力方案',
    heroDesc: '业务变化快、人才竞争激烈、组织迭代频繁是互联网行业的常态。TalentPro 提供敏捷招聘、OKR 绩效管理、技术人才梯队建设等解决方案，助力互联网企业高速成长。',
    features: [
      {
        badge: '特色一',
        title: 'HRBP 工作台',
        desc: '从 BP 视角出发的部门管理工作台，让 HR 敏捷应对多变的外部环境，提升业务支持效率。',
      },
      {
        badge: '特色二',
        title: '全员招聘协作',
        desc: '业务经理工作台，解决互联网全员招聘管理诉求，及时提交需求、了解进度、处理流程。',
      },
      {
        badge: '特色三',
        title: '互联网人才培养',
        desc: '体系化标准化人才发展体系，提供个性化学习方案，快速构建技术人才梯队。',
      },
    ],
    stats: [
      { value: '10,000+', label: '并发面试' },
      { value: '100+', label: '互联网客户' },
      { value: '40%', label: '周期缩短' },
      { value: '92%', label: 'AI 匹配准确率' },
    ],
    screenshot: {
      title: '互联网 · HRBP 工作台',
      type: 'tasks',
      tasks: [
        { text: '张总 需要复核绩效评分', status: '待处理', statusColor: 'var(--primary)' },
        { text: '研发部 3 名员工转正申请', status: '审批中', statusColor: 'var(--success)' },
        { text: 'P9 候选人背调报告已就绪', status: '待查看', statusColor: '#F59E0B' },
        { text: 'Q2 OKR 对齐会议待确认', status: '待处理', statusColor: 'var(--primary)' },
      ],
    },
  },
  {
    id: 'gov',
    slug: 'government',
    label: '央国企',
    shortLabel: '央国企',
    icon: 'landmark',
    heroTitle: '央国企人才强企数字化方案',
    heroDesc: '落实人才强企战略，推进干部年轻化、选聘市场化、管理数字化。TalentPro 提供干部管理、竞聘上岗、年轻干部梯队建设等核心功能，助力央国企深化三项制度改革。',
    features: [
      {
        badge: '特色一',
        title: '数字化校招',
        desc: '多元化传播吸引人才，数字化工具承载线上线下融合招聘，建立决策模型。',
      },
      {
        badge: '特色二',
        title: '年轻干部梯队建设',
        desc: '通过识别、选拔、培养、盘点与发展等一揽子方案，建设年轻干部队伍。',
      },
      {
        badge: '特色三',
        title: '干部任用与竞聘',
        desc: '通过竞聘、市场化选聘及动态人岗匹配，激活人才与组织活力。',
      },
    ],
    stats: [
      { value: '50+', label: '央企客户' },
      { value: '100%', label: '竞聘留痕' },
      { value: '5 级', label: '干部梯队' },
      { value: '99.9%', label: '系统可用性' },
    ],
    screenshot: {
      title: '央国企 · 干部竞聘流程',
      type: 'timeline',
      steps: [
        { icon: 'megaphone', label: '发布职位', desc: '干部职位公开发布' },
        { icon: 'file-text', label: '报名申请', desc: '在线资格初审' },
        { icon: 'clipboard-list', label: '笔试考核', desc: '线上标准化测评' },
        { icon: 'mic', label: '面试答辩', desc: '专家评委打分' },
        { icon: 'check-circle', label: '公示任命', desc: '结果公开透明' },
      ],
    },
  },
  {
    id: 'finance',
    slug: 'finance',
    label: '金融',
    shortLabel: '金融',
    icon: 'bank',
    heroTitle: '金融行业人才管理合规方案',
    heroDesc: '监管严格、合规要求高、人才专业性强是金融行业 HR 的核心挑战。TalentPro 提供合规校招、后备人才库、营销员管理等解决方案，助力金融机构合规经营与人才可持续发展。',
    features: [
      {
        badge: '特色一',
        title: '校招创新管理',
        desc: '定义人才标准，系统化校招流程，借助测评工具提升校招质量与效率。',
      },
      {
        badge: '特色二',
        title: '后备人才库建设',
        desc: '分层分级人才盘点，在库培养建议，系统化后备人才梯队管理。',
      },
      {
        badge: '特色三',
        title: '营销员增员管理',
        desc: '外勤队伍分层分级，对目标客群与业务能力匹配，打造高产能队伍。',
      },
    ],
    stats: [
      { value: '30+', label: '金融机构客户' },
      { value: '100%', label: '合规培训覆盖' },
      { value: '99.9%', label: '系统可用性' },
      { value: '等保三级', label: '安全认证' },
    ],
    screenshot: {
      title: '金融 · 九宫格人才盘点',
      type: 'grid9',
      cells: [
        { label: '高潜', bg: '#FEE2E2', color: '#EF4444', count: 4 },
        { label: '明星', bg: '#DCFCE7', color: '#16A34A', count: 7 },
        { label: '超级', bg: '#DCFCE7', color: '#16A34A', count: 3 },
        { label: '问题', bg: '#FEF9C3', color: '#CA8A04', count: 12 },
        { label: '核心', bg: '#DBEAFE', color: '#2563EB', count: 18 },
        { label: '关键', bg: '#DCFCE7', color: '#16A34A', count: 9 },
        { label: '待转型', bg: '#F3F4F6', color: '#6B7280', count: 8 },
        { label: '稳健', bg: '#F3F4F6', color: '#6B7280', count: 15 },
        { label: '资深', bg: '#DBEAFE', color: '#2563EB', count: 11 },
      ],
    },
  },
];

const INDUSTRY_TABS_EN = [
  {
    id: 'mfg',
    slug: 'manufacturing',
    label: 'Manufacturing',
    shortLabel: 'Mfg',
    icon: 'factory',
    heroTitle: 'HR Digital Transformation for Manufacturing',
    heroDesc: 'Addressing labor shortages, rising costs, and stricter compliance, TalentPro provides end-to-end digital solutions for manufacturing—from blue-collar hiring to smart scheduling, qualification compliance to payroll.',
    features: [
      {
        badge: 'Feature 1',
        title: 'Smart Scheduling & Attendance',
        desc: 'Auto-match shifts on clock-in, handle complex scheduling scenarios, 5,000+ attendance rules processed automatically, mobile instant scheduling.',
      },
      {
        badge: 'Feature 2',
        title: 'Trial Worker Management',
        desc: 'Digital trial period management—scan-in onboarding, automated evaluations, and compliant hiring for blue-collar workers.',
      },
      {
        badge: 'Feature 3',
        title: 'Qualification Compliance Tracking',
        desc: 'Continuously track job certifications, send renewal reminders, and digitize compliance training agreements.',
      },
    ],
    stats: [
      { value: '5000+', label: 'Attendance Rules Supported' },
      { value: '200+', label: 'Manufacturing Clients' },
      { value: '99.9%', label: 'Payroll Accuracy' },
      { value: '< 1s', label: 'Clock-in Response' },
    ],
    screenshot: {
      title: 'Manufacturing · Shop Floor Attendance Board',
      type: 'table',
      rows: [
        { name: 'Zhang San', shift: 'Morning', time: '08:01', status: 'green', label: 'Normal' },
        { name: 'Li Si', shift: 'Morning', time: '08:03', status: 'green', label: 'Normal' },
        { name: 'Wang Wu', shift: 'Afternoon', time: '—', status: 'orange', label: 'Pending' },
        { name: 'Zhao Liu', shift: 'Night', time: '20:00', status: 'blue', label: 'Scheduled' },
      ],
      tip: 'Zhang San\'s welding certification expires in 30 days — schedule retraining',
    },
  },
  {
    id: 'retail',
    slug: 'retail',
    label: 'Retail & Chain',
    shortLabel: 'Retail',
    icon: 'store',
    heroTitle: 'Workforce Efficiency for Retail & Chain',
    heroDesc: 'Fast store expansion, high turnover, and complex scheduling are retail\'s top HR challenges. TalentPro offers one-stop solutions from store manager hiring to multi-store workforce control.',
    features: [
      {
        badge: 'Feature 1',
        title: 'Store Manager Recruitment Hub',
        desc: 'Streamline resume review, interviews, and offer management—keep stores running at full capacity.',
      },
      {
        badge: 'Feature 2',
        title: 'Store-Level Talent Development',
        desc: 'Track employee learning progress in real time; AI Coach delivers personalized development plans.',
      },
      {
        badge: 'Feature 3',
        title: 'Multi-Store HR Management',
        desc: 'Centrally manage hundreds of stores—fast onboarding/offboarding, flexible scheduling, on-time payroll.',
      },
    ],
    stats: [
      { value: '500+', label: 'Stores Under Unified Control' },
      { value: '50+', label: 'Retail Brand Clients' },
      { value: '3 Days', label: 'New Store Staffing' },
      { value: '15%', label: 'Productivity Gain' },
    ],
    screenshot: {
      title: 'Retail · Store Management Dashboard',
      type: 'metrics',
      metrics: [
        { value: '47', label: 'Candidates to Interview', color: 'var(--primary)' },
        { value: '12', label: 'New Hires This Month', color: 'var(--success)' },
        { value: '8', label: 'Training Sessions Today', color: 'var(--ai-purple)' },
        { value: '96%', label: 'Attendance Completion', color: '#F59E0B' },
      ],
    },
  },
  {
    id: 'internet',
    slug: 'internet',
    label: 'Internet & Tech',
    shortLabel: 'Internet',
    icon: 'monitor',
    heroTitle: 'Agile HR for Internet & Tech',
    heroDesc: 'Rapid business changes, fierce talent competition, and frequent org iterations are the norm. TalentPro provides agile recruiting, OKR performance, and tech talent pipeline solutions.',
    features: [
      {
        badge: 'Feature 1',
        title: 'HRBP Workbench',
        desc: 'A department-level command center for HRBPs—stay agile and responsive to fast-changing business needs.',
      },
      {
        badge: 'Feature 2',
        title: 'Company-Wide Recruiting Collaboration',
        desc: 'Empower hiring managers to submit reqs, track progress, and manage approvals—all in one place.',
      },
      {
        badge: 'Feature 3',
        title: 'Tech Talent Development',
        desc: 'Structured talent pipelines and personalized learning plans to build high-performance engineering teams.',
      },
    ],
    stats: [
      { value: '10,000+', label: 'Concurrent Interviews' },
      { value: '100+', label: 'Internet Clients' },
      { value: '40%', label: 'Cycle Reduction' },
      { value: '92%', label: 'AI Match Accuracy' },
    ],
    screenshot: {
      title: 'Internet & Tech · HRBP Workbench',
      type: 'tasks',
      tasks: [
        { text: 'GM Zhang\'s performance score needs review', status: 'Pending', statusColor: 'var(--primary)' },
        { text: '3 probation completions in R&D pending approval', status: 'In Review', statusColor: 'var(--success)' },
        { text: 'P9 background check report ready', status: 'To Review', statusColor: '#F59E0B' },
        { text: 'Q2 OKR alignment meeting needs confirmation', status: 'Pending', statusColor: 'var(--primary)' },
      ],
    },
  },
  {
    id: 'gov',
    slug: 'government',
    label: 'State-owned Enterprise',
    shortLabel: 'SOE',
    icon: 'landmark',
    heroTitle: 'Digital Talent Strategy for SOEs',
    heroDesc: 'Implement talent-driven enterprise strategy, promote younger cadres, market-based selection, and digital management. TalentPro provides cadre management, competitive appointment, and young executive pipeline.',
    features: [
      {
        badge: 'Feature 1',
        title: 'Digital Campus Recruiting',
        desc: 'Attract diverse talent with digital tools that support hybrid online/offline campus hiring.',
      },
      {
        badge: 'Feature 2',
        title: 'Young Executive Pipeline',
        desc: 'Identify, select, develop, and review emerging leaders through a comprehensive talent pipeline program.',
      },
      {
        badge: 'Feature 3',
        title: 'Cadre Appointment & Competition',
        desc: 'Open competition, market-based selection, and dynamic role-matching to activate organizational vitality.',
      },
    ],
    stats: [
      { value: '50+', label: 'Central SOE Clients' },
      { value: '100%', label: 'Competition Audit Trail' },
      { value: '5 Levels', label: 'Cadre Pipeline' },
      { value: '99.9%', label: 'System Uptime' },
    ],
    screenshot: {
      title: 'SOE · Cadre Competition Workflow',
      type: 'timeline',
      steps: [
        { icon: 'megaphone', label: 'Post Published', desc: 'Open position announcement' },
        { icon: 'file-text', label: 'Applications', desc: 'Online eligibility screening' },
        { icon: 'clipboard-list', label: 'Written Exam', desc: 'Standardized online assessment' },
        { icon: 'mic', label: 'Interview', desc: 'Expert panel scoring' },
        { icon: 'check-circle', label: 'Announcement', desc: 'Results published transparently' },
      ],
    },
  },
  {
    id: 'finance',
    slug: 'finance',
    label: 'Finance',
    shortLabel: 'Finance',
    icon: 'bank',
    heroTitle: 'Compliance-Driven Talent Management for Finance',
    heroDesc: 'Strict regulation, high compliance requirements, and specialized talent are core challenges. TalentPro offers compliant campus hiring, succession pools, and agent/sales force management.',
    features: [
      {
        badge: 'Feature 1',
        title: 'Innovative Campus Hiring',
        desc: 'Define talent standards, systematize the campus hiring process, and leverage assessment tools to improve quality.',
      },
      {
        badge: 'Feature 2',
        title: 'Talent Reserve Program',
        desc: 'Tiered talent reviews, in-pipeline coaching, and systematic succession management.',
      },
      {
        badge: 'Feature 3',
        title: 'Sales Force Expansion',
        desc: 'Segment field teams by tier, match talent to target segments, and build high-productivity sales units.',
      },
    ],
    stats: [
      { value: '30+', label: 'Financial Institution Clients' },
      { value: '100%', label: 'Compliance Training Coverage' },
      { value: '99.9%', label: 'System Uptime' },
      { value: 'Level-3', label: 'Security Certification' },
    ],
    screenshot: {
      title: 'Finance · 9-Box Talent Review',
      type: 'grid9',
      cells: [
        { label: 'High Potential', bg: '#FEE2E2', color: '#EF4444', count: 4 },
        { label: 'Star', bg: '#DCFCE7', color: '#16A34A', count: 7 },
        { label: 'Super', bg: '#DCFCE7', color: '#16A34A', count: 3 },
        { label: 'Issue', bg: '#FEF9C3', color: '#CA8A04', count: 12 },
        { label: 'Core', bg: '#DBEAFE', color: '#2563EB', count: 18 },
        { label: 'Key', bg: '#DCFCE7', color: '#16A34A', count: 9 },
        { label: 'To Transform', bg: '#F3F4F6', color: '#6B7280', count: 8 },
        { label: 'Steady', bg: '#F3F4F6', color: '#6B7280', count: 15 },
        { label: 'Veteran', bg: '#DBEAFE', color: '#2563EB', count: 11 },
      ],
    },
  },
];

export function getIndustryList(locale?: string) {
  if (locale === 'en') return INDUSTRY_TABS_EN;
  return INDUSTRY_TABS_ZH;
}

/** 兼容旧直接引用：默认中文 */
export const INDUSTRY_TABS = INDUSTRY_TABS_ZH;
