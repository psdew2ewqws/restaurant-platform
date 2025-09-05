// Advanced Printer Discovery Service - 2025 Edition
// Automatically discovers network printers, USB printers, and legacy serial devices

interface DiscoveredPrinter {
  id: string;
  name: string;
  type: 'network' | 'usb' | 'serial' | 'bluetooth';
  connection: {
    ip?: string;
    port?: number;
    mac?: string;
    serialNumber?: string;
    devicePath?: string;
  };
  capabilities: string[];
  manufacturer?: string;
  model?: string;
  status: 'online' | 'offline' | 'unknown';
  paperLevel?: number;
  lastSeen: Date;
}

interface PrinterDiscoveryOptions {
  networkScan: boolean;
  usbScan: boolean;
  serialScan: boolean;
  bluetoothScan: boolean;
  timeout: number;
}

export class AdvancedPrinterDiscoveryService {
  private eventListeners: Map<string, Function[]> = new Map();
  private discoveredPrinters: Map<string, DiscoveredPrinter> = new Map();
  private isScanning = false;

  // Check browser capabilities
  public getBrowserCapabilities() {
    return {
      webUSB: 'usb' in navigator && typeof (navigator as any).usb.requestDevice === 'function',
      webSerial: 'serial' in navigator && typeof (navigator as any).serial.requestPort === 'function',
      webBluetooth: 'bluetooth' in navigator && typeof (navigator as any).bluetooth.requestDevice === 'function',
      networkScanning: true, // Always available through backend
      secureContext: window.isSecureContext
    };
  }

