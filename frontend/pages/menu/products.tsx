// Enterprise Menu Products Management - B2B Professional
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  PlusIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  ClipboardDocumentListIcon,
  TagIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../src/contexts/AuthContext';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { ProtectedRoute } from '../../src/components/ProtectedRoute';
import { VirtualizedProductGrid } from '../../src/components/menu/VirtualizedProductGrid';
import { ProductFilters } from '../../src/components/menu/ProductFilters';
import { ProductFilters as ProductFiltersType, MenuProduct, MenuCategory } from '../../src/types/menu';
import toast from 'react-hot-toast';

export default function MenuProductsPage() {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [filters, setFilters] = useState<ProductFiltersType>({
    sortBy: 'priority',
    sortOrder: 'asc',
    status: undefined,
    search: '',
    tags: []
  });
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Load categories and tags for filters
  useEffect(() => {
    loadFilterData();
  }, [user?.companyId]);

  const loadFilterData = async () => {
    // Super admins can see all data, regular users need companyId
    if (!user?.companyId && user?.role !== 'super_admin') return;
    
    try {
      const [categoriesRes, tagsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu/categories`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth-token')}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu/tags`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth-token')}` }
        })
      ]);
      
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.categories || []);
      }
      
      if (tagsRes.ok) {
        const tagsData = await tagsRes.json();
        setAvailableTags(tagsData.tags || []);
      }
    } catch (error) {
      console.error('Failed to load filter data:', error);
    }
  };

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: Partial<ProductFiltersType>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Handle product selection for bulk operations
  const handleProductSelect = useCallback((productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  }, []);

  // Toggle selection mode
  const toggleSelectionMode = useCallback(() => {
    setSelectionMode(prev => !prev);
    setSelectedProducts([]);
  }, []);

  // Bulk operations
  const handleBulkStatusChange = useCallback(async (status: number) => {
    if (selectedProducts.length === 0) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu/products/bulk-status`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({
          productIds: selectedProducts,
          status
        }),
      });

      if (response.ok) {
        toast.success(`${selectedProducts.length} products updated successfully`);
        setSelectedProducts([]);
        setSelectionMode(false);
      } else {
        throw new Error('Failed to update products');
      }
    } catch (error) {
      toast.error('Failed to update products');
    } finally {
      setLoading(false);
    }
  }, [selectedProducts]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedProducts.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedProducts.length} products? This action cannot be undone.`)) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu/products/bulk-delete`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({
          productIds: selectedProducts
        }),
      });

      if (response.ok) {
        toast.success(`${selectedProducts.length} products deleted successfully`);
        setSelectedProducts([]);
        setSelectionMode(false);
      } else {
        throw new Error('Failed to delete products');
      }
    } catch (error) {
      toast.error('Failed to delete products');
    } finally {
      setLoading(false);
    }
  }, [selectedProducts]);

  // Product actions
  const handleProductView = useCallback((product: MenuProduct) => {
    toast.success(`Viewing ${product.name.en || product.name.ar}`);
  }, []);

  const handleProductEdit = useCallback((product: MenuProduct) => {
    toast.success(`Editing ${product.name.en || product.name.ar}`);
  }, []);

  const handleProductDelete = useCallback((productId: string) => {
    toast.success('Product deletion would be implemented here');
  }, []);

  // Export functionality
  const handleExport = useCallback(() => {
    toast.success('Export functionality would be implemented here');
  }, []);

  // Import functionality
  const handleImport = useCallback(() => {
    toast.success('Import functionality would be implemented here');
  }, []);

  const selectionStats = useMemo(() => ({
    totalSelected: selectedProducts.length,
    canEdit: user?.role !== 'cashier',
    canDelete: user?.role === 'super_admin' || user?.role === 'company_owner'
  }), [selectedProducts, user?.role]);

  return (
    <ProtectedRoute>
      <Head>
        <title>Menu Products - Restaurant Management</title>
        <meta name="description" content="Manage your restaurant menu products with enterprise-grade tools" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Simple B2B Header - Match Dashboard Style */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Navigation with Back Button */}
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
                <div className="h-6 w-px bg-gray-300"></div>
                <div className="flex items-center space-x-2">
                  <ClipboardDocumentListIcon className="w-5 h-5 text-gray-600" />
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900">Menu Products</h1>
                    <p className="text-sm text-gray-500">Manage restaurant menu items</p>
                  </div>
                </div>
              </div>
              
              {/* Right Side Actions */}
              <div className="flex items-center space-x-3">
                {/* Add Category Button */}
                <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
                  <TagIcon className="w-4 h-4 mr-2" />
                  Add Category
                </button>
                
                {/* Add Product Button */}
                <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Product
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Action Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              {/* Bulk Selection */}
              <button
                onClick={toggleSelectionMode}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border transition-all duration-200 ${
                  selectionMode
                    ? 'text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100'
                    : 'text-gray-600 bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <ClipboardDocumentListIcon className="w-4 h-4 mr-1.5" />
                {selectionMode ? 'Exit Selection' : 'Bulk Select'}
              </button>

              {/* Import/Export */}
              <div className="flex border border-gray-200 rounded-md bg-white">
                <button
                  onClick={handleImport}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors border-r border-gray-200"
                >
                  <DocumentArrowUpIcon className="w-4 h-4 mr-1.5" />
                  Import
                </button>
                <button
                  onClick={handleExport}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <DocumentArrowDownIcon className="w-4 h-4 mr-1.5" />
                  Export
                </button>
              </div>
            </div>

          </div>

          {/* Selection Mode Banner */}
          {selectionMode && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ClipboardDocumentListIcon className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-800">
                    Selection Mode Active - {selectionStats.totalSelected} product{selectionStats.totalSelected !== 1 ? 's' : ''} selected
                  </span>
                </div>
                
                {selectionStats.totalSelected > 0 && (
                  <div className="flex items-center space-x-3">
                    {selectionStats.canEdit && (
                      <>
                        <button
                          onClick={() => handleBulkStatusChange(1)}
                          disabled={loading}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md transition-colors disabled:opacity-50"
                        >
                          <CheckCircleIcon className="w-4 h-4 mr-1" />
                          Activate
                        </button>
                        <button
                          onClick={() => handleBulkStatusChange(0)}
                          disabled={loading}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-yellow-700 bg-yellow-100 hover:bg-yellow-200 rounded-md transition-colors disabled:opacity-50"
                        >
                          <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                          Deactivate
                        </button>
                      </>
                    )}
                    
                    {selectionStats.canDelete && (
                      <button
                        onClick={handleBulkDelete}
                        disabled={loading}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors disabled:opacity-50"
                      >
                        Delete Selected
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Professional Filters */}
          <ProductFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            categories={categories}
            availableTags={availableTags}
            className="mb-6"
          />

          {/* Enterprise Product Grid - Handles 100k+ Items */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <VirtualizedProductGrid
              filters={filters}
              onProductSelect={selectionMode ? handleProductSelect : undefined}
              onProductEdit={handleProductEdit}
              onProductDelete={handleProductDelete}
              onProductView={handleProductView}
              selectedProducts={selectedProducts}
              selectionMode={selectionMode}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}