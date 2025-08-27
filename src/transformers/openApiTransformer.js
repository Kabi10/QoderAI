/**
 * OpenAPI Transformer
 * Handles OpenAPI/Swagger specification generation and enhancement
 */

import { BaseTransformer } from './BaseTransformer.js';

export default class OpenAPITransformer extends BaseTransformer {
  /**
   * Apply OpenAPI transformations to files
   * @param {Array} files - Files to transform
   * @param {Object} config - OpenAPI configuration
   * @param {Object} context - Generation context
   * @returns {Array} Transformed files
   */
  async doTransform(files, config, context) {
    const transformedFiles = [...files];

    // Generate OpenAPI specification if enabled
    if (config.generateSpec) {
      const openApiSpec = await this.generateOpenAPISpec(files, config, context);
      if (openApiSpec) {
        transformedFiles.push(openApiSpec);
      }
    }

    // Add OpenAPI comments to API files
    if (config.includeExamples) {
      for (let i = 0; i < transformedFiles.length; i++) {
        if (this.isAPIFile(transformedFiles[i])) {
          transformedFiles[i] = await this.addOpenAPIComments(transformedFiles[i], config, context);
        }
      }
    }

    // Enhance existing API documentation
    for (let i = 0; i < transformedFiles.length; i++) {
      if (this.isAPIDocFile(transformedFiles[i])) {
        transformedFiles[i] = await this.enhanceAPIDocumentation(transformedFiles[i], config, context);
      }
    }

    return transformedFiles;
  }

