import { Test, TestingModule } from '@nestjs/testing';
import { Note } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ShareNoteDTO } from './dto/share-note.dto';

const noteId = uuidv4();
// const userId = uuidv4();

describe('NotesController', () => {
  let controller: NotesController;
  let db: Note[];
  let stubNotesService;

  beforeEach(async () => {
    db = [
      {
        id: uuidv4(),
        title: 'Note 1',
        note: 'Content of Note 1',
      },
      {
        id: uuidv4(),
        title: 'Note 2',
        note: 'Content of Note 2',
      },
      {
        id: uuidv4(),
        title: 'Note 3',
        note: 'Content of Note 3',
      },
    ];
    stubNotesService = {
      create: jest
        .fn<Promise<Note>, [CreateNoteDto, any]>()
        .mockImplementation((note) => Promise.resolve({ id: noteId, ...note })),
      findAll: jest.fn<Note[], [any]>().mockImplementation((req) => db),
      findOne: jest
        .fn<Promise<Note>, [string, any]>()
        .mockImplementation((id) => Promise.resolve(db[0])),
      update: jest
        .fn<Promise<UpdateNoteDto>, [string, UpdateNoteDto, any]>()
        .mockImplementation((id, body) => Promise.resolve({ id, ...body })),
      remove: jest.fn<
        Promise<{
          deleted: boolean;
        }>,
        [string]
      >((id) =>
        Promise.resolve({
          deleted: true,
        }),
      ),
      search: jest
        .fn<Promise<Note[]>, [string, any]>()
        .mockImplementation((query) =>
          Promise.resolve(
            db.filter(
              (record) =>
                record.note.includes(query) || record.title.includes(query),
            ),
          ),
        ),
      share: jest
        .fn<Promise<Note>, [string, ShareNoteDTO, any]>()
        .mockImplementation((id) => Promise.resolve(db[0])),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotesController],
      providers: [
        NotesService,
        {
          provide: JwtAuthGuard,
          useValue: jest.fn().mockImplementation(() => true),
        },
      ],
    })
      .overrideProvider(NotesService)
      .useValue(stubNotesService)
      .compile();

    controller = module.get<NotesController>(NotesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call NotesService.create with correct parameters', async () => {
      const createNoteDto = {
        title: 'Test Note',
        note: 'This is a test note.',
      };
      await controller.create(createNoteDto, null);
      expect(stubNotesService.create).toHaveBeenCalledWith(createNoteDto, null);
    });
    it('should create a new note', async () => {
      const createNoteDto = {
        title: 'New Note',
        note: 'This is a new note.',
      };
      const result = await controller.create(createNoteDto, null);
      expect(result).toEqual({ id: expect.any(String), ...createNoteDto });
    });
  });

  describe('findAll', () => {
    it('should call NotesService.findAll', async () => {
      await controller.findAll(null);
      expect(stubNotesService.findAll).toHaveBeenCalled();
    });
    it('should return all records from db', async () => {
      const records = await controller.findAll(null);
      expect(records).toEqual(
        expect.arrayContaining(stubNotesService.findAll()),
      );
    });
  });

  describe('findOne', () => {
    it('should call NotesService.findOne with correct id', async () => {
      const id = '1';
      await controller.findOne(id, null);
      expect(stubNotesService.findOne).toHaveBeenCalledWith(id, null);
    });
    it('should find one by id', async () => {
      const id = '1';
      expect(controller.findOne(id, null)).resolves.toEqual(db[0]);
    });
  });

  describe('update', () => {
    it('should call NotesService.update with correct parameters', async () => {
      const id = '1';
      const updateNoteDto = {
        title: 'Updated Note',
        note: 'This is an updated test note.',
      };
      const updated = await controller.update(id, updateNoteDto, {});
      expect(updated).not.toEqual(db[0]);
      expect(updated).toEqual({
        id,
        ...updateNoteDto,
      });
    });
  });

  describe('remove', () => {
    it('should call NotesService.remove with correct id', async () => {
      const id = '1';
      await controller.remove(id, null);
      expect(stubNotesService.remove).toHaveBeenCalledWith(id, null);
    });
    it('should return that deleted is true', async () => {
      const id = '1';
      expect(controller.remove(id, null));
    });
  });

  describe('search', () => {
    it('should call NotesService.search with correct query', async () => {
      const query = 'Test';
      await controller.search(query, null);
      expect(stubNotesService.search).toHaveBeenCalledWith(query, null);
    });
  });
});
