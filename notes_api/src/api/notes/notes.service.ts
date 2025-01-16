import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { ShareNoteDTO } from './dto/share-note.dto';

@Injectable()
export class NotesService {
  private readonly logger = new Logger(NotesService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(createNoteDto: CreateNoteDto, req: any) {
    this.logger.log(req);
    return await this.prisma.note.create({
      data: {
        ...createNoteDto,
        user: {
          connect: {
            id: req.user.id,
          },
        },
      },
    });
  }

  async findAll(req: any) {
    return await this.prisma.note.findMany({
      where: {
        user: {
          every: { id: req.user.id },
        },
      },
    });
  }

  async findOne(id: string, req: any) {
    return await this.prisma.note.findFirst({
      where: {
        id,
        user: { every: { id: req.user.id } },
      },
    });
  }

  async update(id: string, updateNoteDto: UpdateNoteDto, req: any) {
    return await this.prisma.note.update({
      where: {
        id,
        user: { every: { id: req.id } },
      },
      data: updateNoteDto,
    });
  }

  async remove(id: string, req: any) {
    return this.prisma.note.delete({
      where: {
        id,
        AND: {
          user: { every: { id: req.user.id } },
        },
      },
    });
  }

  async search(query: string, req: any) {
    this.logger.log(query);
    return await this.prisma.note.findMany({
      where: {
        user: { every: { id: req.user.id } },
        OR: [{ title: { contains: query } }, { note: { contains: query } }],
      },
    });
  }

  async share(id: string, body: ShareNoteDTO, req: any) {
    return await this.prisma.user.update({
      where: {
        id: body.recipientId,
      },
      data: {
        notes: {
          connect: { id: req.user.id },
        },
      },
    });
  }
}