  /**
   * Generate OpenAPI specification file
   * @param {Array} files - Source files
   * @param {Object} config - Configuration
   * @param {Object} context - Generation context
   * @returns {Object} OpenAPI specification file
   */
  async generateOpenAPISpec(files, config, context) {
    const spec = {
      openapi: '3.0.3',
      info: {
        title: context.projectName || 'API Documentation',
        description: `API documentation for ${context.projectName || 'the project'}`,
        version: '1.0.0',
        contact: {
          name: 'API Support',
          email: 'support@example.com'
        }
      },
      servers: this.generateServers(context),
      paths: this.generatePaths(files, context),
      components: this.generateComponents(files, context)
    };

    const content = JSON.stringify(spec, null, 2);

    this.logger.debug('Generated OpenAPI specification');

    return {
      path: 'docs/openapi.json',
      content,
      size: Buffer.byteLength(content, 'utf8'),
      templateId: 'openapi-spec',
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Generate server configurations
   * @param {Object} context - Generation context
   * @returns {Array} Server configurations
   */
  generateServers(context) {
    const servers = [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ];

    // Add production server if deployment target is specified
    if (context.deploymentTarget) {
      const productionUrl = this.getProductionURL(context.deploymentTarget);
      if (productionUrl) {
        servers.push({
          url: productionUrl,
          description: 'Production server'
        });
      }
    }

    return servers;
  }

  /**
   * Get production URL based on deployment target
   * @param {string} deploymentTarget - Deployment target
   * @returns {string} Production URL
   */
  getProductionURL(deploymentTarget) {
    const target = deploymentTarget.toLowerCase();
    
    if (target.includes('heroku')) {
      return 'https://your-app.herokuapp.com';
    } else if (target.includes('vercel')) {
      return 'https://your-app.vercel.app';
    } else if (target.includes('netlify')) {
      return 'https://your-app.netlify.app';
    } else if (target.includes('aws')) {
      return 'https://api.your-domain.com';
    }
    
    return null;
  }

  /**
   * Generate API paths from source files
   * @param {Array} files - Source files
   * @param {Object} context - Generation context
   * @returns {Object} OpenAPI paths
   */
  generatePaths(files, context) {
    const paths = {};

    // Extract routes from API files (basic implementation)
    const apiFiles = files.filter(file => this.isAPIFile(file));
    
    for (const file of apiFiles) {
      const extractedPaths = this.extractPathsFromFile(file);
      Object.assign(paths, extractedPaths);
    }

    // If no paths found, add basic CRUD paths
    if (Object.keys(paths).length === 0) {
      return this.generateBasicCRUDPaths(context);
    }

    return paths;
  }

  /**
   * Extract API paths from file content
   * @param {Object} file - File to analyze
   * @returns {Object} Extracted paths
   */
  extractPathsFromFile(file) {
    const paths = {};
    
    // Basic regex patterns for common route definitions
    const routePatterns = [
      /router\.(get|post|put|delete|patch)\(['"`]([^'"`]+)['"`]/g,
      /app\.(get|post|put|delete|patch)\(['"`]([^'"`]+)['"`]/g,
      /@(Get|Post|Put|Delete|Patch)\(['"`]([^'"`]+)['"`]/g
    ];

    for (const pattern of routePatterns) {
      let match;
      while ((match = pattern.exec(file.content)) !== null) {
        const method = match[1].toLowerCase();
        const path = match[2];
        
        if (!paths[path]) {
          paths[path] = {};
        }
        
        paths[path][method] = this.generateBasicOperation(method, path);
      }
    }

    return paths;
  }

  /**
   * Generate basic CRUD paths
   * @param {Object} context - Generation context
   * @returns {Object} Basic CRUD paths
   */
  generateBasicCRUDPaths(context) {
    const resourceName = this.extractResourceName(context);
    
    return {
      [`/${resourceName}`]: {
        get: {
          summary: `Get all ${resourceName}`,
          description: `Retrieve a list of all ${resourceName}`,
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: `#/components/schemas/${resourceName}` }
                  }
                }
              }
            }
          }
        },
        post: {
          summary: `Create ${resourceName}`,
          description: `Create a new ${resourceName}`,
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: `#/components/schemas/${resourceName}` }
              }
            }
          },
          responses: {
            '201': {
              description: 'Resource created successfully',
              content: {
                'application/json': {
                  schema: { $ref: `#/components/schemas/${resourceName}` }
                }
              }
            }
          }
        }
      },
      [`/${resourceName}/{id}`]: {
        get: {
          summary: `Get ${resourceName} by ID`,
          parameters: [{
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }],
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: { $ref: `#/components/schemas/${resourceName}` }
                }
              }
            },
            '404': {
              description: 'Resource not found'
            }
          }
        },
        put: {
          summary: `Update ${resourceName}`,
          parameters: [{
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: `#/components/schemas/${resourceName}` }
              }
            }
          },
          responses: {
            '200': {
              description: 'Resource updated successfully'
            }
          }
        },
        delete: {
          summary: `Delete ${resourceName}`,
          parameters: [{
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }],
          responses: {
            '204': {
              description: 'Resource deleted successfully'
            }
          }
        }
      }
    };
  }

  /**
   * Generate basic operation definition
   * @param {string} method - HTTP method
   * @param {string} path - API path
   * @returns {Object} Operation definition
   */
  generateBasicOperation(method, path) {
    return {
      summary: `${method.toUpperCase()} ${path}`,
      description: `${method.toUpperCase()} operation for ${path}`,
      responses: {
        '200': {
          description: 'Successful response'
        }
      }
    };
  }

  /**
   * Generate OpenAPI components
   * @param {Array} files - Source files
   * @param {Object} context - Generation context
   * @returns {Object} OpenAPI components
   */
  generateComponents(files, context) {
    const resourceName = this.extractResourceName(context);
    
    return {
      schemas: {
        [resourceName]: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier'
            },
            name: {
              type: 'string',
              description: 'Name of the resource'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          },
          required: ['name']
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            },
            code: {
              type: 'integer',
              description: 'Error code'
            }
          }
        }
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    };
  }

  /**
   * Extract resource name from context
   * @param {Object} context - Generation context
   * @returns {string} Resource name
   */
  extractResourceName(context) {
    if (context.projectName) {
      // Extract first word and make it singular
      const name = context.projectName.split(' ')[0].toLowerCase();
      return name.endsWith('s') ? name.slice(0, -1) : name;
    }
    return 'resource';
  }

  /**
   * Add OpenAPI comments to API files
   * @param {Object} file - File to enhance
   * @param {Object} config - Configuration
   * @param {Object} context - Generation context
   * @returns {Object} Enhanced file
   */
  async addOpenAPIComments(file, config, context) {
    let content = file.content;
    
    // Add basic OpenAPI documentation comments
    if (content.includes('router.get') || content.includes('app.get')) {
      content = this.addSwaggerComments(content);
    }
    
    return this.updateFileContent(file, content);
  }

  /**
   * Add Swagger/OpenAPI comments to code
   * @param {string} content - File content
   * @returns {string} Enhanced content
   */
  addSwaggerComments(content) {
    // Basic implementation - add swagger comments before route definitions
    return content.replace(
      /(router|app)\.(get|post|put|delete|patch)\(['"`]([^'"`]+)['"`]/g,
      '/**\n * @swagger\n * $3:\n *   $2:\n *     summary: $2 $3\n *     responses:\n *       200:\n *         description: Success\n */\n$&'
    );
  }

  /**
   * Enhance API documentation files
   * @param {Object} file - Documentation file
   * @param {Object} config - Configuration
   * @param {Object} context - Generation context
   * @returns {Object} Enhanced file
   */
  async enhanceAPIDocumentation(file, config, context) {
    let content = file.content;
    
    // Add OpenAPI specification link
    if (!content.includes('OpenAPI')) {
      content = `# API Documentation\n\nView the interactive API documentation: [OpenAPI Spec](./openapi.json)\n\n${content}`;
    }
    
    return this.updateFileContent(file, content);
  }

  /**
   * Check if file is an API file
   * @param {Object} file - File to check
   * @returns {boolean} Whether file is an API file
   */
  isAPIFile(file) {
    const apiIndicators = ['route', 'controller', 'endpoint', 'api'];
    return apiIndicators.some(indicator => 
      file.path.toLowerCase().includes(indicator) ||
      file.content.includes('router.') ||
      file.content.includes('app.get') ||
      file.content.includes('app.post')
    );
  }

  /**
   * Check if file is an API documentation file
   * @param {Object} file - File to check
   * @returns {boolean} Whether file is an API documentation file
   */
  isAPIDocFile(file) {
    return file.path.toLowerCase().includes('api') && 
           (file.path.endsWith('.md') || file.path.endsWith('.txt'));
  }
}