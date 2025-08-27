/**
 * Base Plugin Interface
 * Defines the standard interface for all plugins
 * 
 * @id base-plugin-interface
 * @name Base Plugin Interface
 * @version 1.0.0
 * @description Standard interface for Qoder AI plugins
 * @type utility
 */

export class BasePlugin {
  constructor(api) {
    this.api = api;
    this.logger = api.logger;
    this.initialized = false;
  }

  /**
   * Initialize the plugin
   * Called when the plugin is loaded
   */
  async initialize() {
    this.logger.debug(`Initializing plugin: ${this.constructor.name}`);
    this.initialized = true;
  }

  /**
   * Destroy the plugin
   * Called when the plugin is unloaded
   */
  async destroy() {
    this.logger.debug(`Destroying plugin: ${this.constructor.name}`);
    this.initialized = false;
  }

  /**
   * Get plugin information
   */
  getInfo() {
    return {
      name: this.constructor.name,
      initialized: this.initialized,
      type: 'base'
    };
  }
}

/**
 * Base Transformer Plugin
 * Extends BasePlugin for transformation functionality
 */
export class BaseTransformerPlugin extends BasePlugin {
  constructor(api) {
    super(api);
    this.type = 'transformer';
  }

  /**
   * Transform content
   * Must be implemented by subclasses
   * @param {string} content - Content to transform
   * @param {Object} options - Transformation options
   * @returns {string} Transformed content
   */
  async transform(content, options = {}) {
    throw new Error('Transform method must be implemented by subclass');
  }

  /**
   * Validate transformation options
   * @param {Object} options - Options to validate
   * @returns {Object} Validation result
   */
  validateOptions(options) {
    return { valid: true, errors: [] };
  }

  /**
   * Get supported file types
   * @returns {Array} Array of supported file extensions
   */
  getSupportedTypes() {
    return ['*']; // Default: all file types
  }
}

/**
 * Base Validator Plugin
 * Extends BasePlugin for validation functionality
 */
export class BaseValidatorPlugin extends BasePlugin {
  constructor(api) {
    super(api);
    this.type = 'validator';
  }

  /**
   * Validate input
   * Must be implemented by subclasses
   * @param {*} input - Input to validate
   * @param {Object} options - Validation options
   * @returns {Object} Validation result
   */
  async validate(input, options = {}) {
    throw new Error('Validate method must be implemented by subclass');
  }

  /**
   * Get validation rules
   * @returns {Array} Array of validation rules
   */
  getRules() {
    return [];
  }

  /**
   * Get validation schema
   * @returns {Object} Joi or similar validation schema
   */
  getSchema() {
    return null;
  }
}

/**
 * Base Generator Plugin
 * Extends BasePlugin for generation functionality
 */
export class BaseGeneratorPlugin extends BasePlugin {
  constructor(api) {
    super(api);
    this.type = 'generator';
  }

  /**
   * Generate content
   * Must be implemented by subclasses
   * @param {Object} inputs - Generation inputs
   * @param {Object} options - Generation options
   * @returns {Object} Generated content
   */
  async generate(inputs, options = {}) {
    throw new Error('Generate method must be implemented by subclass');
  }

  /**
   * Get supported categories
   * @returns {Array} Array of supported categories
   */
  getSupportedCategories() {
    return ['*']; // Default: all categories
  }

  /**
   * Get generation templates
   * @returns {Array} Array of available templates
   */
  getTemplates() {
    return [];
  }
}

/**
 * Plugin Utility Functions
 */
export class PluginUtils {
  static validateManifest(manifest) {
    const required = ['id', 'name', 'version', 'type'];
    const errors = [];

    for (const field of required) {
      if (!manifest[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    if (manifest.version && !/^\d+\.\d+\.\d+/.test(manifest.version)) {
      errors.push('Version must follow semantic versioning (x.y.z)');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static createManifest(options) {
    return {
      id: options.id || 'custom-plugin',
      name: options.name || 'Custom Plugin',
      version: options.version || '1.0.0',
      description: options.description || '',
      type: options.type || 'utility',
      main: options.main || 'index.js',
      author: options.author || '',
      license: options.license || 'MIT',
      keywords: options.keywords || [],
      dependencies: options.dependencies || {},
      qoderVersion: options.qoderVersion || '^1.0.0'
    };
  }

  static async validatePluginStructure(pluginDir) {
    const required = ['plugin.json', 'index.js'];
    const errors = [];

    for (const file of required) {
      const filePath = path.join(pluginDir, file);
      if (!await fs.pathExists(filePath)) {
        errors.push(`Missing required file: ${file}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

/**
 * Plugin Events
 * Standard events that plugins can listen to or emit
 */
export const PluginEvents = {
  // System events
  SYSTEM_STARTUP: 'system:startup',
  SYSTEM_SHUTDOWN: 'system:shutdown',
  
  // Plugin events
  PLUGIN_LOADED: 'plugin:loaded',
  PLUGIN_UNLOADED: 'plugin:unloaded',
  PLUGIN_ERROR: 'plugin:error',
  
  // Generation events
  GENERATION_START: 'generation:start',
  GENERATION_COMPLETE: 'generation:complete',
  GENERATION_ERROR: 'generation:error',
  
  // Transformation events
  TRANSFORM_START: 'transform:start',
  TRANSFORM_COMPLETE: 'transform:complete',
  TRANSFORM_ERROR: 'transform:error',
  
  // Validation events
  VALIDATE_START: 'validate:start',
  VALIDATE_COMPLETE: 'validate:complete',
  VALIDATE_ERROR: 'validate:error'
};

/**
 * Plugin Registry
 * Keeps track of available plugin types and capabilities
 */
export class PluginRegistry {
  static transformerTypes = [
    'formatting',
    'minification',
    'optimization',
    'security',
    'documentation',
    'testing',
    'deployment'
  ];

  static validatorTypes = [
    'syntax',
    'security',
    'performance',
    'accessibility',
    'seo',
    'compliance'
  ];

  static generatorTypes = [
    'template',
    'scaffold',
    'component',
    'test',
    'documentation'
  ];

  static getAvailableTypes(category) {
    switch (category) {
      case 'transformer':
        return this.transformerTypes;
      case 'validator':
        return this.validatorTypes;
      case 'generator':
        return this.generatorTypes;
      default:
        return [];
    }
  }

  static isValidType(category, type) {
    const availableTypes = this.getAvailableTypes(category);
    return availableTypes.includes(type) || type === 'custom';
  }
}