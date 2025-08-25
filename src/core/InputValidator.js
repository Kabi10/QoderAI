/**
 * Input Validator
 * Validates and normalizes user inputs
 */

import Joi from 'joi';
import { Logger } from '../utils/Logger.js';

export class InputValidator {
  constructor() {
    this.logger = new Logger('InputValidator');
    this.setupValidationSchemas();
  }

  /**
   * Setup validation schemas for different input types
   */
  setupValidationSchemas() {
    this.baseSchema = Joi.object({
      category: Joi.string().required()
        .pattern(/^[a-z-]+$/)
        .messages({
          'string.pattern.base': 'Category must contain only lowercase letters and hyphens'
        }),
      
      projectName: Joi.string().required()
        .min(1)
        .max(50)
        .pattern(/^[a-zA-Z0-9-_\s]+$/)
        .messages({
          'string.pattern.base': 'Project name must contain only alphanumeric characters, hyphens, underscores, and spaces'
        }),
      
      techStack: Joi.array()
        .items(Joi.string())
        .default([]),
      
      targetAudience: Joi.string()
        .max(200)
        .default('General users'),
      
      deploymentTarget: Joi.string()
        .max(100)
        .default('Web'),
      
      constraints: Joi.array()
        .items(Joi.string())
        .default([]),
      
      outputPath: Joi.string()
        .default('./generated'),
      
      stylePreferences: Joi.object()
        .default({}),
      
      featureFlags: Joi.array()
        .items(Joi.string())
        .default([]),
      
      integrationApis: Joi.array()
        .items(Joi.string())
        .default([]),
      
      performanceTargets: Joi.object()
        .default({}),
      
      complianceRequirements: Joi.array()
        .items(Joi.string())
        .default([])
    });

    this.categorySpecificSchemas = {
      'web-app': Joi.object({
        framework: Joi.string().valid('React', 'Vue', 'Angular', 'Vanilla'),
        styling: Joi.string().valid('CSS', 'SCSS', 'Styled Components', 'Tailwind'),
        stateManagement: Joi.string().valid('Redux', 'Zustand', 'Context API', 'Vuex'),
        testing: Joi.boolean().default(true),
        pwa: Joi.boolean().default(false)
      }),
      
      'mobile-app': Joi.object({
        platform: Joi.string().valid('iOS', 'Android', 'Both').default('Both'),
        framework: Joi.string().valid('React Native', 'Flutter', 'Native'),
        navigation: Joi.string().valid('Stack', 'Tab', 'Drawer').default('Stack'),
        authentication: Joi.boolean().default(true)
      }),
      
      'rest-api': Joi.object({
        framework: Joi.string().valid('Express', 'FastAPI', 'Spring Boot', 'Gin'),
        database: Joi.string().valid('PostgreSQL', 'MongoDB', 'MySQL', 'SQLite'),
        authentication: Joi.string().valid('JWT', 'OAuth', 'Basic', 'None').default('JWT'),
        documentation: Joi.boolean().default(true),
        testing: Joi.boolean().default(true)
      })
    };
  }

  /**
   * Validate user inputs
   * @param {Object} inputs - Raw user inputs
   * @returns {Object} Validated and normalized inputs
   */
  async validate(inputs) {
    try {
      this.logger.debug('Validating user inputs');

      // Basic validation
      const { error: baseError, value: baseValues } = this.baseSchema.validate(inputs, {
        abortEarly: false,
        stripUnknown: false
      });

      if (baseError) {
        throw new Error(`Input validation failed: ${baseError.details.map(d => d.message).join(', ')}`);
      }

      // Category-specific validation
      let categoryValues = {};
      if (this.categorySpecificSchemas[baseValues.category]) {
        const categorySchema = this.categorySpecificSchemas[baseValues.category];
        const { error: categoryError, value: catValues } = categorySchema.validate(inputs, {
          abortEarly: false,
          stripUnknown: true
        });

        if (categoryError) {
          this.logger.warn(`Category-specific validation warnings: ${categoryError.details.map(d => d.message).join(', ')}`);
        }

        categoryValues = catValues || {};
      }

      // Merge and normalize
      const validatedInputs = {
        ...baseValues,
        ...categoryValues,
        techStack: this.normalizeTechStack(baseValues.techStack),
        projectName: this.normalizeProjectName(baseValues.projectName)
      };

      this.logger.debug('Input validation completed successfully');
      return validatedInputs;

    } catch (error) {
      this.logger.error('Input validation failed', error);
      throw error;
    }
  }

