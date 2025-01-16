import { Body, Controller, Post } from '@nestjs/common';
import { UserDTO } from './dtos/user-dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly user: UserService) {}

  @Post('register')
  async register(@Body() body: Omit<UserDTO, 'id'>) {
    return await this.user.create(body);
  }
}
