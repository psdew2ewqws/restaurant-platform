# 🗄️ Database Schema Documentation

## Overview
This document describes the PostgreSQL database schema for the Restaurant Platform. The database supports multi-tenancy, multi-language content, and enterprise-grade features.

**Database Version**: PostgreSQL 15+  
**Character Set**: UTF8  
**Collation**: en_US.UTF-8  
**Special Features**: JSONB for multi-language support, UUID primary keys

---

## 🏗️ Schema Structure

### Core Tables Overview
```
Companies (Multi-tenant isolation)
    ├── Users (Role-based access)
    ├── Branches (Multiple locations)
    ├── MenuCategories (Organized menu structure)
    └── MenuProducts (Core product data)
            ├── ProductImages (Multiple images per product)
            └── ProductPricing (Multi-channel pricing)
```

---

## 📋 Table Definitions

### 1. Companies (Multi-Tenant Root)
```sql
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    business_type VARCHAR(100) DEFAULT 'Restaurant',
    timezone VARCHAR(100) DEFAULT 'UTC',
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_status ON companies(status);
```

**Business Rules:**
- Each company is isolated (multi-tenant)
- Slug must be unique for API access
- Default currency and timezone configurable
- Status: active, trial, suspended, expired

### 2. Users (Authentication & Authorization)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_role ON users(role);
```

**Roles Hierarchy:**
1. `super_admin`: Global system access
2. `company_owner`: Company-level management  
3. `branch_manager`: Branch-level management
4. `call_center`: Order taking and customer service
5. `cashier`: Point-of-sale operations

### 3. Branches (Multi-Location Support)
```sql
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_branches_company_id ON branches(company_id);
CREATE INDEX idx_branches_is_active ON branches(is_active);
```

### 4. MenuCategories (Menu Organization)
```sql
CREATE TABLE menu_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name JSONB NOT NULL, -- Multi-language support
    description JSONB,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    display_number INTEGER NOT NULL DEFAULT 999,
    is_active BOOLEAN DEFAULT true,
    image VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_menu_categories_company_id ON menu_categories(company_id);
CREATE INDEX idx_menu_categories_display_number ON menu_categories(display_number);
CREATE INDEX idx_menu_categories_is_active ON menu_categories(is_active);

-- JSONB indexing for multi-language search
CREATE INDEX idx_menu_categories_name_gin ON menu_categories USING gin(name);
```

**JSONB Structure for Names:**
```json
{
  "en": "Pizzas",
  "ar": "البيتزا",
  "fr": "Pizzas"
}
```

### 5. MenuProducts (Core Product Data)
```sql
CREATE TABLE menu_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name JSONB NOT NULL, -- Multi-language names
    description JSONB,   -- Multi-language descriptions
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    category_id UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    cost DECIMAL(10, 2) DEFAULT 0,
    pricing JSONB DEFAULT '{}', -- Multi-channel pricing
    status INTEGER DEFAULT 1, -- 0=inactive, 1=active
    priority INTEGER DEFAULT 999, -- Lower = higher priority
    preparation_time INTEGER DEFAULT 0, -- Minutes
    tags TEXT[] DEFAULT '{}', -- Searchable tags
    image VARCHAR(500), -- Primary image
    images TEXT[] DEFAULT '{}', -- Multiple images
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_menu_products_company_id ON menu_products(company_id);
CREATE INDEX idx_menu_products_category_id ON menu_products(category_id);
CREATE INDEX idx_menu_products_status ON menu_products(status);
CREATE INDEX idx_menu_products_priority ON menu_products(priority);
CREATE INDEX idx_menu_products_base_price ON menu_products(base_price);

