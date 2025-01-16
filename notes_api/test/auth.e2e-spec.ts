import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    await app.init();
    await prisma.user.create({
      data: {
        username: 'testuser',
        password: 'testpass',
      },
    });

    await prisma.user.create({
      data: {
        username: 'logoutuser',
        password: 'logoutpass',
      },
    });

    await prisma.user.create({
      data: {
        username: 'existinguser',
        password: 'pass',
      },
    });
  });

  afterAll(async () => {
    await prisma.truncate();
    await prisma.resetSequences();
    await prisma.$disconnect();
    await app.close();
  });

  it('/api/auth/login (POST) should login a user with valid credentials', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'testuser', password: 'testpass' })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('access_token');
      });
  });

  it('/api/auth/signup (POST) should signup a new user', async () => {
    const newUser = { username: 'newuser', password: 'newpass' };

    await request(app.getHttpServer())
      .post('/auth/signup')
      .send(newUser)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.username).toBe(newUser.username);
        expect(res.body).not.toHaveProperty('password'); // Ensure password is not returned
      });

    // Verify the user is actually created in the database
    const createdUser = await prisma.user.findUnique({
      where: { username: newUser.username },
    });
    expect(createdUser).not.toBeNull();
    expect(createdUser.username).toBe(newUser.username);
  });

  it('/auth/login (POST) should not login a user with invalid credentials', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'wronguser', password: 'wrongpass' })
      .expect(401)
      .expect((res) => {
        expect(res.body.message).toContain('Unauthorized');
      });
  });

  it('/api/auth/logout (POST) should logout a user', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'logoutuser', password: 'logoutpass' });

    const token = loginResponse.body.access_token;

    await request(app.getHttpServer())
      .post('/auth/logout')
      .send({ username: 'logoutuser', password: 'logoutpass' })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
