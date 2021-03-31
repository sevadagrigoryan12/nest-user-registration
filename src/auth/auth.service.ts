import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../user/user.service';
import RegisterDto from './dto/register.dto';
import * as bcrypt from 'bcrypt';

const PostgreUniqueViolation = '23505';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  public async register(registrationData: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registrationData.password, 10);
    try {
      const createdUser = await this.usersService.create({
        ...registrationData,
        password: hashedPassword
      });
      createdUser.password = undefined;
      return createdUser;
    } catch (error) {
      console.log("AuthenticationService -> register -> error", error)
      if (error?.code === PostgreUniqueViolation) {
        throw new HttpException('User with that email already exists', HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async getAuthenticatedUser(email: string, password: string) {
    try {
      const user = await this.usersService.getByEmail(email);
      await this.verifyPassword(password, user.password);
      return user;
    } catch (error) {
      throw new HttpException('Incorrect password', HttpStatus.BAD_REQUEST);
    }
  }

  private async verifyPassword(password: string, hashedPassword: string) {
    const isMatched = await bcrypt.compare(
      password,
      hashedPassword
    );
    if (!isMatched) {
      throw new HttpException('Incorrect password', HttpStatus.BAD_REQUEST);
    }
  }
}