#!/usr/bin/env node
/**
 * API 负载基线脚本（零依赖，Node ≥ 18）
 *
 * 对公开热点 GET 接口施加恒定并发，输出 RPS / p50 / p95 / p99 / 错误率，
 * 用于为 THROTTLE_LIMIT 与缓存 TTL 提供容量依据（docs/load-testing.md）。
 *
 * 用法：
 *   node scripts/load-test.cjs
 *   BASE_URL=http://localhost:4000 DURATION_SEC=60 CONNECTIONS=50 node scripts/load-test.cjs
 *
 * 环境变量：
 *   BASE_URL      默认 http://localhost:4000
 *   DURATION_SEC  默认 30
 *   CONNECTIONS   默认 20
 *   API_PREFIX    默认 /api/v1
 *
 * 注意：默认限流为 500 次/分/IP（THROTTLE_LIMIT）。单 IP 压测超过该值会收到 429，
 * 这本身可用于验证限流；做容量测试时请临时调大 THROTTLE_LIMIT 或使用多源 IP。
 */

const BASE_URL = (process.env.BASE_URL || 'http://localhost:4000').replace(/\/$/, '');
const API_PREFIX = process.env.API_PREFIX || '/api/v1';
const DURATION_SEC = Number(process.env.DURATION_SEC || 30);
const CONNECTIONS = Number(process.env.CONNECTIONS || 20);

const ENDPOINTS = [
  '/blogs/posts',
  '/blogs/categories',
  '/blogs/tags',
  '/forums/topics',
  '/forums/categories',
  '/marketplace/apps',
  '/marketplace/categories',
];

const stats = new Map(); // endpoint -> { latencies: [], errors: 0, status: {} }
for (const ep of ENDPOINTS) stats.set(ep, { latencies: [], errors: 0, status: {} });

let stop = false;

async function worker() {
  while (!stop) {
    const ep = ENDPOINTS[Math.floor(Math.random() * ENDPOINTS.length)];
    const s = stats.get(ep);
    const started = performance.now();
    try {
      const res = await fetch(`${BASE_URL}${API_PREFIX}${ep}`);
      const latency = performance.now() - started;
      s.latencies.push(latency);
      s.status[res.status] = (s.status[res.status] || 0) + 1;
      if (res.status >= 500) s.errors += 1;
      await res.arrayBuffer(); // 消费响应体，避免连接占用
    } catch {
      s.errors += 1;
    }
  }
}

function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[idx];
}

function report() {
  const all = [];
  let totalReq = 0;
  let totalErr = 0;
  console.log('\n──────── 分端点结果 ────────');
  for (const [ep, s] of stats) {
    const sorted = [...s.latencies].sort((a, b) => a - b);
    all.push(...sorted);
    totalReq += s.latencies.length;
    totalErr += s.errors;
    const statusStr = Object.entries(s.status).map(([k, v]) => `${k}:${v}`).join(' ');
    console.log(
      `${ep.padEnd(28)} n=${String(s.latencies.length).padStart(6)} ` +
      `p50=${percentile(sorted, 50).toFixed(0)}ms p95=${percentile(sorted, 95).toFixed(0)}ms ` +
      `p99=${percentile(sorted, 99).toFixed(0)}ms err=${s.errors} [${statusStr}]`,
    );
  }
  const sortedAll = all.sort((a, b) => a - b);
  const rps = (totalReq / DURATION_SEC).toFixed(1);
  const errRate = totalReq ? ((totalErr / totalReq) * 100).toFixed(2) : '0.00';
  console.log('\n──────── 汇总 ────────');
  console.log(`总请求=${totalReq}  RPS=${rps}  错误率(5xx/网络)=${errRate}%`);
  console.log(
    `p50=${percentile(sortedAll, 50).toFixed(0)}ms  p95=${percentile(sortedAll, 95).toFixed(0)}ms  ` +
    `p99=${percentile(sortedAll, 99).toFixed(0)}ms  max=${(sortedAll[sortedAll.length - 1] || 0).toFixed(0)}ms`,
  );
  return totalReq > 0 && totalErr / totalReq <= 0.01;
}

async function main() {
  console.log(`目标=${BASE_URL}${API_PREFIX}  并发=${CONNECTIONS}  时长=${DURATION_SEC}s  端点=${ENDPOINTS.length} 个`);
  try {
    const probe = await fetch(`${BASE_URL}${API_PREFIX}/health`, { signal: AbortSignal.timeout(5000) });
    console.log(`健康检查 /health → ${probe.status}`);
  } catch {
    console.error(`无法连接 ${BASE_URL}，请先启动后端（见 docs/load-testing.md）`);
    process.exit(2);
  }

  const workers = Array.from({ length: CONNECTIONS }, () => worker());
  await new Promise((resolve) => setTimeout(resolve, DURATION_SEC * 1000));
  stop = true;
  await Promise.all(workers);

  const ok = report();
  process.exit(ok ? 0 : 1);
}

main();
