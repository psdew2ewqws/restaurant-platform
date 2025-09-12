const { exec } = require('child_process');
const { promisify } = require('util');
const ping = require('ping');
const os = require('os');
const fs = require('fs');
const path = require('path');
const usb = require('usb');

const execAsync = promisify(exec);

class PrinterDiscovery {
  constructor(logger) {
    this.logger = logger;
    this.networkScanRanges = [
      '192.168.1.0/24',
      '192.168.0.0/24',
      '10.0.0.0/24',
      '172.16.0.0/24'
    ];
    
    // Common thermal printer vendor IDs
    this.thermalPrinterVendors = {
      0x04b8: 'Epson',
      0x04f9: 'Brother',
      0x0619: 'Star Micronics',
      0x20d1: 'Zebra',
      0x1a86: 'QinHeng Electronics', // CH340 USB-Serial
      0x067b: 'Prolific Technology', // PL2303 USB-Serial
      0x0403: 'FTDI', // FTDI USB-Serial
      0x1fc9: 'NXP Semiconductors'
    };
    
    // Common thermal printer models
    this.thermalPrinterModels = [
      'TM-T20', 'TM-T88', 'TM-U220', 'TM-L90', // Epson
      'QL-570', 'QL-700', 'TD-4000', 'RJ-2150', // Brother
      'TSP100', 'TSP143', 'TSP650', 'TSP700', // Star Micronics
      'ZD410', 'ZD420', 'GX420d', 'GX430t', // Zebra
      'XP-58', 'POS-58', 'POS-80' // Generic
    ];
  }

  async discoverAll() {
    this.logger.info('Starting comprehensive printer discovery...');
    
    const discoveredPrinters = new Map();
    
    try {
      // Discover USB printers
      const usbPrinters = await this.discoverUSBPrinters();
      usbPrinters.forEach(printer => {
        discoveredPrinters.set(printer.id, printer);
      });
      
      // Discover network printers
      const networkPrinters = await this.discoverNetworkPrinters();
      networkPrinters.forEach(printer => {
        discoveredPrinters.set(printer.id, printer);
      });
      
      // Discover system printers
      const systemPrinters = await this.discoverSystemPrinters();
      systemPrinters.forEach(printer => {
        if (!discoveredPrinters.has(printer.id)) {
          discoveredPrinters.set(printer.id, printer);
        }
      });
      
      const results = Array.from(discoveredPrinters.values());
      this.logger.info(`Discovery completed. Found ${results.length} printers`);
      
      return results;
      
    } catch (error) {
      this.logger.error('Error during printer discovery:', error);
      return [];
    }
  }

  async discoverUSBPrinters() {
    this.logger.info('Discovering USB thermal printers...');
    const usbPrinters = [];
    
    try {
      // Get USB devices
      const devices = usb.getDeviceList();
      
      for (const device of devices) {
        try {
          const descriptor = device.deviceDescriptor;
          const vendorId = descriptor.idVendor;
          const productId = descriptor.idProduct;
          
          // Check if it's a known thermal printer vendor
          const vendorName = this.thermalPrinterVendors[vendorId];
          if (!vendorName) continue;
          
          // Try to open device to get more info
          let manufacturerName = vendorName;
          let productName = 'Unknown Model';
          let serialNumber = 'Unknown';
          
          try {
            device.open();
            
            if (descriptor.iManufacturer) {
              manufacturerName = await this.getUSBStringDescriptor(device, descriptor.iManufacturer);
            }
            
            if (descriptor.iProduct) {
              productName = await this.getUSBStringDescriptor(device, descriptor.iProduct);
            }
            
            if (descriptor.iSerialNumber) {
              serialNumber = await this.getUSBStringDescriptor(device, descriptor.iSerialNumber);
            }
            
            device.close();
            
          } catch (openError) {
            // Can't open device, use defaults
            this.logger.debug(`Cannot open USB device ${vendorId}:${productId}:`, openError.message);
          }
          
          // Check if product name suggests it's a thermal printer
          const isThermalPrinter = this.thermalPrinterModels.some(model => 
            productName.toLowerCase().includes(model.toLowerCase())
          ) || productName.toLowerCase().includes('thermal') ||
             productName.toLowerCase().includes('receipt') ||
             productName.toLowerCase().includes('pos');
          
          const printer = {
            id: `usb_${vendorId}_${productId}_${serialNumber}`,
            name: `${manufacturerName} ${productName}`,
            type: 'usb',
            interface: 'USB',
            status: 'unknown',
            vendor: manufacturerName,
            model: productName,
            serialNumber: serialNumber,
            vendorId: vendorId,
            productId: productId,
            isThermal: isThermalPrinter,
            capabilities: {
              thermal: isThermalPrinter,
              escpos: isThermalPrinter,
              graphics: true,
              cutter: true,
              cashdrawer: true
            },
            connection: {
              type: 'usb',
              path: `USB:${vendorId.toString(16).toUpperCase()}:${productId.toString(16).toUpperCase()}`,
              device: device
            },
            discoveredAt: new Date().toISOString(),
            lastSeen: new Date().toISOString()
          };
          
          usbPrinters.push(printer);
          
        } catch (error) {
          this.logger.debug('Error processing USB device:', error);
        }
      }
      
      this.logger.info(`Found ${usbPrinters.length} USB thermal printers`);
      return usbPrinters;
      
    } catch (error) {
      this.logger.error('Error discovering USB printers:', error);
      return [];
    }
  }

