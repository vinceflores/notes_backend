import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserDTO } from './dtos/user-dto';

interface IUserService {
  create(user: Omit<UserDTO, 'id'>): Promise<UserDTO | null>;
  findOne(user: UserDTO): Promise<UserDTO | null>;
  update(user: UserDTO): Promise<UserDTO | null>;
  delete(user: UserDTO): Promise<boolean>;
}

@Injectable()
export class UserService implements IUserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: Omit<UserDTO, 'id'>): Promise<UserDTO | null> {
    return await this.prisma.user.create({ data: user });
  }

  async findOne(user: UserDTO): Promise<UserDTO | null> {
    return await this.prisma.user.findUnique({
      where: { id: user.id },
    });
  }

  async update(user: UserDTO): Promise<UserDTO | null> {
    throw new Error('Method not implemented.');
  }

  async delete(user: UserDTO): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
