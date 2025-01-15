import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { NotesModule } from './notes/notes.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [AuthModule, NotesModule, UserModule],
})
export class ApiModule {}
