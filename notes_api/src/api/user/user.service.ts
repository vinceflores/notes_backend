import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserDTO } from './dtos/user-dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(user: UserDTO): Promise<UserDTO | null> {
    return await this.prisma.user.findUnique({
      where: { id: user.id },
    });
  }
}
