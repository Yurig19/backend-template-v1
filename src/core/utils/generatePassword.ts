import { Logger, UnauthorizedException } from '@nestjs/common';
import * as CryptoJS from 'crypto-js';

const logger = new Logger('GeneratePassword');

export const generateHashPassword = (password: string): string => {
  try {
    return CryptoJS.AES.encrypt(
      password,
      process.env.CRYPTO_SECRET_KEY
    ).toString();
  } catch (error) {
    logger.error('Failed to generate hash password', error);
    throw new UnauthorizedException('Failed to encrypt password.');
  }
};

export const checkPassword = async (
  password: string,
  passwordEncrypted: string
): Promise<boolean> => {
  try {
    const passwordDecrypted = CryptoJS.AES.decrypt(
      passwordEncrypted,
      process.env.CRYPTO_SECRET_KEY
    );

    const originalPassword = passwordDecrypted.toString(CryptoJS.enc.Utf8);

    if (password === originalPassword) {
      return true;
    }
    return false;
  } catch (error) {
    logger.error('Failed to check password', error);
    throw new UnauthorizedException('Failed to verify password.');
  }
};

export const decryptHashPassword = (password: string): string => {
  try {
    return CryptoJS.AES.decrypt(
      password,
      process.env.CRYPTO_SECRET_KEY
    ).toString();
  } catch (error) {
    logger.error('Failed to decrypt hash password', error);
    throw new UnauthorizedException('Failed to decrypt password.');
  }
};
