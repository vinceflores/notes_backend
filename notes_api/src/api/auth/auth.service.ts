import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { UserDTO } from '../user/dtos/user-dto';
import { JwtService } from '@nestjs/jwt';

interface Auth {
  validateUser(
    username: string,
    pass: string,
  ): Promise<Omit<UserDTO, 'password'> | null>;
  login(user: Omit<UserDTO, 'password'>): Promise<{ access_token: string }>;
}

@Injectable()
export class AuthService implements Auth {
  constructor(
    private user: UserService,
    private readonly jwt: JwtService,
  ) {}

  async validateUser(
    username: string,
    pass: string,
  ): Promise<Omit<UserDTO, 'password'> | null> {
    const user = await this.user.findOne(username);
    return user && user.password === pass
      ? {
          id: user.id,
          username: user.username,
        }
      : null;
  }

  async login(
    user: Omit<UserDTO, 'password'>,
  ): Promise<{ access_token: string }> {
    const payload = { username: user.username, id: user.id };
    return {
      access_token: this.jwt.sign(payload),
    };
  }
}
