import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

jest.setTimeout(30000);

describe('CmsController (e2e)', () => {
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

  it('/api/v1/cms/pages (GET) — should return CMS pages', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/cms/pages');
    expect(res.status).toBe(200);
  });

  it('/api/v1/cms/products (GET) — should return products', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/cms/products');
    expect(res.status).toBe(200);
  });

  it('/api/v1/cms/industries (GET) — should return industries', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/cms/industries');
    expect(res.status).toBe(200);
  });
});
