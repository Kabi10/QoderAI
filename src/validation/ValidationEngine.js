/**
 * Validation Engine
 * Handles input validation, output validation, and quality assurance
 */

import fs from 'fs-extra';
import path from 'path';
import Joi from 'joi';
import { Logger } from '../utils/Logger.js';

export class ValidationEngine {
  constructor() {
    this.logger = new Logger('ValidationEngine');
    this.validationRules = new Map();
    this.securityRules = new Map();
    this.performanceRules = new Map();
  }

  /**
   * Load all validation rules
   */
  async loadValidationRules() {
    try {
      this.logger.info('Loading validation rules...');

      // Load core validation rules
      await this.loadCoreValidationRules();

      // Load security validation rules
      await this.loadSecurityValidationRules();

      // Load performance validation rules
      await this.loadPerformanceValidationRules();

      this.logger.success(`Loaded ${this.validationRules.size} validation rules`);

    } catch (error) {
      this.logger.error('Failed to load validation rules', error);
      throw error;
    }
  }

  /**
   * Load core validation rules
   */
  async loadCoreValidationRules() {
    const coreRules = {
      'syntax-check': {
        name: 'Syntax Check',
        description: 'Validates code syntax for common languages',
        validate: this.validateSyntax.bind(this),
        fileTypes: ['.js', '.ts', '.jsx', '.tsx', '.json', '.html', '.css', '.scss']
      },

      'file-structure': {
        name: 'File Structure Validation',
        description: 'Validates file and directory structure',
        validate: this.validateFileStructure.bind(this),
        fileTypes: ['*']
      },

      'template-completeness': {
        name: 'Template Completeness',
        description: 'Ensures all required template sections are present',
        validate: this.validateTemplateCompleteness.bind(this),
        fileTypes: ['.mustache', '.hbs', '.ejs']
      },

      'dependency-check': {
        name: 'Dependency Check',
        description: 'Validates package dependencies and versions',
        validate: this.validateDependencies.bind(this),
        fileTypes: ['package.json', 'requirements.txt', 'pom.xml']
      }
    };

    for (const [id, rule] of Object.entries(coreRules)) {
      this.validationRules.set(id, rule);
    }
  }

  /**
   * Load security validation rules
   */
  async loadSecurityValidationRules() {
    const securityRules = {
      'secret-scan': {
        name: 'Secret Scanning',
        description: 'Scans for exposed secrets and API keys',
        validate: this.scanForSecrets.bind(this),
        severity: 'critical'
      },

      'path-traversal': {
        name: 'Path Traversal Check',
        description: 'Checks for path traversal vulnerabilities',
        validate: this.checkPathTraversal.bind(this),
        severity: 'high'
      },

      'injection-check': {
        name: 'Injection Vulnerability Check',
        description: 'Scans for potential injection vulnerabilities',
        validate: this.checkInjectionVulnerabilities.bind(this),
        severity: 'high'
      },

      'file-permissions': {
        name: 'File Permissions',
        description: 'Validates file permissions are secure',
        validate: this.validateFilePermissions.bind(this),
        severity: 'medium'
      }
    };

    for (const [id, rule] of Object.entries(securityRules)) {
      this.securityRules.set(id, rule);
    }
  }

  /**
   * Load performance validation rules
   */
  async loadPerformanceValidationRules() {
    const performanceRules = {
      'file-size': {
        name: 'File Size Check',
        description: 'Validates file sizes are within limits',
        validate: this.validateFileSize.bind(this),
        limits: { max: 5242880 } // 5MB
      },

      'complexity-check': {
        name: 'Code Complexity',
        description: 'Checks code complexity metrics',
        validate: this.validateComplexity.bind(this),
        limits: { cyclomaticComplexity: 10 }
      },

      'memory-usage': {
        name: 'Memory Usage Estimation',
        description: 'Estimates memory usage of generated code',
        validate: this.estimateMemoryUsage.bind(this),
        limits: { maxEstimatedUsage: 104857600 } // 100MB
      }
    };

    for (const [id, rule] of Object.entries(performanceRules)) {
      this.performanceRules.set(id, rule);
    }
  }

