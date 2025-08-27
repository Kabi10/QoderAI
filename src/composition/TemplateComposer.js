/**
 * Advanced Template Composition System
 * Supports template inheritance, mixins, and modular composition
 */

import { Logger } from '../utils/Logger.js';
import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';

export class TemplateComposer {
  constructor(options = {}) {
    this.logger = new Logger('TemplateComposer');
    this.options = {
      templateDir: './templates',
      compositionDir: './templates/compositions',
      enableInheritance: true,
      enableMixins: true,
      enableFragments: true,
      maxInheritanceDepth: 5,
      ...options
    };

    this.baseTemplates = new Map();
    this.mixins = new Map();
    this.fragments = new Map();
    this.compositions = new Map();
    this.inheritanceGraph = new Map();
  }

  /**
   * Initialize the composition system
   */
  async initialize() {
    try {
      this.logger.info('Initializing template composition system...');

      // Load base templates
      await this.loadBaseTemplates();
      
      // Load mixins
      await this.loadMixins();
      
      // Load fragments
      await this.loadFragments();
      
      // Load composition definitions
      await this.loadCompositions();
      
      // Build inheritance graph
      await this.buildInheritanceGraph();

      this.logger.success(`Template composition system initialized: ${this.baseTemplates.size} base templates, ${this.mixins.size} mixins, ${this.fragments.size} fragments`);

    } catch (error) {
      this.logger.error('Failed to initialize template composition system', error);
      throw error;
    }
  }

  /**
   * Load base templates
   */
  async loadBaseTemplates() {
    const baseDir = path.join(this.options.templateDir, 'base');
    
    if (await fs.pathExists(baseDir)) {
      const files = await fs.readdir(baseDir);
      
      for (const file of files) {
        if (file.endsWith('.md') || file.endsWith('.mustache')) {
          const templatePath = path.join(baseDir, file);
          const templateId = path.basename(file, path.extname(file));
          
          const template = await this.loadTemplate(templatePath, 'base');
          this.baseTemplates.set(templateId, template);
        }
      }
    }

    this.logger.debug(`Loaded ${this.baseTemplates.size} base templates`);
  }

  /**
   * Load mixins
   */
  async loadMixins() {
    const mixinDir = path.join(this.options.templateDir, 'mixins');
    
    if (await fs.pathExists(mixinDir)) {
      const files = await fs.readdir(mixinDir);
      
      for (const file of files) {
        if (file.endsWith('.md') || file.endsWith('.mustache')) {
          const mixinPath = path.join(mixinDir, file);
          const mixinId = path.basename(file, path.extname(file));
          
          const mixin = await this.loadTemplate(mixinPath, 'mixin');
          this.mixins.set(mixinId, mixin);
        }
      }
    }

    this.logger.debug(`Loaded ${this.mixins.size} mixins`);
  }

  /**
   * Load fragments
   */
  async loadFragments() {
    const fragmentDir = path.join(this.options.templateDir, 'fragments');
    
    if (await fs.pathExists(fragmentDir)) {
      const files = await fs.readdir(fragmentDir);
      
      for (const file of files) {
        if (file.endsWith('.md') || file.endsWith('.mustache')) {
          const fragmentPath = path.join(fragmentDir, file);
          const fragmentId = path.basename(file, path.extname(file));
          
          const fragment = await this.loadTemplate(fragmentPath, 'fragment');
          this.fragments.set(fragmentId, fragment);
        }
      }
    }

    this.logger.debug(`Loaded ${this.fragments.size} fragments`);
  }

  /**
   * Load composition definitions
   */
  async loadCompositions() {
    const compositionFile = path.join(this.options.compositionDir, 'compositions.yaml');
    
    if (await fs.pathExists(compositionFile)) {
      const compositionsData = yaml.load(await fs.readFile(compositionFile, 'utf8'));
      
      for (const [compositionId, config] of Object.entries(compositionsData)) {
        this.compositions.set(compositionId, config);
      }
    }

    this.logger.debug(`Loaded ${this.compositions.size} composition definitions`);
  }

  /**
   * Load individual template
   * @param {string} templatePath - Path to template file
   * @param {string} type - Template type (base, mixin, fragment)
   * @returns {Object} Template object
   */
  async loadTemplate(templatePath, type) {
    const content = await fs.readFile(templatePath, 'utf8');
    const metadata = this.parseTemplateMetadata(content);
    
    return {
      id: path.basename(templatePath, path.extname(templatePath)),
      type,
      path: templatePath,
      content: this.stripMetadata(content),
      metadata,
      lastModified: (await fs.stat(templatePath)).mtime
    };
  }

