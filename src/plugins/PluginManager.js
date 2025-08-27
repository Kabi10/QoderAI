/**
 * Plugin System Manager
 * Manages loading, registration, and execution of custom transformers and validators
 */

import { Logger } from '../utils/Logger.js';
import fs from 'fs-extra';
import path from 'path';
import { createRequire } from 'module';
import { pathToFileURL } from 'url';

export class PluginManager {
  constructor(options = {}) {
    this.logger = new Logger('PluginManager');
    this.options = {
      pluginDir: './plugins',
      enableAutoDiscovery: true,
      enableHotReload: false,
      maxPlugins: 50,
      allowedPluginTypes: ['transformer', 'validator', 'generator', 'utility'],
      securityMode: 'sandbox',
      ...options
    };

    this.plugins = new Map();
    this.transformers = new Map();
    this.validators = new Map();
    this.generators = new Map();
    this.utilities = new Map();
    this.hooks = new Map();
    this.pluginMetadata = new Map();
    
    // Plugin execution context
    this.executionContext = {
      api: this.createPluginAPI(),
      sandbox: null
    };
  }

  /**
   * Initialize the plugin system
   */
  async initialize() {
    try {
      this.logger.info('Initializing plugin system...');

      // Ensure plugin directory exists
      await fs.ensureDir(this.options.pluginDir);

      // Load built-in plugins first
      await this.loadBuiltInPlugins();

      // Auto-discover and load external plugins
      if (this.options.enableAutoDiscovery) {
        await this.discoverAndLoadPlugins();
      }

      // Set up hot reload if enabled
      if (this.options.enableHotReload) {
        await this.setupHotReload();
      }

      this.logger.success(`Plugin system initialized: ${this.plugins.size} plugins loaded`);

    } catch (error) {
      this.logger.error('Failed to initialize plugin system', error);
      throw error;
    }
  }

  /**
   * Load built-in plugins
   */
  async loadBuiltInPlugins() {
    const builtInPlugins = [
      {
        id: 'core-formatting-transformer',
        type: 'transformer',
        name: 'Core Formatting Transformer',
        version: '1.0.0',
        description: 'Built-in code formatting transformer',
        main: '../transformers/formattingTransformer.js'
      },
      {
        id: 'core-validation-engine',
        type: 'validator',
        name: 'Core Validation Engine',
        version: '1.0.0',
        description: 'Built-in validation engine',
        main: '../validation/ValidationEngine.js'
      }
    ];

    for (const plugin of builtInPlugins) {
      try {
        await this.loadPlugin(plugin, true);
      } catch (error) {
        this.logger.warn(`Failed to load built-in plugin: ${plugin.id}`, error);
      }
    }
  }

  /**
   * Discover and load external plugins
   */
  async discoverAndLoadPlugins() {
    const pluginDirs = await this.discoverPluginDirectories();
    
    for (const pluginDir of pluginDirs) {
      try {
        const manifest = await this.loadPluginManifest(pluginDir);
        
        if (manifest) {
          await this.loadPlugin(manifest, false, pluginDir);
        }
      } catch (error) {
        this.logger.warn(`Failed to load plugin from ${pluginDir}`, error);
      }
    }
  }

  /**
   * Discover plugin directories
   */
  async discoverPluginDirectories() {
    const pluginDirs = [];
    
    try {
      const entries = await fs.readdir(this.options.pluginDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const pluginPath = path.join(this.options.pluginDir, entry.name);
          const manifestPath = path.join(pluginPath, 'plugin.json');
          
          if (await fs.pathExists(manifestPath)) {
            pluginDirs.push(pluginPath);
          }
        }
      }
      
      // Also look for single-file plugins
      const files = entries.filter(entry => entry.isFile() && entry.name.endsWith('.js'));
      for (const file of files) {
        pluginDirs.push(path.join(this.options.pluginDir, file.name));
      }
      
    } catch (error) {
      this.logger.debug('Plugin directory not found or empty');
    }
    
