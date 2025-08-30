# 📡 API Endpoints Quick Reference

## 🔗 Complete Endpoint List

### Authentication Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/login` | User login | ❌ |
| POST | `/auth/refresh` | Refresh JWT token | ✅ |
| POST | `/auth/logout` | User logout | ✅ |

### User Management Endpoints
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/users` | Get all users | super_admin, company_owner |
| POST | `/users` | Create new user | super_admin, company_owner |
| GET | `/users/:id` | Get user by ID | super_admin, company_owner, self |
| PUT | `/users/:id` | Update user | super_admin, company_owner, self |
| DELETE | `/users/:id` | Delete user | super_admin, company_owner |
| GET | `/users/profile` | Get current user profile | All authenticated |

### Company Management Endpoints
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/companies` | Get all companies | super_admin |
| POST | `/companies` | Create company | super_admin |
| GET | `/companies/:id` | Get company by ID | super_admin, company_owner (own) |
| PUT | `/companies/:id` | Update company | super_admin, company_owner (own) |
| DELETE | `/companies/:id` | Delete company | super_admin |
| GET | `/companies/stats` | Get company statistics | super_admin |

### Branch Management Endpoints
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/branches` | Get all branches | super_admin, company_owner, branch_manager |
| POST | `/branches` | Create branch | super_admin, company_owner |
| GET | `/branches/:id` | Get branch by ID | super_admin, company_owner, branch_manager |
| PUT | `/branches/:id` | Update branch | super_admin, company_owner, branch_manager |
| DELETE | `/branches/:id` | Delete branch | super_admin, company_owner |

### Menu Management Endpoints
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/menu/products/paginated` | Get paginated products | All authenticated |
| POST | `/menu/products` | Create product | super_admin, company_owner, branch_manager |
| GET | `/menu/products/:id` | Get product by ID | All authenticated |
| PUT | `/menu/products/:id` | Update product | super_admin, company_owner, branch_manager |
| DELETE | `/menu/products/:id` | Delete product | super_admin, company_owner |
| POST | `/menu/products/bulk-status` | Bulk update status | super_admin, company_owner, branch_manager |
| POST | `/menu/products/bulk-delete` | Bulk delete products | super_admin, company_owner |

### Category Management Endpoints
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/menu/categories` | Get all categories | All authenticated |
| POST | `/menu/categories` | Create category | super_admin, company_owner, branch_manager |
| PUT | `/menu/categories/:id` | Update category | super_admin, company_owner, branch_manager |
| DELETE | `/menu/categories/:id` | Delete category | super_admin, company_owner |

### Image Management Endpoints
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/menu/products/upload-images` | Upload product images | super_admin, company_owner, branch_manager |
| GET | `/menu/products/:id/images` | Get product images | All authenticated |
| DELETE | `/menu/images/:id` | Delete image | super_admin, company_owner, branch_manager |
| GET | `/menu/upload-config` | Get upload configuration | super_admin, company_owner, branch_manager, call_center |

### Utility Endpoints
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/menu/tags` | Get available tags | All authenticated |
| GET | `/menu/stats` | Get product statistics | super_admin, company_owner, branch_manager |

### License Management Endpoints
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/licenses/status` | Get license status | All authenticated |
| PUT | `/licenses/:id` | Update license | super_admin |

---

## 🎯 Request/Response Examples

### Create Product with Full Features
```http
POST /menu/products
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": {
    "en": "Supreme Pizza",
    "ar": "بيتزا سوبريم"
  },
  "description": {
    "en": "Pizza with all toppings including pepperoni, mushrooms, bell peppers, and olives",
    "ar": "بيتزا مع جميع الإضافات تشمل البيبيروني والفطر والفلفل الحلو والزيتون"
  },
  "basePrice": 24.99,
  "cost": 12.50,
  "categoryId": "550e8400-e29b-41d4-a716-446655440000",
  "status": 1,
  "priority": 1,
  "tags": ["popular", "meat", "vegetables"],
  "preparationTime": 20,
  "pricing": {
    "talabat": 27.99,
    "careem": 26.99,
    "website": 24.99,
    "call_center": 23.99,
    "custom_channel": 25.99
  },
  "images": [
    "/uploads/images/supreme-pizza-main.webp",
    "/uploads/images/supreme-pizza-close.webp"
  ],
  "calculatePreparationTime": false
}
```

### Advanced Product Search
```http
POST /menu/products/paginated
Authorization: Bearer {token}
Content-Type: application/json

{
  "page": 1,
  "limit": 20,
  "search": "pizza",
  "categoryId": "550e8400-e29b-41d4-a716-446655440000",
  "status": 1,
  "sortBy": "priority",
  "sortOrder": "asc",
  "tags": ["popular", "vegetarian"],
  "companyId": "550e8400-e29b-41d4-a716-446655440001"
}
```

### Create Category with Multi-language Support
```http
POST /menu/categories
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": {
    "en": "Appetizers",
    "ar": "المقبلات",
    "fr": "Entrées"
  },
  "description": {
    "en": "Delicious appetizers to start your meal",
    "ar": "مقبلات لذيذة لبداية وجبتك",
    "fr": "Délicieuses entrées pour commencer votre repas"
  },
  "image": "/uploads/categories/appetizers.webp",
  "displayNumber": 5
}
```

---

## 🔄 Status Codes & Values

### Product Status
- `0`: Inactive/Hidden
- `1`: Active/Visible

### User Status
- `active`: User can login and access system
- `inactive`: User account suspended
- `pending`: User account pending approval

### Company Status
- `active`: Company operational
- `trial`: Company in trial period  
- `suspended`: Company access suspended
- `expired`: Company license expired

---

## 🚀 Performance Considerations

### Pagination
- Default limit: 50 items
- Maximum limit: 100 items
- Use `hasMore` field to determine if more pages exist

### Search Optimization
- Search is case-insensitive
- Supports partial matching
- Searches in multiple languages (en, ar)
- Indexed on name and tags fields

### Image Handling
- Auto-resized to 1280x720
- Converted to WebP format
- Compressed to ~1MB target size
- Multiple images supported per product

### Caching Recommendations
- Cache category lists (low change frequency)
- Cache product stats (update every 5 minutes)
- Cache user permissions (session-based)

---

## 🧪 Testing Examples

### Using cURL

#### Login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

#### Get Products
```bash
curl -X POST http://localhost:3001/menu/products/paginated \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"page":1,"limit":10}'
```

#### Upload Image
```bash
curl -X POST http://localhost:3001/menu/products/upload-images \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images=@pizza.jpg" \
  -F "productId=550e8400-e29b-41d4-a716-446655440000"
```

### Using JavaScript/Fetch

```javascript
// Login
const login = async () => {
  const response = await fetch('http://localhost:3001/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@example.com',
      password: 'password123'
    })
  });
  const data = await response.json();
  return data.access_token;
};

// Get Products
const getProducts = async (token) => {
  const response = await fetch('http://localhost:3001/menu/products/paginated', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      page: 1,
      limit: 20,
      search: 'pizza'
    })
  });
  return response.json();
};
```

---

## 🔒 Security Headers

All API responses include security headers:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

## 📊 Rate Limiting

- **Rate Limit**: 100 requests per minute per IP
- **Burst Limit**: 10 requests per second
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

**API Version**: 1.0  
**Last Updated**: August 30, 2025