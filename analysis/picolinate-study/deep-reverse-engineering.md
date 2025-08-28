# DEEP REVERSE ENGINEERING - Picolinate System Analysis

## 🔥 **REAL DATA STRUCTURE ANALYSIS**

### **Discovered Order JSON Structure** (From Actual Production Order)
```json
{
  "id": "002189a6-bd47-4223-9ce3-d3891ecdeac1",
  "reference": 182246,
  "check_number": 100653,
  "number": 5,
  "type": 1,
  "source": 1, 
  "status": 7,
  "business_date": "2025-03-23",
  "subtotal_price": 0,
  "total_price": 0,
  "guests": 1,
  
  "branch": {
    "id": "9db092ec-f102-4a8a-a731-10da52902ece",
    "name": "73 by Al Ameed",
    "name_localized": "73 فرع",
    "reference": "73store",
    "type": 1,
    "opening_from": "06:00",
    "opening_to": "03:00",
    "inventory_end_of_day_time": "03:00",
    "receipt_header": "الرقم الضريبي: 017956072",
    "receives_online_orders": true,
    "accepts_reservations": false,
    "settings": {
      "sa_zatca_branch_address": [],
      "display_background_image": null,
      "eg_ereceipt_branch_address": [],
      "branch_commercial_registration_number": null
    }
  },
  
  "creator": {
    "id": "9e2dda8b-ed4f-4a34-b554-f7a1f008d52c",
    "name": "عمر عبد الهادي",
    "pin": "23bf7b465c93ee060ce7eaf7cb893c27062d751af8b736c6c47b0e510c884ee1",
    "is_owner": false,
    "lang": "ar",
    "display_localized_names": true,
    "associate_to_all_branches": false,
    "two_factor_auth_enabled": false
  },
  
  "products": [{
    "id": "9e81c032-b733-44c8-a91c-b5b1345e8e77",
    "quantity": 1,
    "unit_price": 73,
    "total_price": 73,
    "status": 5,
    "product": {
      "id": "9e093944-98ba-4854-997c-fe0c13dec69a",
      "sku": "I01881",
      "name": "Espresso Capsules Machine - White",
      "name_localized": "ماكينة كبسولات اسبرسو ابيض",
      "price": 73,
      "is_stock_product": true,
      "preparation_time": 3,
      "category": {
        "id": "9d9e6316-048c-415d-88cc-f73527ddcb55",
        "name": "Machines",
        "name_localized": "ماكينات",
        "reference": "109"
      }
    },
    "void_reason": {
      "id": "9d7a9577-27ba-4add-9682-394abe7a982e",
      "type": 1,
      "name": "Customer Cancelled",
      "name_localized": "تغيير رأي العميل"
    }
  }],
  
  "device": {
    "id": "9dc8d7cb-87b5-4675-9cff-3e067982cca9",
    "name": "73-Main Cash",
    "code": "14314",
    "reference": "C04",
    "type": 1
  },
  
  "tags": [{
    "id": "9e6c93f8-f37a-4bd3-94a0-d8af9b7eddd1",
    "type": 4,
    "name": "73",
    "name_localized": "73"
  }],
  
  "meta": {
    "foodics": {
      "device_id": "9dc8d7cb-87b5-4675-9cff-3e067982cca9",
      "auto_closed": false,
      "products_kitchen": [],
      "void_approver_id": "9e2dda8b-ed4f-4a34-b554-f7a1f008d52c",
      "business_date_in_utc": "2025-03-23"
    }
  },
  
  "timestamps": {
    "opened_at": "2025-03-23 07:24:01",
    "closed_at": "2025-03-23 07:24:49",
    "created_at": "2025-03-24 07:25:25",
    "updated_at": "2025-03-24 07:25:25"
  }
}
```

## 🗄️ **DATABASE ARCHITECTURE REVEALED**

### **Connection Strings Analysis**
```json
// Main Company Database
"CompanyDB": "User ID=postgres;Password=***;Host=65.21.157.87;Port=5432;Database=CompanyDB;Pooling=true;Maximum Pool Size=120;"

// Specialized Databases  
"ChatbotDB": "Host=65.21.157.87;Port=5432;Database=ChatbotDB;"
"WhatsappDB": "Host=65.21.157.87;Port=5432;Database=WhatsappDB;"

// Multi-environment setup
// UAT: 65.21.157.87
// PROD: 95.216.212.50
```

