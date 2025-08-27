/**
 * Unit Tests for ValidationEngine
 * Tests input validation, output validation, and security/performance checks
 */

import { ValidationEngine } from '../src/validation/ValidationEngine.js';
import { jest } from '@jest/globals';

describe('ValidationEngine', () => {
  let validationEngine;

  beforeEach(async () => {
    validationEngine = new ValidationEngine();
    await validationEngine.loadValidationRules();
  });

  describe('Initialization', () => {
    test('should create instance with default properties', () => {
      expect(validationEngine).toBeDefined();
      expect(validationEngine.validationRules).toBeInstanceOf(Map);
      expect(validationEngine.securityRules).toBeInstanceOf(Map);
      expect(validationEngine.performanceRules).toBeInstanceOf(Map);
    });

    test('should load validation rules successfully', () => {
      expect(validationEngine.validationRules.size).toBeGreaterThan(0);
      expect(validationEngine.securityRules.size).toBeGreaterThan(0);
      expect(validationEngine.performanceRules.size).toBeGreaterThan(0);
    });

    test('should load expected validation rules', () => {
      expect(validationEngine.validationRules.has('syntax-check')).toBe(true);
      expect(validationEngine.validationRules.has('file-structure')).toBe(true);
      expect(validationEngine.validationRules.has('template-completeness')).toBe(true);
      expect(validationEngine.validationRules.has('dependency-check')).toBe(true);
    });
  });

  describe('Input Validation', () => {
    test('should validate valid inputs successfully', async () => {
      const validInputs = {
        category: 'web-app',
        projectName: 'TestProject',
        techStack: ['React', 'Node.js'],
        targetAudience: 'Developers',
        deploymentTarget: 'Vercel',
        outputPath: './output'
      };

      const result = await validationEngine.validateInputs(validInputs);
      expect(result).toBeDefined();
      expect(result.category).toBe('web-app');
      expect(result.projectName).toBe('TestProject');
    });

    test('should reject inputs missing required fields', async () => {
      const invalidInputs = {
        techStack: ['React']
        // Missing category and projectName
      };

      await expect(validationEngine.validateInputs(invalidInputs)).rejects.toThrow();
    });

    test('should validate project name length', async () => {
      const invalidInputs = {
        category: 'web-app',
        projectName: '', // Empty project name
        techStack: ['React']
      };

      await expect(validationEngine.validateInputs(invalidInputs)).rejects.toThrow();
    });

    test('should validate output path format', async () => {
      const invalidInputs = {
        category: 'web-app',
        projectName: 'Test',
        outputPath: 'invalid<>path' // Invalid characters
      };

      await expect(validationEngine.validateInputs(invalidInputs)).rejects.toThrow();
    });

    test('should normalize inputs correctly', async () => {
      const inputs = {
        category: 'WEB-APP', // Should be lowercase
        projectName: '  Test Project  ', // Should be trimmed
        techStack: ['react', 'NODE.JS'], // Should be normalized
        constraints: 'single constraint' // Should be array
      };

      const result = await validationEngine.validateInputs(inputs);
      expect(result.category).toBe('web-app');
      expect(result.projectName).toBe('Test Project');
      expect(result.techStack).toBeInstanceOf(Array);
      expect(result.constraints).toBeInstanceOf(Array);
    });
  });

  describe('Input Security Validation', () => {
    test('should detect suspicious content in inputs', async () => {
      const suspiciousInputs = {
        category: 'web-app',
        projectName: '<script>alert("xss")</script>',
        targetAudience: 'javascript:void(0)',
        techStack: ['React']
      };

      const result = await validationEngine.performInputSecurityValidation(suspiciousInputs);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('suspicious content'))).toBe(true);
    });

    test('should detect path traversal attempts', async () => {
      const traversalInputs = {
        outputPath: '../../../etc/passwd'
      };

      const result = await validationEngine.performInputSecurityValidation(traversalInputs);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('unsafe directory traversal'))).toBe(true);
    });

    test('should pass clean inputs', async () => {
      const cleanInputs = {
        category: 'web-app',
        projectName: 'Clean Project Name',
        targetAudience: 'Web developers',
        outputPath: './clean/path'
      };

      const result = await validationEngine.performInputSecurityValidation(cleanInputs);
      expect(result.warnings.length).toBe(0);
    });
  });

  describe('Output Validation (Fixed File Structure Handling)', () => {
    test('should validate nested file structure correctly', async () => {
      const promptSuite = {
        files: {
          'src': {
            description: 'Source files',
            files: [
              { path: 'src/App.js', content: 'console.log("hello");', size: 100 },
              { path: 'src/index.js', content: 'import App from "./App";', size: 150 }
            ]
          },
          'docs': {
            description: 'Documentation',
            files: [
              { path: 'README.md', content: '# Project', size: 50 }
            ]
          }
        }
      };

      const result = await validationEngine.validateOutput(promptSuite);
      expect(result).toBeDefined();
      expect(result.valid).toBe(true);
      expect(result.security.passed).toBe(true);
      expect(result.performance.passed).toBe(true);
      expect(result.quality.score).toBeGreaterThan(0);
    });

    test('should handle empty file structure', async () => {
      const promptSuite = {
        files: {}
      };

      const result = await validationEngine.validateOutput(promptSuite);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('No files were generated');
    });

    test('should handle invalid file structure format', async () => {
      const promptSuite = {
        files: 'invalid' // Should be object
      };

      const result = await validationEngine.validateOutput(promptSuite);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Files structure must be an object'))).toBe(true);
    });

    test('should extract files from nested structure correctly', () => {
      const filesStructure = {
        'src': {
          files: [
            { path: 'src/file1.js', content: 'test', size: 10 },
            { path: 'src/file2.js', content: 'test', size: 20 }
          ]
        },
        'docs': {
          files: [
            { path: 'README.md', content: 'test', size: 30 }
          ]
        }
      };

      const allFiles = validationEngine.extractAllFilesFromStructure(filesStructure);
      expect(allFiles).toHaveLength(3);
      expect(allFiles.map(f => f.path)).toContain('src/file1.js');
      expect(allFiles.map(f => f.path)).toContain('src/file2.js');
      expect(allFiles.map(f => f.path)).toContain('README.md');
    });
  });

  describe('File Validation', () => {
    test('should validate JavaScript syntax correctly', async () => {
      const validJSFile = {
        path: 'test.js',
        content: 'function test() { return "hello"; }'
      };

      const result = await validationEngine.validateSyntax(validJSFile);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    test('should detect JavaScript syntax errors', async () => {
      const invalidJSFile = {
        path: 'test.js',
        content: 'function test() { return "hello"; // Missing closing brace'
      };

      const result = await validationEngine.validateSyntax(invalidJSFile);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should validate JSON syntax correctly', async () => {
      const validJSONFile = {
        path: 'package.json',
        content: '{"name": "test", "version": "1.0.0"}'
      };

      const result = await validationEngine.validateSyntax(validJSONFile);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    test('should detect JSON syntax errors', async () => {
      const invalidJSONFile = {
        path: 'package.json',
        content: '{"name": "test", "version":}' // Invalid JSON
      };

      const result = await validationEngine.validateSyntax(invalidJSONFile);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Security Validation', () => {
    test('should detect potential secrets in files', async () => {
      const fileWithSecret = {
        path: 'config.js',
        content: 'const API_KEY = "sk-1234567890abcdef1234567890abcdef";'
      };

      const result = await validationEngine.scanForSecrets(fileWithSecret);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('secret detected'))).toBe(true);
    });

    test('should detect path traversal in file content', async () => {
      const fileWithTraversal = {
        path: 'suspicious.js',
        content: 'fs.readFile("../../../etc/passwd");'
      };

      const result = await validationEngine.checkPathTraversal(fileWithTraversal);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('path traversal'))).toBe(true);
    });

    test('should pass clean files', async () => {
      const cleanFile = {
        path: 'clean.js',
        content: 'function hello() { console.log("Hello World"); }'
      };

      const secretResult = await validationEngine.scanForSecrets(cleanFile);
      const traversalResult = await validationEngine.checkPathTraversal(cleanFile);
      
      expect(secretResult.warnings.length).toBe(0);
      expect(traversalResult.warnings.length).toBe(0);
    });
  });

  describe('Performance Validation', () => {
    test('should validate file size within limits', async () => {
      const normalFile = {
        path: 'normal.js',
        content: 'console.log("test");',
        size: 1000 // 1KB
      };

      const result = await validationEngine.validateFileSize(normalFile);
      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBe(0);
    });

    test('should detect oversized files', async () => {
      const largeFile = {
        path: 'large.js',
        content: 'x'.repeat(10000000), // 10MB content
        size: 10000000
      };

      const result = await validationEngine.validateFileSize(largeFile);
      expect(result.valid).toBe(false);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('exceeds maximum size'))).toBe(true);
    });
  });

  describe('Quality Assessment (Fixed for Nested Structure)', () => {
    test('should assess quality of file structure correctly', async () => {
      const goodQualityFiles = {
        'src': {
          files: [
            { 
              path: 'src/App.js', 
              content: '/** App component */\nfunction App() { return "Hello"; }',
              size: 100 
            },
            { 
              path: 'src/utils.js', 
              content: '// Utility functions\nexport function helper() {}',
              size: 80 
            }
          ]
        },
        'docs': {
          files: [
            { path: 'README.md', content: '# Project Documentation', size: 50 }
          ]
        },
        'tests': {
          files: [
            { path: 'App.test.js', content: 'describe("App", () => {});', size: 60 }
          ]
        }
      };

      const result = await validationEngine.assessQuality(goodQualityFiles);
      expect(result.score).toBeGreaterThan(0);
      expect(result.metrics.totalFiles).toBe(4);
      expect(result.metrics.codeQuality).toBeGreaterThan(0);
      expect(result.metrics.documentation).toBeGreaterThan(0);
      expect(result.metrics.testCoverage).toBeGreaterThan(0);
    });

    test('should handle empty file structure in quality assessment', async () => {
      const emptyFiles = {};

      const result = await validationEngine.assessQuality(emptyFiles);
      expect(result.score).toBe(0);
      expect(result.metrics.totalFiles).toBe(0);
    });

    test('should identify file types correctly', () => {
      expect(validationEngine.isCodeFile('App.js')).toBe(true);
      expect(validationEngine.isCodeFile('App.tsx')).toBe(true);
      expect(validationEngine.isCodeFile('README.md')).toBe(false);
      
      expect(validationEngine.isDocumentationFile('README.md')).toBe(true);
      expect(validationEngine.isDocumentationFile('docs.txt')).toBe(true);
      expect(validationEngine.isDocumentationFile('App.js')).toBe(false);
      
      expect(validationEngine.isTestFile('App.test.js')).toBe(true);
      expect(validationEngine.isTestFile('__tests__/App.js')).toBe(true);
      expect(validationEngine.isTestFile('App.spec.js')).toBe(true);
      expect(validationEngine.isTestFile('App.js')).toBe(false);
    });
  });

  describe('Utility Methods', () => {
    test('should detect suspicious content patterns', () => {
      expect(validationEngine.containsSuspiciousContent('<script>')).toBe(true);
      expect(validationEngine.containsSuspiciousContent('javascript:void(0)')).toBe(true);
      expect(validationEngine.containsSuspiciousContent('onclick=')).toBe(true);
      expect(validationEngine.containsSuspiciousContent('eval(')).toBe(true);
      expect(validationEngine.containsSuspiciousContent('normal text')).toBe(false);
    });

    test('should detect basic JavaScript syntax errors', () => {
      expect(validationEngine.hasBasicJSSyntaxErrors('{ unmatched brace')).toBe(true);
      expect(validationEngine.hasBasicJSSyntaxErrors('( unmatched paren')).toBe(true);
      expect(validationEngine.hasBasicJSSyntaxErrors('function() { return "ok"; }')).toBe(false);
    });

    test('should detect basic HTML syntax errors', () => {
      expect(validationEngine.hasBasicHTMLSyntaxErrors('<html>content</html>')).toBe(true); // Missing DOCTYPE
      expect(validationEngine.hasBasicHTMLSyntaxErrors('<!DOCTYPE html><html></html>')).toBe(false);
      expect(validationEngine.hasBasicHTMLSyntaxErrors('plain text')).toBe(false);
    });

    test('should identify files needing syntax validation', () => {
      expect(validationEngine.needsSyntaxValidation('App.js')).toBe(true);
      expect(validationEngine.needsSyntaxValidation('package.json')).toBe(true);
      expect(validationEngine.needsSyntaxValidation('index.html')).toBe(true);
      expect(validationEngine.needsSyntaxValidation('styles.css')).toBe(true);
      expect(validationEngine.needsSyntaxValidation('README.md')).toBe(false);
      expect(validationEngine.needsSyntaxValidation('image.png')).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('should handle validation rule loading errors', async () => {
      const invalidEngine = new ValidationEngine();
      
      // Mock a failure in rule loading
      invalidEngine.loadCoreValidationRules = jest.fn().mockRejectedValue(new Error('Load failed'));
      
      await expect(invalidEngine.loadValidationRules()).rejects.toThrow('Load failed');
    });

    test('should handle file validation errors gracefully', async () => {
      const corruptedFile = {
        path: 'test.js',
        content: null // Invalid content
      };

      const result = await validationEngine.validateSingleFile(corruptedFile);
      expect(result).toBeDefined();
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});