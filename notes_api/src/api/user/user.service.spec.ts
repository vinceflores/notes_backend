import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UserDTO } from './dtos/user-dto';





describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
          },
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
      const userDTO: UserDTO = {
        id: 'a',
        username: 'John Doe',
        password: 'password',
      };
      await service.findOne(userDTO);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userDTO.id },
      });
    });
  });
});
