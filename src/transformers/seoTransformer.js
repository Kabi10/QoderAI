/**
 * SEO Transformer
 * Handles SEO optimization and meta tag generation
 */

import { BaseTransformer } from './BaseTransformer.js';

export default class SeoTransformer extends BaseTransformer {
  /**
   * Apply SEO transformations to files
   * @param {Array} files - Files to transform
   * @param {Object} config - SEO configuration
   * @param {Object} context - Generation context
   * @returns {Array} Transformed files
   */
  async doTransform(files, config, context) {
    const transformedFiles = [...files];

    // Generate meta tags if enabled
    if (config.generateMeta) {
      for (let i = 0; i < transformedFiles.length; i++) {
        if (this.isHTMLFile(transformedFiles[i])) {
          transformedFiles[i] = await this.addMetaTags(transformedFiles[i], config, context);
        }
      }
    }

    // Generate sitemap if enabled
    if (config.sitemap) {
      const sitemapFile = await this.generateSitemap(files, config, context);
      if (sitemapFile) {
        transformedFiles.push(sitemapFile);
      }
    }

    // Add robots.txt
    const robotsFile = await this.generateRobotsTxt(config, context);
    if (robotsFile) {
      transformedFiles.push(robotsFile);
    }

    return transformedFiles;
  }

  /**
   * Add meta tags to HTML files
   * @param {Object} file - HTML file
   * @param {Object} config - Configuration
   * @param {Object} context - Generation context
   * @returns {Object} Enhanced file
   */
  async addMetaTags(file, config, context) {
    let content = file.content;

    // Generate meta tags
    const metaTags = this.generateMetaTags(context);

    // Insert meta tags into HTML head
    if (content.includes('<head>')) {
      content = content.replace('<head>', `<head>\n${metaTags}`);
    } else if (content.includes('</title>')) {
      content = content.replace('</title>', `</title>\n${metaTags}`);
    }

    this.logger.debug(`Added SEO meta tags to ${file.path}`);
    return this.updateFileContent(file, content);
  }

  /**
   * Generate meta tags
   * @param {Object} context - Generation context
   * @returns {string} Meta tags HTML
   */
  generateMetaTags(context) {
    const projectName = context.projectName || 'Website';
    const description = context.description || `${projectName} - A modern web application`;

    return `    <!-- SEO Meta Tags -->
    <meta name="description" content="${description}">
    <meta name="keywords" content="${this.generateKeywords(context)}">
    <meta name="author" content="${context.author || 'Website Team'}">
    
    <!-- Open Graph Tags -->
    <meta property="og:title" content="${projectName}">
    <meta property="og:description" content="${description}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${context.url || 'https://example.com'}">
    <meta property="og:image" content="${context.ogImage || '/images/og-image.jpg'}">
    
    <!-- Twitter Card Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${projectName}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${context.twitterImage || '/images/twitter-image.jpg'}">
    
    <!-- Viewport and Mobile -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="${context.themeColor || '#000000'}">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${context.canonicalUrl || context.url || 'https://example.com'}">
`;
  }

  /**
   * Generate keywords from context
   * @param {Object} context - Generation context
   * @returns {string} Keywords string
   */
  generateKeywords(context) {
    const keywords = [];

    if (context.projectName) {
      keywords.push(context.projectName.toLowerCase());
    }

    if (context.techStack) {
      keywords.push(...context.techStack.map(tech => tech.toLowerCase()));
    }

    if (context.category) {
      keywords.push(context.category.toLowerCase());
    }

    // Add generic web development keywords
    keywords.push('web development', 'application', 'software');

    return keywords.slice(0, 10).join(', ');
  }

  /**
   * Generate sitemap.xml
   * @param {Array} files - Source files
   * @param {Object} config - Configuration
   * @param {Object} context - Generation context
   * @returns {Object} Sitemap file
   */
  async generateSitemap(files, config, context) {
    const baseUrl = context.url || 'https://example.com';
    const urls = this.extractUrls(files, baseUrl);

    const sitemapContent = this.generateSitemapXML(urls);

    this.logger.debug('Generated sitemap.xml');

    return {
      path: 'public/sitemap.xml',
      content: sitemapContent,
      size: Buffer.byteLength(sitemapContent, 'utf8'),
      templateId: 'sitemap',
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Extract URLs from files
   * @param {Array} files - Source files
   * @param {string} baseUrl - Base URL
   * @returns {Array} URL objects
   */
  extractUrls(files, baseUrl) {
    const urls = [
      {
        loc: baseUrl,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'daily',
        priority: '1.0'
      }
    ];

    // Extract routes from HTML/React files
    const pageFiles = files.filter(file => 
      this.isHTMLFile(file) || this.isReactComponent(file)
    );

    for (const file of pageFiles) {
      const routes = this.extractRoutesFromFile(file);
      for (const route of routes) {
        urls.push({
          loc: `${baseUrl}${route}`,
          lastmod: new Date().toISOString().split('T')[0],
          changefreq: 'weekly',
          priority: '0.8'
        });
      }
    }

    return urls;
  }

  /**
   * Extract routes from file content
   * @param {Object} file - File to analyze
   * @returns {Array} Routes
   */
  extractRoutesFromFile(file) {
    const routes = [];
    
    // Extract React Router routes
    const routePatterns = [
      /<Route[^>]+path="([^"]+)"/g,
      /path:\s*['"`]([^'"`]+)['"`]/g
    ];

    for (const pattern of routePatterns) {
      let match;
      while ((match = pattern.exec(file.content)) !== null) {
        const route = match[1];
        if (route && !routes.includes(route)) {
          routes.push(route);
        }
      }
    }

    return routes;
  }

  /**
   * Generate sitemap XML content
   * @param {Array} urls - URL objects
   * @returns {string} Sitemap XML
   */
  generateSitemapXML(urls) {
    const urlElements = urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
  }

  /**
   * Generate robots.txt
   * @param {Object} config - Configuration
   * @param {Object} context - Generation context
   * @returns {Object} Robots.txt file
   */
  async generateRobotsTxt(config, context) {
    const baseUrl = context.url || 'https://example.com';
    const content = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Disallow admin and private areas
Disallow: /admin/
Disallow: /private/
Disallow: /api/
Disallow: /*.json$
`;

    this.logger.debug('Generated robots.txt');

    return {
      path: 'public/robots.txt',
      content,
      size: Buffer.byteLength(content, 'utf8'),
      templateId: 'robots-txt',
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Check if file is an HTML file
   * @param {Object} file - File to check
   * @returns {boolean} Whether file is HTML
   */
  isHTMLFile(file) {
    return file.path.endsWith('.html') || file.path.endsWith('.htm');
  }

  /**
   * Check if file is a React component
   * @param {Object} file - File to check
   * @returns {boolean} Whether file is React component
   */
  isReactComponent(file) {
    return (file.path.endsWith('.jsx') || file.path.endsWith('.tsx')) &&
           file.content.includes('React');
  }
}