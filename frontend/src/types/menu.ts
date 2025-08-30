// Menu System Types - Enterprise Grade
export interface MenuCategory {
  id: string;
  companyId: string;
  name: {
    en?: string;
    ar?: string;
  };
  description?: {
    en?: string;
    ar?: string;
  };
  image?: string;
  displayNumber: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuProduct {
  id: string;
  companyId: string;
  categoryId?: string;
  name: {
    en?: string;
    ar?: string;
  };
  description?: {
    en?: string;
    ar?: string;
  };
  image?: string;
  slug?: string;
  basePrice: number;
  pricing: {
    default?: number;
    uber_eats?: number;
    doordash?: number;
    website?: number;
    [key: string]: number | undefined;
  };
  cost: number;
  status: number; // 1=active, 0=inactive
  priority: number;
  preparationTime: number;
  tags: string[];
  category?: MenuCategory;
  company?: {
    id: string;
    name: string;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Modifier {
  id: string;
  modifierCategoryId: string;
  companyId: string;
  name: {
    en?: string;
    ar?: string;
  };
  description?: {
    en?: string;
    ar?: string;
  };
  basePrice: number;
  pricing: {
    default?: number;
    uber_eats?: number;
    doordash?: number;
    website?: number;
    [key: string]: number | undefined;
  };
  cost: number;
  status: number;
  displayNumber: number;
}

export interface ModifierCategory {
  id: string;
  companyId: string;
  name: {
    en?: string;
    ar?: string;
  };
  description?: {
    en?: string;
    ar?: string;
  };
  displayNumber: number;
  image?: string;
  modifiers: Modifier[];
}

// Promotion Types with Correct Business Logic (Markup not Discount)
export interface Promotion {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  promotionType: 'selective_product' | 'category' | 'all_menu';
  startDate: string;
  endDate: string;
  isActive: boolean;
  autoRevert: boolean;
  platforms: string[];
  minProfitMargin: number;
}

export interface PromotionProduct {
  id: string;
  promotionId: string;
  productId: string;
  baseDiscountType: 'percentage' | 'fixed';
  baseDiscountValue: number;
  product: MenuProduct;
}

export interface PromotionModifierMarkup {
  id: string;
  promotionId: string;
  productId: string;
  modifierId: string;
  markupPercentage: number; // +25% markup to compensate for discounts
  originalPrice: number;
  markedUpPrice: number;
  profitMargin?: number;
  businessReason?: string;
}

// API Response Types
export interface MenuProductsResponse {
  products: MenuProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
    nextCursor?: string;
  };
}

export interface ProductFilters {
  categoryId?: string;
  search?: string;
  sortBy?: 'name' | 'price' | 'createdAt' | 'priority';
  sortOrder?: 'asc' | 'desc';
  status?: number;
  tags?: string[];
}

// UI State Types
export interface ProductGridState {
  products: MenuProduct[];
  loading: boolean;
  error?: string;
  filters: ProductFilters;
  selectedProducts: string[];
}

// Performance Monitoring
export interface PerformanceMetrics {
  productsLoaded: number;
  renderTime: number;
  memoryUsage: number;
  scrollPerformance: number;
  cacheHitRate: number;
}