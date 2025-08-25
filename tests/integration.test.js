/**
 * Integration Tests for Universal Prompt Generator
 * Tests the complete generation workflow
 */

import { UniversalPromptGenerator } from '../src/index.js';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Universal Prompt Generator Integration Tests', () => {
  let generator;
  let testOutputDir;

  beforeAll(async () => {
    generator = new UniversalPromptGenerator();
    await generator.initialize();
    
    testOutputDir = path.join(__dirname, '../test-output');
    await fs.ensureDir(testOutputDir);
  });

  afterAll(async () => {
    // Clean up test output
    await fs.remove(testOutputDir);
  });

  beforeEach(async () => {
    // Clean test directory before each test
    await fs.emptyDir(testOutputDir);
  });

  describe('System Initialization', () => {
    test('should initialize successfully', () => {
      expect(generator).toBeDefined();
      expect(generator.categoryRegistry).toBeDefined();
      expect(generator.templateEngine).toBeDefined();
      expect(generator.validationEngine).toBeDefined();
      expect(generator.fileGenerator).toBeDefined();
    });

    test('should load categories', () => {
      const categories = generator.getAvailableCategories();
      expect(categories).toBeInstanceOf(Array);
      expect(categories.length).toBeGreaterThan(0);
      
      // Check for required categories
      const categoryIds = categories.map(c => c.id);
      expect(categoryIds).toContain('applications');
      expect(categoryIds).toContain('websites');
      expect(categoryIds).toContain('apis');
    });

    test('should provide category information', () => {
      const webAppInfo = generator.getCategoryInfo('applications');
      expect(webAppInfo).toBeDefined();
      expect(webAppInfo.name).toBeDefined();
      expect(webAppInfo.description).toBeDefined();
      expect(webAppInfo.subcategories).toBeInstanceOf(Array);
    });
  });

  describe('Web Application Generation', () => {
    test('should generate React web application', async () => {
      const inputs = {
        category: 'web-app',
        projectName: 'TestReactApp',
        techStack: ['React', 'TypeScript', 'Node.js'],
        targetAudience: 'Web developers',
        deploymentTarget: 'Vercel',
        outputPath: testOutputDir,
        featureFlags: ['routing', 'testing'],
        constraints: ['Mobile-first design']
      };

      const promptSuite = await generator.generatePromptSuite(inputs);

      expect(promptSuite).toBeDefined();
      expect(promptSuite.fileCount).toBeGreaterThan(0);
      expect(promptSuite.metadata.category).toBe('web-app');
      expect(promptSuite.metadata.projectName).toBe('TestReactApp');
      
      // Check that files were organized properly
      expect(promptSuite.files).toBeDefined();
      expect(typeof promptSuite.files).toBe('object');
    });

    test('should include required files for web app', async () => {
      const inputs = {
        category: 'web-app',
        projectName: 'TestApp',
        techStack: ['React'],
        targetAudience: 'Users',
        deploymentTarget: 'Web'
      };

      const promptSuite = await generator.generatePromptSuite(inputs);
      
      // Extract all file paths
      const allFiles = [];
      for (const dirInfo of Object.values(promptSuite.files)) {
        if (dirInfo.files) {
          allFiles.push(...dirInfo.files);
        }
      }
      
      const filePaths = allFiles.map(f => f.path);
      
      // Check for essential files
      const hasPackageJson = filePaths.some(p => p.includes('package.json'));
      const hasReadme = filePaths.some(p => p.includes('README.md'));
      const hasAppComponent = filePaths.some(p => p.includes('App.'));
      
      expect(hasPackageJson).toBe(true);
      expect(hasReadme).toBe(true);
      expect(hasAppComponent).toBe(true);
    });
  });

  describe('API Generation', () => {
    test('should generate Express REST API', async () => {
      const inputs = {
        category: 'rest-api',
        projectName: 'TestAPI',
        techStack: ['Node.js', 'Express', 'MongoDB'],
        targetAudience: 'API consumers',
        deploymentTarget: 'Heroku',
        featureFlags: ['authentication', 'documentation']
      };

      const promptSuite = await generator.generatePromptSuite(inputs);

      expect(promptSuite).toBeDefined();
      expect(promptSuite.fileCount).toBeGreaterThan(0);
      expect(promptSuite.metadata.category).toBe('rest-api');
      expect(promptSuite.metadata.projectName).toBe('TestAPI');
    });
  });

  describe('Input Validation', () => {
    test('should validate required inputs', async () => {
      const invalidInputs = {
        // Missing required fields
        techStack: ['React']
      };

      await expect(generator.generatePromptSuite(invalidInputs)).rejects.toThrow();
    });

    test('should normalize tech stack', async () => {
      const inputs = {
        category: 'web-app',
        projectName: 'TestApp',
        techStack: ['react', 'typescript', 'node.js'], // lowercase
        targetAudience: 'Users',
        deploymentTarget: 'Web'
      };

      const promptSuite = await generator.generatePromptSuite(inputs);
      
      // Check that tech stack was normalized
      expect(promptSuite.metadata.techStack).toContain('React');
      expect(promptSuite.metadata.techStack).toContain('TypeScript');
      expect(promptSuite.metadata.techStack).toContain('Node.js');
    });

    test('should sanitize project name', async () => {
      const inputs = {
        category: 'web-app',
        projectName: 'Test App With Spaces!!!',
        techStack: ['React'],
        targetAudience: 'Users',
        deploymentTarget: 'Web'
      };

      const promptSuite = await generator.generatePromptSuite(inputs);
      
      // Project name should be sanitized but readable
      expect(promptSuite.metadata.projectName).toBe('Test App With Spaces');
    });
  });

  describe('Template Engine', () => {
    test('should render templates with context', async () => {
      const inputs = {
        category: 'web-app',
        projectName: 'ContextTest',
        techStack: ['React'],
        targetAudience: 'Test Users',
        deploymentTarget: 'Test Environment'
      };

      const promptSuite = await generator.generatePromptSuite(inputs);
      
      // Find a generated file to check context substitution
      let testFile = null;
      for (const dirInfo of Object.values(promptSuite.files)) {
        if (dirInfo.files && dirInfo.files.length > 0) {
          testFile = dirInfo.files.find(f => f.content.includes('ContextTest'));
          if (testFile) break;
        }
      }

      expect(testFile).toBeDefined();
      expect(testFile.content).toContain('ContextTest');
    });

    test('should handle conditional sections', async () => {
      const inputs = {
        category: 'web-app',
        projectName: 'ConditionalTest',
        techStack: ['React', 'TypeScript'],
        featureFlags: ['routing'],
        targetAudience: 'Users',
        deploymentTarget: 'Web'
      };

      const promptSuite = await generator.generatePromptSuite(inputs);
      
      // Check that TypeScript-specific content is included
      const hasTypescriptContent = Object.values(promptSuite.files).some(dirInfo => 
        dirInfo.files && dirInfo.files.some(f => 
          f.path.includes('.tsx') || f.content.includes('TypeScript')
        )
      );

      expect(hasTypescriptContent).toBe(true);
    });
  });

  describe('Validation Engine', () => {
    test('should validate generated output', async () => {
      const inputs = {
        category: 'web-app',
        projectName: 'ValidationTest',
        techStack: ['React'],
        targetAudience: 'Users',
        deploymentTarget: 'Web'
      };

      const promptSuite = await generator.generatePromptSuite(inputs);
      
      // The validation should have already run during generation
      // Check that we got valid output
      expect(promptSuite.fileCount).toBeGreaterThan(0);
      
      // All files should have validation results
      for (const dirInfo of Object.values(promptSuite.files)) {
        if (dirInfo.files) {
          for (const file of dirInfo.files) {
            expect(file.size).toBeGreaterThan(0);
            expect(file.content).toBeDefined();
            expect(file.content.length).toBeGreaterThan(0);
          }
        }
      }
    });

    test('should detect syntax errors', async () => {
      // This test would require injecting a template with syntax errors
      // For now, we'll test that the validation engine runs without errors
      const validation = await generator.validationEngine.validateInputs({
        category: 'web-app',
        projectName: 'SyntaxTest',
        techStack: ['React']
      });

      expect(validation).toBeDefined();
    });
  });

  describe('File Generation Statistics', () => {
    test('should provide accurate statistics', async () => {
      const inputs = {
        category: 'web-app',
        projectName: 'StatsTest',
        techStack: ['React', 'TypeScript'],
        targetAudience: 'Users',
        deploymentTarget: 'Web'
      };

      const promptSuite = await generator.generatePromptSuite(inputs);

      expect(promptSuite.statistics).toBeDefined();
      expect(promptSuite.statistics.totalFiles).toBe(promptSuite.fileCount);
      expect(promptSuite.statistics.totalSize).toBeGreaterThan(0);
      expect(promptSuite.statistics.fileTypes).toBeDefined();
      expect(typeof promptSuite.statistics.fileTypes).toBe('object');
    });

    test('should track file types correctly', async () => {
      const inputs = {
        category: 'web-app',
        projectName: 'FileTypesTest',
        techStack: ['React'],
        targetAudience: 'Users',
        deploymentTarget: 'Web'
      };

      const promptSuite = await generator.generatePromptSuite(inputs);

      const fileTypes = promptSuite.statistics.fileTypes;
      
      // Should have common web app file types
      expect(fileTypes['.json']).toBeGreaterThan(0); // package.json
      expect(fileTypes['.md']).toBeGreaterThan(0);   // README.md
    });
  });

  describe('Usage Instructions', () => {
    test('should generate usage instructions', async () => {
      const inputs = {
        category: 'web-app',
        projectName: 'UsageTest',
        techStack: ['React'],
        targetAudience: 'Users',
        deploymentTarget: 'Web'
      };

      const promptSuite = await generator.generatePromptSuite(inputs);

      expect(promptSuite.usageInstructions).toBeDefined();
      expect(promptSuite.usageInstructions.quickStart).toBeInstanceOf(Array);
      expect(promptSuite.usageInstructions.setup).toBeDefined();
      expect(promptSuite.usageInstructions.nextSteps).toBeInstanceOf(Array);
    });

    test('should include tech-stack specific instructions', async () => {
      const inputs = {
        category: 'web-app',
        projectName: 'TechStackTest',
        techStack: ['React', 'Node.js'],
        targetAudience: 'Users',
        deploymentTarget: 'Web'
      };

      const promptSuite = await generator.generatePromptSuite(inputs);

      const instructions = promptSuite.usageInstructions;
      
      // Should mention Node.js in setup instructions
      const setupText = JSON.stringify(instructions.setup);
      expect(setupText.toLowerCase()).toContain('node');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid category gracefully', async () => {
      const inputs = {
        category: 'non-existent-category',
        projectName: 'ErrorTest',
        techStack: ['React'],
        targetAudience: 'Users',
        deploymentTarget: 'Web'
      };

      await expect(generator.generatePromptSuite(inputs)).rejects.toThrow();
    });

    test('should handle empty project name', async () => {
      const inputs = {
        category: 'web-app',
        projectName: '',
        techStack: ['React'],
        targetAudience: 'Users',
        deploymentTarget: 'Web'
      };

      await expect(generator.generatePromptSuite(inputs)).rejects.toThrow();
    });

    test('should handle invalid tech stack gracefully', async () => {
      const inputs = {
        category: 'web-app',
        projectName: 'TechStackErrorTest',
        techStack: null, // Invalid tech stack
        targetAudience: 'Users',
        deploymentTarget: 'Web'
      };

      // Should not throw, but normalize to empty array
      const promptSuite = await generator.generatePromptSuite(inputs);
      expect(promptSuite.metadata.techStack).toEqual([]);
    });
  });

  describe('Performance', () => {
    test('should generate within reasonable time', async () => {
      const startTime = Date.now();
      
      const inputs = {
        category: 'web-app',
        projectName: 'PerformanceTest',
        techStack: ['React'],
        targetAudience: 'Users',
        deploymentTarget: 'Web'
      };

      await generator.generatePromptSuite(inputs);
      
      const duration = Date.now() - startTime;
      
      // Should complete within 30 seconds
      expect(duration).toBeLessThan(30000);
    });

    test('should handle multiple concurrent generations', async () => {
      const promises = [];
      
      for (let i = 0; i < 3; i++) {
        const inputs = {
          category: 'web-app',
          projectName: `ConcurrentTest${i}`,
          techStack: ['React'],
          targetAudience: 'Users',
          deploymentTarget: 'Web'
        };
        
        promises.push(generator.generatePromptSuite(inputs));
      }

      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.fileCount).toBeGreaterThan(0);
      });
    });
  });
});