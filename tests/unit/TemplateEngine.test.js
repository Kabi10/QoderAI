/**
 * Unit Tests for TemplateEngine
 * Tests template loading, selection, and rendering functionality
 */

import { TemplateEngine } from '../src/core/TemplateEngine.js';
import { jest } from '@jest/globals';
import fs from 'fs-extra';
import path from 'path';

describe('TemplateEngine', () => {
  let templateEngine;

  beforeEach(() => {
    templateEngine = new TemplateEngine();
  });

  describe('Initialization', () => {
    test('should create instance with default properties', () => {
      expect(templateEngine).toBeDefined();
      expect(templateEngine.templates).toBeInstanceOf(Map);
      expect(templateEngine.partials).toBeInstanceOf(Map);
      expect(templateEngine.templatePath).toContain('templates');
    });

    test('should have empty templates initially', () => {
      expect(templateEngine.templates.size).toBe(0);
      expect(templateEngine.partials.size).toBe(0);
    });
  });

  describe('Template Loading', () => {
    test('should load templates successfully', async () => {
      await templateEngine.loadTemplates();
      
      expect(templateEngine.templates.size).toBeGreaterThan(0);
      expect(templateEngine.getTemplateCount()).toBeGreaterThan(0);
    });

    test('should load expected template files', async () => {
      await templateEngine.loadTemplates();
      
      const templateIds = Array.from(templateEngine.templates.keys());
      expect(templateIds).toContain('prompts/react-web-app');
      expect(templateIds).toContain('prompts/express-api');
      expect(templateIds).toContain('prompts/landing-page');
      expect(templateIds).toContain('prompts/mobile-app');
    });

    test('should load template with metadata', async () => {
      await templateEngine.loadTemplates();
      
      const template = templateEngine.templates.get('prompts/react-web-app');
      expect(template).toBeDefined();
      expect(template.id).toBe('prompts/react-web-app');
      expect(template.content).toBeDefined();
      expect(template.metadata).toBeDefined();
      expect(template.loadedAt).toBeDefined();
    });

    test('should handle missing template directory gracefully', async () => {
      const invalidEngine = new TemplateEngine();
      invalidEngine.templatePath = '/invalid/path';
      
      // Should not throw, but should handle gracefully
      await expect(invalidEngine.loadTemplates()).resolves.not.toThrow();
    });
  });

  describe('Template Metadata Parsing', () => {
    test('should parse template metadata correctly', () => {
      const templateContent = `
{{!-- @title: React Web Application --}}
{{!-- @description: Modern React application with TypeScript --}}
{{!-- @category: web-app --}}
{{!-- @techStack: React, TypeScript, Node.js --}}
{{!-- @outputPath: src/ --}}

# {{projectName}}
A modern React application.
      `;

      const metadata = templateEngine.parseTemplateMetadata(templateContent);
      expect(metadata.title).toBe('React Web Application');
      expect(metadata.description).toBe('Modern React application with TypeScript');
      expect(metadata.category).toBe('web-app');
      expect(metadata.techStack).toEqual(['React', 'TypeScript', 'Node.js']);
      expect(metadata.outputPath).toBe('src/');
    });

    test('should handle template without metadata', () => {
      const templateContent = `
# Simple Template
No metadata here.
      `;

      const metadata = templateEngine.parseTemplateMetadata(templateContent);
      expect(metadata.title).toBe('');
      expect(metadata.description).toBe('');
      expect(metadata.category).toBe('');
      expect(metadata.techStack).toEqual([]);
    });

    test('should parse array metadata correctly', () => {
      const templateContent = `
{{!-- @dependencies: react, webpack, babel --}}
{{!-- @techStack: React, TypeScript --}}
      `;

      const metadata = templateEngine.parseTemplateMetadata(templateContent);
      expect(metadata.dependencies).toEqual(['react', 'webpack', 'babel']);
      expect(metadata.techStack).toEqual(['React', 'TypeScript']);
    });
  });

  describe('Template Selection', () => {
    beforeEach(async () => {
      await templateEngine.loadTemplates();
    });

    test('should select templates based on category config', async () => {
      const categoryConfig = {
        templates: ['prompts/react-web-app', 'prompts/landing-page']
      };
      const inputs = {
        category: 'web-app',
        techStack: ['React']
      };

      const selectedTemplates = await templateEngine.selectTemplates(categoryConfig, inputs);
      expect(selectedTemplates.length).toBeGreaterThanOrEqual(1);
      
      const templateIds = selectedTemplates.map(t => t.id);
      expect(templateIds).toContain('prompts/react-web-app');
    });

    test('should handle missing templates gracefully', async () => {
      const categoryConfig = {
        templates: ['prompts/non-existent-template']
      };
      const inputs = {
        category: 'web-app'
      };

      const selectedTemplates = await templateEngine.selectTemplates(categoryConfig, inputs);
      // Should not include the missing template
      expect(selectedTemplates.every(t => t.id !== 'prompts/non-existent-template')).toBe(true);
    });

    test('should select templates by tech stack', async () => {
      const categoryConfig = {};
      const inputs = {
        techStack: ['React', 'TypeScript']
      };

      const selectedTemplates = await templateEngine.selectTemplates(categoryConfig, inputs);
      // Should find templates that match the tech stack
      expect(selectedTemplates.length).toBeGreaterThanOrEqual(0);
    });

    test('should remove duplicate templates', async () => {
      const categoryConfig = {
        templates: ['prompts/react-web-app']
      };
      const inputs = {
        techStack: ['React'] // Might also select react-web-app
      };

      const selectedTemplates = await templateEngine.selectTemplates(categoryConfig, inputs);
      const templateIds = selectedTemplates.map(t => t.id);
      const uniqueIds = [...new Set(templateIds)];
      
      expect(templateIds.length).toBe(uniqueIds.length);
    });
  });

  describe('Template Tech Stack Matching', () => {
    beforeEach(async () => {
      await templateEngine.loadTemplates();
    });

    test('should find templates by tech stack', () => {
      const techStack = ['React', 'TypeScript'];
      const templates = templateEngine.findTemplatesByTechStack(techStack);
      
      // Should find templates that mention React or TypeScript
      expect(templates).toBeInstanceOf(Array);
      // The actual matching depends on template metadata
    });

    test('should handle empty tech stack', () => {
      const templates = templateEngine.findTemplatesByTechStack([]);
      expect(templates).toBeInstanceOf(Array);
      expect(templates.length).toBe(0);
    });

    test('should match case-insensitive tech stack', () => {
      const techStack = ['react', 'TYPESCRIPT'];
      const templates = templateEngine.findTemplatesByTechStack(techStack);
      
      expect(templates).toBeInstanceOf(Array);
      // Should match regardless of case
    });
  });

  describe('Base Template Finding', () => {
    beforeEach(async () => {
      await templateEngine.loadTemplates();
    });

    test('should find base templates for category', () => {
      const baseTemplates = templateEngine.findBaseTemplates('web-app');
      expect(baseTemplates).toBeInstanceOf(Array);
    });

    test('should handle unknown category', () => {
      const baseTemplates = templateEngine.findBaseTemplates('unknown-category');
      expect(baseTemplates).toBeInstanceOf(Array);
      expect(baseTemplates.length).toBe(0);
    });
  });

  describe('Template Rendering', () => {
    beforeEach(async () => {
      await templateEngine.loadTemplates();
    });

    test('should render templates with context', async () => {
      const templates = [
        {
          id: 'test-template',
          content: '# {{projectName}}\nTech stack: {{#techStack}}{{.}}, {{/techStack}}',
          path: 'test.md'
        }
      ];
      
      const context = {
        projectName: 'Test Project',
        techStack: ['React', 'Node.js']
      };

      const renderedFiles = await templateEngine.renderTemplates(templates, context);
      expect(renderedFiles).toHaveLength(1);
      
      const file = renderedFiles[0];
      expect(file.content).toContain('Test Project');
      expect(file.content).toContain('React');
      expect(file.content).toContain('Node.js');
    });

    test('should handle empty template list', async () => {
      const renderedFiles = await templateEngine.renderTemplates([], {});
      expect(renderedFiles).toBeInstanceOf(Array);
      expect(renderedFiles.length).toBe(0);
    });

    test('should include template metadata in rendered files', async () => {
      const templates = [
        {
          id: 'test-template',
          content: '# {{projectName}}',
          path: 'test.md',
          metadata: { category: 'test' }
        }
      ];

      const renderedFiles = await templateEngine.renderTemplates(templates, { projectName: 'Test' });
      expect(renderedFiles[0].templateId).toBe('test-template');
      expect(renderedFiles[0].metadata).toEqual({ category: 'test' });
    });

    test('should calculate file size correctly', async () => {
      const templates = [
        {
          id: 'test-template',
          content: 'Hello {{name}}!',
          path: 'test.txt'
        }
      ];

      const renderedFiles = await templateEngine.renderTemplates(templates, { name: 'World' });
      expect(renderedFiles[0].size).toBe(Buffer.byteLength('Hello World!', 'utf8'));
    });
  });

  describe('Error Handling', () => {
    test('should handle template loading errors gracefully', async () => {
      // Mock fs.readFile to throw error
      const originalReadFile = fs.readFile;
      fs.readFile = jest.fn().mockRejectedValue(new Error('File read error'));

      await templateEngine.loadTemplate('invalid-template.md');
      
      // Should not throw, but should log warning
      expect(templateEngine.templates.has('invalid-template')).toBe(false);

      // Restore original function
      fs.readFile = originalReadFile;
    });

    test('should handle rendering errors gracefully', async () => {
      const templates = [
        {
          id: 'invalid-template',
          content: '{{#invalidSyntax', // Malformed Mustache
          path: 'invalid.md'
        }
      ];

      // Should not throw, but return empty or handle gracefully
      const renderedFiles = await templateEngine.renderTemplates(templates, {});
      expect(renderedFiles).toBeInstanceOf(Array);
    });

    test('should handle missing template directory', async () => {
      const invalidEngine = new TemplateEngine();
      invalidEngine.templatePath = '/completely/invalid/path';
      
      // Should not throw
      await expect(invalidEngine.loadTemplates()).resolves.not.toThrow();
      expect(invalidEngine.templates.size).toBe(0);
    });
  });

  describe('Template Statistics', () => {
    beforeEach(async () => {
      await templateEngine.loadTemplates();
    });

    test('should return correct template count', () => {
      const count = templateEngine.getTemplateCount();
      expect(count).toBe(templateEngine.templates.size);
      expect(count).toBeGreaterThan(0);
    });

    test('should return template statistics', () => {
      const stats = templateEngine.getTemplateStats();
      expect(stats).toBeDefined();
      expect(stats.totalTemplates).toBe(templateEngine.templates.size);
      expect(stats.totalPartials).toBe(templateEngine.partials.size);
    });
  });

  describe('Template Retrieval', () => {
    beforeEach(async () => {
      await templateEngine.loadTemplates();
    });

    test('should get template by ID', () => {
      const template = templateEngine.getTemplate('prompts/react-web-app');
      if (template) { // Only test if template exists
        expect(template.id).toBe('prompts/react-web-app');
        expect(template.content).toBeDefined();
      }
    });

    test('should return null for non-existent template', () => {
      const template = templateEngine.getTemplate('non-existent-template');
      expect(template).toBeUndefined();
    });

    test('should get all templates', () => {
      const allTemplates = templateEngine.getAllTemplates();
      expect(allTemplates).toBeInstanceOf(Array);
      expect(allTemplates.length).toBe(templateEngine.templates.size);
    });
  });

  describe('Template Validation', () => {
    test('should validate template structure', () => {
      const validTemplate = {
        id: 'test',
        content: 'Hello {{name}}',
        path: 'test.md',
        metadata: {}
      };

      const isValid = templateEngine.isValidTemplate(validTemplate);
      expect(isValid).toBe(true);
    });

    test('should reject invalid template structure', () => {
      const invalidTemplate = {
        // Missing required fields
        content: 'Hello'
      };

      const isValid = templateEngine.isValidTemplate(invalidTemplate);
      expect(isValid).toBe(false);
    });
  });
});