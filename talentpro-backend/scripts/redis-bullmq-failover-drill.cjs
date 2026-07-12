#!/usr/bin/env node
/**
 * Redis Sentinel + BullMQ 故障切换演练脚本
 *
 * 目标：验证 BullMQ Worker 在 Redis 主节点宕机、Sentinel 完成 failover 后，
 * 仍能自动重连新主节点并继续消费任务。
 *
 * 前置：本地已安装 Docker 与 docker compose v2。
 *
 * 用法（从 talentpro-backend 目录执行）：
 *   node scripts/redis-bullmq-failover-drill.cjs
 *
 * 退出码：0 通过，1 失败。
 */

const { execSync } = require('child_process');
const path = require('path');
const Redis = require('ioredis');
const { Queue, Worker } = require('bullmq');

const SCRIPT_DIR = __dirname;
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..', '..');
const COMPOSE_FILE = path.join(PROJECT_ROOT, 'docker', 'docker-compose.redis-sentinel.yml');
const PROJECT_NAME = 'talentpro-redis-ha-drill';
const MASTER_CONTAINER = 'talentpro-redis-master';

const SENTINELS = [
  { host: 'localhost', port: 26379 },
  { host: 'localhost', port: 26380 },
  { host: 'localhost', port: 26381 },
];

function run(cmd, opts = {}) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: opts.cwd || PROJECT_ROOT, ...opts });
}

function dockerCompose(args) {
  run(`docker compose -p ${PROJECT_NAME} -f "${COMPOSE_FILE}" ${args}`);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function addrKey(addr) {
  return Array.isArray(addr) ? `${addr[0]}:${addr[1]}` : String(addr);
}

async function waitForMaster(redis, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const addr = await redis.sentinel('get-master-addr-by-name', 'mymaster');
      if (Array.isArray(addr) && addr.length === 2) {
        return addr;
      }
    } catch (e) {
      // ignore, retry
    }
    await delay(500);
  }
  throw new Error('Timed out waiting for Sentinel to elect a master');
}

async function main() {
  console.log('🚀 Redis Sentinel + BullMQ failover drill started');

  try {
    // Verify Docker daemon is reachable before spending time spinning up containers
    try {
      run('docker info', { stdio: 'pipe' });
    } catch {
      console.error('❌ Docker daemon is not running or not reachable.');
      console.error('   Please start Docker Desktop / dockerd and retry.');
      process.exit(1);
    }

    dockerCompose('down -v');
    dockerCompose('up -d --wait');

    const sentinel = new Redis({
      sentinels: SENTINELS,
      name: 'mymaster',
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });

    const initialMaster = await waitForMaster(sentinel);
    console.log(`✅ Initial master: ${addrKey(initialMaster)}`);

    const queue = new Queue('drill-queue', {
      connection: sentinel.duplicate(),
    });

    const processed = [];
    const worker = new Worker(
      'drill-queue',
      async (job) => {
        processed.push(job.data.n);
        console.log(`  processed job ${job.data.n}`);
        return job.data.n;
      },
      {
        connection: sentinel.duplicate(),
        autorun: true,
      },
    );

    await worker.waitUntilReady();
    console.log('✅ BullMQ Worker is ready');

    // Pre-failover jobs
    console.log('➡️  Enqueueing 3 jobs before failover');
    for (let i = 1; i <= 3; i++) {
      await queue.add('drill', { n: i });
    }
    await delay(2500);
    if (processed.length !== 3) {
      throw new Error(`Expected 3 pre-failover jobs, got ${processed.length}`);
    }
    console.log('✅ Pre-failover jobs processed');

    // Simulate master failure
    console.log(`🔴 Stopping master container: ${MASTER_CONTAINER}`);
    run(`docker stop ${MASTER_CONTAINER}`);

    // Wait for failover
    console.log('⏳ Waiting for Sentinel failover...');
    let newMaster;
    const failoverStart = Date.now();
    while (Date.now() - failoverStart < 30000) {
      newMaster = await waitForMaster(sentinel);
      if (addrKey(newMaster) !== addrKey(initialMaster)) {
        break;
      }
      await delay(500);
    }
    if (!newMaster || addrKey(newMaster) === addrKey(initialMaster)) {
      throw new Error('Failover did not elect a new master');
    }
    console.log(`✅ New master after failover: ${addrKey(newMaster)}`);

    // Post-failover jobs
    console.log('➡️  Enqueueing 3 jobs after failover');
    for (let i = 4; i <= 6; i++) {
      await queue.add('drill', { n: i });
    }
    await delay(5000);
    if (processed.length !== 6) {
      throw new Error(`Expected 6 total jobs after failover, got ${processed.length}`);
    }
    console.log('✅ Post-failover jobs processed');

    await worker.close();
    await queue.close();
    sentinel.disconnect();

    console.log('\n🎉 Failover drill PASSED');
    dockerCompose('down -v');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Failover drill FAILED:', err.message || err);
    try {
      dockerCompose('down -v');
    } catch {
      // best effort cleanup
    }
    process.exit(1);
  }
}

main();
