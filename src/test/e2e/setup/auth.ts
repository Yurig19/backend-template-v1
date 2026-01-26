import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export const loginAndGetToken = async (
  app: INestApplication,
  email: string,
  password: string
): Promise<string> => {
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password });

  return response.body.accessToken;
};
