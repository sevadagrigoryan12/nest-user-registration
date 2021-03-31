import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './user/user.module';
import { AuthenticationModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import * as Joi from '@hapi/joi';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './auth/utils/local.strategy';
import { LocalAuthGuard } from './auth/utils/local.guard';
import { SessionSerializer } from './auth/utils/session.serializer';
import { AuthenticationService } from './auth/auth.service';
import { UserController } from './user/user.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        PORT: Joi.number(),
        SESSION_SECRET: Joi.string().required(),
      })
    }),
    PassportModule.register({ session: true, defaultStrategy: 'local' }),
    UsersModule,
    AuthenticationModule,
    DatabaseModule,
  ],
  controllers: [UserController],
  providers: [LocalStrategy,SessionSerializer, LocalAuthGuard, AuthenticationService],
})
export class AppModule {}
