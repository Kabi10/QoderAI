/**
 * Performance Monitor
 * Advanced performance tracking and benchmarking system
 */

import { Logger } from '../utils/Logger.js';
import fs from 'fs-extra';
import path from 'path';

export class PerformanceMonitor {
  constructor() {
    this.logger = new Logger('PerformanceMonitor');
    this.metrics = new Map();
    this.sessions = new Map();
    this.benchmarks = {
      generation: {
        fast: 2000,     // < 2s is fast
        average: 5000,  // < 5s is average
        slow: 10000     // > 10s is slow
      },
      validation: {
        fast: 500,      // < 0.5s is fast
        average: 1000,  // < 1s is average
        slow: 2000      // > 2s is slow
      },
      template: {
        fast: 100,      // < 0.1s is fast
        average: 300,   // < 0.3s is average
        slow: 500       // > 0.5s is slow
      }
    };
  }

  /**
   * Start performance tracking session
   * @param {string} sessionId - Unique session identifier
   * @param {Object} context - Session context information
   */
  startSession(sessionId, context = {}) {
    const session = {
      id: sessionId,
      context,
      startTime: Date.now(),
      startMemory: process.memoryUsage(),
      phases: new Map(),
      operations: [],
      errors: []
    };

    this.sessions.set(sessionId, session);
    this.logger.debug(`Performance session started: ${sessionId}`, context);
    
    return session;
  }

