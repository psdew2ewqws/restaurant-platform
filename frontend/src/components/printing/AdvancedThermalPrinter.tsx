// Advanced React Thermal Printer Component - 2025 Edition
// Inspired by cutting-edge react-thermal-printer libraries

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AdvancedWebUSBPrinterService } from '../../services/webUSBPrinter';
import { AdvancedWebSerialPrinterService } from '../../services/webSerialPrinter';
import io, { Socket } from 'socket.io-client';

interface ThermalPrinterProps {
  printerId?: string;
  onConnect?: (printer: any) => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
  onStatusUpdate?: (status: any) => void;
  enableWebUSB?: boolean;
  enableWebSerial?: boolean;
  enableWebSocket?: boolean;
  autoConnect?: boolean;
}

interface PrinterCapabilities {
  webUSB: boolean;
  webSerial: boolean;
  webBluetooth: boolean;
  features: string[];
}

interface PrinterStatus {
  connected: boolean;
  status: 'ready' | 'busy' | 'error' | 'offline';
  paperLevel?: number;
  temperature?: number;
  lastError?: string;
  connectionType?: string;
}

export const AdvancedThermalPrinter: React.FC<ThermalPrinterProps> = ({
  printerId = 'default',
  onConnect,
  onDisconnect, 
  onError,
  onStatusUpdate,
  enableWebUSB = true,
  enableWebSerial = true,
  enableWebSocket = true,
  autoConnect = false
}) => {
  // State management
  const [printerStatus, setPrinterStatus] = useState<PrinterStatus>({
    connected: false,
    status: 'offline'
  });
  const [capabilities, setCapabilities] = useState<PrinterCapabilities>({
    webUSB: false,
    webSerial: false,
    webBluetooth: false,
    features: []
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionType, setConnectionType] = useState<'webusb' | 'serial' | 'websocket'>('webusb');

  // Services
  const webUSBService = useRef<AdvancedWebUSBPrinterService | null>(null);
  const webSerialService = useRef<AdvancedWebSerialPrinterService | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Initialize services and check capabilities
  useEffect(() => {
    checkCapabilities();
    
    if (enableWebUSB) {
      webUSBService.current = new AdvancedWebUSBPrinterService();
      setupWebUSBListeners();
    }
    
    if (enableWebSerial) {
      webSerialService.current = new AdvancedWebSerialPrinterService();
      setupWebSerialListeners();
    }
    
    if (enableWebSocket) {
      setupWebSocket();
    }

    return () => {
      cleanup();
    };
  }, []);

  // Check browser capabilities
  const checkCapabilities = () => {
    const caps: PrinterCapabilities = {
      webUSB: 'usb' in navigator && 'requestDevice' in (navigator as any).usb,
      webSerial: 'serial' in navigator,
      webBluetooth: 'bluetooth' in navigator,
      features: []
    };

    // Add feature detection
    if (caps.webUSB) caps.features.push('Direct USB Printing');
    if (caps.webSerial) caps.features.push('Serial Port Printing');
    if (caps.webBluetooth) caps.features.push('Bluetooth Printing');
    if (enableWebSocket) caps.features.push('Network Printing');

    setCapabilities(caps);
    
    // Auto-select best connection type
    if (caps.webUSB && enableWebUSB) {
      setConnectionType('webusb');
    } else if (caps.webSerial && enableWebSerial) {
      setConnectionType('serial');
    } else {
      setConnectionType('websocket');
    }
  };

  // Setup WebUSB event listeners
  const setupWebUSBListeners = () => {
    if (!webUSBService.current) return;

    webUSBService.current.on('connected', (data: any) => {
      setPrinterStatus(prev => ({
        ...prev,
        connected: true,
        status: 'ready',
        connectionType: 'WebUSB'
      }));
      onConnect?.(data);
    });

    webUSBService.current.on('disconnected', () => {
      setPrinterStatus(prev => ({
        ...prev,
        connected: false,
        status: 'offline',
        connectionType: undefined
      }));
      onDisconnect?.();
    });

    webUSBService.current.on('error', (error: any) => {
      setPrinterStatus(prev => ({
        ...prev,
        status: 'error',
        lastError: error.message
      }));
      onError?.(error);
    });

    webUSBService.current.on('statusUpdate', (status: any) => {
      setPrinterStatus(prev => ({
        ...prev,
        paperLevel: status.paperLevel === 'normal' ? 100 : 
                   status.paperLevel === 'low' ? 25 : 0,
        temperature: status.temperature
      }));
      onStatusUpdate?.(status);
    });
  };

  // Setup Web Serial event listeners
  const setupWebSerialListeners = () => {
    if (!webSerialService.current) return;

    webSerialService.current.on('connected', (data: any) => {
      setPrinterStatus(prev => ({
        ...prev,
        connected: true,
        status: 'ready',
        connectionType: 'Serial'
      }));
      onConnect?.(data);
    });

    webSerialService.current.on('disconnected', () => {
      setPrinterStatus(prev => ({
        ...prev,
        connected: false,
        status: 'offline',
        connectionType: undefined
      }));
      onDisconnect?.();
    });

    webSerialService.current.on('error', (error: any) => {
      setPrinterStatus(prev => ({
        ...prev,
        status: 'error',
        lastError: error.message
      }));
      onError?.(error);
    });

    webSerialService.current.on('statusUpdate', (status: any) => {
      setPrinterStatus(prev => ({
        ...prev,
        paperLevel: status.paperLevel === 'normal' ? 100 : 
                   status.paperLevel === 'low' ? 25 : 0
      }));
      onStatusUpdate?.(status);
    });
  };

  // Setup WebSocket connection
  const setupWebSocket = () => {
    if (!enableWebSocket) return;

    socketRef.current = io('ws://localhost:3002/printing', {
      transports: ['websocket']
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to printing WebSocket');
    });

    socketRef.current.on('printerStatusUpdate', (statuses: any[]) => {
      const myPrinter = statuses.find(p => p.printerId === printerId);
      if (myPrinter) {
        setPrinterStatus(prev => ({
          ...prev,
          connected: myPrinter.status !== 'offline',
          status: myPrinter.status,
          paperLevel: myPrinter.paperLevel,
          temperature: myPrinter.temperature,
          connectionType: 'Network'
        }));
        onStatusUpdate?.(myPrinter);
      }
    });

    socketRef.current.on('printJobUpdate', (job: any) => {
      if (job.printerId === printerId) {
        // Update printer status based on job
        setPrinterStatus(prev => ({
          ...prev,
          status: job.status === 'printing' ? 'busy' : 'ready'
        }));
      }
    });

    socketRef.current.on('printerAlerts', (alerts: any[]) => {
      const myAlerts = alerts.filter(a => a.printerId === printerId);
      if (myAlerts.length > 0) {
        const criticalAlert = myAlerts.find(a => a.severity === 'critical');
        if (criticalAlert) {
          setPrinterStatus(prev => ({
            ...prev,
            status: 'error',
            lastError: criticalAlert.message
          }));
        }
      }
    });
  };

  // Connect to printer
  const connectToPrinter = useCallback(async () => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    
    try {
      switch (connectionType) {
        case 'webusb':
          if (webUSBService.current && capabilities.webUSB) {
            await webUSBService.current.connect();
          } else {
            throw new Error('WebUSB not supported or enabled');
          }
          break;
          
        case 'serial':
          if (webSerialService.current && capabilities.webSerial) {
            await webSerialService.current.connect();
          } else {
            throw new Error('Web Serial API not supported or enabled');
          }
          break;
          
        case 'websocket':
          if (socketRef.current) {
            // WebSocket connection is automatic
            setPrinterStatus(prev => ({
              ...prev,
              connected: true,
              status: 'ready',
              connectionType: 'Network'
            }));
          } else {
            throw new Error('WebSocket not connected');
          }
          break;
          
        default:
          throw new Error('No connection method selected');
      }
    } catch (error: any) {
      onError?.(error);
      setPrinterStatus(prev => ({
        ...prev,
        status: 'error',
        lastError: error.message
      }));
    } finally {
      setIsConnecting(false);
    }
  }, [connectionType, capabilities, isConnecting, onError]);

  // Disconnect from printer
  const disconnectFromPrinter = useCallback(async () => {
    try {
      switch (connectionType) {
        case 'webusb':
          if (webUSBService.current) {
            await webUSBService.current.disconnect();
          }
          break;
          
        case 'serial':
          if (webSerialService.current) {
            await webSerialService.current.disconnect();
          }
          break;
          
        case 'websocket':
          if (socketRef.current) {
            socketRef.current.disconnect();
          }
          break;
      }
    } catch (error: any) {
      onError?.(error);
    }
  }, [connectionType, onError]);

  // Print receipt using active service
  const printReceipt = useCallback(async (receiptData: any) => {
    if (!printerStatus.connected) {
      throw new Error('Printer not connected');
    }

    try {
      setPrinterStatus(prev => ({ ...prev, status: 'busy' }));

      switch (connectionType) {
        case 'webusb':
          if (webUSBService.current) {
            await webUSBService.current.printReceipt(receiptData);
          }
          break;
          
        case 'serial':
          if (webSerialService.current) {
            await webSerialService.current.printReceipt(receiptData);
          }
          break;
          
        case 'websocket':
          if (socketRef.current) {
            socketRef.current.emit('submitPrintJob', {
              printerId,
              orderData: receiptData,
              type: 'receipt'
            });
          }
          break;
      }

      // Reset status after a delay
      setTimeout(() => {
        setPrinterStatus(prev => ({ ...prev, status: 'ready' }));
      }, 2000);

    } catch (error: any) {
      setPrinterStatus(prev => ({
        ...prev,
        status: 'error',
        lastError: error.message
      }));
      onError?.(error);
      throw error;
    }
  }, [printerStatus.connected, connectionType, printerId, onError]);

  // Test print
  const testPrint = useCallback(async () => {
    const testReceipt = {
      restaurantName: 'Test Print',
      id: 'TEST-' + Date.now(),
      customerName: 'Test Customer',
      items: [{
        name: 'Test Item',
        quantity: 1,
        price: 10.00,
        modifiers: []
      }],
      subtotal: 10.00,
      tax: 1.00,
      total: 11.00,
      qrCode: `test-receipt-${Date.now()}`
    };

    return await printReceipt(testReceipt);
  }, [printReceipt]);

  // Cleanup
  const cleanup = useCallback(() => {
    if (webUSBService.current) {
      webUSBService.current.disconnect().catch(console.warn);
    }
    if (webSerialService.current) {
      webSerialService.current.disconnect().catch(console.warn);
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  }, []);

  // Get status indicator color
  const getStatusColor = () => {
    switch (printerStatus.status) {
      case 'ready': return 'text-green-500';
      case 'busy': return 'text-blue-500';
      case 'error': return 'text-red-500';
      case 'offline': return 'text-gray-500';
      default: return 'text-gray-400';
    }
  };

  // Get connection type icon
  const getConnectionIcon = () => {
    switch (connectionType) {
      case 'webusb': return '🔌';
      case 'serial': return '📱';
      case 'websocket': return '🌐';
      default: return '🖨️';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span className="text-2xl">🖨️</span>
          Advanced Thermal Printer
        </h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
          {printerStatus.status.toUpperCase()}
        </div>
      </div>

      {/* Capabilities */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Browser Capabilities</h4>
        <div className="flex flex-wrap gap-2">
          {capabilities.features.map((feature, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* Connection Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Connection Type
        </label>
        <select
          value={connectionType}
          onChange={(e) => setConnectionType(e.target.value as any)}
          disabled={printerStatus.connected}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        >
          {capabilities.webUSB && enableWebUSB && (
            <option value="webusb">🔌 Direct USB (WebUSB)</option>
          )}
          {capabilities.webSerial && enableWebSerial && (
            <option value="serial">📱 Serial Port (Web Serial)</option>
          )}
          {enableWebSocket && (
            <option value="websocket">🌐 Network (WebSocket)</option>
          )}
        </select>
      </div>

      {/* Status Information */}
      {printerStatus.connected && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Connection:</span>
              <div className="font-medium flex items-center gap-1">
                <span>{getConnectionIcon()}</span>
                {printerStatus.connectionType}
              </div>
            </div>
            
            {printerStatus.paperLevel !== undefined && (
              <div>
                <span className="text-gray-600">Paper Level:</span>
                <div className="font-medium">
                  {printerStatus.paperLevel}%
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className={`h-2 rounded-full ${
                        printerStatus.paperLevel > 50 ? 'bg-green-500' :
                        printerStatus.paperLevel > 25 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${printerStatus.paperLevel}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            
            {printerStatus.temperature !== undefined && (
              <div>
                <span className="text-gray-600">Temperature:</span>
                <div className="font-medium">
                  {Math.round(printerStatus.temperature)}°C
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {printerStatus.lastError && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{printerStatus.lastError}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {!printerStatus.connected ? (
          <button
            onClick={connectToPrinter}
            disabled={isConnecting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isConnecting ? 'Connecting...' : 'Connect Printer'}
          </button>
        ) : (
          <>
            <button
              onClick={testPrint}
              disabled={printerStatus.status !== 'ready'}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Test Print
            </button>
            <button
              onClick={disconnectFromPrinter}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
            >
              Disconnect
            </button>
          </>
        )}
      </div>

      {/* Advanced Features Indicator */}
      <div className="mt-4 text-center">
        <span className="text-xs text-gray-500">
          🚀 2025 Edition • AI-Optimized • Real-time Monitoring
        </span>
      </div>
    </div>
  );
};

// Export utility hook for using the printer in other components
export const useThermalPrinter = (printerId?: string) => {
  const [printerRef, setPrinterRef] = useState<any>(null);

  const printReceipt = useCallback(async (receiptData: any) => {
    if (!printerRef) {
      throw new Error('Printer not initialized');
    }
    return await printerRef.printReceipt(receiptData);
  }, [printerRef]);

  const testPrint = useCallback(async () => {
    if (!printerRef) {
      throw new Error('Printer not initialized');
    }
    return await printerRef.testPrint();
  }, [printerRef]);

  return {
    printReceipt,
    testPrint,
    setPrinterRef
  };
};

export default AdvancedThermalPrinter;