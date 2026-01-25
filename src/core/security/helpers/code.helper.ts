import { createHmac, randomInt, timingSafeEqual } from 'crypto';

const CODE_LENGTH = 6;
const CODE_SECRET = process.env.CODE_SECRET as string;

/**
 * Gera um código numérico aleatório
 */
export const generateCode = (length = CODE_LENGTH): string => {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  return randomInt(min, max).toString();
};

/**
 * Gera o hash do código usando HMAC + SHA-256
 */
export const hashCode = (code: string): string => {
  return createHmac('sha256', CODE_SECRET).update(code).digest('hex');
};

/**
 * Valida o código comparando com o hash salvo (timing-safe)
 */
export const verifyCode = (code: string, storedHash: string): boolean => {
  const incomingHash = hashCode(code);

  const a = Buffer.from(incomingHash, 'hex');
  const b = Buffer.from(storedHash, 'hex');

  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
};
