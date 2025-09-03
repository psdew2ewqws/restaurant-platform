// Advanced Printer Discovery Component - 2025 Edition
import { useState, useEffect, useCallback } from 'react';
import { 
  MagnifyingGlassIcon,
  WifiIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  SignalIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  PlusIcon,
  CogIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { printerDiscovery } from '../../services/printerDiscovery';

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

interface PrinterDiscoveryProps {
  onPrinterSelect?: (printer: DiscoveredPrinter) => void;
  onPrinterAdd?: (config: any) => void;
}

export default function PrinterDiscovery({ onPrinterSelect, onPrinterAdd }: PrinterDiscoveryProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredPrinters, setDiscoveredPrinters] = useState<DiscoveredPrinter[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<DiscoveredPrinter | null>(null);
  const [browserCapabilities, setBrowserCapabilities] = useState<any>({});
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check browser capabilities on mount
    const capabilities = printerDiscovery.getBrowserCapabilities();
    setBrowserCapabilities(capabilities);

    // Load cached discoveries
    const cached = printerDiscovery.getCachedPrinters();
    setDiscoveredPrinters(cached);

    // Set up event listeners
    const handleDiscoveryStarted = (options: any) => {
      setScanStatus('Starting discovery...');
      setScanProgress(10);
    };

    const handleDiscoveryCompleted = (result: any) => {
      setDiscoveredPrinters(result.printers);
      setScanStatus(`Found ${result.count} printers`);
      setScanProgress(100);
      setTimeout(() => {
        setIsScanning(false);
        setScanProgress(0);
        setScanStatus('');
      }, 2000);
    };

    const handleDiscoveryError = (error: any) => {
      setError(error.message);
      setIsScanning(false);
      setScanProgress(0);
      setScanStatus('');
    };

    printerDiscovery.on('discoveryStarted', handleDiscoveryStarted);
    printerDiscovery.on('discoveryCompleted', handleDiscoveryCompleted);
    printerDiscovery.on('discoveryError', handleDiscoveryError);

    return () => {
      printerDiscovery.off('discoveryStarted', handleDiscoveryStarted);
      printerDiscovery.off('discoveryCompleted', handleDiscoveryCompleted);
      printerDiscovery.off('discoveryError', handleDiscoveryError);
    };
  }, []);

  const startDiscovery = useCallback(async () => {
    if (isScanning) return;
    
    setIsScanning(true);
    setError(null);
    setScanStatus('Initializing...');
    setScanProgress(5);

    try {
      const printers = await printerDiscovery.discoverPrinters({
        networkScan: true,
        usbScan: browserCapabilities.webUSB,
        serialScan: browserCapabilities.webSerial,
        bluetoothScan: browserCapabilities.webBluetooth,
        timeout: 30000
      });

      setDiscoveredPrinters(printers);
    } catch (error: any) {
      setError(error.message);
    }
  }, [isScanning, browserCapabilities]);

  const validatePrinter = useCallback(async (printer: DiscoveredPrinter) => {
    try {
      setScanStatus(`Validating ${printer.name}...`);
      const isValid = await printerDiscovery.validatePrinter(printer);
      
      if (isValid) {
        // Update printer status
        setDiscoveredPrinters(prev => 
          prev.map(p => p.id === printer.id ? { ...p, status: 'online' as const } : p)
        );
        setScanStatus(`${printer.name} validated successfully`);
      } else {
        setDiscoveredPrinters(prev => 
          prev.map(p => p.id === printer.id ? { ...p, status: 'offline' as const } : p)
        );
        setScanStatus(`${printer.name} validation failed`);
      }

      setTimeout(() => setScanStatus(''), 3000);
    } catch (error: any) {
      setError(error.message);
    }
  }, []);

  const autoConfigurePrinter = useCallback(async (printer: DiscoveredPrinter) => {
    try {
      const config = await printerDiscovery.autoConfigurePrinter(printer);
      if (onPrinterAdd) {
        onPrinterAdd(config);
      }
    } catch (error: any) {
      setError(error.message);
    }
  }, [onPrinterAdd]);

  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'network':
        return <WifiIcon className="w-5 h-5 text-blue-500" />;
      case 'usb':
        return <ComputerDesktopIcon className="w-5 h-5 text-green-500" />;
      case 'serial':
        return <DevicePhoneMobileIcon className="w-5 h-5 text-orange-500" />;
      case 'bluetooth':
        return <SignalIcon className="w-5 h-5 text-purple-500" />;
      default:
        return <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800';
      case 'offline':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Browser Capabilities */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Browser Capabilities</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className={`flex items-center space-x-1 ${browserCapabilities.webUSB ? 'text-green-700' : 'text-red-700'}`}>
            <span className={`w-2 h-2 rounded-full ${browserCapabilities.webUSB ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span>WebUSB</span>
          </div>
          <div className={`flex items-center space-x-1 ${browserCapabilities.webSerial ? 'text-green-700' : 'text-red-700'}`}>
            <span className={`w-2 h-2 rounded-full ${browserCapabilities.webSerial ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span>Web Serial</span>
          </div>
          <div className={`flex items-center space-x-1 ${browserCapabilities.webBluetooth ? 'text-green-700' : 'text-red-700'}`}>
            <span className={`w-2 h-2 rounded-full ${browserCapabilities.webBluetooth ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span>Bluetooth</span>
          </div>
          <div className={`flex items-center space-x-1 ${browserCapabilities.secureContext ? 'text-green-700' : 'text-red-700'}`}>
            <span className={`w-2 h-2 rounded-full ${browserCapabilities.secureContext ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span>Secure Context</span>
          </div>
        </div>
        {!browserCapabilities.secureContext && (
          <div className="mt-2 text-xs text-red-600">
            ⚠️ HTTPS or localhost required for WebUSB/Web Serial APIs
          </div>
        )}
      </div>

      {/* Discovery Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Printer Discovery</h3>
          <p className="text-sm text-gray-500">
            Automatically find network, USB, and serial printers
          </p>
        </div>
        <button
          onClick={startDiscovery}
          disabled={isScanning}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isScanning ? (
            <>
              <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
              Discover Printers
            </>
          )}
        </button>
      </div>

      {/* Scanning Progress */}
      {isScanning && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">{scanStatus}</span>
            <span className="text-sm text-gray-500">{scanProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${scanProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationCircleIcon className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700 text-sm">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Discovered Printers */}
      {discoveredPrinters.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-4 py-3 border-b border-gray-200">
            <h4 className="text-sm font-medium text-gray-900">
              Discovered Printers ({discoveredPrinters.length})
            </h4>
          </div>
          <div className="divide-y divide-gray-200">
            {discoveredPrinters.map((printer) => (
              <div 
                key={printer.id}
                className={`p-4 hover:bg-gray-50 ${selectedPrinter?.id === printer.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getConnectionIcon(printer.type)}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <h5 className="text-sm font-medium text-gray-900 truncate">
                          {printer.name}
                        </h5>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(printer.status)}`}>
                          {printer.status}
                        </span>
                      </div>
                      
                      <div className="mt-1 space-y-1">
                        {printer.manufacturer && (
                          <p className="text-xs text-gray-500">
                            {printer.manufacturer} {printer.model}
                          </p>
                        )}
                        
                        {printer.connection.ip && (
                          <p className="text-xs text-gray-500">
                            {printer.connection.ip}:{printer.connection.port}
                          </p>
                        )}
                        
                        {printer.connection.serialNumber && (
                          <p className="text-xs text-gray-500">
                            S/N: {printer.connection.serialNumber}
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="w-3 h-3" />
                            <span>{formatLastSeen(printer.lastSeen)}</span>
                          </div>
                          
                          {printer.capabilities.length > 0 && (
                            <div className="flex items-center space-x-1">
                              <span>Capabilities:</span>
                              <span className="font-medium">{printer.capabilities.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => validatePrinter(printer)}
                      className="inline-flex items-center px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                      title="Validate connection"
                    >
                      <CheckCircleIcon className="w-3 h-3 mr-1" />
                      Test
                    </button>
                    
                    <button
                      onClick={() => setSelectedPrinter(printer)}
                      className="inline-flex items-center px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                      title="Configure"
                    >
                      <CogIcon className="w-3 h-3 mr-1" />
                      Config
                    </button>
                    
                    <button
                      onClick={() => autoConfigurePrinter(printer)}
                      className="inline-flex items-center px-2 py-1 text-xs bg-green-600 text-white hover:bg-green-700 rounded"
                      title="Add to system"
                    >
                      <PlusIcon className="w-3 h-3 mr-1" />
                      Add
                    </button>
                  </div>
                </div>
                
                {printer.paperLevel !== undefined && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Paper Level</span>
                      <span className="font-medium">{Math.round(printer.paperLevel)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                      <div 
                        className={`h-1 rounded-full ${
                          printer.paperLevel > 25 ? 'bg-green-500' : 
                          printer.paperLevel > 10 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${printer.paperLevel}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {discoveredPrinters.length === 0 && !isScanning && (
        <div className="text-center py-8 bg-white border border-gray-200 rounded-lg">
          <MagnifyingGlassIcon className="mx-auto h-8 w-8 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No printers discovered</h3>
          <p className="mt-1 text-sm text-gray-500">
            Click "Discover Printers" to scan for available printers on your network and connected devices.
          </p>
        </div>
      )}

      {/* Selected Printer Details */}
      {selectedPrinter && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900">Printer Configuration</h4>
            <button
              onClick={() => setSelectedPrinter(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-3 text-sm">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={selectedPrinter.name}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                readOnly
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                <input
                  type="text"
                  value={selectedPrinter.type}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <input
                  type="text"
                  value={selectedPrinter.status}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  readOnly
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Capabilities</label>
              <input
                type="text"
                value={selectedPrinter.capabilities.join(', ')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                readOnly
              />
            </div>
            
            <div className="pt-3 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedPrinter(null)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => autoConfigurePrinter(selectedPrinter)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Printer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}