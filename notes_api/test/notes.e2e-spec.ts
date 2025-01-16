import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Notes API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    await app.init();

    await prisma.user.create({
      data: {
        username: 'testUser',
        password: 'testPassword',
      },
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'testUser', password: 'testPassword' })
      .expect(200);
    token = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await prisma.truncate();
    await prisma.resetSequences();
    await prisma.$disconnect();
    await app.close();
  });

  it('/notes (POST) - create note', async () => {
    const createNoteDto = {
      title: 'Test Note',
      note: 'This is a test note.',
    };

    const response = await request(app.getHttpServer())
      .post('/notes')
      .set('Authorization', `Bearer ${token}`)
      .send(createNoteDto)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe(createNoteDto.title);
    expect(response.body.note).toBe(createNoteDto.note);
  });

  describe('logged in ', () => {
    it('/notes (GET) - findAll notes', async () => {
      const response = await request(app.getHttpServer())
        .get('/notes')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('/notes/:id (GET) - findOne note by id', async () => {
      const createNoteDto = {
        title: 'Test Note for findOne',
        note: 'This is a test note.',
      };
      const createResponse = await request(app.getHttpServer())
        .post('/notes')
        .set('Authorization', `Bearer ${token}`)
        .send(createNoteDto)
        .expect(201);

      const noteId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .get(`/notes/${noteId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', noteId);
      expect(response.body.title).toBe(createNoteDto.title);
      expect(response.body.note).toBe(createNoteDto.note);
    });

    it('/notes/:id (DELETE) - delete note', async () => {
      const createNoteDto = {
        title: 'Test Note for delete',
        note: 'This is a test note.',
      };
      const createResponse = await request(app.getHttpServer())
        .post('/notes')
        .set('Authorization', `Bearer ${token}`)
        .send(createNoteDto)
        .expect(201);

      const noteId = createResponse.body.id;

      await request(app.getHttpServer())
        .delete(`/notes/${noteId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/notes/${noteId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('/notes/:id (PUT) - update note', async () => {
      const createNoteDto = {
        title: 'Test Note',
        note: 'This is a test note.',
      };
      const createResponse = await request(app.getHttpServer())
        .post('/notes')
        .set('Authorization', `Bearer ${token}`)
        .send(createNoteDto)
        .expect(201);

      const noteId = createResponse.body.id;
      const updateNoteDto = {
        title: 'Updated Note',
        note: 'This is an updated test note.',
      };

      const updateResponse = await request(app.getHttpServer())
        .put(`/notes/${noteId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateNoteDto)
        .expect(200);

      expect(updateResponse.body.title).toBe(updateNoteDto.title);
      expect(updateResponse.body.note).toBe(updateNoteDto.note);
    });

    it('/notes/search (GET) - search note', async () => {
      const createNoteDto = {
        title: 'Searchable Note',
        note: 'This note is for search testing.',
      };
      await request(app.getHttpServer())
        .post('/notes')
        .set('Authorization', `Bearer ${token}`)
        .send(createNoteDto)
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/notes/search?q=Searchable')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].title).toContain('Searchable');
    });
    it('/notes/:id/share {POST} - share a note to another user', async () => {});
  });
});
