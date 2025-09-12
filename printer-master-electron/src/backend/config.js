const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { EventEmitter } = require('events');

class ConfigManager extends EventEmitter {
  constructor() {
    super();
    this.config = {};
    this.configPath = null;
    this.initialized = false;
    
    // Default configuration
    this.defaults = {
      // WebSocket server settings
      websocket: {
        port: 9012,
        host: 'localhost',
        enabled: true
      },
      
      // Restaurant integration settings
      restaurant: {
        enabled: true,
        backendUrl: 'https://your-restaurant-backend.com',
        branchId: null,
        apiKey: null,
        heartbeatInterval: 30000, // 30 seconds
        reconnectInterval: 5000   // 5 seconds
      },
      
      // Printer settings
      printers: {
        autoDiscovery: true,
        discoveryInterval: 300000, // 5 minutes
        statusCheckInterval: 30000, // 30 seconds
        defaultPaperWidth: 58,
        defaultCharacterSet: 'PC437_USA',
        retryAttempts: 3,
        retryDelay: 1000
      },
      
      // UI settings
      ui: {
        minimizeToTray: true,
        closeToTray: true,
        startMinimized: false,
        showNotifications: true,
        language: 'en',
        theme: 'light'
      },
      
      // Logging settings
      logging: {
        level: 'info',
        maxFiles: 10,
        maxSize: '10MB',
        datePattern: 'YYYY-MM-DD',
        auditFile: 'audit.json'
      },
      
      // Service settings
      service: {
        autoStart: true,
        crashRestart: true,
        maxRestarts: 5,
        restartDelay: 5000
      },
      
      // Security settings
      security: {
        allowedOrigins: ['localhost', '127.0.0.1'],
        requireAuth: false,
        maxConnections: 50
      },
      
      // Performance settings
      performance: {
        printQueueSize: 100,
        maxConcurrentPrints: 5,
        printTimeout: 30000,
        memoryThreshold: 500 // MB
      },
      
      // Update settings
      updates: {
        autoCheck: true,
        checkInterval: 3600000, // 1 hour
        autoDownload: false,
        channel: 'stable' // stable, beta, alpha
      }
    };
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      // Determine config directory
      const configDir = path.join(os.homedir(), '.printermaster');
      this.configPath = path.join(configDir, 'config.json');
      
      // Ensure config directory exists
      await fs.mkdir(configDir, { recursive: true });
      
      // Load existing config or create default
      await this.load();
      
      this.initialized = true;
      this.emit('initialized');
      
    } catch (error) {
      console.error('Failed to initialize ConfigManager:', error);
      throw error;
    }
  }

  async load() {
    try {
      // Try to read existing config file
      const configData = await fs.readFile(this.configPath, 'utf8');
      const loadedConfig = JSON.parse(configData);
      
      // Merge with defaults (deep merge)
      this.config = this.deepMerge(this.defaults, loadedConfig);
      
      console.log('Configuration loaded from:', this.configPath);
      this.emit('loaded', this.config);
      
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Config file doesn't exist, use defaults and save
        console.log('No config file found, creating default configuration');
        this.config = { ...this.defaults };
        await this.save();
      } else {
        console.error('Error loading configuration:', error);
        // Use defaults as fallback
        this.config = { ...this.defaults };
      }
    }
  }

  async save() {
    try {
      const configData = JSON.stringify(this.config, null, 2);
      await fs.writeFile(this.configPath, configData, 'utf8');
      
      this.emit('saved', this.config);
      
    } catch (error) {
      console.error('Error saving configuration:', error);
      throw error;
    }
  }

  get(keyPath, defaultValue = undefined) {
    return this.getNestedValue(this.config, keyPath, defaultValue);
  }

  set(keyPath, value) {
    this.setNestedValue(this.config, keyPath, value);
    
    // Auto-save after changes
    this.save().catch(error => {
      console.error('Error auto-saving configuration:', error);
    });
    
    this.emit('changed', keyPath, value);
    return this;
  }

  has(keyPath) {
    return this.getNestedValue(this.config, keyPath) !== undefined;
  }

  delete(keyPath) {
    this.deleteNestedValue(this.config, keyPath);
    
    // Auto-save after changes
    this.save().catch(error => {
      console.error('Error auto-saving configuration:', error);
    });
    
    this.emit('deleted', keyPath);
    return this;
  }

  // Get all configuration
  getAll() {
    return { ...this.config };
  }

  // Set entire configuration (used for imports)
  setAll(newConfig) {
    this.config = this.deepMerge(this.defaults, newConfig);
    
    this.save().catch(error => {
      console.error('Error saving full configuration:', error);
    });
    
    this.emit('reset', this.config);
    return this;
  }

  // Reset to defaults
  reset() {
    this.config = { ...this.defaults };
    
    this.save().catch(error => {
      console.error('Error saving reset configuration:', error);
    });
    
    this.emit('reset', this.config);
    return this;
  }

  // Utility methods
  getNestedValue(obj, keyPath, defaultValue = undefined) {
    if (typeof keyPath === 'string') {
      keyPath = keyPath.split('.');
    }
    
    let current = obj;
    for (const key of keyPath) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return defaultValue;
      }
    }
    
    return current;
  }

  setNestedValue(obj, keyPath, value) {
    if (typeof keyPath === 'string') {
      keyPath = keyPath.split('.');
    }
    
    let current = obj;
    for (let i = 0; i < keyPath.length - 1; i++) {
      const key = keyPath[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[keyPath[keyPath.length - 1]] = value;
  }

  deleteNestedValue(obj, keyPath) {
    if (typeof keyPath === 'string') {
      keyPath = keyPath.split('.');
    }
    
    let current = obj;
    for (let i = 0; i < keyPath.length - 1; i++) {
      const key = keyPath[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        return; // Path doesn't exist
      }
      current = current[key];
    }
    
    delete current[keyPath[keyPath.length - 1]];
  }

  deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          result[key] = this.deepMerge(target[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }
    
    return result;
  }

  // Configuration validation
  validate() {
    const errors = [];
    
    // Validate WebSocket port
    const wsPort = this.get('websocket.port');
    if (typeof wsPort !== 'number' || wsPort < 1 || wsPort > 65535) {
      errors.push('WebSocket port must be a number between 1 and 65535');
    }
    
    // Validate restaurant backend URL
    const backendUrl = this.get('restaurant.backendUrl');
    if (backendUrl && typeof backendUrl === 'string') {
      try {
        new URL(backendUrl);
      } catch (error) {
        errors.push('Restaurant backend URL is not valid');
      }
    }
    
    // Validate intervals
    const intervals = [
      'restaurant.heartbeatInterval',
      'restaurant.reconnectInterval',
      'printers.discoveryInterval',
      'printers.statusCheckInterval'
    ];
    
    for (const intervalPath of intervals) {
      const interval = this.get(intervalPath);
      if (typeof interval !== 'number' || interval < 1000) {
        errors.push(`${intervalPath} must be a number >= 1000ms`);
      }
    }
    
    // Validate paper width
    const paperWidth = this.get('printers.defaultPaperWidth');
    if (typeof paperWidth !== 'number' || paperWidth < 48 || paperWidth > 80) {
      errors.push('Default paper width must be between 48 and 80');
    }
    
    return errors;
  }

  // Configuration templates for quick setup
  getTemplate(templateName) {
    const templates = {
      restaurant: {
        websocket: { port: 9012, host: 'localhost', enabled: true },
        restaurant: {
          enabled: true,
          backendUrl: 'https://your-restaurant-backend.com',
          branchId: null,
          heartbeatInterval: 30000
        },
        printers: { autoDiscovery: true, defaultPaperWidth: 58 },
        ui: { minimizeToTray: true, closeToTray: true }
      },
      
      retail: {
        websocket: { port: 9012, host: 'localhost', enabled: true },
        restaurant: { enabled: false },
        printers: { autoDiscovery: true, defaultPaperWidth: 80 },
        ui: { minimizeToTray: false, closeToTray: false }
      },
      
      development: {
        websocket: { port: 9012, host: '0.0.0.0', enabled: true },
        logging: { level: 'debug' },
        ui: { minimizeToTray: false, startMinimized: false },
        updates: { autoCheck: false }
      }
    };
    
    return templates[templateName] || null;
  }

  applyTemplate(templateName) {
    const template = this.getTemplate(templateName);
    if (template) {
      this.config = this.deepMerge(this.config, template);
      this.save();
      this.emit('template-applied', templateName, this.config);
      return true;
    }
    return false;
  }

  // Export/import functionality
  async exportConfig(filePath) {
    try {
      const exportData = {
        version: '2.0.0',
        exported: new Date().toISOString(),
        config: this.config
      };
      
      await fs.writeFile(filePath, JSON.stringify(exportData, null, 2), 'utf8');
      return true;
      
    } catch (error) {
      console.error('Error exporting configuration:', error);
      return false;
    }
  }

  async importConfig(filePath) {
    try {
      const importData = JSON.parse(await fs.readFile(filePath, 'utf8'));
      
      if (importData.config) {
        this.config = this.deepMerge(this.defaults, importData.config);
        await this.save();
        this.emit('imported', this.config);
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('Error importing configuration:', error);
      return false;
    }
  }

  // Get configuration file path
  getConfigPath() {
    return this.configPath;
  }

  // Watch for external changes to config file
  watchConfigFile() {
    if (!this.configPath) return;
    
    fs.watchFile(this.configPath, { interval: 1000 }, async (curr, prev) => {
      if (curr.mtime !== prev.mtime) {
        console.log('Configuration file changed externally, reloading...');
        await this.load();
      }
    });
  }

  // Stop watching config file
  stopWatching() {
    if (this.configPath) {
      fs.unwatchFile(this.configPath);
    }
  }
}

module.exports = ConfigManager;