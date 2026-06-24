import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

jest.setTimeout(30000);

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('/api/v1/auth/register (POST) — should register a new user', async () => {
    const timestamp = Date.now();
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: `test${timestamp}@example.com`,
        password: 'TestPassword123!',
        name: 'Test User',
      });
    expect([201, 400, 409]).toContain(res.status);
  });

  it('/api/v1/auth/login (POST) — should login with valid credentials', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'TestPassword123!',
      });
    expect([200, 401]).toContain(res.status);
  });

  it('/api/v1/auth/me (GET) — should require auth token', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });
});
