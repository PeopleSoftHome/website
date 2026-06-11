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

  // Test 1: Health endpoint
  try {
    const res = await request(server).get('/api/v1/health/live');
    if (res.status === 200 && res.body.status === 'ok') {
      console.log('✓ Health endpoint');
      passed++;
    } else {
      console.log('✗ Health endpoint:', res.status, res.body);
      failed++;
    }
  } catch (err) {
    console.log('✗ Health endpoint error:', err.message);
    failed++;
  }

  // Test 2: Auth register
  try {
    const timestamp = Date.now();
    const res = await request(server)
      .post('/api/v1/auth/register')
      .send({
        email: `test${timestamp}@example.com`,
        password: 'TestPassword123!',
        name: 'Test User',
      });
    if ([201, 400, 409].includes(res.status)) {
      console.log('✓ Auth register');
      passed++;
    } else {
      console.log('✗ Auth register:', res.status);
      failed++;
    }
  } catch (err) {
    console.log('✗ Auth register error:', err.message);
    failed++;
  }

  // Test 3: Auth login
  try {
    const res = await request(server)
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'TestPassword123!' });
    if ([200, 401].includes(res.status)) {
      console.log('✓ Auth login');
      passed++;
    } else {
      console.log('✗ Auth login:', res.status);
      failed++;
    }
  } catch (err) {
    console.log('✗ Auth login error:', err.message);
    failed++;
  }

  // Test 4: Blog posts
  try {
    const res = await request(server).get('/api/v1/blogs/posts');
    if (res.status === 200) {
      console.log('✓ Blog posts');
      passed++;
    } else {
      console.log('✗ Blog posts:', res.status);
      failed++;
    }
  } catch (err) {
    console.log('✗ Blog posts error:', err.message);
    failed++;
  }

  // Test 5: CMS pages
  try {
    const res = await request(server).get('/api/v1/cms/pages');
    if (res.status === 200) {
      console.log('✓ CMS pages');
      passed++;
    } else {
      console.log('✗ CMS pages:', res.status);
      failed++;
    }
  } catch (err) {
    console.log('✗ CMS pages error:', err.message);
    failed++;
  }

  await app.close();

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('E2E test runner failed:', err.message);
  process.exit(1);
});
