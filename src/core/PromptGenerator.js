/**
 * Core Prompt Generator
 * Coordinates the entire prompt generation process
 */

import { Logger } from '../utils/Logger.js';
import { InputValidator, OutputFormatter } from './InputValidator.js';

export class PromptGenerator {
  constructor(dependencies = {}) {
    this.logger = new Logger('PromptGenerator');
    this.categoryRegistry = dependencies.categoryRegistry;
    this.templateEngine = dependencies.templateEngine;
    this.validationEngine = dependencies.validationEngine;
    this.fileGenerator = dependencies.fileGenerator;
    this.inputValidator = new InputValidator();
    this.outputFormatter = new OutputFormatter();
  }

  /**
   * Generate a complete prompt suite
   * @param {Object} inputs - User inputs and configuration
   * @returns {Object} Generated prompt suite
   */
  async generate(inputs) {
    try {
      this.logger.info('Starting prompt suite generation', { category: inputs.category });

      // 1. Validate and normalize inputs
      const validatedInputs = await this.inputValidator.validate(inputs);
      this.logger.debug('Inputs validated successfully');

      // 2. Get category configuration
      const categoryConfig = await this.categoryRegistry.getCategoryConfig(validatedInputs.category);
      if (!categoryConfig) {
        throw new Error(`Category not found: ${validatedInputs.category}`);
      }

      // 3. Select appropriate templates
      const templates = await this.templateEngine.selectTemplates(categoryConfig, validatedInputs);
      this.logger.debug(`Selected ${templates.length} templates`);

      // 4. Generate context object
      const context = this.createGenerationContext(validatedInputs, categoryConfig);

      // 5. Render templates with context
      const renderedFiles = await this.templateEngine.renderTemplates(templates, context);
      this.logger.debug(`Rendered ${renderedFiles.length} files`);

      // 6. Apply category-specific transformations
      const transformedFiles = await this.applyCategoryTransformations(
        renderedFiles, 
        categoryConfig, 
        context
      );

      // 7. Validate generated content
      const validatedFiles = await this.validationEngine.validateGeneratedContent(transformedFiles);

      // 8. Format output structure
      const promptSuite = await this.outputFormatter.formatSuite({
        files: validatedFiles,
        metadata: {
          category: validatedInputs.category,
          projectName: validatedInputs.projectName,
          techStack: validatedInputs.techStack,
          generatedAt: new Date().toISOString(),
          version: '1.0.0'
        },
        structure: categoryConfig.outputStructure
      });

      this.logger.success('Prompt suite generated successfully', {
        fileCount: promptSuite.fileCount,
        totalSize: promptSuite.totalSize
      });

      return promptSuite;

    } catch (error) {
      this.logger.error('Failed to generate prompt suite', error);
      throw error;
    }
  }

