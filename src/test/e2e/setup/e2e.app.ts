import { AuthModule } from '@/modules/_auth/auth.module';
import { RolesModule } from '@/modules/roles/roles.module';
import { UserModule } from '@/modules/users/users.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

export const createE2EApp = async (): Promise<INestApplication> => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [CqrsModule, UserModule, RolesModule, AuthModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.init();

  return app;
};
