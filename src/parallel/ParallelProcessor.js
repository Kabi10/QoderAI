/**
 * Parallel Processing Manager
 * Advanced concurrent processing for file generation and template operations
 */

import { Logger } from '../utils/Logger.js';
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { cpus } from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ParallelProcessor {
  constructor(options = {}) {
    this.logger = new Logger('ParallelProcessor');
    this.options = {
      maxWorkers: cpus().length - 1 || 1,
      taskTimeout: 30000, // 30 seconds
      retryAttempts: 3,
      enableBatching: true,
      batchSize: 5,
      ...options
    };

    this.workers = new Map();
    this.taskQueue = [];
    this.activeTasks = new Map();
    this.workerPool = [];
    this.taskCounter = 0;

    this.stats = {
      tasksCompleted: 0,
      tasksFailure: 0,
      averageTaskTime: 0,
      workersCreated: 0,
      workersDestroyed: 0
    };

    this.initializeWorkerPool();
  }

  /**
   * Initialize worker pool
   */
  async initializeWorkerPool() {
    try {
      this.logger.info(`Initializing worker pool with ${this.options.maxWorkers} workers`);
      
      for (let i = 0; i < this.options.maxWorkers; i++) {
        await this.createWorker();
      }
      
      this.logger.success(`Worker pool initialized with ${this.workerPool.length} workers`);
    } catch (error) {
      this.logger.error('Failed to initialize worker pool', error);
      throw error;
    }
  }

  /**
   * Create a new worker
   * @returns {Object} Worker instance
   */
  async createWorker() {
    try {
      const workerScript = path.join(__dirname, 'ProcessingWorker.js');
      const worker = new Worker(workerScript);

      const workerId = `worker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const workerData = {
        id: workerId,
        worker,
        busy: false,
        tasksCompleted: 0,
        tasksFailure: 0,
        lastActivity: Date.now()
      };

      // Setup worker event handlers
      worker.on('message', (result) => {
        this.handleWorkerMessage(workerId, result);
      });

      worker.on('error', (error) => {
        this.handleWorkerError(workerId, error);
      });

      worker.on('exit', (code) => {
        this.handleWorkerExit(workerId, code);
      });

      this.workers.set(workerId, workerData);
      this.workerPool.push(workerId);
      this.stats.workersCreated++;

      this.logger.debug(`Worker created: ${workerId}`);
      return workerData;

    } catch (error) {
      this.logger.error('Failed to create worker', error);
      throw error;
    }
  }

  /**
   * Process multiple tasks in parallel
   * @param {Array} tasks - Array of tasks to process
   * @param {string} operation - Operation type
   * @returns {Array} Results array
   */
  async processParallel(tasks, operation = 'template') {
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return [];
    }

    this.logger.info(`Processing ${tasks.length} tasks in parallel (${operation})`);
    const startTime = Date.now();

    try {
      // Batch tasks if enabled
      const batches = this.options.enableBatching ? 
        this.createBatches(tasks, this.options.batchSize) : 
        tasks.map(task => [task]);

      // Process batches in parallel
      const batchPromises = batches.map(batch => 
        this.processBatch(batch, operation)
      );

      const batchResults = await Promise.all(batchPromises);
      
      // Flatten results
      const results = batchResults.flat();
      
      const duration = Date.now() - startTime;
      this.updateStats(duration, results);

      this.logger.success(`Parallel processing completed: ${results.length} results in ${duration}ms`);
      return results;

    } catch (error) {
      this.logger.error('Parallel processing failed', error);
      throw error;
    }
  }

  /**
   * Process templates in parallel
   * @param {Array} templates - Template processing tasks
   * @returns {Array} Rendered templates
   */
  async processTemplates(templates) {
    const tasks = templates.map(template => ({
      type: 'template',
      data: template,
      id: this.generateTaskId()
    }));

    return await this.processParallel(tasks, 'template');
  }

  /**
   * Process validations in parallel
   * @param {Array} validationTasks - Validation tasks
   * @returns {Array} Validation results
   */
  async processValidations(validationTasks) {
    const tasks = validationTasks.map(validation => ({
      type: 'validation',
      data: validation,
      id: this.generateTaskId()
    }));

    return await this.processParallel(tasks, 'validation');
  }

  /**
   * Process transformations in parallel
   * @param {Array} transformationTasks - Transformation tasks
   * @returns {Array} Transformation results
   */
  async processTransformations(transformationTasks) {
    const tasks = transformationTasks.map(transformation => ({
      type: 'transformation',
      data: transformation,
      id: this.generateTaskId()
    }));

    return await this.processParallel(tasks, 'transformation');
  }

  /**
   * Process a batch of tasks
   * @param {Array} batch - Batch of tasks
   * @param {string} operation - Operation type
   * @returns {Array} Batch results
   */
  async processBatch(batch, operation) {
    const worker = await this.getAvailableWorker();
    
    if (!worker) {
      throw new Error('No available workers for processing');
    }

    return new Promise((resolve, reject) => {
      const taskId = this.generateTaskId();
      const startTime = Date.now();

      // Setup task data
      const taskData = {
        id: taskId,
        operation,
        batch,
        startTime,
        resolve,
        reject,
        worker: worker.id,
        attempts: 0
      };

      this.activeTasks.set(taskId, taskData);
      worker.busy = true;
      worker.lastActivity = Date.now();

      // Setup timeout
      const timeout = setTimeout(() => {
        this.handleTaskTimeout(taskId);
      }, this.options.taskTimeout);

      taskData.timeout = timeout;

      // Send task to worker
      worker.worker.postMessage({
        taskId,
        operation,
        batch
      });

      this.logger.debug(`Batch sent to worker: ${worker.id}, tasks: ${batch.length}`);
    });
  }

  /**
   * Get an available worker
   * @returns {Object|null} Available worker or null
   */
  async getAvailableWorker() {
    // Find idle worker
    for (const workerId of this.workerPool) {
      const worker = this.workers.get(workerId);
      if (worker && !worker.busy) {
        return worker;
      }
    }

    // If no idle workers and pool not at max, create new worker
    if (this.workerPool.length < this.options.maxWorkers) {
      try {
        return await this.createWorker();
      } catch (error) {
        this.logger.warn('Failed to create additional worker', error);
      }
    }

    // Wait for a worker to become available
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        for (const workerId of this.workerPool) {
          const worker = this.workers.get(workerId);
          if (worker && !worker.busy) {
            clearInterval(checkInterval);
            resolve(worker);
            return;
          }
        }
      }, 100);

      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve(null);
      }, 5000);
    });
  }

  /**
   * Handle worker message
   * @param {string} workerId - Worker ID
   * @param {Object} result - Worker result
   */
  handleWorkerMessage(workerId, result) {
    const { taskId, success, data, error } = result;
    const task = this.activeTasks.get(taskId);
    const worker = this.workers.get(workerId);

    if (!task || !worker) {
      this.logger.warn(`Received result for unknown task or worker: ${taskId}, ${workerId}`);
      return;
    }

    // Clear timeout
    if (task.timeout) {
      clearTimeout(task.timeout);
    }

    // Update worker status
    worker.busy = false;
    worker.lastActivity = Date.now();

    if (success) {
      worker.tasksCompleted++;
      this.stats.tasksCompleted++;
      task.resolve(data);
      this.logger.debug(`Task completed successfully: ${taskId}`);
    } else {
      worker.tasksFailure++;
      this.stats.tasksFailure++;
      
      // Retry if attempts remaining
      if (task.attempts < this.options.retryAttempts) {
        task.attempts++;
        this.logger.debug(`Retrying task: ${taskId}, attempt ${task.attempts}`);
        
        // Retry with same or different worker
        setTimeout(() => {
          this.retryTask(task);
        }, 1000 * task.attempts); // Exponential backoff
      } else {
        task.reject(new Error(error || 'Task failed after maximum retries'));
        this.logger.error(`Task failed permanently: ${taskId}`, error);
      }
    }

    // Clean up task
    if (success || task.attempts >= this.options.retryAttempts) {
      this.activeTasks.delete(taskId);
    }
  }

  /**
   * Handle worker error
   * @param {string} workerId - Worker ID
   * @param {Error} error - Worker error
   */
  handleWorkerError(workerId, error) {
    this.logger.error(`Worker error: ${workerId}`, error);
    
    const worker = this.workers.get(workerId);
    if (worker) {
      worker.worker.terminate();
      this.removeWorker(workerId);
    }
  }

  /**
   * Handle worker exit
   * @param {string} workerId - Worker ID
   * @param {number} code - Exit code
   */
  handleWorkerExit(workerId, code) {
    this.logger.debug(`Worker exited: ${workerId}, code: ${code}`);
    this.removeWorker(workerId);
  }

  /**
   * Handle task timeout
   * @param {string} taskId - Task ID
   */
  handleTaskTimeout(taskId) {
    const task = this.activeTasks.get(taskId);
    if (!task) return;

    this.logger.warn(`Task timeout: ${taskId}`);
    
    // Terminate the worker to prevent hanging
    const worker = this.workers.get(task.worker);
    if (worker) {
      worker.worker.terminate();
      this.removeWorker(task.worker);
    }

    // Retry if attempts remaining
    if (task.attempts < this.options.retryAttempts) {
      task.attempts++;
      this.retryTask(task);
    } else {
      task.reject(new Error('Task timeout after maximum retries'));
      this.activeTasks.delete(taskId);
    }
  }

  /**
   * Retry a failed task
   * @param {Object} task - Task data
   */
  async retryTask(task) {
    try {
      const worker = await this.getAvailableWorker();
      if (!worker) {
        task.reject(new Error('No available workers for retry'));
        return;
      }

      // Update task worker
      task.worker = worker.id;
      worker.busy = true;
      worker.lastActivity = Date.now();

      // Setup new timeout
      const timeout = setTimeout(() => {
        this.handleTaskTimeout(task.id);
      }, this.options.taskTimeout);

      task.timeout = timeout;

      // Resend task
      worker.worker.postMessage({
        taskId: task.id,
        operation: task.operation,
        batch: task.batch
      });

    } catch (error) {
      task.reject(error);
      this.activeTasks.delete(task.id);
    }
  }

  /**
   * Remove worker from pool
   * @param {string} workerId - Worker ID
   */
  removeWorker(workerId) {
    this.workers.delete(workerId);
    const index = this.workerPool.indexOf(workerId);
    if (index > -1) {
      this.workerPool.splice(index, 1);
    }
    this.stats.workersDestroyed++;
  }

  /**
   * Create batches from tasks
   * @param {Array} tasks - Tasks to batch
   * @param {number} batchSize - Size of each batch
   * @returns {Array} Array of batches
   */
  createBatches(tasks, batchSize) {
    const batches = [];
    for (let i = 0; i < tasks.length; i += batchSize) {
      batches.push(tasks.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Generate unique task ID
   * @returns {string} Task ID
   */
  generateTaskId() {
    return `task-${Date.now()}-${++this.taskCounter}`;
  }

  /**
   * Update processing statistics
   * @param {number} duration - Processing duration
   * @param {Array} results - Processing results
   */
  updateStats(duration, results) {
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    this.stats.tasksCompleted += successCount;
    this.stats.tasksFailure += failureCount;

    // Update average task time
    const totalTasks = this.stats.tasksCompleted + this.stats.tasksFailure;
    this.stats.averageTaskTime = (
      (this.stats.averageTaskTime * (totalTasks - results.length)) + duration
    ) / totalTasks;
  }

  /**
   * Get processing statistics
   * @returns {Object} Processing statistics
   */
  getStatistics() {
    return {
      ...this.stats,
      activeWorkers: this.workerPool.length,
      busyWorkers: this.workerPool.filter(id => this.workers.get(id)?.busy).length,
      activeTasks: this.activeTasks.size,
      successRate: this.stats.tasksCompleted / (this.stats.tasksCompleted + this.stats.tasksFailure) * 100 || 0
    };
  }

  /**
   * Shutdown parallel processor
   */
  async shutdown() {
    this.logger.info('Shutting down parallel processor...');

    // Wait for active tasks to complete (with timeout)
    const shutdownTimeout = 10000; // 10 seconds
    const startTime = Date.now();

    while (this.activeTasks.size > 0 && (Date.now() - startTime) < shutdownTimeout) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Terminate all workers
    for (const [workerId, worker] of this.workers.entries()) {
      try {
        await worker.worker.terminate();
        this.logger.debug(`Worker terminated: ${workerId}`);
      } catch (error) {
        this.logger.warn(`Failed to terminate worker: ${workerId}`, error);
      }
    }

    this.workers.clear();
    this.workerPool.length = 0;
    this.activeTasks.clear();

    this.logger.success('Parallel processor shutdown completed');
  }
}