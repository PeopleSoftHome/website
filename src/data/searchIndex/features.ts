import { createSearchIndex } from '@/utils/searchIndexFactory';

/* ══════════════ FEATURE — 12 条（功能特色，权重较低）══════════════ */
export const SEARCH_FEATURES = createSearchIndex([
  {
    id: 'f-smart-schedule', type: 'feature', weight: 0.7,
    title: '智能排班',
    tags: ['排班', '智能排班', '班次', '工厂排班', '自动排班'],
    desc: '5000+ 考勤规则自动处理，移动端即时排班',
    section: 'industry', icon: 'calendar',
  },
  {
    id: 'f-ai-screen', type: 'feature', weight: 0.75,
    title: 'AI 简历初筛',
    tags: ['AI初筛', '简历筛选', '自动筛选', 'AI', '简历', '批量'],
    desc: 'AI 自动筛选简历，减少 80% 重复工作',
    section: 'ai', icon: 'search',
  },
  {
    id: 'f-okr', type: 'feature', weight: 0.7,
    title: 'OKR 目标管理',
    tags: ['OKR', '目标', 'KR', '对齐', '目标管理', '互联网'],
    desc: 'O-KR 层层拆解，目标进度实时可见',
    section: 'products', icon: 'target',
  },
  {
    id: 'f-mobile-attendance', type: 'feature', weight: 0.7,
    title: '移动端考勤打卡',
    tags: ['手机打卡', '移动打卡', 'GPS打卡', '人脸识别', '外勤'],
    desc: '手机 GPS/人脸/Wi-Fi 多模式打卡',
    section: 'products', icon: 'smartphone',
  },
  {
    id: 'f-payslip', type: 'feature', weight: 0.65,
    title: '电子工资条',
    tags: ['工资条', '电子工资单', '薪资明细', '发薪'],
    desc: '一键发放电子工资条，员工微信/App 查看',
    section: 'products', icon: 'credit-card',
  },
  {
    id: 'f-hrbp', type: 'feature', weight: 0.7,
    title: 'HRBP 工作台',
    tags: ['HRBP', 'HR业务伙伴', '工作台', '数据看板', 'BP'],
    desc: '部门 HR 一站式管理工作台',
    section: 'industry', icon: 'briefcase',
  },
  {
    id: 'f-talent-pool', type: 'feature', weight: 0.7,
    title: '人才库管理',
    tags: ['人才库', '候选人库', '简历库', '后备人才', '储备'],
    desc: '沉淀企业人才资产，随时激活备用候选人',
    section: 'products', icon: 'database',
  },
  {
    id: 'f-onboarding', type: 'feature', weight: 0.65,
    title: '数字化入职',
    tags: ['入职', '新人入职', '电子签约', 'onboarding', '入职流程'],
    desc: '全流程线上入职，合同电子签，材料自动归档',
    section: 'products', icon: 'sparkles',
  },
  {
    id: 'f-esg', type: 'feature', weight: 0.6,
    title: '员工关怀 ESG',
    tags: ['员工关怀', 'ESG', '员工福利', '心理健康', '企业文化'],
    desc: '员工满意度调研、福利管理、EAP 支持',
    section: 'products', icon: 'heart',
  },
  {
    id: 'f-succession', type: 'feature', weight: 0.65,
    title: '继任者管理',
    tags: ['继任', '接班人', '继任计划', '人才梯队', '高潜'],
    desc: '识别关键岗位继任者，系统化培养路径',
    section: 'products', icon: 'award',
  },
  {
    id: 'f-trial-worker', type: 'feature', weight: 0.65,
    title: '试工管理',
    tags: ['试工', '蓝领', '试用', '工厂', '扫码入职', '临时工'],
    desc: '扫码入系统，试工全流程线上化管理',
    section: 'industry', icon: 'bookmark',
  },
  {
    id: 'f-roi', type: 'feature', weight: 0.7,
    title: 'ROI 计算器',
    tags: ['ROI', '投资回报', '成本节省', '计算器', '预算'],
    desc: '量化 TalentPro 为您节省的人力成本',
    section: 'resources', icon: 'calculator',
  },
]);
