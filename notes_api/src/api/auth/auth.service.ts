import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { UserDTO } from '../user/dtos/user-dto';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { User } from '@prisma/client';

interface Auth {
  validateUser(
    username: string,
    pass: string,
  ): Promise<Omit<UserDTO, 'password'> | null>;
  login(user: Omit<UserDTO, 'password'>): Promise<{ access_token: string }>;
  signup(user: Omit<UserDTO, 'id'>): Promise<Omit<User, 'password'> | null>;
}

@Injectable()
export class AuthService implements Auth {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private user: UserService,
    private readonly jwt: JwtService,
  ) {}

  async validateUser(
    username: string,
    pass: string,
  ): Promise<Omit<UserDTO, 'password'> | null> {
    const user = await this.user.findOne(username);
    if (!user) {
      this.logger.log({
        method: 'validateUser',
        error: 'User may not exist',
        input: { username, pass },
      });
    }
    return user && user.password === pass
      ? {
          id: user.id,
          username: user.username,
        }
      : null;
  }

  async signup(
    user: Omit<UserDTO, 'id'>,
  ): Promise<Omit<User, 'password'> | null> {
    return await this.user.create(user);
  }

  async login(
    user: Omit<UserDTO, 'password'>,
  ): Promise<{ access_token: string }> {
    const payload = { username: user.username, id: user.id };
    return {
      access_token: this.jwt.sign(payload, {
        secret: jwtConstants.secret,
      }),
    };
  }
}
