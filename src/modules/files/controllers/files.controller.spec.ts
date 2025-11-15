import * as path from 'path';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/core/database/prisma.service';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';

describe('FilesController (E2E) - Real Login', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let jwtToken: string; // token real

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    require('dotenv').config({ path: '.env.test' });

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
      })
    );

    prisma = app.get(PrismaService);

    await app.init();

    //
    // 💥 LIMPA TODO BANCO antes do teste
    //
    const tables = await prisma.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    for (const t of tables) {
      await prisma.$executeRawUnsafe(
        `TRUNCATE TABLE "public"."${t.tablename}" RESTART IDENTITY CASCADE;`
      );
    }

    //
    // 🧪 LOGIN REAL (usuário deve existir no seed)
    //
    const login = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'admin@example.com',
      password: 'admin123',
    });

    expect(login.status).toBe(201);
    expect(login.body.accessToken).toBeDefined();

    jwtToken = login.body.accessToken;
  });

  afterAll(async () => {
    //
    // 💥 LIMPA TODO BANCO depois dos testes
    //
    const tables = await prisma.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    for (const t of tables) {
      await prisma.$executeRawUnsafe(
        `TRUNCATE TABLE "public"."${t.tablename}" RESTART IDENTITY CASCADE;`
      );
    }

    await app.close();
  });

  it('POST /files/create → deve criar arquivo real', async () => {
    const filePath = path.join(__dirname, 'mock.txt');

    const res = await request(app.getHttpServer())
      .post('/files/create?isPrivate=false')
      .set('Authorization', `Bearer ${jwtToken}`)
      .attach('file', filePath);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('uuid');
    expect(res.body.filename).toBe('mock.txt');

    // validação no banco
    const dbFile = await prisma.file.findUnique({
      where: { uuid: res.body.uuid },
    });

    expect(dbFile).not.toBeNull();
    expect(dbFile?.filename).toBe('mock.txt');
    expect(dbFile?.path).toBeDefined();
  });

  it('POST /files/create → erro se faltar arquivo', async () => {
    const res = await request(app.getHttpServer())
      .post('/files/create')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(res.status).toBe(400);
  });
});
