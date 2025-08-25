#!/usr/bin/env node

/**
 * CLI Interface for Qoder AI Universal Prompt Generator
 * Provides command-line access to the prompt generation system
 */

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { UniversalPromptGenerator } from './index.js';
import { Logger } from './utils/Logger.js';

const program = new Command();
const logger = new Logger('CLI');

// Initialize the prompt generator
let generator;

async function initializeGenerator() {
  if (!generator) {
    generator = new UniversalPromptGenerator();
    await generator.initialize();
  }
  return generator;
}

// Configure CLI program
program
  .name('qoder-ai')
  .description('Qoder AI Universal Prompt Generator')
  .version('1.0.0');

// Generate command
program
  .command('generate')
  .alias('gen')
  .description('Generate a prompt suite for a specific category')
  .option('-c, --category <category>', 'Product category')
  .option('-n, --name <name>', 'Project name')
  .option('-t, --tech-stack <stack>', 'Technology stack (comma-separated)')
  .option('-a, --audience <audience>', 'Target audience')
  .option('-d, --deployment <target>', 'Deployment target')
  .option('-o, --output <path>', 'Output path', './generated')
  .option('--constraints <constraints>', 'Project constraints (comma-separated)')
  .option('--features <features>', 'Feature flags (comma-separated)')
  .option('--interactive', 'Use interactive mode')
  .action(async (options) => {
    try {
      const spinner = ora('Initializing prompt generator...').start();
      const gen = await initializeGenerator();
      spinner.succeed('Generator initialized');

      let inputs;

      if (options.interactive || !options.category || !options.name) {
        inputs = await runInteractiveMode(gen, options);
      } else {
        inputs = parseCommandLineOptions(options);
      }

      // Validate inputs
      if (!inputs.category || !inputs.projectName) {
        console.error(chalk.red('Error: Category and project name are required'));
        process.exit(1);
      }

      // Generate prompt suite
      const generateSpinner = ora('Generating prompt suite...').start();
      const promptSuite = await gen.generatePromptSuite(inputs);
      generateSpinner.succeed('Prompt suite generated successfully');

      // Display results
      displayResults(promptSuite, inputs);

    } catch (error) {
      console.error(chalk.red('Generation failed:'), error.message);
      if (process.env.DEBUG) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

// List categories command
program
  .command('list-categories')
  .alias('list')
  .description('List all available categories')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    try {
      const spinner = ora('Loading categories...').start();
      const gen = await initializeGenerator();
      const categories = gen.getAvailableCategories();
      spinner.stop();

      if (options.json) {
        console.log(JSON.stringify(categories, null, 2));
      } else {
        displayCategories(categories);
      }

    } catch (error) {
      console.error(chalk.red('Failed to list categories:'), error.message);
      process.exit(1);
    }
  });

// Category info command
program
  .command('info <category>')
  .description('Get detailed information about a category')
  .option('--json', 'Output as JSON')
  .action(async (category, options) => {
    try {
      const spinner = ora(`Loading information for ${category}...`).start();
      const gen = await initializeGenerator();
      const categoryInfo = gen.getCategoryInfo(category);
      spinner.stop();

      if (!categoryInfo) {
        console.error(chalk.red(`Category not found: ${category}`));
        process.exit(1);
      }

      if (options.json) {
        console.log(JSON.stringify(categoryInfo, null, 2));
      } else {
        displayCategoryInfo(categoryInfo);
      }

    } catch (error) {
      console.error(chalk.red('Failed to get category info:'), error.message);
      process.exit(1);
    }
  });

// Validate command
program
  .command('validate <path>')
  .description('Validate a generated prompt suite')
  .option('--json', 'Output as JSON')
  .action(async (path, options) => {
    try {
      const spinner = ora(`Validating ${path}...`).start();
      const gen = await initializeGenerator();
      const validation = await gen.validateGeneratedSuite(path);
      spinner.stop();

      if (options.json) {
        console.log(JSON.stringify(validation, null, 2));
      } else {
        displayValidationResults(validation);
      }

    } catch (error) {
      console.error(chalk.red('Validation failed:'), error.message);
      process.exit(1);
    }
  });

// Interactive mode
async function runInteractiveMode(generator, initialOptions = {}) {
  console.log(chalk.blue.bold('\n🚀 Qoder AI Universal Prompt Generator - Interactive Mode\n'));

  const categories = generator.getAvailableCategories();
  const categoryChoices = categories.map(cat => ({
    name: `${cat.name} - ${cat.description}`,
    value: cat.id
  }));

  const questions = [
    {
      type: 'list',
      name: 'category',
      message: 'Select a product category:',
      choices: categoryChoices,
      default: initialOptions.category
    },
    {
      type: 'input',
      name: 'projectName',
      message: 'Enter project name:',
      default: initialOptions.name,
      validate: (input) => input.trim().length > 0 || 'Project name is required'
    },
    {
      type: 'input',
      name: 'techStack',
      message: 'Enter technology stack (comma-separated):',
      default: initialOptions.techStack,
      filter: (input) => input.split(',').map(s => s.trim()).filter(s => s.length > 0)
    },
    {
      type: 'input',
      name: 'targetAudience',
      message: 'Describe your target audience:',
      default: initialOptions.audience || 'General users'
    },
    {
      type: 'input',
      name: 'deploymentTarget',
      message: 'Enter deployment target:',
      default: initialOptions.deployment || 'Web'
    },
    {
      type: 'input',
      name: 'outputPath',
      message: 'Enter output path:',
      default: initialOptions.output || './generated'
    },
    {
      type: 'checkbox',
      name: 'featureFlags',
      message: 'Select optional features:',
      choices: [
        { name: 'Authentication', value: 'auth' },
        { name: 'Database Integration', value: 'database' },
        { name: 'API Documentation', value: 'api-docs' },
        { name: 'Testing Setup', value: 'testing' },
        { name: 'CI/CD Pipeline', value: 'cicd' },
        { name: 'Docker Configuration', value: 'docker' },
        { name: 'Monitoring/Analytics', value: 'monitoring' }
      ]
    },
    {
      type: 'input',
      name: 'constraints',
      message: 'Enter any constraints or requirements (comma-separated):',
      default: initialOptions.constraints,
      filter: (input) => input ? input.split(',').map(s => s.trim()).filter(s => s.length > 0) : []
    }
  ];

  const answers = await inquirer.prompt(questions);

  // Show summary
  console.log(chalk.green.bold('\n📋 Generation Summary:'));
  console.log(chalk.gray('Category:'), chalk.white(answers.category));
  console.log(chalk.gray('Project:'), chalk.white(answers.projectName));
  console.log(chalk.gray('Tech Stack:'), chalk.white(answers.techStack.join(', ') || 'Not specified'));
  console.log(chalk.gray('Target Audience:'), chalk.white(answers.targetAudience));
  console.log(chalk.gray('Deployment:'), chalk.white(answers.deploymentTarget));
  console.log(chalk.gray('Output Path:'), chalk.white(answers.outputPath));
  if (answers.featureFlags.length > 0) {
    console.log(chalk.gray('Features:'), chalk.white(answers.featureFlags.join(', ')));
  }
  if (answers.constraints.length > 0) {
    console.log(chalk.gray('Constraints:'), chalk.white(answers.constraints.join(', ')));
  }

  const { proceed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'proceed',
      message: 'Proceed with generation?',
      default: true
    }
  ]);

  if (!proceed) {
    console.log(chalk.yellow('Generation cancelled'));
    process.exit(0);
  }

  return answers;
}

