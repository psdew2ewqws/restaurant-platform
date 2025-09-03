import React, { useState, useEffect } from 'react';
import {
  ComputerDesktopIcon,
  SignalIcon,
  SignalSlashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  PrinterIcon,
  CpuChipIcon,
  FireIcon,
  BoltIcon,
  WifiIcon
} from '@heroicons/react/24/outline';
import { io, Socket } from 'socket.io-client';

interface PrinterStatus {
  id: string;
  name: string;
  type: 'network' | 'usb' | 'serial' | 'bluetooth';
  status: 'online' | 'offline' | 'busy' | 'error' | 'maintenance';
  connection: {
    ip?: string;
    port?: number;
    signal?: number;
    responseTime?: number;
  };
  hardware: {
    model?: string;
    manufacturer?: string;
    serialNumber?: string;
    firmwareVersion?: string;
  };
  supplies: {
    paperLevel?: number;
    inkLevel?: number;
    ribbonLevel?: number;
  };
  temperature?: number;
  jobsInQueue: number;
  lastActivity?: Date;
  capabilities: string[];
  errors: string[];
  warnings: string[];
  uptime?: number;
  totalJobs?: number;
  successfulJobs?: number;
  failedJobs?: number;
}

interface PrinterStatusDashboardProps {
  companyId?: string;
  branchId?: string;
  refreshInterval?: number;
  autoRefresh?: boolean;
}

