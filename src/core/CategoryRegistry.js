/**
 * Category Registry
 * Manages product categories and their configurations
 */

import fs from 'fs-extra';
import path from 'path';
import yaml from 'yaml';
import { Logger } from '../utils/Logger.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class CategoryRegistry {
  constructor() {
    this.logger = new Logger('CategoryRegistry');
    this.categories = new Map();
    this.subcategories = new Map();
    this.configPath = path.join(__dirname, '../../config/categories');
  }

  /**
   * Load all category configurations
   */
  async loadCategories() {
    try {
      this.logger.info('Loading category configurations...');

      // Ensure categories directory exists
      await fs.ensureDir(this.configPath);

      // Load main category definitions
      await this.loadMainCategories();

      // Load subcategory configurations
      await this.loadSubcategories();

      this.logger.success(`Loaded ${this.categories.size} categories with ${this.subcategories.size} subcategories`);

    } catch (error) {
      this.logger.error('Failed to load categories', error);
      throw error;
    }
  }

  /**
   * Load main category definitions
   */
  async loadMainCategories() {
    const mainCategories = [
      {
        id: 'applications',
        name: 'Applications & Software',
        description: 'Complete software applications and tools',
        subcategories: ['web-app', 'mobile-app', 'desktop-app', 'cli-tool', 'browser-extension', 'pwa'],
        outputStructure: {
          src: 'Application source code',
          public: 'Static assets and resources',
          docs: 'Documentation and guides',
          config: 'Configuration files',
          tests: 'Testing suites',
          scripts: 'Build and deployment scripts'
        }
      },
      {
        id: 'websites',
        name: 'Websites & Digital Presence',
        description: 'Web presences and content platforms',
        subcategories: ['landing-page', 'portfolio-site', 'blog-platform', 'e-commerce', 'documentation-site', 'corporate-website'],
        outputStructure: {
          src: 'Website source code',
          public: 'Static assets',
          content: 'Content management',
          styles: 'CSS and styling',
          docs: 'Setup and usage guides'
        }
      },
      {
        id: 'apis',
        name: 'APIs & Backend Services',
        description: 'Backend services and API endpoints',
        subcategories: ['rest-api', 'graphql-api', 'websocket-service', 'webhook-handler', 'auth-service', 'data-pipeline'],
        outputStructure: {
          src: 'API source code',
          routes: 'Endpoint definitions',
          middleware: 'Authentication and middleware',
          models: 'Data models',
          docs: 'API documentation',
          tests: 'API testing suites'
        }
      },
      {
        id: 'games',
        name: 'Games & Interactive Media',
        description: 'Gaming and interactive experiences',
        subcategories: ['web-game', 'mobile-game', 'interactive-story', 'simulation', 'ar-vr-experience'],
        outputStructure: {
          src: 'Game source code',
          assets: 'Game assets and resources',
          scenes: 'Game scenes and levels',
          scripts: 'Game logic scripts',
          docs: 'Game design documentation'
        }
      },
      {
        id: 'ai-ml',
        name: 'AI & Machine Learning',
        description: 'AI/ML models and services',
        subcategories: ['chatbot', 'ml-model', 'computer-vision', 'nlp-service', 'recommendation-engine', 'data-analysis-tool'],
        outputStructure: {
          src: 'ML source code',
          models: 'Model definitions',
          data: 'Dataset processing',
          training: 'Training scripts',
          inference: 'Inference services',
          docs: 'Model documentation'
        }
      }
    ];

    for (const category of mainCategories) {
      this.categories.set(category.id, {
        ...category,
        enabled: true,
        loadedAt: new Date().toISOString()
      });
    }
  }

  /**
   * Load subcategory configurations
   */
  async loadSubcategories() {
    const subcategoryConfigs = {
      'web-app': {
        name: 'Web Application',
        description: 'Modern web applications with rich user interfaces',
        techStacks: {
          preferred: ['React', 'Vue.js', 'Angular'],
          backend: ['Node.js', 'Python', 'Java'],
          database: ['PostgreSQL', 'MongoDB', 'Redis']
        },
        features: {
          core: ['User authentication', 'Responsive design', 'API integration', 'State management'],
          optional: ['PWA capabilities', 'Real-time updates', 'Offline support', 'Analytics']
        },
        templates: ['base-web-app', 'react-app', 'vue-app', 'angular-app'],
        validationRules: ['syntax-check', 'security-scan', 'performance-check'],
        transformations: [
          { type: 'dependency', config: { autoInstall: true } },
          { type: 'formatting', config: { prettier: true, eslint: true } }
        ]
      },
      'mobile-app': {
        name: 'Mobile Application',
        description: 'Native and cross-platform mobile applications',
        techStacks: {
          preferred: ['React Native', 'Flutter', 'Swift', 'Kotlin'],
          backend: ['Node.js', 'Firebase', 'Supabase'],
          services: ['Push notifications', 'Analytics', 'Crash reporting']
        },
        features: {
          core: ['Navigation', 'User onboarding', 'Local storage', 'Network handling'],
          optional: ['Biometric auth', 'Camera integration', 'GPS/Maps', 'Social sharing']
        },
        templates: ['base-mobile-app', 'react-native-app', 'flutter-app'],
        validationRules: ['syntax-check', 'performance-check', 'security-scan'],
        transformations: [
          { type: 'platform', config: { ios: true, android: true } },
          { type: 'assets', config: { generateIcons: true, splash: true } }
        ]
      },
      'rest-api': {
        name: 'REST API',
        description: 'RESTful API services with complete documentation',
        techStacks: {
          preferred: ['Node.js', 'Python', 'Java', 'Go'],
          frameworks: ['Express', 'FastAPI', 'Spring Boot', 'Gin'],
          database: ['PostgreSQL', 'MongoDB', 'MySQL']
        },
        features: {
          core: ['CRUD operations', 'Authentication', 'Validation', 'Error handling'],
          optional: ['Rate limiting', 'Caching', 'Monitoring', 'API versioning']
        },
        templates: ['base-rest-api', 'express-api', 'fastapi-api', 'spring-api'],
        validationRules: ['api-spec-check', 'security-scan', 'performance-check'],
        transformations: [
          { type: 'openapi', config: { generateSpec: true, includeExamples: true } },
          { type: 'testing', config: { generateTests: true, includeE2E: true } }
        ]
      }
    };

    for (const [id, config] of Object.entries(subcategoryConfigs)) {
      this.subcategories.set(id, {
        id,
        ...config,
        loadedAt: new Date().toISOString()
      });
    }
  }

  /**
   * Get all available categories
   * @returns {Array} List of categories
   */
  getAllCategories() {
    return Array.from(this.categories.values()).filter(cat => cat.enabled);
  }

  /**
   * Get category information by ID
   * @param {string} categoryId - Category identifier
   * @returns {Object} Category information
   */
  getCategoryInfo(categoryId) {
    return this.categories.get(categoryId);
  }

  /**
   * Get subcategory configuration
   * @param {string} subcategoryId - Subcategory identifier
   * @returns {Object} Subcategory configuration
   */
  getSubcategoryConfig(subcategoryId) {
    return this.subcategories.get(subcategoryId);
  }

  /**
   * Get complete category configuration including subcategory details
   * @param {string} categoryOrSubcategory - Category or subcategory ID
   * @returns {Object} Complete configuration
   */
  async getCategoryConfig(categoryOrSubcategory) {
    // Check if it's a subcategory first
    if (this.subcategories.has(categoryOrSubcategory)) {
      const subcategoryConfig = this.subcategories.get(categoryOrSubcategory);
      
      // Find parent category
      const parentCategory = Array.from(this.categories.values())
        .find(cat => cat.subcategories.includes(categoryOrSubcategory));

      return {
        ...subcategoryConfig,
        parentCategory,
        outputStructure: parentCategory?.outputStructure || {}
      };
    }

    // Check if it's a main category
    if (this.categories.has(categoryOrSubcategory)) {
      return this.categories.get(categoryOrSubcategory);
    }

    return null;
  }

  /**
   * Get available subcategories for a category
   * @param {string} categoryId - Category identifier
   * @returns {Array} List of subcategories
   */
  getSubcategories(categoryId) {
    const category = this.categories.get(categoryId);
    if (!category) return [];

    return category.subcategories.map(subId => this.subcategories.get(subId))
                                  .filter(Boolean);
  }

  /**
   * Validate category exists and is enabled
   * @param {string} categoryId - Category or subcategory ID
   * @returns {boolean} Whether category is valid
   */
  isValidCategory(categoryId) {
    return this.categories.has(categoryId) || this.subcategories.has(categoryId);
  }

  /**
   * Get category count
   * @returns {number} Number of loaded categories
   */
  getCategoryCount() {
    return this.categories.size;
  }

  /**
   * Get subcategory count
   * @returns {number} Number of loaded subcategories
   */
  getSubcategoryCount() {
    return this.subcategories.size;
  }

  /**
   * Search categories by name or description
   * @param {string} query - Search query
   * @returns {Array} Matching categories
   */
  searchCategories(query) {
    const searchTerm = query.toLowerCase();
    const results = [];

    // Search main categories
    for (const category of this.categories.values()) {
      if (category.name.toLowerCase().includes(searchTerm) || 
          category.description.toLowerCase().includes(searchTerm)) {
        results.push({ type: 'category', ...category });
      }
    }

    // Search subcategories
    for (const subcategory of this.subcategories.values()) {
      if (subcategory.name.toLowerCase().includes(searchTerm) || 
          subcategory.description.toLowerCase().includes(searchTerm)) {
        results.push({ type: 'subcategory', ...subcategory });
      }
    }

    return results;
  }
}