// Parse command line options into inputs object
function parseCommandLineOptions(options) {
  return {
    category: options.category,
    projectName: options.name,
    techStack: options.techStack ? options.techStack.split(',').map(s => s.trim()) : [],
    targetAudience: options.audience || 'General users',
    deploymentTarget: options.deployment || 'Web',
    outputPath: options.output || './generated',
    constraints: options.constraints ? options.constraints.split(',').map(s => s.trim()) : [],
    featureFlags: options.features ? options.features.split(',').map(s => s.trim()) : []
  };
}

// Display generation results
function displayResults(promptSuite, inputs) {
  console.log(chalk.green.bold('\n✅ Generation Complete!\n'));
  
  console.log(chalk.blue('📊 Summary:'));
  console.log(`  Files Generated: ${chalk.white(promptSuite.fileCount)}`);
  console.log(`  Total Size: ${chalk.white(formatBytes(promptSuite.totalSize))}`);
  console.log(`  Output Path: ${chalk.white(inputs.outputPath)}`);
  
  if (promptSuite.files) {
    console.log(chalk.blue('\n📁 File Structure:'));
    for (const [dir, info] of Object.entries(promptSuite.files)) {
      console.log(`  ${chalk.cyan(dir)}/`);
      if (info.files) {
        info.files.slice(0, 5).forEach(file => {
          console.log(`    ${chalk.gray('├─')} ${file.path}`);
        });
        if (info.files.length > 5) {
          console.log(`    ${chalk.gray('└─')} ... and ${info.files.length - 5} more files`);
        }
      }
    }
  }

  console.log(chalk.blue('\n🚀 Next Steps:'));
  console.log(`  1. Navigate to: ${chalk.white(`cd ${inputs.outputPath}`)}`);
  console.log(`  2. Read the usage guide: ${chalk.white('cat USAGE.md')}`);
  console.log(`  3. Install dependencies and start developing!`);
  
  if (promptSuite.usageInstructions?.setup?.dependencies?.npm) {
    console.log(`  4. Install dependencies: ${chalk.white(promptSuite.usageInstructions.setup.dependencies.npm)}`);
  }
}

