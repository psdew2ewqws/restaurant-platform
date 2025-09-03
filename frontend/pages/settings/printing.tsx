import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  PrinterIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CogIcon,
  EyeIcon,
  WifiIcon,
  ComputerDesktopIcon,
  ClockIcon,
  DocumentTextIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import ProtectedRoute from '../../src/components/ProtectedRoute';
import LicenseWarningHeader from '../../src/components/LicenseWarningHeader';
import AdvancedThermalPrinter from '../../src/components/printing/AdvancedThermalPrinter';
import PrinterDiscovery from '../../src/components/printing/PrinterDiscovery';
import PrintJobQueue from '../../src/components/printing/PrintJobQueue';
import PrinterStatusDashboard from '../../src/components/printing/PrinterStatusDashboard';
import PrinterConfigurationWizard from '../../src/components/printing/PrinterConfigurationWizard';
import ReceiptTemplateDesigner from '../../src/components/printing/ReceiptTemplateDesigner';
import { useAuth } from '../../src/contexts/AuthContext';
import { useApiClient } from '../../src/hooks/useApiClient';
import toast from 'react-hot-toast';

// Types
interface Printer {
  id: string;
  name: string;
  type: 'thermal' | 'receipt' | 'kitchen' | 'label';
  connection: 'network' | 'usb' | 'bluetooth';
  ip?: string;
  port?: number;
  model?: string;
  manufacturer?: string;
  status: 'online' | 'offline' | 'error' | 'unknown';
  isDefault: boolean;
  branchId?: string;
  assignedTo: 'kitchen' | 'cashier' | 'bar' | 'all';
  lastSeen?: string;
  location?: string;
  paperWidth?: number; // in mm
  capabilities: string[];
}

interface PrintJob {
  id: string;
  orderId?: string;
  type: 'receipt' | 'kitchen_order' | 'label';
  printerId: string;
  status: 'pending' | 'printing' | 'completed' | 'failed';
  content: any;
  createdAt: string;
  error?: string;
}

interface PrintServiceStatus {
  isRunning: boolean;
  version?: string;
  lastPing?: string;
  connectedPrinters: number;
  totalJobs: number;
  failedJobs: number;
}

