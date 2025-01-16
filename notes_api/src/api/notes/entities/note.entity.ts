import { Note } from '@prisma/client';

export class NoteEntity implements Note {
  note: string;
  id: string;
  title: string;
}
