# Remote Database Schema Analysis

## Database Connection
- **Host:** 65.21.157.87:5432
- **Database:** CompanyDB
- **User:** postgres
- **Password:** pBZEuh5enQvW45W8Lrn6SHk3Z27B2uwkJE2L2J5BWme8Xtw3h

## Key Tables for Add-ons/Modifiers System

### 1. Product Table
The main product table with multi-language support and platform pricing:

```sql
product:
- id (uuid, primary key)
- categoryid (uuid, foreign key to category)
- name (jsonb) -- Multi-language names
- description (jsonb) -- Multi-language descriptions
- shortdescription (jsonb) -- Multi-language short descriptions
- fulldescription (jsonb) -- Multi-language full descriptions
- price (jsonb) -- Platform-specific pricing: {"careem": 0, "mobile": 0, "online": 0, "default": 0, "talabat": 0, "callcenter": 0, "priceTaxPercentage": 0}
- isavailable (boolean)
- ispublished (boolean)
- isdeleted (boolean)
- displaynumber (integer) -- Priority/ordering
- producttags (jsonb)
- hour, min (integer) -- Preparation time
- branchprice (jsonb) -- Branch-specific pricing
- aliasname (jsonb) -- Alternative names
- aliasdescription (jsonb) -- Alternative descriptions
- external_pos_id (citext) -- POS integration
```

### 2. ProductAttribute Table
The existing modifier/add-on system:

```sql
productattribute:
- id (uuid, primary key)
- productid (uuid, foreign key to product)
- name (jsonb) -- Multi-language modifier names
- description (jsonb) -- Multi-language descriptions
- isrequired (boolean) -- Required selection
- isalergy (boolean) -- Allergy indicator
- isavailable (boolean) -- Availability
- controltype (citext) -- 'checkbox', 'updown', 'radiobutton'
- noofselection (integer) -- Number of selections allowed
- priority (integer) -- Display order
- ispreselected (boolean) -- Default selection
- price (jsonb) -- Platform-specific pricing
- minimumcount (integer) -- Minimum selections (default 0)
- maximumcount (integer) -- Maximum selections (default 1)
- companyid (uuid) -- Multi-tenant isolation
- external_pos_id (citext) -- POS integration
```

### 3. Attribute Table
Simple attribute reference:

```sql
attribute:
- id (uuid, primary key)  
- name (text) -- Simple attribute name
```

## Current Architecture Analysis

### Strengths:
1. **Multi-language Support:** Uses JSONB for all text fields (name, description)
2. **Platform Pricing:** JSONB pricing supports multiple channels (Talabat, Careem, CallCenter, etc.)
3. **Control Types:** Supports checkbox, radiobutton, updown (counter) controls
4. **Multi-tenant:** Company isolation built-in
5. **Priority System:** Display ordering supported
6. **Flexible Constraints:** Min/max selection counts
7. **POS Integration:** External ID mapping

### Current Structure:
- **Single-Level:** Only product → productattribute relationship
- **No Grouping:** Attributes are not grouped into categories
- **Direct Assignment:** Each attribute directly assigned to products

## Recommended Add-ons Architecture

Based on Picolinate analysis and current schema, here's the recommended approach:

### Option 1: Extend Current Schema
Add grouping to existing productattribute table:

```sql
-- Add to productattribute table:
ALTER TABLE productattribute ADD COLUMN category_name jsonb; -- {"en": "Size", "ar": "الحجم"}
ALTER TABLE productattribute ADD COLUMN category_id uuid;
ALTER TABLE productattribute ADD COLUMN selection_type citext; -- 'single', 'multiple', 'counter'
ALTER TABLE productattribute ADD COLUMN platform_availability jsonb; -- {"talabat": true, "careem": false, ...}
```

### Option 2: New Tables (Recommended)
Create dedicated modifier system:

```sql
-- Modifier Categories (Size, Toppings, etc.)
CREATE TABLE modifier_categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name jsonb NOT NULL, -- {"en": "Size", "ar": "الحجم"}
  description jsonb,
  selection_type citext CHECK (selection_type IN ('single', 'multiple', 'counter')),
  is_required boolean DEFAULT false,
  min_selections integer DEFAULT 0,
  max_selections integer DEFAULT 1,
  priority integer DEFAULT 1,
  platform_availability jsonb DEFAULT '{"talabat": true, "careem": true, "callcenter": true, "website": true}',
  is_active boolean DEFAULT true,
  company_id uuid,
  created_at timestamp DEFAULT (now() AT TIME ZONE 'Asia/Amman'),
  updated_at timestamp
);

-- Modifier Items (Large, Medium, Extra Cheese, etc.)
CREATE TABLE modifiers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id uuid REFERENCES modifier_categories(id),
  name jsonb NOT NULL, -- {"en": "Large", "ar": "كبير"}
  description jsonb,
  price jsonb DEFAULT '{"default": 0, "talabat": 0, "careem": 0, "callcenter": 0, "website": 0}',
  platform_availability jsonb DEFAULT '{"talabat": true, "careem": true, "callcenter": true, "website": true}',
  priority integer DEFAULT 1,
  is_active boolean DEFAULT true,
  external_pos_id citext,
  created_at timestamp DEFAULT (now() AT TIME ZONE 'Asia/Amman'),
  updated_at timestamp
);

-- Product to Category Mapping
CREATE TABLE product_modifier_categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES product(id),
  category_id uuid REFERENCES modifier_categories(id),
  is_required boolean DEFAULT false,
  min_selections integer DEFAULT 0,
  max_selections integer DEFAULT 1,
  priority integer DEFAULT 1,
  created_at timestamp DEFAULT (now() AT TIME ZONE 'Asia/Amman')
);
```

## Implementation Plan

### Phase 1: Backend Schema & APIs
1. Create new modifier tables
2. Implement CRUD APIs for modifier categories
3. Implement CRUD APIs for modifiers
4. Add product-category mapping endpoints

### Phase 2: Frontend Integration
1. Complete AddOnManagement component
2. Integrate with backend APIs  
3. Add product assignment interface
4. Test complete flow

### Phase 3: Order System Integration
1. Update order system to handle modifiers
2. Platform-specific modifier filtering
3. POS integration for modifiers

## Platform Availability Logic
Each modifier category and item should have platform availability:

```json
{
  "talabat": true,
  "careem": true,
  "callcenter": true,
  "website": true,
  "pos": true
}
```

This allows fine-grained control over which platforms see which add-ons.

## Multi-Language Pattern
All text fields follow the JSONB pattern:

```json
{
  "en": "Large Size",
  "ar": "الحجم الكبير"
}
```

This matches the existing product table pattern and ensures consistency.