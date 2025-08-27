/**
 * Processing Worker
 * Worker thread for parallel template processing, validation, and transformations
 */

import { isMainThread, parentPort, workerData } from 'worker_threads';
import { Logger } from '../utils/Logger.js';

if (isMainThread) {
  throw new Error('This file should only be run as a worker thread');
}

class ProcessingWorker {
  constructor() {
    this.logger = new Logger('ProcessingWorker');
    this.processedCount = 0;
    
    // Setup message handler
    parentPort.on('message', (message) => {
      this.handleMessage(message);
    });

    this.logger.debug('Processing worker initialized');
  }

  /**
   * Handle incoming messages
   * @param {Object} message - Message from main thread
   */
  async handleMessage(message) {
    const { taskId, operation, batch } = message;
    
    try {
      this.logger.debug(`Processing task: ${taskId}, operation: ${operation}, batch size: ${batch.length}`);
      
      let result;
      switch (operation) {
        case 'template':
          result = await this.processTemplateBatch(batch);
          break;
        case 'validation':
          result = await this.processValidationBatch(batch);
          break;
        case 'transformation':
          result = await this.processTransformationBatch(batch);
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      this.processedCount += batch.length;
      
      // Send success response
      parentPort.postMessage({
        taskId,
        success: true,
        data: result
      });

    } catch (error) {
      this.logger.error(`Task failed: ${taskId}`, error);
      
      // Send error response
      parentPort.postMessage({
        taskId,
        success: false,
        error: error.message,
        stack: error.stack
      });
    }
  }

  /**
   * Process template rendering batch
   * @param {Array} batch - Batch of template tasks
   * @returns {Array} Rendered results
   */
  async processTemplateBatch(batch) {
    const results = [];

    for (const task of batch) {
      try {
        const result = await this.processTemplate(task);
        results.push({
          success: true,
          taskId: task.id,
          data: result
        });
      } catch (error) {
        results.push({
          success: false,
          taskId: task.id,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Process validation batch
   * @param {Array} batch - Batch of validation tasks
   * @returns {Array} Validation results
   */
  async processValidationBatch(batch) {
    const results = [];

    for (const task of batch) {
      try {
        const result = await this.processValidation(task);
        results.push({
          success: true,
          taskId: task.id,
          data: result
        });
      } catch (error) {
        results.push({
          success: false,
          taskId: task.id,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Process transformation batch
   * @param {Array} batch - Batch of transformation tasks
   * @returns {Array} Transformation results
   */
  async processTransformationBatch(batch) {
    const results = [];

    for (const task of batch) {
      try {
        const result = await this.processTransformation(task);
        results.push({
          success: true,
          taskId: task.id,
          data: result
        });
      } catch (error) {
        results.push({
          success: false,
          taskId: task.id,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Process single template
   * @param {Object} task - Template task
   * @returns {Object} Rendered template
   */
  async processTemplate(task) {
    const { data } = task;
    const { template, context, options } = data;

    // Simulate template processing
    // In real implementation, this would use the actual TemplateEngine
    const processedContent = await this.renderTemplate(template, context, options);
    
    return {
      id: task.id,
      template: template.id || 'unknown',
      content: processedContent,
      size: Buffer.byteLength(processedContent, 'utf8'),
      processingTime: Date.now() - (task.startTime || Date.now()),
      metadata: {
        variables: this.extractVariables(processedContent),
        complexity: this.calculateComplexity(processedContent)
      }
    };
  }

  /**
   * Process single validation
   * @param {Object} task - Validation task
   * @returns {Object} Validation result
   */
  async processValidation(task) {
    const { data } = task;
    const { input, rules, options } = data;

    // Simulate validation processing
    const validationResult = await this.validateInput(input, rules, options);
    
    return {
      id: task.id,
      valid: validationResult.valid,
      errors: validationResult.errors,
      warnings: validationResult.warnings,
      score: validationResult.score,
      processingTime: Date.now() - (task.startTime || Date.now()),
      metadata: {
        rulesApplied: validationResult.rulesApplied,
        complexity: validationResult.complexity
      }
    };
  }

  /**
   * Process single transformation
   * @param {Object} task - Transformation task
   * @returns {Object} Transformation result
   */
  async processTransformation(task) {
    const { data } = task;
    const { content, transformer, options } = data;

    // Simulate transformation processing
    const transformedContent = await this.applyTransformation(content, transformer, options);
    
    return {
      id: task.id,
      transformer: transformer.type || 'unknown',
      content: transformedContent,
      originalSize: Buffer.byteLength(content, 'utf8'),
      transformedSize: Buffer.byteLength(transformedContent, 'utf8'),
      processingTime: Date.now() - (task.startTime || Date.now()),
      metadata: {
        compressionRatio: transformedContent.length / content.length,
        transformationsApplied: transformer.transformations || []
      }
    };
  }

  /**
   * Render template with context
   * @param {Object} template - Template object
   * @param {Object} context - Template context
   * @param {Object} options - Rendering options
   * @returns {string} Rendered content
   */
  async renderTemplate(template, context, options = {}) {
    let content = template.content || template.template || '';

    // Basic mustache-style template rendering
    // Replace {{variable}} patterns with context values
    content = content.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
      const trimmedVar = variable.trim();
      
      // Handle nested properties
      const value = this.getNestedProperty(context, trimmedVar);
      
      if (value === undefined || value === null) {
        return options.strict ? match : '';
      }
      
      return String(value);
    });

    // Handle conditional sections {{#if condition}}...{{/if}}
    content = content.replace(/\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, block) => {
      const conditionValue = this.getNestedProperty(context, condition.trim());
      return conditionValue ? block : '';
    });

    // Handle loops {{#each array}}...{{/each}}
    content = content.replace(/\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, arrayName, block) => {
      const array = this.getNestedProperty(context, arrayName.trim());
      if (!Array.isArray(array)) return '';
      
      return array.map(item => {
        let itemBlock = block;
        // Replace {{.}} with current item
        itemBlock = itemBlock.replace(/\{\{\.\}\}/g, String(item));
        
        // Replace {{property}} with item.property
        if (typeof item === 'object' && item !== null) {
          itemBlock = itemBlock.replace(/\{\{([^}]+)\}\}/g, (itemMatch, property) => {
            const propValue = this.getNestedProperty(item, property.trim());
            return propValue !== undefined ? String(propValue) : '';
          });
        }
        
        return itemBlock;
      }).join('');
    });

    // Handle unless sections {{#unless condition}}...{{/unless}}
    content = content.replace(/\{\{#unless\s+([^}]+)\}\}([\s\S]*?)\{\{\/unless\}\}/g, (match, condition, block) => {
      const conditionValue = this.getNestedProperty(context, condition.trim());
      return !conditionValue ? block : '';
    });

    // Add metadata comments if requested
    if (options.addMetadata) {
      const metadata = `<!-- Generated by ProcessingWorker at ${new Date().toISOString()} -->`;
      content = metadata + '\n' + content;
    }

    return content;
  }

  /**
   * Get nested property from object
   * @param {Object} obj - Object to search
   * @param {string} path - Property path (e.g., 'user.name')
   * @returns {*} Property value
   */
  getNestedProperty(obj, path) {
    return path.split('.').reduce((current, prop) => {
      return current && current[prop] !== undefined ? current[prop] : undefined;
    }, obj);
  }

  /**
   * Validate input with rules
   * @param {Object} input - Input to validate
   * @param {Array} rules - Validation rules
   * @param {Object} options - Validation options
   * @returns {Object} Validation result
   */
  async validateInput(input, rules = [], options = {}) {
    const errors = [];
    const warnings = [];
    let score = 100;
    const rulesApplied = [];

    for (const rule of rules) {
      rulesApplied.push(rule.name || rule.type);
      
      try {
        switch (rule.type) {
          case 'required':
            if (!input || input === '') {
              errors.push(`${rule.field || 'Field'} is required`);
              score -= 20;
            }
            break;
            
          case 'minLength':
            if (typeof input === 'string' && input.length < rule.value) {
              errors.push(`${rule.field || 'Field'} must be at least ${rule.value} characters`);
              score -= 10;
            }
            break;
            
          case 'maxLength':
            if (typeof input === 'string' && input.length > rule.value) {
              errors.push(`${rule.field || 'Field'} must not exceed ${rule.value} characters`);
              score -= 10;
            }
            break;
            
          case 'pattern':
            if (typeof input === 'string' && !new RegExp(rule.value).test(input)) {
              errors.push(`${rule.field || 'Field'} does not match required pattern`);
              score -= 15;
            }
            break;
            
          case 'security':
            if (this.containsSuspiciousContent(input)) {
              warnings.push('Potentially suspicious content detected');
              score -= 5;
            }
            break;
            
          default:
            warnings.push(`Unknown validation rule: ${rule.type}`);
        }
      } catch (error) {
        warnings.push(`Validation rule error: ${error.message}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, score),
      rulesApplied,
      complexity: this.calculateValidationComplexity(rules)
    };
  }

  /**
   * Apply transformation to content
   * @param {string} content - Content to transform
   * @param {Object} transformer - Transformer configuration
   * @param {Object} options - Transformation options
   * @returns {string} Transformed content
   */
  async applyTransformation(content, transformer, options = {}) {
    let transformedContent = content;
    const transformationsApplied = [];

    switch (transformer.type) {
      case 'formatting':
        transformedContent = await this.applyFormatting(transformedContent, transformer.config);
        transformationsApplied.push('formatting');
        break;
        
      case 'minification':
        transformedContent = await this.applyMinification(transformedContent, transformer.config);
        transformationsApplied.push('minification');
        break;
        
      case 'optimization':
        transformedContent = await this.applyOptimization(transformedContent, transformer.config);
        transformationsApplied.push('optimization');
        break;
        
      case 'beautification':
        transformedContent = await this.applyBeautification(transformedContent, transformer.config);
        transformationsApplied.push('beautification');
        break;
        
      default:
        throw new Error(`Unknown transformer type: ${transformer.type}`);
    }

    return transformedContent;
  }

  /**
   * Apply formatting transformation
   * @param {string} content - Content to format
   * @param {Object} config - Formatting configuration
   * @returns {string} Formatted content
   */
  async applyFormatting(content, config = {}) {
    let formatted = content;

    // Basic formatting operations
    if (config.trimWhitespace) {
      formatted = formatted.trim();
    }

    if (config.normalizeLineEndings) {
      formatted = formatted.replace(/\r\n/g, '\n');
    }

    if (config.indentSize) {
      const lines = formatted.split('\n');
      let indentLevel = 0;
      
      formatted = lines.map(line => {
        const trimmedLine = line.trim();
        
        if (trimmedLine.includes('}') || trimmedLine.includes('</')) {
          indentLevel = Math.max(0, indentLevel - 1);
        }
        
        const indentedLine = '  '.repeat(indentLevel) + trimmedLine;
        
        if (trimmedLine.includes('{') || trimmedLine.includes('<') && !trimmedLine.includes('</')) {
          indentLevel++;
        }
        
        return indentedLine;
      }).join('\n');
    }

    return formatted;
  }

  /**
   * Apply minification transformation
   * @param {string} content - Content to minify
   * @param {Object} config - Minification configuration
   * @returns {string} Minified content
   */
  async applyMinification(content, config = {}) {
    let minified = content;

    if (config.removeComments) {
      // Remove single-line comments
      minified = minified.replace(/\/\/.*$/gm, '');
      // Remove multi-line comments
      minified = minified.replace(/\/\*[\s\S]*?\*\//g, '');
    }

    if (config.removeWhitespace) {
      // Remove extra whitespace
      minified = minified.replace(/\s+/g, ' ');
      // Remove whitespace around operators
      minified = minified.replace(/\s*([{}();,])\s*/g, '$1');
    }

    if (config.removeEmptyLines) {
      minified = minified.replace(/^\s*[\r\n]/gm, '');
    }

    return minified.trim();
  }

  /**
   * Apply optimization transformation
   * @param {string} content - Content to optimize
   * @param {Object} config - Optimization configuration
   * @returns {string} Optimized content
   */
  async applyOptimization(content, config = {}) {
    let optimized = content;

    if (config.removeUnusedVariables) {
      // Basic unused variable detection (simplified)
      const variablePattern = /(?:var|let|const)\s+(\w+)/g;
      const usagePattern = /\b(\w+)\b/g;
      
      const variables = [];
      let match;
      
      while ((match = variablePattern.exec(optimized)) !== null) {
        variables.push(match[1]);
      }
      
      // This is a simplified implementation
      // Real optimization would need proper AST parsing
    }

    if (config.optimizeImages) {
      // Replace image references with optimized versions
      optimized = optimized.replace(/\.(jpg|jpeg|png)/gi, '.webp');
    }

    return optimized;
  }

  /**
   * Apply beautification transformation
   * @param {string} content - Content to beautify
   * @param {Object} config - Beautification configuration
   * @returns {string} Beautified content
   */
  async applyBeautification(content, config = {}) {
    // Apply formatting with beautification settings
    return await this.applyFormatting(content, {
      trimWhitespace: true,
      normalizeLineEndings: true,
      indentSize: config.indentSize || 2,
      ...config
    });
  }

  /**
   * Extract variables from content
   * @param {string} content - Content to analyze
   * @returns {Array} Extracted variables
   */
  extractVariables(content) {
    const variables = new Set();
    const patterns = [
      /\{\{([^}]+)\}\}/g, // Mustache variables
      /\$\{([^}]+)\}/g,   // Template literals
      /%([^%]+)%/g        // Environment variables
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        variables.add(match[1].trim());
      }
    }

    return Array.from(variables);
  }

  /**
   * Calculate content complexity
   * @param {string} content - Content to analyze
   * @returns {number} Complexity score
   */
  calculateComplexity(content) {
    let complexity = 0;

    // Basic complexity factors
    complexity += content.split('\n').length * 0.1; // Line count
    complexity += (content.match(/\{\{[^}]+\}\}/g) || []).length * 2; // Template variables
    complexity += (content.match(/\{\{#[^}]+\}\}/g) || []).length * 5; // Control structures
    complexity += (content.match(/<[^>]+>/g) || []).length * 1; // HTML tags

    return Math.round(complexity);
  }

  /**
   * Calculate validation complexity
   * @param {Array} rules - Validation rules
   * @returns {number} Complexity score
   */
  calculateValidationComplexity(rules) {
    return rules.length + rules.filter(rule => rule.type === 'pattern').length * 2;
  }

  /**
   * Check for suspicious content
   * @param {string} content - Content to check
   * @returns {boolean} True if suspicious content found
   */
  containsSuspiciousContent(content) {
    const suspiciousPatterns = [
      /<script[^>]*>/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\s*\(/i,
      /exec\s*\(/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(content));
  }
}

// Initialize worker
new ProcessingWorker();