import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  DocumentTextIcon,
  PhotoIcon,
  QrCodeIcon,
  Bars3Icon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  CogIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface TemplateElement {
  id: string;
  type: 'text' | 'line' | 'image' | 'qr' | 'barcode' | 'table' | 'separator';
  content?: string;
  styles?: {
    fontSize?: 'small' | 'normal' | 'large' | 'xlarge';
    alignment?: 'left' | 'center' | 'right';
    bold?: boolean;
    underline?: boolean;
    padding?: number;
    width?: string;
    height?: string;
  };
  properties?: {
    [key: string]: any;
  };
}

interface ReceiptTemplate {
  id?: string;
  name: string;
  type: 'receipt' | 'kitchen_order' | 'invoice' | 'label';
  paperWidth: number; // in mm
  elements: TemplateElement[];
  variables: string[];
  companyId?: string;
}

interface ReceiptTemplateDesignerProps {
  template?: ReceiptTemplate;
  onSave: (template: ReceiptTemplate) => void;
  onCancel: () => void;
}

export default function ReceiptTemplateDesigner({
  template,
  onSave,
  onCancel
}: ReceiptTemplateDesignerProps) {
  const [currentTemplate, setCurrentTemplate] = useState<ReceiptTemplate>({
    name: '',
    type: 'receipt',
    paperWidth: 80,
    elements: [],
    variables: ['order_number', 'date', 'time', 'total', 'items'],
    ...template
  });
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showElementLibrary, setShowElementLibrary] = useState(true);

  const elementTypes = [
    { type: 'text', icon: DocumentTextIcon, label: 'Text', description: 'Static text or variables' },
    { type: 'line', icon: Bars3Icon, label: 'Line', description: 'Horizontal separator line' },
    { type: 'image', icon: PhotoIcon, label: 'Image', description: 'Logo or images' },
    { type: 'qr', icon: QrCodeIcon, label: 'QR Code', description: 'QR code for order tracking' },
    { type: 'barcode', icon: Bars3Icon, label: 'Barcode', description: 'Barcode for order number' },
    { type: 'table', icon: DocumentTextIcon, label: 'Table', description: 'Order items table' },
    { type: 'separator', icon: ChevronDoubleLeftIcon, label: 'Separator', description: 'Dotted line separator' }
  ];

  const paperWidths = [
    { value: 58, label: '58mm (Small)', description: 'Mobile/handheld printers' },
    { value: 80, label: '80mm (Standard)', description: 'Most thermal printers' },
    { value: 112, label: '112mm (Wide)', description: 'Wide receipt printers' },
  ];

  const templateTypes = [
    { value: 'receipt', label: 'Customer Receipt', description: 'For customer transactions' },
    { value: 'kitchen_order', label: 'Kitchen Order', description: 'For kitchen staff' },
    { value: 'invoice', label: 'Invoice', description: 'Detailed billing document' },
    { value: 'label', label: 'Label', description: 'Product or order labels' }
  ];

  const addElement = (type: string) => {
    const newElement: TemplateElement = {
      id: `element_${Date.now()}`,
      type: type as any,
      content: getDefaultContent(type),
      styles: getDefaultStyles(type),
      properties: getDefaultProperties(type)
    };

    setCurrentTemplate(prev => ({
      ...prev,
      elements: [...prev.elements, newElement]
    }));
  };

  const getDefaultContent = (type: string): string => {
    switch (type) {
      case 'text': return 'Your Business Name';
      case 'line': return '';
      case 'image': return 'logo.png';
      case 'qr': return '{order_number}';
      case 'barcode': return '{order_number}';
      case 'table': return '{items}';
      case 'separator': return '--------------------------------';
      default: return '';
    }
  };

  const getDefaultStyles = (type: string) => {
    switch (type) {
      case 'text': 
        return {
          fontSize: 'normal' as const,
          alignment: 'center' as const,
          bold: false,
          underline: false,
          padding: 2
        };
      case 'line':
        return { padding: 1, width: '100%' };
      case 'image':
        return { alignment: 'center' as const, width: '50px', height: '50px' };
      case 'qr':
        return { alignment: 'center' as const, width: '100px', height: '100px' };
      case 'barcode':
        return { alignment: 'center' as const, width: '150px', height: '50px' };
      case 'table':
        return { fontSize: 'small' as const, padding: 1 };
      case 'separator':
        return { alignment: 'center' as const, padding: 1 };
      default:
        return {};
    }
  };

  const getDefaultProperties = (type: string) => {
    switch (type) {
      case 'qr':
        return { errorCorrection: 'M', margin: 4 };
      case 'barcode':
        return { format: 'CODE128', showText: true };
      case 'table':
        return { columns: ['item', 'qty', 'price'], showHeaders: false };
      default:
        return {};
    }
  };

  const updateElement = (elementId: string, updates: Partial<TemplateElement>) => {
    setCurrentTemplate(prev => ({
      ...prev,
      elements: prev.elements.map(el => 
        el.id === elementId ? { ...el, ...updates } : el
      )
    }));
  };

  const deleteElement = (elementId: string) => {
    setCurrentTemplate(prev => ({
      ...prev,
      elements: prev.elements.filter(el => el.id !== elementId)
    }));
    setSelectedElement(null);
  };

  const moveElement = (elementId: string, direction: 'up' | 'down') => {
    const elements = [...currentTemplate.elements];
    const index = elements.findIndex(el => el.id === elementId);
    
    if (direction === 'up' && index > 0) {
      [elements[index], elements[index - 1]] = [elements[index - 1], elements[index]];
    } else if (direction === 'down' && index < elements.length - 1) {
      [elements[index], elements[index + 1]] = [elements[index + 1], elements[index]];
    }
    
    setCurrentTemplate(prev => ({ ...prev, elements }));
  };

  const generatePreview = () => {
    const mockData = {
      order_number: 'ORD-001',
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      total: '$25.50',
      items: [
        { item: 'Burger', qty: 1, price: '$15.00' },
        { item: 'Fries', qty: 1, price: '$5.50' },
        { item: 'Drink', qty: 1, price: '$5.00' }
      ]
    };

    return currentTemplate.elements.map(element => {
      let content = element.content || '';
      
      // Replace variables with mock data
      Object.entries(mockData).forEach(([key, value]) => {
        if (typeof value === 'string') {
          content = content.replace(`{${key}}`, value);
        } else if (key === 'items' && element.type === 'table') {
          // Handle table data specially
          content = mockData.items.map(item => 
            `${item.item.padEnd(15)} ${item.qty.toString().padStart(3)} ${item.price.padStart(6)}`
          ).join('\n');
        }
      });

      return { ...element, content };
    });
  };

  const handleSave = () => {
    if (!currentTemplate.name.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    if (currentTemplate.elements.length === 0) {
      toast.error('Please add at least one element to the template');
      return;
    }

    onSave(currentTemplate);
    toast.success('Template saved successfully!');
  };

  const renderElementEditor = () => {
    const element = currentTemplate.elements.find(el => el.id === selectedElement);
    if (!element) return null;

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Edit Element</h3>
          <button
            onClick={() => setSelectedElement(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
            <textarea
              value={element.content || ''}
              onChange={(e) => updateElement(element.id, { content: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Enter content or use variables like {order_number}"
            />
            <p className="text-xs text-gray-500 mt-1">
              Available variables: {currentTemplate.variables.map(v => `{${v}}`).join(', ')}
            </p>
          </div>

          {/* Styles */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
              <select
                value={element.styles?.fontSize || 'normal'}
                onChange={(e) => updateElement(element.id, {
                  styles: { ...element.styles, fontSize: e.target.value as any }
                })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="small">Small</option>
                <option value="normal">Normal</option>
                <option value="large">Large</option>
                <option value="xlarge">Extra Large</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alignment</label>
              <select
                value={element.styles?.alignment || 'left'}
                onChange={(e) => updateElement(element.id, {
                  styles: { ...element.styles, alignment: e.target.value as any }
                })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>

          {/* Text Formatting */}
          {element.type === 'text' && (
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={element.styles?.bold || false}
                  onChange={(e) => updateElement(element.id, {
                    styles: { ...element.styles, bold: e.target.checked }
                  })}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Bold</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={element.styles?.underline || false}
                  onChange={(e) => updateElement(element.id, {
                    styles: { ...element.styles, underline: e.target.checked }
                  })}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Underline</span>
              </label>
            </div>
          )}

          {/* Element-specific properties */}
          {element.type === 'qr' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Error Correction</label>
              <select
                value={element.properties?.errorCorrection || 'M'}
                onChange={(e) => updateElement(element.id, {
                  properties: { ...element.properties, errorCorrection: e.target.value }
                })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="L">Low (7%)</option>
                <option value="M">Medium (15%)</option>
                <option value="Q">Quartile (25%)</option>
                <option value="H">High (30%)</option>
              </select>
            </div>
          )}

          {element.type === 'barcode' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Barcode Format</label>
              <select
                value={element.properties?.format || 'CODE128'}
                onChange={(e) => updateElement(element.id, {
                  properties: { ...element.properties, format: e.target.value }
                })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="CODE128">CODE128</option>
                <option value="CODE39">CODE39</option>
                <option value="EAN13">EAN13</option>
                <option value="UPC">UPC</option>
              </select>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderElementPreview = (element: TemplateElement, isSelected: boolean = false) => {
    const baseStyles = `border-2 transition-all duration-200 ${
      isSelected ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:border-gray-300'
    }`;

    const getAlignmentClass = (alignment?: string) => {
      switch (alignment) {
        case 'center': return 'text-center';
        case 'right': return 'text-right';
        default: return 'text-left';
      }
    };

    const getFontSizeClass = (fontSize?: string) => {
      switch (fontSize) {
        case 'small': return 'text-xs';
        case 'large': return 'text-lg';
        case 'xlarge': return 'text-xl';
        default: return 'text-sm';
      }
    };

    const getTextStyles = (styles?: any) => {
      let classes = getFontSizeClass(styles?.fontSize) + ' ' + getAlignmentClass(styles?.alignment);
      if (styles?.bold) classes += ' font-bold';
      if (styles?.underline) classes += ' underline';
      return classes;
    };

    switch (element.type) {
      case 'text':
        return (
          <div className={`${baseStyles} p-2 rounded`}>
            <div className={getTextStyles(element.styles)}>
              {element.content || 'Sample Text'}
            </div>
          </div>
        );
      case 'line':
        return (
          <div className={`${baseStyles} p-1 rounded`}>
            <hr className="border-gray-400" />
          </div>
        );
      case 'separator':
        return (
          <div className={`${baseStyles} p-1 rounded`}>
            <div className={getAlignmentClass(element.styles?.alignment)}>
              <span className="text-gray-400 font-mono text-xs">
                {element.content || '--------------------------------'}
              </span>
            </div>
          </div>
        );
      case 'image':
        return (
          <div className={`${baseStyles} p-2 rounded`}>
            <div className={getAlignmentClass(element.styles?.alignment)}>
              <div className="inline-block bg-gray-200 border-2 border-dashed border-gray-400 rounded p-4">
                <PhotoIcon className="h-8 w-8 text-gray-400 mx-auto" />
                <p className="text-xs text-gray-500 mt-1">{element.content || 'Image'}</p>
              </div>
            </div>
          </div>
        );
      case 'qr':
        return (
          <div className={`${baseStyles} p-2 rounded`}>
            <div className={getAlignmentClass(element.styles?.alignment)}>
              <div className="inline-block bg-gray-100 border border-gray-300 p-2 rounded">
                <div className="w-16 h-16 bg-black bg-opacity-10 grid grid-cols-8 gap-px">
                  {Array.from({ length: 64 }, (_, i) => (
                    <div key={i} className={Math.random() > 0.5 ? 'bg-black' : ''} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 'barcode':
        return (
          <div className={`${baseStyles} p-2 rounded`}>
            <div className={getAlignmentClass(element.styles?.alignment)}>
              <div className="inline-block bg-gray-100 border border-gray-300 p-2 rounded">
                <div className="flex space-x-px">
                  {Array.from({ length: 20 }, (_, i) => (
                    <div key={i} className={`bg-black w-1 ${Math.random() > 0.5 ? 'h-8' : 'h-6'}`} />
                  ))}
                </div>
                <p className="text-xs mt-1 text-center">{element.content || 'Barcode'}</p>
              </div>
            </div>
          </div>
        );
      case 'table':
        return (
          <div className={`${baseStyles} p-2 rounded`}>
            <div className="font-mono text-xs">
              <div className="space-y-1">
                <div>Item Name          Qty   Price</div>
                <div>Sample Item        1     $10.00</div>
                <div>Another Item       2     $15.00</div>
                <div className="border-t pt-1">
                  <div>Total                   $25.00</div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className={`${baseStyles} p-2 rounded`}>
            <div className="text-gray-500 text-sm">Unknown element type</div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-100 rounded-lg max-w-7xl w-full max-h-screen overflow-hidden flex">
        {/* Element Library */}
        <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
          showElementLibrary ? 'w-80' : 'w-0 overflow-hidden'
        }`}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Elements</h3>
              <button
                onClick={() => setShowElementLibrary(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <ChevronDoubleLeftIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-2">
              {elementTypes.map((elementType) => {
                const Icon = elementType.icon;
                return (
                  <button
                    key={elementType.type}
                    onClick={() => addElement(elementType.type)}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors group"
                  >
                    <Icon className="h-5 w-5 text-gray-500 group-hover:text-blue-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{elementType.label}</div>
                      <div className="text-xs text-gray-500">{elementType.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {!showElementLibrary && (
                  <button
                    onClick={() => setShowElementLibrary(true)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <ChevronDoubleRightIcon className="h-5 w-5" />
                  </button>
                )}
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Receipt Template Designer</h1>
                  <p className="text-sm text-gray-500">Design and customize your receipt templates</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <EyeIcon className="h-4 w-4 mr-2" />
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
                <button
                  onClick={onCancel}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  <CheckIcon className="h-4 w-4 mr-2" />
                  Save Template
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Template Settings & Canvas */}
            <div className="flex-1 p-6 overflow-y-auto">
              {/* Template Settings */}
              <div className="bg-white rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Template Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
                    <input
                      type="text"
                      value={currentTemplate.name}
                      onChange={(e) => setCurrentTemplate(prev => ({ ...prev, name: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter template name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={currentTemplate.type}
                      onChange={(e) => setCurrentTemplate(prev => ({ ...prev, type: e.target.value as any }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      {templateTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Paper Width</label>
                    <select
                      value={currentTemplate.paperWidth}
                      onChange={(e) => setCurrentTemplate(prev => ({ ...prev, paperWidth: parseInt(e.target.value) }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      {paperWidths.map(width => (
                        <option key={width.value} value={width.value}>{width.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Template Canvas */}
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Template Design</h3>
                  <div className="text-sm text-gray-500">
                    {currentTemplate.elements.length} elements
                  </div>
                </div>
                
                {/* Canvas */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-96 bg-gray-50">
                  <div 
                    className="bg-white shadow-lg rounded-lg overflow-hidden mx-auto"
                    style={{ width: `${Math.min(currentTemplate.paperWidth * 3, 400)}px` }}
                  >
                    {currentTemplate.elements.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium mb-2">Start designing your receipt</p>
                        <p className="text-sm">Add elements from the sidebar to begin</p>
                      </div>
                    ) : (
                      <div className="p-4 space-y-2">
                        {currentTemplate.elements.map((element, index) => (
                          <div
                            key={element.id}
                            className="group relative"
                            onClick={() => setSelectedElement(element.id)}
                          >
                            {renderElementPreview(element, selectedElement === element.id)}
                            
                            {/* Element controls */}
                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveElement(element.id, 'up');
                                }}
                                disabled={index === 0}
                                className="p-1 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 disabled:opacity-50"
                              >
                                <ArrowUpIcon className="h-3 w-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveElement(element.id, 'down');
                                }}
                                disabled={index === currentTemplate.elements.length - 1}
                                className="p-1 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 disabled:opacity-50"
                              >
                                <ArrowDownIcon className="h-3 w-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteElement(element.id);
                                }}
                                className="p-1 bg-white border border-gray-300 rounded shadow-sm hover:bg-red-50 hover:text-red-600"
                              >
                                <TrashIcon className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Properties Panel */}
            <div className={`bg-gray-50 border-l border-gray-200 transition-all duration-300 ${
              selectedElement ? 'w-80' : 'w-0 overflow-hidden'
            }`}>
              <div className="p-4">
                {renderElementEditor()}
              </div>
            </div>

            {/* Preview Panel */}
            {showPreview && (
              <div className="w-80 bg-gray-900 border-l border-gray-700 p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Print Preview</h3>
                <div className="bg-white rounded shadow-lg p-4 font-mono text-xs leading-relaxed">
                  {generatePreview().map((element, index) => (
                    <div key={`preview-${index}`} className="whitespace-pre-line">
                      {element.content}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}