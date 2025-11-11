import { Logger, UnauthorizedException } from '@nestjs/common';
import * as CryptoJS from 'crypto-js';

const logger = new Logger('GeneratePassword');

const secretKey = process.env.CRYPTO_SECRET_KEY;

export const generateHashPassword = (password: string): string => {
  try {
    return CryptoJS.AES.encrypt(password, secretKey).toString();
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
      secretKey
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
    return CryptoJS.AES.decrypt(password, secretKey).toString();
  } catch (error) {
    logger.error('Failed to decrypt hash password', error);
    throw new UnauthorizedException('Failed to decrypt password.');
  }
};