  /**
   * Start tracking a specific operation
   * @param {string} sessionId - Session identifier
   * @param {string} operation - Operation name
   * @param {Object} metadata - Operation metadata
   */
  startOperation(sessionId, operation, metadata = {}) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      this.logger.warn(`Session not found: ${sessionId}`);
      return null;
    }

    const operationData = {
      name: operation,
      startTime: Date.now(),
      startMemory: process.memoryUsage(),
      metadata,
      duration: null,
      memoryDelta: null,
      status: 'running'
    };

    session.operations.push(operationData);
    this.logger.debug(`Operation started: ${operation}`, { sessionId, metadata });
    
    return operationData;
  }

  /**
   * End tracking of a specific operation
   * @param {string} sessionId - Session identifier
   * @param {string} operation - Operation name
   * @param {Object} result - Operation result data
   */
  endOperation(sessionId, operation, result = {}) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      this.logger.warn(`Session not found: ${sessionId}`);
      return null;
    }

    // Find the most recent running operation with this name
    const operationData = [...session.operations]
      .reverse()
      .find(op => op.name === operation && op.status === 'running');

    if (!operationData) {
      this.logger.warn(`Operation not found: ${operation}`, { sessionId });
      return null;
    }

    const endTime = Date.now();
    const endMemory = process.memoryUsage();

    operationData.duration = endTime - operationData.startTime;
    operationData.memoryDelta = {
      rss: endMemory.rss - operationData.startMemory.rss,
      heapUsed: endMemory.heapUsed - operationData.startMemory.heapUsed,
      external: endMemory.external - operationData.startMemory.external
    };
    operationData.status = 'completed';
    operationData.result = result;

    // Performance assessment
    operationData.performance = this.assessOperationPerformance(operation, operationData.duration);

    this.logger.debug(`Operation completed: ${operation}`, {
      sessionId,
      duration: operationData.duration,
      performance: operationData.performance
    });

    return operationData;
  }

  /**
   * Record an error during operation
   * @param {string} sessionId - Session identifier
   * @param {string} operation - Operation name
   * @param {Error} error - Error object
   */
  recordError(sessionId, operation, error) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      this.logger.warn(`Session not found: ${sessionId}`);
      return;
    }

    const errorData = {
      operation,
      timestamp: Date.now(),
      message: error.message,
      stack: error.stack,
      type: error.constructor.name
    };

    session.errors.push(errorData);
    this.logger.warn(`Operation error: ${operation}`, { sessionId, error: errorData });
  }

  /**
   * End performance tracking session
   * @param {string} sessionId - Session identifier
   * @returns {Object} Complete session metrics
   */
  endSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      this.logger.warn(`Session not found: ${sessionId}`);
      return null;
    }

    const endTime = Date.now();
    const endMemory = process.memoryUsage();

    session.endTime = endTime;
    session.endMemory = endMemory;
    session.totalDuration = endTime - session.startTime;
    session.totalMemoryDelta = {
      rss: endMemory.rss - session.startMemory.rss,
      heapUsed: endMemory.heapUsed - session.startMemory.heapUsed,
      external: endMemory.external - session.startMemory.external
    };

    // Calculate session statistics
    session.statistics = this.calculateSessionStatistics(session);
    
    // Performance assessment
    session.performance = this.assessSessionPerformance(session);

    // Store session metrics
    this.storeSessionMetrics(session);

    // Remove from active sessions
    this.sessions.delete(sessionId);

    this.logger.info(`Performance session completed: ${sessionId}`, {
      duration: session.totalDuration,
      operations: session.operations.length,
      errors: session.errors.length,
      performance: session.performance
    });

    return session;
  }

  /**
   * Assess operation performance
   * @param {string} operation - Operation name
   * @param {number} duration - Operation duration in ms
   * @returns {string} Performance rating
   */
  assessOperationPerformance(operation, duration) {
    const category = this.getOperationCategory(operation);
    const benchmarks = this.benchmarks[category] || this.benchmarks.generation;

    if (duration < benchmarks.fast) return 'excellent';
    if (duration < benchmarks.average) return 'good';
    if (duration < benchmarks.slow) return 'average';
    return 'poor';
  }

  /**
   * Get operation category for benchmarking
   * @param {string} operation - Operation name
   * @returns {string} Category name
   */
  getOperationCategory(operation) {
    if (operation.includes('template') || operation.includes('render')) return 'template';
    if (operation.includes('validate') || operation.includes('validation')) return 'validation';
    return 'generation';
  }

  /**
   * Calculate comprehensive session statistics
   * @param {Object} session - Session data
   * @returns {Object} Session statistics
   */
  calculateSessionStatistics(session) {
    const operations = session.operations.filter(op => op.status === 'completed');
    
    if (operations.length === 0) {
      return { operations: 0, averageDuration: 0, totalDuration: session.totalDuration };
    }

    const durations = operations.map(op => op.duration);
    const memoryDeltas = operations.map(op => op.memoryDelta.heapUsed);

    return {
      operations: operations.length,
      totalDuration: session.totalDuration,
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      averageMemoryDelta: memoryDeltas.reduce((a, b) => a + b, 0) / memoryDeltas.length,
      maxMemoryDelta: Math.max(...memoryDeltas),
      errorRate: session.errors.length / operations.length,
      performanceDistribution: this.calculatePerformanceDistribution(operations)
    };
  }

  /**
   * Calculate performance distribution
   * @param {Array} operations - Completed operations
   * @returns {Object} Performance distribution
   */
  calculatePerformanceDistribution(operations) {
    const distribution = { excellent: 0, good: 0, average: 0, poor: 0 };
    
    operations.forEach(op => {
      if (op.performance) {
        distribution[op.performance]++;
      }
    });

    const total = operations.length;
    return {
      excellent: (distribution.excellent / total) * 100,
      good: (distribution.good / total) * 100,
      average: (distribution.average / total) * 100,
      poor: (distribution.poor / total) * 100
    };
  }

  /**
   * Assess overall session performance
   * @param {Object} session - Session data
   * @returns {Object} Performance assessment
   */
  assessSessionPerformance(session) {
    const stats = session.statistics;
    
    let score = 100;
    let rating = 'excellent';
    const issues = [];

    // Duration assessment
    if (session.totalDuration > this.benchmarks.generation.slow) {
      score -= 30;
      rating = 'poor';
      issues.push('Generation time exceeds recommended limits');
    } else if (session.totalDuration > this.benchmarks.generation.average) {
      score -= 15;
      if (rating === 'excellent') rating = 'good';
      issues.push('Generation time above average');
    }

    // Memory assessment
    if (session.totalMemoryDelta.heapUsed > 100 * 1024 * 1024) { // 100MB
      score -= 20;
      if (rating !== 'poor') rating = 'average';
      issues.push('High memory usage detected');
    }

    // Error rate assessment
    if (stats.errorRate > 0.1) { // More than 10% error rate
      score -= 25;
      rating = 'poor';
      issues.push('High error rate detected');
    } else if (stats.errorRate > 0.05) { // More than 5% error rate
      score -= 10;
      if (rating === 'excellent') rating = 'good';
      issues.push('Elevated error rate');
    }

    // Performance distribution assessment
    if (stats.performanceDistribution.poor > 20) {
      score -= 15;
      if (rating !== 'poor') rating = 'average';
      issues.push('Multiple slow operations detected');
    }

    return {
      score: Math.max(0, score),
      rating,
      issues,
      recommendations: this.generateRecommendations(session, issues)
    };
  }

  /**
   * Generate performance recommendations
   * @param {Object} session - Session data
   * @param {Array} issues - Identified issues
   * @returns {Array} Recommendations
   */
  generateRecommendations(session, issues) {
    const recommendations = [];

    if (session.totalDuration > this.benchmarks.generation.average) {
      recommendations.push('Consider enabling caching for template rendering');
      recommendations.push('Implement parallel processing for file operations');
    }

    if (session.totalMemoryDelta.heapUsed > 50 * 1024 * 1024) {
      recommendations.push('Optimize memory usage in template processing');
      recommendations.push('Implement streaming for large file operations');
    }

    if (session.statistics.errorRate > 0) {
      recommendations.push('Review error handling and input validation');
      recommendations.push('Add retry mechanisms for transient failures');
    }

    const slowOperations = session.operations.filter(op => op.performance === 'poor');
    if (slowOperations.length > 0) {
      const operationTypes = [...new Set(slowOperations.map(op => op.name))];
      recommendations.push(`Optimize slow operations: ${operationTypes.join(', ')}`);
    }

    return recommendations;
  }

  /**
   * Store session metrics for historical analysis
   * @param {Object} session - Session data
   */
  async storeSessionMetrics(session) {
    try {
      const metricsDir = './metrics';
      await fs.ensureDir(metricsDir);

      const filename = `session-${session.id}-${Date.now()}.json`;
      const filepath = path.join(metricsDir, filename);

      // Store only essential data to avoid large files
      const essentialMetrics = {
        id: session.id,
        context: session.context,
        startTime: session.startTime,
        endTime: session.endTime,
        totalDuration: session.totalDuration,
        totalMemoryDelta: session.totalMemoryDelta,
        statistics: session.statistics,
        performance: session.performance,
        operationSummary: session.operations.map(op => ({
          name: op.name,
          duration: op.duration,
          performance: op.performance,
          status: op.status
        })),
        errorSummary: session.errors.map(err => ({
          operation: err.operation,
          type: err.type,
          message: err.message
        }))
      };

      await fs.writeFile(filepath, JSON.stringify(essentialMetrics, null, 2));
      this.logger.debug(`Session metrics stored: ${filepath}`);
      
    } catch (error) {
      this.logger.warn('Failed to store session metrics', error);
    }
  }

  /**
   * Get current system performance metrics
   * @returns {Object} Current performance metrics
   */
  getCurrentMetrics() {
    const memory = process.memoryUsage();
    const uptime = process.uptime();
    
    return {
      memory: {
        rss: memory.rss,
        heapUsed: memory.heapUsed,
        heapTotal: memory.heapTotal,
        external: memory.external
      },
      uptime: uptime,
      activeSessions: this.sessions.size,
      timestamp: Date.now()
    };
  }

  /**
   * Generate performance report
   * @param {string} sessionId - Session identifier (optional)
   * @returns {Object} Performance report
   */
  generateReport(sessionId = null) {
    if (sessionId) {
      const session = this.sessions.get(sessionId);
      return session ? this.generateSessionReport(session) : null;
    }

    return {
      system: this.getCurrentMetrics(),
      activeSessions: Array.from(this.sessions.values()).map(session => ({
        id: session.id,
        duration: Date.now() - session.startTime,
        operations: session.operations.length,
        errors: session.errors.length
      }))
    };
  }

  /**
   * Generate detailed session report
   * @param {Object} session - Session data
   * @returns {Object} Session report
   */
  generateSessionReport(session) {
    return {
      session: {
        id: session.id,
        context: session.context,
        duration: session.totalDuration || (Date.now() - session.startTime),
        status: session.endTime ? 'completed' : 'active'
      },
      operations: session.operations.map(op => ({
        name: op.name,
        duration: op.duration,
        performance: op.performance,
        status: op.status,
        memoryDelta: op.memoryDelta
      })),
      errors: session.errors,
      statistics: session.statistics,
      performance: session.performance
    };
  }
}