### **Inferred Database Schema** (From Real Data)
```sql
-- COMPANIES & BRANCHES (Multi-tenant Foundation)
CREATE TABLE companies (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    name_localized VARCHAR(255),
    commercial_registration_number VARCHAR(100),
    tax_number VARCHAR(100),
    settings JSONB,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE branches (
    id UUID PRIMARY KEY,
    company_id UUID REFERENCES companies(id),
    name VARCHAR(255),
    name_localized VARCHAR(255), 
    reference VARCHAR(100),
    type INTEGER, -- 1=restaurant, 2=retail, etc
    latitude DECIMAL,
    longitude DECIMAL,
    phone VARCHAR(50),
    opening_from TIME,
    opening_to TIME,
    inventory_end_of_day_time TIME,
    receipt_header TEXT,
    receipt_footer TEXT,
    receives_online_orders BOOLEAN DEFAULT TRUE,
    accepts_reservations BOOLEAN DEFAULT FALSE,
    reservation_duration INTEGER DEFAULT 30,
    address JSONB,
    settings JSONB,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);

-- USERS & AUTHENTICATION (Staff Management)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    company_id UUID REFERENCES companies(id),
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    pin VARCHAR(255), -- Hashed PIN for POS access
    is_owner BOOLEAN DEFAULT FALSE,
    lang VARCHAR(5) DEFAULT 'en',
    display_localized_names BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    must_use_fingerprint BOOLEAN DEFAULT FALSE,
    associate_to_all_branches BOOLEAN DEFAULT FALSE,
    two_factor_auth_enabled BOOLEAN DEFAULT FALSE,
    last_console_login_at TIMESTAMP,
    last_cashier_login_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);

-- PRODUCTS & CATALOG
CREATE TABLE categories (
    id UUID PRIMARY KEY,
    company_id UUID REFERENCES companies(id),
    name VARCHAR(255),
    name_localized VARCHAR(255),
    reference VARCHAR(100),
    image TEXT,
    parent_id UUID REFERENCES categories(id),
    sort_order INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE products (
    id UUID PRIMARY KEY,
    company_id UUID REFERENCES companies(id),
    category_id UUID REFERENCES categories(id),
    sku VARCHAR(100),
    barcode VARCHAR(100),
    name VARCHAR(255),
    name_localized VARCHAR(255),
    description TEXT,
    description_localized TEXT,
    image TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_stock_product BOOLEAN DEFAULT TRUE,
    is_non_revenue BOOLEAN DEFAULT FALSE,
    is_ready BOOLEAN DEFAULT TRUE,
    pricing_method INTEGER, -- 1=fixed, 2=variable
    selling_method INTEGER,
    costing_method INTEGER,
    preparation_time INTEGER, -- in minutes
    price DECIMAL(10,2),
    cost DECIMAL(10,2),
    calories INTEGER,
    walking_minutes_to_burn_calories INTEGER,
    is_high_salt BOOLEAN DEFAULT FALSE,
    meta JSONB,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);

-- ORDERS (Core Transaction System)
CREATE TABLE orders (
    id UUID PRIMARY KEY,
    company_id UUID REFERENCES companies(id),
    branch_id UUID REFERENCES branches(id),
    creator_id UUID REFERENCES users(id),
    closer_id UUID REFERENCES users(id),
    customer_id UUID,
    device_id UUID REFERENCES devices(id),
    app_id UUID,
    reference_x VARCHAR(100),
    number INTEGER, -- Sequential order number
    check_number BIGINT, -- Receipt number
    reference BIGINT, -- System reference
    type INTEGER, -- 1=dine_in, 2=takeaway, 3=delivery
    source INTEGER, -- 1=pos, 2=mobile, 3=web, 4=phone
    status INTEGER, -- 1=open, 2=confirmed, 7=closed, etc
    delivery_status INTEGER,
    business_date DATE,
    guests INTEGER DEFAULT 1,
    kitchen_notes TEXT,
    customer_notes TEXT,
    
    -- Pricing
    subtotal_price DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    rounding_amount DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2) DEFAULT 0,
    tax_exclusive_discount_amount DECIMAL(10,2) DEFAULT 0,
    
    -- Timing
    delay_in_seconds INTEGER,
    opened_at TIMESTAMP,
    accepted_at TIMESTAMP,
    due_at TIMESTAMP,
    driver_assigned_at TIMESTAMP,
    dispatched_at TIMESTAMP,
    driver_collected_at TIMESTAMP,
    delivered_at TIMESTAMP,
    closed_at TIMESTAMP,
    
    -- Metadata
    meta JSONB,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- ORDER ITEMS
CREATE TABLE order_products (
    id UUID PRIMARY KEY,
    order_id UUID REFERENCES orders(id),
    product_id UUID REFERENCES products(id),
    creator_id UUID REFERENCES users(id),
    voider_id UUID REFERENCES users(id),
    void_reason_id UUID,
    discount_type INTEGER,
    quantity DECIMAL(10,3) DEFAULT 1,
    returned_quantity DECIMAL(10,3) DEFAULT 0,
    unit_price DECIMAL(10,2),
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    tax_exclusive_discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_exclusive_unit_price DECIMAL(10,2),
    tax_exclusive_total_price DECIMAL(10,2),
    status INTEGER, -- 1=pending, 2=confirmed, 5=voided
    is_ingredients_wasted BOOLEAN DEFAULT FALSE,
    delay_in_seconds INTEGER,
    kitchen_notes TEXT,
    meta JSONB,
    added_at TIMESTAMP,
    closed_at TIMESTAMP
);

-- DEVICES (POS Terminals)
CREATE TABLE devices (
    id UUID PRIMARY KEY,
    branch_id UUID REFERENCES branches(id),
    name VARCHAR(255),
    code VARCHAR(100), -- Device identifier
    reference VARCHAR(100),
    type INTEGER, -- 1=pos, 2=kds, 3=mobile
    is_active BOOLEAN DEFAULT TRUE,
    last_sync_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- TAGS & CATEGORIZATION
CREATE TABLE tags (
    id UUID PRIMARY KEY,
    company_id UUID REFERENCES companies(id),
    type INTEGER,
    name VARCHAR(255),
    name_localized VARCHAR(255),
    color VARCHAR(7),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE order_tags (
    order_id UUID REFERENCES orders(id),
    tag_id UUID REFERENCES tags(id),
    PRIMARY KEY (order_id, tag_id)
);

-- VOID REASONS
CREATE TABLE void_reasons (
    id UUID PRIMARY KEY,
    company_id UUID REFERENCES companies(id),
    type INTEGER,
    name VARCHAR(255),
    name_localized VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);
```

