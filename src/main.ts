import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
const passport = require('passport');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redis = require('redis');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      cookie: { maxAge: 1200000 },
      resave: false,
      saveUninitialized: false,
      store: new RedisStore({
        client: redis.createClient(),
      }),
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: false,
      transform: true,
    }),
  );
  await app.listen(3000);
}
bootstrap();
