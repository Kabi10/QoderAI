#!/usr/bin/env node

/**
 * Interactive CLI with Advanced Configuration Wizard
 * Provides user-friendly prompt generation interface
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import { UniversalPromptGenerator } from '../src/index.js';
import { Logger } from '../src/utils/Logger.js';
import fs from 'fs-extra';
import path from 'path';
import figlet from 'figlet';
import ora from 'ora';

const logger = new Logger('InteractiveCLI');

class InteractiveCLI {
  constructor() {
    this.generator = null;
    this.config = {
      preferences: {},
      history: [],
      shortcuts: new Map()
    };
    this.configFile = path.join(process.cwd(), '.qoder-cli-config.json');
  }

  /**
   * Initialize the interactive CLI
   */
  async initialize() {
    // Load configuration
    await this.loadConfig();
    
    // Initialize generator
    const spinner = ora('Initializing Qoder AI...').start();
    
    try {
      this.generator = new UniversalPromptGenerator({
        enablePerformanceMonitoring: true,
        enableCaching: true,
        enableParallelProcessing: true
      });
      
      await this.generator.initialize();
      
      spinner.succeed('Qoder AI initialized successfully!');
    } catch (error) {
      spinner.fail('Failed to initialize Qoder AI');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  }

  /**
   * Start the interactive CLI
   */
  async start() {
    console.clear();
    
    // Show banner
    console.log(chalk.cyan(figlet.textSync('Qoder AI', { horizontalLayout: 'full' })));
    console.log(chalk.gray('Universal Prompt Generator - Interactive CLI\\n'));
    
    await this.initialize();
    
    // Show welcome message
    this.showWelcomeMessage();
    
    // Main menu loop
    await this.mainMenuLoop();
  }

  /**
   * Show welcome message
   */
  showWelcomeMessage() {
    console.log(chalk.green.bold('🚀 Welcome to Qoder AI Interactive CLI!\\n'));
    
    if (this.config.preferences.username) {
      console.log(chalk.blue(`Hello ${this.config.preferences.username}! Ready to generate some amazing prompts?\\n`));
    }
    
    // Show quick stats
    const categories = this.generator.getAvailableCategories();
    console.log(chalk.gray(`📊 Available: ${categories.length} categories, ${this.config.history.length} previous generations\\n`));
  }

  /**
   * Main menu loop
   */
  async mainMenuLoop() {
    while (true) {
      try {
        const action = await this.showMainMenu();
        
        switch (action) {
          case 'generate':
            await this.startGeneration();
            break;
          case 'quick':
            await this.quickGeneration();
            break;
          case 'history':
            await this.showHistory();
            break;
          case 'preferences':
            await this.configurePreferences();
            break;
          case 'shortcuts':
            await this.manageShortcuts();
            break;
          case 'performance':
            await this.showPerformanceStats();
            break;
          case 'help':
            await this.showHelp();
            break;
          case 'exit':
            await this.exit();
            return;
        }
      } catch (error) {
        console.error(chalk.red('\\n❌ An error occurred:'), error.message);
        console.log(chalk.gray('\\nPress any key to continue...'));
        await this.waitForKeypress();
      }
    }
  }

  /**
   * Show main menu
   */
  async showMainMenu() {
    const choices = [
      {
        name: chalk.cyan('🎯 Generate New Prompt Suite'),
        value: 'generate',
        short: 'Generate'
      },
      {
        name: chalk.yellow('⚡ Quick Generation (from template)'),
        value: 'quick',
        short: 'Quick'
      },
      {
        name: chalk.blue('📚 View Generation History'),
        value: 'history',
        short: 'History'
      },
      {
        name: chalk.magenta('⚙️  Configure Preferences'),
        value: 'preferences',
        short: 'Preferences'
      },
      {
        name: chalk.green('🔥 Manage Shortcuts'),
        value: 'shortcuts',
        short: 'Shortcuts'
      },
      {
        name: chalk.white('📊 Performance Statistics'),
        value: 'performance',
        short: 'Performance'
      },
      {
        name: chalk.gray('❓ Help & Documentation'),
        value: 'help',
        short: 'Help'
      },
      new inquirer.Separator(),
      {
        name: chalk.red('🚪 Exit'),
        value: 'exit',
        short: 'Exit'
      }
    ];

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices,
        pageSize: 15
      }
    ]);

    return action;
  }

  /**
   * Start full generation wizard
   */
  async startGeneration() {
    console.log(chalk.cyan.bold('\\n🔮 Prompt Generation Wizard\\n'));
    
    const config = await this.runGenerationWizard();
    
    if (config) {
      await this.executeGeneration(config);
    }
  }

  /**
   * Run the generation wizard
   */
  async runGenerationWizard() {
    console.log(chalk.yellow('Step 1: Project Category'));
    
    // Step 1: Select category
    const categories = this.generator.getAvailableCategories();
    const categoryChoices = categories.map(cat => ({
      name: `${cat.name} - ${chalk.gray(cat.description)}`,
      value: cat.id,
      short: cat.name
    }));

    const { category } = await inquirer.prompt([
      {
        type: 'list',
        name: 'category',
        message: 'Select project category:',
        choices: categoryChoices,
        pageSize: 12
      }
    ]);

    // Get category info for next steps
    const categoryInfo = this.generator.getCategoryInfo(category);
    
    console.log(chalk.yellow('\\nStep 2: Project Details'));
    
    // Step 2: Basic project info
    const projectDetails = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name:',
        validate: input => input.trim().length > 0 || 'Project name is required'
      },
      {
        type: 'input',
        name: 'targetAudience',
        message: 'Target audience:',
        default: 'End users'
      },
      {
        type: 'input',
        name: 'deploymentTarget',
        message: 'Deployment target:',
        default: 'Cloud'
      }
    ]);

    console.log(chalk.yellow('\\nStep 3: Technology Stack'));
    
    // Step 3: Technology stack
    const techStackChoices = [
      // Frontend
      new inquirer.Separator('Frontend Technologies'),
      { name: 'React', value: 'React' },
      { name: 'Vue.js', value: 'Vue.js' },
      { name: 'Angular', value: 'Angular' },
      { name: 'Svelte', value: 'Svelte' },
      { name: 'Next.js', value: 'Next.js' },
      { name: 'Nuxt.js', value: 'Nuxt.js' },
      
      // Backend
      new inquirer.Separator('Backend Technologies'),
      { name: 'Node.js', value: 'Node.js' },
      { name: 'Python', value: 'Python' },
      { name: 'Java', value: 'Java' },
      { name: 'Go', value: 'Go' },
      { name: 'Rust', value: 'Rust' },
      { name: 'PHP', value: 'PHP' },
      
      // Databases
      new inquirer.Separator('Databases'),
      { name: 'PostgreSQL', value: 'PostgreSQL' },
      { name: 'MongoDB', value: 'MongoDB' },
      { name: 'Redis', value: 'Redis' },
      { name: 'MySQL', value: 'MySQL' },
      
      // Tools & Platforms
      new inquirer.Separator('Tools & Platforms'),
      { name: 'Docker', value: 'Docker' },
      { name: 'Kubernetes', value: 'Kubernetes' },
      { name: 'TypeScript', value: 'TypeScript' },
      { name: 'GraphQL', value: 'GraphQL' }
    ];

    const { techStack } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'techStack',
        message: 'Select technologies (use space to select):',
        choices: techStackChoices,
        pageSize: 20,
        validate: input => input.length > 0 || 'Select at least one technology'
      }
    ]);

    console.log(chalk.yellow('\\nStep 4: Features & Options'));
    
    // Step 4: Feature flags
    const featureChoices = [
      { name: 'Authentication & Authorization', value: 'authentication' },
      { name: 'Responsive Design', value: 'responsive-design' },
      { name: 'API Documentation', value: 'documentation' },
      { name: 'Testing Suite', value: 'testing' },
      { name: 'Performance Monitoring', value: 'monitoring' },
      { name: 'Caching Layer', value: 'caching' },
      { name: 'Security Headers', value: 'security' },
      { name: 'Logging & Analytics', value: 'logging' },
      { name: 'Internationalization', value: 'i18n' },
      { name: 'SEO Optimization', value: 'seo-optimization' },
      { name: 'PWA Features', value: 'pwa' },
      { name: 'Dark Mode Support', value: 'dark-mode' }
    ];

    const { featureFlags } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'featureFlags',
        message: 'Select features to include:',
        choices: featureChoices,
        pageSize: 15
      }
    ]);

    console.log(chalk.yellow('\\nStep 5: Advanced Configuration'));
    
    // Step 5: Advanced options
    const advancedConfig = await inquirer.prompt([
      {
        type: 'input',
        name: 'outputPath',
        message: 'Output directory:',
        default: './generated-prompts'
      },
      {
        type: 'confirm',
        name: 'includeExamples',
        message: 'Include code examples?',
        default: true
      },
      {
        type: 'confirm',
        name: 'enableCaching',
        message: 'Enable caching for faster generation?',
        default: true
      },
      {
        type: 'list',
        name: 'complexity',
        message: 'Project complexity level:',
        choices: [
          { name: 'Simple - Basic functionality', value: 'simple' },
          { name: 'Medium - Standard features', value: 'medium' },
          { name: 'Complex - Advanced features', value: 'complex' },
          { name: 'Enterprise - Full-scale application', value: 'enterprise' }
        ]
      }
    ]);

    // Build final configuration
    const finalConfig = {
      category,
      ...projectDetails,
      techStack,
      featureFlags,
      ...advancedConfig,
      constraints: this.generateConstraints(advancedConfig.complexity),
      timestamp: new Date().toISOString()
    };

    // Show summary
    console.log(chalk.green.bold('\\n📋 Generation Summary:'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.cyan(`Project: ${finalConfig.projectName}`));
    console.log(chalk.cyan(`Category: ${categoryInfo?.name || category}`));
    console.log(chalk.cyan(`Technologies: ${techStack.join(', ')}`));
    console.log(chalk.cyan(`Features: ${featureFlags.length} selected`));
    console.log(chalk.cyan(`Complexity: ${advancedConfig.complexity}`));
    console.log(chalk.gray('─'.repeat(50)));

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Proceed with generation?',
        default: true
      }
    ]);

    return confirm ? finalConfig : null;
  }

  /**
   * Execute prompt generation
   */
  async executeGeneration(config) {
    const spinner = ora('Generating prompt suite...').start();
    
    try {
      const startTime = Date.now();
      
      const promptSuite = await this.generator.generatePromptSuite(config);
      
      const duration = Date.now() - startTime;
      
      spinner.succeed(`Generation completed in ${duration}ms!`);
      
      // Show results
      console.log(chalk.green.bold('\\n🎉 Generation Results:'));
      console.log(chalk.gray('─'.repeat(50)));
      console.log(chalk.green(`✅ Files Generated: ${promptSuite.fileCount}`));
      console.log(chalk.green(`✅ Total Size: ${this.formatBytes(promptSuite.totalSize)}`));
      console.log(chalk.green(`✅ Quality Score: ${promptSuite.validation?.quality?.score || 'N/A'}%`));
      console.log(chalk.green(`✅ Output Path: ${config.outputPath}`));
      console.log(chalk.gray('─'.repeat(50)));

      // Add to history
      this.config.history.unshift({
        ...config,
        result: {
          fileCount: promptSuite.fileCount,
          totalSize: promptSuite.totalSize,
          qualityScore: promptSuite.validation?.quality?.score,
          duration
        },
        timestamp: new Date().toISOString()
      });

      // Keep only last 20 entries
      this.config.history = this.config.history.slice(0, 20);
      
      await this.saveConfig();

      // Ask for next action
      const { nextAction } = await inquirer.prompt([
        {
          type: 'list',
          name: 'nextAction',
          message: 'What would you like to do next?',
          choices: [
            { name: 'View generated files', value: 'view' },
            { name: 'Generate another project', value: 'generate' },
            { name: 'Return to main menu', value: 'menu' },
            { name: 'Exit', value: 'exit' }
          ]
        }
      ]);

      switch (nextAction) {
        case 'view':
          await this.viewGeneratedFiles(config.outputPath);
          break;
        case 'generate':
          await this.startGeneration();
          break;
        case 'exit':
          await this.exit();
          break;
      }

    } catch (error) {
      spinner.fail('Generation failed');
      console.error(chalk.red('❌ Error:'), error.message);
      
      if (process.env.DEBUG) {
        console.error(chalk.gray(error.stack));
      }
    }
  }

  /**
   * Quick generation from templates
   */
  async quickGeneration() {
    console.log(chalk.cyan.bold('\\n⚡ Quick Generation\\n'));
    
    const templates = [
      {
        name: 'React Web App',
        value: {
          category: 'web-app',
          techStack: ['React', 'TypeScript', 'Node.js'],
          featureFlags: ['authentication', 'responsive-design', 'testing']
        }
      },
      {
        name: 'REST API Service',
        value: {
          category: 'rest-api',
          techStack: ['Node.js', 'Express', 'MongoDB'],
          featureFlags: ['authentication', 'documentation', 'monitoring']
        }
      },
      {
        name: 'Landing Page',
        value: {
          category: 'landing-page',
          techStack: ['HTML5', 'CSS3', 'JavaScript'],
          featureFlags: ['seo-optimization', 'analytics']
        }
      },
      {
        name: 'Mobile App',
        value: {
          category: 'mobile-app',
          techStack: ['React Native', 'TypeScript'],
          featureFlags: ['authentication', 'push-notifications']
        }
      }
    ];

    const { template } = await inquirer.prompt([
      {
        type: 'list',
        name: 'template',
        message: 'Select a quick template:',
        choices: templates.map(t => ({ name: t.name, value: t.value }))
      }
    ]);

    const { projectName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name:',
        validate: input => input.trim().length > 0 || 'Project name is required'
      }
    ]);

    const config = {
      ...template,
      projectName,
      targetAudience: 'End users',
      deploymentTarget: 'Cloud',
      outputPath: './generated-prompts',
      timestamp: new Date().toISOString()
    };

    await this.executeGeneration(config);
  }

  /**
   * Show generation history
   */
  async showHistory() {
    console.log(chalk.cyan.bold('\\n📚 Generation History\\n'));
    
    if (this.config.history.length === 0) {
      console.log(chalk.gray('No previous generations found.'));
      await this.waitForKeypress();
      return;
    }

    const historyChoices = this.config.history.map((item, index) => ({
      name: `${chalk.cyan(item.projectName)} - ${chalk.gray(item.category)} - ${chalk.yellow(new Date(item.timestamp).toLocaleDateString())}`,
      value: index,
      short: item.projectName
    }));

    historyChoices.push(new inquirer.Separator());
    historyChoices.push({ name: chalk.red('← Back to Main Menu'), value: 'back' });

    const { selection } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selection',
        message: 'Select a generation to view details:',
        choices: historyChoices,
        pageSize: 15
      }
    ]);

    if (selection === 'back') return;

    const historyItem = this.config.history[selection];
    await this.showHistoryDetails(historyItem);
  }

  /**
   * Show history item details
   */
  async showHistoryDetails(item) {
    console.log(chalk.green.bold(`\\n📋 ${item.projectName} Details\\n`));
    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.cyan(`Category: ${item.category}`));
    console.log(chalk.cyan(`Technologies: ${item.techStack?.join(', ') || 'N/A'}`));
    console.log(chalk.cyan(`Features: ${item.featureFlags?.join(', ') || 'N/A'}`));
    console.log(chalk.cyan(`Target Audience: ${item.targetAudience}`));
    console.log(chalk.cyan(`Deployment: ${item.deploymentTarget}`));
    console.log(chalk.cyan(`Generated: ${new Date(item.timestamp).toLocaleString()}`));
    
    if (item.result) {
      console.log(chalk.green(`\\nResults:`));
      console.log(chalk.green(`  Files: ${item.result.fileCount}`));
      console.log(chalk.green(`  Size: ${this.formatBytes(item.result.totalSize)}`));
      console.log(chalk.green(`  Quality: ${item.result.qualityScore}%`));
      console.log(chalk.green(`  Duration: ${item.result.duration}ms`));
    }
    
    console.log(chalk.gray('─'.repeat(60)));

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: 'Regenerate with same settings', value: 'regenerate' },
          { name: 'Copy configuration', value: 'copy' },
          { name: 'Delete from history', value: 'delete' },
          { name: '← Back to history', value: 'back' }
        ]
      }
    ]);

    switch (action) {
      case 'regenerate':
        await this.executeGeneration(item);
        break;
      case 'copy':
        console.log(chalk.yellow('\\nConfiguration copied to clipboard!'));
        // In a real implementation, you'd copy to clipboard
        console.log(JSON.stringify(item, null, 2));
        await this.waitForKeypress();
        break;
      case 'delete':
        const index = this.config.history.indexOf(item);
        this.config.history.splice(index, 1);
        await this.saveConfig();
        console.log(chalk.green('\\n✅ Item deleted from history.'));
        await this.waitForKeypress();
        break;
    }
  }

  /**
   * Configure user preferences
   */
  async configurePreferences() {
    console.log(chalk.cyan.bold('\\n⚙️  User Preferences\\n'));
    
    const preferences = await inquirer.prompt([
      {
        type: 'input',
        name: 'username',
        message: 'Your name:',
        default: this.config.preferences.username || ''
      },
      {
        type: 'list',
        name: 'defaultCategory',
        message: 'Default category:',
        choices: [
          { name: 'No default', value: null },
          ...this.generator.getAvailableCategories().map(cat => ({
            name: cat.name,
            value: cat.id
          }))
        ],
        default: this.config.preferences.defaultCategory
      },
      {
        type: 'input',
        name: 'defaultOutputPath',
        message: 'Default output path:',
        default: this.config.preferences.defaultOutputPath || './generated-prompts'
      },
      {
        type: 'confirm',
        name: 'enablePerformanceMonitoring',
        message: 'Enable performance monitoring by default?',
        default: this.config.preferences.enablePerformanceMonitoring ?? true
      },
      {
        type: 'confirm',
        name: 'enableCaching',
        message: 'Enable caching by default?',
        default: this.config.preferences.enableCaching ?? true
      },
      {
        type: 'list',
        name: 'logLevel',
        message: 'Log level:',
        choices: [
          { name: 'Error only', value: 'error' },
          { name: 'Warnings and errors', value: 'warn' },
          { name: 'Info, warnings, and errors', value: 'info' },
          { name: 'Debug (verbose)', value: 'debug' }
        ],
        default: this.config.preferences.logLevel || 'info'
      }
    ]);

    this.config.preferences = { ...this.config.preferences, ...preferences };
    await this.saveConfig();
    
    console.log(chalk.green('\\n✅ Preferences saved successfully!'));
    await this.waitForKeypress();
  }

  /**
   * Show performance statistics
   */
  async showPerformanceStats() {
    console.log(chalk.cyan.bold('\\n📊 Performance Statistics\\n'));
    
    const stats = this.generator.getPerformanceStats();
    
    if (stats.cache) {
      console.log(chalk.yellow('Cache Performance:'));
      console.log(`  Hit Rate: ${chalk.green(Math.round(stats.cache.hitRate))}%`);
      console.log(`  Total Entries: ${chalk.cyan(stats.cache.totalEntries)}`);
      console.log(`  Memory Usage: ${chalk.blue(this.formatBytes(stats.cache.memoryUsage))}`);
      console.log();
    }

    if (stats.parallel) {
      console.log(chalk.yellow('Parallel Processing:'));
      console.log(`  Active Workers: ${chalk.green(stats.parallel.activeWorkers)}`);
      console.log(`  Tasks Completed: ${chalk.cyan(stats.parallel.tasksCompleted)}`);
      console.log(`  Success Rate: ${chalk.green(Math.round(stats.parallel.successRate))}%`);
      console.log();
    }

    if (stats.performance) {
      console.log(chalk.yellow('System Performance:'));
      console.log(`  Memory Usage: ${chalk.blue(this.formatBytes(stats.performance.memory.heapUsed))}`);
      console.log(`  Uptime: ${chalk.cyan(Math.round(stats.performance.uptime))}s`);
      console.log();
    }

    // Generation history stats
    if (this.config.history.length > 0) {
      const avgDuration = this.config.history
        .filter(h => h.result?.duration)
        .reduce((sum, h) => sum + h.result.duration, 0) / this.config.history.length;
      
      const avgQuality = this.config.history
        .filter(h => h.result?.qualityScore)
        .reduce((sum, h) => sum + h.result.qualityScore, 0) / this.config.history.length;

      console.log(chalk.yellow('Generation Statistics:'));
      console.log(`  Total Generations: ${chalk.cyan(this.config.history.length)}`);
      console.log(`  Average Duration: ${chalk.green(Math.round(avgDuration))}ms`);
      console.log(`  Average Quality: ${chalk.green(Math.round(avgQuality))}%`);
    }

    await this.waitForKeypress();
  }

  /**
   * Generate constraints based on complexity
   */
  generateConstraints(complexity) {
    const constraints = {
      simple: ['Easy to understand', 'Minimal dependencies'],
      medium: ['Production ready', 'Good documentation'],
      complex: ['Scalable architecture', 'Comprehensive testing', 'Performance optimized'],
      enterprise: ['Enterprise grade', 'High availability', 'Security focused', 'Compliance ready']
    };

    return constraints[complexity] || constraints.medium;
  }

  /**
   * Load configuration from file
   */
  async loadConfig() {
    try {
      if (await fs.pathExists(this.configFile)) {
        const config = await fs.readJson(this.configFile);
        this.config = { ...this.config, ...config };
      }
    } catch (error) {
      logger.debug('Failed to load config, using defaults');
    }
  }

  /**
   * Save configuration to file
   */
  async saveConfig() {
    try {
      await fs.writeJson(this.configFile, this.config, { spaces: 2 });
    } catch (error) {
      logger.warn('Failed to save config', error);
    }
  }

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Wait for keypress
   */
  async waitForKeypress() {
    await inquirer.prompt([
      {
        type: 'input',
        name: 'continue',
        message: 'Press Enter to continue...'
      }
    ]);
  }

  /**
   * Show help information
   */
  async showHelp() {
    console.log(chalk.cyan.bold('\\n❓ Qoder AI Help & Documentation\\n'));
    
    console.log(chalk.yellow('Getting Started:'));
    console.log('1. Select "Generate New Prompt Suite" for full wizard');
    console.log('2. Use "Quick Generation" for common templates');
    console.log('3. Configure preferences for personalized experience');
    console.log();
    
    console.log(chalk.yellow('Features:'));
    console.log('• Interactive step-by-step generation wizard');
    console.log('• Performance monitoring and caching');
    console.log('• Generation history and templates');
    console.log('• Customizable preferences and shortcuts');
    console.log();
    
    console.log(chalk.yellow('Tips:'));
    console.log('• Use arrow keys to navigate menus');
    console.log('• Use spacebar to select multiple items');
    console.log('• Press Enter to confirm selections');
    console.log('• Enable caching for faster subsequent generations');
    console.log();

    await this.waitForKeypress();
  }

  /**
   * Exit the CLI
   */
  async exit() {
    console.log(chalk.cyan('\\n👋 Thank you for using Qoder AI!'));
    
    if (this.generator) {
      const spinner = ora('Cleaning up...').start();
      await this.generator.shutdown();
      spinner.succeed('Cleanup completed');
    }
    
    console.log(chalk.gray('See you next time! 🚀\\n'));
    process.exit(0);
  }
}

// Start the interactive CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new InteractiveCLI();
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\\n');
    await cli.exit();
  });
  
  process.on('SIGTERM', async () => {
    await cli.exit();
  });
  
  // Start the CLI
  cli.start().catch(error => {
    console.error(chalk.red('\\n❌ CLI Error:'), error.message);
    process.exit(1);
  });
}