## 🔌 **COMPLETE SERVICE ECOSYSTEM MAP**

### **Core Services Discovered**
```yaml
1. API Gateway (InterfaceIshbekAPI):
   - Port: 5001
   - Role: Main API interface
   - Auth: JWT with 30-day tokens
   - Features: Customer management, Order routing

2. ApiServices (InterfaceIshbekAPI):
   - Role: Extended API services  
   - Features: Delivery integrations, SMS, Aggregators
   - New Integration: MozaicService (Al Ameed Coffee chain)

3. OrderingS (OrderingAPI):
   - Role: Order processing engine
   - Features: Order lifecycle, POS sync, Kitchen display
   - Integrations: 7+ delivery partners

4. Services (CompanyManagementSystemAPI):
   - Role: Business management
   - Features: Company setup, Analytics, Reporting
   - Advanced: Excel exports, QR codes, Payment processing

5. ChatbotService:
   - Role: AI chatbot for WhatsApp/Web
   - Features: RASA NLP, Multi-language support
   - Databases: Dedicated ChatbotDB + WhatsappDB

6. Menu Integration (MenuIntegrator):
   - Role: POS system synchronization
   - Features: Foodics, TabSense, Real-time menu sync

7. AshyaeeAPI:
   - Role: Specialized restaurant chain API
   - Features: Custom business logic for Al Ameed chain

8. Middleware (Laravel-based):
   - Role: Order processing middleware
   - Features: Airport orders, Multi-location handling
   - Data: Thousands of real order JSONs discovered!
```

## 🌐 **EXTERNAL INTEGRATIONS MATRIX**

