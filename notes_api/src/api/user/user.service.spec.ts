import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';

const testUsers: User[] = [
  { id: '1', username: 'Alice', password: 'alice123' },
  { id: '2', username: 'Bob', password: 'bob123' },
  { id: '3', username: 'Charlie', password: 'charlie123' },
];

const first = testUsers[0];
const firstWithOutPassword = {
  id: first.id,
  username: first.username,
};

const second = testUsers[1];

const db = {
  user: {
    findUnique: jest.fn().mockReturnValue(first),
    create: jest.fn().mockReturnValue(firstWithOutPassword),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('UserService', () => {
  let service: UserService;

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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should call prismaService.user.findUnique with correct parameters', async () => {
      expect(service.findOne(first.username)).resolves.toEqual(first);
    });
  });

  describe('create', () => {
    it('should create a user', async () => {
      db.user.create = jest.fn().mockResolvedValue(firstWithOutPassword);

      expect(service.create(first)).resolves.toEqual(firstWithOutPassword);
    });
  });

  describe('update', () => {
    it('should update a user when changes are made', async () => {
      const updatedUser = { ...first, username: 'UpdatedAlice' };
      db.user.update = jest.fn().mockResolvedValue({
        id: updatedUser.id,
        username: updatedUser.username,
      });

      expect(service.update(updatedUser)).resolves.toEqual({
        id: updatedUser.id,
        username: updatedUser.username,
      });
    });

    it('should not update a user when no changes are made', async () => {
      db.user.update = jest.fn().mockResolvedValue(first);
      expect(service.update(first)).resolves.toEqual(first);
    });
  });

  describe('delete', () => {
    it('should delete a user successfully', async () => {
      db.user.delete = jest.fn().mockResolvedValue(true);
      expect(service.delete(second.id)).resolves.toEqual(true);
    });
    it('should return false when trying to delete a non-existent user', async () => {
      db.user.delete = jest.fn().mockRejectedValue(new Error('User not found'));
      expect(service.delete('non-existent-id')).resolves.toEqual(false);
    });
  });
});