  /**
   * Parse template metadata from content
   * @param {string} content - Template content
   * @returns {Object} Parsed metadata
   */
  parseTemplateMetadata(content) {
    const metadataMatch = content.match(/^---\n([\s\S]*?)\n---/);
    
    if (metadataMatch) {
      try {
        return yaml.load(metadataMatch[1]) || {};
      } catch (error) {
        this.logger.warn('Failed to parse template metadata', error);
        return {};
      }
    }
    
    return {};
  }

  /**
   * Strip metadata from template content
   * @param {string} content - Template content
   * @returns {string} Content without metadata
   */
  stripMetadata(content) {
    return content.replace(/^---\n[\s\S]*?\n---\n/, '');
  }

  /**
   * Build inheritance graph
   */
  async buildInheritanceGraph() {
    for (const [templateId, template] of this.baseTemplates) {
      if (template.metadata.extends) {
        this.inheritanceGraph.set(templateId, template.metadata.extends);
      }
    }

    // Validate inheritance graph (no cycles)
    this.validateInheritanceGraph();
  }

  /**
   * Validate inheritance graph for cycles
   */
  validateInheritanceGraph() {
    const visited = new Set();
    const visiting = new Set();

    const hasCycle = (node) => {
      if (visiting.has(node)) return true;
      if (visited.has(node)) return false;

      visiting.add(node);
      const parent = this.inheritanceGraph.get(node);
      
      if (parent && hasCycle(parent)) {
        return true;
      }

      visiting.delete(node);
      visited.add(node);
      return false;
    };

    for (const templateId of this.inheritanceGraph.keys()) {
      if (hasCycle(templateId)) {
        throw new Error(`Circular inheritance detected in template: ${templateId}`);
      }
    }
  }

  /**
   * Compose template with inheritance and mixins
   * @param {string} templateId - Template identifier
   * @param {Object} context - Template context
   * @param {Object} options - Composition options
   * @returns {string} Composed template
   */
  async composeTemplate(templateId, context = {}, options = {}) {
    try {
      this.logger.debug(`Composing template: ${templateId}`);

      // Get composition definition or use template directly
      const composition = this.compositions.get(templateId) || { base: templateId };
      
      // Resolve inheritance chain
      const inheritanceChain = await this.resolveInheritanceChain(composition.base || templateId);
      
      // Compose from inheritance chain
      let composedContent = await this.composeFromInheritance(inheritanceChain, context);
      
      // Apply mixins
      if (composition.mixins || composition.include) {
        const mixins = composition.mixins || composition.include || [];
        composedContent = await this.applyMixins(composedContent, mixins, context);
      }
      
      // Insert fragments
      composedContent = await this.insertFragments(composedContent, context);
      
      // Apply composition-specific transformations
      if (composition.transformations) {
        composedContent = await this.applyTransformations(composedContent, composition.transformations, context);
      }

      this.logger.debug(`Template composition completed: ${templateId}`);
      return composedContent;

    } catch (error) {
      this.logger.error(`Failed to compose template: ${templateId}`, error);
      throw error;
    }
  }

  /**
   * Resolve inheritance chain for a template
   * @param {string} templateId - Template identifier
   * @returns {Array} Inheritance chain (parent to child)
   */
  async resolveInheritanceChain(templateId) {
    const chain = [];
    let currentId = templateId;
    let depth = 0;

    while (currentId && depth < this.options.maxInheritanceDepth) {
      const template = this.baseTemplates.get(currentId);
      
      if (!template) {
        throw new Error(`Template not found: ${currentId}`);
      }

      chain.unshift(template);
      currentId = template.metadata.extends;
      depth++;
    }

    if (depth >= this.options.maxInheritanceDepth) {
      throw new Error(`Maximum inheritance depth exceeded for template: ${templateId}`);
    }

    return chain;
  }

