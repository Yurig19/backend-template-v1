import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const apiVersion = process.env.API_VERSION ?? 'v1';

  app.setGlobalPrefix(`api/${apiVersion}`);

  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Impermais Api')
    .setDescription('The Impermais API description')
    .setVersion('1.0')
    .addTag('Impermais')
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

  SwaggerModule.setup(`api/${apiVersion}/docs`, app, document);

  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
