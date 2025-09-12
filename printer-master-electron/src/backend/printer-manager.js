const PrinterDiscovery = require('./discovery');
const ThermalPrinter = require('node-thermal-printer').printer;
const PrinterTypes = require('node-thermal-printer').types;
const EventEmitter = require('events');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class PrinterManager extends EventEmitter {
  constructor(logger, config) {
    super();
    this.logger = logger;
    this.config = config;
    this.discovery = new PrinterDiscovery(logger);
    this.printers = new Map();
    this.printQueue = [];
    this.isProcessingQueue = false;
    this.discoveryInterval = null;
    this.statusCheckInterval = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      this.logger.info('Initializing PrinterManager...');
      
      // Load saved printer configurations
      await this.loadSavedPrinters();
      
      // Discover printers
      await this.discoverPrinters();
      
      // Start periodic discovery and status checks
      this.startPeriodicTasks();
      
      this.initialized = true;
      this.logger.info('PrinterManager initialized successfully');
      
    } catch (error) {
      this.logger.error('Failed to initialize PrinterManager:', error);
      throw error;
    }
  }

  async discoverPrinters() {
    try {
      this.logger.info('Starting printer discovery...');
      
      const discoveredPrinters = await this.discovery.discoverAll();
      
      // Update printer list
      for (const printerData of discoveredPrinters) {
        await this.addOrUpdatePrinter(printerData);
      }
      
      // Remove printers that haven't been seen recently
      await this.cleanupOldPrinters();
      
      // Save updated printer list
      await this.savePrinters();
      
      this.emit('printers-updated', Array.from(this.printers.values()));
      
      this.logger.info(`Discovery completed. Managing ${this.printers.size} printers`);
      return Array.from(this.printers.values());
      
    } catch (error) {
      this.logger.error('Error during printer discovery:', error);
      throw error;
    }
  }

  async addOrUpdatePrinter(printerData) {
    const existingPrinter = this.printers.get(printerData.id);
    
    if (existingPrinter) {
      // Update existing printer
      Object.assign(existingPrinter, printerData, {
        lastSeen: new Date().toISOString(),
        status: await this.checkPrinterStatus(printerData)
      });
      
      this.logger.debug(`Updated printer: ${existingPrinter.name}`);
    } else {
      // Add new printer
      const printer = {
        ...printerData,
        isDefault: this.printers.size === 0, // First printer becomes default
        isEnabled: true,
        paperWidth: 58, // Default for thermal printers
        characterSet: 'PC437_USA',
        printDensity: 'medium',
        printSpeed: 'medium',
        testPrintCount: 0,
        totalPrintJobs: 0,
        lastPrintJob: null,
        configuration: {
          margins: { top: 0, bottom: 0, left: 0, right: 0 },
          lineSpacing: 24,
          characterSpacing: 0,
          fontSize: 'normal',
          fontStyle: 'normal',
          alignment: 'left'
        },
        status: await this.checkPrinterStatus(printerData)
      };
      
      this.printers.set(printerData.id, printer);
      this.logger.info(`Added new printer: ${printer.name}`);
    }
  }

  async checkPrinterStatus(printerData) {
    try {
      // Basic availability check based on connection type
      switch (printerData.type) {
        case 'usb':
          return await this.checkUSBPrinterStatus(printerData);
        
        case 'network':
          return await this.checkNetworkPrinterStatus(printerData);
        
        case 'system':
          return await this.checkSystemPrinterStatus(printerData);
        
        default:
          return 'unknown';
      }
      
    } catch (error) {
      this.logger.debug(`Error checking printer status for ${printerData.name}:`, error);
      return 'error';
    }
  }

  async checkUSBPrinterStatus(printerData) {
    try {
      // Check if USB device is still connected
      const usb = require('usb');
      const devices = usb.getDeviceList();
      
      const device = devices.find(d => 
        d.deviceDescriptor.idVendor === printerData.vendorId &&
        d.deviceDescriptor.idProduct === printerData.productId
      );
      
      return device ? 'online' : 'offline';
      
    } catch (error) {
      return 'error';
    }
  }

  async checkNetworkPrinterStatus(printerData) {
    try {
      const ping = require('ping');
      const result = await ping.promise.probe(printerData.ipAddress, { timeout: 2 });
      return result.alive ? 'online' : 'offline';
      
    } catch (error) {
      return 'error';
    }
  }

  async checkSystemPrinterStatus(printerData) {
    // System printers are assumed available if they exist in the system
    return 'available';
  }

  async cleanupOldPrinters() {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - 24); // 24 hours ago
    
    for (const [printerId, printer] of this.printers.entries()) {
      const lastSeen = new Date(printer.lastSeen);
      
      if (lastSeen < cutoffTime && printer.type !== 'system') {
        this.logger.info(`Removing old printer: ${printer.name}`);
        this.printers.delete(printerId);
        this.emit('printer-removed', printer);
      }
    }
  }

  async getAllPrinters() {
    return Array.from(this.printers.values());
  }

  async getPrinterById(printerId) {
    return this.printers.get(printerId);
  }

  async getPrinterByName(printerName) {
    return Array.from(this.printers.values()).find(p => p.name === printerName);
  }

  async getDefaultPrinter() {
    return Array.from(this.printers.values()).find(p => p.isDefault);
  }

  async setDefaultPrinter(printerId) {
    // Remove default from all printers
    for (const printer of this.printers.values()) {
      printer.isDefault = false;
    }
    
    // Set new default
    const printer = this.printers.get(printerId);
    if (printer) {
      printer.isDefault = true;
      await this.savePrinters();
      this.emit('default-printer-changed', printer);
      return true;
    }
    
    return false;
  }

  async updatePrinterConfig(printerId, config) {
    const printer = this.printers.get(printerId);
    if (printer) {
      Object.assign(printer.configuration, config);
      await this.savePrinters();
      this.emit('printer-config-updated', printer);
      return true;
    }
    
    return false;
  }

  async testPrint(printerId) {
    const printer = this.printers.get(printerId);
    if (!printer) {
      throw new Error(`Printer not found: ${printerId}`);
    }
    
    try {
      this.logger.info(`Performing test print on: ${printer.name}`);
      
      // Create test receipt content
      const testContent = this.generateTestReceipt(printer);
      
      const printJob = {
        id: crypto.randomUUID(),
        printer: printerId,
        type: 'test',
        data: testContent,
        priority: 1,
        timestamp: Date.now()
      };
      
      const result = await this.executePrintJob(printJob);
      
      // Update test print count
      printer.testPrintCount++;
      await this.savePrinters();
      
      this.emit('test-print-completed', printer, result);
      return result;
      
    } catch (error) {
      this.logger.error(`Test print failed for ${printer.name}:`, error);
      throw error;
    }
  }

  generateTestReceipt(printer) {
    const now = new Date();
    
    return [
      '==============================',
      '        PRINTERMASTER         ',
      '      TEST PRINT RECEIPT      ',
      '==============================',
      '',
      `Printer: ${printer.name}`,
      `Model: ${printer.vendor} ${printer.model}`,
      `Type: ${printer.type.toUpperCase()}`,
      `Status: ${printer.status.toUpperCase()}`,
      '',
      `Date: ${now.toLocaleDateString()}`,
      `Time: ${now.toLocaleTimeString()}`,
      `Test #: ${printer.testPrintCount + 1}`,
      '',
      '------------------------------',
      'CHARACTER TEST:',
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      'abcdefghijklmnopqrstuvwxyz',
      '0123456789 !@#$%^&*()_+-=',
      '------------------------------',
      '',
      'This test confirms your printer',
      'is working correctly with',
      'PrinterMaster v2.0',
      '',
      '==============================',
      '        TEST COMPLETE         ',
      '=============================='
    ].join('\\n');
  }

  async printReceipt(printerId, receiptData) {
    const printer = this.printers.get(printerId);
    if (!printer) {
      throw new Error(`Printer not found: ${printerId}`);
    }
    
    const printJob = {
      id: crypto.randomUUID(),
      printer: printerId,
      type: 'receipt',
      data: receiptData,
      priority: 2,
      timestamp: Date.now()
    };
    
    return await this.queuePrintJob(printJob);
  }

  async printJob(printJob) {
    return await this.queuePrintJob(printJob);
  }

  async printRawJob(printJob) {
    printJob.type = 'raw';
    return await this.queuePrintJob(printJob);
  }

  async queuePrintJob(printJob) {
    this.printQueue.push(printJob);
    this.printQueue.sort((a, b) => (a.priority || 5) - (b.priority || 5));
    
    this.logger.debug(`Print job queued: ${printJob.id} for printer ${printJob.printer}`);
    
    if (!this.isProcessingQueue) {
      this.processQueue();
    }
    
    return { jobId: printJob.id, queued: true, position: this.printQueue.length };
  }

  async processQueue() {
    if (this.isProcessingQueue || this.printQueue.length === 0) {
      return;
    }
    
    this.isProcessingQueue = true;
    
    while (this.printQueue.length > 0) {
      const printJob = this.printQueue.shift();
      
      try {
        await this.executePrintJob(printJob);
        
      } catch (error) {
        this.logger.error(`Print job ${printJob.id} failed:`, error);
        this.emit('print-job-failed', printJob, error);
      }
      
      // Small delay between jobs
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.isProcessingQueue = false;
  }

  async executePrintJob(printJob) {
    const printer = this.printers.get(printJob.printer);
    if (!printer) {
      throw new Error(`Printer not found: ${printJob.printer}`);
    }
    
    this.logger.info(`Executing print job ${printJob.id} on ${printer.name}`);
    
    try {
      let result;
      
      if (printJob.type === 'raw') {
        result = await this.executeRawPrint(printer, printJob);
      } else {
        result = await this.executeFormattedPrint(printer, printJob);
      }
      
      // Update printer statistics
      printer.totalPrintJobs++;
      printer.lastPrintJob = {
        id: printJob.id,
        timestamp: Date.now(),
        type: printJob.type,
        success: true
      };
      
      this.emit('print-job-completed', printJob, printer, result);
      this.logger.info(`Print job ${printJob.id} completed successfully`);
      
      return result;
      
    } catch (error) {
      // Update printer with error info
      printer.lastPrintJob = {
        id: printJob.id,
        timestamp: Date.now(),
        type: printJob.type,
        success: false,
        error: error.message
      };
      
      throw error;
    }
  }

  async executeRawPrint(printer, printJob) {
    const thermalPrinter = new ThermalPrinter({
      type: this.getPrinterType(printer),
      interface: this.getPrinterInterface(printer),
      options: {
        timeout: 5000
      }
    });
    
    try {
      // Send raw data directly
      if (typeof printJob.rawData === 'string') {
        thermalPrinter.raw(Buffer.from(printJob.rawData));
      } else if (Buffer.isBuffer(printJob.rawData)) {
        thermalPrinter.raw(printJob.rawData);
      } else {
        throw new Error('Invalid raw data format');
      }
      
      await thermalPrinter.execute();
      return { success: true, type: 'raw' };
      
    } finally {
      thermalPrinter.clear();
    }
  }

  async executeFormattedPrint(printer, printJob) {
    const thermalPrinter = new ThermalPrinter({
      type: this.getPrinterType(printer),
      interface: this.getPrinterInterface(printer),
      options: {
        timeout: 5000
      },
      width: printer.paperWidth || 48,
      characterSet: printer.characterSet || 'PC437_USA'
    });
    
    try {
      // Process print data
      const lines = Array.isArray(printJob.data) ? printJob.data : printJob.data.split('\\n');
      
      for (const line of lines) {
        if (line.trim() === '') {
          thermalPrinter.newLine();
        } else if (line.includes('======')) {
          thermalPrinter.drawLine();
        } else if (line.includes('------')) {
          thermalPrinter.drawLine('-');
        } else {
          thermalPrinter.println(line);
        }
      }
      
      // Cut paper if supported
      if (printer.capabilities?.cutter) {
        thermalPrinter.cut();
      }
      
      await thermalPrinter.execute();
      return { success: true, type: 'formatted' };
      
    } finally {
      thermalPrinter.clear();
    }
  }

  getPrinterType(printer) {
    // Map printer types to node-thermal-printer types
    if (printer.vendor?.toLowerCase().includes('epson')) {
      return PrinterTypes.EPSON;
    } else if (printer.vendor?.toLowerCase().includes('star')) {
      return PrinterTypes.STAR;
    } else {
      return PrinterTypes.EPSON; // Default fallback
    }
  }

  getPrinterInterface(printer) {
    switch (printer.type) {
      case 'usb':
        if (process.platform === 'win32') {
          return `printer:${printer.name}`;
        } else {
          return `/dev/usb/lp0`; // This needs to be determined dynamically
        }
      
      case 'network':
        return `tcp://${printer.ipAddress}:${printer.connection.port || 9100}`;
      
      case 'system':
        return `printer:${printer.name}`;
      
      default:
        throw new Error(`Unsupported printer type: ${printer.type}`);
    }
  }

  startPeriodicTasks() {
    // Discovery every 5 minutes
    this.discoveryInterval = setInterval(() => {
      this.discoverPrinters().catch(error => {
        this.logger.error('Periodic discovery failed:', error);
      });
    }, 5 * 60 * 1000);
    
    // Status check every 30 seconds
    this.statusCheckInterval = setInterval(() => {
      this.checkAllPrinterStatus().catch(error => {
        this.logger.error('Status check failed:', error);
      });
    }, 30 * 1000);
    
    this.logger.info('Periodic tasks started');
  }

  async checkAllPrinterStatus() {
    for (const [printerId, printer] of this.printers.entries()) {
      try {
        const newStatus = await this.checkPrinterStatus(printer);
        if (newStatus !== printer.status) {
          this.logger.info(`Printer status changed: ${printer.name} ${printer.status} -> ${newStatus}`);
          printer.status = newStatus;
          this.emit('printer-status-changed', printer);
        }
      } catch (error) {
        this.logger.debug(`Status check failed for ${printer.name}:`, error);
      }
    }
  }

  async loadSavedPrinters() {
    try {
      const configPath = path.join(require('os').homedir(), '.printermaster', 'printers.json');
      
      try {
        await fs.access(configPath);
        const data = await fs.readFile(configPath, 'utf8');
        const savedPrinters = JSON.parse(data);
        
        for (const printerData of savedPrinters) {
          this.printers.set(printerData.id, printerData);
        }
        
        this.logger.info(`Loaded ${savedPrinters.length} saved printers`);
        
      } catch (error) {
        // File doesn't exist or is invalid, that's OK
        this.logger.debug('No saved printers found');
      }
      
    } catch (error) {
      this.logger.error('Error loading saved printers:', error);
    }
  }

  async savePrinters() {
    try {
      const configDir = path.join(require('os').homedir(), '.printermaster');
      const configPath = path.join(configDir, 'printers.json');
      
      // Ensure directory exists
      await fs.mkdir(configDir, { recursive: true });
      
      const printersArray = Array.from(this.printers.values());
      await fs.writeFile(configPath, JSON.stringify(printersArray, null, 2));
      
      this.logger.debug(`Saved ${printersArray.length} printers to config`);
      
    } catch (error) {
      this.logger.error('Error saving printers:', error);
    }
  }

  async close() {
    this.logger.info('Shutting down PrinterManager...');
    
    // Stop periodic tasks
    if (this.discoveryInterval) {
      clearInterval(this.discoveryInterval);
    }
    
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
    }
    
    // Wait for print queue to finish
    while (this.isProcessingQueue) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Save current state
    await this.savePrinters();
    
    this.logger.info('PrinterManager shutdown complete');
  }

  // Get manager statistics
  getStatistics() {
    const printers = Array.from(this.printers.values());
    
    return {
      totalPrinters: printers.length,
      onlinePrinters: printers.filter(p => p.status === 'online').length,
      offlinePrinters: printers.filter(p => p.status === 'offline').length,
      thermalPrinters: printers.filter(p => p.isThermal).length,
      totalPrintJobs: printers.reduce((sum, p) => sum + (p.totalPrintJobs || 0), 0),
      queuedJobs: this.printQueue.length,
      byType: {
        usb: printers.filter(p => p.type === 'usb').length,
        network: printers.filter(p => p.type === 'network').length,
        system: printers.filter(p => p.type === 'system').length
      }
    };
  }
}

module.exports = PrinterManager;