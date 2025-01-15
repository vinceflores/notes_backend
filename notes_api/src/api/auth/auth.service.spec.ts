import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { User } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
const testUsers: User[] = [
  {
    id: uuidv4(),
    username: 'testuser1',
    password: 'password1',
  },
  {
    id: uuidv4(),
    username: 'testuser2',
    password: 'password2',
  },
];

const returnVal = {
  id: testUsers[0].id,
  username: testUsers[0].username,
};

const userDb = {
  findOne: jest.fn().mockResolvedValue(returnVal),
};

describe('AuthService', () => {
  let service: AuthService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: userDb,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('testUser one exists', () => {
    it('should return a the User without ', async () => {
      const user = await service.validateUser(
        testUsers[0].username,
        testUsers[0].password,
      );
      expect(user).not.toBeNull();
      expect(user).toEqual({
        id: testUsers[0].id,
        username: testUsers[0].username,
      });
    });
  });
  describe('testUser does not exist', () => {
    it('should return null', async () => {
      db.findOne.mockResolvedValueOnce(null);
      const user = await service.validateUser(
        'nonexistentuser',
        'wrongpassword',
      );
      expect(user).toBeNull();
    });
  });
});
