import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  PrinterIcon,
  CogIcon,
  WifiIcon,
  ComputerDesktopIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  BuildingStorefrontIcon,
  CloudIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  TagIcon,
  SignalIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../src/contexts/AuthContext';
import { ProtectedRoute } from '../../src/components/shared/ProtectedRoute';
import toast from 'react-hot-toast';

// Node.js Printer Service Interface - Cross-platform Compatible
interface NodeJSPrinter {
  id: string;
  name: string;
  type: 'thermal' | 'receipt' | 'kitchen' | 'label' | 'barcode' | 'unknown';
  connectionType: 'network' | 'usb' | 'bluetooth' | 'serial';
  ipAddress?: string;
  port?: number;
  model?: string;
  manufacturer?: string;
  status: 'online' | 'offline' | 'error' | 'busy' | 'low_paper' | 'no_paper' | 'unknown';
  isDefault: boolean;
  companyId: string;
  companyName?: string; // For super admin view
  branchId?: string;
  branchName?: string;
  assignedTo: 'kitchen' | 'cashier' | 'bar' | 'all';
  capabilities?: string[];
  lastSeen?: string;
  isAutoDetected?: boolean;
  platform?: 'windows' | 'macos' | 'linux';
  deliveryPlatforms?: {
    dhub?: boolean;
    careem?: boolean;
    talabat?: boolean;
    callCenter?: boolean;
    website?: boolean;
  };
  queueLength?: number;
  description?: string;
  // Multi-tenant display info
  company?: {
    id: string;
    name: string;
  };
  branch?: {
    id: string;
    name: string;
  };
}

