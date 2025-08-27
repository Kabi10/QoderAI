/**
 * Jest Test Setup
 * Global setup and configuration for tests
 */

// Set up global test environment
global.__DEV__ = true;

// Increase timeout for integration tests
jest.setTimeout(30000);

// Mock console for cleaner test output
const originalConsole = console;

beforeEach(() => {
  // Suppress logs during tests unless DEBUG is set
  if (!process.env.DEBUG) {
    global.console = {
      ...originalConsole,
      log: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: originalConsole.error // Keep errors visible
    };
  }
});

afterEach(() => {
  // Restore console
  global.console = originalConsole;
});

// Clean up after all tests
afterAll(() => {
  // Clean up any test artifacts
});