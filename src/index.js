#!/usr/bin/env node

/**
 * Qoder AI Universal Prompt Generator
 * Main entry point for the prompt generation system
 */

import { PromptGenerator } from './core/PromptGenerator.js';
import { CategoryRegistry } from './core/CategoryRegistry.js';
import { TemplateEngine } from './core/TemplateEngine.js';
import { ValidationEngine } from './validation/ValidationEngine.js';
import { FileGenerator } from './output/FileGenerator.js';
import { Logger } from './utils/Logger.js';

class UniversalPromptGenerator {
  constructor() {
    this.logger = new Logger('UniversalPromptGenerator');
    this.categoryRegistry = new CategoryRegistry();
    this.templateEngine = new TemplateEngine();
    this.validationEngine = new ValidationEngine();
    this.fileGenerator = new FileGenerator();
    this.promptGenerator = new PromptGenerator({
      categoryRegistry: this.categoryRegistry,
      templateEngine: this.templateEngine,
      validationEngine: this.validationEngine,
      fileGenerator: this.fileGenerator
    });
  }

  /**
   * Initialize the system and load all components
   */
  async initialize() {
    try {
      this.logger.info('Initializing Universal Prompt Generator...');
      
      // Load category definitions
      await this.categoryRegistry.loadCategories();
      this.logger.info(`Loaded ${this.categoryRegistry.getCategoryCount()} categories`);
      
      // Load template library
      await this.templateEngine.loadTemplates();
      this.logger.info(`Loaded ${this.templateEngine.getTemplateCount()} templates`);
      
      // Initialize validation rules
      await this.validationEngine.loadValidationRules();
      this.logger.info('Validation engine initialized');
      
      this.logger.success('System initialization complete');
    } catch (error) {
      this.logger.error('Failed to initialize system:', error);
      throw error;
    }
  }

  /**
   * Generate a prompt suite for the specified category and inputs
   * @param {Object} options - Generation options
   * @returns {Object} Generated prompt suite
   */
  async generatePromptSuite(options = {}) {
    try {
      this.logger.info(`Generating prompt suite for category: ${options.category}`);
      
      // Validate inputs
      const validatedInputs = await this.validationEngine.validateInputs(options);
      
      // Generate prompt suite
      const promptSuite = await this.promptGenerator.generate(validatedInputs);
      
      // Validate output
      await this.validationEngine.validateOutput(promptSuite);
      
      this.logger.success(`Prompt suite generated successfully: ${promptSuite.fileCount} files`);
      return promptSuite;
      
    } catch (error) {
      this.logger.error('Failed to generate prompt suite:', error);
      throw error;
    }
  }

  /**
   * Get available categories
   * @returns {Array} List of available categories
   */
  getAvailableCategories() {
    return this.categoryRegistry.getAllCategories();
  }

  /**
   * Get category information
   * @param {string} category - Category name
   * @returns {Object} Category details
   */
  getCategoryInfo(category) {
    return this.categoryRegistry.getCategoryInfo(category);
  }

  /**
   * Validate a generated prompt suite
   * @param {string} outputPath - Path to generated files
   * @returns {Object} Validation results
   */
  async validateGeneratedSuite(outputPath) {
    return await this.validationEngine.validateGeneratedFiles(outputPath);
  }
}

export { UniversalPromptGenerator };

// For direct execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new UniversalPromptGenerator();
  
  generator.initialize()
    .then(() => {
      console.log('Qoder AI Universal Prompt Generator initialized successfully');
      console.log('Use the CLI interface: npm run cli');
      console.log('Available categories:', generator.getAvailableCategories().length);
    })
    .catch(error => {
      console.error('Failed to initialize:', error.message);
      process.exit(1);
    });
}