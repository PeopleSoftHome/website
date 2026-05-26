/**
 * 行业解决方案数据（SEC-07 IndustrySolutionSection）
 */
export const INDUSTRY_TABS = [
  {
    id: 'mfg',
    label: '制造业',
    icon: 'factory',
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
    screenshot: {
      title: '制造业 · 车间考勤看板',
      type: 'table',
      rows: [
        { name: '张三', shift: '早班', time: '08:01', status: 'green', label: '正常' },
        { name: '李四', shift: '早班', time: '08:03', status: 'green', label: '正常' },
        { name: '王五', shift: '中班', time: '—',     status: 'orange', label: '待打卡' },
        { name: '赵六', shift: '夜班', time: '20:00', status: 'blue',  label: '已排班' },
      ],
      tip: '张三焊工资质将于 30 天后到期，请及时安排复训',
    },
  },
  {
    id: 'retail',
    label: '零售连锁',
    icon: 'store',
    features: [
      { badge: '特色一', title: '店长招聘工作台', desc: '快速处理简历、安排面试及 Offer 发放，全流程跟进招聘环节，保证门店正常运营。' },
      { badge: '特色二', title: '门店人才培养', desc: '定期针对性培训，店长随时掌握店员学习进度，AI 学习助手提供个性化培养方案。' },
      { badge: '特色三', title: '多门店人事管理', desc: '支持数百家门店统一管控，快速入离职办理，灵活班次管理，保障薪资准时发放。' },
    ],
    screenshot: {
      title: '零售 · 门店管理看板',
      type: 'metrics',
      metrics: [
        { value: '47', label: '待面试候选人', color: 'var(--primary)' },
        { value: '12', label: '本月新入职',   color: 'var(--success)' },
        { value: '8',  label: '今日培训人数', color: 'var(--ai-purple)' },
        { value: '96%',label: '出勤完成率',   color: '#F59E0B' },
      ],
    },
  },
  {
    id: 'internet',
    label: '互联网',
    icon: 'monitor',
    features: [
      { badge: '特色一', title: 'HRBP 工作台', desc: '从 BP 视角出发的部门管理工作台，让 HR 敏捷应对多变的外部环境，提升业务支持效率。' },
      { badge: '特色二', title: '全员招聘协作', desc: '业务经理工作台，解决互联网全员招聘管理诉求，及时提交需求、了解进度、处理流程。' },
      { badge: '特色三', title: '互联网人才培养', desc: '体系化标准化人才发展体系，提供个性化学习方案，快速构建技术人才梯队。' },
    ],
    screenshot: {
      title: '互联网 · HRBP 工作台',
      type: 'tasks',
      tasks: [
        { text: '张总 需要复核绩效评分',     status: '待处理', statusColor: 'var(--primary)' },
        { text: '研发部 3 名员工转正申请',   status: '审批中', statusColor: 'var(--success)' },
        { text: 'P9 候选人背调报告已就绪',   status: '待查看', statusColor: '#F59E0B' },
        { text: 'Q2 OKR 对齐会议待确认',     status: '待处理', statusColor: 'var(--primary)' },
      ],
    },
  },
  {
    id: 'gov',
    label: '央国企',
    icon: 'landmark',
    features: [
      { badge: '特色一', title: '数字化校招', desc: '多元化传播吸引人才，数字化工具承载线上线下融合招聘，建立决策模型。' },
      { badge: '特色二', title: '年轻干部梯队建设', desc: '通过识别、选拔、培养、盘点与发展等一揽子方案，建设年轻干部队伍。' },
      { badge: '特色三', title: '干部任用与竞聘', desc: '通过竞聘、市场化选聘及动态人岗匹配，激活人才与组织活力。' },
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
    label: '金融',
    icon: 'bank',
    features: [
      { badge: '特色一', title: '校招创新管理', desc: '定义人才标准，系统化校招流程，借助测评工具提升校招质量与效率。' },
      { badge: '特色二', title: '后备人才库建设', desc: '分层分级人才盘点，在库培养建议，系统化后备人才梯队管理。' },
      { badge: '特色三', title: '营销员增员管理', desc: '外勤队伍分层分级，对目标客群与业务能力匹配，打造高产能队伍。' },
    ],
    screenshot: {
      title: '金融 · 九宫格人才盘点',
      type: 'grid9',
      cells: [
        { label: '高潜',  bg: '#FEE2E2', color: '#EF4444', count: 4 },
        { label: '明星',  bg: '#DCFCE7', color: '#16A34A', count: 7 },
        { label: '超级',  bg: '#DCFCE7', color: '#16A34A', count: 3 },
        { label: '问题',  bg: '#FEF9C3', color: '#CA8A04', count: 12 },
        { label: '核心',  bg: '#DBEAFE', color: '#2563EB', count: 18 },
        { label: '关键',  bg: '#DCFCE7', color: '#16A34A', count: 9 },
        { label: '待转型',bg: '#F3F4F6', color: '#6B7280', count: 8 },
        { label: '稳健',  bg: '#F3F4F6', color: '#6B7280', count: 15 },
        { label: '资深',  bg: '#DBEAFE', color: '#2563EB', count: 11 },
      ],
    },
  },
];
