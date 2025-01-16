import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    await prisma.truncate();
    await prisma.resetSequences();
    await prisma.$disconnect();
    await app.close();
  });

  it('/api/user/register (POST) should register a new user', () => {
    request(app.getHttpServer())
      .post('/api/user/register')
      .send({ username: 'newuser', password: 'newpass' })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.username).toBe('newuser');
      });
  });

  it('/api/user/register (POST) should not register a user with existing username', async () => {
    await request(app.getHttpServer())
      .post('/api/user/register')
      .send({ username: 'existinguser', password: 'pass' });

    request(app.getHttpServer())
      .post('/api/user/register')
      .send({ username: 'existinguser', password: 'newpass' })
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toContain('username already exists');
      });
  });
});