-- JSONB and array indexing
CREATE INDEX idx_menu_products_name_gin ON menu_products USING gin(name);
CREATE INDEX idx_menu_products_pricing_gin ON menu_products USING gin(pricing);
CREATE INDEX idx_menu_products_tags_gin ON menu_products USING gin(tags);
```

**Multi-Channel Pricing Structure:**
```json
{
  "talabat": 18.99,
  "careem": 17.99,
  "website": 15.99,
  "call_center": 14.99,
  "custom_channel": 16.99
}
```

### 6. ProductImages (Image Management)
```sql
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES menu_products(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    file_size INTEGER,
    width INTEGER,
    height INTEGER,
    mime_type VARCHAR(100),
    url VARCHAR(500),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_is_primary ON product_images(is_primary);
```

### 7. Licenses (Enterprise Features)
```sql
CREATE TABLE licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    license_type VARCHAR(100) DEFAULT 'trial',
    max_products INTEGER DEFAULT 100,
    max_branches INTEGER DEFAULT 1,
    max_users INTEGER DEFAULT 5,
    features JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_licenses_company_id ON licenses(company_id);
CREATE INDEX idx_licenses_expires_at ON licenses(expires_at);
```

---

## 🔍 Advanced Queries

### Multi-Language Search
```sql
-- Search products in English and Arabic
SELECT p.*, c.name as category_name
FROM menu_products p
LEFT JOIN menu_categories c ON p.category_id = c.id
WHERE p.company_id = $1
  AND (
    p.name->>'en' ILIKE '%pizza%' OR
    p.name->>'ar' LIKE '%بيتزا%' OR
    'pizza' = ANY(p.tags)
  )
ORDER BY p.priority ASC;
```

### Pricing by Channel
```sql
-- Get products with Talabat pricing
SELECT 
    p.id,
    p.name->>'en' as name_en,
    p.base_price,
    (p.pricing->>'talabat')::DECIMAL as talabat_price,
    COALESCE((p.pricing->>'talabat')::DECIMAL, p.base_price) as effective_price
FROM menu_products p
WHERE p.company_id = $1 AND p.status = 1
ORDER BY effective_price DESC;
```

### Category Statistics
```sql
-- Products per category with pricing stats
SELECT 
    c.name->>'en' as category_name,
    COUNT(p.id) as product_count,
    AVG(p.base_price) as avg_price,
    MIN(p.base_price) as min_price,
    MAX(p.base_price) as max_price
FROM menu_categories c
LEFT JOIN menu_products p ON c.id = p.category_id 
WHERE c.company_id = $1
GROUP BY c.id, c.name
ORDER BY product_count DESC;
```

---

## 🛡️ Data Security & Isolation

### Row Level Security (RLS)
```sql
-- Enable RLS on all tenant tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_products ENABLE ROW LEVEL SECURITY;

-- Example policy for company isolation
CREATE POLICY company_isolation ON users
    FOR ALL TO application_role
    USING (company_id = current_setting('app.current_company_id')::UUID);
```

### Data Validation
```sql
-- Constraints for data integrity
ALTER TABLE menu_products 
    ADD CONSTRAINT check_base_price_positive 
    CHECK (base_price >= 0);

ALTER TABLE menu_products 
    ADD CONSTRAINT check_priority_range 
    CHECK (priority >= 1 AND priority <= 9999);

ALTER TABLE menu_products 
    ADD CONSTRAINT check_status_valid 
    CHECK (status IN (0, 1));
```

---

## 📊 Performance Optimization

### Essential Indexes
```sql
-- Composite indexes for common queries
CREATE INDEX idx_products_company_category_status 
    ON menu_products(company_id, category_id, status);

CREATE INDEX idx_products_company_priority_status 
    ON menu_products(company_id, priority, status);

-- Partial indexes for active records
CREATE INDEX idx_active_products 
    ON menu_products(company_id, priority) 
    WHERE status = 1;

CREATE INDEX idx_active_categories 
    ON menu_categories(company_id, display_number) 
    WHERE is_active = true;
```

### Query Optimization Tips
1. **Always filter by company_id first** (tenant isolation)
2. **Use JSONB operators efficiently** (`->>` for text, `->` for JSON)
3. **Leverage GIN indexes** for JSONB and array searches
4. **Use LIMIT/OFFSET carefully** with proper ORDER BY

---

## 🔄 Migration Strategy

### Version Control
```sql
-- Migration tracking table
CREATE TABLE schema_migrations (
    version VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Track current schema version
INSERT INTO schema_migrations (version) VALUES ('2025.08.30.001');
```

### Backup Strategy
```sql
-- Full backup command
pg_dump -h localhost -U postgres -d restaurant_dashboard_dev \
    --schema-only --no-owner --no-privileges \
    > restaurant_platform_schema.sql

-- Data backup (without sensitive info)
pg_dump -h localhost -U postgres -d restaurant_dashboard_dev \
    --data-only --exclude-table=users \
    > restaurant_platform_data.sql
```

---

## 🧪 Test Data Examples

### Sample Company
```sql
INSERT INTO companies (id, name, slug, business_type, currency) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Pizza Palace',
    'pizza-palace',
    'Restaurant',
    'JOD'
);
```

### Sample Category
```sql
INSERT INTO menu_categories (id, name, description, company_id, display_number) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    '{"en": "Pizzas", "ar": "البيتزا"}',
    '{"en": "Delicious pizzas", "ar": "بيتزا لذيذة"}',
    '550e8400-e29b-41d4-a716-446655440000',
    1
);
```

### Sample Product
```sql
INSERT INTO menu_products (
    id, name, description, company_id, category_id, 
    base_price, pricing, tags, priority
) VALUES (
    '550e8400-e29b-41d4-a716-446655440002',
    '{"en": "Margherita Pizza", "ar": "بيتزا مارجريتا"}',
    '{"en": "Classic pizza with tomato and mozzarella", "ar": "بيتزا كلاسيكية بالطماطم والموزاريلا"}',
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440001',
    15.99,
    '{"talabat": 17.99, "careem": 16.99, "website": 15.99}',
    '{"vegetarian", "classic", "popular"}',
    1
);
```

---

## 📈 Monitoring Queries

### Performance Monitoring
```sql
-- Find slow queries
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Business Intelligence
```sql
-- Daily product creation stats
SELECT 
    DATE(created_at) as date,
    COUNT(*) as products_created,
    AVG(base_price) as avg_price
FROM menu_products 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Popular tags analysis
SELECT 
    tag,
    COUNT(*) as usage_count
FROM menu_products, unnest(tags) as tag
WHERE company_id = $1
GROUP BY tag
ORDER BY usage_count DESC
LIMIT 20;
```

---

**Schema Version**: 2025.08.30.001  
**Last Updated**: August 30, 2025  
**Compatible With**: PostgreSQL 15+