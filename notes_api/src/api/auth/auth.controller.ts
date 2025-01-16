import {
  Request,
  Controller,
  Post,
  UseGuards,
  Body,
  HttpCode,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { UserDTO } from '../user/dtos/user-dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  async login(@Request() req) {
    return await this.authService.login(req.user);
  }

  @Post('signup')
  async signup(@Body() body: UserDTO) {
    const user = await this.authService.signup(body);
    if (!user)
      throw new HttpException('User Not Created', HttpStatus.BAD_REQUEST);
    return user;
  }

  @UseGuards(LocalAuthGuard)
  @Post('logout')
  @HttpCode(200)
  async logout(@Request() req) {
    return await req.logout(() => {});
  }
}