  /**
   * Validate user inputs
   * @param {Object} inputs - User inputs to validate
   * @returns {Object} Validation results
   */
  async validateInputs(inputs) {
    try {
      this.logger.debug('Validating user inputs');

      const validationResults = {
        valid: true,
        errors: [],
        warnings: [],
        normalized: inputs
      };

      // Basic input validation
      const basicValidation = await this.performBasicInputValidation(inputs);
      if (!basicValidation.valid) {
        validationResults.valid = false;
        validationResults.errors.push(...basicValidation.errors);
      }

      // Security validation of inputs
      const securityValidation = await this.performInputSecurityValidation(inputs);
      validationResults.warnings.push(...securityValidation.warnings);

      // Normalize and sanitize inputs
      validationResults.normalized = this.normalizeInputs(inputs);

      this.logger.debug('Input validation completed', {
        valid: validationResults.valid,
        errors: validationResults.errors.length,
        warnings: validationResults.warnings.length
      });

      return validationResults.normalized;

    } catch (error) {
      this.logger.error('Input validation failed', error);
      throw error;
    }
  }

  /**
   * Validate generated output
   * @param {Object} promptSuite - Generated prompt suite
   * @returns {Object} Validation results
   */
  async validateOutput(promptSuite) {
    try {
      this.logger.debug('Validating generated output');

      const validationResults = {
        valid: true,
        errors: [],
        warnings: [],
        security: { passed: true, issues: [] },
        performance: { passed: true, issues: [] },
        quality: { score: 0, metrics: {} }
      };

      // Validate file structure
      const structureValidation = await this.validateFileStructure(promptSuite.files);
      if (!structureValidation.valid) {
        validationResults.valid = false;
        validationResults.errors.push(...structureValidation.errors);
      }

      // Security validation
      const securityValidation = await this.performSecurityValidation(promptSuite.files);
      validationResults.security = securityValidation;
      if (!securityValidation.passed) {
        validationResults.warnings.push('Security issues detected');
      }

      // Performance validation
      const performanceValidation = await this.performPerformanceValidation(promptSuite.files);
      validationResults.performance = performanceValidation;
      if (!performanceValidation.passed) {
        validationResults.warnings.push('Performance issues detected');
      }

      // Quality assessment
      const qualityAssessment = await this.assessQuality(promptSuite.files);
      validationResults.quality = qualityAssessment;

      this.logger.debug('Output validation completed', {
        valid: validationResults.valid,
        securityPassed: securityValidation.passed,
        performancePassed: performanceValidation.passed,
        qualityScore: qualityAssessment.score
      });

      return validationResults;

    } catch (error) {
      this.logger.error('Output validation failed', error);
      throw error;
    }
  }

  /**
   * Validate generated content
   * @param {Array} files - Generated files
   * @returns {Array} Validated files with issues marked
   */
  async validateGeneratedContent(files) {
    const validatedFiles = [];

    for (const file of files) {
      try {
        const fileValidation = await this.validateSingleFile(file);
        
        validatedFiles.push({
          ...file,
          validation: fileValidation
        });

      } catch (error) {
        this.logger.warn(`Failed to validate file: ${file.path}`, error);
        validatedFiles.push({
          ...file,
          validation: {
            valid: false,
            errors: [`Validation failed: ${error.message}`],
            warnings: []
          }
        });
      }
    }

    return validatedFiles;
  }

  /**
   * Validate a single file
   * @param {Object} file - File object
   * @returns {Object} Validation results
   */
  async validateSingleFile(file) {
    const validation = {
      valid: true,
      errors: [],
      warnings: [],
      metrics: {}
    };

    // Syntax validation
    if (this.needsSyntaxValidation(file.path)) {
      const syntaxValidation = await this.validateSyntax(file);
      if (!syntaxValidation.valid) {
        validation.valid = false;
        validation.errors.push(...syntaxValidation.errors);
      }
    }

    // Security validation
    const securityValidation = await this.scanForSecrets(file);
    validation.warnings.push(...securityValidation.warnings);

    // Performance validation
    const performanceValidation = await this.validateFileSize(file);
    if (!performanceValidation.valid) {
      validation.warnings.push(...performanceValidation.warnings);
    }

    return validation;
  }