  async getUSBStringDescriptor(device, index) {
    return new Promise((resolve, reject) => {
      device.getStringDescriptor(index, (error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
  }

  async discoverNetworkPrinters() {
    this.logger.info('Discovering network thermal printers...');
    const networkPrinters = [];
    
    try {
      // Get local network interfaces
      const interfaces = os.networkInterfaces();
      const scanRanges = [];
      
      // Generate scan ranges based on local interfaces
      Object.values(interfaces).forEach(interfaceList => {
        interfaceList.forEach(iface => {
          if (!iface.internal && iface.family === 'IPv4') {
            const ip = iface.address;
            const netmask = iface.netmask;
            const subnet = this.calculateSubnet(ip, netmask);
            if (subnet) {
              scanRanges.push(subnet);
            }
          }
        });
      });
      
      // Add default scan ranges
      scanRanges.push(...this.networkScanRanges);
      
      // Remove duplicates
      const uniqueRanges = [...new Set(scanRanges)];
      
      for (const range of uniqueRanges.slice(0, 3)) { // Limit to 3 ranges for performance
        const printers = await this.scanNetworkRange(range);
        networkPrinters.push(...printers);
      }
      
      this.logger.info(`Found ${networkPrinters.length} network thermal printers`);
      return networkPrinters;
      
    } catch (error) {
      this.logger.error('Error discovering network printers:', error);
      return [];
    }
  }

  calculateSubnet(ip, netmask) {
    try {
      const ipParts = ip.split('.').map(Number);
      const maskParts = netmask.split('.').map(Number);
      
      const networkParts = ipParts.map((part, i) => part & maskParts[i]);
      
      // Calculate CIDR
      const cidr = maskParts.map(part => {
        return part.toString(2).split('1').length - 1;
      }).reduce((a, b) => a + b, 0);
      
      return `${networkParts.join('.')/${cidr}`;
      
    } catch (error) {
      this.logger.debug('Error calculating subnet:', error);
      return null;
    }
  }

  async scanNetworkRange(range) {
    this.logger.debug(`Scanning network range: ${range}`);
    const printers = [];
    
    try {
      // Parse CIDR range
      const [network, cidrBits] = range.split('/');
      const networkParts = network.split('.').map(Number);
      
      // For /24 networks, scan 1-254
      if (cidrBits === '24') {
        const baseNetwork = `${networkParts[0]}.${networkParts[1]}.${networkParts[2]}`;
        const scanPromises = [];
        
        // Scan in batches to avoid overwhelming the network
        for (let i = 1; i <= 254; i += 20) {
          const batchPromises = [];
          
          for (let j = i; j < i + 20 && j <= 254; j++) {
            const ip = `${baseNetwork}.${j}`;
            batchPromises.push(this.checkNetworkPrinter(ip));
          }
          
          const batchResults = await Promise.allSettled(batchPromises);
          batchResults.forEach(result => {
            if (result.status === 'fulfilled' && result.value) {
              printers.push(result.value);
            }
          });
          
          // Small delay between batches
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      return printers;
      
    } catch (error) {
      this.logger.debug(`Error scanning range ${range}:`, error);
      return [];
    }
  }

  async checkNetworkPrinter(ip) {
    try {
      // First ping to check if host is alive
      const pingResult = await ping.promise.probe(ip, { timeout: 1, min_reply: 1 });
      if (!pingResult.alive) {
        return null;
      }
      
      // Check common printer ports
      const printerPorts = [9100, 515, 631, 80, 443, 8080];
      let openPorts = [];
      
      for (const port of printerPorts) {
        try {
          const isOpen = await this.checkPort(ip, port, 2000);
          if (isOpen) {
            openPorts.push(port);
          }
        } catch (error) {
          // Port check failed, continue
        }
      }
      
      if (openPorts.length === 0) {
        return null;
      }
      
      // Try to identify printer via SNMP or HTTP
      const printerInfo = await this.identifyNetworkPrinter(ip, openPorts);
      
      if (printerInfo) {
        const printer = {
          id: `network_${ip.replace(/\./g, '_')}`,
          name: printerInfo.name || `Network Printer (${ip})`,
          type: 'network',
          interface: 'Network',
          status: 'online',
          vendor: printerInfo.vendor || 'Unknown',
          model: printerInfo.model || 'Unknown',
          serialNumber: printerInfo.serialNumber || 'Unknown',
          ipAddress: ip,
          openPorts: openPorts,
          isThermal: printerInfo.isThermal || true, // Assume thermal for now
          capabilities: {
            thermal: printerInfo.isThermal || true,
            escpos: printerInfo.isThermal || true,
            graphics: true,
            cutter: true,
            cashdrawer: true
          },
          connection: {
            type: 'network',
            ip: ip,
            port: openPorts.includes(9100) ? 9100 : openPorts[0],
            protocol: openPorts.includes(9100) ? 'raw' : 'lpr'
          },
          discoveredAt: new Date().toISOString(),
          lastSeen: new Date().toISOString()
        };
        
        return printer;
      }
      
      return null;
      
    } catch (error) {
      return null;
    }
  }

  async checkPort(host, port, timeout = 5000) {
    return new Promise((resolve) => {
      const net = require('net');
      const socket = new net.Socket();
      
      const timer = setTimeout(() => {
        socket.destroy();
        resolve(false);
      }, timeout);
      
      socket.connect(port, host, () => {
        clearTimeout(timer);
        socket.destroy();
        resolve(true);
      });
      
      socket.on('error', () => {
        clearTimeout(timer);
        resolve(false);
      });
    });
  }

  async identifyNetworkPrinter(ip, openPorts) {
    try {
      let printerInfo = { isThermal: true }; // Default assumption
      
      // Try HTTP/HTTPS first for modern printers
      if (openPorts.includes(80) || openPorts.includes(443) || openPorts.includes(8080)) {
        const httpInfo = await this.getHTTPPrinterInfo(ip, openPorts);
        if (httpInfo) {
          Object.assign(printerInfo, httpInfo);
        }
      }
      
      // Try raw port communication for thermal printers
      if (openPorts.includes(9100)) {
        const rawInfo = await this.getRawPrinterInfo(ip, 9100);
        if (rawInfo) {
          Object.assign(printerInfo, rawInfo);
        }
      }
      
      return printerInfo;
      
    } catch (error) {
      this.logger.debug(`Error identifying printer at ${ip}:`, error);
      return { isThermal: true }; // Default assumption
    }
  }

  async getHTTPPrinterInfo(ip, openPorts) {
    try {
      const axios = require('axios');
      const port = openPorts.includes(80) ? 80 : (openPorts.includes(8080) ? 8080 : 443);
      const protocol = port === 443 ? 'https' : 'http';
      
      const response = await axios.get(`${protocol}://${ip}:${port}/`, {
        timeout: 3000,
        headers: { 'User-Agent': 'PrinterMaster/2.0' }
      });
      
      const html = response.data.toLowerCase();
      
      // Extract printer information from HTML
      let vendor = 'Unknown';
      let model = 'Unknown';
      let isThermal = false;
      
      // Check for known vendors
      if (html.includes('epson')) {
        vendor = 'Epson';
        isThermal = true;
      } else if (html.includes('brother')) {
        vendor = 'Brother';
        isThermal = true;
      } else if (html.includes('star micronics') || html.includes('star tsp')) {
        vendor = 'Star Micronics';
        isThermal = true;
      } else if (html.includes('zebra')) {
        vendor = 'Zebra';
        isThermal = true;
      }
      
      // Check for thermal printer indicators
      if (html.includes('thermal') || html.includes('receipt') || html.includes('pos printer')) {
        isThermal = true;
      }
      
      return { vendor, model, isThermal, name: `${vendor} ${model}` };
      
    } catch (error) {
      return null;
    }
  }

  async getRawPrinterInfo(ip, port) {
    try {
      const net = require('net');
      
      return new Promise((resolve) => {
        const socket = new net.Socket();
        let data = '';
        
        const timeout = setTimeout(() => {
          socket.destroy();
          resolve(null);
        }, 3000);
        
        socket.connect(port, ip, () => {
          // Send ESC/POS status inquiry command
          socket.write(Buffer.from([0x1D, 0x72, 0x01])); // GS r 1
        });
        
        socket.on('data', (chunk) => {
          data += chunk.toString();
          clearTimeout(timeout);
          socket.destroy();
          
          // Basic thermal printer response indicates this is likely a thermal printer
          resolve({
            isThermal: true,
            vendor: 'Unknown',
            model: 'Thermal Printer',
            name: 'Network Thermal Printer'
          });
        });
        
        socket.on('error', () => {
          clearTimeout(timeout);
          resolve(null);
        });
      });
      
    } catch (error) {
      return null;
    }
  }

  async discoverSystemPrinters() {
    this.logger.info('Discovering system-installed printers...');
    const systemPrinters = [];
    
    try {
      let command;
      
      if (process.platform === 'win32') {
        command = 'wmic printer get name,drivername,portname /format:csv';
      } else if (process.platform === 'darwin') {
        command = 'lpstat -p -d';
      } else {
        command = 'lpstat -p -d';
      }
      
      const { stdout } = await execAsync(command);
      const printers = this.parseSystemPrinterOutput(stdout, process.platform);
      
      systemPrinters.push(...printers);
      
    } catch (error) {
      this.logger.debug('Error discovering system printers:', error);
    }
    
    this.logger.info(`Found ${systemPrinters.length} system printers`);
    return systemPrinters;
  }

  parseSystemPrinterOutput(output, platform) {
    const printers = [];
    
    try {
      if (platform === 'win32') {
        const lines = output.split('\\n').filter(line => line.trim());
        
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(',');
          if (parts.length >= 4) {
            const name = parts[2]?.trim();
            const driverName = parts[1]?.trim();
            const portName = parts[3]?.trim();
            
            if (name && name !== 'Name') {
              const isThermal = this.isThermalPrinterName(name) || 
                               this.isThermalPrinterName(driverName);
              
              printers.push({
                id: `system_${name.replace(/[^a-zA-Z0-9]/g, '_')}`,
                name: name,
                type: 'system',
                interface: 'System',
                status: 'available',
                vendor: this.extractVendorFromName(name),
                model: this.extractModelFromName(name),
                driverName: driverName,
                portName: portName,
                isThermal: isThermal,
                capabilities: {
                  thermal: isThermal,
                  escpos: isThermal,
                  graphics: true,
                  cutter: isThermal,
                  cashdrawer: isThermal
                },
                connection: {
                  type: 'system',
                  name: name,
                  port: portName
                },
                discoveredAt: new Date().toISOString(),
                lastSeen: new Date().toISOString()
              });
            }
          }
        }
        
      } else {
        // Linux/macOS
        const lines = output.split('\\n').filter(line => line.trim());
        
        lines.forEach(line => {
          if (line.startsWith('printer ')) {
            const match = line.match(/printer\\s+([^\\s]+)\\s+(.+)/);
            if (match) {
              const name = match[1];
              const description = match[2];
              const isThermal = this.isThermalPrinterName(name) || 
                               this.isThermalPrinterName(description);
              
              printers.push({
                id: `system_${name.replace(/[^a-zA-Z0-9]/g, '_')}`,
                name: name,
                type: 'system',
                interface: 'System',
                status: 'available',
                vendor: this.extractVendorFromName(name),
                model: this.extractModelFromName(name),
                description: description,
                isThermal: isThermal,
                capabilities: {
                  thermal: isThermal,
                  escpos: isThermal,
                  graphics: true,
                  cutter: isThermal,
                  cashdrawer: isThermal
                },
                connection: {
                  type: 'system',
                  name: name
                },
                discoveredAt: new Date().toISOString(),
                lastSeen: new Date().toISOString()
              });
            }
          }
        });
      }
      
    } catch (error) {
      this.logger.error('Error parsing system printer output:', error);
    }
    
    return printers;
  }

  isThermalPrinterName(name) {
    if (!name) return false;
    
    const lowerName = name.toLowerCase();
    
    // Check for thermal printer indicators
    const thermalIndicators = [
      'thermal', 'receipt', 'pos', 'tm-t', 'tm-u', 'tm-l',
      'tsp', 'star', 'epson', 'ql-', 'td-', 'rj-',
      'zd', 'gx', 'xp-58', 'pos-58', 'pos-80'
    ];
    
    return thermalIndicators.some(indicator => lowerName.includes(indicator));
  }

  extractVendorFromName(name) {
    if (!name) return 'Unknown';
    
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('epson')) return 'Epson';
    if (lowerName.includes('brother')) return 'Brother';
    if (lowerName.includes('star')) return 'Star Micronics';
    if (lowerName.includes('zebra')) return 'Zebra';
    if (lowerName.includes('canon')) return 'Canon';
    if (lowerName.includes('hp')) return 'HP';
    
    return 'Unknown';
  }

  extractModelFromName(name) {
    if (!name) return 'Unknown';
    
    // Try to extract model number/name from the printer name
    const modelMatch = name.match(/([A-Z]{2,}-[A-Z0-9]+|[A-Z]{2,}[0-9]+)/i);
    return modelMatch ? modelMatch[1] : 'Unknown';
  }
}

module.exports = PrinterDiscovery;