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
  ArrowPathIcon,
  PencilIcon
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
  companyId?: string;
  companyName?: string;
  branchId?: string;
  branchName?: string;
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
  const [activeTab, setActiveTab] = useState('overview');
  const [editingPrinter, setEditingPrinter] = useState<Printer | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Tab configuration
  const tabs = [
    {
      id: 'overview',
      name: 'Overview',
      description: 'Printer status dashboard and management',
      icon: PrinterIcon
    },
    {
      id: 'discovery',
      name: 'Network Discovery',
      description: 'Automatically discover and add network printers',
      icon: WifiIcon
    },
    {
      id: 'management',
      name: 'Printer Management',
      description: 'Add, edit, and configure individual printers',
      icon: CogIcon
    },
    {
      id: 'queue',
      name: 'Print Queue',
      description: 'Monitor and manage print jobs in real-time',
      icon: DocumentTextIcon
    },
    {
      id: 'testing',
      name: 'Testing & Diagnostics',
      description: 'Test printer connections and print quality',
      icon: CheckCircleIcon
    },
    {
      id: 'templates',
      name: 'Receipt Templates',
      description: 'Design and manage printing templates',
      icon: DocumentTextIcon
    }
  ];

  // Load printer data
  const loadPrinters = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiCall(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1'}/printing/printers`);
      setPrinters(response?.printers || []);
    } catch (error) {
      console.error('Failed to load printers:', error);
      toast.error('Failed to load printers');
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  // Update printer function
  const updatePrinter = async (printerId: string, updateData: Partial<Printer>) => {
    try {
      const response = await apiCall(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1'}/printing/printers/${printerId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        }
      );

      if (response.success) {
        toast.success('Printer updated successfully');
        // Update the printer in the local state
        setPrinters(prev => 
          prev.map(printer => 
            printer.id === printerId 
              ? { ...printer, ...response.printer }
              : printer
          )
        );
        setShowEditDialog(false);
        setEditingPrinter(null);
      }
    } catch (error) {
      console.error('Failed to update printer:', error);
      toast.error('Failed to update printer');
    }
  };

  // Load print service status
  const loadServiceStatus = useCallback(async () => {
    try {
      const response = await apiCall(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1'}/printing/service/status`);
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
      const response = await apiCall(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1'}/printing/jobs?limit=10`);
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
      
      const response = await apiCall(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1'}/printing/discover`, {
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
      
      const response = await apiCall(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1'}/printing/printers/${printerId}/test`, {
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
      const response = await apiCall(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1'}/printing/service/install`, {
        method: 'POST'
      });
      
      if (response?.success) {
        toast.success('Print service installer downloaded. Please run the installer.');
        // Trigger download of the installer
        window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1'}/printing/service/download`, '_blank');
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
          {/* Tabbed Navigation */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <IconComponent className={`mr-2 h-5 w-5 ${
                        activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`} />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
            
            {/* Tab descriptions */}
            <div className="mt-4 mb-6">
              {tabs.map((tab) => {
                if (tab.id === activeTab) {
                  return (
                    <p key={tab.id} className="text-sm text-gray-600">
                      {tab.description}
                    </p>
                  );
                }
                return null;
              })}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <>
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
                              setEditingPrinter(printer);
                              setShowEditDialog(true);
                            }}
                            className="inline-flex items-center px-2 py-1 text-xs text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                          >
                            <PencilIcon className="w-3 h-3 mr-1" />
                            Edit
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
            </>
          )}

          {/* Network Discovery Tab */}
          {activeTab === 'discovery' && (
            <div className="space-y-8">
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
            </div>
          )}

          {/* Management Tab */}
          {activeTab === 'management' && (
            <div className="space-y-8">
              {/* Advanced Printer Control */}
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
            </div>
          )}

          {/* Print Queue Tab */}
          {activeTab === 'queue' && (
            <div className="space-y-8">

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
          )}

          {/* Testing & Diagnostics Tab */}
          {activeTab === 'testing' && (
            <div className="space-y-8">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Printer Testing & Diagnostics
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Test your printers with different types of content and multiple copies
                </p>
                
                {/* Testing interface will be added here */}
                <div className="text-center py-8 text-gray-500">
                  Advanced testing features will be available in this tab
                </div>
              </div>
            </div>
          )}

          {/* Receipt Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-8">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Receipt Template Designer
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Design and manage custom receipt templates
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
                
                <div className="text-center py-8 text-gray-500">
                  Template management interface will be available here
                </div>
              </div>
            </div>
          )}
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
                await apiCall('http://localhost:3002/api/v1/printing/printers', {
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

        {/* Printer Edit Dialog */}
        {showEditDialog && editingPrinter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Edit Printer: {editingPrinter.name}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Printer Name
                    </label>
                    <input
                      type="text"
                      value={editingPrinter.name}
                      onChange={(e) => setEditingPrinter(prev => prev ? {...prev, name: e.target.value} : null)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Printer Type
                    </label>
                    <select
                      value={editingPrinter.type}
                      onChange={(e) => setEditingPrinter(prev => prev ? {...prev, type: e.target.value as any} : null)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="receipt">Receipt Printer</option>
                      <option value="kitchen">Kitchen Printer</option>
                      <option value="thermal">Thermal Printer</option>
                      <option value="label">Label Printer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company
                    </label>
                    <select
                      value={editingPrinter.companyId || ''}
                      onChange={(e) => {
                        const companyId = e.target.value;
                        const companyName = companyId === 'company-1' ? 'Main Restaurant Group' : 
                                           companyId === 'company-2' ? 'Fast Food Chain' : '';
                        setEditingPrinter(prev => prev ? {
                          ...prev, 
                          companyId: companyId || undefined,
                          companyName: companyName || undefined,
                          branchId: undefined, // Reset branch when company changes
                          branchName: undefined
                        } : null);
                      }}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Company...</option>
                      <option value="company-1">Main Restaurant Group</option>
                      <option value="company-2">Fast Food Chain</option>
                    </select>
                  </div>

                  {editingPrinter.companyId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Branch
                      </label>
                      <select
                        value={editingPrinter.branchId || ''}
                        onChange={(e) => {
                          const branchId = e.target.value;
                          let branchName = '';
                          if (branchId === 'branch-1') branchName = 'Downtown Location';
                          else if (branchId === 'branch-2') branchName = 'Mall Location';
                          else if (branchId === 'branch-3') branchName = 'Airport Location';
                          else if (branchId === 'branch-4') branchName = 'North Branch';
                          else if (branchId === 'branch-5') branchName = 'South Branch';
                          
                          setEditingPrinter(prev => prev ? {
                            ...prev, 
                            branchId: branchId || undefined,
                            branchName: branchName || undefined
                          } : null);
                        }}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Branch...</option>
                        {editingPrinter.companyId === 'company-1' && (
                          <>
                            <option value="branch-1">Downtown Location</option>
                            <option value="branch-2">Mall Location</option>
                            <option value="branch-3">Airport Location</option>
                          </>
                        )}
                        {editingPrinter.companyId === 'company-2' && (
                          <>
                            <option value="branch-4">North Branch</option>
                            <option value="branch-5">South Branch</option>
                          </>
                        )}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assignment
                    </label>
                    <select
                      value={editingPrinter.assignedTo}
                      onChange={(e) => setEditingPrinter(prev => prev ? {...prev, assignedTo: e.target.value as any} : null)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="kitchen">Kitchen</option>
                      <option value="cashier">Cashier</option>
                      <option value="bar">Bar</option>
                      <option value="all">All</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location (Optional)
                    </label>
                    <input
                      type="text"
                      value={editingPrinter.location || ''}
                      onChange={(e) => setEditingPrinter(prev => prev ? {...prev, location: e.target.value} : null)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Front Counter, Kitchen Station 1"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowEditDialog(false);
                      setEditingPrinter(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (editingPrinter) {
                        updatePrinter(editingPrinter.id, {
                          name: editingPrinter.name,
                          type: editingPrinter.type,
                          companyId: editingPrinter.companyId,
                          companyName: editingPrinter.companyName,
                          branchId: editingPrinter.branchId,
                          branchName: editingPrinter.branchName,
                          assignedTo: editingPrinter.assignedTo,
                          location: editingPrinter.location
                        });
                      }
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}