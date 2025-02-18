import { Test, TestingModule } from '@nestjs/testing';
import { NotesService } from './notes.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('NotesService', () => {
  let service: NotesService;
  let prismaService: PrismaService;

  const mockPrismaService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();
    service = module.get<NotesService>(NotesService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