export default function NodeJSPrintingSettingsPage() {
  const { user } = useAuth();
  const [printers, setPrinters] = useState<NodeJSPrinter[]>([]);
  const [loading, setLoading] = useState(false);
  const [printerServiceStatus, setPrinterServiceStatus] = useState<'connected' | 'disconnected' | 'unknown'>('unknown');
  // Force webpack to recompile

  // Load printers from backend
  const loadPrinters = useCallback(async () => {
    if (!user?.companyId && user?.role !== 'super_admin') return;
    
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/printing/printers`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPrinters(data.printers || []);
      } else {
        console.error('Failed to load printers');
      }
    } catch (error) {
      console.error('Error loading printers:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.companyId, user?.role]);

  // Check Node.js Printer Service status
  const checkPrinterServiceStatus = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/printing/service/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Check if MenuHere service is connected
        const serviceConnected = data.menuHere?.connected || data.services?.nodejs?.connected || data.printerService?.connected || false;
        setPrinterServiceStatus(serviceConnected ? 'connected' : 'disconnected');
      } else {
        setPrinterServiceStatus('disconnected');
      }
    } catch (error) {
      console.error('Failed to check printer service status:', error);
      setPrinterServiceStatus('disconnected');
    }
  }, []);

  // Test printer connection
  const testPrinter = useCallback(async (printerId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/printing/printers/${printerId}/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || 'Test print successful!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Test print failed');
      }
    } catch (error) {
      console.error('Test print error:', error);
      toast.error('Error testing printer');
    }
  }, []);

  // Delete printer
  const deletePrinter = useCallback(async (printerId: string, printerName: string) => {
    if (!confirm(`Are you sure you want to delete printer "${printerName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/printing/printers/${printerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      });
      
      if (response.ok) {
        toast.success(`Printer "${printerName}" deleted successfully`);
        loadPrinters(); // Refresh the list
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete printer');
      }
    } catch (error) {
      console.error('Delete printer error:', error);
      toast.error('Error deleting printer');
    }
  }, [loadPrinters]);

  // Configure printer
  const configurePrinter = useCallback((printer: NodeJSPrinter) => {
    // For now, we'll show a configuration modal with basic settings
    const newName = prompt(`Configure printer name:`, printer.name);
    if (newName && newName !== printer.name) {
      updatePrinterConfig(printer.id, { name: newName });
    }
  }, []);

  // Update printer configuration
  const updatePrinterConfig = useCallback(async (printerId: string, config: any) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/printing/printers/${printerId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });
      
      if (response.ok) {
        toast.success('Printer configuration updated successfully');
        loadPrinters(); // Refresh the list
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update printer configuration');
      }
    } catch (error) {
      console.error('Update printer config error:', error);
      toast.error('Error updating printer configuration');
    }
  }, [loadPrinters]);

  useEffect(() => {
    loadPrinters();
    checkPrinterServiceStatus();
    
    // Check service status periodically
    const statusInterval = setInterval(checkPrinterServiceStatus, 30000); // Every 30 seconds
    
    return () => clearInterval(statusInterval);
  }, [loadPrinters, checkPrinterServiceStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100';
      case 'offline': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'busy': return 'text-blue-600 bg-blue-100';
      case 'low_paper': return 'text-orange-600 bg-orange-100';
      case 'no_paper': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircleIcon className="w-4 h-4" />;
      case 'offline': return <XCircleIcon className="w-4 h-4" />;
      case 'error': return <ExclamationTriangleIcon className="w-4 h-4" />;
      default: return <ExclamationTriangleIcon className="w-4 h-4" />;
    }
  };

  const getConnectionIcon = (connection: string) => {
    switch (connection) {
      case 'network': return <WifiIcon className="w-5 h-5 text-blue-600" />;
      case 'usb': return <ComputerDesktopIcon className="w-5 h-5 text-green-600" />;
      case 'bluetooth': return <SignalIcon className="w-5 h-5 text-blue-600" />;
      case 'serial': return <CpuChipIcon className="w-5 h-5 text-purple-600" />;
      default: return <CogIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getDeliveryPlatformBadges = (platforms?: NodeJSPrinter['deliveryPlatforms']) => {
    if (!platforms) return null;
    
    const badges = [];
    if (platforms.talabat) badges.push(<span key="talabat" className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Talabat</span>);
    if (platforms.careem) badges.push(<span key="careem" className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Careem</span>);
    if (platforms.dhub) badges.push(<span key="dhub" className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">DHUB</span>);
    if (platforms.callCenter) badges.push(<span key="callCenter" className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Call Center</span>);
    if (platforms.website) badges.push(<span key="website" className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Website</span>);
    
    return <div className="flex flex-wrap gap-1">{badges}</div>;
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Node.js Printer Service - Restaurant Management</title>
        <meta name="description" content="Cross-platform printer management with real-time detection" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Navigation */}
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
                <div className="h-6 w-px bg-gray-300"></div>
                <div className="flex items-center space-x-2">
                  <PrinterIcon className="w-5 h-5 text-gray-600" />
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900">Node.js Printer Service</h1>
                    <p className="text-sm text-gray-500">Cross-platform real-time printer management</p>
                  </div>
                </div>
              </div>
              
              {/* Actions - Display Only */}
              <div className="flex items-center space-x-3">
                {/* Node.js Service Status */}
                <div className="flex items-center space-x-2 px-3 py-2 rounded-md bg-gray-50">
                  <div className={`w-2 h-2 rounded-full ${
                    printerServiceStatus === 'connected' ? 'bg-green-500' : 
                    printerServiceStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'
                  }`} />
                  <span className="text-xs font-medium text-gray-600">
                    Service: {printerServiceStatus}
                  </span>
                </div>
                
                {/* Info about Node.js service */}
                <div className="text-sm text-gray-500 px-3 py-2 bg-green-50 rounded-md">
                  <span className="text-green-700">🚀 Automatic cross-platform printer detection active</span>
                </div>
                
                <button 
                  onClick={loadPrinters}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                >
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <PrinterIcon className="w-8 h-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Printers</p>
                  <p className="text-2xl font-semibold text-gray-900">{printers.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="w-8 h-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Online</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {printers.filter(p => p.status === 'online').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <XCircleIcon className="w-8 h-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Offline</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {printers.filter(p => p.status === 'offline').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ComputerDesktopIcon className="w-8 h-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">USB Direct</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {printers.filter(p => p.connectionType === 'usb').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CloudIcon className="w-8 h-8 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Platforms</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {printers.filter(p => p.deliveryPlatforms && Object.values(p.deliveryPlatforms).some(Boolean)).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Printers List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Node.js Printer Management</h3>
              <p className="mt-1 text-sm text-gray-500">
                Real-time cross-platform printer detection and monitoring
              </p>
            </div>
            
            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading printers...</p>
              </div>
            ) : printers.length === 0 ? (
              <div className="p-6 text-center">
                <PrinterIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No printers detected</h3>
                <p className="text-gray-500 mb-4">Node.js service will automatically detect printers when they are connected.</p>
                <div className="text-sm text-green-600 bg-green-50 rounded-lg p-4 max-w-md mx-auto">
                  <strong>Automatic Detection:</strong><br />
                  🖨️ USB printers: Plug and play<br />
                  🌐 Network printers: Auto-discovered<br />
                  🚀 Real-time status monitoring<br />
                  ⚡ 5-second disconnection detection
                </div>
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Printer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type & Connection
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Delivery Platforms
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assignment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {printers.map((printer) => (
                      <tr key={printer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <PrinterIcon className="w-8 h-8 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900 flex items-center">
                                {printer.name}
                                {printer.isDefault && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    Default
                                  </span>
                                )}
                                {printer.isAutoDetected && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                    Auto-detected
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">
                                {printer.ipAddress && `${printer.ipAddress}${printer.port ? `:${printer.port}` : ''}`}
                                {printer.platform && (
                                  <span className="ml-2 text-xs text-gray-400 capitalize">({printer.platform})</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {user?.role === 'super_admin' ? (
                              // Super admin sees company + branch
                              <div>
                                <div className="font-medium flex items-center">
                                  <BuildingOfficeIcon className="w-4 h-4 mr-1 text-blue-500" />
                                  {printer.company?.name || printer.companyName || 'Unknown Company'}
                                </div>
                                <div className="text-gray-500 flex items-center">
                                  <BuildingStorefrontIcon className="w-4 h-4 mr-1 text-gray-400" />
                                  {printer.branch?.name || printer.branchName || 'Unknown Branch'}
                                </div>
                              </div>
                            ) : (
                              // Company users see branch only
                              <div className="font-medium flex items-center">
                                <BuildingStorefrontIcon className="w-4 h-4 mr-1 text-gray-500" />
                                {printer.branch?.name || printer.branchName || 'Unknown Branch'}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getConnectionIcon(printer.connectionType)}
                            <div>
                              <div className="text-sm text-gray-900 capitalize">{printer.type}</div>
                              <div className="text-sm text-gray-500 capitalize">{printer.connectionType}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(printer.status)}`}>
                            {getStatusIcon(printer.status)}
                            <span className="ml-1 capitalize">{printer.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getDeliveryPlatformBadges(printer.deliveryPlatforms) || (
                            <span className="text-sm text-gray-400">Not assigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                          <div className="flex items-center">
                            <TagIcon className="w-4 h-4 mr-1 text-gray-400" />
                            {printer.assignedTo}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => testPrinter(printer.id)}
                            className="text-blue-600 hover:text-blue-900 inline-flex items-center transition-colors"
                          >
                            <EyeIcon className="w-4 h-4 mr-1" />
                            Test
                          </button>
                          <button 
                            onClick={() => configurePrinter(printer)}
                            className="text-gray-600 hover:text-gray-900 inline-flex items-center transition-colors"
                          >
                            <PencilIcon className="w-4 h-4 mr-1" />
                            Configure
                          </button>
                          {user?.role === 'super_admin' && (
                            <button 
                              onClick={() => deletePrinter(printer.id, printer.name)}
                              className="text-red-600 hover:text-red-900 inline-flex items-center transition-colors"
                            >
                              <TrashIcon className="w-4 h-4 mr-1" />
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}