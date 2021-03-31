import { INestApplication, ExecutionContext } from '@nestjs/common';
import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { ClientsModule, Transport, ClientProxy } from '@nestjs/microservices';
import { getConnection } from 'typeorm';
import { Repository } from 'typeorm';
import User from './user.entity';
import { AppModule } from '../app.module';
import { UserController } from './user.controller';
import { UserCreateDto } from './dto/userCreate.dto';
import { UsersModule } from './user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalAuthGuard } from 'src/auth/utils/local.guard';
import { SessionGuard } from 'src/auth/utils/session.guard';

jest.setTimeout(5000)

describe('User Microservice', () => {
  let app: INestApplication;
  let client: ClientProxy;
  let userController: UserController;
  let userRepository: Repository<User>;

  beforeAll(async (done) => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'postgres',
          password: 'postgres',
          database: 'nest_t4',
          entities: ['./**/*.entity.ts'],
          synchronize: false,
        }),
        AppModule,
        UsersModule,
        ClientsModule.register([
          { name: 'clientToken', transport: Transport.TCP },
        ]),
      ],
    })
      .overrideGuard(LocalAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = {
            email: 'myemail12@email.com',
            name: 'John',
            password: '12345678',
          };
          return true;
        },
      })
      .overrideGuard(SessionGuard)
      .useValue({
        canActivate: () => {
          return true;
        },
      })
      .compile();

    userRepository = moduleFixture.get('UserRepository');
    userController = moduleFixture.get<UserController>(UserController);

    app = moduleFixture.createNestApplication();

    app.connectMicroservice({
      transport: Transport.TCP,
    });

    await app.startAllMicroservicesAsync();
    await app.init();

    client = app.get('clientToken');
    await client.connect();
    done();
  });

  afterAll(async (done) => {
    const connection = getConnection();

    await connection.createQueryBuilder().delete().from(User).execute();

    await app.close();
    client.close();
    done()
  });

  describe('User story', () => {
    const payload: UserCreateDto = {
      email: 'myemail12345@email.com',
      name: 'John',
      password: '12345678',
    };

    it('should register new user', async (done) => {
      await request
        .agent(app.getHttpServer())
        .post('/auth/signup')
        .send(payload)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201);
        done()
    });

    it('should login new user', async (done) => {
      const { body, headers } = await request
        .agent(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: payload.email,
          password: payload.password,
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);
      done();
    });

    it('should return an array of users', async (done) => {
      const { body } = await request
        .agent(app.getHttpServer())
        .get('/user/list')
        .expect(200);

      expect(body).toEqual([ [ { email: 'myemail12345@email.com' } ], 1 ]);
      done()
    });
  });
});
