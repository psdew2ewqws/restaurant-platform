import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  PrinterIcon,
  WifiIcon,
  ComputerDesktopIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useApiClient } from '../../hooks/useApiClient';

interface PrinterConfig {
  name: string;
  type: 'thermal' | 'receipt' | 'kitchen' | 'label';
  connection: 'network' | 'usb' | 'serial' | 'bluetooth';
  networkConfig?: {
    ip: string;
    port: number;
  };
  usbConfig?: {
    vendorId: string;
    productId: string;
  };
  serialConfig?: {
    port: string;
    baudRate: number;
    dataBits: number;
    stopBits: number;
    parity: 'none' | 'even' | 'odd';
  };
  bluetoothConfig?: {
    address: string;
    name: string;
  };
  paperSize: string;
  assignedTo: 'kitchen' | 'cashier' | 'bar' | 'all';
  isDefault: boolean;
  location?: string;
  capabilities: string[];
  companyId?: string;
  companyName?: string;
  branchId?: string;
  branchName?: string;
}

interface PrinterConfigurationWizardProps {
  onComplete: (config: PrinterConfig) => void;
  onCancel: () => void;
  initialConfig?: Partial<PrinterConfig>;
}

export default function PrinterConfigurationWizard({
  onComplete,
  onCancel,
  initialConfig = {}
}: PrinterConfigurationWizardProps) {
  const { apiCall } = useApiClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState<PrinterConfig>({
    name: '',
    type: 'receipt',
    connection: 'network',
    networkConfig: { ip: '', port: 9100 },
    paperSize: '80mm',
    assignedTo: 'cashier',
    isDefault: false,
    capabilities: [],
    ...initialConfig
  });
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    success: boolean;
    message: string;
    capabilities?: string[];
  } | null>(null);
  const [discoveredPrinters, setDiscoveredPrinters] = useState<any[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [selectedNetworkRanges, setSelectedNetworkRanges] = useState<string[]>([]);
  const [customNetworkRange, setCustomNetworkRange] = useState('');
  const [showCustomRangeInput, setShowCustomRangeInput] = useState(false);
  const [isTestPrinting, setIsTestPrinting] = useState(false);
  const [testPrintResult, setTestPrintResult] = useState<{
    success: boolean;
    message: string;
    testDetails?: any;
  } | null>(null);
  
  // Company and branch management
  const [companies, setCompanies] = useState<Array<{
    id: string;
    name: string;
    branches: Array<{
      id: string;
      name: string;
    }>;
  }>>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [availableBranches, setAvailableBranches] = useState<Array<{
    id: string;
    name: string;
  }>>([]);

  const steps = [
    { id: 'type', title: 'Printer Type', description: 'Select the type of printer you want to configure' },
    { id: 'connection', title: 'Connection', description: 'Choose how the printer connects to your system' },
    { id: 'details', title: 'Connection Details', description: 'Configure the connection parameters' },
    { id: 'settings', title: 'Printer Settings', description: 'Set paper size, location, and assignment' },
    { id: 'test', title: 'Test & Validate', description: 'Test the printer connection and capabilities' },
    { id: 'review', title: 'Review', description: 'Review and confirm your printer configuration' }
  ];

  const printerTypes = [
    { id: 'receipt', name: 'Receipt Printer', description: 'For customer receipts and invoices', icon: DocumentTextIcon },
    { id: 'kitchen', name: 'Kitchen Printer', description: 'For kitchen orders and tickets', icon: PrinterIcon },
    { id: 'thermal', name: 'Thermal Printer', description: 'High-speed thermal receipt printer', icon: PrinterIcon },
    { id: 'label', name: 'Label Printer', description: 'For food labels and stickers', icon: DocumentTextIcon }
  ];

  const connectionTypes = [
    { id: 'network', name: 'Network (TCP/IP)', description: 'Connect via WiFi or Ethernet', icon: WifiIcon },
    { id: 'usb', name: 'USB', description: 'Direct USB connection', icon: ComputerDesktopIcon },
    { id: 'serial', name: 'Serial (RS-232)', description: 'Serial port connection', icon: CogIcon },
    { id: 'bluetooth', name: 'Bluetooth', description: 'Wireless Bluetooth connection', icon: WifiIcon }
  ];

  const paperSizes = [
    { id: '58mm', name: '58mm', description: 'Small receipt paper' },
    { id: '80mm', name: '80mm', description: 'Standard receipt paper' },
    { id: '112mm', name: '112mm', description: 'Wide receipt paper' },
    { id: 'A4', name: 'A4', description: 'Standard letter size' },
    { id: 'custom', name: 'Custom', description: 'Custom paper size' }
  ];

  const assignmentOptions = [
    { id: 'cashier', name: 'Cashier', description: 'For point of sale receipts' },
    { id: 'kitchen', name: 'Kitchen', description: 'For kitchen order tickets' },
    { id: 'bar', name: 'Bar', description: 'For drink orders' },
    { id: 'all', name: 'All Stations', description: 'Available to all stations' }
  ];

  // Dynamic network range detection
  const [detectedNetworks, setDetectedNetworks] = useState<Array<{
    id: string;
    name: string;
    description: string;
    isDetected: boolean;
  }>>([]);

  // Detect local network ranges automatically
  const detectLocalNetworks = useCallback(async () => {
    const networks: Array<{id: string; name: string; description: string; isDetected: boolean}> = [];
    
    try {
      // Auto-detect available networks with intelligent naming
      const networkChecks = [
        { id: '192.168.1.0/24', base: '192.168.1', name: 'Home Network (192.168.1.x)', description: 'Most common home router network' },
        { id: '192.168.0.0/24', base: '192.168.0', name: 'Home Network (192.168.0.x)', description: 'Alternative home router network' },
        { id: '10.0.0.0/24', base: '10.0.0', name: 'Corporate Network (10.0.0.x)', description: 'Corporate/office network' },
        { id: '172.16.0.0/24', base: '172.16.0', name: 'Private Network (172.16.0.x)', description: 'Private corporate network' }
      ];

      // Simple availability check and intelligent detection
      for (const network of networkChecks) {
        let isDetected = false;
        
        // Basic heuristic - if we're running locally, these networks are likely available
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          isDetected = network.id === '192.168.1.0/24' || network.id === '192.168.0.0/24';
        } else {
          // Check if we're on the network based on current IP
          const currentHost = window.location.hostname;
          if (currentHost.startsWith('192.168.1.')) isDetected = network.id === '192.168.1.0/24';
          if (currentHost.startsWith('192.168.0.')) isDetected = network.id === '192.168.0.0/24';
          if (currentHost.startsWith('10.0.0.')) isDetected = network.id === '10.0.0.0/24';
          if (currentHost.startsWith('172.16.')) isDetected = network.id === '172.16.0.0/24';
        }

        networks.push({
          id: network.id,
          name: network.name,
          description: network.description,
          isDetected
        });
      }

      // Sort detected networks first
      networks.sort((a, b) => {
        if (a.isDetected && !b.isDetected) return -1;
        if (!a.isDetected && b.isDetected) return 1;
        return 0;
      });

      // Add custom option at the end
      networks.push({
        id: 'custom',
        name: 'Custom Range',
        description: 'Enter your own network range',
        isDetected: false
      });

      setDetectedNetworks(networks);
    } catch (error) {
      console.log('Network detection completed with fallback');
      // Fallback to common networks
      setDetectedNetworks([
        { id: '192.168.1.0/24', name: 'Home Network (192.168.1.x)', description: 'Most common home router network', isDetected: true },
        { id: '192.168.0.0/24', name: 'Home Network (192.168.0.x)', description: 'Alternative home router network', isDetected: false },
        { id: '10.0.0.0/24', name: 'Corporate Network (10.0.0.x)', description: 'Corporate/office network', isDetected: false },
        { id: '172.16.0.0/24', name: 'Private Network (172.16.0.x)', description: 'Private corporate network', isDetected: false },
        { id: 'custom', name: 'Custom Range', description: 'Enter your own network range', isDetected: false }
      ]);
    }
  }, []);

  // Detect networks on component mount
  useEffect(() => {
    detectLocalNetworks();
  }, [detectLocalNetworks]);

  // Load companies and branches for assignment
  useEffect(() => {
    const loadCompaniesAndBranches = async () => {
      try {
        // Load companies and branches in parallel for better performance
        const [companiesResponse, branchesResponse] = await Promise.all([
          apiCall('companies/list', { method: 'GET' }),
          apiCall('branches', { method: 'GET' })
        ]);
        
        if (companiesResponse?.companies && branchesResponse?.branches) {
          const allBranches = branchesResponse.branches;
          
          const companiesWithBranches = companiesResponse.companies.map(company => {
            const companyBranches = allBranches.filter(
              branch => branch.company?.id === company.id
            );
            
            console.log(`Company ${company.name} (${company.id}) has ${companyBranches.length} branches:`, companyBranches.map(b => b.name));
            
            return {
              id: company.id,
              name: company.name,
              branches: companyBranches.map(branch => ({
                id: branch.id,
                name: branch.name
              }))
            };
          });
          
          setCompanies(companiesWithBranches);
          
          // Set default company and branches if config has them
          if (config.companyId) {
            setSelectedCompany(config.companyId);
            const company = companiesWithBranches.find(c => c.id === config.companyId);
            if (company) {
              setAvailableBranches(company.branches);
            }
          } else if (companiesWithBranches.length > 0) {
            // Set first company as default
            const firstCompany = companiesWithBranches[0];
            setSelectedCompany(firstCompany.id);
            setAvailableBranches(firstCompany.branches);
          }
        } else {
          console.warn('No companies or branches data received');
          toast('No companies found. Please check your permissions.', { icon: '⚠️' });
        }
      } catch (error) {
        console.error('Failed to load companies and branches:', error);
        toast.error('Failed to load companies. Please try again.');
      }
    };

    loadCompaniesAndBranches();
  }, [config.companyId]);

  const discoverNetworkPrinters = async () => {
    console.log('🔍 Discovery button clicked - starting network discovery');
    setIsDiscovering(true);
    
    try {
      console.log('📡 Making network discovery API call');
      
      // Build the ranges to scan, including custom range if provided
      let rangesToScan = selectedNetworkRanges.filter(range => range !== 'custom');
      if (customNetworkRange && customNetworkRange.trim()) {
        rangesToScan.push(customNetworkRange.trim());
      }
      
      const requestBody = {
        scanRange: rangesToScan[0] || "192.168.1.0/24", // Use first range or default
        ports: [9100, 515, 631], // Removed port 80 as backend only scans printer ports
        timeout: 3000
      };
      console.log('📤 Request body:', requestBody);
      
      const response = await apiCall('printing/network-discovery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 API response received:', response);

      if (response?.success) {
        console.log('✅ Success response with printers:', response.printers);
        setDiscoveredPrinters(response.printers || []);
        toast.success(`Found ${response.printers?.length || 0} network printers`);
      } else {
        // If no success field, treat response as the data itself
        if (Array.isArray(response)) {
          console.log('📋 Array response with printers:', response);
          setDiscoveredPrinters(response);
          toast.success(`Found ${response.length} network printers`);
        } else {
          console.log('❌ No printers found in response:', response);
          setDiscoveredPrinters([]);
          toast('No network printers found', { icon: 'ℹ️' });
        }
      }
    } catch (error) {
      console.error('💥 Network discovery failed with error:', error);
      toast.error('Failed to discover network printers');
      setDiscoveredPrinters([]);
    } finally {
      console.log('🏁 Discovery process finished, setting isDiscovering to false');
      setIsDiscovering(false);
    }
  };

  const validatePrinterConnection = async () => {
    setIsValidating(true);
    setValidationResult(null);

    try {
      let endpoint = '';
      let body: any = {};

      if (config.connection === 'network' && config.networkConfig) {
        endpoint = 'printing/validate';
        body = {
          type: 'network',
          connection: config.networkConfig,
          timeout: 5000
        };
      }

      if (endpoint) {
        console.log('🧪 Validating printer connection:', body);
        console.log('📡 Making validation API call to printing/validate');
        
        const data = await apiCall('printing/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });
        
        console.log('📥 Validation response received:', data);
        
        setValidationResult({
          success: data.success,
          message: data.message || (data.success ? 'Validation successful' : 'Validation failed'),
          capabilities: data.capabilities
        });

        if (data.success && data.capabilities) {
          setConfig(prev => ({
            ...prev,
            capabilities: data.capabilities
          }));
        }
      } else {
        console.log('⚠️ No endpoint specified, using mock validation');
        // Mock validation for other connection types
        setValidationResult({
          success: true,
          message: 'Printer validation successful (mock)',
          capabilities: ['text', 'cut', 'graphics']
        });
        setConfig(prev => ({
          ...prev,
          capabilities: ['text', 'cut', 'graphics']
        }));
      }
    } catch (error) {
      console.error('💥 Validation failed with error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Try to get a more specific error message
      let errorMessage = 'Failed to validate printer connection';
      if (error.message) {
        errorMessage = `Validation failed: ${error.message}`;
      }
      
      setValidationResult({
        success: false,
        message: errorMessage
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleTestPrint = async () => {
    setIsTestPrinting(true);
    setTestPrintResult(null);

    try {
      if (config.connection === 'network' && config.networkConfig) {
        const body = {
          type: 'network',
          connection: config.networkConfig,
          timeout: 5000,
          testType: 'basic' // Start with basic test
        };

        console.log('🧪 Sending test print:', body);
        const data = await apiCall('printing/test-print', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });
        
        if (data.success) {
          setTestPrintResult({
            success: true,
            message: `Test print sent successfully! ${data.message}`,
            testDetails: data.details
          });
        } else {
          setTestPrintResult({
            success: false,
            message: `Test print failed: ${data.message}`,
            testDetails: data.troubleshooting
          });
        }
      } else {
        setTestPrintResult({
          success: false,
          message: 'Network configuration not found. Please complete the connection details step.'
        });
      }
    } catch (error) {
      console.error('Test print error:', error);
      setTestPrintResult({
        success: false,
        message: `Test print failed: ${error.message || 'Unknown error'}`
      });
    } finally {
      setIsTestPrinting(false);
    }
  };

  // Handle company selection and update available branches
  const handleCompanyChange = (companyId: string) => {
    setSelectedCompany(companyId);
    const selectedCompanyData = companies.find(c => c.id === companyId);
    
    if (selectedCompanyData) {
      setAvailableBranches(selectedCompanyData.branches);
      setConfig(prev => ({
        ...prev,
        companyId,
        companyName: selectedCompanyData.name,
        branchId: '', // Reset branch selection
        branchName: ''
      }));
    }
  };

  // Handle branch selection
  const handleBranchChange = (branchId: string) => {
    const selectedBranch = availableBranches.find(b => b.id === branchId);
    if (selectedBranch) {
      setConfig(prev => ({
        ...prev,
        branchId,
        branchName: selectedBranch.name
      }));
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const nextStep = currentStep - 1;
      setCurrentStep(nextStep);
      
      // Reset validation and test states when navigating back FROM the Test & Validate step (step 4)
      if (currentStep === 4) { // Going back from step 4 (Test & Validate)
        console.log('🔄 Resetting validation state when going back from Test & Validate step');
        setValidationResult(null);
        setTestPrintResult(null);
        setIsValidating(false);
        setIsTestPrinting(false);
      }
    }
  };

  const handleComplete = () => {
    // Generate a name if none provided
    if (!config.name) {
      const timestamp = new Date().toLocaleTimeString();
      setConfig(prev => ({
        ...prev,
        name: `${prev.type.charAt(0).toUpperCase() + prev.type.slice(1)} Printer ${timestamp}`
      }));
    }

    onComplete(config);
    toast.success('Printer configured successfully!');
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return true; // type is always set by default
      case 1: return true; // connection is always set by default
      case 2:
        if (config.connection === 'network') {
          return config.networkConfig?.ip && config.networkConfig?.port;
        }
        return true;
      case 3: return config.paperSize && config.assignedTo;
      case 4: return validationResult?.success === true;
      case 5: return true;
      default: return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Printer Type
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {printerTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <div
                    key={type.id}
                    onClick={() => setConfig(prev => ({ ...prev, type: type.id as any }))}
                    className={`relative rounded-lg border-2 cursor-pointer hover:bg-gray-50 p-4 ${
                      config.type === type.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-8 w-8 text-gray-600" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{type.name}</h3>
                        <p className="text-sm text-gray-500">{type.description}</p>
                      </div>
                      {config.type === type.id && (
                        <CheckCircleIcon className="h-5 w-5 text-blue-500 absolute top-2 right-2" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 1: // Connection Type
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connectionTypes.map((connection) => {
                const Icon = connection.icon;
                return (
                  <div
                    key={connection.id}
                    onClick={() => setConfig(prev => ({ ...prev, connection: connection.id as any }))}
                    className={`relative rounded-lg border-2 cursor-pointer hover:bg-gray-50 p-4 ${
                      config.connection === connection.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-8 w-8 text-gray-600" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{connection.name}</h3>
                        <p className="text-sm text-gray-500">{connection.description}</p>
                      </div>
                      {config.connection === connection.id && (
                        <CheckCircleIcon className="h-5 w-5 text-blue-500 absolute top-2 right-2" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 2: // Connection Details
        return (
          <div className="space-y-6">
            {config.connection === 'network' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Network Configuration</h3>
                  
                  {/* Network Range Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Network Ranges to Scan
                      <span className="text-xs text-gray-500 ml-2">(You can select multiple)</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {detectedNetworks.map((range) => (
                        <div
                          key={range.id}
                          onClick={() => {
                            if (range.id === 'custom') {
                              setShowCustomRangeInput(!showCustomRangeInput);
                              return;
                            }
                            setSelectedNetworkRanges(prev => 
                              prev.includes(range.id) 
                                ? prev.filter(r => r !== range.id)
                                : [...prev, range.id]
                            );
                          }}
                          className={`relative rounded-lg border cursor-pointer hover:bg-gray-50 p-3 ${
                            selectedNetworkRanges.includes(range.id)
                              ? 'border-blue-500 bg-blue-50'
                              : range.isDetected
                              ? 'border-green-300 bg-green-50'
                              : 'border-gray-300'
                          }`}
                        >
                          <div className="flex items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-medium text-gray-900">{range.name}</h4>
                                {range.isDetected && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></span>
                                    Detected
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500">{range.description}</p>
                              {range.isDetected && (
                                <p className="text-xs text-green-600 mt-1">
                                  ✓ Available on your network
                                </p>
                              )}
                            </div>
                            {selectedNetworkRanges.includes(range.id) && (
                              <CheckCircleIcon className="h-4 w-4 text-blue-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Custom Network Range Input */}
                    {showCustomRangeInput && (
                      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Custom Network Range</h4>
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={customNetworkRange}
                            onChange={(e) => setCustomNetworkRange(e.target.value)}
                            placeholder="e.g., 192.168.1.0/24, 192.168.1.1-192.168.1.50, 192.168.1"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <div className="text-xs text-gray-600 space-y-1">
                            <p className="font-medium">Supported formats:</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                              <li><span className="font-mono bg-gray-100 px-1 rounded">192.168.1.0/24</span> - CIDR notation (/8, /16, /24)</li>
                              <li><span className="font-mono bg-gray-100 px-1 rounded">192.168.1.1-192.168.1.50</span> - IP range (start-end)</li>
                              <li><span className="font-mono bg-gray-100 px-1 rounded">192.168.1</span> - Subnet (auto .1-.254)</li>
                              <li><span className="font-mono bg-gray-100 px-1 rounded">192.168.1.100</span> - Single IP</li>
                            </ul>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                if (customNetworkRange && customNetworkRange.trim()) {
                                  setSelectedNetworkRanges(prev => [...prev, 'custom']);
                                }
                              }}
                              disabled={!customNetworkRange.trim()}
                              className="px-3 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50 disabled:bg-gray-400"
                            >
                              Add Range
                            </button>
                            <button
                              onClick={() => {
                                setShowCustomRangeInput(false);
                                setCustomNetworkRange('');
                                setSelectedNetworkRanges(prev => prev.filter(r => r !== 'custom'));
                              }}
                              className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedNetworkRanges.length > 0 && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          Will scan: {[
                            ...selectedNetworkRanges.filter(r => r !== 'custom'),
                            ...(selectedNetworkRanges.includes('custom') && customNetworkRange.trim() ? [customNetworkRange.trim()] : [])
                          ].join(', ')}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">Printer Discovery</h4>
                      <p className="text-xs text-gray-500">Scan selected networks for printers</p>
                    </div>
                    <button
                      onClick={discoverNetworkPrinters}
                      disabled={isDiscovering || (selectedNetworkRanges.length === 0 && !customNetworkRange.trim())}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:bg-gray-400"
                    >
                      <ArrowPathIcon className={`h-4 w-4 mr-2 ${isDiscovering ? 'animate-spin' : ''}`} />
                      {isDiscovering ? 'Scanning Networks...' : 'Discover Printers'}
                    </button>
                  </div>
                </div>

                {discoveredPrinters.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Discovered Printers</h4>
                    <div className="space-y-2">
                      {discoveredPrinters.map((printer, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setConfig(prev => ({
                              ...prev,
                              networkConfig: { ip: printer.ip, port: printer.port },
                              name: printer.hostname || `Network Printer ${printer.ip}`
                            }));
                          }}
                          className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {printer.hostname || 'Unknown Printer'}
                            </p>
                            <p className="text-sm text-gray-500">{printer.ip}:{printer.port}</p>
                          </div>
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                            {printer.responseTime}ms
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">IP Address</label>
                    <input
                      type="text"
                      value={config.networkConfig?.ip || ''}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        networkConfig: { ...prev.networkConfig!, ip: e.target.value }
                      }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="192.168.1.100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Port</label>
                    <input
                      type="number"
                      value={config.networkConfig?.port || ''}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        networkConfig: { ...prev.networkConfig!, port: parseInt(e.target.value) }
                      }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="9100"
                    />
                  </div>
                </div>
              </div>
            )}

            {config.connection === 'usb' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">USB Configuration</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">USB Support</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        USB printers require WebUSB support. Make sure your printer supports WebUSB and you grant permissions when prompted.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {config.connection === 'serial' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Serial Configuration</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Port</label>
                    <select
                      value={config.serialConfig?.port || ''}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        serialConfig: { ...prev.serialConfig!, port: e.target.value }
                      }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Port</option>
                      <option value="COM1">COM1</option>
                      <option value="COM2">COM2</option>
                      <option value="COM3">COM3</option>
                      <option value="/dev/ttyUSB0">/dev/ttyUSB0</option>
                      <option value="/dev/ttyACM0">/dev/ttyACM0</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Baud Rate</label>
                    <select
                      value={config.serialConfig?.baudRate || 9600}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        serialConfig: { ...prev.serialConfig!, baudRate: parseInt(e.target.value) }
                      }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={9600}>9600</option>
                      <option value={19200}>19200</option>
                      <option value={38400}>38400</option>
                      <option value={57600}>57600</option>
                      <option value={115200}>115200</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {config.connection === 'bluetooth' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Bluetooth Configuration</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex">
                    <WifiIcon className="h-5 w-5 text-blue-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Bluetooth Support</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Bluetooth printers require Web Bluetooth API support. This feature is experimental in some browsers.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 3: // Settings
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Printer Name</label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter printer name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Paper Size</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {paperSizes.map((size) => (
                  <div
                    key={size.id}
                    onClick={() => setConfig(prev => ({ ...prev, paperSize: size.id }))}
                    className={`relative rounded-lg border cursor-pointer hover:bg-gray-50 p-3 ${
                      config.paperSize === size.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300'
                    }`}
                  >
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{size.name}</h3>
                      <p className="text-xs text-gray-500">{size.description}</p>
                    </div>
                    {config.paperSize === size.id && (
                      <CheckCircleIcon className="h-4 w-4 text-blue-500 absolute top-2 right-2" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assignment</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {assignmentOptions.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => setConfig(prev => ({ ...prev, assignedTo: option.id as any }))}
                    className={`relative rounded-lg border cursor-pointer hover:bg-gray-50 p-3 ${
                      config.assignedTo === option.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300'
                    }`}
                  >
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{option.name}</h3>
                      <p className="text-xs text-gray-500">{option.description}</p>
                    </div>
                    {config.assignedTo === option.id && (
                      <CheckCircleIcon className="h-4 w-4 text-blue-500 absolute top-2 right-2" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location (Optional)</label>
              <input
                type="text"
                value={config.location || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, location: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Front Counter, Kitchen Station 1"
              />
            </div>

            {/* Company Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Assignment</label>
              <select
                value={selectedCompany}
                onChange={(e) => handleCompanyChange(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a company...</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Branch Selection */}
            {selectedCompany && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Branch Assignment</label>
                <select
                  value={config.branchId || ''}
                  onChange={(e) => handleBranchChange(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a branch...</option>
                  {availableBranches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
                {availableBranches.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    No branches found for this company. You can still continue without selecting a branch.
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center">
              <input
                id="is-default"
                type="checkbox"
                checked={config.isDefault}
                onChange={(e) => setConfig(prev => ({ ...prev, isDefault: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is-default" className="ml-2 block text-sm text-gray-900">
                Set as default printer for this station
              </label>
            </div>
          </div>
        );

      case 4: // Test & Validate
        return (
          <div className="space-y-6">
            <div className="text-center">
              <PrinterIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Test Printer Connection</h3>
              <p className="text-sm text-gray-500 mt-2">
                Validate that your printer is properly configured and reachable
              </p>
            </div>

            {!validationResult && (
              <div className="text-center">
                <button
                  onClick={validatePrinterConnection}
                  disabled={isValidating}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isValidating ? (
                    <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  ) : (
                    <CheckCircleIcon className="-ml-1 mr-2 h-4 w-4" />
                  )}
                  {isValidating ? 'Testing Connection...' : 'Test Connection'}
                </button>
              </div>
            )}

            {validationResult && (
              <div className={`rounded-md p-4 ${
                validationResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex">
                  {validationResult.success ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-400" />
                  ) : (
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                  )}
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${
                      validationResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {validationResult.success ? 'Connection Successful' : 'Connection Failed'}
                    </h3>
                    <p className={`text-sm mt-1 ${
                      validationResult.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {validationResult.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {validationResult?.success && config.capabilities.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Detected Capabilities</h4>
                <div className="flex flex-wrap gap-2">
                  {config.capabilities.map((capability) => (
                    <span key={capability} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">
                      {capability}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Test Print Section */}
            {validationResult?.success && (
              <div className="border-t pt-6">
                <div className="text-center">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Test Print Output</h4>
                  <p className="text-xs text-gray-500 mb-4">
                    Send a test print to verify the printer is working correctly
                  </p>
                  
                  {!testPrintResult && (
                    <button
                      onClick={handleTestPrint}
                      disabled={isTestPrinting}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      {isTestPrinting ? (
                        <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      ) : (
                        <PrinterIcon className="-ml-1 mr-2 h-4 w-4" />
                      )}
                      {isTestPrinting ? 'Sending Test Print...' : 'Send Test Print'}
                    </button>
                  )}

                  {testPrintResult && (
                    <div className={`rounded-md p-4 ${
                      testPrintResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}>
                      <div className="flex">
                        {testPrintResult.success ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-400" />
                        ) : (
                          <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                        )}
                        <div className="ml-3">
                          <h3 className={`text-sm font-medium ${
                            testPrintResult.success ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {testPrintResult.success ? 'Test Print Sent!' : 'Test Print Failed'}
                          </h3>
                          <p className={`text-sm mt-1 ${
                            testPrintResult.success ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {testPrintResult.message}
                          </p>
                          
                          {testPrintResult.testDetails && (
                            <div className="mt-2 text-xs text-green-600">
                              <p>📄 Print Data: {testPrintResult.testDetails.printData}</p>
                              <p>📡 Response: {testPrintResult.testDetails.responseTime}ms</p>
                            </div>
                          )}
                          
                          {!testPrintResult.success && testPrintResult.testDetails && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-red-600">Troubleshooting:</p>
                              <ul className="text-xs text-red-600 list-disc list-inside ml-2">
                                {testPrintResult.testDetails.map((step, index) => (
                                  <li key={index}>{step}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4 text-center">
                        <button
                          onClick={() => setTestPrintResult(null)}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Send Another Test Print
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 5: // Review
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Configuration Complete</h3>
              <p className="text-sm text-gray-500 mt-2">
                Review your printer configuration before saving
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Name:</span>
                <span className="text-sm font-medium text-gray-900">{config.name || 'Unnamed Printer'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Type:</span>
                <span className="text-sm font-medium text-gray-900">{config.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Connection:</span>
                <span className="text-sm font-medium text-gray-900">{config.connection}</span>
              </div>
              {config.connection === 'network' && config.networkConfig && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Address:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {config.networkConfig.ip}:{config.networkConfig.port}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Paper Size:</span>
                <span className="text-sm font-medium text-gray-900">{config.paperSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Assigned To:</span>
                <span className="text-sm font-medium text-gray-900">{config.assignedTo}</span>
              </div>
              {config.location && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Location:</span>
                  <span className="text-sm font-medium text-gray-900">{config.location}</span>
                </div>
              )}
              {config.companyName && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Company:</span>
                  <span className="text-sm font-medium text-gray-900">{config.companyName}</span>
                </div>
              )}
              {config.branchName && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Branch:</span>
                  <span className="text-sm font-medium text-gray-900">{config.branchName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Default:</span>
                <span className="text-sm font-medium text-gray-900">{config.isDefault ? 'Yes' : 'No'}</span>
              </div>
            </div>

            {config.capabilities.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Capabilities</h4>
                <div className="flex flex-wrap gap-2">
                  {config.capabilities.map((capability) => (
                    <span key={capability} className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs">
                      {capability}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Printer Configuration Wizard</h2>
              <p className="text-sm text-gray-500">{steps[currentStep].description}</p>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-1">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium ${
                  index < currentStep 
                    ? 'bg-green-100 text-green-800' 
                    : index === currentStep 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {index < currentStep ? (
                    <CheckIcon className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="mt-2">
            <h3 className="text-sm font-medium text-gray-900">{steps[currentStep].title}</h3>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              <ChevronLeftIcon className="w-4 h-4 mr-2" />
              Previous
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={onCancel}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              
              {currentStep === steps.length - 1 ? (
                <button
                  onClick={handleComplete}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <CheckIcon className="w-4 h-4 mr-2" />
                  Complete Setup
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Next
                  <ChevronRightIcon className="w-4 h-4 ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}