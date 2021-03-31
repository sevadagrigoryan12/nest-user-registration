import { config } from "./ormconfig"
import { TypeOrmModule } from '@nestjs/typeorm';

export = config;

TypeOrmModule.forRoot(config);