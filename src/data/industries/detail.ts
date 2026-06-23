export const INDUSTRY_DETAILS = {
  manufacturing: {
    painPoints: [
      {
        title: '劳动力短缺',
        desc: '蓝领工人招聘难、流失率高，传统招聘渠道效率低，无法满足产能扩张需求。',
      },
      {
        title: '考勤复杂',
        desc: '多班次、多车间、跨厂区的复杂考勤规则，人工处理易出错，薪资纠纷频发。',
      },
      {
        title: '合规风险',
        desc: '特种作业资质、安全生产培训、环保合规等要求多，纸质管理难追溯，审计风险大。',
      },
      {
        title: '人效不透明',
        desc: '缺乏实时人力数据，产能与人力匹配靠经验，加班与闲置并存，人力成本居高不下。',
      },
    ],
    architecture: [
      {
        title: '蓝领招聘平台',
        desc: '扫码入职、批量招聘、AI 初筛、电子合同，蓝领招聘全流程数字化',
      },
      {
        title: '智能考勤排班',
        desc: '5000+ 规则引擎、AI 辅助排班、移动端打卡、异常自动预警',
      },
      {
        title: '资质合规中心',
        desc: '资质到期提醒、培训协议在线签署、合规审计一键导出',
      },
      {
        title: '车间人力看板',
        desc: '实时出勤、产能人效、加班预警，数据驱动精益管理',
      },
    ],
    roadmap: [
      {
        phase: '第 1 阶段',
        title: '考勤薪酬数字化',
        desc: '2-4 周完成考勤规则配置与薪酬核算上线，解决最迫切的算薪难题',
      },
      {
        phase: '第 2 阶段',
        title: '招聘入职线上化',
        desc: '4-8 周搭建蓝领招聘与入职流程，实现扫码入职、电子合同',
      },
      {
        phase: '第 3 阶段',
        title: '人效分析可视化',
        desc: '8-12 周上线人力分析看板，实现产能与人力的实时匹配与优化',
      },
      {
        phase: '第 4 阶段',
        title: '全面智能化',
        desc: '持续迭代 AI 排班、离职预测、人才梯队等高级应用',
      },
    ],
    caseStudy: {
      client: '某汽车零部件集团',
      industry: '汽车零部件',
      scale: '3,000+ 员工',
      challenge: '工厂分布三省五市，考勤规则近 200 种，每月薪资核算需 5 天，员工投诉率高。',
      solution: '部署 TalentPro 考勤与薪酬模块，统一全国考勤规则，自动化算薪，移动端自助查询。',
      results: [
        {
          value: '90%',
          label: '薪资核算时间缩短',
        },
        {
          value: '80%',
          label: '员工投诉率下降',
        },
        {
          value: '99.9%',
          label: '算薪准确率',
        },
      ],
      quote: 'TalentPro 帮我们自动处理了近 200 种考勤规则，每个月薪资核算时间从 5 天缩短到了半天。',
      author: '李秀华',
      title: '人力资源总监',
    },
    roi: [
      {
        metric: '算薪效率',
        value: '10x',
        desc: '从 5 天缩短至 0.5 天',
      },
      {
        metric: '招聘周期',
        value: '-40%',
        desc: '蓝领招聘从 14 天缩短至 8 天',
      },
      {
        metric: '合规风险',
        value: '-70%',
        desc: '资质到期预警覆盖 100%',
      },
    ],
    stats: [
      {
        value: '5000+',
        label: '考勤规则支持',
      },
      {
        value: '200+',
        label: '制造客户',
      },
      {
        value: '99.9%',
        label: '算薪准确率',
      },
      {
        value: '< 1s',
        label: '打卡响应',
      },
    ],
    screenshot: {
      title: '制造业 · 车间考勤看板',
      type: 'table',
      rows: [
        {
          name: '张三',
          shift: '早班',
          time: '08:01',
          status: 'green',
          label: '正常',
        },
        {
          name: '李四',
          shift: '早班',
          time: '08:03',
          status: 'green',
          label: '正常',
        },
        {
          name: '王五',
          shift: '中班',
          time: '—',
          status: 'orange',
          label: '待打卡',
        },
        {
          name: '赵六',
          shift: '夜班',
          time: '20:00',
          status: 'blue',
          label: '已排班',
        },
      ],
      tip: '张三焊工资质将于 30 天后到期，请及时安排复训',
    },
  },
  retail: {
    painPoints: [
      {
        title: '人员流动高',
        desc: '零售行业年流动率超 50%，招聘与培训成本居高不下，门店运营受影响。',
      },
      {
        title: '排班复杂',
        desc: '门店营业时间不同、客流量波动大，手工排班难以兼顾合规与人效。',
      },
      {
        title: '店长培养慢',
        desc: '店长是门店核心，但培养周期长，新店开业常面临无人可用的困境。',
      },
      {
        title: '多店管控难',
        desc: '数百家门店分布各地，总部难以实时掌握各店人力状况与成本。',
      },
    ],
    architecture: [
      {
        title: '门店招聘中心',
        desc: '店长自主招聘、总部审批、简历共享、批量入职，招聘效率提升 5 倍',
      },
      {
        title: '智能排班引擎',
        desc: '按客流量预测排班，忙时多配人、闲时少排班，工时合规自动校验',
      },
      {
        title: '店长培养体系',
        desc: '店长能力模型、AI 学习路径、OJT 带教跟踪，缩短店长培养周期 30%',
      },
      {
        title: '多店人力看板',
        desc: '总部实时查看各店编制、出勤、成本，异常自动预警',
      },
    ],
    roadmap: [
      {
        phase: '第 1 阶段',
        title: '核心门店上线',
        desc: '4-6 周完成 10 家核心门店系统上线，建立标准化流程',
      },
      {
        phase: '第 2 阶段',
        title: '批量推广',
        desc: '8-12 周扩展至 100 家门店，区域经理培训与赋能',
      },
      {
        phase: '第 3 阶段',
        title: '全面覆盖',
        desc: '12-16 周覆盖全部门店，建立总部-区域-门店三级管控体系',
      },
      {
        phase: '第 4 阶段',
        title: '智能优化',
        desc: '持续优化 AI 排班、离职预测、人才池，实现人力成本最优',
      },
    ],
    caseStudy: {
      client: '某连锁餐饮品牌',
      industry: '餐饮连锁',
      scale: '500+ 门店',
      challenge: '旺季门店扩张，每次大规模招聘蓝领员工，传统流程慢，门店等人才影响开业。',
      solution: '部署 TalentPro 招聘系统与 AI 初筛，批量招聘 + 试工评价 + 电子合同一站式完成。',
      results: [
        {
          value: '5x',
          label: '招聘效率提升',
        },
        {
          value: '3 天',
          label: '新店人员到位',
        },
        {
          value: '-50%',
          label: '招聘成本降低',
        },
      ],
      quote: '批量招聘和 AI 初筛功能，让我们的招聘效率提升了 5 倍，真正实现了让业务等人才而不是人才等流程。',
      author: '张明月',
      title: '人才招募总监',
    },
    roi: [
      {
        metric: '招聘效率',
        value: '5x',
        desc: '人均处理简历量提升 5 倍',
      },
      {
        metric: '店长培养',
        value: '-30%',
        desc: '店长培养周期从 6 个月缩短至 4 个月',
      },
      {
        metric: '人效提升',
        value: '+15%',
        desc: '智能排班后人效提升 15%',
      },
    ],
    stats: [
      {
        value: '500+',
        label: '门店统一管控',
      },
      {
        value: '50+',
        label: '零售品牌客户',
      },
      {
        value: '3 天',
        label: '新店人员到位',
      },
      {
        value: '15%',
        label: '人效提升',
      },
    ],
    screenshot: {
      title: '零售 · 门店管理看板',
      type: 'metrics',
      metrics: [
        {
          value: '47',
          label: '待面试候选人',
          color: 'var(--primary)',
        },
        {
          value: '12',
          label: '本月新入职',
          color: 'var(--success)',
        },
        {
          value: '8',
          label: '今日培训人数',
          color: 'var(--ai-purple)',
        },
        {
          value: '96%',
          label: '出勤完成率',
          color: '#F59E0B',
        },
      ],
    },
  },
  internet: {
    painPoints: [
      {
        title: '人才争夺激烈',
        desc: '技术人才稀缺，招聘周期长，候选人体验不佳导致 Offer 拒绝率高。',
      },
      {
        title: '组织迭代快',
        desc: '团队调整频繁，绩效考核难以跟上业务变化，目标对齐困难。',
      },
      {
        title: '年轻化管理',
        desc: '90/00 后员工占比高，传统管理模式不适用，员工敬业度下降。',
      },
      {
        title: '数据驱动难',
        desc: 'HR 数据分散，缺乏实时分析能力，无法为业务决策提供有效支撑。',
      },
    ],
    architecture: [
      {
        title: '敏捷招聘平台',
        desc: '内推、猎头、渠道统一管理，AI 筛选 + 结构化面试，缩短招聘周期 40%',
      },
      {
        title: 'OKR 绩效引擎',
        desc: '目标对齐地图、持续反馈、季度复盘，打造高绩效敏捷组织',
      },
      {
        title: '技术人才梯队',
        desc: '技术能力模型、代码测评、晋升评审，构建可持续技术人才供应链',
      },
      {
        title: '人力数据驾驶舱',
        desc: '实时人力效能、成本、流动分析，支撑业务快速决策',
      },
    ],
    roadmap: [
      {
        phase: '第 1 阶段',
        title: '招聘提效',
        desc: '4-6 周上线智能招聘，AI 筛选 + 面试协同，缩短招聘周期',
      },
      {
        phase: '第 2 阶段',
        title: '绩效管理',
        desc: '8-10 周推行 OKR，目标对齐与持续反馈，提升组织敏捷度',
      },
      {
        phase: '第 3 阶段',
        title: '人才发展',
        desc: '10-14 周建立技术人才梯队，晋升通道透明化',
      },
      {
        phase: '第 4 阶段',
        title: '数据智能',
        desc: '持续深化 AI 应用，离职预测、人力规划、组织诊断',
      },
    ],
    caseStudy: {
      client: '某头部互联网公司',
      industry: '互联网',
      scale: '10,000+ 员工',
      challenge: '校招季数万简历筛选压力大，面试官协调困难，候选人等待时间长、体验差。',
      solution: '部署 AI 招聘助手与 AI 面试官，简历自动筛选 + 7×24 自动初面，HR 专注高价值环节。',
      results: [
        {
          value: '300%',
          label: 'HR 效率提升',
        },
        {
          value: '-40%',
          label: '招聘周期缩短',
        },
        {
          value: '+20%',
          label: 'Offer 接受率',
        },
      ],
      quote: 'TalentPro 的 AI 面试官彻底改变了我们的校招流程，候选人可以随时完成面试，我们的 HR 效率提升了 300%。',
      author: '王志远',
      title: '招聘负责人',
    },
    roi: [
      {
        metric: '招聘周期',
        value: '-40%',
        desc: '从 60 天缩短至 36 天',
      },
      {
        metric: 'HR 效率',
        value: '3x',
        desc: '人均处理简历量提升 3 倍',
      },
      {
        metric: '员工敬业度',
        value: '+15%',
        desc: '持续反馈机制提升敬业度',
      },
    ],
    stats: [
      {
        value: '10,000+',
        label: '并发面试',
      },
      {
        value: '100+',
        label: '互联网客户',
      },
      {
        value: '40%',
        label: '周期缩短',
      },
      {
        value: '92%',
        label: 'AI 匹配准确率',
      },
    ],
    screenshot: {
      title: '互联网 · HRBP 工作台',
      type: 'tasks',
      tasks: [
        {
          text: '张总 需要复核绩效评分',
          status: '待处理',
          statusColor: 'var(--primary)',
        },
        {
          text: '研发部 3 名员工转正申请',
          status: '审批中',
          statusColor: 'var(--success)',
        },
        {
          text: 'P9 候选人背调报告已就绪',
          status: '待查看',
          statusColor: '#F59E0B',
        },
        {
          text: 'Q2 OKR 对齐会议待确认',
          status: '待处理',
          statusColor: 'var(--primary)',
        },
      ],
    },
  },
  government: {
    painPoints: [
      {
        title: '干部年轻化',
        desc: '中央要求加大年轻干部培养力度，但识别难、培养慢、通道窄。',
      },
      {
        title: '竞聘规范化',
        desc: '干部竞聘流程复杂，公平性要求高，人工组织效率低、透明度不足。',
      },
      {
        title: '校招规模大',
        desc: '年度校招人数多、流程长、合规要求高，传统方式难以支撑。',
      },
      {
        title: '三项制度改革',
        desc: '任期制、契约化管理、末等调整等政策落地需要系统支撑。',
      },
    ],
    architecture: [
      {
        title: '干部管理平台',
        desc: '干部信息库、任免审批、任期管理、民主测评，干部管理全流程数字化',
      },
      {
        title: '竞聘管理系统',
        desc: '职位发布、报名审核、在线笔试、面试答辩、结果公示，全程留痕可追溯',
      },
      {
        title: '年轻干部梯队',
        desc: '高潜识别、培养计划、轮岗跟踪、晋升评审，梯队建设系统化',
      },
      {
        title: '校招一体化',
        desc: '官网/公众号/宣讲会多端入口，AI 筛选 + 在线测评 + 电子签约',
      },
    ],
    roadmap: [
      {
        phase: '第 1 阶段',
        title: '干部信息数字化',
        desc: '6-8 周完成干部信息库建设，实现干部信息实时更新与查询',
      },
      {
        phase: '第 2 阶段',
        title: '竞聘流程线上化',
        desc: '8-12 周上线竞聘管理系统，实现竞聘全流程线上化、透明化',
      },
      {
        phase: '第 3 阶段',
        title: '梯队建设体系化',
        desc: '12-16 周建立年轻干部梯队培养体系，培养计划与晋升通道联动',
      },
      {
        phase: '第 4 阶段',
        title: '人才强企智能化',
        desc: '持续深化 AI 人才盘点、智能推荐、组织诊断等高级应用',
      },
    ],
    caseStudy: {
      client: '某大型央企集团',
      industry: '能源',
      scale: '50,000+ 员工',
      challenge: '年轻干部识别缺乏科学依据，竞聘流程手工操作，公平性受质疑，培养效果难评估。',
      solution: '部署 TalentPro 干部管理与竞聘系统，建立数字化干部档案，竞聘全流程线上留痕。',
      results: [
        {
          value: '95%',
          label: '竞聘流程透明度',
        },
        {
          value: '-50%',
          label: '竞聘组织时间',
        },
        {
          value: '+30%',
          label: '年轻干部晋升率',
        },
      ],
      quote: '竞聘系统让干部选拔更加公开透明，年轻干部的晋升通道也更加清晰，组织活力明显增强。',
      author: '陈建国',
      title: '集团 CHRO',
    },
    roi: [
      {
        metric: '竞聘效率',
        value: '2x',
        desc: '竞聘组织时间缩短 50%',
      },
      {
        metric: '干部覆盖率',
        value: '95%',
        desc: '关键岗位继任梯队覆盖率',
      },
      {
        metric: '合规风险',
        value: '-80%',
        desc: '全流程留痕，审计风险大幅降低',
      },
    ],
    stats: [
      {
        value: '50+',
        label: '央企客户',
      },
      {
        value: '100%',
        label: '竞聘留痕',
      },
      {
        value: '5 级',
        label: '干部梯队',
      },
      {
        value: '99.9%',
        label: '系统可用性',
      },
    ],
    screenshot: {
      title: '央国企 · 干部竞聘流程',
      type: 'timeline',
      steps: [
        {
          icon: 'megaphone',
          label: '发布职位',
          desc: '干部职位公开发布',
        },
        {
          icon: 'file-text',
          label: '报名申请',
          desc: '在线资格初审',
        },
        {
          icon: 'clipboard-list',
          label: '笔试考核',
          desc: '线上标准化测评',
        },
        {
          icon: 'mic',
          label: '面试答辩',
          desc: '专家评委打分',
        },
        {
          icon: 'check-circle',
          label: '公示任命',
          desc: '结果公开透明',
        },
      ],
    },
  },
  finance: {
    painPoints: [
      {
        title: '合规监管严',
        desc: '银保监会、证监会监管要求多，人员资质、培训记录、合规考试缺一不可。',
      },
      {
        title: '校招质量要求高',
        desc: '金融管培生是Future高管来源，校招筛选标准高、流程长、竞争激烈。',
      },
      {
        title: '营销员管理难',
        desc: '保险/证券营销员数量大、流动高、产能差异大，精细化管理难度大。',
      },
      {
        title: '人才梯队断层',
        desc: '核心岗位后备人才不足，关键人才离职造成业务连续性风险。',
      },
    ],
    architecture: [
      {
        title: '合规培训中心',
        desc: '监管要求课程自动推送、学习进度跟踪、考试强制考核、证书到期预警',
      },
      {
        title: '精准校招平台',
        desc: '目标院校定向、AI 筛选、测评中心、AC 面，校招质量全流程把控',
      },
      {
        title: '营销员管理系统',
        desc: '增员、分层、产能分析、脱落预警，打造高产能营销队伍',
      },
      {
        title: '后备人才梯队',
        desc: '九宫格盘点、继任梯队、在库培养、晋升评审，关键岗位不断层',
      },
    ],
    roadmap: [
      {
        phase: '第 1 阶段',
        title: '合规培训上线',
        desc: '4-6 周完成合规培训课程体系与考试系统上线',
      },
      {
        phase: '第 2 阶段',
        title: '校招流程优化',
        desc: '6-10 周优化校招全流程，AI 筛选 + 测评中心赋能',
      },
      {
        phase: '第 3 阶段',
        title: '营销员管理',
        desc: '10-14 周上线营销员管理系统，分层分级精细管理',
      },
      {
        phase: '第 4 阶段',
        title: '全面人才强基',
        desc: '持续深化后备梯队、组织诊断、人才规划',
      },
    ],
    caseStudy: {
      client: '某大型保险公司',
      industry: '保险',
      scale: '100,000+ 营销员',
      challenge: '营销员年脱落率超 40%，增员成本高，高产能队伍难以复制，总部对一线掌控力弱。',
      solution: '部署 TalentPro 营销员管理系统，增员全流程线上化、分层培养、产能分析、脱落预警。',
      results: [
        {
          value: '-30%',
          label: '营销员脱落率',
        },
        {
          value: '+25%',
          label: '人均产能提升',
        },
        {
          value: '50%',
          label: '增员效率提升',
        },
      ],
      quote: '营销员管理系统让我们的增员效率提升了 50%，脱落率下降了 30%，人均产能提升了 25%。',
      author: '陈建国',
      title: '集团 CHRO',
    },
    roi: [
      {
        metric: '脱落率',
        value: '-30%',
        desc: '营销员年脱落率大幅下降',
      },
      {
        metric: '人均产能',
        value: '+25%',
        desc: '分层培养后产能显著提升',
      },
      {
        metric: '合规成本',
        value: '-40%',
        desc: '培训考试自动化，合规成本降低',
      },
    ],
    stats: [
      {
        value: '30+',
        label: '金融机构客户',
      },
      {
        value: '100%',
        label: '合规培训覆盖',
      },
      {
        value: '99.9%',
        label: '系统可用性',
      },
      {
        value: '等保三级',
        label: '安全认证',
      },
    ],
    screenshot: {
      title: '金融 · 九宫格人才盘点',
      type: 'grid9',
      cells: [
        {
          label: '高潜',
          bg: '#FEE2E2',
          color: '#EF4444',
          count: 4,
        },
        {
          label: '明星',
          bg: '#DCFCE7',
          color: '#16A34A',
          count: 7,
        },
        {
          label: '超级',
          bg: '#DCFCE7',
          color: '#16A34A',
          count: 3,
        },
        {
          label: '问题',
          bg: '#FEF9C3',
          color: '#CA8A04',
          count: 12,
        },
        {
          label: '核心',
          bg: '#DBEAFE',
          color: '#2563EB',
          count: 18,
        },
        {
          label: '关键',
          bg: '#DCFCE7',
          color: '#16A34A',
          count: 9,
        },
        {
          label: '待转型',
          bg: '#F3F4F6',
          color: '#6B7280',
          count: 8,
        },
        {
          label: '稳健',
          bg: '#F3F4F6',
          color: '#6B7280',
          count: 15,
        },
        {
          label: '资深',
          bg: '#DBEAFE',
          color: '#2563EB',
          count: 11,
        },
      ],
    },
  },
};
