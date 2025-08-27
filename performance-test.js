#!/usr/bin/env node

/**
 * Performance Testing Suite
 * Comprehensive testing and benchmarking of enhanced features
 */

import { UniversalPromptGenerator } from './src/index.js';
import { Logger } from './src/utils/Logger.js';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';

const logger = new Logger('PerformanceTest');

class PerformanceTester {
  constructor() {
    this.results = {
      baseline: {},
      caching: {},
      parallel: {},
      overall: {}
    };
    this.generator = null;
  }

  async initialize() {
    console.log(chalk.blue.bold('\n🧪 Performance Testing Suite\n'));
    
    this.generator = new UniversalPromptGenerator({
      enablePerformanceMonitoring: true,
      enableCaching: true,
      enableParallelProcessing: true,
      cacheOptions: {
        maxSize: 500 * 1024 * 1024, // 500MB for testing
        ttl: 2 * 60 * 60 * 1000, // 2 hours
        persistToDisk: true
      },
      parallelOptions: {
        maxWorkers: 6,
        taskTimeout: 60000,
        enableBatching: true,
        batchSize: 4
      }
    });

    await this.generator.initialize();
    console.log(chalk.green('✅ Performance testing environment initialized\n'));
  }

  async runAllTests() {
    try {
      await this.initialize();

      console.log(chalk.yellow('Running performance test suite...\n'));

      // Test 1: Baseline Performance
      await this.testBaselinePerformance();

      // Test 2: Caching Performance
      await this.testCachingPerformance();

      // Test 3: Parallel Processing Performance
      await this.testParallelPerformance();

      // Test 4: Memory Usage Testing
      await this.testMemoryUsage();

      // Test 5: Stress Testing
      await this.testStressPerformance();

      // Generate comprehensive report
      await this.generateReport();

      await this.generator.shutdown();

      console.log(chalk.green.bold('\n🎉 Performance testing completed successfully!'));

    } catch (error) {
      console.error(chalk.red('Performance testing failed:'), error.message);
      if (process.env.DEBUG) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  }

  async testBaselinePerformance() {
    console.log(chalk.magenta.bold('📊 Test 1: Baseline Performance\n'));

    const testCases = [
      {
        name: 'Small Web App',
        inputs: {
          category: 'web-app',
          projectName: 'Small Test App',
          techStack: ['React'],
          targetAudience: 'Users'
        }
      },
      {
        name: 'Medium REST API',
        inputs: {
          category: 'rest-api',
          projectName: 'Medium API',
          techStack: ['Node.js', 'Express', 'MongoDB'],
          targetAudience: 'Developers',
          featureFlags: ['authentication', 'documentation']
        }
      },
      {
        name: 'Large Microservice',
        inputs: {
          category: 'microservices',
          projectName: 'Large Microservice',
          techStack: ['Node.js', 'Docker', 'Kubernetes', 'Redis'],
          targetAudience: 'Enterprise developers',
          featureFlags: ['monitoring', 'logging', 'metrics', 'alerting', 'tracing']
        }
      }
    ];

    const baselineResults = [];

    for (const testCase of testCases) {
      console.log(chalk.gray(`Testing ${testCase.name}...`));
      
      const startTime = Date.now();
      const startMemory = process.memoryUsage();
      
      const result = await this.generator.generatePromptSuite(testCase.inputs);
      
      const endTime = Date.now();
      const endMemory = process.memoryUsage();
      
      const testResult = {
        name: testCase.name,
        duration: endTime - startTime,
        fileCount: result.fileCount,
        totalSize: result.totalSize,
        qualityScore: result.validation?.quality?.score || 0,
        memoryUsed: endMemory.heapUsed - startMemory.heapUsed,
        rssUsed: endMemory.rss - startMemory.rss
      };
      
      baselineResults.push(testResult);
      
      console.log(chalk.green(`  ✅ ${testCase.name}: ${testResult.duration}ms, ${testResult.fileCount} files, ${this.formatBytes(testResult.totalSize)}`));
    }

    this.results.baseline = {
      testCases: baselineResults,
      averageDuration: baselineResults.reduce((sum, r) => sum + r.duration, 0) / baselineResults.length,
      totalFiles: baselineResults.reduce((sum, r) => sum + r.fileCount, 0),
      averageQuality: baselineResults.reduce((sum, r) => sum + r.qualityScore, 0) / baselineResults.length
    };

    console.log(chalk.cyan(`\nBaseline Summary:`));
    console.log(chalk.gray(`  Average Duration: ${Math.round(this.results.baseline.averageDuration)}ms`));
    console.log(chalk.gray(`  Total Files Generated: ${this.results.baseline.totalFiles}`));
    console.log(chalk.gray(`  Average Quality Score: ${Math.round(this.results.baseline.averageQuality)}%`));
    console.log();
  }

  async testCachingPerformance() {
    console.log(chalk.magenta.bold('🧠 Test 2: Caching Performance\n'));

    const testInput = {
      category: 'landing-page',
      projectName: 'Cache Test Page',
      techStack: ['HTML5', 'CSS3', 'JavaScript'],
      targetAudience: 'Marketing teams',
      featureFlags: ['seo-optimization', 'analytics']
    };

    // Clear cache first
    await this.generator.clearCaches();

    // Cold cache test (first run)
    console.log(chalk.gray('Testing cold cache performance...'));
    const coldStart = Date.now();
    const coldResult = await this.generator.generatePromptSuite(testInput);
    const coldDuration = Date.now() - coldStart;

    // Warm cache test (repeated runs)
    const warmTimes = [];
    console.log(chalk.gray('Testing warm cache performance (5 iterations)...'));
    
    for (let i = 0; i < 5; i++) {
      const warmStart = Date.now();
      await this.generator.generatePromptSuite(testInput);
      const warmDuration = Date.now() - warmStart;
      warmTimes.push(warmDuration);
    }

    const averageWarmTime = warmTimes.reduce((sum, time) => sum + time, 0) / warmTimes.length;
    const cacheSpeedup = coldDuration / averageWarmTime;
    const cacheImprovement = ((coldDuration - averageWarmTime) / coldDuration) * 100;

    this.results.caching = {
      coldDuration,
      averageWarmTime,
      speedup: cacheSpeedup,
      improvement: cacheImprovement,
      warmTimes
    };

    console.log(chalk.cyan(`\nCaching Performance Results:`));
    console.log(chalk.green(`  Cold Cache: ${coldDuration}ms`));
    console.log(chalk.green(`  Warm Cache (avg): ${Math.round(averageWarmTime)}ms`));
    console.log(chalk.green(`  Speedup: ${Math.round(cacheSpeedup * 100) / 100}x`));
    console.log(chalk.green(`  Improvement: ${Math.round(cacheImprovement)}%`));
    console.log();
  }

  async testParallelPerformance() {
    console.log(chalk.magenta.bold('⚡ Test 3: Parallel Processing Performance\n'));

    const parallelInputs = Array.from({ length: 8 }, (_, i) => ({
      category: ['web-app', 'rest-api', 'landing-page', 'mobile-app'][i % 4],
      projectName: `Parallel Test ${i + 1}`,
      techStack: [['React'], ['Node.js', 'Express'], ['HTML5', 'CSS3'], ['React Native']][i % 4],
      targetAudience: 'Test users'
    }));

    // Sequential processing
    console.log(chalk.gray('Testing sequential processing...'));
    const sequentialStart = Date.now();
    const sequentialResults = [];
    
    for (const input of parallelInputs) {
      const result = await this.generator.generatePromptSuite(input);
      sequentialResults.push(result);
    }
    
    const sequentialDuration = Date.now() - sequentialStart;

    // Parallel processing
    console.log(chalk.gray('Testing parallel processing...'));
    const parallelStart = Date.now();
    
    const parallelPromises = parallelInputs.map(input => 
      this.generator.generatePromptSuite(input)
    );
    const parallelResults = await Promise.all(parallelPromises);
    
    const parallelDuration = Date.now() - parallelStart;

    const parallelSpeedup = sequentialDuration / parallelDuration;
    const parallelImprovement = ((sequentialDuration - parallelDuration) / sequentialDuration) * 100;

    this.results.parallel = {
      sequentialDuration,
      parallelDuration,
      speedup: parallelSpeedup,
      improvement: parallelImprovement,
      taskCount: parallelInputs.length,
      totalFilesSequential: sequentialResults.reduce((sum, r) => sum + r.fileCount, 0),
      totalFilesParallel: parallelResults.reduce((sum, r) => sum + r.fileCount, 0)
    };

    console.log(chalk.cyan(`\nParallel Processing Results:`));
    console.log(chalk.green(`  Sequential: ${sequentialDuration}ms`));
    console.log(chalk.green(`  Parallel: ${parallelDuration}ms`));
    console.log(chalk.green(`  Speedup: ${Math.round(parallelSpeedup * 100) / 100}x`));
    console.log(chalk.green(`  Improvement: ${Math.round(parallelImprovement)}%`));
    console.log(chalk.green(`  Tasks Processed: ${parallelInputs.length}`));
    console.log();
  }

  async testMemoryUsage() {
    console.log(chalk.magenta.bold('🧠 Test 4: Memory Usage Analysis\n'));

    const initialMemory = process.memoryUsage();
    console.log(chalk.gray('Testing memory usage patterns...'));

    const memorySnapshots = [initialMemory];
    const testSizes = ['small', 'medium', 'large'];

    for (const size of testSizes) {
      const inputs = {
        small: {
          category: 'web-app',
          projectName: 'Small Memory Test',
          techStack: ['React'],
          targetAudience: 'Users'
        },
        medium: {
          category: 'rest-api',
          projectName: 'Medium Memory Test',
          techStack: ['Node.js', 'Express', 'MongoDB', 'Redis'],
          targetAudience: 'Developers',
          featureFlags: ['authentication', 'caching', 'monitoring']
        },
        large: {
          category: 'microservices',
          projectName: 'Large Memory Test',
          techStack: ['Node.js', 'Docker', 'Kubernetes', 'Redis', 'PostgreSQL'],
          targetAudience: 'Enterprise teams',
          featureFlags: ['monitoring', 'logging', 'metrics', 'alerting', 'tracing', 'security']
        }
      }[size];

      await this.generator.generatePromptSuite(inputs);
      const snapshot = process.memoryUsage();
      memorySnapshots.push(snapshot);
      
      console.log(chalk.gray(`  ${size.charAt(0).toUpperCase() + size.slice(1)} test: ${this.formatBytes(snapshot.heapUsed)} heap, ${this.formatBytes(snapshot.rss)} RSS`));
    }

    const finalMemory = process.memoryUsage();
    const memoryGrowth = finalMemory.heapUsed - initialMemory.heapUsed;
    const rssGrowth = finalMemory.rss - initialMemory.rss;

    this.results.memory = {
      initialMemory,
      finalMemory,
      memoryGrowth,
      rssGrowth,
      snapshots: memorySnapshots
    };

    console.log(chalk.cyan(`\nMemory Usage Analysis:`));
    console.log(chalk.green(`  Initial Heap: ${this.formatBytes(initialMemory.heapUsed)}`));
    console.log(chalk.green(`  Final Heap: ${this.formatBytes(finalMemory.heapUsed)}`));
    console.log(chalk.green(`  Heap Growth: ${this.formatBytes(memoryGrowth)}`));
    console.log(chalk.green(`  RSS Growth: ${this.formatBytes(rssGrowth)}`));
    console.log();
  }

  async testStressPerformance() {
    console.log(chalk.magenta.bold('🔥 Test 5: Stress Testing\n'));

    console.log(chalk.gray('Running stress test with 20 concurrent generations...'));
    
    const stressInputs = Array.from({ length: 20 }, (_, i) => ({
      category: ['web-app', 'rest-api', 'landing-page', 'mobile-app', 'microservices'][i % 5],
      projectName: `Stress Test ${i + 1}`,
      techStack: [['React'], ['Node.js'], ['HTML5'], ['React Native'], ['Docker']][i % 5],
      targetAudience: 'Stress test users'
    }));

    const stressStart = Date.now();
    const startMemory = process.memoryUsage();

    try {
      const stressPromises = stressInputs.map(input => 
        this.generator.generatePromptSuite(input)
      );
      const stressResults = await Promise.all(stressPromises);
      
      const stressDuration = Date.now() - stressStart;
      const endMemory = process.memoryUsage();
      
      const totalFiles = stressResults.reduce((sum, r) => sum + r.fileCount, 0);
      const averageQuality = stressResults.reduce((sum, r) => sum + (r.validation?.quality?.score || 0), 0) / stressResults.length;
      const memoryUsed = endMemory.heapUsed - startMemory.heapUsed;

      this.results.stress = {
        duration: stressDuration,
        taskCount: stressInputs.length,
        totalFiles,
        averageQuality,
        memoryUsed,
        throughput: (stressInputs.length / stressDuration) * 1000, // tasks per second
        success: true
      };

      console.log(chalk.cyan(`\nStress Test Results:`));
      console.log(chalk.green(`  Duration: ${stressDuration}ms`));
      console.log(chalk.green(`  Tasks: ${stressInputs.length}`));
      console.log(chalk.green(`  Total Files: ${totalFiles}`));
      console.log(chalk.green(`  Average Quality: ${Math.round(averageQuality)}%`));
      console.log(chalk.green(`  Memory Used: ${this.formatBytes(memoryUsed)}`));
      console.log(chalk.green(`  Throughput: ${Math.round(this.results.stress.throughput * 100) / 100} tasks/sec`));
      console.log();

    } catch (error) {
      console.log(chalk.red(`❌ Stress test failed: ${error.message}`));
      this.results.stress = {
        success: false,
        error: error.message
      };
    }
  }

  async generateReport() {
    console.log(chalk.magenta.bold('📋 Generating Performance Report\n'));

    const report = {
      timestamp: new Date().toISOString(),
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        cpus: require('os').cpus().length,
        totalMemory: require('os').totalmem(),
        freeMemory: require('os').freemem()
      },
      results: this.results,
      summary: {
        overallPerformance: this.calculateOverallPerformance(),
        recommendations: this.generateRecommendations()
      }
    };

    // Save detailed report
    await fs.ensureDir('./performance-reports');
    const reportPath = `./performance-reports/performance-report-${Date.now()}.json`;
    await fs.writeJson(reportPath, report, { spaces: 2 });

    // Display summary
    this.displayReportSummary(report);

    console.log(chalk.blue(`📄 Detailed report saved: ${reportPath}`));
  }

