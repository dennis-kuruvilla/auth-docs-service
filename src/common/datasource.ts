import 'dotenv/config';
import { DataSource } from 'typeorm';
import { getEnvOrThrow } from './utils/env';

export const DefaultDataSource = new DataSource({
  type: getEnvOrThrow('DB_TYPE') as any,
  host: getEnvOrThrow('DB_HOST'),
  port: Number(getEnvOrThrow('DB_PORT')),
  username: getEnvOrThrow('DB_USERNAME'),
  password: getEnvOrThrow('DB_PASSWORD'),
  database: getEnvOrThrow('DB_NAME'),
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
});
