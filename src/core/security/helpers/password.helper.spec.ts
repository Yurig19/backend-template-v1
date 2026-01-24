import { checkPassword, generateHashPassword } from './password.helper';

describe('PasswordHelper', () => {
  const password = 'StrongPassword123!';

  describe('generateHashPassword', () => {
    it('should generate a hashed password', async () => {
      const hash = await generateHashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toEqual(password);
      expect(typeof hash).toBe('string');
    });
  });

  describe('checkPassword', () => {
    it('should return true when password matches hash', async () => {
      const hash = await generateHashPassword(password);

      const isValid = await checkPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should return false when password does not match hash', async () => {
      const hash = await generateHashPassword(password);

      const isValid = await checkPassword('wrong-password', hash);

      expect(isValid).toBe(false);
    });
  });
});
