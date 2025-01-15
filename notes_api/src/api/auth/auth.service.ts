import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { UserDTO } from '../user/dtos/user-dto';

@Injectable()
export class AuthService {
  constructor(private user: UserService) {}

  async validateUser(
    username: string,
    pass: string,
  ): Promise<Omit<UserDTO, 'password'> | null> {
    const user = await this.user.findOne(username);
    return user.password === pass
      ? {
          id: user.id,
          username: user.username,
        }
      : null;
  }
}
