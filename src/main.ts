import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  if (process.env.BASE_PATH) {
    app.setGlobalPrefix(process.env.BASE_PATH);
  }

  await app.listen(3000);
}
bootstrap();
