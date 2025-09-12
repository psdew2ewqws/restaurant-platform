const WebSocket = require('ws');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class WebSocketServer {
  constructor(printerManager, config, logger) {
    this.printerManager = printerManager;
    this.config = config;
    this.logger = logger;
    this.server = null;
    this.wss = null;
    this.clients = new Map();
    this.messageId = 0;
    this.isRunning = false;
    
    // QZ-Tray compatible version info
    this.versionInfo = {
      name: 'PrinterMaster',
      version: '2.0.0',
      buildDate: new Date().toISOString(),
      platform: process.platform,
      arch: process.arch
    };
  }

  async start() {
    try {
      const port = this.config.get('websocket.port', 9012);
      const host = this.config.get('websocket.host', 'localhost');
      
      this.logger.info(`Starting WebSocket server on ${host}:${port}`);
      
      // Create WebSocket server
      this.wss = new WebSocket.Server({
        port: port,
        host: host,
        perMessageDeflate: false
      });

      this.wss.on('connection', this.handleConnection.bind(this));
      this.wss.on('error', this.handleServerError.bind(this));
      
      this.isRunning = true;
      this.logger.info(`WebSocket server started successfully on ${host}:${port}`);
      
    } catch (error) {
      this.logger.error('Failed to start WebSocket server:', error);
      throw error;
    }
  }

  async stop() {
    if (!this.isRunning) return;
    
    try {
      this.logger.info('Stopping WebSocket server...');
      
      // Close all client connections
      this.clients.forEach((clientInfo, ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close(1000, 'Server shutting down');
        }
      });
      this.clients.clear();
      
      // Close server
      if (this.wss) {
        await new Promise((resolve) => {
          this.wss.close(() => {
            resolve();
          });
        });
      }
      
      this.isRunning = false;
      this.logger.info('WebSocket server stopped');
      
    } catch (error) {
      this.logger.error('Error stopping WebSocket server:', error);
    }
  }

  handleConnection(ws, request) {
    const clientId = crypto.randomUUID();
    const clientInfo = {
      id: clientId,
      ip: request.socket.remoteAddress,
      userAgent: request.headers['user-agent'],
      connectedAt: new Date(),
      authenticated: false,
      subscriptions: new Set()
    };
    
    this.clients.set(ws, clientInfo);
    
    this.logger.info(`New WebSocket connection from ${clientInfo.ip} (${clientId})`);
    
    // Send welcome message (QZ-Tray compatible)
    this.sendMessage(ws, {
      call: 'qz.websocket.connect',
      result: {
        ...this.versionInfo,
        uuid: clientId,
        timestamp: Date.now()
      }
    });
    
    ws.on('message', (data) => this.handleMessage(ws, data));
    ws.on('close', () => this.handleDisconnection(ws));
    ws.on('error', (error) => this.handleClientError(ws, error));
    
    // Send heartbeat every 30 seconds
    const heartbeatInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      } else {
        clearInterval(heartbeatInterval);
      }
    }, 30000);
    
    clientInfo.heartbeatInterval = heartbeatInterval;
  }

  handleDisconnection(ws) {
    const clientInfo = this.clients.get(ws);
    if (clientInfo) {
      this.logger.info(`WebSocket client disconnected: ${clientInfo.id}`);
      
      if (clientInfo.heartbeatInterval) {
        clearInterval(clientInfo.heartbeatInterval);
      }
      
      this.clients.delete(ws);
    }
  }

  handleClientError(ws, error) {
    const clientInfo = this.clients.get(ws);
    const clientId = clientInfo ? clientInfo.id : 'unknown';
    this.logger.error(`WebSocket client error (${clientId}):`, error);
  }

  handleServerError(error) {
    this.logger.error('WebSocket server error:', error);
  }

  async handleMessage(ws, data) {
    try {
      const message = JSON.parse(data.toString());
      const clientInfo = this.clients.get(ws);
      
      if (!clientInfo) {
        this.logger.warn('Received message from unknown client');
        return;
      }
      
      this.logger.debug(`Message from ${clientInfo.id}:`, message);
      
      // Handle different types of QZ-Tray compatible calls
      await this.processMessage(ws, message, clientInfo);
      
    } catch (error) {
      this.logger.error('Error handling WebSocket message:', error);
      this.sendErrorMessage(ws, 'INVALID_MESSAGE', 'Failed to process message');
    }
  }

  async processMessage(ws, message, clientInfo) {
    const { call, params = {}, callback } = message;
    
    try {
      let result = null;
      
      switch (call) {
        // Connection management
        case 'qz.websocket.connect':
          result = await this.handleConnect(clientInfo);
          break;
          
        case 'qz.websocket.disconnect':
          result = await this.handleDisconnect(ws, clientInfo);
          break;
          
        case 'qz.websocket.isActive':
          result = true;
          break;
          
        // Version info
        case 'qz.version':
          result = this.versionInfo.version;
          break;
          
        case 'qz.info':
          result = this.versionInfo;
          break;
          
        // Printer discovery and management
        case 'qz.printers.find':
          result = await this.handleFindPrinters(params);
          break;
          
        case 'qz.printers.getDefault':
          result = await this.handleGetDefaultPrinter();
          break;
          
        case 'qz.printers.getStatus':
          result = await this.handleGetPrinterStatus(params);
          break;
          
        // Printing
        case 'qz.print':
          result = await this.handlePrint(params, clientInfo);
          break;
          
        case 'qz.print.config':
          result = await this.handlePrintConfig(params);
          break;
          
        case 'qz.print.spooled':
          result = await this.handleSpooledPrint(params, clientInfo);
          break;
          
        // Raw printing (ESC/POS)
        case 'qz.print.raw':
          result = await this.handleRawPrint(params, clientInfo);
          break;
          
        default:
          throw new Error(`Unknown method: ${call}`);
      }
      
      // Send successful response
      this.sendMessage(ws, {
        call: call,
        result: result,
        callback: callback,
        timestamp: Date.now()
      });
      
    } catch (error) {
      this.logger.error(`Error processing ${call}:`, error);
      this.sendErrorMessage(ws, call, error.message, callback);
    }
  }

  async handleConnect(clientInfo) {
    clientInfo.authenticated = true;
    return {
      connected: true,
      uuid: clientInfo.id,
      version: this.versionInfo.version,
      timestamp: Date.now()
    };
  }

  async handleDisconnect(ws, clientInfo) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.close(1000, 'Client requested disconnect');
    }
    return { disconnected: true };
  }

  async handleFindPrinters(params) {
    try {
      const printers = await this.printerManager.getAllPrinters();
      
      // Filter by name if specified (QZ-Tray compatible)
      if (params.name) {
        const namePattern = new RegExp(params.name, 'i');
        return printers.filter(p => namePattern.test(p.name)).map(p => p.name);
      }
      
      return printers.map(p => p.name);
      
    } catch (error) {
      this.logger.error('Error finding printers:', error);
      return [];
    }
  }

  async handleGetDefaultPrinter() {
    try {
      const printers = await this.printerManager.getAllPrinters();
      const defaultPrinter = printers.find(p => p.isDefault);
      return defaultPrinter ? defaultPrinter.name : null;
      
    } catch (error) {
      this.logger.error('Error getting default printer:', error);
      return null;
    }
  }

  async handleGetPrinterStatus(params) {
    try {
      if (!params.printer) {
        throw new Error('Printer name is required');
      }
      
      const printer = await this.printerManager.getPrinterByName(params.printer);
      if (!printer) {
        return { status: 'NOT_FOUND' };
      }
      
      return {
        status: printer.status.toUpperCase(),
        online: printer.status === 'online',
        paperOut: printer.paperOut || false,
        coverOpen: printer.coverOpen || false,
        error: printer.error || null
      };
      
    } catch (error) {
      this.logger.error('Error getting printer status:', error);
      return { status: 'ERROR', error: error.message };
    }
  }

  async handlePrint(params, clientInfo) {
    try {
      if (!params.printer) {
        throw new Error('Printer name is required');
      }
      
      if (!params.data || params.data.length === 0) {
        throw new Error('Print data is required');
      }
      
      const printer = await this.printerManager.getPrinterByName(params.printer);
      if (!printer) {
        throw new Error(`Printer not found: ${params.printer}`);
      }
      
      // Process print data based on type
      let printData;
      if (Array.isArray(params.data)) {
        printData = params.data.join('\\n');
      } else {
        printData = params.data;
      }
      
      const printJob = {
        id: crypto.randomUUID(),
        printer: printer.id,
        data: printData,
        config: params.config || {},
        timestamp: Date.now(),
        clientId: clientInfo.id
      };
      
      await this.printerManager.printJob(printJob);
      
      return {
        jobId: printJob.id,
        success: true,
        timestamp: printJob.timestamp
      };
      
    } catch (error) {
      this.logger.error('Error printing:', error);
      throw error;
    }
  }

  async handleRawPrint(params, clientInfo) {
    try {
      if (!params.printer) {
        throw new Error('Printer name is required');
      }
      
      if (!params.data) {
        throw new Error('Raw print data is required');
      }
      
      const printer = await this.printerManager.getPrinterByName(params.printer);
      if (!printer) {
        throw new Error(`Printer not found: ${params.printer}`);
      }
      
      // Handle raw ESC/POS commands
      let rawData = params.data;
      if (Array.isArray(rawData)) {
        rawData = rawData.join('');
      }
      
      const printJob = {
        id: crypto.randomUUID(),
        printer: printer.id,
        rawData: rawData,
        type: 'raw',
        config: params.config || {},
        timestamp: Date.now(),
        clientId: clientInfo.id
      };
      
      await this.printerManager.printRawJob(printJob);
      
      return {
        jobId: printJob.id,
        success: true,
        timestamp: printJob.timestamp
      };
      
    } catch (error) {
      this.logger.error('Error raw printing:', error);
      throw error;
    }
  }

  async handlePrintConfig(params) {
    // Return print configuration options
    return {
      density: params.density || 'medium',
      rotation: params.rotation || 0,
      copies: params.copies || 1,
      jobName: params.jobName || 'PrinterMaster Job',
      size: params.size || { width: 72, height: 200 }
    };
  }

  async handleSpooledPrint(params, clientInfo) {
    // Handle spooled printing (similar to regular print but queued)
    return await this.handlePrint(params, clientInfo);
  }

  sendMessage(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
      } catch (error) {
        this.logger.error('Error sending WebSocket message:', error);
      }
    }
  }

  sendErrorMessage(ws, call, errorMessage, callback = null) {
    this.sendMessage(ws, {
      call: call,
      error: {
        message: errorMessage,
        code: 'PRINT_ERROR',
        timestamp: Date.now()
      },
      callback: callback
    });
  }

  // Broadcast message to all connected clients
  broadcast(message) {
    this.clients.forEach((clientInfo, ws) => {
      if (ws.readyState === WebSocket.OPEN && clientInfo.authenticated) {
        this.sendMessage(ws, message);
      }
    });
  }

  // Send printer status updates to subscribed clients
  sendPrinterUpdate(printerData) {
    this.broadcast({
      call: 'qz.printers.status',
      result: printerData,
      timestamp: Date.now()
    });
  }

  // Get server status
  getStatus() {
    return {
      running: this.isRunning,
      port: this.config.get('websocket.port', 9012),
      connections: this.clients.size,
      version: this.versionInfo.version
    };
  }

  // Get connection count
  getConnectionCount() {
    return this.clients.size;
  }

  // Check if server is running
  isServerRunning() {
    return this.isRunning;
  }
}

module.exports = WebSocketServer;