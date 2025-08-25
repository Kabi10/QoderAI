/**
 * File Generator
 * Manages file output and coordinates multi-file generation
 */

import fs from 'fs-extra';
import path from 'path';
import { Logger } from '../utils/Logger.js';

export class FileGenerator {
  constructor() {
    this.logger = new Logger('FileGenerator');
    this.outputOptions = {
      encoding: 'utf8',
      createDirectories: true,
      overwriteFiles: false,
      backupExisting: true,
      defaultPermissions: '0644'
    };
  }

  /**
   * Generate all files for a prompt suite
   * @param {Object} promptSuite - Complete prompt suite
   * @param {string} outputPath - Base output directory
   * @returns {Object} Generation results
   */
  async generateFiles(promptSuite, outputPath) {
    try {
      this.logger.info(`Generating ${promptSuite.files.length} files to ${outputPath}`);

      const results = {
        success: true,
        filesGenerated: 0,
        filesSkipped: 0,
        errors: [],
        generatedFiles: []
      };

      // Ensure output directory exists
      await fs.ensureDir(outputPath);

      // Generate organized file structure
      for (const [directory, dirInfo] of Object.entries(promptSuite.files)) {
        if (dirInfo.files && dirInfo.files.length > 0) {
          const dirResults = await this.generateDirectoryFiles(
            dirInfo.files, 
            path.join(outputPath, directory)
          );
          
          results.filesGenerated += dirResults.filesGenerated;
          results.filesSkipped += dirResults.filesSkipped;
          results.errors.push(...dirResults.errors);
          results.generatedFiles.push(...dirResults.generatedFiles);
        }
      }

      // Generate manifest file
      await this.generateManifestFile(promptSuite.manifest, outputPath);
      results.filesGenerated++;

      // Generate usage instructions
      await this.generateUsageInstructions(promptSuite.usageInstructions, outputPath);
      results.filesGenerated++;

      this.logger.success(`File generation completed: ${results.filesGenerated} files generated`);
      return results;

    } catch (error) {
      this.logger.error('File generation failed', error);
      throw error;
    }
  }

  /**
   * Generate files for a specific directory
   * @param {Array} files - Files to generate
   * @param {string} directoryPath - Target directory path
   * @returns {Object} Directory generation results
   */
  async generateDirectoryFiles(files, directoryPath) {
    const results = {
      filesGenerated: 0,
      filesSkipped: 0,
      errors: [],
      generatedFiles: []
    };

    // Ensure directory exists
    await fs.ensureDir(directoryPath);

    for (const file of files) {
      try {
        const filePath = path.join(directoryPath, file.path);
        const generateResult = await this.generateSingleFile(file, filePath);

        if (generateResult.generated) {
          results.filesGenerated++;
          results.generatedFiles.push(filePath);
        } else {
          results.filesSkipped++;
        }

      } catch (error) {
        results.errors.push({
          file: file.path,
          error: error.message
        });
        this.logger.warn(`Failed to generate file: ${file.path}`, error);
      }
    }

    return results;
  }

