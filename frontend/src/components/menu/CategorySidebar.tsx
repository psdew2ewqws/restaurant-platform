// Category Sidebar - Editable Categories for Menu Management
import React, { useState, useCallback } from 'react';
import { 
  PlusIcon,
  PencilIcon, 
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  Bars3Icon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { MenuCategory } from '../../types/menu';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getLocalizedText } from '../../lib/menu-utils';
import toast from 'react-hot-toast';

interface CategorySidebarProps {
  categories: MenuCategory[];
  selectedCategoryId?: string;
  onCategorySelect: (categoryId: string | undefined) => void;
  onCategoryUpdate: () => void;
  className?: string;
}

interface EditingCategory {
  id: string;
  nameEn: string;
  nameAr: string;
  displayNumber: number;
  isActive: boolean;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  categories,
  selectedCategoryId,
  onCategorySelect,
  onCategoryUpdate,
  className = ''
}) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [editingCategory, setEditingCategory] = useState<EditingCategory | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [loading, setLoading] = useState(false);

  // New category form state
  const [newCategory, setNewCategory] = useState({
    nameEn: '',
    nameAr: '',
    displayNumber: categories.length + 1,
    isActive: true
  });

  const canEdit = user?.role !== 'cashier';
  const canDelete = user?.role === 'super_admin' || user?.role === 'company_owner';

  // Start editing a category
  const startEdit = useCallback((category: MenuCategory) => {
    setEditingCategory({
      id: category.id,
      nameEn: getLocalizedText(category.name, 'en'),
      nameAr: getLocalizedText(category.name, 'ar'),
      displayNumber: category.displayNumber,
      isActive: category.isActive
    });
  }, []);

  // Cancel editing
  const cancelEdit = useCallback(() => {
    setEditingCategory(null);
  }, []);

  // Save category changes
  const saveCategory = useCallback(async () => {
    if (!editingCategory) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({
          name: {
            en: editingCategory.nameEn,
            ar: editingCategory.nameAr
          },
          displayNumber: editingCategory.displayNumber,
          isActive: editingCategory.isActive
        })
      });

      if (response.ok) {
        toast.success('Category updated successfully');
        setEditingCategory(null);
        onCategoryUpdate();
      } else {
        throw new Error('Failed to update category');
      }
    } catch (error) {
      toast.error('Failed to update category');
    } finally {
      setLoading(false);
    }
  }, [editingCategory, onCategoryUpdate]);

  // Add new category
  const addCategory = useCallback(async () => {
    if (!newCategory.nameEn.trim() && !newCategory.nameAr.trim()) {
      toast.error('Category name is required in at least one language');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({
          name: {
            en: newCategory.nameEn || newCategory.nameAr,
            ar: newCategory.nameAr || newCategory.nameEn
          },
          displayNumber: newCategory.displayNumber,
          isActive: newCategory.isActive,
          ...(user?.companyId && { companyId: user.companyId })
        })
      });

      if (response.ok) {
        toast.success('Category added successfully');
        setNewCategory({
          nameEn: '',
          nameAr: '',
          displayNumber: categories.length + 2,
          isActive: true
        });
        setIsAddingCategory(false);
        onCategoryUpdate();
      } else {
        throw new Error('Failed to add category');
      }
    } catch (error) {
      toast.error('Failed to add category');
    } finally {
      setLoading(false);
    }
  }, [newCategory, user?.companyId, categories.length, onCategoryUpdate]);

  // Delete category
  const deleteCategory = useCallback(async (categoryId: string, categoryName: string) => {
    if (!confirm(`Are you sure you want to delete "${categoryName}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      });

      if (response.ok) {
        toast.success('Category deleted successfully');
        onCategoryUpdate();
        if (selectedCategoryId === categoryId) {
          onCategorySelect(undefined);
        }
      } else {
        throw new Error('Failed to delete category');
      }
    } catch (error) {
      toast.error('Failed to delete category');
    } finally {
      setLoading(false);
    }
  }, [selectedCategoryId, onCategorySelect, onCategoryUpdate]);

  // Sort categories by display number
  const sortedCategories = [...categories].sort((a, b) => a.displayNumber - b.displayNumber);

  return (
    <div className={`category-sidebar bg-white border-l border-gray-200 w-80 h-full overflow-y-auto ${className}`}>
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Bars3Icon className="w-5 h-5 mr-2" />
            Categories
          </h3>
          {canEdit && (
            <button
              onClick={() => setIsAddingCategory(true)}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Add
            </button>
          )}
        </div>
      </div>

      {/* All Products Option */}
      <div className="p-2">
        <button
          onClick={() => onCategorySelect(undefined)}
          className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
            !selectedCategoryId 
              ? 'bg-blue-100 text-blue-700 font-medium' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <span>All Products</span>
            <span className="text-xs text-gray-500">#0</span>
          </div>
        </button>
      </div>

      {/* Categories List */}
      <div className="p-2 space-y-1">
        {sortedCategories.map((category, index) => (
          <div
            key={category.id}
            className={`category-item border rounded-lg ${
              selectedCategoryId === category.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
          >
            {editingCategory?.id === category.id ? (
              // Editing Mode
              <div className="p-3 space-y-3">
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editingCategory.nameEn}
                    onChange={(e) => setEditingCategory(prev => prev ? { ...prev, nameEn: e.target.value } : null)}
                    placeholder="English name"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={editingCategory.nameAr}
                    onChange={(e) => setEditingCategory(prev => prev ? { ...prev, nameAr: e.target.value } : null)}
                    placeholder="Arabic name"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    dir="rtl"
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={editingCategory.displayNumber}
                      onChange={(e) => setEditingCategory(prev => prev ? { ...prev, displayNumber: parseInt(e.target.value) || 0 } : null)}
                      placeholder="Order"
                      className="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={editingCategory.isActive}
                        onChange={(e) => setEditingCategory(prev => prev ? { ...prev, isActive: e.target.checked } : null)}
                        className="mr-1.5"
                      />
                      Active
                    </label>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={cancelEdit}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    <XMarkIcon className="w-3 h-3 mr-1" />
                    Cancel
                  </button>
                  <button
                    onClick={saveCategory}
                    disabled={loading}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md transition-colors disabled:opacity-50"
                  >
                    <CheckIcon className="w-3 h-3 mr-1" />
                    Save
                  </button>
                </div>
              </div>
            ) : (
              // Display Mode
              <div className="flex items-center justify-between p-3">
                <button
                  onClick={() => onCategorySelect(category.id)}
                  className="flex-1 text-left min-w-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {getLocalizedText(category.name, language)}
                      </p>
                      {language === 'en' && getLocalizedText(category.name, 'ar') && (
                        <p className="text-xs text-gray-500 truncate" dir="rtl">
                          {getLocalizedText(category.name, 'ar')}
                        </p>
                      )}
                      {language === 'ar' && getLocalizedText(category.name, 'en') && (
                        <p className="text-xs text-gray-500 truncate">
                          {getLocalizedText(category.name, 'en')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-2">
                      <span className="text-xs text-gray-500">#{category.displayNumber}</span>
                      {!category.isActive && (
                        <EyeSlashIcon className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </button>
                
                {canEdit && (
                  <div className="flex items-center space-x-1 ml-2">
                    <button
                      onClick={() => startEdit(category)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    {canDelete && (
                      <button
                        onClick={() => deleteCategory(category.id, getLocalizedText(category.name, language))}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Category Form */}
      {isAddingCategory && canEdit && (
        <div className="p-2">
          <div className="border border-gray-200 rounded-lg p-3 space-y-3 bg-gray-50">
            <h4 className="text-sm font-medium text-gray-900">Add New Category</h4>
            <div className="space-y-2">
              <input
                type="text"
                value={newCategory.nameEn}
                onChange={(e) => setNewCategory(prev => ({ ...prev, nameEn: e.target.value }))}
                placeholder="English name"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={newCategory.nameAr}
                onChange={(e) => setNewCategory(prev => ({ ...prev, nameAr: e.target.value }))}
                placeholder="Arabic name"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                dir="rtl"
              />
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={newCategory.displayNumber}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, displayNumber: parseInt(e.target.value) || 0 }))}
                  placeholder="Display order"
                  className="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={newCategory.isActive}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="mr-1.5"
                  />
                  Active
                </label>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsAddingCategory(false)}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addCategory}
                disabled={loading}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors disabled:opacity-50"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};