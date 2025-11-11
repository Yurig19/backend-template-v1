import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as ngrok from '@ngrok/ngrok';
import { apiReference } from '@scalar/nestjs-api-reference';
import { AppModule } from './app.module';

async function bootstrap() {
  let app = await NestFactory.create(AppModule);

  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);

  // 🔧 Configurações gerais
  const apiVersion = configService.get<string>('API_VERSION', 'v1');
  const frontendUrl = configService.get<string>(
    'FRONTEND_URL',
    'http://localhost:3000'
  );
  const enableHttps = configService.get<string>('ENABLE_HTTPS') === 'true';
  const enableNgrok = configService.get<string>('ENABLE_NGROK') === 'true';
  const ngrokToken = configService.get<string>('NGROK_AUTHTOKEN');
  const port = configService.get<number>('PORT', enableHttps ? 8443 : 8080);

  // 🔒 HTTPS
  const keyPath = configService.get<string>('HTTPS_KEY_PATH');
  const certPath = configService.get<string>('HTTPS_CERT_PATH');
  const httpsOptions = {};

  if (enableHttps && keyPath && certPath) {
    try {
      Object.assign(httpsOptions, {
        httpsOptions: {
          key: readFileSync(join(process.cwd(), keyPath)),
          cert: readFileSync(join(process.cwd(), certPath)),
        },
      });
      logger.log('✅ HTTPS enabled using provided certificates.');
    } catch (err) {
      logger.error('❌ Failed to load HTTPS certificates:', err.message);
    }
  }

  // 🚀 Recria o app com HTTPS se necessário
  if (Object.keys(httpsOptions).length > 0) {
    await app.close();
    const httpsApp = await NestFactory.create(AppModule, httpsOptions);
    app = httpsApp;
  }

  app.setGlobalPrefix(`api/${apiVersion}`);

  app.enableCors({
    origin: frontendUrl,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // 🧭 Swagger
  const config = new DocumentBuilder()
    .setTitle('Template API')
    .setDescription('The Template API description')
    .setVersion(apiVersion)
    .addTag('Template')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
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

  const protocol = enableHttps ? 'https' : 'http';
  const baseUrl = `${protocol}://localhost:${port}/api/${apiVersion}`;

  logger.log(`🚀 Server running on ${baseUrl}`);
  logger.log(
    `📘 Swagger Docs available at ${baseUrl.replace('/api', '')}/api/${apiVersion}/docs`
  );

  // 🌐 NGROK
  let listener: Awaited<ReturnType<typeof ngrok.connect>> | null = null;

  if (enableNgrok) {
    try {
      if (!ngrokToken) {
        logger.warn('⚠️ NGROK_AUTHTOKEN not provided — skipping Ngrok.');
      } else {
        listener = await ngrok.connect({
          addr: port,
          authtoken: ngrokToken,
        });

        const publicUrl = listener.url();
        logger.log(`🌍 Ngrok tunnel active: ${publicUrl}`);
        logger.log(`🔗 API available at ${publicUrl}/api/${apiVersion}`);
        logger.log(`📘 Swagger Docs at ${publicUrl}/api/${apiVersion}/docs`);
      }
    } catch (err) {
      logger.error('❌ Failed to start Ngrok:', err.message);
    }
  }

  const shutdown = async () => {
    logger.log('🛑 Shutting down application...');

    if (listener) {
      try {
        await listener.close();
        logger.log('🧩 Ngrok tunnel closed successfully.');
      } catch (err) {
        logger.warn('⚠️ Failed to close Ngrok tunnel:', err.message);
      }
    }

    await app.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap();
