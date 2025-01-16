import { Note } from '@prisma/client';

export class CreateNoteDto implements Omit<Note, 'id'> {
  note: string;
  title: string;
}
