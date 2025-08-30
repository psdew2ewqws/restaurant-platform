# 🍽️ Restaurant Platform API Documentation

## Overview
This document provides comprehensive API documentation for the Restaurant Platform backend service built with NestJS.

**Base URL**: `http://localhost:3001` (Development)  
**Authentication**: JWT Bearer Token  
**Content-Type**: `application/json`

---

## 🔐 Authentication

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "role": "super_admin",
    "companyId": "uuid",
    "status": "active"
  }
}
```

### Using Authentication
Include the JWT token in the Authorization header:
```http
Authorization: Bearer your_jwt_token_here
```

---

## 👥 User Management

### Get All Users
```http
GET /users
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `role` (optional): Filter by role
- `status` (optional): Filter by status

**Response:**
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "role": "company_owner",
      "status": "active",
      "companyId": "uuid",
      "createdAt": "2025-08-30T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCount": 50,
    "totalPages": 5
  }
}
```

### Create User
```http
POST /users
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "securepassword",
  "role": "branch_manager",
  "status": "active",
  "companyId": "uuid"
}
```

**Roles:**
- `super_admin`: Full system access
- `company_owner`: Manage company and branches
- `branch_manager`: Manage assigned branches
- `call_center`: View products, take orders
- `cashier`: View products only

### Update User
```http
PUT /users/{id}
Authorization: Bearer {token}

{
  "email": "updated@example.com",
  "role": "branch_manager",
  "status": "active"
}
```

### Delete User
```http
DELETE /users/{id}
Authorization: Bearer {token}
```

---

## 🏢 Company Management

### Get All Companies
```http
GET /companies
Authorization: Bearer {token}
```

### Create Company
```http
POST /companies
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Pizza Palace",
  "slug": "pizza-palace",
  "businessType": "Restaurant",
  "timezone": "Asia/Amman",
  "currency": "JOD"
}
```

### Update Company
```http
PUT /companies/{id}
Authorization: Bearer {token}

{
  "name": "Updated Pizza Palace",
  "status": "active"
}
```

### Delete Company
```http
DELETE /companies/{id}
Authorization: Bearer {token}
```

---

## 🏪 Branch Management

### Get All Branches
```http
GET /branches
Authorization: Bearer {token}
```

### Create Branch
```http
POST /branches
Authorization: Bearer {token}

{
  "name": "Downtown Branch",
  "address": "123 Main St",
  "phone": "+962-6-1234567",
  "isActive": true
}
```

### Update Branch
```http
PUT /branches/{id}
Authorization: Bearer {token}

{
  "name": "Updated Branch Name",
  "isActive": false
}
```

---

## 🍽️ Menu Management

### Get Paginated Products
```http
POST /menu/products/paginated
Authorization: Bearer {token}
Content-Type: application/json

{
  "page": 1,
  "limit": 50,
  "search": "pizza",
  "categoryId": "uuid",
  "status": 1,
  "sortBy": "priority",
  "sortOrder": "asc",
  "tags": ["vegetarian", "spicy"]
}
```

**Response:**
```json
{
  "products": [
    {
      "id": "uuid",
      "name": {
        "en": "Margherita Pizza",
        "ar": "بيتزا مارجريتا"
      },
      "description": {
        "en": "Classic pizza with tomato and mozzarella",
        "ar": "بيتزا كلاسيكية بالطماطم والموزاريلا"
      },
      "basePrice": 15.99,
      "cost": 8.50,
      "status": 1,
      "priority": 1,
      "preparationTime": 15,
      "tags": ["vegetarian", "classic"],
      "image": "/images/margherita.webp",
      "images": ["/images/margherita.webp"],
      "pricing": {
        "talabat": 17.99,
        "careem": 16.99,
        "website": 15.99,
        "call_center": 14.99
      },
      "category": {
        "id": "uuid",
        "name": {
          "en": "Pizzas",
          "ar": "البيتزا"
        }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "totalCount": 150,
    "totalPages": 3,
    "hasMore": true
  }
}
```

### Create Product
```http
POST /menu/products
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": {
    "en": "Pepperoni Pizza",
    "ar": "بيتزا البيبيروني"
  },
  "description": {
    "en": "Delicious pepperoni pizza",
    "ar": "بيتزا لذيذة بالبيبيروني"
  },
  "basePrice": 18.99,
  "cost": 10.50,
  "categoryId": "uuid",
  "status": 1,
  "priority": 2,
  "tags": ["meat", "popular"],
  "preparationTime": 18,
  "pricing": {
    "talabat": 20.99,
    "careem": 19.99,
    "website": 18.99,
    "call_center": 17.99
  },
  "calculatePreparationTime": true
}
```

### Update Product
```http
PUT /menu/products/{id}
Authorization: Bearer {token}

