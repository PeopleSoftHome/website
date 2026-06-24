import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

jest.setTimeout(30000);

describe('BlogController (e2e)', () => {
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

  it('/api/v1/blogs/posts (GET) — should return blog posts list', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/blogs/posts');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data || res.body)).toBe(true);
  });

  it('/api/v1/blogs/categories (GET) — should return categories', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/blogs/categories');
    expect(res.status).toBe(200);
  });

  it('/api/v1/blogs/tags (GET) — should return tags', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/blogs/tags');
    expect(res.status).toBe(200);
  });
});
