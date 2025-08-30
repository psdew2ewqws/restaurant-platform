import React, { useState, useEffect, useCallback } from 'react';
import { 
  PlusIcon, 
  TrashIcon, 
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Types based on the Prisma schema
export interface ModifierCategory {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  selectionType: 'single' | 'multiple' | 'counter';
  isRequired: boolean;
  minSelections: number;
  maxSelections: number;
  displayOrder: number;
  isActive: boolean;
  modifiers: Modifier[];
}

export interface Modifier {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  basePrice: number;
  talabatPrice?: number;
  careemPrice?: number;
  callCenterPrice?: number;
  websitePrice?: number;
  isDefault: boolean;
  displayOrder: number;
  isActive: boolean;
  image?: string;
}

interface AddOnManagementProps {
  productId?: string;
  onSave?: (categories: ModifierCategory[]) => void;
  onBack?: () => void;
  className?: string;
}

export const AddOnManagement: React.FC<AddOnManagementProps> = ({
  productId,
  onSave,
  onBack,
  className = ""
}) => {
  const [categories, setCategories] = useState<ModifierCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ModifierCategory | null>(null);

  // Load existing categories and modifiers
  useEffect(() => {
    if (productId) {
      loadProductAddOns();
    }
  }, [productId]);

  const loadProductAddOns = async () => {
    if (!productId) return;
    
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/modifier-categories?productId=${productId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Failed to load add-ons:', error);
      toast.error('Failed to load add-ons');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowCategoryForm(true);
  };

  const handleEditCategory = (category: ModifierCategory) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this add-on category?')) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/modifier-categories/${categoryId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
          },
        }
      );

      if (response.ok) {
        setCategories(prev => prev.filter(cat => cat.id !== categoryId));
        toast.success('Add-on category deleted successfully');
      } else {
        toast.error('Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleSave = async () => {
    if (onSave) {
      onSave(categories);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading add-ons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Add-ons Management</h3>
          <p className="text-sm text-gray-600">
            Configure add-on categories and modifiers for this product
          </p>
        </div>
        <button
          onClick={handleAddCategory}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Category
        </button>
      </div>

      {/* Categories List */}
      <div className="space-y-4">
        {categories.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-gray-400 mb-4">
              <PlusIcon className="w-12 h-12 mx-auto" />
            </div>
            <h4 className="text-lg font-medium text-gray-600 mb-2">No add-on categories yet</h4>
            <p className="text-gray-500 mb-4">
              Create categories like "Size", "Toppings", or "Extras" to organize your add-ons
            </p>
            <button
              onClick={handleAddCategory}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Create First Category
            </button>
          </div>
        ) : (
          categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={() => handleEditCategory(category)}
              onDelete={() => handleDeleteCategory(category.id)}
            />
          ))
        )}
      </div>

      {/* Category Form Modal */}
      {showCategoryForm && (
        <CategoryFormModal
          category={editingCategory}
          onSave={(savedCategory) => {
            if (editingCategory) {
              setCategories(prev => 
                prev.map(cat => cat.id === savedCategory.id ? savedCategory : cat)
              );
            } else {
              setCategories(prev => [...prev, savedCategory]);
            }
            setShowCategoryForm(false);
            setEditingCategory(null);
          }}
          onCancel={() => {
            setShowCategoryForm(false);
            setEditingCategory(null);
          }}
        />
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          ← Back to Product Details
        </button>
        <button
          onClick={handleSave}
          className="inline-flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <CheckCircleIcon className="w-4 h-4 mr-2" />
          Save Add-ons Configuration
        </button>
      </div>
    </div>
  );
};

// Category Card Component
interface CategoryCardProps {
  category: ModifierCategory;
  onEdit: () => void;
  onDelete: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onEdit, onDelete }) => {
  const getSelectionTypeLabel = (type: string) => {
    switch (type) {
      case 'single': return 'Single Choice (Radio)';
      case 'multiple': return 'Multiple Choice (Checkboxes)';
      case 'counter': return 'Counter (+/- buttons)';
      default: return type;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="text-lg font-semibold text-gray-900">{category.name}</h4>
            {category.nameAr && (
              <span className="text-sm text-gray-500 font-arabic">({category.nameAr})</span>
            )}
            <div className="flex items-center gap-2">
              {category.isRequired && (
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                  Required
                </span>
              )}
              {!category.isActive && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  Inactive
                </span>
              )}
            </div>
          </div>
          
          {category.description && (
            <p className="text-sm text-gray-600 mb-2">{category.description}</p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{getSelectionTypeLabel(category.selectionType)}</span>
            <span>•</span>
            <span>
              {category.minSelections === category.maxSelections 
                ? `Exactly ${category.maxSelections}` 
                : `${category.minSelections}-${category.maxSelections} selections`}
            </span>
            <span>•</span>
            <span>{category.modifiers?.length || 0} options</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            title="Edit category"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete category"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modifiers Preview */}
      {category.modifiers && category.modifiers.length > 0 && (
        <div className="border-t pt-4">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Options:</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {category.modifiers.slice(0, 6).map((modifier) => (
              <div
                key={modifier.id}
                className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
              >
                <span className="text-sm text-gray-700 truncate">{modifier.name}</span>
                <span className="text-sm font-medium text-gray-900">
                  +{modifier.basePrice.toFixed(2)}
                </span>
              </div>
            ))}
            {category.modifiers.length > 6 && (
              <div className="flex items-center justify-center bg-gray-100 px-3 py-2 rounded-md text-sm text-gray-500">
                +{category.modifiers.length - 6} more
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Placeholder for CategoryFormModal component
interface CategoryFormModalProps {
  category: ModifierCategory | null;
  onSave: (category: ModifierCategory) => void;
  onCancel: () => void;
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({ category, onSave, onCancel }) => {
  // This will be implemented in the next step
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onCancel} />
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl relative">
          <h3 className="text-lg font-semibold mb-4">
            {category ? 'Edit Category' : 'Add New Category'}
          </h3>
          <p className="text-gray-600 mb-4">Category form will be implemented in next step.</p>
          <div className="flex justify-end gap-2">
            <button onClick={onCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
              Cancel
            </button>
            <button 
              onClick={() => onSave(category || {} as ModifierCategory)} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};