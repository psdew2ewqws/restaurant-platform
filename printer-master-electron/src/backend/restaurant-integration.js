const axios = require('axios');
const { EventEmitter } = require('events');

class RestaurantIntegration extends EventEmitter {
  constructor(config, logger) {
    super();
    this.config = config;
    this.logger = logger;
    this.isConnected = false;
    this.heartbeatInterval = null;
    this.reconnectTimeout = null;
    this.connectionAttempts = 0;
    this.maxConnectionAttempts = 10;
    this.lastHeartbeat = null;
    this.branchInfo = null;
  }

  async start() {
    if (!this.config.get('restaurant.enabled', true)) {
      this.logger.info('Restaurant integration is disabled');
      return;
    }

    const backendUrl = this.config.get('restaurant.backendUrl');
    const branchId = this.config.get('restaurant.branchId');

    if (!backendUrl) {
      this.logger.warn('Restaurant backend URL not configured');
      return;
    }

    if (!branchId) {
      this.logger.warn('Branch ID not configured');
      return;
    }

    this.logger.info('Starting restaurant integration...', { backendUrl, branchId });
    
    try {
      await this.connect();
      this.startHeartbeat();
      this.logger.info('Restaurant integration started successfully');
      
    } catch (error) {
      this.logger.error('Failed to start restaurant integration:', error);
      this.scheduleReconnect();
    }
  }

  async stop() {
    this.logger.info('Stopping restaurant integration...');
    
    this.stopHeartbeat();
    this.stopReconnectTimer();
    
    if (this.isConnected) {
      try {
        await this.reportStatus('offline');
      } catch (error) {
        this.logger.debug('Error reporting offline status:', error);
      }
    }
    
    this.isConnected = false;
    this.logger.info('Restaurant integration stopped');
  }

  async connect() {
    const backendUrl = this.config.get('restaurant.backendUrl');
    const branchId = this.config.get('restaurant.branchId');
    const apiKey = this.config.get('restaurant.apiKey');

    try {
      this.logger.info('Connecting to restaurant backend...');
      
      // Register/update branch
      const response = await this.makeRequest('POST', `/api/v1/printing/branches/${branchId}/register`, {
        branchId: branchId,
        printerMasterVersion: '2.0.0',
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        capabilities: {
          thermalPrinting: true,
          escposPrinting: true,
          networkPrinting: true,
          usbPrinting: true,
          qzTrayCompatible: true,
          websocketApi: true
        }
      });

      if (response.success) {
        this.branchInfo = response.data.branch;
        this.isConnected = true;
        this.connectionAttempts = 0;
        this.lastHeartbeat = new Date();
        
        this.logger.info('Successfully connected to restaurant backend', {
          branchId: this.branchInfo.id,
          branchName: this.branchInfo.name
        });
        
        this.emit('connected', this.branchInfo);
        
        // Report initial status
        await this.reportPrinterStatus();
        
      } else {
        throw new Error(response.message || 'Registration failed');
      }
      
    } catch (error) {
      this.connectionAttempts++;
      this.logger.error(`Connection attempt ${this.connectionAttempts} failed:`, error);
      
      if (this.connectionAttempts < this.maxConnectionAttempts) {
        throw error; // Will trigger reconnect
      } else {
        this.logger.error('Max connection attempts reached, giving up');
        this.emit('connection-failed');
      }
    }
  }