### **Delivery Partners (7 Active)**
```yaml
Talabat:
  - Base: "hcustomers.ishbek.com/api/Customers/"
  - Features: Order creation, Fee estimation, Credentials management
  
Careem (Now/Express):
  - Base: "integration.ishbek.com/CareemNow/Api/"
  - Features: Order creation, Status updates, Menu sync
  
Nashmi:
  - Base: "integration.ishbek.com/Nashmi/Nashmi"
  - Features: Time estimation, Order creation, Branch-specific
  
Dhub:
  - Base: "middleware.ishbek.com/api/"
  - Features: Merchant task management, Order processing
  
TopDelivery:
  - Base: "integration.ishbek.com/TopDelivery/Api/"
  - Features: Estimations, Order creation, Status tracking
  
JoodDelivery:
  - Base: "integration.ishbek.com/JoodDelivery/Api"
  - Features: Full delivery lifecycle management
  
Tawasi:
  - Base: "integration.ishbek.com/Tawasi/Api/"
  - Features: Order creation, Delivery management
```

### **POS System Integrations**
```yaml
Foodics Integration:
  - Features: Menu sync, Order forwarding, Inventory
  - Protocol: REST API with webhook callbacks
  
TabSense Integration:  
  - Features: Real-time menu updates, Order processing
  - Protocol: Custom API integration

Generic POS Plugin:
  - Endpoint: "/HandleOrder"  
  - Validation: UUID-based security
  - Features: Universal POS compatibility
```

### **Communication Services**
```yaml
SMS (Infobip):
  - Endpoint: "qg4mer.api.infobip.com/sms/2/text/advanced"
  - Features: Multi-language SMS, Delivery confirmations

WhatsApp Business:
  - Provider: Facebook Graph API v14.0
  - Features: Media messages, Template messages, Chatbot
  - Secondary: Infobip WhatsApp API

Email (SendGrid):
  - Features: Transactional emails, Receipts, Notifications

RASA NLP Chatbot:
  - Host: "65.108.60.120:5005"
  - Features: Natural language processing, Intent recognition
```

### **Payment & Financial**
```yaml
Mastercard Gateway:
  - Environment: Test/Production
  - Features: Card processing, 3D Secure
  - Merchant: Multi-tenant setup

EliCash (Cashback System):
  - Features: User creation, Credit checking, Burn/Earn transactions
  - Integration: REST API with bearer tokens

Payment Processing:
  - Features: Multiple payment methods, Refunds, Split payments
```

## 🏢 **REAL BUSINESS LOGIC PATTERNS**

### **Multi-Tenant Architecture**
```yaml
Company Level:
  - Each restaurant chain = Company
  - Settings: Tax numbers, Branding, Business rules
  - Isolation: Complete data separation

Branch Level:  
  - Each location = Branch
  - Settings: Hours, Menu availability, Delivery zones
  - Devices: POS terminals, Kitchen displays

User Level:
  - Role-based access: Owner, Manager, Staff, Cashier
  - Branch assignment: Can work at specific branches only
  - PIN-based POS access with 2FA support
```

### **Order Lifecycle State Machine**
```yaml
Order Status Flow:
  1 (Open) → 2 (Confirmed) → 3 (Preparing) → 4 (Ready) → 7 (Closed)
  
  Alternative flows:
  - 5 (Voided) - Cancelled orders
  - 6 (Partially Returned) - Partial refunds
  
Product Status Flow:
  1 (Added) → 2 (Confirmed) → 3 (Preparing) → 4 (Ready) → 5 (Voided)

Source Types:
  1 (POS) - In-store terminal
  2 (Mobile App) - Customer mobile order  
  3 (Website) - Online ordering
  4 (Phone) - Call center orders
  5 (Delivery Partner) - Talabat/Careem etc
```

### **Advanced Features Discovered**
```yaml
Inventory Management:
  - Real-time stock tracking
  - End-of-day inventory reconciliation
  - Waste tracking with void reasons

Kitchen Operations:
  - Preparation time tracking
  - Kitchen display system integration
  - Auto-printing to kitchen printers

Customer Experience:
  - Loyalty points system
  - Order history tracking
  - WhatsApp ordering and updates

Analytics & Reporting:
  - Real-time dashboard metrics
  - Hourly/daily/monthly reports
  - Top-selling items analysis
  - Branch performance comparison
```

This deep analysis reveals a **production-scale, enterprise-grade restaurant management ecosystem** handling real transactions for multiple restaurant chains across the Middle East! 🚀