export default function PrinterStatusDashboard({
  companyId,
  branchId,
  refreshInterval = 5000,
  autoRefresh = true
}: PrinterStatusDashboardProps) {
  const [printers, setPrinters] = useState<PrinterStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedPrinter, setSelectedPrinter] = useState<PrinterStatus | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Initialize WebSocket connection
    const newSocket = io('ws://localhost:3001/printing', {
      path: '/socket.io/',
      transports: ['websocket']
    });

    newSocket.on('connect', () => {
      console.log('Connected to printer status WebSocket');
      setConnected(true);
      
      // Subscribe to printer updates
      newSocket.emit('subscribe', { 
        channel: 'printer-status',
        companyId,
        branchId 
      });
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from printer status WebSocket');
      setConnected(false);
    });

    newSocket.on('printer-status-update', (data: PrinterStatus) => {
      setPrinters(prev => {
        const index = prev.findIndex(p => p.id === data.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = data;
          return updated;
        }
        return [...prev, data];
      });
    });

    newSocket.on('printer-removed', (printerId: string) => {
      setPrinters(prev => prev.filter(p => p.id !== printerId));
    });

    setSocket(newSocket);

    // Initial data fetch
    fetchPrinterStatuses();

    // Set up auto-refresh if enabled
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchPrinterStatuses, refreshInterval);
    }

    return () => {
      newSocket.disconnect();
      if (interval) clearInterval(interval);
    };
  }, [companyId, branchId, refreshInterval, autoRefresh]);

  const fetchPrinterStatuses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/v1/printing/printers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Enhance with real-time status (mock data for demo)
        const enhancedPrinters = data.map((printer: any) => ({
          id: printer.id,
          name: printer.name,
          type: printer.type,
          status: Math.random() > 0.8 ? 'error' : Math.random() > 0.6 ? 'busy' : 'online',
          connection: {
            ip: printer.connection?.ip,
            port: printer.connection?.port,
            signal: Math.floor(Math.random() * 100),
            responseTime: Math.floor(Math.random() * 200) + 10
          },
          hardware: {
            model: printer.model || 'TM-T88VI',
            manufacturer: printer.manufacturer || 'Epson',
            serialNumber: `SN${Math.random().toString(36).substr(2, 9)}`,
            firmwareVersion: '1.2.3'
          },
          supplies: {
            paperLevel: Math.floor(Math.random() * 100),
            inkLevel: Math.floor(Math.random() * 100),
            ribbonLevel: Math.floor(Math.random() * 100)
          },
          temperature: Math.floor(Math.random() * 20) + 35,
          jobsInQueue: Math.floor(Math.random() * 10),
          lastActivity: new Date(Date.now() - Math.random() * 3600000),
          capabilities: printer.capabilities || ['text', 'cut', 'graphics'],
          errors: Math.random() > 0.7 ? ['Paper jam in main tray'] : [],
          warnings: Math.random() > 0.5 ? ['Low paper level'] : [],
          uptime: Math.floor(Math.random() * 86400),
          totalJobs: Math.floor(Math.random() * 1000) + 100,
          successfulJobs: Math.floor(Math.random() * 950) + 95,
          failedJobs: Math.floor(Math.random() * 50)
        }));

        setPrinters(enhancedPrinters);
      }
    } catch (error) {
      console.error('Error fetching printer statuses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'offline':
        return <SignalSlashIcon className="h-5 w-5 text-gray-500" />;
      case 'busy':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'maintenance':
        return <CpuChipIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <PrinterIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'offline':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'maintenance':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSupplyLevelColor = (level: number) => {
    if (level > 60) return 'bg-green-500';
    if (level > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Printer Status Dashboard</h3>
            <p className="text-sm text-gray-500 mt-1">
              Real-time monitoring of all printers
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <button
              onClick={fetchPrinterStatuses}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Online</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {printers.filter(p => p.status === 'online').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Busy</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {printers.filter(p => p.status === 'busy').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Errors</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {printers.filter(p => p.status === 'error').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {printers.reduce((sum, p) => sum + p.jobsInQueue, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Printer Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {printers.map((printer) => (
          <div key={printer.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(printer.status)}
                  <div>
                    <h4 className="font-medium text-gray-900">{printer.name}</h4>
                    <p className="text-sm text-gray-500">{printer.hardware.manufacturer} {printer.hardware.model}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadgeColor(printer.status)}`}>
                  {printer.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Connection Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {printer.type === 'network' ? (
                    <WifiIcon className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ComputerDesktopIcon className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-600">
                    {printer.connection.ip ? `${printer.connection.ip}:${printer.connection.port}` : printer.type.toUpperCase()}
                  </span>
                </div>
                {printer.connection.signal && (
                  <div className="flex items-center space-x-1">
                    <SignalIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{printer.connection.signal}%</span>
                  </div>
                )}
              </div>

              {/* Supply Levels */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Supply Levels</p>
                {printer.supplies.paperLevel !== undefined && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Paper</span>
                      <span>{printer.supplies.paperLevel}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getSupplyLevelColor(printer.supplies.paperLevel)}`}
                        style={{ width: `${printer.supplies.paperLevel}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                {printer.supplies.inkLevel !== undefined && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Ink</span>
                      <span>{printer.supplies.inkLevel}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getSupplyLevelColor(printer.supplies.inkLevel)}`}
                        style={{ width: `${printer.supplies.inkLevel}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Queue</p>
                  <p className="text-lg font-semibold text-gray-900">{printer.jobsInQueue}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Temp</p>
                  <p className="text-lg font-semibold text-gray-900 flex items-center justify-center">
                    {printer.temperature}°C
                    <FireIcon className="h-4 w-4 text-orange-400 ml-1" />
                  </p>
                </div>
              </div>

              {/* Errors and Warnings */}
              {(printer.errors.length > 0 || printer.warnings.length > 0) && (
                <div className="space-y-2">
                  {printer.errors.map((error, index) => (
                    <div key={`error-${index}`} className="flex items-center space-x-2 p-2 bg-red-50 rounded-md">
                      <ExclamationTriangleIcon className="h-4 w-4 text-red-500 flex-shrink-0" />
                      <span className="text-sm text-red-700">{error}</span>
                    </div>
                  ))}
                  {printer.warnings.map((warning, index) => (
                    <div key={`warning-${index}`} className="flex items-center space-x-2 p-2 bg-yellow-50 rounded-md">
                      <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                      <span className="text-sm text-yellow-700">{warning}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => {
                    setSelectedPrinter(printer);
                    setShowDetails(true);
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 text-sm font-medium"
                >
                  Details
                </button>
                <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm font-medium">
                  Test Print
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Details Modal */}
      {showDetails && selectedPrinter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedPrinter.name} - Details
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Hardware Information</h4>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Manufacturer:</span>
                      <span className="text-sm text-gray-900">{selectedPrinter.hardware.manufacturer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Model:</span>
                      <span className="text-sm text-gray-900">{selectedPrinter.hardware.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Serial Number:</span>
                      <span className="text-sm text-gray-900">{selectedPrinter.hardware.serialNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Firmware:</span>
                      <span className="text-sm text-gray-900">{selectedPrinter.hardware.firmwareVersion}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Performance Statistics</h4>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Uptime:</span>
                      <span className="text-sm text-gray-900">{selectedPrinter.uptime ? formatUptime(selectedPrinter.uptime) : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Jobs:</span>
                      <span className="text-sm text-gray-900">{selectedPrinter.totalJobs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Success Rate:</span>
                      <span className="text-sm text-gray-900">
                        {selectedPrinter.totalJobs ? 
                          Math.round(((selectedPrinter.successfulJobs || 0) / selectedPrinter.totalJobs) * 100) 
                          : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Response Time:</span>
                      <span className="text-sm text-gray-900">{selectedPrinter.connection.responseTime}ms</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Capabilities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPrinter.capabilities.map((capability) => (
                      <span key={capability} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">
                        {capability}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}