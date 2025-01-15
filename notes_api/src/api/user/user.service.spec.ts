import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UserDTO } from './dtos/user-dto';
import { User } from '@prisma/client';

const testUsers: User[] = [
  { id: '1', username: 'Alice', password: 'alice123' },
  { id: '2', username: 'Bob', password: 'bob123' },
  { id: '3', username: 'Charlie', password: 'charlie123' },
];

const first = testUsers[0];

const db = {
  user: {
    findUnique: jest.fn().mockResolvedValue(first),
    create: jest.fn().mockReturnValue(first),
    update: jest.fn().mockResolvedValue(first),
    delete: jest.fn().mockResolvedValue(first),
  },
};

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: db,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should call prismaService.user.findUnique with correct parameters', async () => {
      expect(service.findOne(first)).resolves.toEqual(first);
    });
  });
  describe('create', () => {
    it('should create a user', async () => {
      expect(service.create(first)).resolves.toEqual(first);
    });
  });

  describe('update', () => {
    it('should update a user when changes are made', async () => {
      const updatedUser = { ...first, username: 'UpdatedAlice' };
      db.user.update = jest.fn().mockResolvedValue(updatedUser);

      await expect(service.update(updatedUser)).resolves.toEqual(updatedUser);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: updatedUser.id },
        data: updatedUser,
      });
    });

    it('should not update a user when no changes are made', async () => {
      db.user.update = jest.fn().mockResolvedValue(first);

      await expect(service.update(first)).resolves.toEqual(first);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: first.id },
        data: first,
      });
    });
  });
});