  /**
   * Create generation context from inputs and category config
   * @param {Object} inputs - Validated user inputs
   * @param {Object} categoryConfig - Category configuration
   * @returns {Object} Generation context
   */
  createGenerationContext(inputs, categoryConfig) {
    const currentDate = new Date();
    
    return {
      // Core inputs
      category: inputs.category,
      projectName: inputs.projectName,
      techStack: inputs.techStack || [],
      targetAudience: inputs.targetAudience,
      deploymentTarget: inputs.deploymentTarget,
      constraints: inputs.constraints || [],

      // Enhanced inputs
      stylePreferences: inputs.stylePreferences || {},
      featureFlags: inputs.featureFlags || [],
      integrationApis: inputs.integrationApis || [],
      performanceTargets: inputs.performanceTargets || {},
      complianceRequirements: inputs.complianceRequirements || [],

      // Generated metadata
      date: {
        iso: currentDate.toISOString(),
        formatted: currentDate.toISOString().split('T')[0].replace(/-/g, ''),
        year: currentDate.getFullYear(),
        month: currentDate.getMonth() + 1,
        day: currentDate.getDate()
      },

      // Git workflow
      git: {
        branch: `${inputs.category}/${inputs.projectName}-${currentDate.toISOString().split('T')[0].replace(/-/g, '')}`,
        commitMessage: `feat(${inputs.category}): initialize ${inputs.projectName}`,
        tag: `v1.0.0-${inputs.category}-release`
      },

      // File paths
      paths: {
        src: './src',
        public: './public',
        docs: './docs',
        config: './config',
        tests: './tests',
        scripts: './scripts'
      },

      // Category-specific context
      categoryContext: categoryConfig.context || {},

      // Utility functions for templates
      utils: {
        camelCase: this.toCamelCase,
        pascalCase: this.toPascalCase,
        kebabCase: this.toKebabCase,
        snakeCase: this.toSnakeCase,
        capitalize: this.capitalize,
        pluralize: this.pluralize,
        includes: this.createIncludesHelper(inputs)
      },

      // Template helpers for conditionals
      hasReact: inputs.techStack && inputs.techStack.some(tech => tech.toLowerCase().includes('react')),
      hasVue: inputs.techStack && inputs.techStack.some(tech => tech.toLowerCase().includes('vue')),
      hasAngular: inputs.techStack && inputs.techStack.some(tech => tech.toLowerCase().includes('angular')),
      hasTypeScript: inputs.techStack && inputs.techStack.some(tech => tech.toLowerCase().includes('typescript')),
      hasNodeJs: inputs.techStack && inputs.techStack.some(tech => tech.toLowerCase().includes('node')),
      hasPython: inputs.techStack && inputs.techStack.some(tech => tech.toLowerCase().includes('python')),
      hasJava: inputs.techStack && inputs.techStack.some(tech => tech.toLowerCase().includes('java')),
      hasDocker: inputs.techStack && inputs.techStack.some(tech => tech.toLowerCase().includes('docker')),
      hasExpress: inputs.techStack && inputs.techStack.some(tech => tech.toLowerCase().includes('express')),
      hasMongoDB: inputs.techStack && inputs.techStack.some(tech => tech.toLowerCase().includes('mongodb')),
      hasPostgreSQL: inputs.techStack && inputs.techStack.some(tech => tech.toLowerCase().includes('postgresql')),
      hasRouting: inputs.featureFlags && inputs.featureFlags.includes('routing'),
      hasStateManagement: inputs.featureFlags && inputs.featureFlags.includes('state-management'),
      hasAuth: inputs.featureFlags && inputs.featureFlags.includes('auth'),
      hasTesting: inputs.featureFlags && inputs.featureFlags.includes('testing'),
      hasDatabase: inputs.featureFlags && (inputs.featureFlags.includes('database') || inputs.featureFlags.includes('mongodb') || inputs.featureFlags.includes('postgresql')),
      hasApiIntegration: inputs.featureFlags && inputs.featureFlags.includes('api-integration'),
      // Category helpers
      hasWebApp: inputs.category && inputs.category.toLowerCase().includes('web-app'),
      hasApi: inputs.category && (inputs.category.toLowerCase().includes('api') || inputs.category.toLowerCase().includes('rest')),
      // Deployment helpers
      hasVercel: inputs.deploymentTarget && inputs.deploymentTarget.toLowerCase().includes('vercel'),
      hasNetlify: inputs.deploymentTarget && inputs.deploymentTarget.toLowerCase().includes('netlify'),
      hasHeroku: inputs.deploymentTarget && inputs.deploymentTarget.toLowerCase().includes('heroku')
    };
  }

  /**
   * Apply category-specific transformations to generated files
   * @param {Array} files - Rendered file objects
   * @param {Object} categoryConfig - Category configuration
   * @param {Object} context - Generation context
   * @returns {Array} Transformed files
   */
  async applyCategoryTransformations(files, categoryConfig, context) {
    if (!categoryConfig.transformations || categoryConfig.transformations.length === 0) {
      return files;
    }

    let transformedFiles = [...files];

    for (const transformation of categoryConfig.transformations) {
      try {
        const transformer = await this.loadTransformer(transformation.type);
        transformedFiles = await transformer.transform(transformedFiles, transformation.config, context);
        this.logger.debug(`Applied transformation: ${transformation.type}`);
      } catch (error) {
        this.logger.warn(`Failed to apply transformation: ${transformation.type}`, error);
      }
    }

    return transformedFiles;
  }

  /**
   * Load a specific transformer by type
   * @param {string} type - Transformer type
   * @returns {Object} Transformer instance
   */
  async loadTransformer(type) {
    try {
      const { default: Transformer } = await import(`../transformers/${type}Transformer.js`);
      return new Transformer();
    } catch (error) {
      throw new Error(`Failed to load transformer: ${type}`);
    }
  }

  /**
   * Create includes helper function for templates
   * @param {Object} inputs - User inputs
   * @returns {Function} Includes helper function
   */
  createIncludesHelper(inputs) {
    return function(array, value) {
      if (!array || !Array.isArray(array)) {
        return false;
      }
      return array.some(item => 
        item && item.toLowerCase && value && value.toLowerCase &&
        item.toLowerCase().includes(value.toLowerCase())
      );
    };
  }

  // Utility methods for template context
  toCamelCase(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    ).replace(/\s+/g, '');
  }

  toPascalCase(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, word => 
      word.toUpperCase()
    ).replace(/\s+/g, '');
  }

  toKebabCase(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2')
              .replace(/\s+/g, '-')
              .toLowerCase();
  }

  toSnakeCase(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1_$2')
              .replace(/\s+/g, '_')
              .toLowerCase();
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  pluralize(str) {
    if (str.endsWith('y')) {
      return str.slice(0, -1) + 'ies';
    } else if (str.endsWith('s') || str.endsWith('sh') || str.endsWith('ch')) {
      return str + 'es';
    } else {
      return str + 's';
    }
  }
}