// Display available categories
function displayCategories(categories) {
  console.log(chalk.blue.bold('\n📋 Available Categories:\n'));
  
  categories.forEach(category => {
    console.log(chalk.cyan.bold(category.name));
    console.log(chalk.gray(`  ID: ${category.id}`));
    console.log(chalk.gray(`  ${category.description}`));
    if (category.subcategories && category.subcategories.length > 0) {
      console.log(chalk.gray(`  Subcategories: ${category.subcategories.join(', ')}`));
    }
    console.log();
  });
}

// Display category information
function displayCategoryInfo(categoryInfo) {
  console.log(chalk.blue.bold(`\n📋 Category: ${categoryInfo.name}\n`));
  
  console.log(chalk.gray('Description:'), categoryInfo.description);
  console.log(chalk.gray('ID:'), categoryInfo.id);
  
  if (categoryInfo.subcategories) {
    console.log(chalk.gray('Subcategories:'), categoryInfo.subcategories.join(', '));
  }
  
  if (categoryInfo.outputStructure) {
    console.log(chalk.blue('\n📁 Output Structure:'));
    for (const [dir, desc] of Object.entries(categoryInfo.outputStructure)) {
      console.log(`  ${chalk.cyan(dir)}/`);
      console.log(`    ${chalk.gray(desc)}`);
    }
  }
}

// Display validation results
function displayValidationResults(validation) {
  console.log(chalk.blue.bold('\n🔍 Validation Results:\n'));
  
  if (validation.valid) {
    console.log(chalk.green('✅ Validation passed'));
  } else {
    console.log(chalk.red('❌ Validation failed'));
    if (validation.errors && validation.errors.length > 0) {
      console.log(chalk.red('\nErrors:'));
      validation.errors.forEach(error => {
        console.log(chalk.red(`  • ${error}`));
      });
    }
  }
  
  if (validation.warnings && validation.warnings.length > 0) {
    console.log(chalk.yellow('\nWarnings:'));
    validation.warnings.forEach(warning => {
      console.log(chalk.yellow(`  • ${warning}`));
    });
  }
}

// Utility function to format bytes
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Error handling
process.on('unhandledRejection', (error) => {
  console.error(chalk.red('Unhandled promise rejection:'), error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error(chalk.red('Uncaught exception:'), error);
  process.exit(1);
});

// Parse command line arguments
program.parse();