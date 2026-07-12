/**
 * 后端 E2E 测试运行器
 * 使用已编译的 dist 文件，避免 ts-jest 编译开销
 */

const request = require('supertest');
const { Test } = require('@nestjs/testing');
const { AppModule } = require('../../../dist/apps/api/src/app.module');

async function run() {
  console.log('Creating testing module...');
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  console.log('Creating Nest application...');
  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix('api/v1');
  await app.init();

  const server = app.getHttpServer();
  let passed = 0;
  let failed = 0;
  let accessToken = '';
  let refreshToken = '';

  const assert = async (name, fn) => {
    try {
      await fn();
      console.log(`✓ ${name}`);
      passed++;
    } catch (err) {
      console.log(`✗ ${name}:`, err.message);
      failed++;
    }
  };

  const timestamp = Date.now();
  const testEmail = `e2e${timestamp}@example.com`;
  const testPassword = 'TestPassword123!';

  // Health endpoints
  await assert('Health live', async () => {
    const res = await request(server).get('/api/v1/health/live');
    if (res.status !== 200 || res.body.status !== 'ok') {
      throw new Error(`status=${res.status}, body=${JSON.stringify(res.body)}`);
    }
  });

  await assert('Health ready', async () => {
    const res = await request(server).get('/api/v1/health/ready');
    if (res.status !== 200 || res.body.status !== 'ok') {
      throw new Error(`status=${res.status}, body=${JSON.stringify(res.body)}`);
    }
  });

  // Auth flow
  await assert('Auth register', async () => {
    const res = await request(server)
      .post('/api/v1/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
        name: 'E2E User',
      });
    if (![201, 200].includes(res.status)) {
      throw new Error(`status=${res.status}, body=${JSON.stringify(res.body)}`);
    }
  });

  await assert('Auth login', async () => {
    const res = await request(server)
      .post('/api/v1/auth/login')
      .send({ email: testEmail, password: testPassword });
    if (res.status !== 200) {
      throw new Error(`status=${res.status}, body=${JSON.stringify(res.body)}`);
    }
    accessToken = res.body.accessToken || res.body.data?.accessToken;
    refreshToken = res.body.refreshToken || res.body.data?.refreshToken;
    if (!accessToken || !refreshToken) {
      throw new Error(`missing tokens, body=${JSON.stringify(res.body)}`);
    }
  });

  await assert('Auth me', async () => {
    const res = await request(server)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);
    const user = res.body;
    if (res.status !== 200 || !user?.id) {
      throw new Error(`status=${res.status}, body=${JSON.stringify(res.body)}`);
    }
  });

  await assert('Auth refresh', async () => {
    const res = await request(server)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken });
    const newAccessToken = res.body.accessToken || res.body.data?.accessToken;
    if (res.status !== 200 || !newAccessToken) {
      throw new Error(`status=${res.status}, body=${JSON.stringify(res.body)}`);
    }
    accessToken = newAccessToken;
    refreshToken = res.body.refreshToken || res.body.data?.refreshToken || refreshToken;
  });

  await assert('Auth logout', async () => {
    const res = await request(server)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refreshToken });
    if (res.status !== 200) {
      throw new Error(`status=${res.status}, body=${JSON.stringify(res.body)}`);
    }
  });

  // Blog
  await assert('Blog posts list', async () => {
    const res = await request(server).get('/api/v1/blogs/posts');
    if (res.status !== 200) {
      throw new Error(`status=${res.status}`);
    }
  });

  await assert('Blog categories list', async () => {
    const res = await request(server).get('/api/v1/blogs/categories');
    if (res.status !== 200) {
      throw new Error(`status=${res.status}`);
    }
  });

  // Forum
  await assert('Forum categories list', async () => {
    const res = await request(server).get('/api/v1/forums/categories');
    if (res.status !== 200) {
      throw new Error(`status=${res.status}`);
    }
  });

  await assert('Forum topics list', async () => {
    const res = await request(server).get('/api/v1/forums/topics');
    if (res.status !== 200) {
      throw new Error(`status=${res.status}`);
    }
  });

  // Lead
  await assert('Demo booking create', async () => {
    const res = await request(server)
      .post('/api/v1/demo-bookings')
      .send({
        name: 'E2E 张三',
        company: 'E2E 示例科技',
        phone: '13800138000',
        email: `lead${timestamp}@example.com`,
        products: ['招聘管理'],
        scale: 'SCALE_51_200',
        source: 'WEBSITE',
      });
    if (res.status !== 201 && res.status !== 200) {
      throw new Error(`status=${res.status}, body=${JSON.stringify(res.body)}`);
    }
  });

  // CMS
  await assert('CMS pages list', async () => {
    const res = await request(server).get('/api/v1/cms/pages');
    if (res.status !== 200) {
      throw new Error(`status=${res.status}`);
    }
  });

  await assert('CMS products list', async () => {
    const res = await request(server).get('/api/v1/cms/products');
    if (res.status !== 200) {
      throw new Error(`status=${res.status}`);
    }
  });

  // News
  await assert('News list', async () => {
    const res = await request(server).get('/api/v1/news');
    if (res.status !== 200) {
      throw new Error(`status=${res.status}`);
    }
  });

  // Marketplace
  await assert('Marketplace apps list', async () => {
    const res = await request(server).get('/api/v1/marketplace/apps');
    if (res.status !== 200) {
      throw new Error(`status=${res.status}`);
    }
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('E2E test runner failed:', err.message);
  process.exit(1);
});
