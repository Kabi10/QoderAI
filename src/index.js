#!/usr/bin/env node

/**
 * Universal Prompt Generator for Qoder IDE
 * Main entry point for the prompt generation system
 * Enhanced with performance monitoring, caching, and parallel processing
 */

import { PromptGenerator } from './core/PromptGenerator.js';
import { CategoryRegistry } from './core/CategoryRegistry.js';
import { TemplateEngine } from './core/TemplateEngine.js';
import { ValidationEngine } from './validation/ValidationEngine.js';
import { FileGenerator } from './output/FileGenerator.js';
import { Logger } from './utils/Logger.js';
import { PerformanceMonitor } from './performance/PerformanceMonitor.js';
import { CacheManager } from './cache/CacheManager.js';
import { ParallelProcessor } from './parallel/ParallelProcessor.js';

import { cpus } from 'os';

class UniversalPromptGenerator {
  constructor(options = {}) {
    this.logger = new Logger('UniversalPromptGenerator');
    this.options = {
      enablePerformanceMonitoring: true,
      enableCaching: true,
      enableParallelProcessing: true,
      cacheOptions: {
        maxSize: 100 * 1024 * 1024, // 100MB
        ttl: 30 * 60 * 1000, // 30 minutes
        persistToDisk: true
      },
      parallelOptions: {
        maxWorkers: cpus().length - 1 || 1,
        taskTimeout: 30000,
        enableBatching: true
      },
      ...options
    };

    // Core components
    this.categoryRegistry = new CategoryRegistry();
    this.templateEngine = new TemplateEngine();
    this.validationEngine = new ValidationEngine();
    this.fileGenerator = new FileGenerator();
    
    // Performance enhancement components
    this.performanceMonitor = this.options.enablePerformanceMonitoring ? 
      new PerformanceMonitor() : null;
    this.cacheManager = this.options.enableCaching ? 
      new CacheManager(this.options.cacheOptions) : null;
    this.parallelProcessor = this.options.enableParallelProcessing ? 
      new ParallelProcessor(this.options.parallelOptions) : null;
    
    this.promptGenerator = new PromptGenerator({
      categoryRegistry: this.categoryRegistry,
      templateEngine: this.templateEngine,
      validationEngine: this.validationEngine,
      fileGenerator: this.fileGenerator,
      performanceMonitor: this.performanceMonitor,
      cacheManager: this.cacheManager,
      parallelProcessor: this.parallelProcessor
    });

    // Track initialization state
    this.initialized = false;
  }

  /**
   * Initialize the system and load all components
   */
  async initialize() {
    if (this.initialized) {
      this.logger.debug('System already initialized');
      return;
    }

    const sessionId = `init-${Date.now()}`;
    let session = null;

    try {
      this.logger.info('Initializing Universal Prompt Generator...');
      
      // Start performance monitoring
      if (this.performanceMonitor) {
        session = this.performanceMonitor.startSession(sessionId, {
          operation: 'system_initialization',
          options: this.options
        });
      }

      // Initialize components in parallel where possible
      const initTasks = [];

      // Load category definitions
      if (this.performanceMonitor) {
        this.performanceMonitor.startOperation(sessionId, 'load_categories');
      }
      initTasks.push(this.categoryRegistry.loadCategories().then(() => {
        if (this.performanceMonitor) {
          this.performanceMonitor.endOperation(sessionId, 'load_categories', {
            categoryCount: this.categoryRegistry.getCategoryCount()
          });
        }
        this.logger.info(`Loaded ${this.categoryRegistry.getCategoryCount()} categories`);
      }));
      
      // Load template library
      if (this.performanceMonitor) {
        this.performanceMonitor.startOperation(sessionId, 'load_templates');
      }
      initTasks.push(this.templateEngine.loadTemplates().then(() => {
        if (this.performanceMonitor) {
          this.performanceMonitor.endOperation(sessionId, 'load_templates', {
            templateCount: this.templateEngine.getTemplateCount()
          });
        }
        this.logger.info(`Loaded ${this.templateEngine.getTemplateCount()} templates`);
      }));
      
      // Initialize validation rules
      if (this.performanceMonitor) {
        this.performanceMonitor.startOperation(sessionId, 'load_validation');
      }
      initTasks.push(this.validationEngine.loadValidationRules().then(() => {
        if (this.performanceMonitor) {
          this.performanceMonitor.endOperation(sessionId, 'load_validation');
        }
        this.logger.info('Validation engine initialized');
      }));

      // Wait for all initialization tasks
      await Promise.all(initTasks);
      
      this.initialized = true;
      this.logger.success('System initialization complete');
      
      // Log performance summary
      if (this.performanceMonitor) {
        const sessionSummary = this.performanceMonitor.endSession(sessionId);
        this.logger.info(`Initialization completed in ${sessionSummary.totalDuration}ms with ${sessionSummary.performance.rating} performance`);
      }
      
    } catch (error) {
      this.logger.error('Failed to initialize system:', error);
      
      if (this.performanceMonitor && session) {
        this.performanceMonitor.recordError(sessionId, 'system_initialization', error);
        this.performanceMonitor.endSession(sessionId);
      }
      
      throw error;
    }
  }