  /**
   * Compose content from inheritance chain
   * @param {Array} inheritanceChain - Templates in inheritance order
   * @param {Object} context - Template context
   * @returns {string} Composed content
   */
  async composeFromInheritance(inheritanceChain, context) {
    let composedContent = '';
    const blocks = new Map();

    // Process each template in the inheritance chain
    for (const template of inheritanceChain) {
      const templateBlocks = this.extractBlocks(template.content);
      
      // Merge blocks (child overrides parent)
      for (const [blockName, blockContent] of templateBlocks) {
        blocks.set(blockName, blockContent);
      }
      
      // Use the most derived template's main content
      if (template === inheritanceChain[inheritanceChain.length - 1]) {
        composedContent = template.content;
      }
    }

    // Replace block placeholders with actual blocks
    composedContent = this.replaceBlocks(composedContent, blocks, context);

    return composedContent;
  }

  /**
   * Extract blocks from template content
   * @param {string} content - Template content
   * @returns {Map} Block name to content mapping
   */
  extractBlocks(content) {
    const blocks = new Map();
    const blockPattern = /\{\{#block\s+([^}]+)\}\}([\s\S]*?)\{\{\/block\}\}/g;
    
    let match;
    while ((match = blockPattern.exec(content)) !== null) {
      const blockName = match[1].trim();
      const blockContent = match[2];
      blocks.set(blockName, blockContent);
    }

    return blocks;
  }

  /**
   * Replace block placeholders with actual content
   * @param {string} content - Template content
   * @param {Map} blocks - Available blocks
   * @param {Object} context - Template context
   * @returns {string} Content with blocks replaced
   */
  replaceBlocks(content, blocks, context) {
    return content.replace(/\{\{>\s*([^}]+)\}\}/g, (match, blockName) => {
      const trimmedBlockName = blockName.trim();
      return blocks.get(trimmedBlockName) || match;
    });
  }

  /**
   * Apply mixins to content
   * @param {string} content - Base content
   * @param {Array} mixinIds - Mixin identifiers
   * @param {Object} context - Template context
   * @returns {string} Content with mixins applied
   */
  async applyMixins(content, mixinIds, context) {
    let enhancedContent = content;

    for (const mixinId of mixinIds) {
      const mixin = this.mixins.get(mixinId);
      
      if (!mixin) {
        this.logger.warn(`Mixin not found: ${mixinId}`);
        continue;
      }

      // Apply mixin based on its metadata
      if (mixin.metadata.insertAt) {
        enhancedContent = this.insertMixinAt(enhancedContent, mixin, mixin.metadata.insertAt);
      } else if (mixin.metadata.replacePattern) {
        enhancedContent = this.replaceMixinPattern(enhancedContent, mixin, mixin.metadata.replacePattern);
      } else {
        // Default: append to end
        enhancedContent += '\n\n' + mixin.content;
      }
    }

    return enhancedContent;
  }

  /**
   * Insert mixin at specific location
   * @param {string} content - Base content
   * @param {Object} mixin - Mixin object
   * @param {string} insertAt - Insertion point
   * @returns {string} Content with mixin inserted
   */
  insertMixinAt(content, mixin, insertAt) {
    const insertPattern = new RegExp(insertAt);
    const match = content.match(insertPattern);

    if (match) {
      const insertIndex = match.index + match[0].length;
      return content.slice(0, insertIndex) + '\n\n' + mixin.content + '\n' + content.slice(insertIndex);
    }

    return content + '\n\n' + mixin.content;
  }

  /**
   * Replace pattern with mixin content
   * @param {string} content - Base content
   * @param {Object} mixin - Mixin object
   * @param {string} replacePattern - Pattern to replace
   * @returns {string} Content with pattern replaced
   */
  replaceMixinPattern(content, mixin, replacePattern) {
    const pattern = new RegExp(replacePattern, 'g');
    return content.replace(pattern, mixin.content);
  }

  /**
   * Insert fragments into content
   * @param {string} content - Template content
   * @param {Object} context - Template context
   * @returns {string} Content with fragments inserted
   */
  async insertFragments(content, context) {
    return content.replace(/\{\{fragment\s+([^}]+)\}\}/g, (match, fragmentId) => {
      const trimmedFragmentId = fragmentId.trim();
      const fragment = this.fragments.get(trimmedFragmentId);
      
      if (!fragment) {
        this.logger.warn(`Fragment not found: ${trimmedFragmentId}`);
        return match;
      }

      return fragment.content;
    });
  }

