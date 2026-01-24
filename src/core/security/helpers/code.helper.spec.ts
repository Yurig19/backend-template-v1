import { generateCode, hashCode, verifyCode } from './code.helper';

describe('Code Helper', () => {
  beforeAll(() => {
    process.env.CODE_SECRET = 'test-secret';
  });

  describe('generateCode', () => {
    it('should generate a numeric code with default length', () => {
      const code = generateCode();

      expect(code).toHaveLength(6);
      expect(code).toMatch(/^\d+$/);
    });

    it('should generate a numeric code with custom length', () => {
      const code = generateCode(8);

      expect(code).toHaveLength(8);
      expect(code).toMatch(/^\d+$/);
    });
  });

  describe('hashCode', () => {
    it('should return a deterministic hash for the same code', () => {
      const code = '123456';

      const hash1 = hashCode(code);
      const hash2 = hashCode(code);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
    });
  });

  describe('verifyCode', () => {
    it('should return true for a valid code', () => {
      const code = '654321';
      const hash = hashCode(code);

      const result = verifyCode(code, hash);

      expect(result).toBe(true);
    });

    it('should return false for an invalid code', () => {
      const code = '654321';
      const hash = hashCode(code);

      const result = verifyCode('000000', hash);

      expect(result).toBe(false);
    });
  });
});
