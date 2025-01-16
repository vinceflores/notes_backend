import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AppController (e2e)', () => {
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

    // Create teset users
    await prisma.user.create({
      data: {
        username: 'testUser2',
        password: 'testPassword',
      },
    });

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

    // generate an auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'testUser2', password: 'testPassword' })
      .expect(200);
    token = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await prisma.truncate();
    await prisma.resetSequences();
    await prisma.$disconnect();
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('notes', () => {
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

      describe('search', () => {
        const createNoteDto = {
          title: 'Searchable Note',
          note: 'This note is for search testing.',
        };
        beforeAll(async () => {
          await prisma.note.create({ data: createNoteDto });
        });
        it('should return createNoteDTO with single word query', async () => {
          const response = await request(app.getHttpServer())
            .get('/notes/search?q=Searchable')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBeGreaterThan(0);
          expect(response.body[0].title).toContain('Searchable');
        });
        it('should return createNoteDTO with 2 words query', async () => {
          const response = await request(app.getHttpServer())
            .get('/notes/search?q=Searchable Note')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBeGreaterThan(0);
        });
      });

      it('/notes/:id/share {POST} - share a note to another user', async () => {
        const newUser = { username: 'shareuser', password: 'sharepass' };

        const newUserCreated = await prisma.user.create({ data: newUser });

        // Create a note to be shared
        const createNoteDto = {
          title: 'Note to Share',
          note: 'This note will be shared with another user.',
        };
        const createResponse = await request(app.getHttpServer())
          .post('/notes')
          .set('Authorization', `Bearer ${token}`)
          .send(createNoteDto)
          .expect(201);

        const noteId = createResponse.body.id;

        // Share the note with the new user
        await request(app.getHttpServer())
          .post(`/notes/${noteId}/share`)
          .set('Authorization', `Bearer ${token}`)
          .send({ recipientId: newUserCreated.id })
          .expect(201)
          .expect(async (res) => {
            expect(res.body).toHaveProperty('id', noteId);

            // Verify that the new user has access to the shared note
            const sharedNoteResponse = await prisma.note.findFirst({
              where: {
                id: noteId,
                user: {
                  some: { id: newUserCreated.id },
                },
              },
              include: { user: true },
            });
            expect(sharedNoteResponse).not.toBeNull();
            expect(sharedNoteResponse.title).toBe('Note to Share');
            expect(sharedNoteResponse.note).toBe(
              'This note will be shared with another user.',
            );
            expect(
              sharedNoteResponse.user.some(
                (user) => user.id === newUserCreated.id,
              ),
            ).toBe(true);
          });
      });
    });
  });

  describe('auth', () => {
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
          expect(res.body).toBeDefined();
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
});
