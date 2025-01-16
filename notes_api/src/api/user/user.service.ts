import { HttpException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserDTO } from './dtos/user-dto';

type UserNoPassword = Omit<UserDTO, 'password'>;

interface IUserService {
  create(user: Omit<UserDTO, 'id'>): Promise<UserNoPassword | null>;
  findOne(username: string): Promise<UserDTO | null>;
  update(user: UserDTO): Promise<UserNoPassword | null>;
  delete(id: string): Promise<boolean>;
}

@Injectable()
export class UserService implements IUserService {
  private readonly logger = new Logger(UserService.name);
  private readonly select = {
    id: true,
    username: true,
  };

  constructor(private readonly prisma: PrismaService) {}

  async create(user: Omit<UserDTO, 'id'>): Promise<UserNoPassword | null> {
    const result = await this.prisma.user.create({
      data: user,
      select: this.select,
    });
    if (!result) {
      this.logger.log('create');
      return null;
    }
    return result;
  }

  async findOne(username: string): Promise<UserDTO | null> {
    const result = await this.prisma.user.findUnique({
      where: { username },
    });
    if (!result) this.logger.log('findOne');
    return result;
  }

  async update(user: UserDTO): Promise<UserNoPassword | null> {
    const result = await this.prisma.user.update({
      where: { id: user.id },
      data: user,
      select: this.select,
    });
    if (!result) this.logger.log('update');
    return result;
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.user.delete({ where: { id } });
      return true;
    } catch (error) {
      this.logger.log('delete');
      this.logger.error(error);
      return false;
    }
  }
}
