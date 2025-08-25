#!/usr/bin/env node

/**
 * Universal Prompt Generator Demo
 * Demonstrates AI prompt generation capabilities with example scenarios
 */

import { UniversalPromptGenerator } from './src/index.js';
import { Logger } from './src/utils/Logger.js';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';

const logger = new Logger('Demo');

async function runDemo() {
  console.log(chalk.blue.bold('\n🤖 Universal Prompt Generator Demo - AI Prompt Creation\n'));

  try {
    // Initialize the generator
    console.log(chalk.yellow('Initializing generator...'));
    const generator = new UniversalPromptGenerator();
    await generator.initialize();
    console.log(chalk.green('✅ Generator initialized successfully\n'));

    // Show available categories
    console.log(chalk.cyan.bold('📋 Available Categories:'));
    const categories = generator.getAvailableCategories();
    categories.forEach(cat => {
      console.log(chalk.cyan(`  • ${cat.name} (${cat.id})`));
      console.log(chalk.gray(`    ${cat.description}`));
    });
    console.log();

    // Demo 1: React Web Application
    await demoReactApp(generator);

    // Demo 2: REST API
    await demoRestAPI(generator);

    // Demo 3: Landing Page
    await demoLandingPage(generator);

    console.log(chalk.green.bold('\n🎉 Demo completed successfully!'));
    console.log(chalk.blue('Check the ./prompts/ directory to see generated AI prompt files.'));

  } catch (error) {
    console.error(chalk.red('Demo failed:'), error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

async function demoReactApp(generator) {
  console.log(chalk.magenta.bold('📱 Demo 1: React Web Application\n'));

  const inputs = {
    category: 'web-app',
    projectName: 'TaskMaster Pro',
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    targetAudience: 'Project managers and team leads',
    deploymentTarget: 'Vercel',
    outputPath: './prompts/react-app',
    featureFlags: ['routing', 'state-management', 'testing', 'auth'],
    constraints: ['Mobile-first design', 'WCAG accessibility compliance'],
    stylePreferences: {
      theme: 'modern',
      colorScheme: 'blue'
    },
    performanceTargets: {
      loadTime: '< 3 seconds',
      lighthouse: '> 90'
    }
  };

  console.log(chalk.gray('Generating React application with:'));
  console.log(chalk.gray(`  Project: ${inputs.projectName}`));
  console.log(chalk.gray(`  Tech Stack: ${inputs.techStack.join(', ')}`));
  console.log(chalk.gray(`  Features: ${inputs.featureFlags.join(', ')}`));

  const startTime = Date.now();
  const promptSuite = await generator.generatePromptSuite(inputs);
  const duration = Date.now() - startTime;

  console.log(chalk.green(`✅ Generated in ${duration}ms`));
  console.log(chalk.green(`   Files: ${promptSuite.fileCount}`));
  console.log(chalk.green(`   Size: ${formatBytes(promptSuite.totalSize)}`));
  
  // Save demonstration output
  await saveDemo('react-app', promptSuite, inputs);
  console.log();
}

async function demoRestAPI(generator) {
  console.log(chalk.magenta.bold('🔌 Demo 2: REST API Service\n'));

  const inputs = {
    category: 'rest-api',
    projectName: 'UserHub API',
    techStack: ['Node.js', 'Express', 'MongoDB', 'Redis'],
    targetAudience: 'Frontend developers and mobile app teams',
    deploymentTarget: 'AWS ECS',
    outputPath: './prompts/rest-api',
    featureFlags: ['authentication', 'rate-limiting', 'monitoring', 'documentation'],
    constraints: ['RESTful design', 'OpenAPI specification', 'JWT authentication'],
    performanceTargets: {
      responseTime: '< 200ms',
      throughput: '> 1000 RPS'
    },
    complianceRequirements: ['GDPR', 'SOC2']
  };

  console.log(chalk.gray('Generating REST API with:'));
  console.log(chalk.gray(`  Project: ${inputs.projectName}`));
  console.log(chalk.gray(`  Tech Stack: ${inputs.techStack.join(', ')}`));
  console.log(chalk.gray(`  Features: ${inputs.featureFlags.join(', ')}`));

  const startTime = Date.now();
  const promptSuite = await generator.generatePromptSuite(inputs);
  const duration = Date.now() - startTime;

  console.log(chalk.green(`✅ Generated in ${duration}ms`));
  console.log(chalk.green(`   Files: ${promptSuite.fileCount}`));
  console.log(chalk.green(`   Size: ${formatBytes(promptSuite.totalSize)}`));

  await saveDemo('rest-api', promptSuite, inputs);
  console.log();
}

async function demoLandingPage(generator) {
  console.log(chalk.magenta.bold('🌐 Demo 3: Marketing Landing Page\n'));

  const inputs = {
    category: 'websites', // Use the main category
    projectName: 'SaaS Launch Pro',
    techStack: ['HTML5', 'CSS3', 'JavaScript', 'Tailwind CSS'],
    targetAudience: 'SaaS entrepreneurs and startup founders',
    deploymentTarget: 'Netlify',
    outputPath: './prompts/landing-page',
    featureFlags: ['analytics', 'seo-optimization', 'contact-form', 'newsletter'],
    constraints: ['Fast loading', 'SEO optimized', 'Conversion focused'],
    stylePreferences: {
      style: 'modern',
      layout: 'hero-centered'
    },
    performanceTargets: {
      pageSpeed: '> 95',
      conversionRate: '> 5%'
    }
  };

  console.log(chalk.gray('Generating landing page with:'));
  console.log(chalk.gray(`  Project: ${inputs.projectName}`));
  console.log(chalk.gray(`  Tech Stack: ${inputs.techStack.join(', ')}`));
  console.log(chalk.gray(`  Features: ${inputs.featureFlags.join(', ')}`));

  const startTime = Date.now();
  const promptSuite = await generator.generatePromptSuite(inputs);
  const duration = Date.now() - startTime;

  console.log(chalk.green(`✅ Generated in ${duration}ms`));
  console.log(chalk.green(`   Files: ${promptSuite.fileCount}`));
  console.log(chalk.green(`   Size: ${formatBytes(promptSuite.totalSize)}`));

  await saveDemo('landing-page', promptSuite, inputs);
  console.log();
}

async function saveDemo(demoName, promptSuite, inputs) {
  const demoDir = `./prompts/${demoName}`;
  await fs.ensureDir(demoDir);

  // Save a summary of what was generated
  const summary = {
    demo: demoName,
    inputs,
    results: {
      fileCount: promptSuite.fileCount,
      totalSize: promptSuite.totalSize,
      generatedAt: new Date().toISOString()
    },
    files: {}
  };

  // Organize file information
  for (const [dir, dirInfo] of Object.entries(promptSuite.files)) {
    summary.files[dir] = {
      description: dirInfo.description,
      fileCount: dirInfo.files ? dirInfo.files.length : 0,
      files: dirInfo.files ? dirInfo.files.map(f => ({
        path: f.path,
        size: f.size,
        template: f.templateId
      })) : []
    };
  }

  // Save summary
  await fs.writeFile(
    path.join(demoDir, 'demo-summary.json'),
    JSON.stringify(summary, null, 2)
  );

  // Save a few sample files for inspection
  if (promptSuite.files) {
    let sampleCount = 0;
    for (const dirInfo of Object.values(promptSuite.files)) {
      if (dirInfo.files && sampleCount < 3) {
        for (const file of dirInfo.files.slice(0, 2)) {
          const fileName = file.path.replace(/[/\\]/g, '-');
          await fs.writeFile(
            path.join(demoDir, `sample-${fileName}`),
            file.content
          );
          sampleCount++;
          if (sampleCount >= 3) break;
        }
      }
    }
  }
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Handle CLI arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(chalk.blue.bold('Universal Prompt Generator Demo\n'));
  console.log('Usage: node demo.js [options]\n');
  console.log('Options:');
  console.log('  --help, -h     Show this help message');
  console.log('  --debug        Enable debug output');
  console.log('\nThis demo will generate example projects in ./demo-output/');
  process.exit(0);
}

if (args.includes('--debug')) {
  process.env.DEBUG = 'true';
  process.env.LOG_LEVEL = 'debug';
}

// Run the demo
runDemo();