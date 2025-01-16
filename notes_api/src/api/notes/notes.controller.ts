import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  Logger,
  Put,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ShareNoteDTO } from './dto/share-note.dto';

@Controller('notes')
export class NotesController {
  private readonly logger = new Logger(NotesController.name);
  constructor(private readonly notesService: NotesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createNoteDto: CreateNoteDto, @Request() req) {
    return await this.notesService.create(createNoteDto, req);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req) {
    return await this.notesService.findAll(req);
  }

  @UseGuards(JwtAuthGuard)
  @Get('search')
  async search(@Query('q') q: string, @Request() req) {
    return await this.notesService.search(q, req);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async findOne(@Param('id') id: string, @Request() req) {
    this.logger.log('findOne');
    return await this.notesService.findOne(id, req);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto,
    @Request() req,
  ) {
    return await this.notesService.update(id, updateNoteDto, req);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return await this.notesService.remove(id, req);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/share')
  async share(
    @Param('id') id: string,
    @Body() body: ShareNoteDTO,
    @Request() req,
  ) {
    return await this.notesService.share(id, body, req);
  }
}
