/**
 * 行业详情 heavy 数据
 * v2.0.0: 支持按 locale 返回对应语言数据
 */

const INDUSTRY_DETAILS_ZH = {
  manufacturing: {
    painPoints: [
      { title: '劳动力短缺', desc: '蓝领工人招聘难、流失率高，传统招聘渠道效率低，无法满足产能扩张需求。' },
      { title: '考勤复杂', desc: '多班次、多车间、跨厂区的复杂考勤规则，人工处理易出错，薪资纠纷频发。' },
      { title: '合规风险', desc: '特种作业资质、安全生产培训、环保合规等要求多，纸质管理难追溯，审计风险大。' },
      { title: '人效不透明', desc: '缺乏实时人力数据，产能与人力匹配靠经验，加班与闲置并存，人力成本居高不下。' },
    ],
    architecture: [
      { title: '蓝领招聘平台', desc: '扫码入职、批量招聘、AI 初筛、电子合同，蓝领招聘全流程数字化' },
      { title: '智能考勤排班', desc: '5000+ 规则引擎、AI 辅助排班、移动端打卡、异常自动预警' },
      { title: '资质合规中心', desc: '资质到期提醒、培训协议在线签署、合规审计一键导出' },
      { title: '车间人力看板', desc: '实时出勤、产能人效、加班预警，数据驱动精益管理' },
    ],
    roadmap: [
      { phase: '第 1 阶段', title: '考勤薪酬数字化', desc: '2-4 周完成考勤规则配置与薪酬核算上线，解决最迫切的算薪难题' },
      { phase: '第 2 阶段', title: '招聘入职线上化', desc: '4-8 周搭建蓝领招聘与入职流程，实现扫码入职、电子合同' },
      { phase: '第 3 阶段', title: '人效分析可视化', desc: '8-12 周上线人力分析看板，实现产能与人力的实时匹配与优化' },
      { phase: '第 4 阶段', title: '全面智能化', desc: '持续迭代 AI 排班、离职预测、人才梯队等高级应用' },
    ],
    caseStudy: {
      client: '某汽车零部件集团',
      industry: '汽车零部件',
      scale: '3,000+ 员工',
      challenge: '工厂分布三省五市，考勤规则近 200 种，每月薪资核算需 5 天，员工投诉率高。',
      solution: '部署 TalentPro 考勤与薪酬模块，统一全国考勤规则，自动化算薪，移动端自助查询。',
      results: [
        { value: '90%', label: '薪资核算时间缩短' },
        { value: '80%', label: '员工投诉率下降' },
        { value: '99.9%', label: '算薪准确率' },
      ],
      quote: 'TalentPro 帮我们自动处理了近 200 种考勤规则，每个月薪资核算时间从 5 天缩短到了半天。',
      author: '李秀华',
      title: '人力资源总监',
    },
    roi: [
      { metric: '算薪效率', value: '10x', desc: '从 5 天缩短至 0.5 天' },
      { metric: '招聘周期', value: '-40%', desc: '蓝领招聘从 14 天缩短至 8 天' },
      { metric: '合规风险', value: '-70%', desc: '资质到期预警覆盖 100%' },
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
  retail: {
    painPoints: [
      { title: '人员流动高', desc: '零售行业年流动率超 50%，招聘与培训成本居高不下，门店运营受影响。' },
      { title: '排班复杂', desc: '门店营业时间不同、客流量波动大，手工排班难以兼顾合规与人效。' },
      { title: '店长培养慢', desc: '店长是门店核心，但培养周期长，新店开业常面临无人可用的困境。' },
      { title: '多店管控难', desc: '数百家门店分布各地，总部难以实时掌握各店人力状况与成本。' },
    ],
    architecture: [
      { title: '门店招聘中心', desc: '店长自主招聘、总部审批、简历共享、批量入职，招聘效率提升 5 倍' },
      { title: '智能排班引擎', desc: '按客流量预测排班，忙时多配人、闲时少排班，工时合规自动校验' },
      { title: '店长培养体系', desc: '店长能力模型、AI 学习路径、OJT 带教跟踪，缩短店长培养周期 30%' },
      { title: '多店人力看板', desc: '总部实时查看各店编制、出勤、成本，异常自动预警' },
    ],
    roadmap: [
      { phase: '第 1 阶段', title: '核心门店上线', desc: '4-6 周完成 10 家核心门店系统上线，建立标准化流程' },
      { phase: '第 2 阶段', title: '批量推广', desc: '8-12 周扩展至 100 家门店，区域经理培训与赋能' },
      { phase: '第 3 阶段', title: '全面覆盖', desc: '12-16 周覆盖全部门店，建立总部-区域-门店三级管控体系' },
      { phase: '第 4 阶段', title: '智能优化', desc: '持续优化 AI 排班、离职预测、人才池，实现人力成本最优' },
    ],
    caseStudy: {
      client: '某连锁餐饮品牌',
      industry: '餐饮连锁',
      scale: '500+ 门店',
      challenge: '旺季门店扩张，每次大规模招聘蓝领员工，传统流程慢，门店等人才影响开业。',
      solution: '部署 TalentPro 招聘系统与 AI 初筛，批量招聘 + 试工评价 + 电子合同一站式完成。',
      results: [
        { value: '5x', label: '招聘效率提升' },
        { value: '3 天', label: '新店人员到位' },
        { value: '-50%', label: '招聘成本降低' },
      ],
      quote: '批量招聘和 AI 初筛功能，让我们的招聘效率提升了 5 倍，真正实现了让业务等人才而不是人才等流程。',
      author: '张明月',
      title: '人才招募总监',
    },
    roi: [
      { metric: '招聘效率', value: '5x', desc: '人均处理简历量提升 5 倍' },
      { metric: '店长培养', value: '-30%', desc: '店长培养周期从 6 个月缩短至 4 个月' },
      { metric: '人效提升', value: '+15%', desc: '智能排班后人效提升 15%' },
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
  internet: {
    painPoints: [
      { title: '人才争夺激烈', desc: '技术人才稀缺，招聘周期长，候选人体验不佳导致 Offer 拒绝率高。' },
      { title: '组织迭代快', desc: '团队调整频繁，绩效考核难以跟上业务变化，目标对齐困难。' },
      { title: '年轻化管理', desc: '90/00 后员工占比高，传统管理模式不适用，员工敬业度下降。' },
      { title: '数据驱动难', desc: 'HR 数据分散，缺乏实时分析能力，无法为业务决策提供有效支撑。' },
    ],
    architecture: [
      { title: '敏捷招聘平台', desc: '内推、猎头、渠道统一管理，AI 筛选 + 结构化面试，缩短招聘周期 40%' },
      { title: 'OKR 绩效引擎', desc: '目标对齐地图、持续反馈、季度复盘，打造高绩效敏捷组织' },
      { title: '技术人才梯队', desc: '技术能力模型、代码测评、晋升评审，构建可持续技术人才供应链' },
      { title: '人力数据驾驶舱', desc: '实时人力效能、成本、流动分析，支撑业务快速决策' },
    ],
    roadmap: [
      { phase: '第 1 阶段', title: '招聘提效', desc: '4-6 周上线智能招聘，AI 筛选 + 面试协同，缩短招聘周期' },
      { phase: '第 2 阶段', title: '绩效管理', desc: '8-10 周推行 OKR，目标对齐与持续反馈，提升组织敏捷度' },
      { phase: '第 3 阶段', title: '人才发展', desc: '10-14 周建立技术人才梯队，晋升通道透明化' },
      { phase: '第 4 阶段', title: '数据智能', desc: '持续深化 AI 应用，离职预测、人力规划、组织诊断' },
    ],
    caseStudy: {
      client: '某头部互联网公司',
      industry: '互联网',
      scale: '10,000+ 员工',
      challenge: '校招季数万简历筛选压力大，面试官协调困难，候选人等待时间长、体验差。',
      solution: '部署 AI 招聘助手与 AI 面试官，简历自动筛选 + 7×24 自动初面，HR 专注高价值环节。',
      results: [
        { value: '300%', label: 'HR 效率提升' },
        { value: '-40%', label: '招聘周期缩短' },
        { value: '+20%', label: 'Offer 接受率' },
      ],
      quote: 'TalentPro 的 AI 面试官彻底改变了我们的校招流程，候选人可以随时完成面试，我们的 HR 效率提升了 300%。',
      author: '王志远',
      title: '招聘负责人',
    },
    roi: [
      { metric: '招聘周期', value: '-40%', desc: '从 60 天缩短至 36 天' },
      { metric: 'HR 效率', value: '3x', desc: '人均处理简历量提升 3 倍' },
      { metric: '员工敬业度', value: '+15%', desc: '持续反馈机制提升敬业度' },
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
  government: {
    painPoints: [
      { title: '干部年轻化', desc: '中央要求加大年轻干部培养力度，但识别难、培养慢、通道窄。' },
      { title: '竞聘规范化', desc: '干部竞聘流程复杂，公平性要求高，人工组织效率低、透明度不足。' },
      { title: '校招规模大', desc: '年度校招人数多、流程长、合规要求高，传统方式难以支撑。' },
      { title: '三项制度改革', desc: '任期制、契约化管理、末等调整等政策落地需要系统支撑。' },
    ],
    architecture: [
      { title: '干部管理平台', desc: '干部信息库、任免审批、任期管理、民主测评，干部管理全流程数字化' },
      { title: '竞聘管理系统', desc: '职位发布、报名审核、在线笔试、面试答辩、结果公示，全程留痕可追溯' },
      { title: '年轻干部梯队', desc: '高潜识别、培养计划、轮岗跟踪、晋升评审，梯队建设系统化' },
      { title: '校招一体化', desc: '官网/公众号/宣讲会多端入口，AI 筛选 + 在线测评 + 电子签约' },
    ],
    roadmap: [
      { phase: '第 1 阶段', title: '干部信息数字化', desc: '6-8 周完成干部信息库建设，实现干部信息实时更新与查询' },
      { phase: '第 2 阶段', title: '竞聘流程线上化', desc: '8-12 周上线竞聘管理系统，实现竞聘全流程线上化、透明化' },
      { phase: '第 3 阶段', title: '梯队建设体系化', desc: '12-16 周建立年轻干部梯队培养体系，培养计划与晋升通道联动' },
      { phase: '第 4 阶段', title: '人才强企智能化', desc: '持续深化 AI 人才盘点、智能推荐、组织诊断等高级应用' },
    ],
    caseStudy: {
      client: '某大型央企集团',
      industry: '能源',
      scale: '50,000+ 员工',
      challenge: '年轻干部识别缺乏科学依据，竞聘流程手工操作，公平性受质疑，培养效果难评估。',
      solution: '部署 TalentPro 干部管理与竞聘系统，建立数字化干部档案，竞聘全流程线上留痕。',
      results: [
        { value: '95%', label: '竞聘流程透明度' },
        { value: '-50%', label: '竞聘组织时间' },
        { value: '+30%', label: '年轻干部晋升率' },
      ],
      quote: '竞聘系统让干部选拔更加公开透明，年轻干部的晋升通道也更加清晰，组织活力明显增强。',
      author: '陈建国',
      title: '集团 CHRO',
    },
    roi: [
      { metric: '竞聘效率', value: '2x', desc: '竞聘组织时间缩短 50%' },
      { metric: '干部覆盖率', value: '95%', desc: '关键岗位继任梯队覆盖率' },
      { metric: '合规风险', value: '-80%', desc: '全流程留痕，审计风险大幅降低' },
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
  finance: {
    painPoints: [
      { title: '合规监管严', desc: '银保监会、证监会监管要求多，人员资质、培训记录、合规考试缺一不可。' },
      { title: '校招质量要求高', desc: '金融管培生是Future高管来源，校招筛选标准高、流程长、竞争激烈。' },
      { title: '营销员管理难', desc: '保险/证券营销员数量大、流动高、产能差异大，精细化管理难度大。' },
      { title: '人才梯队断层', desc: '核心岗位后备人才不足，关键人才离职造成业务连续性风险。' },
    ],
    architecture: [
      { title: '合规培训中心', desc: '监管要求课程自动推送、学习进度跟踪、考试强制考核、证书到期预警' },
      { title: '精准校招平台', desc: '目标院校定向、AI 筛选、测评中心、AC 面，校招质量全流程把控' },
      { title: '营销员管理系统', desc: '增员、分层、产能分析、脱落预警，打造高产能营销队伍' },
      { title: '后备人才梯队', desc: '九宫格盘点、继任梯队、在库培养、晋升评审，关键岗位不断层' },
    ],
    roadmap: [
      { phase: '第 1 阶段', title: '合规培训上线', desc: '4-6 周完成合规培训课程体系与考试系统上线' },
      { phase: '第 2 阶段', title: '校招流程优化', desc: '6-10 周优化校招全流程，AI 筛选 + 测评中心赋能' },
      { phase: '第 3 阶段', title: '营销员管理', desc: '10-14 周上线营销员管理系统，分层分级精细管理' },
      { phase: '第 4 阶段', title: '全面人才强基', desc: '持续深化后备梯队、组织诊断、人才规划' },
    ],
    caseStudy: {
      client: '某大型保险公司',
      industry: '保险',
      scale: '100,000+ 营销员',
      challenge: '营销员年脱落率超 40%，增员成本高，高产能队伍难以复制，总部对一线掌控力弱。',
      solution: '部署 TalentPro 营销员管理系统，增员全流程线上化、分层培养、产能分析、脱落预警。',
      results: [
        { value: '-30%', label: '营销员脱落率' },
        { value: '+25%', label: '人均产能提升' },
        { value: '50%', label: '增员效率提升' },
      ],
      quote: '营销员管理系统让我们的增员效率提升了 50%，脱落率下降了 30%，人均产能提升了 25%。',
      author: '陈建国',
      title: '集团 CHRO',
    },
    roi: [
      { metric: '脱落率', value: '-30%', desc: '营销员年脱落率大幅下降' },
      { metric: '人均产能', value: '+25%', desc: '分层培养后产能显著提升' },
      { metric: '合规成本', value: '-40%', desc: '培训考试自动化，合规成本降低' },
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
};

const INDUSTRY_DETAILS_EN = {
  manufacturing: {
    painPoints: [
      { title: 'Labor Shortage', desc: 'Blue-collar hiring is difficult and turnover is high; traditional channels cannot keep up with production expansion.' },
      { title: 'Complex Attendance', desc: 'Multi-shift, multi-workshop, and cross-site attendance rules are error-prone when handled manually, causing payroll disputes.' },
      { title: 'Compliance Risk', desc: 'Special-operation certifications, safety training, and environmental compliance are hard to trace on paper, increasing audit risk.' },
      { title: 'Unclear Workforce Efficiency', desc: 'Without real-time workforce data, staffing decisions rely on intuition, leading to overtime and idle time coexistence.' },
    ],
    architecture: [
      { title: 'Blue-Collar Recruitment Platform', desc: 'Scan-to-onboard, bulk hiring, AI prescreening, and e-contracts digitize the full blue-collar hiring process.' },
      { title: 'Smart Attendance & Scheduling', desc: '5,000+ rule engine, AI-assisted scheduling, mobile clock-in, and automatic anomaly alerts.' },
      { title: 'Qualification Compliance Center', desc: 'Certification expiry reminders, online training agreements, and one-click compliance audit exports.' },
      { title: 'Shop Floor Workforce Dashboard', desc: 'Real-time attendance, productivity, and overtime warnings for data-driven lean management.' },
    ],
    roadmap: [
      { phase: 'Phase 1', title: 'Digitize Attendance & Payroll', desc: 'Configure attendance rules and go live with payroll in 2-4 weeks to solve the most urgent payroll challenge.' },
      { phase: 'Phase 2', title: 'Online Hiring & Onboarding', desc: 'Build blue-collar recruitment and onboarding flows in 4-8 weeks with scan-to-onboard and e-contracts.' },
      { phase: 'Phase 3', title: 'Visualize Workforce Analytics', desc: 'Launch workforce analytics dashboards in 8-12 weeks for real-time capacity-staffing matching and optimization.' },
      { phase: 'Phase 4', title: 'Full Intelligence', desc: 'Continuously iterate AI scheduling, turnover prediction, and talent pipeline applications.' },
    ],
    caseStudy: {
      client: 'A Leading Auto Parts Group',
      industry: 'Auto Parts',
      scale: '3,000+ Employees',
      challenge: 'Factories across three provinces and five cities used nearly 200 attendance rules; monthly payroll took 5 days and employee complaints were high.',
      solution: 'Deployed TalentPro attendance and payroll modules to unify national attendance rules, automate payroll, and enable mobile self-service.',
      results: [
        { value: '90%', label: 'Payroll Processing Time Reduced' },
        { value: '80%', label: 'Employee Complaints Reduced' },
        { value: '99.9%', label: 'Payroll Accuracy' },
      ],
      quote: 'TalentPro automatically handles nearly 200 attendance rules, cutting our monthly payroll processing from 5 days to half a day.',
      author: 'Sarah Li',
      title: 'HR Director',
    },
    roi: [
      { metric: 'Payroll Efficiency', value: '10x', desc: 'From 5 days to 0.5 days' },
      { metric: 'Hiring Cycle', value: '-40%', desc: 'Blue-collar hiring from 14 days to 8 days' },
      { metric: 'Compliance Risk', value: '-70%', desc: '100% certification expiry coverage' },
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
  retail: {
    painPoints: [
      { title: 'High Turnover', desc: 'Annual turnover exceeds 50%, driving up recruiting and training costs and affecting store operations.' },
      { title: 'Complex Scheduling', desc: 'Different store hours and fluctuating traffic make manual scheduling hard to balance compliance and productivity.' },
      { title: 'Slow Store Manager Development', desc: 'Store managers are critical but take long to develop; new stores often open without qualified leaders.' },
      { title: 'Multi-Store Control Difficulty', desc: 'Hundreds of stores across regions make it hard for headquarters to monitor workforce status and costs in real time.' },
    ],
    architecture: [
      { title: 'Store Recruitment Center', desc: 'Manager-led hiring with HQ approval, resume sharing, and bulk onboarding—5× recruiting efficiency.' },
      { title: 'Smart Scheduling Engine', desc: 'Forecast traffic-driven scheduling with more staff at peak times and fewer during lulls; automatic compliance checks.' },
      { title: 'Store Manager Development System', desc: 'Competency model, AI learning paths, and OJT tracking shorten store manager development by 30%.' },
      { title: 'Multi-Store Workforce Dashboard', desc: 'HQ monitors headcount, attendance, and costs in real time with automatic anomaly alerts.' },
    ],
    roadmap: [
      { phase: 'Phase 1', title: 'Core Stores Go Live', desc: 'Go live in 10 core stores in 4-6 weeks to establish standardized processes.' },
      { phase: 'Phase 2', title: 'Scaled Rollout', desc: 'Expand to 100 stores in 8-12 weeks with regional manager training and enablement.' },
      { phase: 'Phase 3', title: 'Full Coverage', desc: 'Cover all stores in 12-16 weeks and establish HQ-region-store three-tier control.' },
      { phase: 'Phase 4', title: 'Intelligent Optimization', desc: 'Continuously optimize AI scheduling, turnover prediction, and talent pools for optimal labor costs.' },
    ],
    caseStudy: {
      client: 'A Chain Restaurant Brand',
      industry: 'Restaurant Chain',
      scale: '500+ Stores',
      challenge: 'Peak-season expansion required large-scale blue-collar hiring; slow traditional processes delayed store openings.',
      solution: 'Deployed TalentPro recruiting and AI prescreening with bulk hiring, trial evaluation, and e-contracts in one flow.',
      results: [
        { value: '5x', label: 'Recruiting Efficiency Gain' },
        { value: '3 Days', label: 'New Store Staffing' },
        { value: '-50%', label: 'Recruiting Cost Reduction' },
      ],
      quote: 'Bulk hiring and AI prescreening increased our recruiting efficiency 5×—the business now moves at the speed of talent.',
      author: 'Alice Zhang',
      title: 'Talent Acquisition Director',
    },
    roi: [
      { metric: 'Recruiting Efficiency', value: '5x', desc: 'Resumes processed per person increased 5×' },
      { metric: 'Manager Development', value: '-30%', desc: 'Store manager development shortened from 6 to 4 months' },
      { metric: 'Productivity Gain', value: '+15%', desc: 'Productivity improved 15% after smart scheduling' },
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
  internet: {
    painPoints: [
      { title: 'Fierce Talent Competition', desc: 'Technical talent is scarce, hiring cycles are long, and poor candidate experience leads to high offer rejection.' },
      { title: 'Rapid Org Iteration', desc: 'Frequent team changes make performance reviews hard to keep up with business shifts and goal alignment difficult.' },
      { title: 'Young Workforce Management', desc: 'Gen Z and Millennials expect modern management; traditional approaches lower engagement.' },
      { title: 'Data-Driven HR Difficulty', desc: 'HR data is scattered and lacks real-time analytics, weakening business decision support.' },
    ],
    architecture: [
      { title: 'Agile Recruitment Platform', desc: 'Unified referrals, agencies, and channels with AI screening and structured interviews—40% shorter hiring cycles.' },
      { title: 'OKR Performance Engine', desc: 'Goal alignment maps, continuous feedback, and quarterly reviews for high-performance agile organizations.' },
      { title: 'Tech Talent Pipeline', desc: 'Technical competency models, coding assessments, and promotion reviews build a sustainable tech talent supply.' },
      { title: 'Workforce Data Cockpit', desc: 'Real-time efficiency, cost, and turnover analytics to support fast business decisions.' },
    ],
    roadmap: [
      { phase: 'Phase 1', title: 'Recruiting Efficiency', desc: 'Launch smart recruiting with AI screening and interview collaboration in 4-6 weeks.' },
      { phase: 'Phase 2', title: 'Performance Management', desc: 'Roll out OKR with goal alignment and continuous feedback in 8-10 weeks.' },
      { phase: 'Phase 3', title: 'Talent Development', desc: 'Build tech talent pipelines and transparent promotion paths in 10-14 weeks.' },
      { phase: 'Phase 4', title: 'Data Intelligence', desc: 'Deepen AI applications: turnover prediction, workforce planning, and organizational diagnostics.' },
    ],
    caseStudy: {
      client: 'A Leading Internet Company',
      industry: 'Internet',
      scale: '10,000+ Employees',
      challenge: 'Campus season brought tens of thousands of resumes, interviewer coordination was hard, and candidates waited too long.',
      solution: 'Deployed AI Recruiter and AI Interviewer for auto resume screening and 24/7 first-round interviews, letting HR focus on high-value steps.',
      results: [
        { value: '300%', label: 'HR Efficiency Gain' },
        { value: '-40%', label: 'Hiring Cycle Shortened' },
        { value: '+20%', label: 'Offer Acceptance Rate' },
      ],
      quote: 'TalentPro\'s AI Interviewer completely transformed our campus recruiting. Candidates interview anytime, and HR efficiency rose 300%.',
      author: 'David Wang',
      title: 'Head of Recruiting',
    },
    roi: [
      { metric: 'Hiring Cycle', value: '-40%', desc: 'From 60 days to 36 days' },
      { metric: 'HR Efficiency', value: '3x', desc: 'Resumes processed per person tripled' },
      { metric: 'Engagement', value: '+15%', desc: 'Continuous feedback improved engagement' },
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
  government: {
    painPoints: [
      { title: 'Cadre Rejuvenation', desc: 'Central policy calls for more young cadre development, but identification, cultivation, and pathways are limited.' },
      { title: 'Competition Standardization', desc: 'Cadre competitions are complex and fairness-sensitive; manual organization is inefficient and lacks transparency.' },
      { title: 'Large Campus Hiring Scale', desc: 'Annual campus hiring involves large volumes, long processes, and high compliance requirements.' },
      { title: 'Three-System Reform', desc: 'Term-based appointments, contract management, and bottom-tier adjustments need system support.' },
    ],
    architecture: [
      { title: 'Cadre Management Platform', desc: 'Cadre information database, appointment approval, term management, and democratic assessment—fully digitalized.' },
      { title: 'Competition Management System', desc: 'Position publishing, application review, online exams, interviews, and transparent results with full audit trails.' },
      { title: 'Young Cadre Pipeline', desc: 'High-potential identification, development plans, rotation tracking, and promotion reviews systematized.' },
      { title: 'Integrated Campus Recruiting', desc: 'Multi-channel entry points with AI screening, online assessments, and e-contracts.' },
    ],
    roadmap: [
      { phase: 'Phase 1', title: 'Digitalize Cadre Information', desc: 'Build the cadre information database in 6-8 weeks for real-time updates and queries.' },
      { phase: 'Phase 2', title: 'Online Competition Process', desc: 'Launch the competition management system in 8-12 weeks for full online transparency.' },
      { phase: 'Phase 3', title: 'Systematic Pipeline Development', desc: 'Establish young cadre development programs linked to promotion paths in 12-16 weeks.' },
      { phase: 'Phase 4', title: 'Intelligent Talent Strategy', desc: 'Deepen AI talent reviews, smart recommendations, and organizational diagnostics.' },
    ],
    caseStudy: {
      client: 'A Large Central SOE Group',
      industry: 'Energy',
      scale: '50,000+ Employees',
      challenge: 'Young cadre identification lacked scientific basis, competitions were manual and questioned for fairness, and development results were hard to evaluate.',
      solution: 'Deployed TalentPro cadre management and competition systems to build digital cadre files and full online audit trails.',
      results: [
        { value: '95%', label: 'Competition Transparency' },
        { value: '-50%', label: 'Competition Organization Time' },
        { value: '+30%', label: 'Young Cadre Promotion Rate' },
      ],
      quote: 'The competition system makes cadre selection more open and transparent, and young cadres now have clearer promotion pathways.',
      author: 'James Chen',
      title: 'Group CHRO',
    },
    roi: [
      { metric: 'Competition Efficiency', value: '2x', desc: 'Competition organization time shortened by 50%' },
      { metric: 'Cadre Coverage', value: '95%', desc: 'Key-position succession pipeline coverage' },
      { metric: 'Compliance Risk', value: '-80%', desc: 'Full audit trails greatly reduce audit risk' },
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
  finance: {
    painPoints: [
      { title: 'Strict Regulation', desc: 'Banking and securities regulators require certifications, training records, and compliance exams.' },
      { title: 'High Campus Hiring Standards', desc: 'Management trainees are future executives; campus hiring has high standards, long processes, and fierce competition.' },
      { title: 'Agent Management Difficulty', desc: 'Insurance and securities agents are numerous, high-turnover, and vary widely in productivity.' },
      { title: 'Talent Pipeline Gaps', desc: 'Core positions lack successors, creating business continuity risks when key talent leaves.' },
    ],
    architecture: [
      { title: 'Compliance Training Center', desc: 'Auto-push regulatory courses, track learning progress, enforce exams, and warn of certificate expiry.' },
      { title: 'Precision Campus Hiring Platform', desc: 'Target-school focus, AI screening, assessment centers, and AC interviews for full quality control.' },
      { title: 'Agent Management System', desc: 'Recruitment, tiering, productivity analysis, and attrition warnings to build high-productivity teams.' },
      { title: 'Succession Talent Pipeline', desc: '9-box reviews, succession pools, in-pipeline development, and promotion reviews keep key roles covered.' },
    ],
    roadmap: [
      { phase: 'Phase 1', title: 'Launch Compliance Training', desc: 'Go live with compliance course system and exams in 4-6 weeks.' },
      { phase: 'Phase 2', title: 'Optimize Campus Hiring', desc: 'Optimize full campus hiring flow with AI screening and assessment centers in 6-10 weeks.' },
      { phase: 'Phase 3', title: 'Agent Management', desc: 'Launch agent management system with tiered, granular management in 10-14 weeks.' },
      { phase: 'Phase 4', title: 'Full Talent Foundation', desc: 'Deepen succession pools, organizational diagnostics, and workforce planning.' },
    ],
    caseStudy: {
      client: 'A Large Insurance Company',
      industry: 'Insurance',
      scale: '100,000+ Agents',
      challenge: 'Annual agent attrition exceeded 40%, recruitment costs were high, high-productivity teams were hard to replicate, and HQ had weak frontline control.',
      solution: 'Deployed TalentPro agent management system with online recruitment, tiered development, productivity analysis, and attrition warnings.',
      results: [
        { value: '-30%', label: 'Agent Attrition' },
        { value: '+25%', label: 'Productivity per Agent' },
        { value: '50%', label: 'Recruiting Efficiency Gain' },
      ],
      quote: 'The agent management system increased our recruiting efficiency by 50%, reduced attrition by 30%, and lifted per-agent productivity by 25%.',
      author: 'James Chen',
      title: 'Group CHRO',
    },
    roi: [
      { metric: 'Attrition', value: '-30%', desc: 'Annual agent attrition dropped significantly' },
      { metric: 'Productivity', value: '+25%', desc: 'Productivity significantly improved after tiered development' },
      { metric: 'Compliance Cost', value: '-40%', desc: 'Automated training and exams reduced compliance costs' },
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
};

export function getIndustryDetails(locale?: string) {
  if (locale === 'en') return INDUSTRY_DETAILS_EN;
  return INDUSTRY_DETAILS_ZH;
}

/** 兼容旧直接引用：默认中文 */
export const INDUSTRY_DETAILS = INDUSTRY_DETAILS_ZH;
