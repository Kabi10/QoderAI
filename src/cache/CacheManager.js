/**
 * Advanced Caching System
 * Intelligent caching for templates, validation results, and generation artifacts
 */

import { Logger } from '../utils/Logger.js';
import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';

export class CacheManager {
  constructor(options = {}) {
    this.logger = new Logger('CacheManager');
    this.options = {
      enabled: true,
      maxSize: 100 * 1024 * 1024, // 100MB default
      ttl: 30 * 60 * 1000, // 30 minutes default
      cleanupInterval: 5 * 60 * 1000, // 5 minutes
      persistToDisk: true,
      cacheDir: './cache',
      ...options
    };

    // In-memory caches
    this.templateCache = new Map();
    this.validationCache = new Map();
    this.renderCache = new Map();
    this.metadataCache = new Map();

    // Cache statistics
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      diskReads: 0,
      diskWrites: 0,
      totalSize: 0
    };

    // Initialize cleanup interval
    if (this.options.enabled) {
      this.startCleanupTimer();
      this.loadFromDisk();
    }
  }

  /**
   * Generate cache key from input data
   * @param {string} prefix - Cache prefix
   * @param {Object} data - Data to hash
   * @returns {string} Cache key
   */
  generateKey(prefix, data) {
    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
    return `${prefix}:${hash.substring(0, 16)}`;
  }

  /**
   * Get item from cache
   * @param {string} key - Cache key
   * @param {string} type - Cache type
   * @returns {Object|null} Cached item or null
   */
  async get(key, type = 'template') {
    if (!this.options.enabled) return null;

    const cache = this.getCache(type);
    const item = cache.get(key);

    if (item) {
      // Check TTL
      if (Date.now() - item.timestamp > this.options.ttl) {
        cache.delete(key);
        this.stats.evictions++;
        this.logger.debug(`Cache item expired: ${key}`);
        return null;
      }

      this.stats.hits++;
      this.logger.debug(`Cache hit: ${key} (${type})`);
      return item.data;
    }

    // Try loading from disk
    if (this.options.persistToDisk) {
      const diskItem = await this.loadFromDiskCache(key, type);
      if (diskItem) {
        // Store in memory for faster access
        cache.set(key, diskItem);
        this.stats.hits++;
        this.stats.diskReads++;
        this.logger.debug(`Cache hit from disk: ${key} (${type})`);
        return diskItem.data;
      }
    }

    this.stats.misses++;
    this.logger.debug(`Cache miss: ${key} (${type})`);
    return null;
  }

  /**
   * Store item in cache
   * @param {string} key - Cache key
   * @param {Object} data - Data to cache
   * @param {string} type - Cache type
   * @param {Object} metadata - Additional metadata
   */
  async set(key, data, type = 'template', metadata = {}) {
    if (!this.options.enabled) return;

    const cache = this.getCache(type);
    const item = {
      data,
      timestamp: Date.now(),
      metadata: {
        size: this.estimateSize(data),
        type,
        ...metadata
      }
    };

    // Store in memory
    cache.set(key, item);
    this.stats.totalSize += item.metadata.size;

    // Check cache size limits
    await this.enforceSizeLimit();

    // Persist to disk if enabled
    if (this.options.persistToDisk) {
      await this.saveToDiskCache(key, item, type);
      this.stats.diskWrites++;
    }

    this.logger.debug(`Cache set: ${key} (${type}), size: ${item.metadata.size}`);
  }

  /**
   * Cache template rendering result
   * @param {Object} templateData - Template data
   * @param {Object} context - Render context
   * @param {string} result - Rendered result
   */
  async cacheTemplateRender(templateData, context, result) {
    const key = this.generateKey('render', { templateData, context });
    await this.set(key, result, 'render', {
      templateId: templateData.id,
      contextHash: this.generateKey('ctx', context)
    });
  }

  /**
   * Get cached template render result
   * @param {Object} templateData - Template data
   * @param {Object} context - Render context
   * @returns {string|null} Cached result or null
   */
  async getCachedTemplateRender(templateData, context) {
    const key = this.generateKey('render', { templateData, context });
    return await this.get(key, 'render');
  }

  /**
   * Cache validation result
   * @param {Object} input - Input data
   * @param {Object} result - Validation result
   */
  async cacheValidationResult(input, result) {
    const key = this.generateKey('validation', input);
    await this.set(key, result, 'validation', {
      inputType: typeof input,
      resultValid: result.valid
    });
  }

  /**
   * Get cached validation result
   * @param {Object} input - Input data
   * @returns {Object|null} Cached validation result or null
   */
  async getCachedValidationResult(input) {
    const key = this.generateKey('validation', input);
    return await this.get(key, 'validation');
  }

  /**
   * Cache template metadata
   * @param {string} templatePath - Template file path
   * @param {Object} metadata - Template metadata
   */
  async cacheTemplateMetadata(templatePath, metadata) {
    const key = this.generateKey('template', { path: templatePath });
    await this.set(key, metadata, 'template', {
      templatePath,
      lastModified: metadata.lastModified
    });
  }

  /**
   * Get cached template metadata
   * @param {string} templatePath - Template file path
   * @returns {Object|null} Cached metadata or null
   */
  async getCachedTemplateMetadata(templatePath) {
    const key = this.generateKey('template', { path: templatePath });
    const cached = await this.get(key, 'template');
    
    if (cached) {
      // Verify file hasn't changed
      try {
        const stats = await fs.stat(templatePath);
        if (stats.mtime.getTime() !== cached.lastModified) {
          // File changed, invalidate cache
          await this.invalidate(key, 'template');
          return null;
        }
      } catch (error) {
        // File doesn't exist, invalidate cache
        await this.invalidate(key, 'template');
        return null;
      }
    }
    
    return cached;
  }

  /**
   * Invalidate cache entry
   * @param {string} key - Cache key
   * @param {string} type - Cache type
   */
  async invalidate(key, type = 'template') {
    const cache = this.getCache(type);
    const item = cache.get(key);
    
    if (item) {
      cache.delete(key);
      this.stats.totalSize -= item.metadata.size;
      this.stats.evictions++;
      
      // Remove from disk cache
      if (this.options.persistToDisk) {
        await this.removeFromDiskCache(key, type);
      }
      
      this.logger.debug(`Cache invalidated: ${key} (${type})`);
    }
  }

  /**
   * Invalidate all cache entries of a specific type
   * @param {string} type - Cache type
   */
  async invalidateType(type) {
    const cache = this.getCache(type);
    const keys = Array.from(cache.keys());
    
    for (const key of keys) {
      await this.invalidate(key, type);
    }
    
    this.logger.info(`All ${type} cache entries invalidated`);
  }

  /**
   * Clear all caches
   */
  async clear() {
    this.templateCache.clear();
    this.validationCache.clear();
    this.renderCache.clear();
    this.metadataCache.clear();
    
    this.stats.totalSize = 0;
    this.stats.evictions += this.stats.hits; // Count clears as evictions
    
    if (this.options.persistToDisk) {
      await this.clearDiskCache();
    }
    
    this.logger.info('All caches cleared');
  }

  /**
   * Get appropriate cache for type
   * @param {string} type - Cache type
   * @returns {Map} Cache instance
   */
  getCache(type) {
    switch (type) {
      case 'template': return this.templateCache;
      case 'validation': return this.validationCache;
      case 'render': return this.renderCache;
      case 'metadata': return this.metadataCache;
      default: return this.templateCache;
    }
  }

  /**
   * Estimate data size in bytes
   * @param {Object} data - Data to estimate
   * @returns {number} Estimated size in bytes
   */
  estimateSize(data) {
    if (typeof data === 'string') {
      return Buffer.byteLength(data, 'utf8');
    }
    
    try {
      return Buffer.byteLength(JSON.stringify(data), 'utf8');
    } catch (error) {
      // Fallback estimation
      return 1024; // 1KB default
    }
  }

  /**
   * Enforce cache size limits
   */
  async enforceSizeLimit() {
    if (this.stats.totalSize <= this.options.maxSize) return;

    this.logger.debug('Cache size limit exceeded, starting eviction');
    
    // Collect all items with timestamps
    const allItems = [];
    
    ['template', 'validation', 'render', 'metadata'].forEach(type => {
      const cache = this.getCache(type);
      cache.forEach((item, key) => {
        allItems.push({ key, item, type, cache });
      });
    });

    // Sort by timestamp (oldest first)
    allItems.sort((a, b) => a.item.timestamp - b.item.timestamp);

    // Remove oldest items until we're under the limit
    for (const { key, item, type, cache } of allItems) {
      if (this.stats.totalSize <= this.options.maxSize * 0.9) break; // Leave some headroom
      
      cache.delete(key);
      this.stats.totalSize -= item.metadata.size;
      this.stats.evictions++;
      
      // Remove from disk
      if (this.options.persistToDisk) {
        await this.removeFromDiskCache(key, type);
      }
    }

    this.logger.debug(`Cache eviction completed, new size: ${this.stats.totalSize}`);
  }

  /**
   * Load cache from disk
   */
  async loadFromDisk() {
    if (!this.options.persistToDisk) return;

    try {
      await fs.ensureDir(this.options.cacheDir);
      
      const types = ['template', 'validation', 'render', 'metadata'];
      
      for (const type of types) {
        const typeDir = path.join(this.options.cacheDir, type);
        
        if (await fs.pathExists(typeDir)) {
          const files = await fs.readdir(typeDir);
          
          for (const file of files) {
            if (file.endsWith('.json')) {
              const key = file.replace('.json', '');
              await this.loadFromDiskCache(key, type);
            }
          }
        }
      }
      
      this.logger.info('Cache loaded from disk');
      
    } catch (error) {
      this.logger.warn('Failed to load cache from disk', error);
    }
  }

  /**
   * Load specific item from disk cache
   * @param {string} key - Cache key
   * @param {string} type - Cache type
   * @returns {Object|null} Cache item or null
   */
  async loadFromDiskCache(key, type) {
    try {
      const filePath = path.join(this.options.cacheDir, type, `${key}.json`);
      
      if (await fs.pathExists(filePath)) {
        const item = await fs.readJson(filePath);
        
        // Check TTL
        if (Date.now() - item.timestamp <= this.options.ttl) {
          return item;
        } else {
          // Remove expired file
          await fs.remove(filePath);
        }
      }
    } catch (error) {
      this.logger.debug(`Failed to load cache item from disk: ${key}`, error);
    }
    
    return null;
  }

  /**
   * Save item to disk cache
   * @param {string} key - Cache key
   * @param {Object} item - Cache item
   * @param {string} type - Cache type
   */
  async saveToDiskCache(key, item, type) {
    try {
      const typeDir = path.join(this.options.cacheDir, type);
      await fs.ensureDir(typeDir);
      
      const filePath = path.join(typeDir, `${key}.json`);
      await fs.writeJson(filePath, item);
      
    } catch (error) {
      this.logger.debug(`Failed to save cache item to disk: ${key}`, error);
    }
  }

  /**
   * Remove item from disk cache
   * @param {string} key - Cache key
   * @param {string} type - Cache type
   */
  async removeFromDiskCache(key, type) {
    try {
      const filePath = path.join(this.options.cacheDir, type, `${key}.json`);
      await fs.remove(filePath);
    } catch (error) {
      this.logger.debug(`Failed to remove cache item from disk: ${key}`, error);
    }
  }

  /**
   * Clear disk cache
   */
  async clearDiskCache() {
    try {
      await fs.remove(this.options.cacheDir);
      await fs.ensureDir(this.options.cacheDir);
    } catch (error) {
      this.logger.warn('Failed to clear disk cache', error);
    }
  }

  /**
   * Start cleanup timer
   */
  startCleanupTimer() {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.options.cleanupInterval);
    
    this.logger.debug('Cache cleanup timer started');
  }

  /**
   * Stop cleanup timer
   */
  stopCleanupTimer() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
      this.logger.debug('Cache cleanup timer stopped');
    }
  }

  /**
   * Cleanup expired cache entries
   */
  async cleanup() {
    const now = Date.now();
    let cleanupCount = 0;

    const types = ['template', 'validation', 'render', 'metadata'];
    
    for (const type of types) {
      const cache = this.getCache(type);
      const keysToRemove = [];
      
      cache.forEach((item, key) => {
        if (now - item.timestamp > this.options.ttl) {
          keysToRemove.push(key);
        }
      });
      
      for (const key of keysToRemove) {
        await this.invalidate(key, type);
        cleanupCount++;
      }
    }

    if (cleanupCount > 0) {
      this.logger.debug(`Cache cleanup completed: ${cleanupCount} items removed`);
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getStatistics() {
    return {
      ...this.stats,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) * 100,
      sizes: {
        template: this.templateCache.size,
        validation: this.validationCache.size,
        render: this.renderCache.size,
        metadata: this.metadataCache.size
      },
      totalEntries: this.templateCache.size + this.validationCache.size + 
                   this.renderCache.size + this.metadataCache.size,
      memoryUsage: this.stats.totalSize
    };
  }

  /**
   * Shutdown cache manager
   */
  async shutdown() {
    this.stopCleanupTimer();
    
    if (this.options.persistToDisk) {
      // Save current state to disk before shutdown
      await this.saveToDisk();
    }
    
    this.logger.info('Cache manager shutdown completed');
  }

  /**
   * Save all in-memory cache to disk
   */
  async saveToDisk() {
    const types = ['template', 'validation', 'render', 'metadata'];
    
    for (const type of types) {
      const cache = this.getCache(type);
      
      for (const [key, item] of cache.entries()) {
        await this.saveToDiskCache(key, item, type);
      }
    }
    
    this.logger.debug('All cache data saved to disk');
  }
}