/**
 * Logger Utility
 * Provides structured logging throughout the system
 */

import chalk from 'chalk';

export class Logger {
  constructor(component = 'System') {
    this.component = component;
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.enableColors = process.env.NO_COLOR !== '1';
    
    this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
      success: 1
    };
  }

  /**
   * Check if a log level should be output
   * @param {string} level - Log level to check
   * @returns {boolean} Whether to output this level
   */
  shouldLog(level) {
    const currentLevel = this.levels[this.logLevel] || 1;
    const messageLevel = this.levels[level] || 1;
    return messageLevel >= currentLevel;
  }

  /**
   * Format log message with timestamp and component
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} data - Additional data
   * @returns {string} Formatted message
   */
  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const component = `[${this.component}]`;
    
    let formattedMessage = `${timestamp} ${component} ${message}`;
    
    if (data) {
      if (typeof data === 'object') {
        formattedMessage += ` ${JSON.stringify(data, null, 2)}`;
      } else {
        formattedMessage += ` ${data}`;
      }
    }

    return formattedMessage;
  }

  /**
   * Apply colors to log messages
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @returns {string} Colored message
   */
  colorize(level, message) {
    if (!this.enableColors) return message;

    switch (level) {
      case 'debug':
        return chalk.gray(message);
      case 'info':
        return chalk.blue(message);
      case 'warn':
        return chalk.yellow(message);
      case 'error':
        return chalk.red(message);
      case 'success':
        return chalk.green(message);
      default:
        return message;
    }
  }

  /**
   * Log debug message
   * @param {string} message - Debug message
   * @param {Object} data - Additional data
   */
  debug(message, data = null) {
    if (!this.shouldLog('debug')) return;
    
    const formatted = this.formatMessage('debug', message, data);
    console.log(this.colorize('debug', formatted));
  }

  /**
   * Log info message
   * @param {string} message - Info message
   * @param {Object} data - Additional data
   */
  info(message, data = null) {
    if (!this.shouldLog('info')) return;
    
    const formatted = this.formatMessage('info', message, data);
    console.log(this.colorize('info', formatted));
  }

  /**
   * Log warning message
   * @param {string} message - Warning message
   * @param {Object} data - Additional data
   */
  warn(message, data = null) {
    if (!this.shouldLog('warn')) return;
    
    const formatted = this.formatMessage('warn', message, data);
    console.warn(this.colorize('warn', formatted));
  }

  /**
   * Log error message
   * @param {string} message - Error message
   * @param {Error|Object} error - Error object or additional data
   */
  error(message, error = null) {
    if (!this.shouldLog('error')) return;
    
    let errorData = null;
    if (error instanceof Error) {
      errorData = {
        message: error.message,
        stack: error.stack,
        name: error.name
      };
    } else if (error) {
      errorData = error;
    }

    const formatted = this.formatMessage('error', message, errorData);
    console.error(this.colorize('error', formatted));
  }

  /**
   * Log success message
   * @param {string} message - Success message
   * @param {Object} data - Additional data
   */
  success(message, data = null) {
    if (!this.shouldLog('success')) return;
    
    const formatted = this.formatMessage('success', message, data);
    console.log(this.colorize('success', formatted));
  }

  /**
   * Create a timer for measuring operation duration
   * @param {string} operation - Operation name
   * @returns {Object} Timer object
   */
  createTimer(operation) {
    const startTime = Date.now();
    
    return {
      finish: (message = null) => {
        const duration = Date.now() - startTime;
        const finalMessage = message || `${operation} completed`;
        this.info(`${finalMessage} (${duration}ms)`);
        return duration;
      },
      
      finishSuccess: (message = null) => {
        const duration = Date.now() - startTime;
        const finalMessage = message || `${operation} completed successfully`;
        this.success(`${finalMessage} (${duration}ms)`);
        return duration;
      },
      
      finishError: (message = null, error = null) => {
        const duration = Date.now() - startTime;
        const finalMessage = message || `${operation} failed`;
        this.error(`${finalMessage} (${duration}ms)`, error);
        return duration;
      }
    };
  }

  /**
   * Log a table of data
   * @param {Array} data - Array of objects to display
   * @param {Array} columns - Column names to display
   */
  table(data, columns = null) {
    if (!this.shouldLog('info')) return;
    
    console.log(this.colorize('info', `[${this.component}] Table Data:`));
    
    if (Array.isArray(data) && data.length > 0) {
      // If columns specified, filter the data
      if (columns) {
        const filteredData = data.map(row => {
          const filtered = {};
          columns.forEach(col => {
            if (row.hasOwnProperty(col)) {
              filtered[col] = row[col];
            }
          });
          return filtered;
        });
        console.table(filteredData);
      } else {
        console.table(data);
      }
    } else {
      console.log(this.colorize('warn', 'No data to display'));
    }
  }

  /**
   * Log a progress message
   * @param {string} message - Progress message
   * @param {number} current - Current progress
   * @param {number} total - Total items
   */
  progress(message, current, total) {
    if (!this.shouldLog('info')) return;
    
    const percentage = Math.round((current / total) * 100);
    const progressBar = this.createProgressBar(current, total, 20);
    
    const progressMessage = `${message} ${progressBar} ${current}/${total} (${percentage}%)`;
    
    // Use \r to overwrite the line for a dynamic progress effect
    if (current === total) {
      console.log(this.colorize('success', progressMessage));
    } else {
      process.stdout.write('\r' + this.colorize('info', progressMessage));
    }
  }

  /**
   * Create a visual progress bar
   * @param {number} current - Current progress
   * @param {number} total - Total items
   * @param {number} width - Width of progress bar
   * @returns {string} Progress bar string
   */
  createProgressBar(current, total, width = 20) {
    const filled = Math.round((current / total) * width);
    const empty = width - filled;
    
    const filledBar = '█'.repeat(filled);
    const emptyBar = '░'.repeat(empty);
    
    return `[${filledBar}${emptyBar}]`;
  }

  /**
   * Create a child logger with a specific component name
   * @param {string} childComponent - Child component name
   * @returns {Logger} Child logger instance
   */
  child(childComponent) {
    const childLogger = new Logger(`${this.component}:${childComponent}`);
    childLogger.logLevel = this.logLevel;
    childLogger.enableColors = this.enableColors;
    return childLogger;
  }

  /**
   * Set the log level
   * @param {string} level - New log level
   */
  setLogLevel(level) {
    if (this.levels.hasOwnProperty(level)) {
      this.logLevel = level;
    } else {
      this.warn(`Invalid log level: ${level}. Using 'info' instead.`);
      this.logLevel = 'info';
    }
  }

  /**
   * Enable or disable colored output
   * @param {boolean} enabled - Whether to enable colors
   */
  setColors(enabled) {
    this.enableColors = enabled;
  }

  /**
   * Create a section separator in logs
   * @param {string} title - Section title
   */
  section(title) {
    if (!this.shouldLog('info')) return;
    
    const separator = '='.repeat(50);
    const centeredTitle = ` ${title} `;
    const padding = Math.max(0, (separator.length - centeredTitle.length) / 2);
    const paddedTitle = '='.repeat(Math.floor(padding)) + centeredTitle + '='.repeat(Math.ceil(padding));
    
    console.log(this.colorize('info', separator));
    console.log(this.colorize('info', paddedTitle));
    console.log(this.colorize('info', separator));
  }
}