    return pluginDirs;
  }

  /**
   * Load plugin manifest
   */
  async loadPluginManifest(pluginPath) {
    const manifestPath = path.isDirectory(pluginPath) 
      ? path.join(pluginPath, 'plugin.json')
      : pluginPath.replace('.js', '.json');
    
    if (await fs.pathExists(manifestPath)) {
      return await fs.readJson(manifestPath);
    }
    
    // For single-file plugins, try to extract metadata from comments
    if (pluginPath.endsWith('.js')) {
      return await this.extractMetadataFromFile(pluginPath);
    }
    
    return null;
  }

  /**
   * Extract metadata from plugin file comments
   */
  async extractMetadataFromFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const metadataMatch = content.match(/\/\*\*\s*\n([\s\S]*?)\*\//);
      
      if (metadataMatch) {
        const metadata = {};
        const lines = metadataMatch[1].split('\n');
        
        for (const line of lines) {
          const match = line.match(/\*\s*@(\w+)\s+(.+)/);
          if (match) {
            const [, key, value] = match;
            metadata[key] = value.trim();
          }
        }
        
        return {
          id: metadata.id || path.basename(filePath, '.js'),
          name: metadata.name || metadata.id,
          version: metadata.version || '1.0.0',
          description: metadata.description || '',
          type: metadata.type || 'utility',
          main: filePath
        };
      }
    } catch (error) {
      this.logger.debug(`Failed to extract metadata from ${filePath}`, error);
    }
    
    return null;
  }

  /**
   * Load a single plugin
   */
  async loadPlugin(manifest, isBuiltIn = false, pluginDir = null) {
    try {
      // Validate plugin manifest
      const validation = this.validatePluginManifest(manifest);
      if (!validation.valid) {
        throw new Error(`Invalid plugin manifest: ${validation.errors.join(', ')}`);
      }

      // Check if plugin already loaded
      if (this.plugins.has(manifest.id)) {
        this.logger.warn(`Plugin already loaded: ${manifest.id}`);
        return;
      }

      // Check plugin limit
      if (this.plugins.size >= this.options.maxPlugins) {
        throw new Error('Maximum number of plugins reached');
      }

      // Resolve plugin main file
      const mainFile = isBuiltIn 
        ? manifest.main
        : pluginDir 
          ? path.join(pluginDir, manifest.main || 'index.js')
          : manifest.main;

      // Load plugin module
      const pluginModule = await this.loadPluginModule(mainFile);

      // Create plugin instance
      const pluginInstance = await this.createPluginInstance(pluginModule, manifest);

      // Register plugin
      this.plugins.set(manifest.id, {
        manifest,
        instance: pluginInstance,
        isBuiltIn,
        loadedAt: new Date(),
        directory: pluginDir
      });

      // Register by type
      await this.registerPluginByType(manifest, pluginInstance);

      // Store metadata
      this.pluginMetadata.set(manifest.id, {
        ...manifest,
        isBuiltIn,
        loadedAt: new Date(),
        status: 'active'
      });

      this.logger.info(`Plugin loaded: ${manifest.name} (${manifest.type})`);

    } catch (error) {
      this.logger.error(`Failed to load plugin: ${manifest.id}`, error);
      throw error;
    }
  }

  /**
   * Load plugin module
   */
  async loadPluginModule(mainFile) {
    try {
      if (path.isAbsolute(mainFile) || mainFile.startsWith('.')) {
        // Local file - use dynamic import
        const fileUrl = pathToFileURL(path.resolve(mainFile));
        return await import(fileUrl.href);
      } else {
        // npm package - use createRequire for compatibility
        const require = createRequire(import.meta.url);
        return require(mainFile);
      }
    } catch (error) {
      throw new Error(`Failed to load plugin module: ${error.message}`);
    }
  }

  /**
   * Create plugin instance
   */
  async createPluginInstance(pluginModule, manifest) {
    const PluginClass = pluginModule.default || pluginModule[manifest.name] || pluginModule;
    
    if (typeof PluginClass === 'function') {
      // Class-based plugin
      return new PluginClass(this.executionContext.api);
    } else if (typeof PluginClass === 'object') {
      // Object-based plugin
      return PluginClass;
    } else {
      throw new Error('Plugin must export a class or object');
    }
  }

  /**
   * Register plugin by type
   */
  async registerPluginByType(manifest, instance) {
    switch (manifest.type) {
      case 'transformer':
        this.transformers.set(manifest.id, instance);
        break;
      case 'validator':
        this.validators.set(manifest.id, instance);
        break;
      case 'generator':
        this.generators.set(manifest.id, instance);
        break;
      case 'utility':
        this.utilities.set(manifest.id, instance);
        break;
      default:
        this.logger.warn(`Unknown plugin type: ${manifest.type}`);
    }

    // Call plugin initialization if available
    if (typeof instance.initialize === 'function') {
      await instance.initialize();
    }
  }

  /**
   * Validate plugin manifest
   */
  validatePluginManifest(manifest) {
    const errors = [];

    if (!manifest.id) errors.push('Plugin ID is required');
    if (!manifest.name) errors.push('Plugin name is required');
    if (!manifest.version) errors.push('Plugin version is required');
    if (!manifest.type) errors.push('Plugin type is required');
    
    if (manifest.type && !this.options.allowedPluginTypes.includes(manifest.type)) {
      errors.push(`Plugin type '${manifest.type}' is not allowed`);
    }

    // Validate version format
    if (manifest.version && !/^\d+\.\d+\.\d+/.test(manifest.version)) {
      errors.push('Plugin version must follow semantic versioning (x.y.z)');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Create plugin API for plugins to use
   */
  createPluginAPI() {
    return {
      logger: this.logger,
      
      // Core utilities
      utils: {
        fs: fs,
        path: path,
        formatBytes: this.formatBytes.bind(this),
        generateId: this.generateId.bind(this)
      },

      // Plugin registration
      registerHook: this.registerHook.bind(this),
      executeHook: this.executeHook.bind(this),

      // Plugin communication
      getPlugin: this.getPlugin.bind(this),
      callPlugin: this.callPlugin.bind(this),

      // System information
      getSystemInfo: this.getSystemInfo.bind(this),
      getMetrics: this.getMetrics.bind(this)
    };
  }

  /**
   * Execute transformation using plugins
   */
  async executeTransformation(transformerId, content, options = {}) {
    const transformer = this.transformers.get(transformerId);
    
    if (!transformer) {
      throw new Error(`Transformer not found: ${transformerId}`);
    }

    try {
      // Execute pre-transformation hooks
      await this.executeHook('pre-transformation', { transformerId, content, options });

      // Execute transformation
      let result;
      if (typeof transformer.transform === 'function') {
        result = await transformer.transform(content, options);
      } else if (typeof transformer === 'function') {
        result = await transformer(content, options);
      } else {
        throw new Error('Transformer must implement transform method or be a function');
      }

      // Execute post-transformation hooks
      await this.executeHook('post-transformation', { transformerId, content, result, options });

      return result;

    } catch (error) {
      this.logger.error(`Transformation failed: ${transformerId}`, error);
      throw error;
    }
  }

  /**
   * Execute validation using plugins
   */
  async executeValidation(validatorId, input, options = {}) {
    const validator = this.validators.get(validatorId);
    
    if (!validator) {
      throw new Error(`Validator not found: ${validatorId}`);
    }

    try {
      // Execute pre-validation hooks
      await this.executeHook('pre-validation', { validatorId, input, options });

      // Execute validation
      let result;
      if (typeof validator.validate === 'function') {
        result = await validator.validate(input, options);
      } else if (typeof validator === 'function') {
        result = await validator(input, options);
      } else {
        throw new Error('Validator must implement validate method or be a function');
      }

      // Execute post-validation hooks
      await this.executeHook('post-validation', { validatorId, input, result, options });

      return result;

    } catch (error) {
      this.logger.error(`Validation failed: ${validatorId}`, error);
      throw error;
    }
  }

  /**
   * Register hook for plugin communication
   */
  registerHook(hookName, callback) {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, []);
    }
    
    this.hooks.get(hookName).push(callback);
  }

  /**
   * Execute hooks
   */
  async executeHook(hookName, data = {}) {
    const hooks = this.hooks.get(hookName);
    
    if (!hooks || hooks.length === 0) {
      return;
    }

    for (const hook of hooks) {
      try {
        await hook(data);
      } catch (error) {
        this.logger.warn(`Hook execution failed: ${hookName}`, error);
      }
    }
  }

  /**
   * Get plugin instance
   */
  getPlugin(pluginId) {
    const plugin = this.plugins.get(pluginId);
    return plugin?.instance || null;
  }

  /**
   * Call plugin method
   */
  async callPlugin(pluginId, methodName, ...args) {
    const plugin = this.getPlugin(pluginId);
    
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginId}`);
    }

    if (typeof plugin[methodName] !== 'function') {
      throw new Error(`Method not found: ${methodName} in plugin ${pluginId}`);
    }

    return await plugin[methodName](...args);
  }

  /**
   * List available plugins
   */
  listPlugins(type = null) {
    let plugins = Array.from(this.pluginMetadata.values());
    
    if (type) {
      plugins = plugins.filter(p => p.type === type);
    }

    return plugins.map(p => ({
      id: p.id,
      name: p.name,
      type: p.type,
      version: p.version,
      description: p.description,
      isBuiltIn: p.isBuiltIn,
      status: p.status
    }));
  }

  /**
   * Get plugin details
   */
  getPluginDetails(pluginId) {
    const metadata = this.pluginMetadata.get(pluginId);
    const plugin = this.plugins.get(pluginId);
    
    if (!metadata || !plugin) {
      return null;
    }

    return {
      ...metadata,
      loadedAt: plugin.loadedAt,
      directory: plugin.directory,
      hasInitialize: typeof plugin.instance.initialize === 'function',
      hasDestroy: typeof plugin.instance.destroy === 'function',
      methods: this.getPluginMethods(plugin.instance)
    };
  }

  /**
   * Get plugin methods
   */
  getPluginMethods(instance) {
    const methods = [];
    const proto = Object.getPrototypeOf(instance);
    
    // Get instance methods
    Object.getOwnPropertyNames(proto).forEach(name => {
      if (name !== 'constructor' && typeof instance[name] === 'function') {
        methods.push(name);
      }
    });

    // Get direct properties that are functions
    Object.getOwnPropertyNames(instance).forEach(name => {
      if (typeof instance[name] === 'function') {
        methods.push(name);
      }
    });

    return [...new Set(methods)];
  }

  /**
   * Unload plugin
   */
  async unloadPlugin(pluginId) {
    const plugin = this.plugins.get(pluginId);
    
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginId}`);
    }

    if (plugin.isBuiltIn) {
      throw new Error('Cannot unload built-in plugins');
    }

    try {
      // Call plugin destroy if available
      if (typeof plugin.instance.destroy === 'function') {
        await plugin.instance.destroy();
      }

      // Remove from collections
      this.plugins.delete(pluginId);
      this.pluginMetadata.delete(pluginId);
      
      // Remove from type-specific collections
      this.transformers.delete(pluginId);
      this.validators.delete(pluginId);
      this.generators.delete(pluginId);
      this.utilities.delete(pluginId);

      this.logger.info(`Plugin unloaded: ${pluginId}`);

    } catch (error) {
      this.logger.error(`Failed to unload plugin: ${pluginId}`, error);
      throw error;
    }
  }

  /**
   * Reload plugin
   */
  async reloadPlugin(pluginId) {
    const plugin = this.plugins.get(pluginId);
    
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginId}`);
    }

    if (plugin.isBuiltIn) {
      throw new Error('Cannot reload built-in plugins');
    }

    // Unload first
    await this.unloadPlugin(pluginId);

    // Reload manifest and plugin
    const manifest = await this.loadPluginManifest(plugin.directory);
    if (manifest) {
      await this.loadPlugin(manifest, false, plugin.directory);
    }
  }

  /**
   * Get system information for plugins
   */
  getSystemInfo() {
    return {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      pluginCount: this.plugins.size
    };
  }

  /**
   * Get plugin system metrics
   */
  getMetrics() {
    return {
      totalPlugins: this.plugins.size,
      transformers: this.transformers.size,
      validators: this.validators.size,
      generators: this.generators.size,
      utilities: this.utilities.size,
      hooks: this.hooks.size,
      builtInPlugins: Array.from(this.plugins.values()).filter(p => p.isBuiltIn).length
    };
  }

  /**
   * Setup hot reload
   */
  async setupHotReload() {
    if (!fs.watch) {
      this.logger.warn('File watching not supported on this platform');
      return;
    }

    try {
      const watcher = fs.watch(this.options.pluginDir, { recursive: true });
      
      watcher.on('change', async (eventType, filename) => {
        if (filename && (filename.endsWith('.js') || filename.endsWith('.json'))) {
          this.logger.debug(`Plugin file changed: ${filename}`);
          
          // Find affected plugin and reload
          for (const [pluginId, plugin] of this.plugins) {
            if (!plugin.isBuiltIn && plugin.directory && filename.includes(path.basename(plugin.directory))) {
              try {
                await this.reloadPlugin(pluginId);
                this.logger.info(`Plugin hot-reloaded: ${pluginId}`);
              } catch (error) {
                this.logger.error(`Hot reload failed for plugin: ${pluginId}`, error);
              }
              break;
            }
          }
        }
      });

      this.logger.info('Hot reload enabled for plugins');

    } catch (error) {
      this.logger.warn('Failed to setup hot reload', error);
    }
  }

  /**
   * Utility methods
   */
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * Shutdown plugin system
   */
  async shutdown() {
    this.logger.info('Shutting down plugin system...');

    // Destroy all plugins
    for (const [pluginId, plugin] of this.plugins) {
      try {
        if (typeof plugin.instance.destroy === 'function') {
          await plugin.instance.destroy();
        }
      } catch (error) {
        this.logger.warn(`Failed to destroy plugin: ${pluginId}`, error);
      }
    }

    // Clear all collections
    this.plugins.clear();
    this.transformers.clear();
    this.validators.clear();
    this.generators.clear();
    this.utilities.clear();
    this.hooks.clear();
    this.pluginMetadata.clear();

    this.logger.success('Plugin system shutdown completed');
  }
}