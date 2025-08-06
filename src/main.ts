import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const apiVersion = process.env.API_VERSION ?? 'v1';

  app.setGlobalPrefix(`api/${apiVersion}`);

  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    methods: ['GET', 'POST', 'Patch', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Template Api')
    .setDescription('The Template API description')
    .setVersion('1.0')
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

  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