  // Start comprehensive printer discovery
  public async discoverPrinters(options: Partial<PrinterDiscoveryOptions> = {}): Promise<DiscoveredPrinter[]> {
    const defaultOptions: PrinterDiscoveryOptions = {
      networkScan: true,
      usbScan: true,
      serialScan: true,
      bluetoothScan: false,
      timeout: 30000
    };

    const opts = { ...defaultOptions, ...options };
    
    if (this.isScanning) {
      throw new Error('Discovery already in progress');
    }

    this.isScanning = true;
    this.emit('discoveryStarted', opts);

    try {
      const discoveries = await Promise.allSettled([
        opts.networkScan ? this.discoverNetworkPrinters() : Promise.resolve([]),
        opts.usbScan ? this.discoverUSBPrinters() : Promise.resolve([]),
        opts.serialScan ? this.discoverSerialPrinters() : Promise.resolve([]),
        opts.bluetoothScan ? this.discoverBluetoothPrinters() : Promise.resolve([])
      ]);

      const allPrinters: DiscoveredPrinter[] = [];
      
      discoveries.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allPrinters.push(...result.value);
        } else {
          console.warn(`Discovery method ${index} failed:`, result.reason);
        }
      });

      // Update internal cache
      allPrinters.forEach(printer => {
        this.discoveredPrinters.set(printer.id, printer);
      });

      this.emit('discoveryCompleted', { 
        count: allPrinters.length, 
        printers: allPrinters 
      });

      return allPrinters;

    } catch (error) {
      this.emit('discoveryError', error);
      throw error;
    } finally {
      this.isScanning = false;
    }
  }

  // Discover network printers via backend API
  private async discoverNetworkPrinters(): Promise<DiscoveredPrinter[]> {
    try {
      const response = await fetch('/api/v1/printing/network-discovery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({
          scanRanges: ['10.0.2.0/24', '192.168.1.0/24'], // Multiple network ranges for broader coverage
          ports: [9100, 515, 631], // RAW, LPR, IPP
          timeout: 5000
        })
      });

      if (!response.ok) {
        throw new Error(`Network discovery failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.printers.map((printer: any) => ({
        id: `network-${printer.ip}-${printer.port}`,
        name: printer.hostname || `Network Printer ${printer.ip}`,
        type: 'network' as const,
        connection: {
          ip: printer.ip,
          port: printer.port,
          mac: printer.mac
        },
        capabilities: printer.capabilities || ['cut', 'text'],
        manufacturer: printer.manufacturer,
        model: printer.model,
        status: printer.status || 'online',
        lastSeen: new Date()
      }));

    } catch (error) {
      console.warn('Network printer discovery failed:', error);
      return [];
    }
  }

  // Discover USB printers using WebUSB API
  private async discoverUSBPrinters(): Promise<DiscoveredPrinter[]> {
    if (!this.getBrowserCapabilities().webUSB) {
      return [];
    }

    try {
      const devices = await (navigator as any).usb.getDevices();
      const printers: DiscoveredPrinter[] = [];

      for (const device of devices) {
        // Check if device is a known printer vendor
        const printerVendors = [
          { id: 0x04b8, name: 'Epson' },
          { id: 0x0519, name: 'Star Micronics' },
          { id: 0x20d1, name: 'Bixolon' },
          { id: 0x0416, name: 'Citizen' },
          { id: 0x0fe6, name: 'ICS Advent' },
          { id: 0x154f, name: 'HPRT' }
        ];

        const vendor = printerVendors.find(v => v.id === device.vendorId);
        if (vendor) {
          printers.push({
            id: `usb-${device.vendorId}-${device.productId}-${device.serialNumber || 'unknown'}`,
            name: `${vendor.name} USB Printer`,
            type: 'usb',
            connection: {
              serialNumber: device.serialNumber
            },
            capabilities: ['cut', 'text', 'barcode', 'qr'],
            manufacturer: vendor.name,
            model: `Product ${device.productId.toString(16).toUpperCase()}`,
            status: device.opened ? 'online' : 'offline',
            lastSeen: new Date()
          });
        }
      }

      return printers;

    } catch (error) {
      console.warn('USB printer discovery failed:', error);
      return [];
    }
  }

  // Discover serial printers using Web Serial API
  private async discoverSerialPrinters(): Promise<DiscoveredPrinter[]> {
    if (!this.getBrowserCapabilities().webSerial) {
      return [];
    }

    try {
      const ports = await (navigator as any).serial.getPorts();
      const printers: DiscoveredPrinter[] = [];

      for (const port of ports) {
        const info = port.getInfo();
        printers.push({
          id: `serial-${info.usbVendorId || 'unknown'}-${info.usbProductId || 'unknown'}`,
          name: 'Serial Printer',
          type: 'serial',
          connection: {
            devicePath: info.serialNumber || 'COM/USB'
          },
          capabilities: ['cut', 'text'],
          manufacturer: this.getSerialVendorName(info.usbVendorId),
          model: `Product ${(info.usbProductId || 0).toString(16).toUpperCase()}`,
          status: 'unknown',
          lastSeen: new Date()
        });
      }

      return printers;

    } catch (error) {
      console.warn('Serial printer discovery failed:', error);
      return [];
    }
  }

  // Discover Bluetooth printers using Web Bluetooth API
  private async discoverBluetoothPrinters(): Promise<DiscoveredPrinter[]> {
    if (!this.getBrowserCapabilities().webBluetooth) {
      return [];
    }

    try {
      // Note: This requires user interaction to work
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [
          { services: ['000018f0-0000-1000-8000-00805f9b34fb'] }, // Serial Port Profile
          { namePrefix: 'POS' },
          { namePrefix: 'Printer' }
        ],
        optionalServices: ['battery_service']
      });

      return [{
        id: `bluetooth-${device.id}`,
        name: device.name || 'Bluetooth Printer',
        type: 'bluetooth',
        connection: {
          mac: device.id
        },
        capabilities: ['cut', 'text'],
        manufacturer: 'Unknown',
        model: 'Bluetooth',
        status: device.gatt?.connected ? 'online' : 'offline',
        lastSeen: new Date()
      }];

    } catch (error) {
      // User cancelled or no devices found
      return [];
    }
  }

  // Get vendor name from USB vendor ID
  private getSerialVendorName(vendorId?: number): string {
    if (!vendorId) return 'Unknown';
    
    const vendors: { [key: number]: string } = {
      0x0403: 'FTDI',
      0x067b: 'Prolific',
      0x1a86: 'QinHeng Electronics',
      0x10c4: 'Silicon Labs',
      0x04b8: 'Epson',
      0x0519: 'Star Micronics'
    };

    return vendors[vendorId] || 'Unknown';
  }

  // Validate printer connection
  public async validatePrinter(printer: DiscoveredPrinter): Promise<boolean> {
    try {
      const response = await fetch('/api/v1/printing/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({
          type: printer.type,
          connection: printer.connection,
          timeout: 5000
        })
      });

      const result = await response.json();
      return result.success;

    } catch (error) {
      console.error('Printer validation failed:', error);
      return false;
    }
  }

  // Get printer capabilities
  public async getPrinterCapabilities(printer: DiscoveredPrinter): Promise<string[]> {
    try {
      const response = await fetch('/api/v1/printing/capabilities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({
          type: printer.type,
          connection: printer.connection
        })
      });

      const result = await response.json();
      return result.capabilities || ['cut', 'text'];

    } catch (error) {
      console.error('Failed to get capabilities:', error);
      return ['cut', 'text'];
    }
  }

  // Auto-configure printer settings
  public async autoConfigurePrinter(printer: DiscoveredPrinter): Promise<any> {
    const config = {
      name: printer.name,
      type: this.inferPrinterType(printer),
      connection: printer.type,
      ...printer.connection,
      capabilities: printer.capabilities,
      paperWidth: this.inferPaperWidth(printer),
      dpi: 203, // Standard thermal printer DPI
      maxLineWidth: this.inferMaxLineWidth(printer),
      characterSet: 'utf-8',
      cutType: 'partial'
    };

    return config;
  }

  // Infer printer type from discovered data
  private inferPrinterType(printer: DiscoveredPrinter): 'thermal' | 'receipt' | 'kitchen' | 'label' {
    const name = printer.name.toLowerCase();
    const model = (printer.model || '').toLowerCase();
    
    if (name.includes('kitchen') || model.includes('kitchen')) {
      return 'kitchen';
    }
    if (name.includes('label') || model.includes('label')) {
      return 'label';
    }
    if (name.includes('receipt') || model.includes('pos') || model.includes('tm-')) {
      return 'receipt';
    }
    return 'thermal';
  }

  // Infer paper width from printer model
  private inferPaperWidth(printer: DiscoveredPrinter): number {
    const model = (printer.model || '').toLowerCase();
    
    // Common thermal printer paper widths
    if (model.includes('80mm') || model.includes('tm-t88') || model.includes('rp-80')) {
      return 80;
    }
    if (model.includes('58mm') || model.includes('tm-t20') || model.includes('rp-58')) {
      return 58;
    }
    if (model.includes('112mm') || model.includes('4inch')) {
      return 112;
    }
    
    return 80; // Default to 80mm
  }

  // Infer maximum line width in characters
  private inferMaxLineWidth(printer: DiscoveredPrinter): number {
    const paperWidth = this.inferPaperWidth(printer);
    
    // Calculate characters per line based on paper width
    // Assuming 12 CPI (characters per inch) for thermal printers
    const widthInInches = paperWidth / 25.4; // Convert mm to inches
    return Math.floor(widthInInches * 12);
  }

  // Event system
  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  public off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${event} listener:`, error);
      }
    });
  }

  // Get cached discoveries
  public getCachedPrinters(): DiscoveredPrinter[] {
    return Array.from(this.discoveredPrinters.values());
  }

  // Clear cache
  public clearCache(): void {
    this.discoveredPrinters.clear();
  }

  // Check if scanning is in progress
  public isDiscoveryInProgress(): boolean {
    return this.isScanning;
  }
}

// Create singleton instance
export const printerDiscovery = new AdvancedPrinterDiscoveryService();