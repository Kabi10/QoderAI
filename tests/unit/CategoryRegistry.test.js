/**
 * Unit Tests for CategoryRegistry
 * Tests category loading, configuration, and retrieval functionality
 */

import { CategoryRegistry } from '../src/core/CategoryRegistry.js';
import { jest } from '@jest/globals';

describe('CategoryRegistry', () => {
  let categoryRegistry;

  beforeEach(() => {
    categoryRegistry = new CategoryRegistry();
  });

  describe('Initialization', () => {
    test('should create instance with default properties', () => {
      expect(categoryRegistry).toBeDefined();
      expect(categoryRegistry.categories).toBeInstanceOf(Map);
      expect(categoryRegistry.subcategories).toBeInstanceOf(Map);
      expect(categoryRegistry.categories.size).toBe(0);
      expect(categoryRegistry.subcategories.size).toBe(0);
    });

    test('should have correct config path', () => {
      expect(categoryRegistry.configPath).toContain('config/categories');
    });
  });

  describe('Category Loading', () => {
    test('should load main categories successfully', async () => {
      await categoryRegistry.loadCategories();
      
      expect(categoryRegistry.categories.size).toBeGreaterThan(0);
      expect(categoryRegistry.subcategories.size).toBeGreaterThan(0);
    });

    test('should load expected main categories', async () => {
      await categoryRegistry.loadCategories();
      
      const categories = categoryRegistry.getAllCategories();
      const categoryIds = categories.map(c => c.id);
      
      expect(categoryIds).toContain('applications');
      expect(categoryIds).toContain('websites');
      expect(categoryIds).toContain('apis');
      expect(categoryIds).toContain('games');
      expect(categoryIds).toContain('ai-ml');
    });

    test('should load subcategories with proper configuration', async () => {
      await categoryRegistry.loadCategories();
      
      const webAppConfig = categoryRegistry.getSubcategoryConfig('web-app');
      expect(webAppConfig).toBeDefined();
      expect(webAppConfig.name).toBe('Web Application');
      expect(webAppConfig.templates).toContain('prompts/react-web-app');
      expect(webAppConfig.techStacks).toBeDefined();
      expect(webAppConfig.features).toBeDefined();
    });

    test('should load landing-page subcategory (fixed template mapping)', async () => {
      await categoryRegistry.loadCategories();
      
      const landingPageConfig = categoryRegistry.getSubcategoryConfig('landing-page');
      expect(landingPageConfig).toBeDefined();
      expect(landingPageConfig.name).toBe('Landing Page');
      expect(landingPageConfig.templates).toContain('prompts/landing-page');
      expect(landingPageConfig.transformations).toBeDefined();
    });
  });

  describe('Category Retrieval', () => {
    beforeEach(async () => {
      await categoryRegistry.loadCategories();
    });

    test('should get all categories', () => {
      const categories = categoryRegistry.getAllCategories();
      expect(categories).toBeInstanceOf(Array);
      expect(categories.length).toBeGreaterThan(0);
      categories.forEach(category => {
        expect(category.enabled).toBe(true);
        expect(category.id).toBeDefined();
        expect(category.name).toBeDefined();
        expect(category.description).toBeDefined();
      });
    });

    test('should get category info by ID', () => {
      const categoryInfo = categoryRegistry.getCategoryInfo('applications');
      expect(categoryInfo).toBeDefined();
      expect(categoryInfo.id).toBe('applications');
      expect(categoryInfo.name).toBe('Applications & Software');
      expect(categoryInfo.subcategories).toBeInstanceOf(Array);
    });

    test('should return null for non-existent category', () => {
      const categoryInfo = categoryRegistry.getCategoryInfo('non-existent');
      expect(categoryInfo).toBeUndefined();
    });

    test('should get subcategory config', () => {
      const subConfig = categoryRegistry.getSubcategoryConfig('rest-api');
      expect(subConfig).toBeDefined();
      expect(subConfig.id).toBe('rest-api');
      expect(subConfig.name).toBe('REST API');
      expect(subConfig.templates).toContain('prompts/express-api');
    });

    test('should get complete category config for subcategory', async () => {
      const config = await categoryRegistry.getCategoryConfig('web-app');
      expect(config).toBeDefined();
      expect(config.id).toBe('web-app');
      expect(config.parentCategory).toBeDefined();
      expect(config.parentCategory.id).toBe('applications');
      expect(config.outputStructure).toBeDefined();
    });

    test('should get complete category config for main category', async () => {
      const config = await categoryRegistry.getCategoryConfig('applications');
      expect(config).toBeDefined();
      expect(config.id).toBe('applications');
      expect(config.subcategories).toBeInstanceOf(Array);
    });
  });

  describe('Category Validation', () => {
    beforeEach(async () => {
      await categoryRegistry.loadCategories();
    });

    test('should validate existing categories', () => {
      expect(categoryRegistry.isValidCategory('applications')).toBe(true);
      expect(categoryRegistry.isValidCategory('web-app')).toBe(true);
      expect(categoryRegistry.isValidCategory('rest-api')).toBe(true);
      expect(categoryRegistry.isValidCategory('landing-page')).toBe(true);
    });

    test('should reject invalid categories', () => {
      expect(categoryRegistry.isValidCategory('invalid-category')).toBe(false);
      expect(categoryRegistry.isValidCategory('')).toBe(false);
      expect(categoryRegistry.isValidCategory(null)).toBe(false);
    });
  });

  describe('Category Search', () => {
    beforeEach(async () => {
      await categoryRegistry.loadCategories();
    });

    test('should search categories by name', () => {
      const results = categoryRegistry.searchCategories('web');
      expect(results.length).toBeGreaterThan(0);
      
      const webResults = results.filter(r => r.name.toLowerCase().includes('web'));
      expect(webResults.length).toBeGreaterThan(0);
    });

    test('should search categories by description', () => {
      const results = categoryRegistry.searchCategories('api');
      expect(results.length).toBeGreaterThan(0);
      
      const apiResults = results.filter(r => 
        r.name.toLowerCase().includes('api') || 
        r.description.toLowerCase().includes('api')
      );
      expect(apiResults.length).toBeGreaterThan(0);
    });

    test('should return empty array for no matches', () => {
      const results = categoryRegistry.searchCategories('xyz123nonexistent');
      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBe(0);
    });
  });

  describe('Subcategories', () => {
    beforeEach(async () => {
      await categoryRegistry.loadCategories();
    });

    test('should get subcategories for a category', () => {
      const subcategories = categoryRegistry.getSubcategories('applications');
      expect(subcategories).toBeInstanceOf(Array);
      expect(subcategories.length).toBeGreaterThan(0);
      
      const subcategoryIds = subcategories.map(s => s.id);
      expect(subcategoryIds).toContain('web-app');
      expect(subcategoryIds).toContain('mobile-app');
      expect(subcategoryIds).toContain('desktop-app');
    });

    test('should return empty array for invalid category', () => {
      const subcategories = categoryRegistry.getSubcategories('invalid');
      expect(subcategories).toBeInstanceOf(Array);
      expect(subcategories.length).toBe(0);
    });
  });

  describe('Statistics', () => {
    beforeEach(async () => {
      await categoryRegistry.loadCategories();
    });

    test('should return correct category count', () => {
      const count = categoryRegistry.getCategoryCount();
      expect(count).toBe(5); // Expected number of main categories
    });

    test('should return correct subcategory count', () => {
      const count = categoryRegistry.getSubcategoryCount();
      expect(count).toBeGreaterThan(0);
      expect(count).toBeGreaterThanOrEqual(6); // At least the subcategories we added
    });
  });

  describe('Error Handling', () => {
    test('should handle category loading errors gracefully', async () => {
      // Create a registry with invalid config path
      const invalidRegistry = new CategoryRegistry();
      invalidRegistry.configPath = '/invalid/path';
      
      // Should not throw, but log error
      await expect(invalidRegistry.loadCategories()).rejects.toThrow();
    });

    test('should handle malformed category data', async () => {
      // Test that the registry can handle unexpected data formats
      const registry = new CategoryRegistry();
      
      // Override loadMainCategories to test error handling
      registry.loadMainCategories = jest.fn().mockRejectedValue(new Error('Test error'));
      
      await expect(registry.loadCategories()).rejects.toThrow('Test error');
    });
  });
});