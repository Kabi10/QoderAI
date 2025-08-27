/**
 * Jest Configuration for ES Modules
 */

export default {
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  transform: {},
  extensionsToTreatAsEsm: ['.js'],
  moduleNameMapping: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/cli.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 40, 
      lines: 40,
      statements: 40
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 30000,
  verbose: true,
  detectOpenHandles: true,
  forceExit: true
};