/**
 * Template Engine
 * Handles template loading, selection, and rendering
 */

import fs from 'fs-extra';
import path from 'path';
import Mustache from 'mustache';
import { glob } from 'glob';
import { Logger } from '../utils/Logger.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class TemplateEngine {
  constructor() {
    this.logger = new Logger('TemplateEngine');
    this.templates = new Map();
    this.partials = new Map();
    this.templatePath = path.join(__dirname, '../../templates');
    
    // Configure Mustache
    Mustache.escape = (text) => text; // Disable HTML escaping for code templates
  }

  /**
   * Load all templates from the templates directory
   */
  async loadTemplates() {
    try {
      this.logger.info('Loading template library...');

      // Ensure templates directory exists
      await fs.ensureDir(this.templatePath);

      // Load all template files
      const templateFiles = await glob('**/*.mustache', { 
        cwd: this.templatePath,
        ignore: ['**/partials/**'] 
      });

      for (const templateFile of templateFiles) {
        await this.loadTemplate(templateFile);
      }

      // Load partial templates
      await this.loadPartials();

      this.logger.success(`Loaded ${this.templates.size} templates and ${this.partials.size} partials`);

    } catch (error) {
      this.logger.error('Failed to load templates', error);
      throw error;
    }
  }

  /**
   * Load a single template file
   * @param {string} templateFile - Relative path to template file
   */
  async loadTemplate(templateFile) {
    try {
      const fullPath = path.join(this.templatePath, templateFile);
      const content = await fs.readFile(fullPath, 'utf8');
      
      // Parse template metadata from comments
      const metadata = this.parseTemplateMetadata(content);
      
      // Create template ID from file path
      const templateId = templateFile.replace(/\.mustache$/, '').replace(/\\/g, '/');
      
      this.templates.set(templateId, {
        id: templateId,
        path: templateFile,
        content,
        metadata,
        loadedAt: new Date().toISOString()
      });

      this.logger.debug(`Loaded template: ${templateId}`);

    } catch (error) {
      this.logger.warn(`Failed to load template: ${templateFile}`, error);
    }
  }

  /**
   * Load partial templates
   */
  async loadPartials() {
    const partialFiles = await glob('**/partials/**/*.mustache', { 
      cwd: this.templatePath 
    });

    for (const partialFile of partialFiles) {
      try {
        const fullPath = path.join(this.templatePath, partialFile);
        const content = await fs.readFile(fullPath, 'utf8');
        
        // Create partial ID from file path
        const partialId = path.basename(partialFile, '.mustache');
        
        this.partials.set(partialId, content);
        
        this.logger.debug(`Loaded partial: ${partialId}`);

      } catch (error) {
        this.logger.warn(`Failed to load partial: ${partialFile}`, error);
      }
    }
  }

  /**
   * Parse template metadata from comments
   * @param {string} content - Template content
   * @returns {Object} Parsed metadata
   */
  parseTemplateMetadata(content) {
    const metadata = {
      title: '',
      description: '',
      category: '',
      subcategory: '',
      techStack: [],
      outputPath: '',
      dependencies: []
    };

    // Extract metadata from template comments
    const metadataRegex = /{{!-- @(\w+): (.+?) --}}/g;
    let match;

    while ((match = metadataRegex.exec(content)) !== null) {
      const [, key, value] = match;
      
      if (key === 'techStack' || key === 'dependencies') {
        metadata[key] = value.split(',').map(item => item.trim());
      } else {
        metadata[key] = value.trim();
      }
    }

    return metadata;
  }

  /**
   * Select appropriate templates for a category and inputs
   * @param {Object} categoryConfig - Category configuration
   * @param {Object} inputs - User inputs
   * @returns {Array} Selected templates
   */
  async selectTemplates(categoryConfig, inputs) {
    const selectedTemplates = [];

    // Get templates specified in category config
    if (categoryConfig.templates) {
      for (const templateId of categoryConfig.templates) {
        const template = this.templates.get(templateId);
        if (template) {
          selectedTemplates.push(template);
        } else {
          this.logger.warn(`Template not found: ${templateId}`);
        }
      }
    }

    // Auto-select templates based on tech stack
    if (inputs.techStack && inputs.techStack.length > 0) {
      const techStackTemplates = this.findTemplatesByTechStack(inputs.techStack);
      selectedTemplates.push(...techStackTemplates);
    }

    // Auto-select base templates for the category
    const baseTemplates = this.findBaseTemplates(categoryConfig.id || inputs.category);
    selectedTemplates.push(...baseTemplates);

    // Remove duplicates
    const uniqueTemplates = selectedTemplates.filter((template, index, self) => 
      index === self.findIndex(t => t.id === template.id)
    );

    this.logger.debug(`Selected ${uniqueTemplates.length} templates for generation`);
    return uniqueTemplates;
  }

  /**
   * Find templates by tech stack
   * @param {Array} techStack - Technology stack
   * @returns {Array} Matching templates
   */
  findTemplatesByTechStack(techStack) {
    const matchingTemplates = [];

    for (const template of this.templates.values()) {
      if (template.metadata.techStack && template.metadata.techStack.length > 0) {
        const hasMatch = techStack.some(tech => 
          template.metadata.techStack.some(templateTech => 
            templateTech.toLowerCase().includes(tech.toLowerCase()) ||
            tech.toLowerCase().includes(templateTech.toLowerCase())
          )
        );

        if (hasMatch) {
          matchingTemplates.push(template);
        }
      }
    }

    return matchingTemplates;
  }

  /**
   * Find base templates for a category
   * @param {string} category - Category ID
   * @returns {Array} Base templates
   */
  findBaseTemplates(category) {
    const baseTemplates = [];

    // Look for templates that match the category
    for (const template of this.templates.values()) {
      if (template.metadata.category === category || 
          template.id.includes(category) ||
          template.id.includes('base')) {
        baseTemplates.push(template);
      }
    }

    return baseTemplates;
  }

  /**
   * Render templates with the provided context
   * @param {Array} templates - Templates to render
   * @param {Object} context - Rendering context
   * @returns {Array} Rendered files
   */
  async renderTemplates(templates, context) {
    const renderedFiles = [];

    for (const template of templates) {
      try {
        const renderedFile = await this.renderTemplate(template, context);
        if (renderedFile) {
          renderedFiles.push(renderedFile);
        }
      } catch (error) {
        this.logger.error(`Failed to render template: ${template.id}`, error);
      }
    }

    return renderedFiles;
  }

  /**
   * Render a single template
   * @param {Object} template - Template object
   * @param {Object} context - Rendering context
   * @returns {Object} Rendered file object
   */
  async renderTemplate(template, context) {
    try {
      this.logger.debug(`Rendering template: ${template.id}`);

      // Render the template content
      const renderedContent = Mustache.render(
        template.content, 
        context, 
        Object.fromEntries(this.partials)
      );

      // Determine output path
      const outputPath = this.resolveOutputPath(template, context);

      // Extract any conditional sections
      const conditionalSections = this.extractConditionalSections(renderedContent, context);

      return {
        templateId: template.id,
        path: outputPath,
        content: renderedContent,
        metadata: template.metadata,
        conditionalSections,
        size: Buffer.byteLength(renderedContent, 'utf8'),
        renderedAt: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error(`Template rendering failed: ${template.id}`, error);
      throw error;
    }
  }

  /**
   * Resolve the output path for a rendered template
   * @param {Object} template - Template object
   * @param {Object} context - Rendering context
   * @returns {string} Resolved output path
   */
  resolveOutputPath(template, context) {
    // Use template metadata output path if specified
    if (template.metadata.outputPath) {
      return Mustache.render(template.metadata.outputPath, context);
    }

    // Generate path based on template ID and category
    const basePath = template.id.replace(/^[^/]+\//, ''); // Remove category prefix
    const extension = this.inferFileExtension(template.content, context);
    
    return `${basePath}${extension}`;
  }

  /**
   * Infer file extension from template content and context
   * @param {string} content - Template content
   * @param {Object} context - Rendering context
   * @returns {string} File extension
   */
  inferFileExtension(content, context) {
    // Check for explicit file type indicators
    if (content.includes('<!DOCTYPE html') || content.includes('<html')) return '.html';
    if (content.includes('import ') && content.includes('export')) return '.js';
    if (content.includes('interface ') || content.includes(': string')) return '.ts';
    if (content.includes('import React')) return '.jsx';
    if (content.includes('<template>')) return '.vue';
    if (content.includes('package.json')) return '.json';
    if (content.includes('# ') || content.includes('## ')) return '.md';
    if (content.includes('FROM ') || content.includes('RUN ')) return '.dockerfile';
    
    // Default based on tech stack
    if (context.techStack) {
      if (context.techStack.includes('TypeScript')) return '.ts';
      if (context.techStack.includes('React')) return '.jsx';
      if (context.techStack.includes('Vue')) return '.vue';
    }

    return '.js'; // Default
  }

  /**
   * Extract conditional sections from rendered content
   * @param {string} content - Rendered content
   * @param {Object} context - Rendering context
   * @returns {Array} Conditional sections
   */
  extractConditionalSections(content, context) {
    const sections = [];
    
    // Look for conditional comment markers
    const conditionalRegex = /<!-- IF: (.+?) -->([\s\S]*?)<!-- ENDIF -->/g;
    let match;

    while ((match = conditionalRegex.exec(content)) !== null) {
      const [fullMatch, condition, sectionContent] = match;
      
      sections.push({
        condition,
        content: sectionContent.trim(),
        included: this.evaluateCondition(condition, context)
      });
    }

    return sections;
  }

  /**
   * Evaluate a condition string against the context
   * @param {string} condition - Condition to evaluate
   * @param {Object} context - Context object
   * @returns {boolean} Evaluation result
   */
  evaluateCondition(condition, context) {
    try {
      // Simple condition evaluation for common cases
      if (condition.includes('techStack.includes')) {
        const techMatch = condition.match(/techStack\.includes\(['"](.+?)['"]\)/);
        if (techMatch && context.techStack) {
          return context.techStack.includes(techMatch[1]);
        }
      }

      if (condition.includes('featureFlags.includes')) {
        const flagMatch = condition.match(/featureFlags\.includes\(['"](.+?)['"]\)/);
        if (flagMatch && context.featureFlags) {
          return context.featureFlags.includes(flagMatch[1]);
        }
      }

      // Direct property checks
      const parts = condition.split('.');
      let value = context;
      for (const part of parts) {
        value = value?.[part];
      }

      return Boolean(value);

    } catch (error) {
      this.logger.warn(`Failed to evaluate condition: ${condition}`, error);
      return false;
    }
  }

  /**
   * Get template count
   * @returns {number} Number of loaded templates
   */
  getTemplateCount() {
    return this.templates.size;
  }

  /**
   * Get template by ID
   * @param {string} templateId - Template identifier
   * @returns {Object} Template object
   */
  getTemplate(templateId) {
    return this.templates.get(templateId);
  }

  /**
   * Search templates by metadata
   * @param {Object} criteria - Search criteria
   * @returns {Array} Matching templates
   */
  searchTemplates(criteria) {
    const results = [];

    for (const template of this.templates.values()) {
      let matches = true;

      // Check each criteria
      for (const [key, value] of Object.entries(criteria)) {
        if (key === 'techStack') {
          if (!template.metadata.techStack || 
              !template.metadata.techStack.some(tech => 
                tech.toLowerCase().includes(value.toLowerCase()))) {
            matches = false;
            break;
          }
        } else if (template.metadata[key] !== value) {
          matches = false;
          break;
        }
      }

      if (matches) {
        results.push(template);
      }
    }

    return results;
  }
}