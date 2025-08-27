/**
 * Unit Tests for PromptGenerator
 * Tests the core generation workflow and component orchestration
 */

import { PromptGenerator } from '../src/core/PromptGenerator.js';
import { CategoryRegistry } from '../src/core/CategoryRegistry.js';
import { TemplateEngine } from '../src/core/TemplateEngine.js';
import { ValidationEngine } from '../src/validation/ValidationEngine.js';
import { jest } from '@jest/globals';

describe('PromptGenerator', () => {
  let promptGenerator;
  let mockCategoryRegistry;
  let mockTemplateEngine;
  let mockValidationEngine;
  let mockOutputFormatter;

  beforeEach(() => {
    // Create mock dependencies
    mockCategoryRegistry = {
      getCategoryConfig: jest.fn(),
      isValidCategory: jest.fn()
    };

    mockTemplateEngine = {
      selectTemplates: jest.fn(),
      renderTemplates: jest.fn()
    };

    mockValidationEngine = {
      validateGeneratedContent: jest.fn()
    };

    mockOutputFormatter = {
      formatSuite: jest.fn()
    };

    promptGenerator = new PromptGenerator(
      mockCategoryRegistry,
      mockTemplateEngine,
      mockValidationEngine,
      mockOutputFormatter
    );
  });

  describe('Initialization', () => {
    test('should create instance with dependencies', () => {
      expect(promptGenerator).toBeDefined();
      expect(promptGenerator.categoryRegistry).toBe(mockCategoryRegistry);
      expect(promptGenerator.templateEngine).toBe(mockTemplateEngine);
      expect(promptGenerator.validationEngine).toBe(mockValidationEngine);
      expect(promptGenerator.outputFormatter).toBe(mockOutputFormatter);
    });
  });

  describe('Input Validation', () => {
    test('should validate inputs successfully', async () => {
      const validInputs = {
        category: 'web-app',
        projectName: 'Test Project',
        techStack: ['React'],
        targetAudience: 'Developers'
      };

      mockCategoryRegistry.isValidCategory.mockReturnValue(true);

      const result = await promptGenerator.validateInputs(validInputs);
      expect(result).toBeDefined();
      expect(result.category).toBe('web-app');
      expect(mockCategoryRegistry.isValidCategory).toHaveBeenCalledWith('web-app');
    });

    test('should reject invalid category', async () => {
      const invalidInputs = {
        category: 'invalid-category',
        projectName: 'Test Project'
      };

      mockCategoryRegistry.isValidCategory.mockReturnValue(false);

      await expect(promptGenerator.validateInputs(invalidInputs)).rejects.toThrow('Invalid category');
    });

    test('should require project name', async () => {
      const invalidInputs = {
        category: 'web-app'
        // Missing projectName
      };

      mockCategoryRegistry.isValidCategory.mockReturnValue(true);

      await expect(promptGenerator.validateInputs(invalidInputs)).rejects.toThrow('Project name is required');
    });

    test('should sanitize project name', async () => {
      const inputs = {
        category: 'web-app',
        projectName: '  Test Project!!!@#$  ',
        techStack: ['React']
      };

      mockCategoryRegistry.isValidCategory.mockReturnValue(true);

      const result = await promptGenerator.validateInputs(inputs);
      expect(result.projectName).toBe('Test Project');
    });

    test('should normalize tech stack', async () => {
      const inputs = {
        category: 'web-app',
        projectName: 'Test',
        techStack: ['react', 'NODE.JS', 'typescript']
      };

      mockCategoryRegistry.isValidCategory.mockReturnValue(true);

      const result = await promptGenerator.validateInputs(inputs);
      expect(result.techStack).toContain('React');
      expect(result.techStack).toContain('Node.js');
      expect(result.techStack).toContain('TypeScript');
    });
  });

  describe('Generation Context Creation', () => {
    test('should create generation context', () => {
      const inputs = {
        category: 'web-app',
        projectName: 'Test App',
        techStack: ['React', 'TypeScript'],
        targetAudience: 'Developers',
        deploymentTarget: 'Vercel',
        constraints: ['Mobile-first'],
        featureFlags: ['routing', 'testing']
      };

      const categoryConfig = {
        id: 'web-app',
        name: 'Web Application'
      };

      const context = promptGenerator.createGenerationContext(inputs, categoryConfig);

      expect(context).toBeDefined();
      expect(context.projectName).toBe('Test App');
      expect(context.category).toBe('web-app');
      expect(context.techStack).toEqual(['React', 'TypeScript']);
      expect(context.targetAudience).toBe('Developers');
      expect(context.deploymentTarget).toBe('Vercel');
      expect(context.constraints).toEqual(['Mobile-first']);
      expect(context.featureFlags).toEqual(['routing', 'testing']);
      expect(context.generatedAt).toBeDefined();
    });

    test('should add helper flags to context', () => {
      const inputs = {
        category: 'rest-api',
        projectName: 'API',
        techStack: ['React', 'TypeScript'],
        deploymentTarget: 'Vercel'
      };

      const context = promptGenerator.createGenerationContext(inputs, {});

      expect(context.hasReact).toBe(true);
      expect(context.hasTypeScript).toBe(true);
      expect(context.hasApi).toBe(true);
      expect(context.hasVercel).toBe(true);
    });

    test('should handle missing optional fields', () => {
      const inputs = {
        category: 'web-app',
        projectName: 'Test'
      };

      const context = promptGenerator.createGenerationContext(inputs, {});

      expect(context.techStack).toEqual([]);
      expect(context.constraints).toEqual([]);
      expect(context.featureFlags).toEqual([]);
    });
  });

  describe('Template Processing', () => {
    test('should orchestrate template selection and rendering', async () => {
      const inputs = {
        category: 'web-app',
        projectName: 'Test App',
        techStack: ['React']
      };

      const categoryConfig = {
        id: 'web-app',
        templates: ['prompts/react-web-app']
      };

      const mockTemplates = [
        { id: 'prompts/react-web-app', content: '# {{projectName}}' }
      ];

      const mockRenderedFiles = [
        { path: 'README.md', content: '# Test App', size: 10 }
      ];

      mockCategoryRegistry.getCategoryConfig.mockResolvedValue(categoryConfig);
      mockTemplateEngine.selectTemplates.mockResolvedValue(mockTemplates);
      mockTemplateEngine.renderTemplates.mockResolvedValue(mockRenderedFiles);
      mockValidationEngine.validateGeneratedContent.mockResolvedValue(mockRenderedFiles);
      mockOutputFormatter.formatSuite.mockResolvedValue({
        files: { root: { files: mockRenderedFiles } },
        fileCount: 1,
        totalSize: 10
      });

      const result = await promptGenerator.generate(inputs);

      expect(mockTemplateEngine.selectTemplates).toHaveBeenCalledWith(categoryConfig, inputs);
      expect(mockTemplateEngine.renderTemplates).toHaveBeenCalledWith(mockTemplates, expect.any(Object));
      expect(result.fileCount).toBe(1);
    });
  });

  describe('Transformation Application', () => {
    test('should apply category transformations', async () => {
      const files = [
        { path: 'test.js', content: 'test' }
      ];

      const categoryConfig = {
        transformations: [
          { type: 'formatting', config: { prettier: true } }
        ]
      };

      // Mock the loadTransformer method
      const mockTransformer = {
        transform: jest.fn().mockResolvedValue([
          { path: 'test.js', content: 'formatted test' }
        ])
      };

      promptGenerator.loadTransformer = jest.fn().mockResolvedValue(mockTransformer);

      const result = await promptGenerator.applyCategoryTransformations(files, categoryConfig, {});

      expect(promptGenerator.loadTransformer).toHaveBeenCalledWith('formatting');
      expect(mockTransformer.transform).toHaveBeenCalledWith(files, { prettier: true }, {});
      expect(result[0].content).toBe('formatted test');
    });

    test('should handle transformation errors gracefully', async () => {
      const files = [{ path: 'test.js', content: 'test' }];
      const categoryConfig = {
        transformations: [
          { type: 'invalid-transformer', config: {} }
        ]
      };

      promptGenerator.loadTransformer = jest.fn().mockRejectedValue(new Error('Transformer not found'));

      const result = await promptGenerator.applyCategoryTransformations(files, categoryConfig, {});

      // Should return original files when transformation fails
      expect(result).toEqual(files);
    });

    test('should skip transformations when none configured', async () => {
      const files = [{ path: 'test.js', content: 'test' }];
      const categoryConfig = {}; // No transformations

      const result = await promptGenerator.applyCategoryTransformations(files, categoryConfig, {});

      expect(result).toEqual(files);
    });

    test('should apply multiple transformations in sequence', async () => {
      const files = [{ path: 'test.js', content: 'test' }];
      const categoryConfig = {
        transformations: [
          { type: 'formatting', config: {} },
          { type: 'testing', config: {} }
        ]
      };

      const mockFormattingTransformer = {
        transform: jest.fn().mockResolvedValue([
          { path: 'test.js', content: 'formatted' }
        ])
      };

      const mockTestingTransformer = {
        transform: jest.fn().mockResolvedValue([
          { path: 'test.js', content: 'formatted' },
          { path: 'test.test.js', content: 'test file' }
        ])
      };

      promptGenerator.loadTransformer = jest.fn()
        .mockResolvedValueOnce(mockFormattingTransformer)
        .mockResolvedValueOnce(mockTestingTransformer);

      const result = await promptGenerator.applyCategoryTransformations(files, categoryConfig, {});

      expect(promptGenerator.loadTransformer).toHaveBeenCalledTimes(2);
      expect(mockFormattingTransformer.transform).toHaveBeenCalled();
      expect(mockTestingTransformer.transform).toHaveBeenCalled();
      expect(result).toHaveLength(2); // Original + test file
    });
  });

  describe('Transformer Loading', () => {
    test('should load transformer dynamically', async () => {
      // This tests the actual loadTransformer implementation
      const realPromptGenerator = new PromptGenerator(
        mockCategoryRegistry,
        mockTemplateEngine,
        mockValidationEngine,
        mockOutputFormatter
      );

      const transformer = await realPromptGenerator.loadTransformer('formatting');
      expect(transformer).toBeDefined();
      expect(typeof transformer.transform).toBe('function');
    });

    test('should throw error for missing transformer', async () => {
      const realPromptGenerator = new PromptGenerator(
        mockCategoryRegistry,
        mockTemplateEngine,
        mockValidationEngine,
        mockOutputFormatter
      );

      await expect(realPromptGenerator.loadTransformer('non-existent')).rejects.toThrow('Failed to load transformer');
    });
  });

  describe('Error Handling', () => {
    test('should handle category loading errors', async () => {
      const inputs = { category: 'web-app', projectName: 'Test' };

      mockCategoryRegistry.getCategoryConfig.mockRejectedValue(new Error('Category not found'));

      await expect(promptGenerator.generate(inputs)).rejects.toThrow('Category not found');
    });

    test('should handle template selection errors', async () => {
      const inputs = { category: 'web-app', projectName: 'Test' };

      mockCategoryRegistry.getCategoryConfig.mockResolvedValue({ id: 'web-app' });
      mockTemplateEngine.selectTemplates.mockRejectedValue(new Error('Template error'));

      await expect(promptGenerator.generate(inputs)).rejects.toThrow('Template error');
    });

    test('should handle template rendering errors', async () => {
      const inputs = { category: 'web-app', projectName: 'Test' };

      mockCategoryRegistry.getCategoryConfig.mockResolvedValue({ id: 'web-app' });
      mockTemplateEngine.selectTemplates.mockResolvedValue([]);
      mockTemplateEngine.renderTemplates.mockRejectedValue(new Error('Render error'));

      await expect(promptGenerator.generate(inputs)).rejects.toThrow('Render error');
    });

    test('should handle validation errors', async () => {
      const inputs = { category: 'web-app', projectName: 'Test' };

      mockCategoryRegistry.getCategoryConfig.mockResolvedValue({ id: 'web-app' });
      mockTemplateEngine.selectTemplates.mockResolvedValue([]);
      mockTemplateEngine.renderTemplates.mockResolvedValue([]);
      mockValidationEngine.validateGeneratedContent.mockRejectedValue(new Error('Validation error'));

      await expect(promptGenerator.generate(inputs)).rejects.toThrow('Validation error');
    });

    test('should handle output formatting errors', async () => {
      const inputs = { category: 'web-app', projectName: 'Test' };

      mockCategoryRegistry.getCategoryConfig.mockResolvedValue({ id: 'web-app' });
      mockTemplateEngine.selectTemplates.mockResolvedValue([]);
      mockTemplateEngine.renderTemplates.mockResolvedValue([]);
      mockValidationEngine.validateGeneratedContent.mockResolvedValue([]);
      mockOutputFormatter.formatSuite.mockRejectedValue(new Error('Format error'));

      await expect(promptGenerator.generate(inputs)).rejects.toThrow('Format error');
    });
  });

  describe('Integration with Real Components', () => {
    test('should work with real CategoryRegistry', async () => {
      const realCategoryRegistry = new CategoryRegistry();
      await realCategoryRegistry.loadCategories();

      const realPromptGenerator = new PromptGenerator(
        realCategoryRegistry,
        mockTemplateEngine,
        mockValidationEngine,
        mockOutputFormatter
      );

      const inputs = { category: 'web-app', projectName: 'Test' };

      mockTemplateEngine.selectTemplates.mockResolvedValue([]);
      mockTemplateEngine.renderTemplates.mockResolvedValue([]);
      mockValidationEngine.validateGeneratedContent.mockResolvedValue([]);
      mockOutputFormatter.formatSuite.mockResolvedValue({ fileCount: 0 });

      const result = await realPromptGenerator.generate(inputs);
      expect(result).toBeDefined();
    });

    test('should work with real TemplateEngine', async () => {
      const realTemplateEngine = new TemplateEngine();
      await realTemplateEngine.loadTemplates();

      const realPromptGenerator = new PromptGenerator(
        mockCategoryRegistry,
        realTemplateEngine,
        mockValidationEngine,
        mockOutputFormatter
      );

      const inputs = { category: 'web-app', projectName: 'Test' };
      const categoryConfig = { id: 'web-app', templates: ['prompts/react-web-app'] };

      mockCategoryRegistry.getCategoryConfig.mockResolvedValue(categoryConfig);
      mockValidationEngine.validateGeneratedContent.mockResolvedValue([]);
      mockOutputFormatter.formatSuite.mockResolvedValue({ fileCount: 1 });

      const result = await realPromptGenerator.generate(inputs);
      expect(result.fileCount).toBeGreaterThanOrEqual(0);
    });
  });
});