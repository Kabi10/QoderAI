/**
 * Base Transformer
 * Base class for all transformers
 */

import { Logger } from '../utils/Logger.js';

export class BaseTransformer {
  constructor() {
    this.logger = new Logger(this.constructor.name);
  }

  /**
   * Transform files according to the transformer's logic
   * @param {Array} files - Files to transform
   * @param {Object} config - Transformation configuration
   * @param {Object} context - Generation context
   * @returns {Array} Transformed files
   */
  async transform(files, config = {}, context = {}) {
    try {
      this.logger.debug(`Starting ${this.constructor.name} transformation`);
      
      const transformedFiles = await this.doTransform(files, config, context);
      
      this.logger.debug(`Completed ${this.constructor.name} transformation`);
      return transformedFiles;
      
    } catch (error) {
      this.logger.error(`Transformation failed: ${error.message}`, error);
      // Return original files on transformation failure
      return files;
    }
  }

  /**
   * Implement this method in subclasses
   * @param {Array} files - Files to transform
   * @param {Object} config - Transformation configuration
   * @param {Object} context - Generation context
   * @returns {Array} Transformed files
   */
  async doTransform(files, config, context) {
    throw new Error('doTransform method must be implemented by subclasses');
  }

  /**
   * Helper method to find files by pattern
   * @param {Array} files - Files array
   * @param {RegExp|string} pattern - Pattern to match
   * @returns {Array} Matching files
   */
  findFiles(files, pattern) {
    if (typeof pattern === 'string') {
      return files.filter(file => file.path.includes(pattern));
    }
    return files.filter(file => pattern.test(file.path));
  }

  /**
   * Helper method to update file content
   * @param {Object} file - File object
   * @param {string} newContent - New content
   * @returns {Object} Updated file object
   */
  updateFileContent(file, newContent) {
    return {
      ...file,
      content: newContent,
      size: Buffer.byteLength(newContent, 'utf8'),
      lastModified: new Date().toISOString()
    };
  }
}