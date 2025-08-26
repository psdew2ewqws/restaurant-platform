-- Restaurant Platform Database Schema
-- Multi-tenant architecture with JSONB for internationalization

-- Companies (Restaurant Brands)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name JSONB NOT NULL, -- {"en": "Brand Name", "ar": "اسم العلامة"}
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Branches (Restaurant Locations)
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name JSONB NOT NULL, -- {"en": "Downtown Branch", "ar": "فرع وسط المدينة"}
    address JSONB NOT NULL, -- {"en": "123 Main St", "ar": "شارع الرئيسي 123"}
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    pos_system VARCHAR(50), -- 'square', 'toast', 'resy', etc.
    pos_config JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Users (Agents, Managers, Admins)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'agent', 'manager', 'admin'
    company_ids UUID[] DEFAULT '{}', -- Multi-tenant access
    branch_ids UUID[] DEFAULT '{}',
    language VARCHAR(10) DEFAULT 'en',
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Menu Categories
CREATE TABLE menu_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name JSONB NOT NULL, -- {"en": "Main Dishes", "ar": "الأطباق الرئيسية"}
    description JSONB, -- {"en": "Delicious mains", "ar": "أطباق لذيذة"}
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Menu Items
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    category_id UUID REFERENCES menu_categories(id) ON DELETE CASCADE,
    name JSONB NOT NULL, -- {"en": "Chicken Burger", "ar": "برغر الدجاج"}
    description JSONB, -- {"en": "Juicy chicken...", "ar": "دجاج طري..."}
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    preparation_time INTEGER DEFAULT 15, -- minutes
    allergens TEXT[], -- ['nuts', 'dairy']
    tags TEXT[], -- ['spicy', 'vegetarian']
    nutritional_info JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES users(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_address TEXT,
    order_type VARCHAR(50) NOT NULL, -- 'delivery', 'pickup', 'dine_in'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'
    total_amount DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    special_instructions TEXT,
    estimated_time INTEGER, -- minutes
    pos_order_id VARCHAR(255), -- External POS reference
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    customizations JSONB DEFAULT '{}', -- {"size": "large", "extras": ["cheese"]}
    special_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Call Logs (for analytics and training)
CREATE TABLE call_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    customer_phone VARCHAR(50) NOT NULL,
    call_duration INTEGER, -- seconds
    call_outcome VARCHAR(50), -- 'order_placed', 'inquiry', 'complaint', 'no_answer'
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_branches_company_id ON branches(company_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_company_ids ON users USING GIN(company_ids);
CREATE INDEX idx_users_branch_ids ON users USING GIN(branch_ids);
CREATE INDEX idx_menu_items_company_id ON menu_items(company_id);
CREATE INDEX idx_orders_company_id ON orders(company_id);
CREATE INDEX idx_orders_branch_id ON orders(branch_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_call_logs_agent_id ON call_logs(agent_id);
CREATE INDEX idx_call_logs_created_at ON call_logs(created_at);