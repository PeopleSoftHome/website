import { createTypedSearchIndex } from '@/utils/searchIndexFactory';

export const SEARCH_INDUSTRIES = createTypedSearchIndex(
  { type: 'industry', section: 'industry', weight: 0.85, icon: 'factory' },
  [
    {
      id: 'i-mfg', weight: 0.9,
      title: '制造业方案',
      tags: ['制造', '工厂', '蓝领', '排班', '考勤', '车间', 'manufacturing', '生产'],
      desc: '智能排班 + 试工管理 + 资质合规追踪',
      icon: 'factory',
    },
    {
      id: 'i-retail', weight: 0.85,
      title: '零售连锁方案',
      tags: ['零售', '连锁', '门店', '店长', '蓝领', 'retail', '快消', '餐饮'],
      desc: '店长招聘工作台 + 门店人才培养 + 多门店人事管理',
      icon: 'store',
    },
    {
      id: 'i-internet', weight: 0.85,
      title: '互联网方案',
      tags: ['互联网', 'HRBP', '科技', '研发', 'OKR', '互联网公司', 'tech', '敏捷'],
      desc: 'HRBP 工作台 + 全员招聘协作 + 人才梯队建设',
      icon: 'monitor',
    },
    {
      id: 'i-gov', weight: 0.85,
      title: '央国企方案',
      tags: ['央企', '国企', '国有企业', '竞聘', '干部', '校招', '党建', 'SOE'],
      desc: '数字化校招 + 年轻干部梯队 + 干部竞聘',
      icon: 'landmark',
    },
    {
      id: 'i-finance', weight: 0.85,
      title: '金融行业方案',
      tags: ['金融', '银行', '保险', '证券', '校招', '后备人才', 'finance', '营销员'],
      desc: '校招创新管理 + 后备人才库 + 营销员增员',
      icon: 'bank',
    },
  ],
);
