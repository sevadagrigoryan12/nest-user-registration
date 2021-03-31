import { Req, Controller, HttpCode, UseGuards, Get } from '@nestjs/common';
import { UsersService } from './user.service';
import { LocalAuthGuard } from '../auth/utils/local.guard';
import RequestWithUser from 'src/auth/auth';
import { SessionGuard } from 'src/auth/utils/session.guard';
 
@Controller('user')
export class UserController {
  constructor(
    private readonly usersService: UsersService
  ) {}
 
  @HttpCode(200)
  @UseGuards(SessionGuard)
  @Get('list')
  async getUsersList() {
    return this.usersService.getUsersList();
  }
 
  @HttpCode(200)
  @UseGuards(SessionGuard)
  @Get('profile')
  async getUserProfile(@Req() request: RequestWithUser) {
    return request.user || null
  }
}