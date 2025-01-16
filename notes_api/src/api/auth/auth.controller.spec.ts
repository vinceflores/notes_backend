import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return the user object on successful login', async () => {
      const req = { user: { id: 'userId', username: 'testuser' } };
      const result = await controller.login(req as any);
      expect(result).toEqual(req.user);
    });
  });

  describe('logout', () => {
    it('should call req.logout and return its result', async () => {
      const req = {
        logout: jest.fn().mockReturnValue('logged out'),
      };
      const result = await controller.logout(req as any);
      expect(req.logout).toHaveBeenCalled();
      expect(result).toBe('logged out');
    });
  });
});
