const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const os = require('os');
const fs = require('fs');

class Logger {
  constructor(options = {}) {
    this.options = {
      level: options.level || 'info',
      maxFiles: options.maxFiles || '14d',
      maxSize: options.maxSize || '20m',
      datePattern: options.datePattern || 'YYYY-MM-DD',
      logDir: options.logDir || path.join(os.homedir(), '.printermaster', 'logs'),
      enableConsole: options.enableConsole !== false,
      enableFile: options.enableFile !== false,
      ...options
    };
    
    this.logger = null;
    this.initialized = false;
    
    this.init();
  }

  init() {
    try {
      // Ensure log directory exists
      if (!fs.existsSync(this.options.logDir)) {
        fs.mkdirSync(this.options.logDir, { recursive: true });
      }

      const transports = [];

      // Console transport
      if (this.options.enableConsole) {
        transports.push(new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.printf(({ level, message, timestamp, ...meta }) => {
              const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
              return `${timestamp} [${level}]: ${message} ${metaStr}`;
            })
          )
        }));
      }

      // File transport for general logs
      if (this.options.enableFile) {
        transports.push(new DailyRotateFile({
          filename: path.join(this.options.logDir, 'printermaster-%DATE%.log'),
          datePattern: this.options.datePattern,
          maxSize: this.options.maxSize,
          maxFiles: this.options.maxFiles,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json()
          )
        }));

        // Error-only log file
        transports.push(new DailyRotateFile({
          filename: path.join(this.options.logDir, 'error-%DATE%.log'),
          datePattern: this.options.datePattern,
          level: 'error',
          maxSize: this.options.maxSize,
          maxFiles: this.options.maxFiles,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json()
          )
        }));

        // Print jobs log (separate for auditing)
        transports.push(new DailyRotateFile({
          filename: path.join(this.options.logDir, 'printjobs-%DATE%.log'),
          datePattern: this.options.datePattern,
          maxSize: this.options.maxSize,
          maxFiles: this.options.maxFiles,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
          level: 'info'
        }));
      }

      // Create winston logger
      this.logger = winston.createLogger({
        level: this.options.level,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json()
        ),
        transports,
        exceptionHandlers: this.options.enableFile ? [
          new DailyRotateFile({
            filename: path.join(this.options.logDir, 'exceptions-%DATE%.log'),
            datePattern: this.options.datePattern,
            maxSize: this.options.maxSize,
            maxFiles: this.options.maxFiles
          })
        ] : [],
        rejectionHandlers: this.options.enableFile ? [
          new DailyRotateFile({
            filename: path.join(this.options.logDir, 'rejections-%DATE%.log'),
            datePattern: this.options.datePattern,
            maxSize: this.options.maxSize,
            maxFiles: this.options.maxFiles
          })
        ] : []
      });

      this.initialized = true;

      // Log initialization
      this.info('Logger initialized', {
        level: this.options.level,
        logDir: this.options.logDir,
        enableConsole: this.options.enableConsole,
        enableFile: this.options.enableFile
      });

    } catch (error) {
      console.error('Failed to initialize logger:', error);
      // Fallback to console logging
      this.logger = console;
      this.initialized = false;
    }
  }

  // Standard log levels
  error(message, ...meta) {
    if (this.logger) {
      this.logger.error(message, ...meta);
    } else {
      console.error(`[ERROR] ${message}`, ...meta);
    }
  }

  warn(message, ...meta) {
    if (this.logger) {
      this.logger.warn(message, ...meta);
    } else {
      console.warn(`[WARN] ${message}`, ...meta);
    }
  }

  info(message, ...meta) {
    if (this.logger) {
      this.logger.info(message, ...meta);
    } else {
      console.info(`[INFO] ${message}`, ...meta);
    }
  }

  debug(message, ...meta) {
    if (this.logger) {
      this.logger.debug(message, ...meta);
    } else {
      console.debug(`[DEBUG] ${message}`, ...meta);
    }
  }

  verbose(message, ...meta) {
    if (this.logger) {
      this.logger.verbose(message, ...meta);
    } else {
      console.log(`[VERBOSE] ${message}`, ...meta);
    }
  }

  silly(message, ...meta) {
    if (this.logger) {
      this.logger.silly(message, ...meta);
    } else {
      console.log(`[SILLY] ${message}`, ...meta);
    }
  }

  // Custom logging methods for specific events
  printJob(jobData) {
    const logEntry = {
      type: 'print_job',
      timestamp: new Date().toISOString(),
      jobId: jobData.id,
      printer: jobData.printer,
      printType: jobData.type,
      success: jobData.success,
      duration: jobData.duration,
      error: jobData.error,
      clientId: jobData.clientId
    };

    // Log to both general and print jobs log
    this.info('Print job executed', logEntry);
    
    // If we have access to the print jobs transport, log there specifically
    if (this.initialized && this.logger.transports) {
      const printJobTransport = this.logger.transports.find(t => 
        t.filename && t.filename.includes('printjobs')
      );
      
      if (printJobTransport) {
        printJobTransport.log(logEntry, () => {});
      }
    }
  }

  printerEvent(event, printerData) {
    const logEntry = {
      type: 'printer_event',
      event: event,
      timestamp: new Date().toISOString(),
      printer: {
        id: printerData.id,
        name: printerData.name,
        type: printerData.type,
        status: printerData.status,
        vendor: printerData.vendor,
        model: printerData.model
      }
    };

    this.info(`Printer event: ${event}`, logEntry);
  }

  websocketEvent(event, connectionData) {
    const logEntry = {
      type: 'websocket_event',
      event: event,
      timestamp: new Date().toISOString(),
      connection: {
        id: connectionData.id,
        ip: connectionData.ip,
        userAgent: connectionData.userAgent
      }
    };

    this.debug(`WebSocket event: ${event}`, logEntry);
  }

  restaurantIntegration(event, data) {
    const logEntry = {
      type: 'restaurant_integration',
      event: event,
      timestamp: new Date().toISOString(),
      data: data
    };

    this.info(`Restaurant integration: ${event}`, logEntry);
  }

  systemEvent(event, data) {
    const logEntry = {
      type: 'system_event',
      event: event,
      timestamp: new Date().toISOString(),
      data: data,
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        memory: process.memoryUsage(),
        uptime: process.uptime()
      }
    };

    this.info(`System event: ${event}`, logEntry);
  }

  // Performance logging
  performance(operation, duration, metadata = {}) {
    const logEntry = {
      type: 'performance',
      operation: operation,
      duration: duration,
      timestamp: new Date().toISOString(),
      ...metadata
    };

    if (duration > 5000) { // Log slow operations as warnings
      this.warn(`Slow operation detected: ${operation} took ${duration}ms`, logEntry);
    } else {
      this.debug(`Performance: ${operation} completed in ${duration}ms`, logEntry);
    }
  }

  // Security logging
  security(event, details) {
    const logEntry = {
      type: 'security',
      event: event,
      timestamp: new Date().toISOString(),
      details: details,
      severity: details.severity || 'medium'
    };

    if (details.severity === 'high' || details.severity === 'critical') {
      this.error(`Security event: ${event}`, logEntry);
    } else {
      this.warn(`Security event: ${event}`, logEntry);
    }
  }

  // Helper methods
  getLogLevel() {
    return this.options.level;
  }

  setLogLevel(level) {
    this.options.level = level;
    if (this.logger && this.logger.level) {
      this.logger.level = level;
    }
    this.info(`Log level changed to: ${level}`);
  }

  getLogPath() {
    return this.options.logDir;
  }

  // Get log files list
  getLogFiles() {
    try {
      if (!fs.existsSync(this.options.logDir)) {
        return [];
      }

      return fs.readdirSync(this.options.logDir)
        .filter(file => file.endsWith('.log'))
        .map(file => ({
          name: file,
          path: path.join(this.options.logDir, file),
          size: fs.statSync(path.join(this.options.logDir, file)).size,
          modified: fs.statSync(path.join(this.options.logDir, file)).mtime
        }))
        .sort((a, b) => b.modified - a.modified);

    } catch (error) {
      this.error('Error getting log files:', error);
      return [];
    }
  }

  // Read log file
  async readLogFile(fileName, lines = 100) {
    try {
      const filePath = path.join(this.options.logDir, fileName);
      
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const logLines = content.split('\\n').filter(line => line.trim());
      
      return logLines.slice(-lines).map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return { message: line, timestamp: new Date().toISOString() };
        }
      });

    } catch (error) {
      this.error('Error reading log file:', error);
      return null;
    }
  }

  // Clear old log files
  async clearOldLogs(daysToKeep = 30) {
    try {
      if (!fs.existsSync(this.options.logDir)) {
        return;
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const files = fs.readdirSync(this.options.logDir);
      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(this.options.logDir, file);
        const stats = fs.statSync(filePath);

        if (stats.mtime < cutoffDate && file.endsWith('.log')) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      }

      if (deletedCount > 0) {
        this.info(`Cleaned up ${deletedCount} old log files`);
      }

    } catch (error) {
      this.error('Error clearing old logs:', error);
    }
  }

  // Export logs to ZIP
  async exportLogs(outputPath) {
    try {
      const archiver = require('archiver');
      const output = fs.createWriteStream(outputPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      return new Promise((resolve, reject) => {
        output.on('close', () => {
          this.info(`Logs exported to: ${outputPath} (${archive.pointer()} bytes)`);
          resolve(outputPath);
        });

        archive.on('error', reject);
        archive.pipe(output);

        // Add all log files
        archive.directory(this.options.logDir, 'logs');
        archive.finalize();
      });

    } catch (error) {
      this.error('Error exporting logs:', error);
      throw error;
    }
  }

  // Close logger
  async close() {
    if (this.logger && this.logger.close) {
      await this.logger.close();
    }
    this.initialized = false;
  }

  // Static method to create logger with default settings
  static create(options = {}) {
    return new Logger(options);
  }

  // Static method for quick logging without instantiation
  static log(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} [${level.toUpperCase()}]: ${message}`, meta);
  }
}

// Export both the class and a default instance
module.exports = Logger;