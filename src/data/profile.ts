export const ORDER_STATUSES = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待支付' },
  { value: 'completed', label: '已完成' },
  { value: 'refunded', label: '已退款' },
];

export const ORDER_FALLBACK = [
  { id: 'ORD-20260601-001', appName: 'AI 招聘助手 Pro', amount: 2999, status: 'completed', date: '2026-06-01', icon: '🤖' },
  { id: 'ORD-20260515-002', appName: '绩效管理系统', amount: 5999, status: 'completed', date: '2026-05-15', icon: '📊' },
  { id: 'ORD-20260610-003', appName: '组织人事系统', amount: 8999, status: 'pending', date: '2026-06-10', icon: '🏢' },
  { id: 'ORD-20260420-004', appName: '薪酬管理系统', amount: 4999, status: 'refunded', date: '2026-04-20', icon: '💰' },
];

export const ACTIVITIES = [
  { type: 'order', text: '购买了 AI 招聘助手 Pro', date: '2026-06-01 14:32' },
  { type: 'login', text: '在新设备上登录', date: '2026-06-10 09:15' },
  { type: 'review', text: '发表了应用评价', date: '2026-05-28 16:40' },
  { type: 'install', text: '安装了绩效管理系统', date: '2026-05-15 11:20' },
  { type: 'update', text: '更新了个人资料', date: '2026-05-10 10:05' },
];

export const LOGIN_HISTORY = [
  { date: '2026-06-10 09:15', device: 'Chrome / macOS', ip: '192.168.1.***', location: '北京', current: true },
  { date: '2026-06-09 18:30', device: 'Safari / iOS', ip: '192.168.2.***', location: '北京', current: false },
  { date: '2026-06-08 14:10', device: 'Firefox / Windows', ip: '192.168.3.***', location: '上海', current: false },
  { date: '2026-06-05 09:00', device: 'Chrome / macOS', ip: '192.168.1.***', location: '北京', current: false },
];