  /**
   * Generate a prompt suite for the specified category and inputs
   * Enhanced with performance monitoring, caching, and parallel processing
   * @param {Object} options - Generation options
   * @returns {Object} Generated prompt suite
   */
  async generatePromptSuite(options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    const sessionId = `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    let session = null;

    try {
      this.logger.info(`Generating prompt suite for category: ${options.category}`);
      
      // Start performance monitoring
      if (this.performanceMonitor) {
        session = this.performanceMonitor.startSession(sessionId, {
          operation: 'prompt_suite_generation',
          category: options.category,
          projectName: options.projectName,
          techStack: options.techStack
        });
      }

      // Check cache first
      let promptSuite = null;
      if (this.cacheManager) {
        if (this.performanceMonitor) {
          this.performanceMonitor.startOperation(sessionId, 'cache_lookup');
        }
        
        promptSuite = await this.cacheManager.getCachedTemplateRender(options, options);
        
        if (this.performanceMonitor) {
          this.performanceMonitor.endOperation(sessionId, 'cache_lookup', {
            hit: !!promptSuite
          });
        }
        
        if (promptSuite) {
          this.logger.debug('Using cached prompt suite');
          
          if (this.performanceMonitor) {
            const sessionSummary = this.performanceMonitor.endSession(sessionId);
            this.logger.info(`Prompt suite generated from cache in ${sessionSummary.totalDuration}ms`);
          }
          
          return promptSuite;
        }
      }
      
      // Validate inputs
      if (this.performanceMonitor) {
        this.performanceMonitor.startOperation(sessionId, 'input_validation');
      }
      
      const validatedInputs = await this.validationEngine.validateInputs(options);
      
      if (this.performanceMonitor) {
        this.performanceMonitor.endOperation(sessionId, 'input_validation');
      }
      
      // Generate prompt suite
      if (this.performanceMonitor) {
        this.performanceMonitor.startOperation(sessionId, 'prompt_generation');
      }
      
      promptSuite = await this.promptGenerator.generate(validatedInputs);
      
      if (this.performanceMonitor) {
        this.performanceMonitor.endOperation(sessionId, 'prompt_generation', {
          fileCount: promptSuite.fileCount,
          totalSize: promptSuite.totalSize
        });
      }
      
      // Validate output
      if (this.performanceMonitor) {
        this.performanceMonitor.startOperation(sessionId, 'output_validation');
      }
      
      const validationResult = await this.validationEngine.validateOutput(promptSuite);
      promptSuite.validation = validationResult;
      
      if (this.performanceMonitor) {
        this.performanceMonitor.endOperation(sessionId, 'output_validation', {
          valid: validationResult.valid,
          qualityScore: validationResult.quality?.score
        });
      }
      
      // Cache the result
      if (this.cacheManager && validationResult.valid) {
        await this.cacheManager.cacheTemplateRender(options, options, promptSuite);
      }
      
      this.logger.success(`Prompt suite generated successfully: ${promptSuite.fileCount} files`);
      
      // Log performance summary
      if (this.performanceMonitor) {
        const sessionSummary = this.performanceMonitor.endSession(sessionId);
        this.logger.info(`Generation completed in ${sessionSummary.totalDuration}ms with ${sessionSummary.performance.rating} performance`);
        
        // Log recommendations if any
        if (sessionSummary.performance.recommendations?.length > 0) {
          this.logger.info('Performance recommendations:', sessionSummary.performance.recommendations);
        }
      }
      
      return promptSuite;
      
    } catch (error) {
      this.logger.error('Failed to generate prompt suite:', error);
      
      if (this.performanceMonitor && session) {
        this.performanceMonitor.recordError(sessionId, 'prompt_suite_generation', error);
        this.performanceMonitor.endSession(sessionId);
      }
      
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
    const sessionId = `validate-${Date.now()}`;
    let session = null;

    try {
      if (this.performanceMonitor) {
        session = this.performanceMonitor.startSession(sessionId, {
          operation: 'suite_validation',
          outputPath
        });
        this.performanceMonitor.startOperation(sessionId, 'file_validation');
      }

      const result = await this.validationEngine.validateGeneratedFiles(outputPath);

      if (this.performanceMonitor) {
        this.performanceMonitor.endOperation(sessionId, 'file_validation', {
          fileCount: result.fileCount,
          valid: result.valid
        });
        this.performanceMonitor.endSession(sessionId);
      }

      return result;
    } catch (error) {
      if (this.performanceMonitor && session) {
        this.performanceMonitor.recordError(sessionId, 'suite_validation', error);
        this.performanceMonitor.endSession(sessionId);
      }
      throw error;
    }
  }
}

export { UniversalPromptGenerator };

// For direct execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new UniversalPromptGenerator();
  
  generator.initialize()
    .then(() => {
      console.log('Universal Prompt Generator initialized successfully');
      console.log('Use the CLI interface: npm run cli');
      console.log('Available categories:', generator.getAvailableCategories().length);
      console.log('Performance monitoring:', generator.options.enablePerformanceMonitoring ? 'enabled' : 'disabled');
      console.log('Caching:', generator.options.enableCaching ? 'enabled' : 'disabled');
      console.log('Parallel processing:', generator.options.enableParallelProcessing ? 'enabled' : 'disabled');
    })
    .catch(error => {
      console.error('Failed to initialize:', error.message);
      process.exit(1);
    });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\nShutting down gracefully...');
    await generator.shutdown();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\nShutting down gracefully...');
    await generator.shutdown();
    process.exit(0);
  });
}