  /**
   * Apply composition-specific transformations
   * @param {string} content - Template content
   * @param {Array} transformations - Transformation definitions
   * @param {Object} context - Template context
   * @returns {string} Transformed content
   */
  async applyTransformations(content, transformations, context) {
    let transformedContent = content;

    for (const transformation of transformations) {
      switch (transformation.type) {
        case 'replace':
          transformedContent = transformedContent.replace(
            new RegExp(transformation.pattern, transformation.flags || 'g'),
            transformation.replacement
          );
          break;

        case 'insert':
          if (transformation.at === 'beginning') {
            transformedContent = transformation.content + '\n\n' + transformedContent;
          } else if (transformation.at === 'end') {
            transformedContent = transformedContent + '\n\n' + transformation.content;
          }
          break;

        case 'conditional':
          if (this.evaluateCondition(transformation.condition, context)) {
            transformedContent = await this.applyTransformations(
              transformedContent, 
              transformation.transformations, 
              context
            );
          }
          break;

        default:
          this.logger.warn(`Unknown transformation type: ${transformation.type}`);
      }
    }

    return transformedContent;
  }

  /**
   * Evaluate condition for conditional transformations
   * @param {string|Object} condition - Condition to evaluate
   * @param {Object} context - Template context
   * @returns {boolean} Condition result
   */
  evaluateCondition(condition, context) {
    if (typeof condition === 'string') {
      // Simple property check
      return this.getNestedProperty(context, condition);
    }

    if (typeof condition === 'object') {
      // Complex condition object
      if (condition.property && condition.value) {
        const propValue = this.getNestedProperty(context, condition.property);
        
        switch (condition.operator || 'equals') {
          case 'equals':
            return propValue === condition.value;
          case 'contains':
            return Array.isArray(propValue) && propValue.includes(condition.value);
          case 'exists':
            return propValue !== undefined && propValue !== null;
          default:
            return false;
        }
      }
    }

    return false;
  }

  /**
   * Get nested property from object
   * @param {Object} obj - Object to search
   * @param {string} path - Property path
   * @returns {*} Property value
   */
  getNestedProperty(obj, path) {
    return path.split('.').reduce((current, prop) => {
      return current && current[prop] !== undefined ? current[prop] : undefined;
    }, obj);
  }

  /**
   * Create a new composition
   * @param {string} compositionId - Composition identifier
   * @param {Object} config - Composition configuration
   */
  async createComposition(compositionId, config) {
    this.compositions.set(compositionId, config);
    
    // Save to file
    await this.saveCompositions();
    
    this.logger.info(`Created composition: ${compositionId}`);
  }

  /**
   * Save compositions to file
   */
  async saveCompositions() {
    const compositionFile = path.join(this.options.compositionDir, 'compositions.yaml');
    const compositionsObj = Object.fromEntries(this.compositions);
    
    await fs.ensureDir(this.options.compositionDir);
    await fs.writeFile(compositionFile, yaml.dump(compositionsObj));
  }

  /**
   * Get composition metadata
   * @param {string} compositionId - Composition identifier
   * @returns {Object} Composition metadata
   */
  getCompositionMetadata(compositionId) {
    const composition = this.compositions.get(compositionId);
    
    if (!composition) {
      return null;
    }

    const baseTemplate = this.baseTemplates.get(composition.base);
    const inheritanceChain = this.resolveInheritanceChain(composition.base);
    
    return {
      id: compositionId,
      base: composition.base,
      mixins: composition.mixins || [],
      fragments: this.getReferencedFragments(composition),
      inheritanceDepth: inheritanceChain.length,
      lastModified: baseTemplate?.lastModified
    };
  }

  /**
   * Get referenced fragments in composition
   * @param {Object} composition - Composition object
   * @returns {Array} Referenced fragment IDs
   */
  getReferencedFragments(composition) {
    // This would analyze the composition content to find fragment references
    // For now, return empty array
    return [];
  }

  /**
   * List available compositions
   * @returns {Array} Available compositions
   */
  listCompositions() {
    return Array.from(this.compositions.keys()).map(id => ({
      id,
      metadata: this.getCompositionMetadata(id)
    }));
  }

  /**
   * Validate composition configuration
   * @param {Object} config - Composition configuration
   * @returns {Object} Validation result
   */
  validateComposition(config) {
    const errors = [];
    const warnings = [];

    if (!config.base) {
      errors.push('Base template is required');
    } else if (!this.baseTemplates.has(config.base)) {
      errors.push(`Base template not found: ${config.base}`);
    }

    if (config.mixins) {
      for (const mixinId of config.mixins) {
        if (!this.mixins.has(mixinId)) {
          warnings.push(`Mixin not found: ${mixinId}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}