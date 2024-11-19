import 'dotenv/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { getEnvOrDefault } from '../common/utils/env';

export function attachSwaggerDocumentation(app) {
  const config = new DocumentBuilder()
    .setTitle('Auth-Docs Service API')
    .setDescription('Auth-Docs Service API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(
    getEnvOrDefault('SWAGGER_API_PATH', 'documentation'),
    app,
    document,
  );
}
