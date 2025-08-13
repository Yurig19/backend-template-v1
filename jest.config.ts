import { config } from 'dotenv';
import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test.local' });
} else {
  config();
}

const jestConfig: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths || {}, {
    prefix: '<rootDir>/',
  }),
};

export default jestConfig;
