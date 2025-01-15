import { User } from '@prisma/client';

export class UserDTO implements User {
  id: string;
  username: string;
  password: string;
}
