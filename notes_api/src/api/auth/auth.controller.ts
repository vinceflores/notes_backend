import {
  Request,
  Controller,
  Post,
  UseGuards,
  Body,
  HttpCode,
  Logger,
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
    return this.authService.login(req.user);
  }

  @Post('signup')
  async signup(@Body() body: UserDTO) {
    return this.authService.signup(body);
  }

  @UseGuards(LocalAuthGuard)
  @Post('logout')
  @HttpCode(200)
  async logout(@Request() req) {
    req.logout((err) => {
      if (err) {
        this.logger.error({
          method: 'logout',
          err,
        });
      }
    });
  }
}
