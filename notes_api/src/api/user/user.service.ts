import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserDTO } from './dtos/user-dto';

type UserNoPassword = Omit<UserDTO, 'password'>;

interface IUserService {
  create(user: Omit<UserDTO, 'id'>): Promise<UserNoPassword | null>;
  findOne(user: UserDTO): Promise<UserNoPassword | null>;
  update(user: UserDTO): Promise<UserNoPassword | null>;
  delete(id: string): Promise<boolean>;
}

@Injectable()
export class UserService implements IUserService {
  private readonly select = {
    id: true,
    username: true,
  };

  constructor(private readonly prisma: PrismaService) {}

  async create(user: Omit<UserDTO, 'id'>): Promise<UserNoPassword | null> {
    return await this.prisma.user.create({
      data: user,
      select: this.select,
    });
  }

  async findOne(user: UserDTO): Promise<UserNoPassword | null> {
    return await this.prisma.user.findUnique({
      where: { id: user.id },
      select: this.select,
    });
  }

  async update(user: UserDTO): Promise<UserNoPassword | null> {
    return await this.prisma.user.update({
      where: { id: user.id },
      data: user,
      select: this.select,
    });
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.user.delete({ where: { id } });
      return true;
    } catch (error) {
      return false;
    }
  }
}
