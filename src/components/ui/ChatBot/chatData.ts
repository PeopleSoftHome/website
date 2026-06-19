/**
 * Chatbot 知识库元数据 — TalentPro 智能客服
 *
 * v2.10.0 (Sprint 33)：主回答链路已迁移到后端 AI RAG API。
 * 本文件保留的 FAQ_RULES_META 仅作为网络异常时的前端 fallback，
 * 实际日常回答由后端 AiService（OpenAI + Meilisearch RAG）生成。
 *
 * 实际回复文本通过 t(`chatBot.faq.${id}.reply`) 读取。
 */

export const BOT_AVATAR = '';

/** FAQ 规则元数据（文本在 i18n 中管理） */
export const FAQ_RULES_META = [
  {
    id: 'product',
    keywords: ['产品', '功能', '模块', '系统', '有什么', '介绍',
               'product', 'features', 'modules', 'functions', 'what do you have'],
  },
  {
    id: 'ai',
    keywords: ['AI', '人工智能', '智能', '助手',
               'ai', 'artificial intelligence', 'intelligent assistant'],
  },
  {
    id: 'recruit',
    keywords: ['招聘', '校招', '社招', 'ATS', '简历', 'JD',
               'recruit', 'hiring', 'campus', 'resume', 'cv', 'job description'],
  },
  {
    id: 'attendance',
    keywords: ['考勤', '排班', '打卡', '班次', '工厂', '蓝领',
               'attendance', 'scheduling', 'shift', 'clock in', 'factory', 'blue collar'],
  },
  {
    id: 'payroll',
    keywords: ['薪酬', '工资', '发薪', '个税', '社保', '五险',
               'payroll', 'salary', 'wage', 'tax', 'social insurance', 'compensation'],
  },
  {
    id: 'performance',
    keywords: ['绩效', 'OKR', 'KPI', '目标', '考核', '评估',
               'performance', 'okr', 'kpi', 'goal', 'appraisal', 'evaluation'],
  },
  {
    id: 'manufacturing',
    keywords: ['制造', '工厂', '车间', '蓝领', '试工', '资质',
               'manufacturing', 'factory', 'workshop', 'blue collar', 'trial worker'],
  },
  {
    id: 'retail',
    keywords: ['零售', '连锁', '门店', '店长', '餐饮',
               'retail', 'chain', 'store', 'restaurant', 'franchise'],
  },
  {
    id: 'internet',
    keywords: ['互联网', 'HRBP', '科技', '研发',
               'internet', 'tech', 'hrbp', 'r&d', 'software'],
  },
  {
    id: 'gov',
    keywords: ['央企', '国企', '国有', '竞聘', '干部',
               'soe', 'state owned', 'government', 'cadre', 'competition'],
  },
  {
    id: 'demo',
    keywords: ['演示', '预约', 'demo', 'Demo', '体验', '试用',
               'demo', 'trial', 'book a demo', 'schedule'],
    action: 'openModal',
  },
  {
    id: 'price',
    keywords: ['价格', '收费', '多少钱', '费用', '报价', '定价',
               'price', 'cost', 'how much', 'pricing', 'quote', 'fee'],
  },
  {
    id: 'security',
    keywords: ['安全', '数据安全', '等保', 'ISO', '加密', '合规',
               'security', 'data safety', 'encryption', 'compliance', 'iso'],
  },
  {
    id: 'human',
    keywords: ['人工', '转人工', '客服', '真人', '人工服务',
               'human', 'agent', 'transfer', 'live agent', 'customer service'],
    isHandoff: true,
  },
];

/** 兜底回复 key 列表（对应 i18n chatBot.fallbackN） */
export const FALLBACK_REPLY_KEYS = ['fallback1', 'fallback2', 'fallback3'];
