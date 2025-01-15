import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserDTO } from './dtos/user-dto';
import { v4 as uuidv4 } from 'uuid';

const userId = uuidv4();
describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            create: jest
              .fn<Promise<Omit<UserDTO, 'password'>>, [Omit<UserDTO, 'id'>]>()
              .mockImplementation((user) =>
                Promise.resolve({ id: userId, ...user }),
              ),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Create a new User', () => {
    it('should return user without password', async () => {
      const newUser = {
        username: 'testuser',
        password: 'testpassword',
      };
      await expect(controller.register(newUser)).resolves.toEqual({
        id: userId,
        username: 'testuser',
      });
    });
  });
});