  /**
   * Perform basic input validation
   * @param {Object} inputs - User inputs
   * @returns {Object} Validation results
   */
  async performBasicInputValidation(inputs) {
    const schema = Joi.object({
      category: Joi.string().required(),
      projectName: Joi.string().required().min(1).max(100),
      techStack: Joi.array().items(Joi.string()),
      targetAudience: Joi.string().max(500),
      deploymentTarget: Joi.string().max(100),
      constraints: Joi.array().items(Joi.string()),
      outputPath: Joi.string().regex(/^[^<>:"|?*]*$/)
    });

    const { error, value } = schema.validate(inputs, { abortEarly: false });

    return {
      valid: !error,
      errors: error ? error.details.map(detail => detail.message) : [],
      normalized: value
    };
  }

  /**
   * Perform security validation on inputs
   * @param {Object} inputs - User inputs
   * @returns {Object} Security validation results
   */
  async performInputSecurityValidation(inputs) {
    const warnings = [];

    // Check for potential injection attempts
    const stringInputs = [inputs.projectName, inputs.targetAudience, inputs.deploymentTarget];
    for (const input of stringInputs) {
      if (typeof input === 'string' && this.containsSuspiciousContent(input)) {
        warnings.push(`Potentially suspicious content detected in input: ${input.substring(0, 50)}...`);
      }
    }

    // Check output path for traversal attempts
    if (inputs.outputPath && (inputs.outputPath.includes('..') || inputs.outputPath.includes('~'))) {
      warnings.push('Output path contains potentially unsafe directory traversal');
    }

    return { warnings };
  }

  /**
   * Validate file syntax
   * @param {Object} file - File object
   * @returns {Object} Syntax validation results
   */
  async validateSyntax(file) {
    const validation = { valid: true, errors: [] };

    try {
      const extension = path.extname(file.path);

      switch (extension) {
        case '.json':
          JSON.parse(file.content);
          break;
        case '.js':
        case '.jsx':
          // Basic JavaScript syntax checks
          if (this.hasBasicJSSyntaxErrors(file.content)) {
            validation.valid = false;
            validation.errors.push('JavaScript syntax errors detected');
          }
          break;
        case '.html':
          if (this.hasBasicHTMLSyntaxErrors(file.content)) {
            validation.valid = false;
            validation.errors.push('HTML syntax errors detected');
          }
          break;
      }
    } catch (error) {
      validation.valid = false;
      validation.errors.push(`Syntax error: ${error.message}`);
    }

    return validation;
  }

  /**
   * Validate file structure
   * @param {Object} filesStructure - Files organized by directory structure
   * @returns {Object} Structure validation results
   */
  async validateFileStructure(filesStructure) {
    const validation = { valid: true, errors: [], warnings: [] };

    // Handle case where filesStructure is not an object
    if (!filesStructure || typeof filesStructure !== 'object') {
      validation.valid = false;
      validation.errors.push('Files structure must be an object');
      return validation;
    }

    // Extract all files from the directory structure
    const allFiles = this.extractAllFilesFromStructure(filesStructure);

    if (allFiles.length === 0) {
      validation.valid = false;
      validation.errors.push('No files were generated');
      return validation;
    }

    // Check for required files
    const requiredFiles = ['package.json', 'README.md'];
    const filePaths = allFiles.map(f => path.basename(f.path));

    for (const requiredFile of requiredFiles) {
      if (!filePaths.includes(requiredFile)) {
        validation.warnings.push(`Recommended file missing: ${requiredFile}`);
      }
    }

    // Check for duplicate files
    const duplicates = filePaths.filter((path, index) => filePaths.indexOf(path) !== index);
    if (duplicates.length > 0) {
      validation.valid = false;
      validation.errors.push(`Duplicate files detected: ${duplicates.join(', ')}`);
    }

    return validation;
  }

  /**
   * Scan for secrets in file content
   * @param {Object} file - File object
   * @returns {Object} Security scan results
   */
  async scanForSecrets(file) {
    const warnings = [];

    // Common secret patterns
    const secretPatterns = [
      /api[_-]?key\s*[:=]\s*['"][^'"]{20,}['"]/i,
      /secret[_-]?key\s*[:=]\s*['"][^'"]{20,}['"]/i,
      /password\s*[:=]\s*['"][^'"]{8,}['"]/i,
      /token\s*[:=]\s*['"][^'"]{20,}['"]/i,
      /access[_-]?token\s*[:=]\s*['"][^'"]{20,}['"]/i
    ];

    for (const pattern of secretPatterns) {
      if (pattern.test(file.content)) {
        warnings.push(`Potential secret detected in ${file.path}`);
      }
    }

    return { warnings };
  }

  /**
   * Check for path traversal vulnerabilities
   * @param {Object} file - File object
   * @returns {Object} Path traversal check results
   */
  async checkPathTraversal(file) {
    const warnings = [];

    if (file.content.includes('../') || file.content.includes('..\\')) {
      warnings.push(`Potential path traversal detected in ${file.path}`);
    }

    return { warnings };
  }

  /**
   * Validate file size
   * @param {Object} file - File object
   * @returns {Object} File size validation results
   */
  async validateFileSize(file) {
    const maxSize = 5242880; // 5MB
    const validation = { valid: true, warnings: [] };

    if (file.size > maxSize) {
      validation.valid = false;
      validation.warnings.push(`File ${file.path} exceeds maximum size limit (${maxSize} bytes)`);
    }

    return validation;
  }

  /**
   * Assess overall quality of generated files
   * @param {Object} filesStructure - Files organized by directory structure
   * @returns {Object} Quality assessment
   */
  async assessQuality(filesStructure) {
    const metrics = {
      totalFiles: 0,
      averageFileSize: 0,
      codeQuality: 0,
      documentation: 0,
      testCoverage: 0
    };

    // Handle case where filesStructure is not an object
    if (!filesStructure || typeof filesStructure !== 'object') {
      return { score: 0, metrics };
    }

    // Extract all files from the directory structure
    const allFiles = this.extractAllFilesFromStructure(filesStructure);

    if (allFiles.length === 0) {
      return { score: 0, metrics };
    }

    metrics.totalFiles = allFiles.length;

    // Calculate average file size
    const totalSize = allFiles.reduce((sum, file) => sum + (file.size || 0), 0);
    metrics.averageFileSize = totalSize / allFiles.length;

    // Assess code quality (basic heuristics)
    const codeFiles = allFiles.filter(f => this.isCodeFile(f.path));
    if (codeFiles.length > 0) {
      metrics.codeQuality = this.assessCodeQuality(codeFiles);
    }

    // Check documentation presence
    const docFiles = allFiles.filter(f => this.isDocumentationFile(f.path));
    metrics.documentation = Math.min(1, docFiles.length / Math.max(1, codeFiles.length / 5));

    // Check test coverage
    const testFiles = allFiles.filter(f => this.isTestFile(f.path));
    metrics.testCoverage = Math.min(1, testFiles.length / Math.max(1, codeFiles.length / 3));

    // Calculate overall quality score
    const score = (
      (metrics.codeQuality * 0.4) +
      (metrics.documentation * 0.3) +
      (metrics.testCoverage * 0.3)
    ) * 100;

    return { score: Math.round(score), metrics };
  }

  // Utility methods

  needsSyntaxValidation(filePath) {
    const syntaxCheckExtensions = ['.js', '.ts', '.jsx', '.tsx', '.json', '.html', '.css'];
    return syntaxCheckExtensions.includes(path.extname(filePath));
  }

  containsSuspiciousContent(input) {
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /\$\(/,
      /eval\(/i,
      /exec\(/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(input));
  }

  hasBasicJSSyntaxErrors(content) {
    // Very basic JavaScript syntax checking
    const openBraces = (content.match(/\{/g) || []).length;
    const closeBraces = (content.match(/\}/g) || []).length;
    const openParens = (content.match(/\(/g) || []).length;
    const closeParens = (content.match(/\)/g) || []).length;

    return openBraces !== closeBraces || openParens !== closeParens;
  }

  hasBasicHTMLSyntaxErrors(content) {
    // Basic HTML validation
    return !content.includes('<!DOCTYPE') && content.includes('<html');
  }

  isCodeFile(filePath) {
    const codeExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go', '.rs'];
    return codeExtensions.includes(path.extname(filePath));
  }

  isDocumentationFile(filePath) {
    const docExtensions = ['.md', '.txt', '.rst'];
    const fileName = path.basename(filePath).toLowerCase();
    return docExtensions.includes(path.extname(filePath)) || fileName.includes('readme');
  }

  isTestFile(filePath) {
    const testPatterns = ['test', 'spec', '__tests__'];
    return testPatterns.some(pattern => filePath.toLowerCase().includes(pattern));
  }

  /**
   * Extract all files from the nested directory structure
   * @param {Object} filesStructure - Files organized by directories
   * @returns {Array} Flat array of all files
   */
  extractAllFilesFromStructure(filesStructure) {
    const allFiles = [];
    
    for (const [directory, dirInfo] of Object.entries(filesStructure)) {
      if (dirInfo && dirInfo.files && Array.isArray(dirInfo.files)) {
        allFiles.push(...dirInfo.files);
      }
    }
    
    return allFiles;
  }

  assessCodeQuality(codeFiles) {
    // Simple heuristics for code quality
    let qualityScore = 0;
    let totalFiles = codeFiles.length;

    for (const file of codeFiles) {
      let fileScore = 0.5; // Base score

      // Check for comments
      if (file.content.includes('//') || file.content.includes('/*')) {
        fileScore += 0.2;
      }

      // Check for function documentation
      if (file.content.includes('/**') || file.content.includes('* @')) {
        fileScore += 0.2;
      }

      // Check for imports/exports (modular code)
      if (file.content.includes('import ') || file.content.includes('export ')) {
        fileScore += 0.1;
      }

      qualityScore += Math.min(1, fileScore);
    }

    return totalFiles > 0 ? qualityScore / totalFiles : 0;
  }

  normalizeInputs(inputs) {
    return {
      ...inputs,
      projectName: inputs.projectName?.trim(),
      category: inputs.category?.toLowerCase(),
      techStack: Array.isArray(inputs.techStack) ? inputs.techStack : [],
      constraints: Array.isArray(inputs.constraints) ? inputs.constraints : []
    };
  }

  // Additional validation methods can be added here...

  async performSecurityValidation(filesStructure) {
    const issues = [];

    // Handle case where filesStructure is not an object
    if (!filesStructure || typeof filesStructure !== 'object') {
      return {
        passed: false,
        issues: ['Files structure must be an object for security validation']
      };
    }

    // Extract all files from the directory structure
    const allFiles = this.extractAllFilesFromStructure(filesStructure);

    for (const file of allFiles) {
      const securityCheck = await this.scanForSecrets(file);
      if (securityCheck.warnings.length > 0) {
        issues.push(...securityCheck.warnings);
      }

      const pathCheck = await this.checkPathTraversal(file);
      if (pathCheck.warnings.length > 0) {
        issues.push(...pathCheck.warnings);
      }
    }

    return {
      passed: issues.length === 0,
      issues
    };
  }

  async performPerformanceValidation(filesStructure) {
    const issues = [];

    // Handle case where filesStructure is not an object
    if (!filesStructure || typeof filesStructure !== 'object') {
      return {
        passed: false,
        issues: ['Files structure must be an object for performance validation']
      };
    }

    // Extract all files from the directory structure
    const allFiles = this.extractAllFilesFromStructure(filesStructure);

    for (const file of allFiles) {
      const sizeCheck = await this.validateFileSize(file);
      if (!sizeCheck.valid) {
        issues.push(...sizeCheck.warnings);
      }
    }

    return {
      passed: issues.length === 0,
      issues
    };
  }

  async validateGeneratedFiles(outputPath) {
    // This method would validate files that have been written to disk
    // Implementation would depend on the specific validation requirements
    return { valid: true, errors: [], warnings: [] };
  }

  async validateTemplateCompleteness(template) {
    // Validate that templates have all required sections
    return { valid: true, errors: [] };
  }

  async validateDependencies(file) {
    // Validate package.json or other dependency files
    return { valid: true, errors: [] };
  }

  async checkInjectionVulnerabilities(file) {
    // Check for potential injection vulnerabilities
    return { warnings: [] };
  }

  async validateFilePermissions(file) {
    // Validate file permissions are secure
    return { valid: true, warnings: [] };
  }

  async validateComplexity(file) {
    // Validate code complexity metrics
    return { valid: true, warnings: [] };
  }

  async estimateMemoryUsage(files) {
    // Estimate memory usage of generated code
    return { valid: true, warnings: [] };
  }
}