  /**
   * Normalize technology stack
   * @param {Array} techStack - Raw tech stack array
   * @returns {Array} Normalized tech stack
   */
  normalizeTechStack(techStack) {
    if (!Array.isArray(techStack)) return [];

    const normalized = techStack
      .map(tech => tech.trim())
      .filter(tech => tech.length > 0)
      .map(tech => {
        // Normalize common variations
        const normalizations = {
          'react': 'React',
          'reactjs': 'React',
          'react.js': 'React',
          'vue': 'Vue.js',
          'vuejs': 'Vue.js',
          'vue.js': 'Vue.js',
          'angular': 'Angular',
          'angularjs': 'AngularJS',
          'node': 'Node.js',
          'nodejs': 'Node.js',
          'node.js': 'Node.js',
          'express': 'Express',
          'expressjs': 'Express',
          'typescript': 'TypeScript',
          'postgres': 'PostgreSQL',
          'postgresql': 'PostgreSQL',
          'mongo': 'MongoDB',
          'mongodb': 'MongoDB'
        };

        return normalizations[tech.toLowerCase()] || tech;
      });

    // Remove duplicates
    return [...new Set(normalized)];
  }

  /**
   * Normalize project name
   * @param {string} projectName - Raw project name
   * @returns {string} Normalized project name
   */
  normalizeProjectName(projectName) {
    return projectName
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
      .trim();
  }

