/**
 * Example Custom Transformer Plugin
 * Demonstrates how to create a custom transformer for the Qoder AI system
 * 
 * @id markdown-beautifier
 * @name Markdown Beautifier
 * @version 1.0.0
 * @description Custom transformer that beautifies and optimizes markdown content
 * @type transformer
 * @author Qoder AI Team
 */

import { BaseTransformerPlugin } from '../BasePlugin.js';

export default class MarkdownBeautifierPlugin extends BaseTransformerPlugin {
  constructor(api) {
    super(api);
    this.name = 'Markdown Beautifier';
    this.version = '1.0.0';
    this.description = 'Beautifies and optimizes markdown content';
    
    // Plugin configuration
    this.config = {
      formatTables: true,
      optimizeImages: true,
      addTableOfContents: true,
      normalizeWhitespace: true,
      validateLinks: true,
      fixHeadingStructure: true
    };
  }

  /**
   * Initialize the plugin
   */
  async initialize() {
    await super.initialize();
    
    this.logger.info('Markdown Beautifier Plugin initialized');
    
    // Register hooks
    this.api.registerHook('pre-transformation', this.onPreTransformation.bind(this));
    this.api.registerHook('post-transformation', this.onPostTransformation.bind(this));
  }

  /**
   * Transform markdown content
   * @param {string} content - Markdown content to transform
   * @param {Object} options - Transformation options
   * @returns {string} Beautified markdown content
   */
  async transform(content, options = {}) {
    try {
      this.logger.debug('Starting markdown beautification');

      let beautifiedContent = content;
      const stats = {
        originalLength: content.length,
        transformationsApplied: []
      };

      // Merge plugin config with options
      const config = { ...this.config, ...options };

      // Apply transformations
      if (config.normalizeWhitespace) {
        beautifiedContent = this.normalizeWhitespace(beautifiedContent);
        stats.transformationsApplied.push('whitespace-normalization');
      }

      if (config.fixHeadingStructure) {
        beautifiedContent = this.fixHeadingStructure(beautifiedContent);
        stats.transformationsApplied.push('heading-structure-fix');
      }

      if (config.formatTables) {
        beautifiedContent = this.formatTables(beautifiedContent);
        stats.transformationsApplied.push('table-formatting');
      }

      if (config.optimizeImages) {
        beautifiedContent = this.optimizeImages(beautifiedContent);
        stats.transformationsApplied.push('image-optimization');
      }

      if (config.addTableOfContents) {
        beautifiedContent = this.addTableOfContents(beautifiedContent);
        stats.transformationsApplied.push('table-of-contents');
      }

      if (config.validateLinks) {
        const linkValidation = await this.validateLinks(beautifiedContent);
        if (linkValidation.warnings.length > 0) {
          stats.linkWarnings = linkValidation.warnings;
        }
      }

      stats.finalLength = beautifiedContent.length;
      stats.improvement = ((stats.originalLength - stats.finalLength) / stats.originalLength * 100).toFixed(2);

      this.logger.debug('Markdown beautification completed', stats);

      return {
        content: beautifiedContent,
        stats,
        metadata: {
          transformer: this.name,
          version: this.version,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      this.logger.error('Markdown transformation failed', error);
      throw error;
    }
  }

  /**
   * Normalize whitespace in markdown
   */
  normalizeWhitespace(content) {
    return content
      // Remove trailing whitespace
      .replace(/[ \t]+$/gm, '')
      // Normalize line endings
      .replace(/\r\n/g, '\n')
      // Remove excessive blank lines (more than 2)
      .replace(/\n{3,}/g, '\n\n')
      // Ensure single space after list markers
      .replace(/^(\s*[-*+])\s+/gm, '$1 ')
      // Normalize ordered list spacing
      .replace(/^(\s*\d+\.)\s+/gm, '$1 ');
  }

  /**
   * Fix heading structure to ensure proper hierarchy
   */
  fixHeadingStructure(content) {
    const lines = content.split('\n');
    const headings = [];
    let previousLevel = 0;

    // Find all headings
    lines.forEach((line, index) => {
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const text = headingMatch[2];
        headings.push({ index, level, text, originalLine: line });
      }
    });

    // Fix heading hierarchy
    headings.forEach((heading, i) => {
      if (i === 0) {
        // First heading should be h1
        if (heading.level > 1) {
          const newLevel = 1;
          const newLine = '#'.repeat(newLevel) + ' ' + heading.text;
          lines[heading.index] = newLine;
          heading.level = newLevel;
        }
      } else {
        const prevHeading = headings[i - 1];
        const maxAllowedLevel = prevHeading.level + 1;
        
        if (heading.level > maxAllowedLevel) {
          const newLevel = maxAllowedLevel;
          const newLine = '#'.repeat(newLevel) + ' ' + heading.text;
          lines[heading.index] = newLine;
          heading.level = newLevel;
        }
      }
    });

    return lines.join('\n');
  }

  /**
   * Format markdown tables
   */
  formatTables(content) {
    // Find and format tables
    return content.replace(/^\|.*\|$/gm, (match) => {
      const rows = match.split('\n').filter(row => row.trim());
      
      if (rows.length < 2) return match;

      // Parse table
      const parsedRows = rows.map(row => 
        row.split('|').map(cell => cell.trim()).filter(cell => cell !== '')
      );

      // Calculate column widths
      const colCount = Math.max(...parsedRows.map(row => row.length));
      const colWidths = new Array(colCount).fill(0);

      parsedRows.forEach(row => {
        row.forEach((cell, i) => {
          colWidths[i] = Math.max(colWidths[i], cell.length);
        });
      });

      // Format table
      const formattedRows = parsedRows.map((row, rowIndex) => {
        const paddedCells = row.map((cell, i) => {
          if (rowIndex === 1 && cell.match(/^:?-+:?$/)) {
            // Alignment row
            if (cell.startsWith(':') && cell.endsWith(':')) {
              return ':' + '-'.repeat(colWidths[i] - 2) + ':';
            } else if (cell.endsWith(':')) {
              return '-'.repeat(colWidths[i] - 1) + ':';
            } else {
              return '-'.repeat(colWidths[i]);
            }
          } else {
            return cell.padEnd(colWidths[i]);
          }
        });
        
        return '| ' + paddedCells.join(' | ') + ' |';
      });

      return formattedRows.join('\n');
    });
  }

  /**
   * Optimize image references
   */
  optimizeImages(content) {
    return content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
      // Add alt text if missing
      if (!alt.trim()) {
        const filename = src.split('/').pop().split('.')[0];
        alt = filename.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }

      // Optimize image path
      let optimizedSrc = src;
      
      // Add webp suffix for better performance (if not already optimized)
      if (!src.includes('?') && !src.endsWith('.webp') && (src.endsWith('.jpg') || src.endsWith('.png'))) {
        optimizedSrc = src.replace(/\.(jpg|png)$/, '.webp');
      }

      return `![${alt}](${optimizedSrc})`;
    });
  }

  /**
   * Add table of contents
   */
  addTableOfContents(content) {
    const lines = content.split('\n');
    const headings = [];
    let tocIndex = -1;

    // Check if TOC already exists
    lines.forEach((line, index) => {
      if (line.toLowerCase().includes('table of contents') || line.toLowerCase().includes('toc')) {
        tocIndex = index;
      }
      
      const headingMatch = line.match(/^(#{2,6})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const text = headingMatch[2];
        const anchor = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
        headings.push({ level, text, anchor });
      }
    });

    if (headings.length < 3) return content; // Don't add TOC for short documents

    // Generate TOC
    const tocLines = ['## Table of Contents', ''];
    headings.forEach(heading => {
      const indent = '  '.repeat(heading.level - 2);
      tocLines.push(`${indent}- [${heading.text}](#${heading.anchor})`);
    });
    tocLines.push('');

    // Insert or replace TOC
    if (tocIndex >= 0) {
      // Replace existing TOC
      const nextHeadingIndex = lines.findIndex((line, index) => 
        index > tocIndex && line.match(/^#{1,6}\s+/)
      );
      
      if (nextHeadingIndex >= 0) {
        lines.splice(tocIndex, nextHeadingIndex - tocIndex, ...tocLines);
      }
    } else {
      // Add TOC after first heading
      const firstHeadingIndex = lines.findIndex(line => line.match(/^#{1,6}\s+/));
      if (firstHeadingIndex >= 0) {
        lines.splice(firstHeadingIndex + 1, 0, '', ...tocLines);
      }
    }

    return lines.join('\n');
  }

  /**
   * Validate links in markdown
   */
  async validateLinks(content) {
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links = [];
    const warnings = [];
    let match;

    while ((match = linkPattern.exec(content)) !== null) {
      const [fullMatch, text, url] = match;
      links.push({ text, url, fullMatch });
    }

    // Validate each link
    for (const link of links) {
      // Check for common issues
      if (!link.url.trim()) {
        warnings.push(`Empty URL in link: ${link.fullMatch}`);
      }
      
      if (link.url.includes(' ')) {
        warnings.push(`URL contains spaces: ${link.url}`);
      }
      
      if (!link.text.trim()) {
        warnings.push(`Empty link text: ${link.fullMatch}`);
      }

      // Check relative links
      if (link.url.startsWith('./') || link.url.startsWith('../')) {
        // In a real implementation, you might check if the file exists
        // For now, just warn about relative links
        warnings.push(`Relative link found (verify manually): ${link.url}`);
      }
    }

    return { links, warnings };
  }

  /**
   * Get supported file types
   */
  getSupportedTypes() {
    return ['.md', '.markdown', '.mdown', '.mkd'];
  }

  /**
   * Validate transformation options
   */
  validateOptions(options) {
    const errors = [];
    const validBooleanOptions = [
      'formatTables', 'optimizeImages', 'addTableOfContents', 
      'normalizeWhitespace', 'validateLinks', 'fixHeadingStructure'
    ];

    for (const [key, value] of Object.entries(options)) {
      if (validBooleanOptions.includes(key) && typeof value !== 'boolean') {
        errors.push(`Option '${key}' must be a boolean`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Hook: Pre-transformation
   */
  async onPreTransformation(data) {
    this.logger.debug('Pre-transformation hook called', {
      transformerId: data.transformerId,
      contentLength: data.content.length
    });
  }

  /**
   * Hook: Post-transformation
   */
  async onPostTransformation(data) {
    this.logger.debug('Post-transformation hook called', {
      transformerId: data.transformerId,
      originalLength: data.content.length,
      resultLength: typeof data.result === 'string' ? data.result.length : data.result.content?.length || 0
    });
  }

  /**
   * Get plugin configuration schema
   */
  getConfigSchema() {
    return {
      formatTables: {
        type: 'boolean',
        default: true,
        description: 'Format and align markdown tables'
      },
      optimizeImages: {
        type: 'boolean',
        default: true,
        description: 'Optimize image references and add alt text'
      },
      addTableOfContents: {
        type: 'boolean',
        default: true,
        description: 'Automatically generate table of contents'
      },
      normalizeWhitespace: {
        type: 'boolean',
        default: true,
        description: 'Normalize whitespace and line endings'
      },
      validateLinks: {
        type: 'boolean',
        default: true,
        description: 'Validate markdown links and warn about issues'
      },
      fixHeadingStructure: {
        type: 'boolean',
        default: true,
        description: 'Fix heading hierarchy to ensure proper structure'
      }
    };
  }

  /**
   * Get plugin usage examples
   */
  getUsageExamples() {
    return [
      {
        name: 'Basic Beautification',
        description: 'Beautify markdown with all default options',
        code: `
await pluginManager.executeTransformation('markdown-beautifier', markdownContent);
        `
      },
      {
        name: 'Custom Configuration',
        description: 'Beautify with custom options',
        code: `
const options = {
  formatTables: true,
  addTableOfContents: false,
  optimizeImages: true
};

await pluginManager.executeTransformation('markdown-beautifier', markdownContent, options);
        `
      },
      {
        name: 'Table-only Formatting',
        description: 'Only format tables, skip other transformations',
        code: `
const options = {
  formatTables: true,
  optimizeImages: false,
  addTableOfContents: false,
  normalizeWhitespace: false,
  validateLinks: false,
  fixHeadingStructure: false
};

await pluginManager.executeTransformation('markdown-beautifier', markdownContent, options);
        `
      }
    ];
  }
}