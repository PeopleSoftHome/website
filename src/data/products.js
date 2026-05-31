import {
  IconRecruit, IconPerformance, IconOrg, IconAttendance,
  IconPayroll, IconLearning, IconTalent, IconAnalytics,
  IconAIRecruit, IconAIInterview, IconAICoach, IconAICourse,
  IconAssessRecruit, IconAssess360, IconAssessExam, IconAssessModel,
  IconLowCode, IconAPI, IconEco, IconSecurity,
  ICON_COLORS, ICON_BG_COLORS,
} from '../components/ui/ProductIcons/index.js';

/**
 * 产品矩阵数据（SEC-05 ProductMatrixSection）
 * v3.0.0：扩展二级页面字段：features / scenarios / testimonial / specs / related
 */
export const PRODUCT_TABS = [
  {
    id: 'hr-saas',
    label: '一体化 HR SaaS',
    iconColor: ICON_COLORS['hr-saas'],
    iconBg:    ICON_BG_COLORS['hr-saas'],
    products: [
      {
        id: 'recruit', slug: 'recruit', icon: IconRecruit,
        name: '招聘管理系统', tagline: '全流程数字化招聘，提升人才获取效率',
        desc: '覆盖校招社招全场景，从需求提报到 Offer 发放，实现招聘全流程数字化管理。AI 智能筛选、自动化面试安排、数据化招聘分析，让招聘效率提升 3 倍。',
        features: [
          { title: '智能简历解析', desc: 'AI 自动解析 50+ 格式简历，提取关键信息并匹配岗位 JD，初筛效率提升 80%' },
          { title: '全渠道管理', desc: '统一接入主流招聘网站、内推、猎头渠道，简历自动汇聚、去重、归类' },
          { title: '面试协同', desc: '面试官与候选人自动匹配时间，支持视频面试集成，反馈实时同步' },
          { title: '招聘数据分析', desc: '漏斗转化、渠道 ROI、招聘周期等多维报表，驱动科学决策' },
        ],
        scenarios: [
          { title: '校园招聘', desc: '万人级简历批量处理，AI 初面 + 批量 Offer，校招周期缩短 40%' },
          { title: '社会招聘', desc: '高端人才定向猎寻，全流程协同，提升候选人体验与 Offer 接受率' },
          { title: '门店招聘', desc: '蓝领批量入职，扫码报名、试工评价、电子合同一站式完成' },
        ],
        testimonial: {
          quote: 'TalentPro 招聘系统让我们的招聘周期从 45 天缩短到 28 天，HR 团队人均处理简历量提升了 3 倍。',
          author: '张明月', title: '人才招募总监', company: '某连锁餐饮品牌',
        },
        specs: [
          { label: '对接渠道', value: '50+' },
          { label: '简历解析速度', value: '< 3s/份' },
          { label: '支持语言', value: '中英日韩' },
          { label: '并发面试', value: '10,000+' },
        ],
        related: ['ai-recruit', 'ai-interview', 'assess-recruit'],
      },
      {
        id: 'performance', slug: 'performance', icon: IconPerformance,
        name: '绩效管理系统', tagline: '目标对齐、绩效驱动，激发组织活力',
        desc: '支持 OKR、KPI、BSC、360° 等多种绩效模式，从目标设定、过程跟踪到结果评估，打造持续高绩效组织。',
        features: [
          { title: '多模式支持', desc: 'OKR、KPI、BSC、360°、MBO 等主流绩效模式灵活配置' },
          { title: '目标对齐', desc: '组织目标逐层分解至个人，可视化对齐地图确保方向一致' },
          { title: '过程跟踪', desc: '季度/月度复盘提醒，进度看板实时掌握目标达成情况' },
          { title: '绩效校准', desc: '强制分布、校准会议、多维度排名，确保评估公平客观' },
        ],
        scenarios: [
          { title: '互联网敏捷团队', desc: 'OKR + 持续反馈，快速迭代对齐业务目标' },
          { title: '制造业精益管理', desc: 'KPI + 产量质量挂钩，绩效与产出强关联' },
          { title: '国企干部考核', desc: '360° + 民主测评，多维度评价干部表现' },
        ],
        testimonial: {
          quote: '绩效管理从一年一次的考核变成了持续对话的工具，员工敬业度调查提升了 15 个百分点。',
          author: '王志远', title: 'HRD', company: '某头部互联网公司',
        },
        specs: [
          { label: '支持模式', value: '8+' },
          { label: '目标层级', value: '无限级' },
          { label: '评估周期', value: '自定义' },
          { label: '报表维度', value: '30+' },
        ],
        related: ['org', 'analytics', 'ai-coach'],
      },
      {
        id: 'org', slug: 'org', icon: IconOrg,
        name: '组织人事系统', tagline: '集团化组织管控，支撑战略扩张',
        desc: '多法人、多区域、多业态的集团化人事管理平台，支持复杂的组织架构、编制管控、人员异动与合规管理。',
        features: [
          { title: '多维组织', desc: '行政架构、项目架构、矩阵架构并存，灵活适应业务变化' },
          { title: '编制管控', desc: '总部-区域-门店多级编制，超编预警，成本实时把控' },
          { title: '全生命周期', desc: '入转调离全流程线上化，电子合同、电子档案合规存证' },
          { title: '全球化支持', desc: '多语言、多币种、多时区、各国劳动法合规模板' },
        ],
        scenarios: [
          { title: '集团化管控', desc: '100+ 子公司统一人事平台，数据实时汇总，决策有据可依' },
          { title: '跨国运营', desc: '中企出海，海外员工本地化合规管理，全球薪酬统一视图' },
          { title: '并购整合', desc: '快速接入被并购企业人事数据，组织合并与人员划转平滑过渡' },
        ],
        testimonial: {
          quote: '并购三家公司后，我们用 TalentPro 在两周内完成了 3000 人的人事数据整合，效率惊人。',
          author: '李秀华', title: '人力资源总监', company: '某汽车零部件集团',
        },
        specs: [
          { label: '组织层级', value: '无限' },
          { label: '法人实体', value: '1,000+' },
          { label: '支持国家', value: '80+' },
          { label: '合同模板', value: '200+' },
        ],
        related: ['payroll', 'attendance', 'talent'],
      },
      {
        id: 'attendance', slug: 'attendance', icon: IconAttendance,
        name: '假勤管理系统', tagline: '智能排班，自动考勤，合规高效',
        desc: '应对复杂考勤场景，5000+ 考勤规则自动处理，移动端即时排班，大幅提升生产效率与员工满意度。',
        features: [
          { title: '智能排班', desc: 'AI 辅助排班，考虑技能、工时、合规，一键生成最优方案' },
          { title: '多种考勤', desc: 'GPS、WiFi、人脸识别、蓝牙 Beacon，满足不同场景打卡需求' },
          { title: '假期管理', desc: '法定假期、企业福利假、加班调休自动计算，余额实时可查' },
          { title: '异常处理', desc: '考勤异常自动推送，员工手机端申诉，主管一键审批' },
        ],
        scenarios: [
          { title: '制造业三班倒', desc: '早中晚班智能轮换，工时合规预警，月报自动生成' },
          { title: '零售弹性排班', desc: '按客流量预测排班，忙时多配人，闲时少排班，人效最优' },
          { title: '远程办公考勤', desc: '居家办公打卡、工时统计、产出关联，管理不脱节' },
        ],
        testimonial: {
          quote: '3000 名员工的 200 种考勤规则全部自动化处理，薪资核算从 5 天缩短到半天。',
          author: '李秀华', title: '人力资源总监', company: '某汽车零部件集团',
        },
        specs: [
          { label: '考勤规则', value: '5,000+' },
          { label: '打卡方式', value: '8+' },
          { label: '排班维度', value: '20+' },
          { label: '实时同步', value: '< 1s' },
        ],
        related: ['payroll', 'org', 'analytics'],
      },
      {
        id: 'payroll', slug: 'payroll', icon: IconPayroll,
        name: '薪酬管理系统', tagline: '精准薪酬，自动核算，合规无忧',
        desc: '支持多种薪酬架构与复杂算薪规则，个税社保自动计算，银行直连发放，让薪酬管理高效准确。',
        features: [
          { title: '复杂算薪', desc: '支持计时、计件、提成、奖金、股权等 20+ 薪酬模式' },
          { title: '个税社保', desc: '全国 300+ 城市个税社保政策实时更新，自动计算申报' },
          { title: '成本分析', desc: '人力成本多维度拆分，部门/项目/岗位成本一目了然' },
          { title: '安全发放', desc: '银行直连加密发放，电子工资条推送，发放记录可追溯' },
        ],
        scenarios: [
          { title: '制造业计件工资', desc: '产量数据自动对接 ERP，计件工资实时核算，月底零差错' },
          { title: '销售提成核算', desc: '多层级提成规则配置，业绩数据自动同步，提成即时可见' },
          { title: '跨国薪酬管理', desc: '多币种薪酬、汇率自动更新、各国税务合规申报' },
        ],
        testimonial: {
          quote: '薪酬核算准确率提升到 99.99%，员工关于薪资的咨询量下降了 90%。',
          author: '陈建国', title: '集团 CHRO', company: '某新能源集团',
        },
        specs: [
          { label: '薪酬模式', value: '20+' },
          { label: '覆盖城市', value: '300+' },
          { label: '算薪速度', value: '< 5min' },
          { label: '发放渠道', value: '50+ 银行' },
        ],
        related: ['attendance', 'org', 'analytics'],
      },
      {
        id: 'learning', slug: 'learning', icon: IconLearning,
        name: '在线学习系统', tagline: 'AI 赋能学习，个性化成长路径',
        desc: '从课程创建、学习分配到效果评估，打造企业数字化学习生态，AI 学习助手让知识触手可及。',
        features: [
          { title: 'AI 做课', desc: 'PPT/文档/视频自动转课程，AI 生成测验题与知识图谱' },
          { title: '学习路径', desc: '基于岗位能力模型，自动推荐个性化学习路径与资源' },
          { title: '混合培训', desc: '线上课程 + 线下班次 + OJT 带教，全流程管理' },
          { title: '效果评估', desc: '学习数据与绩效关联，ROI 量化分析，培训效果看得见' },
        ],
        scenarios: [
          { title: '新员工入职培训', desc: '标准化入职课程包，7 天完成从入职到上岗' },
          { title: '管理者领导力', desc: '分层领导力课程，AI 教练辅助实战练习与反馈' },
          { title: '销售技能培训', desc: '产品知识 + 销售技巧 + 实战演练，业绩提升可量化' },
        ],
        testimonial: {
          quote: 'AI 做课功能让我们内部的业务专家都能轻松产出高质量课程，知识沉淀速度提升了 5 倍。',
          author: '张明月', title: '人才招募总监', company: '某连锁餐饮品牌',
        },
        specs: [
          { label: '课程格式', value: '12+' },
          { label: '学习模式', value: '8+' },
          { label: '评估维度', value: '15+' },
          { label: '并发学习', value: '100,000+' },
        ],
        related: ['ai-course', 'ai-coach', 'talent'],
      },
      {
        id: 'talent', slug: 'talent', icon: IconTalent,
        name: '盘点发展系统', tagline: '科学盘点，精准发现高潜人才',
        desc: '数字化人才盘点与继任管理，九宫格、人才池、梯队建设，支撑企业战略人才储备。',
        features: [
          { title: '多维盘点', desc: '绩效+潜力+能力+价值观多维度评估，自定义权重与模型' },
          { title: '人才画像', desc: '整合测评、绩效、360° 数据，生成动态人才全景画像' },
          { title: '继任管理', desc: '关键岗位继任梯队可视化，缺口预警，培养计划联动' },
          { title: '梯队建设', desc: '高潜人才识别与加速培养，人才池动态更新与跟踪' },
        ],
        scenarios: [
          { title: '年度人才盘点', desc: '全员盘点 2 周完成，九宫格自动分布，校准会议线上化' },
          { title: '高管继任计划', desc: '关键岗位 1:3 继任梯队，培养进展实时跟踪' },
          { title: '高潜培养项目', desc: '高潜人才自动入池，个性化培养方案，成长轨迹可视' },
        ],
        testimonial: {
          quote: '人才盘点从人工统计 1 个月缩短到 2 周，高管继任梯队覆盖率从 60% 提升到 95%。',
          author: '陈建国', title: '集团 CHRO', company: '某新能源集团',
        },
        specs: [
          { label: '盘点维度', value: '10+' },
          { label: '人才模型', value: '50+' },
          { label: '继任层级', value: '无限' },
          { label: '评估工具', value: '8+' },
        ],
        related: ['assess-360', 'assess-model', 'analytics'],
      },
      {
        id: 'analytics', slug: 'analytics', icon: IconAnalytics,
        name: '数字人力分析', tagline: '400+ 指标，BI 洞察驱动决策',
        desc: '400+ 行业人力指标，BI 可视化分析，从描述性分析到预测性洞察，赋能管理者科学决策。',
        features: [
          { title: '预置指标库', desc: '400+ 人力指标开箱即用，覆盖效能、成本、流动、结构等维度' },
          { title: '自助 BI', desc: '拖拽式报表设计，多数据源关联，无需代码即可构建分析模型' },
          { title: '预测分析', desc: '离职风险预测、招聘需求预测、人力成本趋势，AI 辅助决策' },
          { title: '高管驾驶舱', desc: 'CEO/CHRO 专属数据看板，关键指标一屏掌握，支持移动端' },
        ],
        scenarios: [
          { title: '人力效能分析', desc: '人效、元效、费效多维分析，找出提升空间' },
          { title: '离职风险预警', desc: 'AI 预测高离职风险员工，提前干预，保留核心人才' },
          { title: '招聘漏斗诊断', desc: '各环节转化率分析，定位瓶颈，精准优化' },
        ],
        testimonial: {
          quote: '高管驾驶舱让 CEO 每天早上 5 分钟掌握全公司人力状况，决策效率大幅提升。',
          author: '陈建国', title: '集团 CHRO', company: '某新能源集团',
        },
        specs: [
          { label: '预置指标', value: '400+' },
          { label: '更新频率', value: '实时' },
          { label: '预测模型', value: '12+' },
          { label: '数据源', value: '全模块' },
        ],
        related: ['org', 'talent', 'performance'],
      },
    ],
  },
  {
    id: 'ai-family',
    label: 'AI Family',
    iconColor: ICON_COLORS['ai-family'],
    iconBg:    ICON_BG_COLORS['ai-family'],
    products: [
      {
        id: 'ai-recruit', slug: 'ai-recruit', icon: IconAIRecruit,
        name: 'AI 招聘助手', tagline: '智能简历筛选，让招聘更快更准',
        desc: 'AI 自动理解岗位需求，精准筛选简历、生成 JD、安排面试，7×24 小时不间断工作，让 HR 从繁琐事务中解放。',
        features: [
          { title: '智能 JD 生成', desc: '输入岗位关键词，AI 自动生成专业 JD，支持多风格调优' },
          { title: '简历智能筛选', desc: '语义理解简历内容，匹配度评分，top 候选人自动推荐' },
          { title: 'AI 自动寻访', desc: '基于人才画像自动在人才库/招聘网站寻访相似候选人' },
          { title: '面试智能安排', desc: '自动协调面试官与候选人时间，冲突检测，一键发送邀请' },
        ],
        scenarios: [
          { title: '海量简历筛选', desc: '校招季 10 万+ 简历，AI 自动初筛，HR 只关注高匹配候选人' },
          { title: 'JD 批量生成', desc: '业务扩张期 100+ 岗位同时开放，AI 批量生成 JD，质量统一' },
          { title: '人才库激活', desc: '历史简历 AI 重新评估，自动推荐匹配当前开放岗位的人才' },
        ],
        testimonial: {
          quote: 'AI 招聘助手让我们的简历筛选时间从每人 15 分钟缩短到 30 秒，招聘效率质的飞跃。',
          author: '王志远', title: '招聘负责人', company: '某头部互联网公司',
        },
        specs: [
          { label: '简历处理速度', value: '< 30s' },
          { label: 'JD 生成质量', value: 'A+' },
          { label: '匹配准确率', value: '92%' },
          { label: '支持语言', value: '中英' },
        ],
        related: ['recruit', 'ai-interview', 'assess-recruit'],
      },
      {
        id: 'ai-interview', slug: 'ai-interview', icon: IconAIInterview,
        name: 'AI 面试官', tagline: '不止评能力，更要测潜力',
        desc: '7×24 小时自动视频面试，多维度评估候选人能力、潜力与文化匹配度，面试报告即时生成。',
        features: [
          { title: '结构化面试', desc: '基于岗位模型自动生成面试问题，确保评估标准统一' },
          { title: '多维度评估', desc: '专业能力、沟通表达、逻辑思维、文化匹配度综合评分' },
          { title: '反作弊检测', desc: '人脸识别、环境检测、答案相似度分析，确保面试公平' },
          { title: '面试报告', desc: '面试结束后 2 分钟生成结构化报告，含评分与面试视频' },
        ],
        scenarios: [
          { title: '校招大规模初面', desc: '数万候选人同时面试，无需 HR 参与，筛选效率提升 10 倍' },
          { title: '蓝领批量面试', desc: '普工/店员快速面试，3 分钟完成，即时判断录用与否' },
          { title: '高管潜力评估', desc: '情景模拟 + 案例分析，深度评估领导力与战略思维' },
        ],
        testimonial: {
          quote: 'AI 面试官彻底改变了我们的校招流程，候选人可以随时完成面试，HR 效率提升了 300%。',
          author: '王志远', title: '招聘负责人', company: '某头部互联网公司',
        },
        specs: [
          { label: '评估维度', value: '8+' },
          { label: '面试时长', value: '3-30min' },
          { label: '报告生成', value: '< 2min' },
          { label: '并发能力', value: '10,000+' },
        ],
        related: ['recruit', 'ai-recruit', 'assess-recruit'],
      },
      {
        id: 'ai-coach', slug: 'ai-coach', icon: IconAICoach,
        name: 'AI 领导力教练', tagline: '管理者专属成长伙伴',
        desc: '为每位管理者配备 AI 个人教练，基于 360° 反馈与绩效数据，提供个性化领导力提升方案。',
        features: [
          { title: '能力诊断', desc: '基于 360° 测评与绩效数据，AI 诊断领导力短板与发展机会' },
          { title: '个性化方案', desc: '根据诊断结果，AI 推荐课程、书籍、实践任务与导师' },
          { title: '情景模拟', desc: 'AI 模拟真实管理场景，练习反馈、冲突处理、团队激励' },
          { title: '成长跟踪', desc: '定期复测与进展跟踪，可视化领导力成长曲线' },
        ],
        scenarios: [
          { title: '新任经理转身', desc: '从个人贡献者到管理者的 90 天转身计划，系统培养管理基本功' },
          { title: '高潜干部培养', desc: '后备干部针对性训练，领导力短板补齐，为晋升做准备' },
          { title: '高管持续精进', desc: '高管专属教练，战略思维、组织变革、文化建设深度修炼' },
        ],
        testimonial: {
          quote: 'AI 领导力教练为每位管理者提供个性化成长方案，配合 360 度测评，让干部培养真正落地。',
          author: '陈建国', title: '集团 CHRO', company: '某新能源集团',
        },
        specs: [
          { label: '能力模型', value: '30+' },
          { label: '训练场景', value: '100+' },
          { label: '反馈周期', value: '实时' },
          { label: '支持层级', value: '全员' },
        ],
        related: ['performance', 'learning', 'assess-360'],
      },
      {
        id: 'ai-course', slug: 'ai-course', icon: IconAICourse,
        name: 'AI 做课助手', tagline: '沉淀知识，AI 生成高质量课程',
        desc: '让人人成为讲师，PPT、文档、视频一键转课程，AI 自动生成测验与知识图谱，加速企业知识沉淀。',
        features: [
          { title: '多源导入', desc: '支持 PPT、Word、PDF、视频、网页等多种格式一键导入' },
          { title: '智能拆解', desc: 'AI 自动拆解内容成章节，生成学习目标与课程大纲' },
          { title: '测验生成', desc: '基于课程内容自动生成单选、多选、判断、填空题' },
          { title: '知识图谱', desc: 'AI 提取课程知识点，构建企业知识图谱，智能推荐关联课程' },
        ],
        scenarios: [
          { title: '业务专家赋能', desc: '销售冠军的经验快速变成课程，可复制、可传播、可考核' },
          { title: '制度培训转化', desc: '规章制度、SOP 自动转互动课程，学习效果可追踪' },
          { title: '产品知识更新', desc: '新产品上线，产品文档 10 分钟变成全员培训课程' },
        ],
        testimonial: {
          quote: 'AI 做课让业务专家无需学习复杂工具，就能把经验变成高质量课程，知识沉淀速度飞跃。',
          author: '张明月', title: '人才招募总监', company: '某连锁餐饮品牌',
        },
        specs: [
          { label: '支持格式', value: '12+' },
          { label: '课程生成', value: '< 10min' },
          { label: '测验题型', value: '5+' },
          { label: '知识节点', value: '自动' },
        ],
        related: ['learning', 'ai-coach', 'assess-exam'],
      },
    ],
  },
  {
    id: 'assessment',
    label: '人才测评',
    iconColor: ICON_COLORS['assessment'],
    iconBg:    ICON_BG_COLORS['assessment'],
    products: [
      {
        id: 'assess-recruit', slug: 'assess-recruit', icon: IconAssessRecruit,
        name: '招聘测评', tagline: '科学评估，提升招聘命中率',
        desc: '基于岗位胜任力模型的科学测评体系，从认知能力、性格特质、价值观多维度评估候选人，让招聘决策有据可依。',
        features: [
          { title: '岗位建模', desc: '基于岗位需求构建测评模型，精准定义理想候选人画像' },
          { title: '多维测评', desc: '认知能力、性格、动机、价值观、专业知识全覆盖' },
          { title: '防作弊体系', desc: '摄像头监控、随机抽题、选项乱序、异常行为检测' },
          { title: '决策报告', desc: '匹配度评分、风险预警、面试建议，辅助录用决策' },
        ],
        scenarios: [
          { title: '校招批量测评', desc: '万人级在线测评，自动评分排名，快速锁定高潜候选人' },
          { title: '高管猎聘评估', desc: '深度领导力测评 + 情景模拟，全面评估高管胜任力' },
          { title: '技术岗位笔试', desc: '编程题、算法题、系统设计题，自动判分与代码分析' },
        ],
        testimonial: {
          quote: '引入招聘测评后，我们的试用期通过率从 72% 提升到 91%，招聘质量显著改善。',
          author: '王志远', title: '招聘负责人', company: '某头部互联网公司',
        },
        specs: [
          { label: '测评维度', value: '20+' },
          { label: '题库规模', value: '100,000+' },
          { label: '报告时效', value: '< 5min' },
          { label: '防作弊项', value: '8+' },
        ],
        related: ['recruit', 'ai-interview', 'assess-model'],
      },
      {
        id: 'assess-360', slug: 'assess-360', icon: IconAssess360,
        name: '360度评估', tagline: '多维度反馈，全面了解能力短板',
        desc: '上级、同级、下属、客户多视角反馈，全面了解员工能力表现与发展需求，为人才培养与晋升决策提供依据。',
        features: [
          { title: '关系链导入', desc: '组织架构自动识别评估关系，支持矩阵与项目制关系' },
          { title: '匿名保障', desc: '多层匿名机制，确保反馈真实可信，消除评估顾虑' },
          { title: '指标库', desc: '领导力、专业能力、文化价值观等 100+ 评估指标开箱即用' },
          { title: '发展建议', desc: 'AI 自动生成个人发展报告，指出优势短板与提升路径' },
        ],
        scenarios: [
          { title: '年度绩效评估', desc: '360° 反馈补充绩效结果，确保评估全面客观' },
          { title: '领导力发展', desc: '管理者能力短板识别，针对性培养计划制定' },
          { title: '晋升评审', desc: '多维度评估晋升候选人，降低晋升失败风险' },
        ],
        testimonial: {
          quote: '360 度评估让我们的晋升决策更加客观，晋升后表现不达预期的情况减少了 60%。',
          author: '陈建国', title: '集团 CHRO', company: '某新能源集团',
        },
        specs: [
          { label: '评估关系', value: '4+' },
          { label: '指标数量', value: '100+' },
          { label: '匿名层级', value: '3+' },
          { label: '完成周期', value: '1-2 周' },
        ],
        related: ['talent', 'performance', 'ai-coach'],
      },
      {
        id: 'assess-exam', slug: 'assess-exam', icon: IconAssessExam,
        name: '在线考试系统', tagline: '安全可靠，支持多题型防作弊',
        desc: '企业级在线考试平台，支持多种题型、智能组卷、防作弊监控，适用于认证考试、培训考核、竞赛等场景。',
        features: [
          { title: '丰富题型', desc: '单选、多选、判断、填空、简答、编程、案例分析等 10+ 题型' },
          { title: '智能组卷', desc: '按难度、知识点、题型比例自动组卷，支持固定卷与随机卷' },
          { title: '考试监控', desc: '人脸识别、切屏检测、随机拍照、IP 限制多重防作弊' },
          { title: '自动判分', desc: '客观题自动判分，主观题 AI 辅助评分，成绩即时发布' },
        ],
        scenarios: [
          { title: '产品认证考试', desc: '渠道伙伴/客户产品知识认证，考试通过自动颁发证书' },
          { title: '合规培训考核', desc: '安全/合规培训后强制考核，未通过自动重学' },
          { title: '技能竞赛', desc: '全国/全球技能竞赛，万人同时在线，实时排行榜' },
        ],
        testimonial: {
          quote: '在线考试系统让我们的认证考试成本降低了 70%，同时考试公平性得到了技术保障。',
          author: '张明月', title: '人才招募总监', company: '某连锁餐饮品牌',
        },
        specs: [
          { label: '支持题型', value: '10+' },
          { label: '并发考试', value: '100,000+' },
          { label: '防作弊项', value: '10+' },
          { label: '判分速度', value: '实时' },
        ],
        related: ['learning', 'ai-course', 'assess-recruit'],
      },
      {
        id: 'assess-model', slug: 'assess-model', icon: IconAssessModel,
        name: '人才模型构建', tagline: '科学建模，定义人才标准',
        desc: '基于岗位分析与战略需求，科学构建胜任力模型与人才标准，为招聘、测评、培养提供统一标尺。',
        features: [
          { title: '岗位分析', desc: 'AI 辅助岗位访谈与问卷分析，提取关键能力要素' },
          { title: '模型构建', desc: '可视化模型编辑，层级关系、权重分配、行为指标定义' },
          { title: '模型验证', desc: '基于历史数据验证模型有效性，持续迭代优化' },
          { title: '模型应用', desc: '一键应用到招聘、测评、绩效、培养模块，标准统一' },
        ],
        scenarios: [
          { title: '新建岗位标准', desc: '新设岗位快速构建胜任力模型，指导招聘与培养' },
          { title: '干部标准升级', desc: '战略转型期更新干部能力标准，引导行为转变' },
          { title: '全员能力建模', desc: '建立公司级能力词典，统一人才管理语言' },
        ],
        testimonial: {
          quote: '人才模型构建工具让我们的胜任力模型开发周期从 3 个月缩短到 2 周，且更科学客观。',
          author: '陈建国', title: '集团 CHRO', company: '某新能源集团',
        },
        specs: [
          { label: '模型维度', value: '无限' },
          { label: '行为指标', value: '无限' },
          { label: '验证方法', value: '3+' },
          { label: '应用场景', value: '全模块' },
        ],
        related: ['assess-recruit', 'assess-360', 'talent'],
      },
    ],
  },
  {
    id: 'paas',
    label: 'PaaS 平台',
    iconColor: ICON_COLORS['paas'],
    iconBg:    ICON_BG_COLORS['paas'],
    products: [
      {
        id: 'paas-lowcode', slug: 'paas-lowcode', icon: IconLowCode,
        name: '低代码平台', tagline: 'NoCode/LowCode 快速构建个性化 HR 应用',
        desc: '拖拽式应用搭建，无需编码即可构建表单、流程、报表，满足企业个性化 HR 需求，缩短交付周期 80%。',
        features: [
          { title: '可视化设计', desc: '拖拽组件、配置属性，几分钟搭建一个业务表单或审批流程' },
          { title: '数据建模', desc: '可视化数据表设计，字段类型丰富，支持关联、校验、公式计算' },
          { title: '流程引擎', desc: '图形化流程设计，条件分支、会签、转办、超时提醒一应俱全' },
          { title: '移动适配', desc: 'PC 端设计的应用自动适配移动端，无需额外开发' },
        ],
        scenarios: [
          { title: '个性化审批流', desc: '企业特殊审批场景快速搭建，无需等待产品迭代' },
          { title: '业务数据收集', desc: '巡检、调研、报名等场景快速建表，数据自动汇总分析' },
          { title: '内部工具搭建', desc: 'IT 资产、会议室、车辆等内部管理工具，半天上线' },
        ],
        testimonial: {
          quote: '低代码平台让我们的 HR 数字化需求从提需求到上线缩短到 1 周，业务灵活性大幅提升。',
          author: '李秀华', title: '人力资源总监', company: '某汽车零部件集团',
        },
        specs: [
          { label: '组件数量', value: '60+' },
          { label: '搭建速度', value: '分钟级' },
          { label: '流程节点', value: '20+' },
          { label: '集成能力', value: '全模块' },
        ],
        related: ['paas-api', 'paas-eco', 'recruit'],
      },
      {
        id: 'paas-api', slug: 'paas-api', icon: IconAPI,
        name: '开放 API', tagline: '标准化接口，轻松对接企业现有系统',
        desc: '500+ RESTful API，完善开发者文档与 SDK，轻松对接 ERP、财务、OA、钉钉、企业微信等企业系统。',
        features: [
          { title: '丰富接口', desc: '500+ 标准化 API，覆盖人事、薪酬、考勤、招聘等全业务域' },
          { title: '完善文档', desc: '交互式 API 文档、代码示例、Postman 集合，开发者友好' },
          { title: '安全认证', desc: 'OAuth 2.0、API Key、IP 白名单、请求签名，多重安全保障' },
          { title: '沙箱环境', desc: '独立沙箱环境供开发测试，不影响生产数据' },
        ],
        scenarios: [
          { title: 'ERP 对接', desc: '人事数据与财务/生产系统实时同步，打破数据孤岛' },
          { title: 'SSO 集成', desc: '统一身份认证，员工一次登录访问所有系统' },
          { title: '数据仓库', desc: '人力数据自动同步企业数据湖，支持高层决策分析' },
        ],
        testimonial: {
          quote: '开放 API 让我们在 2 周内完成了与 SAP 的对接，数据打通速度超出预期。',
          author: '李秀华', title: '人力资源总监', company: '某汽车零部件集团',
        },
        specs: [
          { label: 'API 数量', value: '500+' },
          { label: 'SDK 语言', value: '6+' },
          { label: 'QPS 限制', value: '10,000+' },
          { label: '可用性', value: '99.9%' },
        ],
        related: ['paas-lowcode', 'paas-eco', 'analytics'],
      },
      {
        id: 'paas-eco', slug: 'paas-eco', icon: IconEco,
        name: '生态广场', tagline: '200+ 生态伙伴，链接全行业服务能力',
        desc: '汇聚 HR 科技上下游生态伙伴，背调、测评、福利、财税、签证等一站式服务，即插即用。',
        features: [
          { title: '精选应用', desc: '严选 200+ 生态应用，覆盖背调、测评、福利、培训等场景' },
          { title: '一键集成', desc: '应用一键安装，数据自动打通，无需额外开发' },
          { title: '统一计费', desc: '生态应用费用统一结算，简化采购与财务流程' },
          { title: '安全审计', desc: '所有应用通过安全与合规审计，数据隐私有保障' },
        ],
        scenarios: [
          { title: '背景调查', desc: '候选人信息一键发起背调，报告自动归档' },
          { title: '员工福利', desc: '保险、体检、节日福利等应用即选即用，员工手机端领取' },
          { title: '海外用工', desc: 'EOR、签证、税务等海外用工服务一站式解决' },
        ],
        testimonial: {
          quote: '生态广场让我们的一站式 HR 服务愿景成为现实，员工体验大幅提升。',
          author: '陈建国', title: '集团 CHRO', company: '某新能源集团',
        },
        specs: [
          { label: '生态应用', value: '200+' },
          { label: '覆盖场景', value: '30+' },
          { label: '集成方式', value: '一键' },
          { label: '安全审计', value: '强制' },
        ],
        related: ['paas-api', 'paas-lowcode', 'paas-sec'],
      },
      {
        id: 'paas-sec', slug: 'paas-sec', icon: IconSecurity,
        name: '安全合规', tagline: '九层防护，等保三级认证',
        desc: '从网络、应用、数据、运维多维度构建安全防护体系，等保三级、ISO 27001、SOC 2 全面合规。',
        features: [
          { title: '数据加密', desc: '传输 TLS 1.3、存储 AES-256-GCM、字段级加密，全链路保护' },
          { title: '访问控制', desc: 'RBAC 权限模型、数据范围隔离、操作审计日志，最小权限原则' },
          { title: '合规认证', desc: '等保三级、ISO 27001、SOC 2 Type II、GDPR 全面合规' },
          { title: '灾备体系', desc: '同城双活、异地灾备、RPO<1min、RTO<15min，业务连续性保障' },
        ],
        scenarios: [
          { title: '金融级安全', desc: '银行客户数据安全要求，九层防护体系全面满足' },
          { title: '跨境合规', desc: 'GDPR、个人信息保护法合规，数据跨境传输合法有序' },
          { title: '审计备查', desc: '完整操作日志、数据变更记录，审计要求一键导出' },
        ],
        testimonial: {
          quote: '通过等保三级和 ISO 27001 认证，让我们在投标大型国企项目时更具竞争力。',
          author: '李秀华', title: '人力资源总监', company: '某汽车零部件集团',
        },
        specs: [
          { label: '安全层级', value: '9' },
          { label: '合规认证', value: '6+' },
          { label: '加密标准', value: 'AES-256' },
          { label: '可用性', value: '99.99%' },
        ],
        related: ['paas-api', 'paas-eco', 'org'],
      },
    ],
  },
];

/**
 * 产品 slug → 产品详情 快速查找表
 */
export const PRODUCT_MAP = (() => {
  const map = {};
  PRODUCT_TABS.forEach((tab) => {
    tab.products.forEach((p) => {
      map[p.slug] = { ...p, tabId: tab.id, tabLabel: tab.label };
    });
  });
  return map;
})();