  async makeRequest(method, endpoint, data = null, timeout = 10000) {
    const backendUrl = this.config.get('restaurant.backendUrl');
    const apiKey = this.config.get('restaurant.apiKey');
    const branchId = this.config.get('restaurant.branchId');

    const url = `${backendUrl}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'PrinterMaster/2.0.0',
      'X-Branch-ID': branchId
    };

    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const config = {
      method,
      url,
      headers,
      timeout,
      validateStatus: (status) => status < 500 // Don't throw on 4xx errors
    };

    if (data) {
      config.data = data;
    }

    try {
      const response = await axios(config);
      
      if (response.status >= 400) {
        throw new Error(`HTTP ${response.status}: ${response.data?.message || 'Request failed'}`);
      }
      
      return response.data;
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        throw new Error('Cannot connect to restaurant backend');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout');
      } else {
        throw error;
      }
    }
  }

  startHeartbeat() {
    const heartbeatInterval = this.config.get('restaurant.heartbeatInterval', 30000);
    
    this.heartbeatInterval = setInterval(async () => {
      try {
        await this.sendHeartbeat();
      } catch (error) {
        this.logger.error('Heartbeat failed:', error);
        this.handleConnectionError(error);
      }
    }, heartbeatInterval);
    
    this.logger.debug(`Heartbeat started with ${heartbeatInterval}ms interval`);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  async sendHeartbeat() {
    if (!this.isConnected) return;
    
    const branchId = this.config.get('restaurant.branchId');
    
    try {
      const response = await this.makeRequest('POST', `/api/v1/printing/branches/${branchId}/heartbeat`, {
        timestamp: new Date().toISOString(),
        status: 'online',
        version: '2.0.0',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        printerCount: await this.getPrinterCount()
      });
      
      this.lastHeartbeat = new Date();
      this.logger.debug('Heartbeat sent successfully');
      
      // Handle any commands received
      if (response.commands && response.commands.length > 0) {
        await this.processCommands(response.commands);
      }
      
    } catch (error) {
      throw error;
    }
  }

  async reportStatus(status) {
    if (!this.isConnected && status !== 'offline') return;
    
    const branchId = this.config.get('restaurant.branchId');
    
    try {
      await this.makeRequest('POST', `/api/v1/printing/branches/${branchId}/status`, {
        status: status,
        timestamp: new Date().toISOString(),
        details: {
          version: '2.0.0',
          platform: process.platform,
          uptime: process.uptime()
        }
      });
      
      this.logger.debug(`Status reported: ${status}`);
      
    } catch (error) {
      this.logger.error('Failed to report status:', error);
    }
  }

  async reportPrinterStatus() {
    if (!this.isConnected) return;
    
    const branchId = this.config.get('restaurant.branchId');
    
    try {
      const printers = await this.getAllPrinters();
      
      const printerData = printers.map(printer => ({
        id: printer.id,
        name: printer.name,
        type: printer.type,
        status: printer.status,
        vendor: printer.vendor,
        model: printer.model,
        capabilities: printer.capabilities,
        lastSeen: printer.lastSeen,
        totalJobs: printer.totalPrintJobs || 0
      }));
      
      await this.makeRequest('POST', `/api/v1/printing/branches/${branchId}/printers`, {
        printers: printerData,
        timestamp: new Date().toISOString()
      });
      
      this.logger.debug(`Reported status for ${printers.length} printers`);
      
    } catch (error) {
      this.logger.error('Failed to report printer status:', error);
    }
  }

  async processCommands(commands) {
    for (const command of commands) {
      try {
        await this.executeCommand(command);
      } catch (error) {
        this.logger.error(`Failed to execute command ${command.id}:`, error);
        await this.reportCommandResult(command.id, false, error.message);
      }
    }
  }

  async executeCommand(command) {
    this.logger.info(`Executing command: ${command.type}`, { commandId: command.id });
    
    let result = null;
    
    switch (command.type) {
      case 'print_test':
        result = await this.handleTestPrint(command);
        break;
        
      case 'print_receipt':
        result = await this.handlePrintReceipt(command);
        break;
        
      case 'discover_printers':
        result = await this.handleDiscoverPrinters(command);
        break;
        
      case 'restart_service':
        result = await this.handleRestartService(command);
        break;
        
      case 'update_config':
        result = await this.handleUpdateConfig(command);
        break;
        
      default:
        throw new Error(`Unknown command type: ${command.type}`);
    }
    
    await this.reportCommandResult(command.id, true, 'Success', result);
  }

  async handleTestPrint(command) {
    const { printerId } = command.params;
    
    // This would normally interact with the printer manager
    // For now, we'll simulate it
    this.logger.info(`Test print requested for printer: ${printerId}`);
    
    return {
      printerId: printerId,
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  async handlePrintReceipt(command) {
    const { printerId, receiptData } = command.params;
    
    this.logger.info(`Receipt print requested for printer: ${printerId}`);
    
    return {
      printerId: printerId,
      jobId: `job-${Date.now()}`,
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  async handleDiscoverPrinters(command) {
    this.logger.info('Printer discovery requested');
    
    // This would normally trigger printer discovery
    const printers = await this.getAllPrinters();
    
    return {
      printerCount: printers.length,
      timestamp: new Date().toISOString()
    };
  }

  async handleRestartService(command) {
    this.logger.warn('Service restart requested');
    
    // Schedule restart after sending response
    setTimeout(() => {
      process.exit(0); // This will trigger service restart if running as service
    }, 2000);
    
    return {
      scheduled: true,
      timestamp: new Date().toISOString()
    };
  }

  async handleUpdateConfig(command) {
    const { config } = command.params;
    
    this.logger.info('Configuration update requested');
    
    // Update configuration
    for (const [key, value] of Object.entries(config)) {
      this.config.set(key, value);
    }
    
    return {
      updated: true,
      timestamp: new Date().toISOString()
    };
  }

  async reportCommandResult(commandId, success, message, data = null) {
    if (!this.isConnected) return;
    
    const branchId = this.config.get('restaurant.branchId');
    
    try {
      await this.makeRequest('POST', `/api/v1/printing/branches/${branchId}/commands/${commandId}/result`, {
        success: success,
        message: message,
        data: data,
        timestamp: new Date().toISOString()
      });
      
      this.logger.debug(`Command result reported: ${commandId}`);
      
    } catch (error) {
      this.logger.error('Failed to report command result:', error);
    }
  }

  handleConnectionError(error) {
    if (this.isConnected) {
      this.isConnected = false;
      this.logger.warn('Lost connection to restaurant backend');
      this.emit('disconnected', error);
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimeout) return;
    
    const reconnectInterval = this.config.get('restaurant.reconnectInterval', 5000);
    
    this.logger.info(`Scheduling reconnect in ${reconnectInterval}ms`);
    
    this.reconnectTimeout = setTimeout(async () => {
      this.reconnectTimeout = null;
      
      try {
        await this.connect();
        this.startHeartbeat();
      } catch (error) {
        this.logger.error('Reconnect failed:', error);
        this.scheduleReconnect();
      }
    }, reconnectInterval);
  }

  stopReconnectTimer() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  // Helper methods (these would normally interact with PrinterManager)
  async getAllPrinters() {
    // Placeholder - would normally get from PrinterManager
    return [];
  }

  async getPrinterCount() {
    const printers = await this.getAllPrinters();
    return printers.length;
  }

  // Status getters
  getStatus() {
    return {
      connected: this.isConnected,
      branchId: this.config.get('restaurant.branchId'),
      backendUrl: this.config.get('restaurant.backendUrl'),
      lastHeartbeat: this.lastHeartbeat,
      connectionAttempts: this.connectionAttempts,
      branchInfo: this.branchInfo
    };
  }

  isConnectedToBackend() {
    return this.isConnected;
  }

  getBranchInfo() {
    return this.branchInfo;
  }

  getLastHeartbeat() {
    return this.lastHeartbeat;
  }
}

module.exports = RestaurantIntegration;