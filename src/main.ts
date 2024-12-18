import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { attachSwaggerDocumentation } from './documentation/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  if (process.env.BASE_PATH) {
    app.setGlobalPrefix(process.env.BASE_PATH);
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  attachSwaggerDocumentation(app);

  await app.listen(3000);
}
bootstrap();
