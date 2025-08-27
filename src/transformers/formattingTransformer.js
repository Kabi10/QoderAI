/**
 * Formatting Transformer
 * Handles code formatting and style transformations
 */

import { BaseTransformer } from './BaseTransformer.js';

export default class FormattingTransformer extends BaseTransformer {
  /**
   * Apply formatting transformations to files
   * @param {Array} files - Files to transform
   * @param {Object} config - Formatting configuration
   * @param {Object} context - Generation context
   * @returns {Array} Formatted files
   */
  async doTransform(files, config, context) {
    const transformedFiles = [];

    for (const file of files) {
      let transformedFile = { ...file };

      // Apply prettier formatting if enabled
      if (config.prettier) {
        transformedFile = await this.applyPrettierFormatting(transformedFile, config);
      }

      // Apply ESLint formatting if enabled
      if (config.eslint) {
        transformedFile = await this.applyESLintFormatting(transformedFile, config);
      }

      // Apply minification if enabled
      if (config.minify) {
        transformedFile = await this.applyMinification(transformedFile, config);
      }

      // Apply general code formatting
      transformedFile = await this.applyGeneralFormatting(transformedFile, config);

      transformedFiles.push(transformedFile);
    }

    return transformedFiles;
  }

  /**
   * Apply Prettier formatting (mock implementation)
   * @param {Object} file - File to format
   * @param {Object} config - Configuration
   * @returns {Object} Formatted file
   */
  async applyPrettierFormatting(file, config) {
    // Mock implementation - in a real scenario, this would use Prettier API
    if (this.isCodeFile(file)) {
      let content = file.content;
      
      // Basic formatting improvements
      content = this.normalizeLineEndings(content);
      content = this.normalizeIndentation(content);
      
      this.logger.debug(`Applied Prettier formatting to ${file.path}`);
      return this.updateFileContent(file, content);
    }

    return file;
  }

  /**
   * Apply ESLint formatting (mock implementation)
   * @param {Object} file - File to format
   * @param {Object} config - Configuration
   * @returns {Object} Formatted file
   */
  async applyESLintFormatting(file, config) {
    // Mock implementation - in a real scenario, this would use ESLint API
    if (this.isJavaScriptFile(file)) {
      let content = file.content;
      
      // Basic ESLint-style formatting
      content = this.fixCommonESLintIssues(content);
      
      this.logger.debug(`Applied ESLint formatting to ${file.path}`);
      return this.updateFileContent(file, content);
    }

    return file;
  }

  /**
   * Apply minification
   * @param {Object} file - File to minify
   * @param {Object} config - Configuration
   * @returns {Object} Minified file
   */
  async applyMinification(file, config) {
    if (this.isCSSFile(file) || this.isJavaScriptFile(file)) {
      let content = file.content;
      
      // Basic minification - remove extra whitespace and comments
      content = this.basicMinify(content);
      
      this.logger.debug(`Applied minification to ${file.path}`);
      return this.updateFileContent(file, content);
    }

    return file;
  }

  /**
   * Apply general formatting rules
   * @param {Object} file - File to format
   * @param {Object} config - Configuration
   * @returns {Object} Formatted file
   */
  async applyGeneralFormatting(file, config) {
    let content = file.content;

    // Normalize line endings
    content = this.normalizeLineEndings(content);

    // Ensure files end with newline
    if (content && !content.endsWith('\n')) {
      content += '\n';
    }

    // Remove trailing whitespace
    content = content.replace(/[ \t]+$/gm, '');

    return this.updateFileContent(file, content);
  }

  /**
   * Check if file is a code file
   * @param {Object} file - File to check
   * @returns {boolean} Whether file is a code file
   */
  isCodeFile(file) {
    const codeExtensions = ['.js', '.ts', '.jsx', '.tsx', '.vue', '.css', '.scss', '.html'];
    return codeExtensions.some(ext => file.path.endsWith(ext));
  }

  /**
   * Check if file is a JavaScript file
   * @param {Object} file - File to check
   * @returns {boolean} Whether file is a JavaScript file
   */
  isJavaScriptFile(file) {
    const jsExtensions = ['.js', '.ts', '.jsx', '.tsx'];
    return jsExtensions.some(ext => file.path.endsWith(ext));
  }

  /**
   * Check if file is a CSS file
   * @param {Object} file - File to check
   * @returns {boolean} Whether file is a CSS file
   */
  isCSSFile(file) {
    const cssExtensions = ['.css', '.scss', '.sass'];
    return cssExtensions.some(ext => file.path.endsWith(ext));
  }

  /**
   * Normalize line endings to LF
   * @param {string} content - Content to normalize
   * @returns {string} Normalized content
   */
  normalizeLineEndings(content) {
    return content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  }

  /**
   * Normalize indentation
   * @param {string} content - Content to normalize
   * @returns {string} Normalized content
   */
  normalizeIndentation(content) {
    // Convert tabs to spaces (2 spaces)
    return content.replace(/\t/g, '  ');
  }

  /**
   * Fix common ESLint issues
   * @param {string} content - Content to fix
   * @returns {string} Fixed content
   */
  fixCommonESLintIssues(content) {
    // Add semicolons where missing (basic implementation)
    content = content.replace(/^(\s*(?:const|let|var|function|return|import|export).*[^;{}])$/gm, '$1;');
    
    // Fix spacing around operators
    content = content.replace(/([^=!<>])=([^=])/g, '$1 = $2');
    content = content.replace(/([^=!<>])==([^=])/g, '$1 == $2');
    content = content.replace(/([^=!<>])===([^=])/g, '$1 === $2');
    
    return content;
  }

  /**
   * Basic minification
   * @param {string} content - Content to minify
   * @returns {string} Minified content
   */
  basicMinify(content) {
    // Remove comments
    content = content.replace(/\/\*[\s\S]*?\*\//g, '');
    content = content.replace(/\/\/.*$/gm, '');
    
    // Remove extra whitespace
    content = content.replace(/\s+/g, ' ');
    content = content.replace(/\s*([{}();,])\s*/g, '$1');
    
    return content.trim();
  }
}