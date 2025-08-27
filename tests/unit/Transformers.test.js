/**
 * Unit Tests for Transformer System
 * Tests the BaseTransformer and specific transformer implementations
 */

import { BaseTransformer } from '../src/transformers/BaseTransformer.js';
import FormattingTransformer from '../src/transformers/formattingTransformer.js';
import OpenAPITransformer from '../src/transformers/openApiTransformer.js';
import TestingTransformer from '../src/transformers/testingTransformer.js';
import SeoTransformer from '../src/transformers/seoTransformer.js';
import { jest } from '@jest/globals';

describe('Transformer System', () => {
  
  describe('BaseTransformer', () => {
    let baseTransformer;

    beforeEach(() => {
      baseTransformer = new BaseTransformer();
    });

    test('should create instance with logger', () => {
      expect(baseTransformer).toBeDefined();
      expect(baseTransformer.logger).toBeDefined();
    });

    test('should require doTransform implementation', async () => {
      const files = [{ path: 'test.js', content: 'test' }];
      
      await expect(baseTransformer.transform(files, {}, {})).rejects.toThrow('doTransform method must be implemented');
    });

    test('should handle transformation errors gracefully', async () => {
      // Create a transformer that throws an error
      class ErrorTransformer extends BaseTransformer {
        async doTransform() {
          throw new Error('Test error');
        }
      }

      const errorTransformer = new ErrorTransformer();
      const files = [{ path: 'test.js', content: 'test' }];
      
      // Should return original files on error
      const result = await errorTransformer.transform(files, {}, {});
      expect(result).toEqual(files);
    });

    test('should find files by pattern', () => {
      const files = [
        { path: 'src/App.js', content: 'test' },
        { path: 'src/utils.js', content: 'test' },
        { path: 'docs/README.md', content: 'test' }
      ];

      const jsFiles = baseTransformer.findFiles(files, '.js');
      expect(jsFiles).toHaveLength(2);
      expect(jsFiles.every(f => f.path.includes('.js'))).toBe(true);

      const srcFiles = baseTransformer.findFiles(files, 'src/');
      expect(srcFiles).toHaveLength(2);
      expect(srcFiles.every(f => f.path.includes('src/'))).toBe(true);
    });

    test('should find files by regex pattern', () => {
      const files = [
        { path: 'App.test.js', content: 'test' },
        { path: 'utils.spec.js', content: 'test' },
        { path: 'App.js', content: 'test' }
      ];

      const testFiles = baseTransformer.findFiles(files, /\.(test|spec)\.js$/);
      expect(testFiles).toHaveLength(2);
    });

    test('should update file content correctly', () => {
      const originalFile = {
        path: 'test.js',
        content: 'old content',
        size: 11
      };

      const updatedFile = baseTransformer.updateFileContent(originalFile, 'new content');
      
      expect(updatedFile.path).toBe('test.js');
      expect(updatedFile.content).toBe('new content');
      expect(updatedFile.size).toBe(Buffer.byteLength('new content', 'utf8'));
      expect(updatedFile.lastModified).toBeDefined();
    });
  });

  describe('FormattingTransformer', () => {
    let formattingTransformer;

    beforeEach(() => {
      formattingTransformer = new FormattingTransformer();
    });

    test('should apply general formatting', async () => {
      const files = [
        { path: 'test.js', content: 'function test(){\nreturn "hello";\n}  \n' }
      ];

      const result = await formattingTransformer.doTransform(files, {}, {});
      
      expect(result).toHaveLength(1);
      expect(result[0].content).not.toContain('  \n'); // Should remove trailing whitespace
      expect(result[0].content).toMatch(/\n$/); // Should end with newline
    });

    test('should identify code files correctly', () => {
      expect(formattingTransformer.isCodeFile({ path: 'App.js' })).toBe(true);
      expect(formattingTransformer.isCodeFile({ path: 'App.tsx' })).toBe(true);
      expect(formattingTransformer.isCodeFile({ path: 'styles.css' })).toBe(true);
      expect(formattingTransformer.isCodeFile({ path: 'README.md' })).toBe(false);
    });

    test('should identify JavaScript files correctly', () => {
      expect(formattingTransformer.isJavaScriptFile({ path: 'App.js' })).toBe(true);
      expect(formattingTransformer.isJavaScriptFile({ path: 'App.tsx' })).toBe(true);
      expect(formattingTransformer.isJavaScriptFile({ path: 'styles.css' })).toBe(false);
    });

    test('should identify CSS files correctly', () => {
      expect(formattingTransformer.isCSSFile({ path: 'styles.css' })).toBe(true);
      expect(formattingTransformer.isCSSFile({ path: 'styles.scss' })).toBe(true);
      expect(formattingTransformer.isCSSFile({ path: 'App.js' })).toBe(false);
    });

    test('should normalize line endings', () => {
      const content = 'line1\r\nline2\rline3\n';
      const normalized = formattingTransformer.normalizeLineEndings(content);
      expect(normalized).toBe('line1\nline2\nline3\n');
    });

    test('should normalize indentation', () => {
      const content = 'function test() {\n\tif (true) {\n\t\treturn;\n\t}\n}';
      const normalized = formattingTransformer.normalizeIndentation(content);
      expect(normalized).not.toContain('\t');
      expect(normalized).toContain('  '); // Should convert tabs to spaces
    });

    test('should apply minification when enabled', async () => {
      const files = [
        { path: 'test.js', content: '/* comment */\nfunction test() {\n  return "hello";\n}' }
      ];
      const config = { minify: true };

      const result = await formattingTransformer.doTransform(files, config, {});
      
      expect(result[0].content).not.toContain('/* comment */');
      expect(result[0].content.length).toBeLessThan(files[0].content.length);
    });
  });

  describe('OpenAPITransformer', () => {
    let openApiTransformer;

    beforeEach(() => {
      openApiTransformer = new OpenAPITransformer();
    });

    test('should generate OpenAPI specification', async () => {
      const files = [
        { path: 'routes/users.js', content: 'router.get("/users", handler);' }
      ];
      const config = { generateSpec: true };
      const context = { projectName: 'Test API' };

      const result = await openApiTransformer.doTransform(files, config, context);
      
      expect(result.length).toBeGreaterThan(files.length);
      const specFile = result.find(f => f.path.includes('openapi.json'));
      expect(specFile).toBeDefined();
      expect(specFile.content).toContain('openapi');
      expect(specFile.content).toContain('Test API');
    });

    test('should identify API files correctly', () => {
      expect(openApiTransformer.isAPIFile({ path: 'routes/users.js', content: 'router.get' })).toBe(true);
      expect(openApiTransformer.isAPIFile({ path: 'controller/users.js', content: 'app.post' })).toBe(true);
      expect(openApiTransformer.isAPIFile({ path: 'utils.js', content: 'helper function' })).toBe(false);
    });

    test('should generate servers configuration', () => {
      const context = { deploymentTarget: 'Heroku' };
      const servers = openApiTransformer.generateServers(context);
      
      expect(servers).toBeInstanceOf(Array);
      expect(servers.length).toBeGreaterThan(0);
      expect(servers[0].url).toContain('localhost');
    });

    test('should extract resource name from context', () => {
      const context1 = { projectName: 'User API' };
      const context2 = { projectName: 'Products Service' };
      
      expect(openApiTransformer.extractResourceName(context1)).toBe('user');
      expect(openApiTransformer.extractResourceName(context2)).toBe('products');
    });

    test('should generate basic CRUD paths', () => {
      const context = { projectName: 'User API' };
      const paths = openApiTransformer.generateBasicCRUDPaths(context);
      
      expect(paths['/user']).toBeDefined();
      expect(paths['/user/{id}']).toBeDefined();
      expect(paths['/user'].get).toBeDefined();
      expect(paths['/user'].post).toBeDefined();
      expect(paths['/user/{id}'].get).toBeDefined();
      expect(paths['/user/{id}'].put).toBeDefined();
      expect(paths['/user/{id}'].delete).toBeDefined();
    });
  });

  describe('TestingTransformer', () => {
    let testingTransformer;

    beforeEach(() => {
      testingTransformer = new TestingTransformer();
    });

    test('should generate test files', async () => {
      const files = [
        { path: 'src/utils.js', content: 'export function helper() { return "test"; }' }
      ];
      const config = { generateTests: true };

      const result = await testingTransformer.doTransform(files, config, {});
      
      expect(result.length).toBeGreaterThan(files.length);
      const testFile = result.find(f => f.path.includes('test.js'));
      expect(testFile).toBeDefined();
      expect(testFile.content).toContain('describe');
      expect(testFile.content).toContain('test');
    });

    test('should identify source files correctly', () => {
      expect(testingTransformer.isSourceFile({ path: 'src/App.js' })).toBe(true);
      expect(testingTransformer.isSourceFile({ path: 'utils.ts' })).toBe(true);
      expect(testingTransformer.isSourceFile({ path: 'App.test.js' })).toBe(false);
      expect(testingTransformer.isSourceFile({ path: 'config.js' })).toBe(false);
      expect(testingTransformer.isSourceFile({ path: 'README.md' })).toBe(false);
    });

    test('should identify test files correctly', () => {
      expect(testingTransformer.isTestFile({ path: 'App.test.js' })).toBe(true);
      expect(testingTransformer.isTestFile({ path: 'utils.spec.js' })).toBe(true);
      expect(testingTransformer.isTestFile({ path: '__tests__/App.js' })).toBe(true);
      expect(testingTransformer.isTestFile({ path: 'App.js' })).toBe(false);
    });

    test('should extract function names from content', () => {
      const content = `
        export function helper() {}
        const utils = () => {};
        function process() {}
        export const validate = async () => {};
      `;

      const functions = testingTransformer.extractFunctions(content);
      expect(functions).toContain('helper');
      expect(functions).toContain('utils');
      expect(functions).toContain('process');
      expect(functions).toContain('validate');
    });

    test('should get test path for source file', () => {
      expect(testingTransformer.getTestPath('src/utils.js')).toBe('src/utils.test.js');
      expect(testingTransformer.getTestPath('components/App.tsx')).toBe('components/App.test.js');
    });

    test('should extract module name from file path', () => {
      expect(testingTransformer.extractModuleName('src/utils.js')).toBe('utils');
      expect(testingTransformer.extractModuleName('components/UserProfile.tsx')).toBe('UserProfile');
    });

    test('should generate Jest configuration', () => {
      const config = testingTransformer.generateJestConfig({});
      expect(config).toContain('module.exports');
      expect(config).toContain('testEnvironment');
      expect(config).toContain('collectCoverageFrom');
    });

    test('should generate E2E tests when enabled', async () => {
      const files = [];
      const config = { includeE2E: true };

      const result = await testingTransformer.doTransform(files, config, {});
      
      const e2eFile = result.find(f => f.path.includes('e2e'));
      expect(e2eFile).toBeDefined();
      expect(e2eFile.content).toContain('E2E Tests');
    });
  });

  describe('SeoTransformer', () => {
    let seoTransformer;

    beforeEach(() => {
      seoTransformer = new SeoTransformer();
    });

    test('should generate sitemap when enabled', async () => {
      const files = [];
      const config = { sitemap: true };
      const context = { url: 'https://example.com' };

      const result = await seoTransformer.doTransform(files, config, context);
      
      const sitemapFile = result.find(f => f.path.includes('sitemap.xml'));
      expect(sitemapFile).toBeDefined();
      expect(sitemapFile.content).toContain('<?xml version="1.0"');
      expect(sitemapFile.content).toContain('https://example.com');
    });

    test('should generate robots.txt', async () => {
      const files = [];
      const config = {};
      const context = { url: 'https://example.com' };

      const result = await seoTransformer.doTransform(files, config, context);
      
      const robotsFile = result.find(f => f.path.includes('robots.txt'));
      expect(robotsFile).toBeDefined();
      expect(robotsFile.content).toContain('User-agent: *');
      expect(robotsFile.content).toContain('Sitemap:');
    });

    test('should add meta tags to HTML files', async () => {
      const files = [
        { path: 'index.html', content: '<head>\n<title>Test</title>\n</head>' }
      ];
      const config = { generateMeta: true };
      const context = { projectName: 'Test Project' };

      const result = await seoTransformer.doTransform(files, config, context);
      
      expect(result[0].content).toContain('meta name="description"');
      expect(result[0].content).toContain('meta property="og:title"');
      expect(result[0].content).toContain('Test Project');
    });

    test('should identify HTML files correctly', () => {
      expect(seoTransformer.isHTMLFile({ path: 'index.html' })).toBe(true);
      expect(seoTransformer.isHTMLFile({ path: 'page.htm' })).toBe(true);
      expect(seoTransformer.isHTMLFile({ path: 'App.js' })).toBe(false);
    });

    test('should identify React components correctly', () => {
      expect(seoTransformer.isReactComponent({ path: 'App.jsx', content: 'import React' })).toBe(true);
      expect(seoTransformer.isReactComponent({ path: 'App.tsx', content: 'React.Component' })).toBe(true);
      expect(seoTransformer.isReactComponent({ path: 'utils.js', content: 'helper function' })).toBe(false);
    });

    test('should generate keywords from context', () => {
      const context = {
        projectName: 'Test Project',
        techStack: ['React', 'Node.js'],
        category: 'web-app'
      };

      const keywords = seoTransformer.generateKeywords(context);
      expect(keywords).toContain('test project');
      expect(keywords).toContain('react');
      expect(keywords).toContain('node.js');
      expect(keywords).toContain('web-app');
    });

    test('should extract routes from React files', () => {
      const file = {
        path: 'App.jsx',
        content: '<Route path="/home" component={Home} />\n<Route path="/about" component={About} />'
      };

      const routes = seoTransformer.extractRoutesFromFile(file);
      expect(routes).toContain('/home');
      expect(routes).toContain('/about');
    });

    test('should generate sitemap XML correctly', () => {
      const urls = [
        { loc: 'https://example.com', lastmod: '2023-01-01', changefreq: 'daily', priority: '1.0' },
        { loc: 'https://example.com/about', lastmod: '2023-01-01', changefreq: 'weekly', priority: '0.8' }
      ];

      const xml = seoTransformer.generateSitemapXML(urls);
      expect(xml).toContain('<?xml version="1.0"');
      expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
      expect(xml).toContain('<loc>https://example.com</loc>');
      expect(xml).toContain('<priority>1.0</priority>');
    });
  });

  describe('Transformer Integration', () => {
    test('should load transformers dynamically', async () => {
      // Test that we can import transformers as expected by PromptGenerator
      const FormattingTransformerClass = (await import('../src/transformers/formattingTransformer.js')).default;
      const OpenAPITransformerClass = (await import('../src/transformers/openApiTransformer.js')).default;
      
      expect(FormattingTransformerClass).toBeDefined();
      expect(OpenAPITransformerClass).toBeDefined();
      
      const formattingTransformer = new FormattingTransformerClass();
      const openApiTransformer = new OpenAPITransformerClass();
      
      expect(formattingTransformer).toBeInstanceOf(BaseTransformer);
      expect(openApiTransformer).toBeInstanceOf(BaseTransformer);
    });

    test('should handle transformer chain execution', async () => {
      const files = [
        { path: 'test.js', content: 'function test() { return "hello"; }' }
      ];

      // Apply multiple transformers in sequence
      const formattingTransformer = new FormattingTransformer();
      const testingTransformer = new TestingTransformer();

      let result = await formattingTransformer.transform(files, {}, {});
      result = await testingTransformer.transform(result, { generateTests: true }, {});

      expect(result.length).toBeGreaterThan(files.length); // Should have additional test files
    });
  });
});