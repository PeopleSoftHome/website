/**
 * useRoiCalculator — ROI 计算器纯函数逻辑
 * ──────────────────────────────────────────
 * 输入 5 个参数，输出 5 个核心指标
 */
import { ref, computed } from 'vue';

const DEFAULTS = {
  employeeCount: 1000,
  monthlyHires: 30,
  hireCycleDays: 30,
  hrTeamSize: 8,
  hrMonthlySalary: 12000,
};

export function useRoiCalculator(initial = {}) {
  const employeeCount = ref(initial.employeeCount ?? DEFAULTS.employeeCount);
  const monthlyHires = ref(initial.monthlyHires ?? DEFAULTS.monthlyHires);
  const hireCycleDays = ref(initial.hireCycleDays ?? DEFAULTS.hireCycleDays);
  const hrTeamSize = ref(initial.hrTeamSize ?? DEFAULTS.hrTeamSize);
  const hrMonthlySalary = ref(initial.hrMonthlySalary ?? DEFAULTS.hrMonthlySalary);

  // TalentPro 年费估算（基础费 + 人头费）
  const annualFee = computed(() => {
    const base = 50000;
    const perEmployee = 200;
    return base + employeeCount.value * perEmployee;
  });

  // 1. 年节省 HR 工时成本 = HR人数 × 月薪 × 效率提升40% × 12月
  const hrSavings = computed(() =>
    hrTeamSize.value * hrMonthlySalary.value * 0.40 * 12
  );

  // 2. 年减少招聘周期成本
  // 每天招聘成本 ≈ (员工数/100) × 200元
  // 节省 = 月招聘量 × 12 × 每天成本 × 周期缩短35%
  const recruitSavings = computed(() => {
    const dailyRecruitCost = (employeeCount.value / 100) * 200;
    const cycleReductionRatio = 0.35;
    return monthlyHires.value * 12 * dailyRecruitCost * cycleReductionRatio;
  });

  // 3. 年减少人员流失成本
  // 员工平均月薪 ≈ HR 月薪 × 1.2
  // 人均流失成本 = 2 个月薪
  // 节省 = 员工总数 × 离职率15% × 人均流失成本 × 留存改善20%
  const turnoverSavings = computed(() => {
    const avgEmployeeSalary = hrMonthlySalary.value * 1.2;
    const turnoverCostPerPerson = avgEmployeeSalary * 2;
    return employeeCount.value * 0.15 * turnoverCostPerPerson * 0.20;
  });

  // 总节省
  const totalSavings = computed(() =>
    hrSavings.value + recruitSavings.value + turnoverSavings.value
  );

  // ROI (%)
  const roi = computed(() => {
    if (annualFee.value <= 0) return 0;
    return (totalSavings.value / annualFee.value) * 100;
  });

  // 投资回收期（月）
  const paybackMonths = computed(() => {
    const monthlySavings = totalSavings.value / 12;
    if (monthlySavings <= 0) return 0;
    return annualFee.value / monthlySavings;
  });

  return {
    employeeCount,
    monthlyHires,
    hireCycleDays,
    hrTeamSize,
    hrMonthlySalary,
    annualFee,
    hrSavings,
    recruitSavings,
    turnoverSavings,
    totalSavings,
    roi,
    paybackMonths,
  };
}
