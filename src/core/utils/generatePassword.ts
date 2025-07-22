import * as CryptoJS from 'crypto-js';
import { HttpStatusCodeEnum } from '../enums/errors/statusCodeErrors.enum';
import { HttpStatusTextEnum } from '../enums/errors/statusTextError.enum';
import { AppError } from '../errors/app.error';

export const generateHashPassword = (password: string): string => {
  try {
    return CryptoJS.AES.encrypt(
      password,
      process.env.CRYPTO_SECRET_KEY
    ).toString();
  } catch (error) {
    throw new AppError(
      HttpStatusCodeEnum.UNAUTHORIZED,
      HttpStatusTextEnum.UNAUTHORIZED,
      `${error}`
    );
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
    throw new AppError(
      HttpStatusCodeEnum.UNAUTHORIZED,
      HttpStatusTextEnum.UNAUTHORIZED,
      `${error}`
    );
  }
};

export const decryptHashPassword = (password: string): string => {
  try {
    return CryptoJS.AES.decrypt(
      password,
      process.env.CRYPTO_SECRET_KEY
    ).toString();
  } catch (error) {
    throw new AppError(
      HttpStatusCodeEnum.UNAUTHORIZED,
      HttpStatusTextEnum.UNAUTHORIZED,
      `${error}`
    );
  }
};
