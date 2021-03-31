import { AuthenticationService } from './auth.service';
import { UsersModule } from '../user/user.module';
import { AuthenticationController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './utils/local.strategy';
import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { RedisService } from 'src/redis-cache/redis-cache.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          store: redisStore,
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          ttl: 120
        }),
    }),
    UsersModule,
    PassportModule,
  ],
  providers: [AuthenticationService, LocalStrategy, RedisService ],
  controllers: [AuthenticationController]
})
export class AuthenticationModule {}