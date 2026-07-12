/**
 * Redis Sentinel 故障切换演练脚本
 *
 * 验证场景：
 * 1. 应用通过 Sentinel 连接 Redis 并启动 BullMQ Worker；
 * 2. 持续投递任务；
 * 3. 强制停止 Redis Master；
 * 4. Sentinel 自动完成故障转移；
 * 5. 验证 Worker 在切换后继续消费，无任务丢失。
 *
 * 前置条件：
 *   docker compose -f docker/redis-ha/docker-compose.yml up -d
 *
 * 运行：
 *   npx ts-node scripts/redis-failover-drill.ts
 */

import Redis from 'ioredis';
import { Queue, Worker, Job } from 'bullmq';
import { execSync } from 'child_process';

const SENTINEL_NODES = [
  { host: 'localhost', port: 26379 },
  { host: 'localhost', port: 26380 },
  { host: 'localhost', port: 26381 },
];
const MASTER_NAME = 'mymaster';
const QUEUE_NAME = 'failover-drill';
const TASK_COUNT = 10;
const CONTAINER_NAME = 'redis-master';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function log(message: string) {
  // eslint-disable-next-line no-console
  console.log(`[${new Date().toISOString()}] ${message}`);
}

async function createRedisClient(): Promise<Redis> {
  return new Redis({
    sentinels: SENTINEL_NODES,
    name: MASTER_NAME,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
}

async function getMasterInfo(redis: Redis): Promise<string> {
  const info = await redis.info('replication');
  const role = info.split('\n').find((line) => line.startsWith('role:'));
  return role?.trim() || 'unknown';
}

async function run() {
  log('Connecting to Redis via Sentinel...');
  const redis = await createRedisClient();
  log(`Initial master info: ${await getMasterInfo(redis)}`);

  log('Creating BullMQ queue and worker...');
  const queue = new Queue(QUEUE_NAME, { connection: redis });

  const processedJobs: string[] = [];
  const worker = new Worker(
    QUEUE_NAME,
    async (job: Job<{ index: number }>) => {
      log(`Processing job ${job.data.index}`);
      processedJobs.push(`${job.data.index}`);
      return { ok: true };
    },
    { connection: redis },
  );

  await worker.waitUntilReady();
  log('Worker is ready.');

  // 阶段 1：Master 正常时投递前半段任务
  log(`Adding first ${TASK_COUNT / 2} jobs...`);
  for (let i = 0; i < TASK_COUNT / 2; i += 1) {
    await queue.add('drill', { index: i });
  }

  await delay(2000);
  log(`Processed so far: ${processedJobs.length}/${TASK_COUNT}`);

  // 阶段 2：停止 Master，触发 Sentinel 故障转移
  log(`Stopping ${CONTAINER_NAME} to trigger failover...`);
  try {
    execSync(`docker stop ${CONTAINER_NAME}`, { stdio: 'inherit' });
  } catch {
    log('WARN: docker stop failed, please stop the master manually.');
  }

  log('Waiting for Sentinel failover (max 15s)...');
  let failoverDetected = false;
  for (let i = 0; i < 15; i += 1) {
    await delay(1000);
    try {
      const info = await getMasterInfo(redis);
      log(`Current master info: ${info}`);
      if (info === 'role:master') {
        failoverDetected = true;
        break;
      }
    } catch (e) {
      log(`Connection error during failover: ${(e as Error).message}`);
    }
  }

  if (!failoverDetected) {
    throw new Error('Failover did not complete within 15s');
  }
  log('Failover completed.');

  // 阶段 3：故障转移后投递后半段任务
  log(`Adding remaining ${TASK_COUNT / 2} jobs after failover...`);
  for (let i = TASK_COUNT / 2; i < TASK_COUNT; i += 1) {
    await queue.add('drill', { index: i });
  }

  // 阶段 4：等待任务全部消费
  log('Waiting for all jobs to be processed...');
  for (let i = 0; i < 30; i += 1) {
    await delay(1000);
    const waiting = await queue.getWaitingCount();
    const active = await queue.getActiveCount();
    log(`Waiting: ${waiting}, Active: ${active}, Processed: ${processedJobs.length}/${TASK_COUNT}`);
    if (waiting === 0 && active === 0 && processedJobs.length === TASK_COUNT) {
      break;
    }
  }

  // 清理
  await worker.close();
  await queue.close();
  await redis.quit();

  // 恢复 Master（可选，便于下次演练）
  log(`Restarting ${CONTAINER_NAME}...`);
  try {
    execSync(`docker start ${CONTAINER_NAME}`, { stdio: 'inherit' });
  } catch {
    log('WARN: docker start failed, please restart the master manually.');
  }

  // 结果判定
  const uniqueProcessed = new Set(processedJobs);
  if (uniqueProcessed.size !== TASK_COUNT) {
    throw new Error(`Expected ${TASK_COUNT} unique jobs, got ${uniqueProcessed.size}`);
  }

  log(`✅ Failover drill passed: all ${TASK_COUNT} jobs processed without data loss.`);
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('❌ Failover drill failed:', err);
    process.exit(1);
  });
