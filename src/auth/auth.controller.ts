import { Body, Req, Controller, HttpCode, Post, UseGuards, Res } from '@nestjs/common';
import { AuthenticationService } from './auth.service';
import RegisterDto from './dto/register.dto';
import RequestWithUser from './auth';
import { LocalAuthGuard } from './utils/local.guard';
import { RedisService } from 'src/redis-cache/redis-cache.service';
import { Response } from 'express';
import { SessionGuard } from './utils/session.guard';
 
@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly redisService: RedisService
  ) {}
 
  @Post('signup')
  async register(@Body() registrationData: RegisterDto) {
    return this.authenticationService.register(registrationData);
  }
 
  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async logIn(@Req() request: RequestWithUser, @Res() response: Response) {
    const user = request.user;
    user.password = undefined;
    return response.json(user);
  }

  @HttpCode(200)
  @UseGuards(SessionGuard)
  @Post('logout')
  async logout(@Req() request: RequestWithUser) {
    request.session.destroy((err) => {
      console.error("AuthenticationController -> logout -> err", err)
    })
    return;
  }
}