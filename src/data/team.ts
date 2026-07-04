/**
 * 团队页面 fallback 数据
 * v4.1.0-Sprint4：团队分类 + 成员信息
 * v4.2.0：支持按 locale 返回对应语言数据
 */

const TEAM_CATEGORIES_ZH = ['全部', '管理层', '技术专家', '顾问委员会'];

const TEAM_CATEGORIES_EN = ['All', 'Management', 'Technical Experts', 'Advisory Board'];

const TEAM_FALLBACK_ZH = [
  { id: 't1', name: '陈明远', role: '创始人兼 CEO', category: '管理层', bio: '前 SAP SuccessFactors 中国区总经理，20 年 HR 科技领域经验，清华大学 MBA。' },
  { id: 't2', name: '林思涵', role: '联合创始人兼 CTO', category: '管理层', bio: '前 Google 机器学习工程师，斯坦福大学计算机博士，主导 TalentPro AI 技术架构。' },
  { id: 't3', name: '王建华', role: '首席产品官', category: '管理层', bio: '前 Workday 产品总监，15 年企业 SaaS 产品设计经验，主导 TalentPro 产品矩阵规划。' },
  { id: 't4', name: '张瑞雪', role: '首席运营官', category: '管理层', bio: '前德勤人力资本咨询合伙人，曾服务 100+ 世界 500 强企业 HR 转型项目。' },
  { id: 't5', name: '李博文', role: 'AI 实验室负责人', category: '技术专家', bio: '清华大学计算机系副教授，自然语言处理领域专家，发表论文 50+ 篇。' },
  { id: 't6', name: '赵子轩', role: '首席架构师', category: '技术专家', bio: '前阿里云技术专家，分布式系统架构师，主导 TalentPro 云原生架构升级。' },
  { id: 't7', name: '孙雅琪', role: '安全负责人', category: '技术专家', bio: '前 360 安全研究院负责人，等保测评专家，主导 TalentPro 安全合规体系建设。' },
  { id: 't8', name: '周志宏', role: '数据科学负责人', category: '技术专家', bio: '前字节跳动算法专家，推荐系统与预测模型专家，主导 TalentPro 人力分析引擎。' },
  { id: 't9', name: '吴建新', role: '首席顾问', category: '顾问委员会', bio: '前中国人力资源开发研究会副会长，参与国家人才战略规划，出版专著 10+ 部。' },
  { id: 't10', name: '马丽娜', role: '战略顾问', category: '顾问委员会', bio: '前 Salesforce 亚太区副总裁，20 年企业软件销售与战略经验。' },
  { id: 't11', name: '郑海涛', role: '技术顾问', category: '顾问委员会', bio: '前 AWS 首席架构师，云原生技术布道者，Kubernetes 社区资深贡献者。' },
  { id: 't12', name: '黄晓梅', role: 'HR 顾问', category: '顾问委员会', bio: '前华为全球 HR 总监，主导华为 HR 三支柱变革，人力资源数字化转型专家。' },
];

const TEAM_FALLBACK_EN = [
  { id: 't1', name: 'Mingyuan Chen', role: 'Founder & CEO', category: 'Management', bio: 'Former General Manager of SAP SuccessFactors China, with 20 years of experience in HR technology and an MBA from Tsinghua University.' },
  { id: 't2', name: 'Sihan Lin', role: 'Co-Founder & CTO', category: 'Management', bio: 'Former Google machine learning engineer and Stanford CS PhD, leading the TalentPro AI technology architecture.' },
  { id: 't3', name: 'Jianhua Wang', role: 'Chief Product Officer', category: 'Management', bio: 'Former Workday product director with 15 years of enterprise SaaS product design experience, leading TalentPro product portfolio planning.' },
  { id: 't4', name: 'Ruixue Zhang', role: 'Chief Operating Officer', category: 'Management', bio: 'Former Deloitte Human Capital Consulting Partner, served 100+ Fortune 500 companies on HR transformation projects.' },
  { id: 't5', name: 'Bowen Li', role: 'Head of AI Lab', category: 'Technical Experts', bio: 'Associate Professor at Tsinghua University Department of Computer Science, NLP expert with 50+ published papers.' },
  { id: 't6', name: 'Zixuan Zhao', role: 'Chief Architect', category: 'Technical Experts', bio: 'Former Alibaba Cloud technical expert and distributed systems architect, leading TalentPro cloud-native architecture upgrade.' },
  { id: 't7', name: 'Yaqi Sun', role: 'Head of Security', category: 'Technical Experts', bio: 'Former head of 360 Security Research Institute, cybersecurity compliance expert, leading TalentPro security and compliance system.' },
  { id: 't8', name: 'Zhihong Zhou', role: 'Head of Data Science', category: 'Technical Experts', bio: 'Former ByteDance algorithm expert in recommendation systems and predictive models, leading TalentPro workforce analytics engine.' },
  { id: 't9', name: 'Jianxin Wu', role: 'Chief Advisor', category: 'Advisory Board', bio: 'Former Vice President of China Human Resource Development Research Association, contributed to national talent strategy planning, published 10+ monographs.' },
  { id: 't10', name: 'Lina Ma', role: 'Strategic Advisor', category: 'Advisory Board', bio: 'Former Vice President of Salesforce Asia Pacific, with 20 years of enterprise software sales and strategy experience.' },
  { id: 't11', name: 'Haitao Zheng', role: 'Technical Advisor', category: 'Advisory Board', bio: 'Former AWS Principal Architect, cloud-native technology evangelist and senior Kubernetes community contributor.' },
  { id: 't12', name: 'Xiaomei Huang', role: 'HR Advisor', category: 'Advisory Board', bio: 'Former Huawei Global HR Director, led Huawei HR three-pillar transformation, expert in HR digital transformation.' },
];

export function getTeamCategories(locale?: string) {
  if (locale === 'zh' || locale === 'zh-TW') return TEAM_CATEGORIES_ZH;
  return TEAM_CATEGORIES_EN;
}

export function getTeam(locale?: string) {
  if (locale === 'zh' || locale === 'zh-TW') return TEAM_FALLBACK_ZH;
  return TEAM_FALLBACK_EN;
}

/** 兼容旧直接引用：默认中文 */
export const TEAM_CATEGORIES = TEAM_CATEGORIES_ZH;
export const TEAM_FALLBACK = TEAM_FALLBACK_ZH;
