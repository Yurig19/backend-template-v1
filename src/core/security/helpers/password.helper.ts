import { Logger, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

const logger = new Logger('GeneratePassword');

const SALT_ROUNDS = 10;

const { hash, compare } = bcrypt;

export const generateHashPassword = async (
  password: string
): Promise<string> => {
  try {
    return await hash(password, SALT_ROUNDS);
  } catch (error) {
    logger.error('Failed to hash password', error);
    throw new UnauthorizedException('Failed to hash password.');
  }
};

export const checkPassword = async (
  password: string,
  passwordHash: string
): Promise<boolean> => {
  try {
    return await compare(password, passwordHash);
  } catch (error) {
    logger.error('Failed to check password', error);
    throw new UnauthorizedException('Failed to verify password.');
  }
};
