import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  const configService = app.get(ConfigService);

  const apiVersion = configService.get<string>('API_VERSION', 'v1');
  const frontendUrl = configService.get<string>(
    'FRONTEND_URL',
    'http://localhost:3000'
  );
  const port = configService.get<number>('PORT', 8080);

  app.setGlobalPrefix(`api/${apiVersion}`);

  app.enableCors({
    origin: frontendUrl,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Template API')
    .setDescription('The Template API description')
    .setVersion(apiVersion)
    .addTag('Template')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token'
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  app.getHttpAdapter().get('/swagger.json', (_, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(document);
  });

  writeFileSync(
    join(process.cwd(), 'swagger.json'),
    JSON.stringify(document, null, 2)
  );

  app.getHttpAdapter().get(`/api/${apiVersion}/redoc`, (_, res) => {
    const html = readFileSync(join(__dirname, '..', 'index.html'), 'utf8');
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  });

  app.use(
    `/api/${apiVersion}/docs`,
    apiReference({
      spec: {
        content: document,
      },
    })
  );

  await app.listen(port);

  logger.log(`🚀 Server running on http://localhost:${port}/api/${apiVersion}`);
  logger.log(
    `📘 Swagger Docs available at http://localhost:${port}/api/${apiVersion}/docs`
  );
}
bootstrap();