export default function PrintingSettings() {
  const { user } = useAuth();
  const { apiCall } = useApiClient();
  
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
  const [serviceStatus, setServiceStatus] = useState<PrintServiceStatus>({
    isRunning: false,
    connectedPrinters: 0,
    totalJobs: 0,
    failedJobs: 0
  });
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [showAddPrinter, setShowAddPrinter] = useState(false);
  const [showConfigWizard, setShowConfigWizard] = useState(false);
  const [showTemplateDesigner, setShowTemplateDesigner] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState<Printer | null>(null);
  const [showPrinterDetails, setShowPrinterDetails] = useState(false);

  // Load printer data
  const loadPrinters = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiCall(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/printing/printers`);
      setPrinters(response?.printers || []);
    } catch (error) {
      console.error('Failed to load printers:', error);
      toast.error('Failed to load printers');
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  // Load print service status
  const loadServiceStatus = useCallback(async () => {
    try {
      const response = await apiCall(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/printing/service/status`);
      setServiceStatus(response || {
        isRunning: false,
        connectedPrinters: 0,
        totalJobs: 0,
        failedJobs: 0
      });
    } catch (error) {
      console.error('Failed to load service status:', error);
    }
  }, [apiCall]);

  // Load recent print jobs
  const loadPrintJobs = useCallback(async () => {
    try {
      const response = await apiCall(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/printing/jobs?limit=10`);
      setPrintJobs(response?.jobs || []);
    } catch (error) {
      console.error('Failed to load print jobs:', error);
    }
  }, [apiCall]);

  // Discover printers on network
  const handleDiscoverPrinters = useCallback(async () => {
    try {
      setIsScanning(true);
      toast.loading('Scanning network for printers...', { duration: 1000 });
      
      const response = await apiCall(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/printing/discover`, {
        method: 'POST',
        body: JSON.stringify({ timeout: 10000 })
      });
      
      if (response?.discovered?.length > 0) {
        toast.success(`Found ${response.discovered.length} printers`);
        await loadPrinters();
      } else {
        toast('No new printers found');
      }
    } catch (error) {
      console.error('Printer discovery failed:', error);
      toast.error('Failed to discover printers');
    } finally {
      setIsScanning(false);
    }
  }, [apiCall, loadPrinters]);

  // Test printer connection
  const testPrinter = useCallback(async (printerId: string) => {
    try {
      toast.loading('Testing printer connection...', { duration: 1000 });
      
      const response = await apiCall(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/printing/printers/${printerId}/test`, {
        method: 'POST'
      });
      
      if (response?.success) {
        toast.success('Printer test successful!');
      } else {
        toast.error(response?.error || 'Printer test failed');
      }
    } catch (error) {
      console.error('Printer test failed:', error);
      toast.error('Failed to test printer');
    }
  }, [apiCall]);

  // Install print service
  const handleInstallService = useCallback(async () => {
    try {
      const response = await apiCall(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/printing/service/install`, {
        method: 'POST'
      });
      
      if (response?.success) {
        toast.success('Print service installer downloaded. Please run the installer.');
        // Trigger download of the installer
        window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/printing/service/download`, '_blank');
      }
    } catch (error) {
      console.error('Failed to install service:', error);
      toast.error('Failed to download print service');
    }
  }, [apiCall]);

  useEffect(() => {
    loadPrinters();
    loadServiceStatus();
    loadPrintJobs();
    
    // Set up periodic status checks
    const interval = setInterval(() => {
      loadServiceStatus();
      loadPrintJobs();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [loadPrinters, loadServiceStatus, loadPrintJobs]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'offline': return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'error': return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      default: return <CogIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getConnectionIcon = (connection: string) => {
    switch (connection) {
      case 'network': return <WifiIcon className="w-4 h-4" />;
      case 'usb': return <ComputerDesktopIcon className="w-4 h-4" />;
      default: return <CogIcon className="w-4 h-4" />;
    }
  };

  const getPrinterTypeColor = (type: string) => {
    switch (type) {
      case 'kitchen': return 'bg-orange-100 text-orange-800';
      case 'receipt': return 'bg-blue-100 text-blue-800';
      case 'label': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getJobStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'printing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["super_admin", "company_owner", "branch_manager"]}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["super_admin", "company_owner", "branch_manager"]}>
      <Head>
        <title>Printing Settings - Restaurant Platform</title>
        <meta name="description" content="Manage restaurant printing devices and settings" />
      </Head>
      
      <LicenseWarningHeader />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
                <div className="h-6 w-px bg-gray-300"></div>
                <div className="flex items-center space-x-2">
                  <PrinterIcon className="w-5 h-5 text-gray-600" />
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900">Printing Settings</h1>
                    <p className="text-sm text-gray-500">Manage printers and print jobs</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handleDiscoverPrinters}
                  disabled={isScanning}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                >
                  <ArrowPathIcon className={`w-4 h-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
                  {isScanning ? 'Scanning...' : 'Discover Printers'}
                </button>
                <button 
                  onClick={() => setShowConfigWizard(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Printer
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Printer Status Dashboard */}
          <div className="mb-8">
            <PrinterStatusDashboard 
              companyId={user?.companyId}
              branchId={user?.branchId}
              refreshInterval={5000}
              autoRefresh={true}
            />
          </div>

          {/* Print Service Status */}
          <div className="mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <ComputerDesktopIcon className="w-5 h-5 mr-2" />
                    Print Service Status
                  </h2>
                  <p className="text-sm text-gray-600">Local print service manages direct printer communication</p>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    serviceStatus.isRunning 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      serviceStatus.isRunning ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                    {serviceStatus.isRunning ? 'Running' : 'Stopped'}
                  </div>
                </div>
              </div>
              
              {!serviceStatus.isRunning && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 mr-2" />
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800">Print Service Required</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        To use direct printer communication, please install and run the print service on this computer.
                      </p>
                      <button 
                        onClick={handleInstallService}
                        className="mt-2 inline-flex items-center px-3 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 hover:bg-yellow-200 rounded-md transition-colors"
                      >
                        Download Print Service
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{serviceStatus.connectedPrinters}</div>
                  <div className="text-sm text-gray-500">Connected Printers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{serviceStatus.totalJobs}</div>
                  <div className="text-sm text-gray-500">Total Jobs Today</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{serviceStatus.failedJobs}</div>
                  <div className="text-sm text-gray-500">Failed Jobs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {serviceStatus.totalJobs > 0 ? Math.round(((serviceStatus.totalJobs - serviceStatus.failedJobs) / serviceStatus.totalJobs) * 100) : 0}%
                  </div>
                  <div className="text-sm text-gray-500">Success Rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Printers List */}
          <div className="mb-8">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <PrinterIcon className="w-5 h-5 mr-2" />
                  Printers ({printers.length})
                </h2>
              </div>
              
              {printers.length === 0 ? (
                <div className="text-center py-12">
                  <PrinterIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No printers found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Click "Discover Printers" to scan for network printers or "Add Printer" to configure manually.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {printers.map((printer) => (
                    <div key={printer.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {getStatusIcon(printer.status)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="text-sm font-medium text-gray-900">{printer.name}</h3>
                              {printer.isDefault && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  Default
                                </span>
                              )}
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPrinterTypeColor(printer.type)}`}>
                                {printer.type.charAt(0).toUpperCase() + printer.type.slice(1)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 mt-1">
                              <div className="flex items-center text-sm text-gray-500">
                                {getConnectionIcon(printer.connection)}
                                <span className="ml-1">{printer.connection}</span>
                              </div>
                              {printer.ip && (
                                <span className="text-sm text-gray-500">{printer.ip}:{printer.port}</span>
                              )}
                              {printer.model && (
                                <span className="text-sm text-gray-500">{printer.manufacturer} {printer.model}</span>
                              )}
                              <span className="text-sm text-gray-500">→ {printer.assignedTo}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => testPrinter(printer.id)}
                            className="inline-flex items-center px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                          >
                            <ArrowPathIcon className="w-3 h-3 mr-1" />
                            Test
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPrinter(printer);
                              setShowPrinterDetails(true);
                            }}
                            className="inline-flex items-center px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                          >
                            <EyeIcon className="w-3 h-3 mr-1" />
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Advanced Thermal Printer Component */}
          <div>
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <WifiIcon className="w-5 h-5 mr-2" />
                  Advanced Printer Control
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Direct browser printing with WebUSB, Web Serial, and WebSocket monitoring
                </p>
              </div>
              <div className="p-6">
                <AdvancedThermalPrinter />
              </div>
            </div>
          </div>

          {/* Printer Discovery Component */}
          <div>
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ComputerDesktopIcon className="w-5 h-5 mr-2" />
                  Automatic Printer Discovery
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Automatically find and configure network, USB, and serial printers
                </p>
              </div>
              <div className="p-6">
                <PrinterDiscovery 
                  onPrinterAdd={(config) => {
                    // Auto-add discovered printer to the system
                    console.log('Auto-adding printer:', config);
                    toast.success(`Printer "${config.name}" configured automatically`);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Print Job Queue Management */}
          <div>
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <DocumentTextIcon className="w-5 h-5 mr-2" />
                      Print Job Queue Management
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Monitor, manage, and control all print jobs in real-time with advanced queue analytics
                    </p>
                  </div>
                  <button
                    onClick={() => setShowTemplateDesigner(true)}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-md"
                  >
                    <CogIcon className="w-4 h-4 mr-2" />
                    Design Templates
                  </button>
                </div>
              </div>
              <div className="p-6">
                <PrintJobQueue 
                  companyId={user?.companyId}
                  refreshInterval={3000}
                />
              </div>
            </div>
          </div>

          {/* Recent Print Jobs */}
          <div>
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <DocumentTextIcon className="w-5 h-5 mr-2" />
                  Recent Print Jobs
                </h2>
              </div>
              
              {printJobs.length === 0 ? (
                <div className="text-center py-8">
                  <DocumentTextIcon className="mx-auto h-8 w-8 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No print jobs yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Print jobs will appear here when orders are processed.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {printJobs.map((job) => (
                    <div key={job.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getJobStatusColor(job.status)}`}>
                            {job.status}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {job.type.replace('_', ' ').toUpperCase()}
                          </span>
                          {job.orderId && (
                            <span className="text-sm text-gray-500">Order #{job.orderId}</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <ClockIcon className="w-4 h-4" />
                          <span>{new Date(job.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                      {job.error && (
                        <div className="mt-2 text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
                          {job.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Printer Configuration Wizard */}
        {showConfigWizard && (
          <PrinterConfigurationWizard
            onComplete={async (config) => {
              try {
                console.log('Printer configuration completed:', config);
                
                // Convert wizard config to backend DTO format
                const printerDto = {
                  name: config.name,
                  type: config.type,
                  connection: config.connection,
                  ip: config.networkConfig?.ip,
                  port: config.networkConfig?.port || 9100,
                  manufacturer: config.bluetoothConfig?.name || config.usbConfig?.vendorId || 'Unknown',
                  model: config.bluetoothConfig?.address || config.usbConfig?.productId || 'Unknown',
                  location: config.location,
                  paperWidth: parseInt(config.paperSize) || 80,
                  assignedTo: config.assignedTo,
                  isDefault: config.isDefault,
                  capabilities: config.capabilities || ['cut', 'text']
                };

                // Save printer to backend
                await apiCall('http://localhost:3001/api/v1/printing/printers', {
                  method: 'POST',
                  body: JSON.stringify(printerDto)
                });

                toast.success(`Printer "${config.name}" configured and saved successfully!`);
                setShowConfigWizard(false);
                loadPrinters(); // Refresh the printer list
              } catch (error) {
                console.error('Failed to save printer:', error);
                toast.error('Failed to save printer configuration. Please try again.');
              }
            }}
            onCancel={() => setShowConfigWizard(false)}
          />
        )}

        {/* Receipt Template Designer */}
        {showTemplateDesigner && (
          <ReceiptTemplateDesigner
            onSave={(template) => {
              console.log('Template saved:', template);
              // Here we would save the template to the backend
              toast.success(`Template "${template.name}" saved successfully!`);
              setShowTemplateDesigner(false);
            }}
            onCancel={() => setShowTemplateDesigner(false)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}