  /**
   * Generate a single file
   * @param {Object} file - File object with content and metadata
   * @param {string} filePath - Full file path
   * @returns {Object} Generation result
   */
  async generateSingleFile(file, filePath) {
    try {
      // Check if file already exists
      const exists = await fs.pathExists(filePath);
      
      if (exists && !this.outputOptions.overwriteFiles) {
        // Create backup if requested
        if (this.outputOptions.backupExisting) {
          await this.createBackup(filePath);
        } else {
          this.logger.debug(`Skipping existing file: ${filePath}`);
          return { generated: false, reason: 'File exists and overwrite disabled' };
        }
      }

      // Ensure parent directory exists
      await fs.ensureDir(path.dirname(filePath));

      // Write file content
      await fs.writeFile(filePath, file.content, this.outputOptions.encoding);

      // Set file permissions if specified
      if (this.outputOptions.defaultPermissions && process.platform !== 'win32') {
        await fs.chmod(filePath, this.outputOptions.defaultPermissions);
      }

      this.logger.debug(`Generated file: ${filePath} (${file.size} bytes)`);
      return { generated: true, path: filePath, size: file.size };

    } catch (error) {
      this.logger.error(`Failed to generate file: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Create a backup of an existing file
   * @param {string} filePath - Path to file to backup
   */
  async createBackup(filePath) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${filePath}.backup.${timestamp}`;
    
    try {
      await fs.copy(filePath, backupPath);
      this.logger.debug(`Created backup: ${backupPath}`);
    } catch (error) {
      this.logger.warn(`Failed to create backup for: ${filePath}`, error);
    }
  }

  /**
   * Generate manifest file
   * @param {Object} manifest - Manifest object
   * @param {string} outputPath - Output directory
   */
  async generateManifestFile(manifest, outputPath) {
    const manifestPath = path.join(outputPath, 'qoder-manifest.json');
    const manifestContent = JSON.stringify(manifest, null, 2);
    
    await fs.writeFile(manifestPath, manifestContent, this.outputOptions.encoding);
    this.logger.debug('Generated manifest file');
  }

  /**
   * Generate usage instructions file
   * @param {Object} instructions - Usage instructions
   * @param {string} outputPath - Output directory
   */
  async generateUsageInstructions(instructions, outputPath) {
    const instructionsPath = path.join(outputPath, 'USAGE.md');
    const instructionsContent = this.formatUsageInstructions(instructions);
    
    await fs.writeFile(instructionsPath, instructionsContent, this.outputOptions.encoding);
    this.logger.debug('Generated usage instructions');
  }

  /**
   * Format usage instructions as markdown
   * @param {Object} instructions - Usage instructions object
   * @returns {string} Formatted markdown content
   */
  formatUsageInstructions(instructions) {
    let content = '# Usage Instructions\n\n';
    
    content += '## Quick Start\n\n';
    if (instructions.quickStart) {
      for (const step of instructions.quickStart) {
        content += `${step}\n`;
      }
    }
    content += '\n';

    content += '## Setup\n\n';
    if (instructions.setup) {
      if (instructions.setup.dependencies) {
        content += '### Dependencies\n\n';
        if (typeof instructions.setup.dependencies === 'object') {
          content += `**NPM**: \`${instructions.setup.dependencies.npm}\`\n\n`;
          content += `**Yarn**: \`${instructions.setup.dependencies.yarn}\`\n\n`;
          if (instructions.setup.dependencies.specific) {
            content += '**Additional Requirements:**\n';
            for (const req of instructions.setup.dependencies.specific) {
              content += `- ${req}\n`;
            }
            content += '\n';
          }
        }
      }

      if (instructions.setup.environment) {
        content += '### Environment\n\n';
        content += `${instructions.setup.environment}\n\n`;
      }

      if (instructions.setup.build) {
        content += '### Build\n\n';
        content += `${instructions.setup.build}\n\n`;
      }
    }

    content += '## Project Structure\n\n';
    if (instructions.structure) {
      content += `- **Total Files**: ${instructions.structure.totalFiles}\n`;
      content += `- **Main Directories**: ${instructions.structure.mainDirectories.join(', ')}\n`;
      content += `- **Estimated Setup Time**: ${instructions.structure.estimatedSetupTime}\n\n`;
    }

    content += '## Next Steps\n\n';
    if (instructions.nextSteps) {
      for (const step of instructions.nextSteps) {
        content += `- ${step}\n`;
      }
    }

    return content;
  }

  /**
   * Generate a complete project structure
   * @param {Object} structure - Project structure definition
   * @param {string} basePath - Base output path
   */
  async generateProjectStructure(structure, basePath) {
    for (const [dirName, dirConfig] of Object.entries(structure)) {
      const dirPath = path.join(basePath, dirName);
      await fs.ensureDir(dirPath);

      // Create a README in each directory if description is provided
      if (dirConfig.description) {
        const readmePath = path.join(dirPath, 'README.md');
        const readmeContent = `# ${dirName}\n\n${dirConfig.description}\n`;
        await fs.writeFile(readmePath, readmeContent, this.outputOptions.encoding);
      }
    }
  }

  /**
   * Validate output paths are safe
   * @param {string} outputPath - Output path to validate
   * @returns {boolean} Whether path is safe
   */
  validateOutputPath(outputPath) {
    // Check for path traversal attempts
    if (outputPath.includes('..') || outputPath.includes('~')) {
      return false;
    }

    // Check for absolute paths that might be dangerous
    if (path.isAbsolute(outputPath)) {
      const forbidden = ['/etc', '/usr', '/bin', '/sbin', '/root'];
      if (forbidden.some(dir => outputPath.startsWith(dir))) {
        return false;
      }
    }

    return true;
  }

  /**
   * Clean up temporary or backup files
   * @param {string} outputPath - Output directory
   * @param {Object} options - Cleanup options
   */
  async cleanup(outputPath, options = {}) {
    try {
      if (options.removeBackups) {
        const backupPattern = path.join(outputPath, '**/*.backup.*');
        const backupFiles = await this.findFiles(backupPattern);
        
        for (const backupFile of backupFiles) {
          await fs.remove(backupFile);
        }
        
        this.logger.debug(`Cleaned up ${backupFiles.length} backup files`);
      }

      if (options.removeTempFiles) {
        const tempPattern = path.join(outputPath, '**/*.tmp');
        const tempFiles = await this.findFiles(tempPattern);
        
        for (const tempFile of tempFiles) {
          await fs.remove(tempFile);
        }
        
        this.logger.debug(`Cleaned up ${tempFiles.length} temporary files`);
      }

    } catch (error) {
      this.logger.warn('Cleanup failed', error);
    }
  }

  /**
   * Find files matching a pattern
   * @param {string} pattern - Glob pattern
   * @returns {Array} Matching file paths
   */
  async findFiles(pattern) {
    try {
      const { glob } = await import('glob');
      return await glob(pattern);
    } catch (error) {
      this.logger.warn('File search failed', error);
      return [];
    }
  }

  /**
   * Set output options
   * @param {Object} options - Output options
   */
  setOutputOptions(options) {
    this.outputOptions = { ...this.outputOptions, ...options };
    this.logger.debug('Output options updated', this.outputOptions);
  }

  /**
   * Get file generation statistics
   * @param {Array} files - Generated files
   * @returns {Object} Statistics
   */
  getGenerationStats(files) {
    const stats = {
      totalFiles: files.length,
      totalSize: 0,
      fileTypes: {},
      directories: new Set()
    };

    for (const file of files) {
      stats.totalSize += file.size || 0;
      
      // Track file types
      const ext = path.extname(file.path) || 'no-extension';
      stats.fileTypes[ext] = (stats.fileTypes[ext] || 0) + 1;
      
      // Track directories
      const dir = path.dirname(file.path);
      if (dir !== '.') {
        stats.directories.add(dir);
      }
    }

    stats.directories = Array.from(stats.directories);
    return stats;
  }

  /**
   * Verify generated files exist and are readable
   * @param {Array} filePaths - Paths to verify
   * @returns {Object} Verification results
   */
  async verifyGeneratedFiles(filePaths) {
    const results = {
      verified: 0,
      missing: 0,
      errors: [],
      totalSize: 0
    };

    for (const filePath of filePaths) {
      try {
        const stats = await fs.stat(filePath);
        results.verified++;
        results.totalSize += stats.size;
      } catch (error) {
        results.missing++;
        results.errors.push({
          file: filePath,
          error: error.message
        });
      }
    }

    return results;
  }
}