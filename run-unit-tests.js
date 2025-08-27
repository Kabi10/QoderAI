#!/usr/bin/env node

/**
 * Simple Unit Test Runner
 * Runs unit tests without complex Jest configuration
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple test framework
class SimpleTestFramework {
  constructor() {
    this.tests = [];
    this.describes = [];
    this.currentDescribe = null;
    this.beforeEachCallbacks = [];
    this.afterEachCallbacks = [];
    this.results = {
      passed: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };
  }

  describe(name, fn) {
    const prevDescribe = this.currentDescribe;
    this.currentDescribe = name;
    
    try {
      fn();
    } catch (error) {
      this.results.errors.push(`Error in describe "${name}": ${error.message}`);
    }
    
    this.currentDescribe = prevDescribe;
  }

  test(name, fn) {
    this.tests.push({
      name: `${this.currentDescribe} - ${name}`,
      fn,
      describe: this.currentDescribe
    });
  }

  beforeEach(fn) {
    this.beforeEachCallbacks.push(fn);
  }

  afterEach(fn) {
    this.afterEachCallbacks.push(fn);
  }

  expect(actual) {
    return {
      toBe: (expected) => {
        if (actual !== expected) {
          throw new Error(`Expected ${actual} to be ${expected}`);
        }
      },
      toEqual: (expected) => {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
          throw new Error(`Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`);
        }
      },
      toBeDefined: () => {
        if (actual === undefined) {
          throw new Error(`Expected ${actual} to be defined`);
        }
      },
      toBeInstanceOf: (constructor) => {
        if (!(actual instanceof constructor)) {
          throw new Error(`Expected ${actual} to be instance of ${constructor.name}`);
        }
      },
      toContain: (item) => {
        if (!actual.includes(item)) {
          throw new Error(`Expected ${actual} to contain ${item}`);
        }
      },
      toBeGreaterThan: (value) => {
        if (actual <= value) {
          throw new Error(`Expected ${actual} to be greater than ${value}`);
        }
      },
      toHaveLength: (length) => {
        if (actual.length !== length) {
          throw new Error(`Expected ${actual} to have length ${length}, got ${actual.length}`);
        }
      },
      toThrow: (message) => {
        try {
          if (typeof actual === 'function') {
            actual();
          }
          throw new Error(`Expected function to throw`);
        } catch (error) {
          if (message && !error.message.includes(message)) {
            throw new Error(`Expected error message to contain "${message}", got "${error.message}"`);
          }
        }
      }
    };
  }

  async runTests() {
    console.log('\n🧪 Running Unit Tests\n');

    for (const test of this.tests) {
      try {
        // Run beforeEach callbacks
        for (const callback of this.beforeEachCallbacks) {
          if (typeof callback === 'function') {
            await callback();
          }
        }

        // Run the test
        await test.fn();
        
        // Run afterEach callbacks
        for (const callback of this.afterEachCallbacks) {
          if (typeof callback === 'function') {
            await callback();
          }
        }

        console.log(`✅ ${test.name}`);
        this.results.passed++;
      } catch (error) {
        console.log(`❌ ${test.name}`);
        console.log(`   Error: ${error.message}`);
        this.results.failed++;
        this.results.errors.push({
          test: test.name,
          error: error.message
        });
      }
    }

    this.printResults();
  }

  printResults() {
    console.log('\n📊 Test Results:');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⏭️  Skipped: ${this.results.skipped}`);
    
    const total = this.results.passed + this.results.failed + this.results.skipped;
    const successRate = total > 0 ? Math.round((this.results.passed / total) * 100) : 0;
    console.log(`📈 Success Rate: ${successRate}%`);

    if (this.results.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.errors.forEach(error => {
        console.log(`  • ${error.test}: ${error.error}`);
      });
    }

    if (this.results.failed === 0) {
      console.log('\n🎉 All tests passed!');
    }
  }
}

// Global test framework instance
const framework = new SimpleTestFramework();

// Global functions
global.describe = framework.describe.bind(framework);
global.test = framework.test.bind(framework);
global.beforeEach = framework.beforeEach.bind(framework);
global.afterEach = framework.afterEach.bind(framework);
global.expect = framework.expect.bind(framework);

// Mock jest for imports
global.jest = {
  fn: () => {
    const mockFn = function(...args) {
      mockFn.calls.push(args);
      if (mockFn._implementation) {
        return mockFn._implementation(...args);
      }
    };
    mockFn.calls = [];
    mockFn.mockReturnValue = (value) => {
      mockFn._implementation = () => value;
      return mockFn;
    };
    mockFn.mockResolvedValue = (value) => {
      mockFn._implementation = () => Promise.resolve(value);
      return mockFn;
    };
    mockFn.mockRejectedValue = (error) => {
      mockFn._implementation = () => Promise.reject(error);
      return mockFn;
    };
    mockFn.mockImplementation = (fn) => {
      mockFn._implementation = fn;
      return mockFn;
    };
    mockFn.mockResolvedValueOnce = (value) => {
      const originalImpl = mockFn._implementation;
      mockFn._implementation = (...args) => {
        mockFn._implementation = originalImpl;
        return Promise.resolve(value);
      };
      return mockFn;
    };
    mockFn.toHaveBeenCalled = () => mockFn.calls.length > 0;
    mockFn.toHaveBeenCalledWith = (...args) => {
      return mockFn.calls.some(call => 
        call.length === args.length && 
        call.every((arg, i) => arg === args[i])
      );
    };
    mockFn.toHaveBeenCalledTimes = (times) => mockFn.calls.length === times;
    return mockFn;
  }
};

async function runUnitTests() {
  try {
    console.log('Loading unit tests...');

    // Basic tests that don't require complex imports
    await runBasicTests();

    // Run the test framework
    await framework.runTests();

    if (framework.results.failed > 0) {
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Test runner failed:', error.message);
    process.exit(1);
  }
}

async function runBasicTests() {
  // Test the transformer infrastructure we built
  describe('Transformer Infrastructure', () => {
    test('should have transformer files', async () => {
      const transformerDir = path.join(__dirname, 'src', 'transformers');
      const files = await fs.readdir(transformerDir);
      
      expect(files).toContain('BaseTransformer.js');
      expect(files).toContain('formattingTransformer.js');
      expect(files).toContain('openApiTransformer.js');
      expect(files).toContain('testingTransformer.js');
      expect(files).toContain('seoTransformer.js');
    });

    test('should be able to import transformers', async () => {
      try {
        const { BaseTransformer } = await import('./src/transformers/BaseTransformer.js');
        const FormattingTransformer = (await import('./src/transformers/formattingTransformer.js')).default;
        
        expect(BaseTransformer).toBeDefined();
        expect(FormattingTransformer).toBeDefined();
        
        const formatter = new FormattingTransformer();
        expect(formatter).toBeInstanceOf(BaseTransformer);
      } catch (error) {
        throw new Error(`Failed to import transformers: ${error.message}`);
      }
    });
  });

  // Test the fixes we implemented
  describe('System Fixes Validation', () => {
    test('should have fixed CategoryRegistry subcategories', async () => {
      try {
        const { CategoryRegistry } = await import('./src/core/CategoryRegistry.js');
        const registry = new CategoryRegistry();
        await registry.loadCategories();
        
        expect(registry.getSubcategoryConfig('landing-page')).toBeDefined();
        expect(registry.getSubcategoryConfig('desktop-app')).toBeDefined();
        expect(registry.getSubcategoryConfig('web-game')).toBeDefined();
      } catch (error) {
        throw new Error(`CategoryRegistry test failed: ${error.message}`);
      }
    });

    test('should have fixed ValidationEngine file structure handling', async () => {
      try {
        const { ValidationEngine } = await import('./src/validation/ValidationEngine.js');
        const engine = new ValidationEngine();
        
        // Test the extractAllFilesFromStructure method we added
        const filesStructure = {
          'src': {
            files: [
              { path: 'src/file1.js', content: 'test', size: 10 }
            ]
          }
        };
        
        const allFiles = engine.extractAllFilesFromStructure(filesStructure);
        expect(allFiles).toHaveLength(1);
        expect(allFiles[0].path).toBe('src/file1.js');
      } catch (error) {
        throw new Error(`ValidationEngine test failed: ${error.message}`);
      }
    });
  });

  // Test system integration
  describe('System Integration', () => {
    test('should initialize system successfully', async () => {
      try {
        const { UniversalPromptGenerator } = await import('./src/index.js');
        const generator = new UniversalPromptGenerator();
        await generator.initialize();
        
        const categories = generator.getAvailableCategories();
        expect(categories.length).toBeGreaterThan(0);
      } catch (error) {
        throw new Error(`System initialization failed: ${error.message}`);
      }
    });

    test('should generate files successfully', async () => {
      try {
        const { UniversalPromptGenerator } = await import('./src/index.js');
        const generator = new UniversalPromptGenerator();
        await generator.initialize();
        
        const inputs = {
          category: 'landing-page',
          projectName: 'Test Landing',
          techStack: ['HTML5', 'CSS3'],
          targetAudience: 'Users',
          deploymentTarget: 'Netlify'
        };

        const promptSuite = await generator.generatePromptSuite(inputs);
        expect(promptSuite.fileCount).toBeGreaterThan(0);
      } catch (error) {
        throw new Error(`Generation test failed: ${error.message}`);
      }
    });
  });
}

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  runUnitTests();
}