  calculateOverallPerformance() {
    let score = 100;
    const issues = [];

    // Baseline performance check
    if (this.results.baseline?.averageDuration > 10000) {
      score -= 20;
      issues.push('Slow baseline performance');
    }

    // Caching effectiveness check
    if (this.results.caching?.speedup < 2) {
      score -= 15;
      issues.push('Low caching effectiveness');
    }

    // Parallel processing check
    if (this.results.parallel?.speedup < 1.5) {
      score -= 10;
      issues.push('Limited parallel processing benefit');
    }

    // Memory usage check
    if (this.results.memory?.memoryGrowth > 200 * 1024 * 1024) { // 200MB
      score -= 15;
      issues.push('High memory usage');
    }

    // Stress test check
    if (!this.results.stress?.success) {
      score -= 20;
      issues.push('Failed stress test');
    } else if (this.results.stress?.throughput < 0.5) {
      score -= 10;
      issues.push('Low throughput under stress');
    }

    let rating;
    if (score >= 90) rating = 'excellent';
    else if (score >= 75) rating = 'good';
    else if (score >= 60) rating = 'average';
    else rating = 'poor';

    return { score: Math.max(0, score), rating, issues };
  }

  generateRecommendations() {
    const recommendations = [];

    if (this.results.baseline?.averageDuration > 5000) {
      recommendations.push('Consider optimizing template rendering for better baseline performance');
    }

    if (this.results.caching?.speedup < 3) {
      recommendations.push('Increase cache TTL or size for better caching effectiveness');
    }

    if (this.results.parallel?.speedup < 2) {
      recommendations.push('Optimize parallel processing batch sizes or worker count');
    }

    if (this.results.memory?.memoryGrowth > 100 * 1024 * 1024) {
      recommendations.push('Implement memory optimization strategies to reduce memory growth');
    }

    if (this.results.stress?.throughput < 1) {
      recommendations.push('Improve system throughput for better stress test performance');
    }

    return recommendations;
  }