{
  "name": {
    "en": "Updated Pizza Name"
  },
  "basePrice": 19.99,
  "status": 1
}
```

### Delete Product
```http
DELETE /menu/products/{id}
Authorization: Bearer {token}
```

### Bulk Operations

#### Bulk Status Update
```http
POST /menu/products/bulk-status
Authorization: Bearer {token}

{
  "productIds": ["uuid1", "uuid2", "uuid3"],
  "status": 1
}
```

#### Bulk Delete
```http
POST /menu/products/bulk-delete
Authorization: Bearer {token}

{
  "productIds": ["uuid1", "uuid2", "uuid3"]
}
```

---

## 📂 Category Management

### Get Categories
```http
GET /menu/categories
Authorization: Bearer {token}
```

**Response:**
```json
{
  "categories": [
    {
      "id": "uuid",
      "name": {
        "en": "Pizzas",
        "ar": "البيتزا"
      },
      "description": {
        "en": "Delicious pizzas",
        "ar": "بيتزا لذيذة"
      },
      "displayNumber": 1,
      "isActive": true,
      "image": "/images/pizza-category.webp"
    }
  ]
}
```

### Create Category
```http
POST /menu/categories
Authorization: Bearer {token}

{
  "name": {
    "en": "Burgers",
    "ar": "البرغر"
  },
  "description": {
    "en": "Juicy burgers",
    "ar": "برغر شهي"
  },
  "image": "/images/burger-category.webp"
}
```

### Update Category
```http
PUT /menu/categories/{id}
Authorization: Bearer {token}

{
  "name": {
    "en": "Updated Category"
  },
  "isActive": false
}
```

### Delete Category
```http
DELETE /menu/categories/{id}
Authorization: Bearer {token}
```

---

## 🏷️ Tags

### Get Available Tags
```http
GET /menu/tags
Authorization: Bearer {token}
```

**Response:**
```json
{
  "tags": ["vegetarian", "spicy", "popular", "new", "halal", "vegan"]
}
```

---

## 📊 Statistics

### Get Product Statistics
```http
GET /menu/stats
Authorization: Bearer {token}
```

**Response:**
```json
{
  "totalProducts": 150,
  "activeProducts": 130,
  "inactiveProducts": 20,
  "avgPrice": 16.75,
  "categoryCount": 8
}
```

---

## 📸 Image Management

### Upload Product Images
```http
POST /menu/products/upload-images
Authorization: Bearer {token}
Content-Type: multipart/form-data

Form Data:
- images: [file1, file2, file3] (max 10 files)
- productId: "uuid" (optional)
```

**Response:**
```json
{
  "uploadedImages": [
    {
      "id": "uuid",
      "filename": "pizza-1.webp",
      "originalName": "margherita-pizza.jpg",
      "size": 1048576,
      "width": 1280,
      "height": 720,
      "url": "/uploads/images/pizza-1.webp"
    }
  ]
}
```

### Get Product Images
```http
GET /menu/products/{id}/images
Authorization: Bearer {token}
```

### Delete Image
```http
DELETE /menu/images/{id}
Authorization: Bearer {token}
```

---

## 📋 License Management

### Get License Status
```http
GET /licenses/status
Authorization: Bearer {token}
```

### Update License
```http
PUT /licenses/{id}
Authorization: Bearer {token}

{
  "maxProducts": 1000,
  "maxBranches": 5,
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

---

## 🚨 Error Responses

### Standard Error Format
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "Email must be valid"
    }
  ]
}
```

### Common HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation error)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **409**: Conflict (duplicate data)
- **500**: Internal Server Error

---

## 🔒 Role-Based Permissions

### Super Admin
- Full access to all endpoints
- Can manage all companies and users
- Can create other super admins

### Company Owner
- Access to own company data only
- Can manage company branches and users
- Cannot create super admins

### Branch Manager
- Access to assigned branches only
- Can manage branch products and staff
- Cannot manage company settings

### Call Center
- Read-only access to products
- Can view customer data
- Cannot modify menu items

### Cashier
- Read-only access to products
- Cannot access admin features
- Cannot view sensitive data

---

## 🔧 Configuration

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/dbname

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Server
PORT=3001
NODE_ENV=development

# File Upload
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_IMAGE_TYPES=jpg,jpeg,png,webp
```

---

## 📚 Additional Resources

- **Swagger Documentation**: Available at `/api/docs` (when enabled)
- **Database Schema**: See `/database/restaurant_platform_current_schema.sql`
- **Postman Collection**: Import API endpoints for testing
- **Rate Limiting**: 100 requests per minute per IP

---

**Last Updated**: August 30, 2025  
**API Version**: 1.0  
**Backend Version**: NestJS 10+