  /**
   * Validate file paths
   * @param {string} path - File path to validate
   * @returns {boolean} Whether path is valid
   */
  validatePath(path) {
    // Check for path traversal attempts
    if (path.includes('..') || path.includes('~')) {
      return false;
    }

    // Check for invalid characters
    const invalidChars = /[<>:"|?*]/;
    if (invalidChars.test(path)) {
      return false;
    }

    return true;
  }

  /**
   * Sanitize user input to prevent injection
   * @param {string} input - User input to sanitize
   * @returns {string} Sanitized input
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;

    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  }
}

/**
 * Output Formatter
 * Formats generated output into structured prompt suites
 */
export class OutputFormatter {
  constructor() {
    this.logger = new Logger('OutputFormatter');
  }

  /**
   * Format a generated prompt suite
   * @param {Object} options - Formatting options
   * @returns {Object} Formatted prompt suite
   */
  async formatSuite(options) {
    try {
      const { files, metadata, structure } = options;

      this.logger.debug('Formatting prompt suite output');

      // Organize files by directory structure
      const organizedFiles = this.organizeFilesByStructure(files, structure);

      // Calculate statistics
      const stats = this.calculateStats(files);

      // Generate manifest
      const manifest = this.generateManifest(organizedFiles, metadata);

      // Create usage instructions
      const usageInstructions = this.generateUsageInstructions(metadata, stats);

      const promptSuite = {
        metadata: {
          ...metadata,
          generatedFiles: files.length,
          totalSize: stats.totalSize,
          formattedAt: new Date().toISOString()
        },
        files: organizedFiles,
        manifest,
        statistics: stats,
        usageInstructions,
        fileCount: files.length,
        totalSize: stats.totalSize
      };

      this.logger.debug('Prompt suite formatting completed');
      return promptSuite;

    } catch (error) {
      this.logger.error('Failed to format prompt suite', error);
      throw error;
    }
  }

  /**
   * Organize files by directory structure
   * @param {Array} files - Generated files
   * @param {Object} structure - Directory structure definition
   * @returns {Object} Organized file structure
   */
  organizeFilesByStructure(files, structure = {}) {
    const organized = {};

    // Initialize structure directories
    for (const [dir, description] of Object.entries(structure)) {
      organized[dir] = {
        description,
        files: []
      };
    }

    // Organize files into directories
    for (const file of files) {
      const dirPath = this.getDirectoryFromPath(file.path);
      
      if (!organized[dirPath]) {
        organized[dirPath] = {
          description: `${dirPath} files`,
          files: []
        };
      }

      organized[dirPath].files.push(file);
    }

    return organized;
  }

  /**
   * Get directory name from file path
   * @param {string} filePath - File path
   * @returns {string} Directory name
   */
  getDirectoryFromPath(filePath) {
    const parts = filePath.split('/');
    return parts.length > 1 ? parts[0] : 'root';
  }

  /**
   * Calculate statistics for generated files
   * @param {Array} files - Generated files
   * @returns {Object} Statistics
   */
  calculateStats(files) {
    const stats = {
      totalFiles: files.length,
      totalSize: 0,
      fileTypes: {},
      averageSize: 0,
      largestFile: null,
      smallestFile: null
    };

    for (const file of files) {
      stats.totalSize += file.size;

      // Track file types
      const extension = this.getFileExtension(file.path);
      stats.fileTypes[extension] = (stats.fileTypes[extension] || 0) + 1;

      // Track largest/smallest files
      if (!stats.largestFile || file.size > stats.largestFile.size) {
        stats.largestFile = { path: file.path, size: file.size };
      }
      if (!stats.smallestFile || file.size < stats.smallestFile.size) {
        stats.smallestFile = { path: file.path, size: file.size };
      }
    }

    stats.averageSize = files.length > 0 ? Math.round(stats.totalSize / files.length) : 0;

    return stats;
  }

  /**
   * Get file extension from path
   * @param {string} filePath - File path
   * @returns {string} File extension
   */
  getFileExtension(filePath) {
    const parts = filePath.split('.');
    return parts.length > 1 ? parts[parts.length - 1] : 'unknown';
  }

  /**
   * Generate file manifest
   * @param {Object} organizedFiles - Organized file structure
   * @param {Object} metadata - Generation metadata
   * @returns {Object} File manifest
   */
  generateManifest(organizedFiles, metadata) {
    const manifest = {
      version: '1.0.0',
      generator: 'Qoder Universal Prompt Generator',
      category: metadata.category,
      projectName: metadata.projectName,
      generatedAt: metadata.generatedAt,
      structure: {}
    };

    for (const [dir, info] of Object.entries(organizedFiles)) {
      manifest.structure[dir] = {
        description: info.description,
        fileCount: info.files.length,
        files: info.files.map(file => ({
          path: file.path,
          size: file.size,
          template: file.templateId
        }))
      };
    }

    return manifest;
  }

  /**
   * Generate usage instructions
   * @param {Object} metadata - Generation metadata
   * @param {Object} stats - File statistics
   * @returns {Object} Usage instructions
   */
  generateUsageInstructions(metadata, stats) {
    return {
      quickStart: [
        '1. Review the generated file structure',
        '2. Install required dependencies',
        '3. Configure environment variables',
        '4. Run the development server',
        '5. Customize as needed'
      ],
      setup: {
        dependencies: this.generateDependencyInstructions(metadata.techStack),
        environment: 'Copy .env.example to .env and configure',
        build: 'Run build command for your chosen tech stack'
      },
      structure: {
        totalFiles: stats.totalFiles,
        mainDirectories: Object.keys(stats.fileTypes),
        estimatedSetupTime: this.estimateSetupTime(stats.totalFiles)
      },
      nextSteps: [
        'Customize the generated code for your specific needs',
        'Add additional features and functionality',
        'Set up CI/CD pipeline',
        'Deploy to your chosen platform'
      ]
    };
  }

  /**
   * Generate dependency installation instructions
   * @param {Array} techStack - Technology stack
   * @returns {Object} Dependency instructions
   */
  generateDependencyInstructions(techStack = []) {
    const instructions = {
      npm: 'npm install',
      yarn: 'yarn install',
      specific: []
    };

    // Add tech-stack specific instructions
    if (techStack.includes('React')) {
      instructions.specific.push('React application detected - ensure Node.js 14+ is installed');
    }
    if (techStack.includes('Python')) {
      instructions.specific.push('Python application detected - ensure Python 3.8+ is installed');
    }
    if (techStack.includes('Docker')) {
      instructions.specific.push('Docker configuration included - ensure Docker is installed');
    }

    return instructions;
  }

  /**
   * Estimate setup time based on file count and complexity
   * @param {number} fileCount - Number of generated files
   * @returns {string} Estimated setup time
   */
  estimateSetupTime(fileCount) {
    if (fileCount < 10) return '5-10 minutes';
    if (fileCount < 25) return '10-20 minutes';
    if (fileCount < 50) return '20-30 minutes';
    return '30+ minutes';
  }
}