  displayReportSummary(report) {
    console.log(chalk.cyan.bold('📊 Performance Report Summary:\n'));

    const summary = report.summary;
    const perf = summary.overallPerformance;

    console.log(chalk.green(`Overall Performance Score: ${perf.score}/100 (${perf.rating.toUpperCase()})`));
    
    if (perf.issues.length > 0) {
      console.log(chalk.yellow('\nIssues Identified:'));
      perf.issues.forEach(issue => {
        console.log(chalk.red(`  ❌ ${issue}`));
      });
    }

    if (summary.recommendations.length > 0) {
      console.log(chalk.yellow('\nRecommendations:'));
      summary.recommendations.forEach(rec => {
        console.log(chalk.blue(`  💡 ${rec}`));
      });
    }

    console.log(chalk.cyan('\nKey Metrics:'));
    if (this.results.baseline) {
      console.log(chalk.gray(`  Average Generation Time: ${Math.round(this.results.baseline.averageDuration)}ms`));
    }
    if (this.results.caching) {
      console.log(chalk.gray(`  Cache Speedup: ${Math.round(this.results.caching.speedup * 100) / 100}x`));
    }
    if (this.results.parallel) {
      console.log(chalk.gray(`  Parallel Speedup: ${Math.round(this.results.parallel.speedup * 100) / 100}x`));
    }
    if (this.results.stress) {
      console.log(chalk.gray(`  Stress Test Throughput: ${Math.round((this.results.stress.throughput || 0) * 100) / 100} tasks/sec`));
    }
    
    console.log();
  }

  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}

// Run performance tests
const tester = new PerformanceTester();
tester.runAllTests();