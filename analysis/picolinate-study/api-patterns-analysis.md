# Picolinate API Patterns - Extracted Intelligence

## 🎯 **API Endpoint Patterns Analysis**

### **Customer Management API Pattern**
```
Base: /api/Customers/

Core Operations:
├── Create                                    # POST /Create
├── Update                                    # PUT /Update  
├── UpdateName                               # PUT /UpdateName
├── Block                                    # POST /Block
├── Delete ──┬── DeleteCustomerAccount      # DELETE /DeleteCustomerAccount
│            └── DeleteAddress              # DELETE /DeleteAddress
│
├── Retrieve ─┬── GetCustomers              # GET /GetCustomers
│             ├── GetByPhone                # GET /GetByPhone
│             ├── GetByName                 # GET /GetByName
│             ├── GetCustomersBycompany     # GET /GetCustomersBycompany
│             ├── GetLastOrder              # GET /GetLastOrder
│             └── GetAllBlockedCustomer     # GET /GetAllBlockedCustomer
│
└── Address ──┬── CreateAddress             # POST /CreateAddress
              ├── UpdateCustomerAddress    # PUT /UpdateCustomerAddress
              ├── GetCustomersAddressByCoords # GET /GetCustomersAddressByCoords
              └── GetCustomerAddressByAddressID # GET /GetCustomerAddressByAddressID
```

### **Order Management API Pattern**
```
Base: /api/Order/

Order Lifecycle:
├── CreateOrder                     # POST /CreateOrder
├── UpdateOrderStatus              # PUT /order/updatestateorder
├── MarkOrderAsPrepared           # POST /AcceptOrder
├── MarkFoodAsReady               # POST /order/MarkCareemFoodAsReady
└── CancelOrder                   # DELETE /cancelOrder/orderId/

Integration Points:
├── Delivery Partners ─┬── CreateOrder/{partner}/branch/
│                      ├── CheckOrderStatus/{partner}/orderId/
│                      └── CancelOrder/{partner}/orderId/
│
├── POS Integration ───┬── SendOrder          # POST /MenuSync/SendOrder
│                      ├── SyncMenu           # POST /MenuSync/SyncMenu
│                      └── HandleOrder        # POST /HandleOrder
│
└── Printing ─────────┬── AutoPrint          # POST /Printer/AutoPrint
                      └── ManualPrint        # POST /Printer/ManualPrint
```

### **Menu Management API Pattern**
```
Base: /api/Menu/

Menu Operations:
├── SyncMenu                           # POST /Menu/SyncMenu
├── CreateRestaurntMenu               # POST /Menu/CreateRestaurntMenu
├── SyncChannelMenuFullView/{id}      # GET /Menu/SyncChannelMenuFullView/{id}
├── UpdateMenuStatus                  # PUT /ManageIntegration/UpdateMappingStatus
└── GetMenuStatusbyCompanyId          # GET /ManageIntegration/GetMenuStatusbyCompanyId

POS Integration:
├── FoodicsInstall                    # POST /MenuSync/FoodicsInstall
├── TabSenceInstall                   # POST /MenuSync/TabSenceInstall
├── GetPosFailedSyncProducts         # GET /MenuSync/GetPosFailedSyncProducts
└── GetPosMenuLogs                   # GET /MenuSync/GetPosMenuLogs
```

### **Analytics & Reporting API Pattern**
```
Base: /api/analytics/

Dashboard Reports:
├── dashboardReport/{companyId}           # GET
├── ordersPerHour/{companyId}            # GET
├── orderDeliveryTypesCount/{companyId}   # GET
├── branchPerSourceOrdersCount/{companyId} # GET
├── ordersTimeLine/{companyId}           # GET
└── topSelling/{companyId}               # GET

Integration Logs:
├── GetTalabatMenuRequestLogByCompanyId         # GET
├── GetRestaurantIntegrationrRequestByCompanyId # GET
└── GetPosFailedOrders                          # GET
```

## 🏗️ **Architecture Patterns Discovered**

### **1. Service-to-Service Communication Pattern**
```json
"CustomerService": {
  "baseUrl": "https://customers.domain.com/api/Customers/",
  "endpoints": {
    "Create": "Create",
    "GetByPhone": "GetByPhone",
    "AddPoint": "AddPoint"
  }
}
```

**Key Insight**: Each microservice exposes its base URL + endpoint mapping in configuration.

### **2. Multi-Tenant Architecture Pattern**
```
Every API endpoint follows: /api/{resource}/{companyId}/{action}

Examples:
- /api/Customers/GetCustomersBycompany/{companyId}
- /analytics/dashboardReport/{companyId}  
- /branch/GetBranchStatusbyCompanyId/{companyId}
```

### **3. Integration Wrapper Pattern**
```json
"TalabatService": {
  "CreateOrder": "CreateOrder",
  "GetFees": "GetEstimatedFees",
  "CheckOrderStatus": "checkOrderStatus/orderId/"
},
"CareemExpressDelivery": {
  "createOrder": "createOrder/branch/",
  "checkOrderEstimations": "checkOrderEstimations/branch/"
}
```

**Pattern**: Unified interface for multiple delivery partners with consistent method naming.

### **4. Authentication & Security Pattern**
```json
"JwtSettings": {
  "AccessTokenExpirationMinutes": 43200,    // 30 days
  "RefreshTokenExpirationMinutes": 1438300, // ~2 years
  "Issuer": "domain",
  "Audience": "domain"
}
```

**Pattern**: Long-lived tokens for mobile/restaurant applications with refresh capability.

### **5. Error Handling & Resilience Pattern**
```json
"Config": {
  "DisplayFullErrorStack": false,           // Production safety
  "SQLCommandTimeout": 30,                  // DB timeout
  "IgnoreRedisTimeoutException": true       // Cache resilience
}
```

### **6. External Integration Pattern**
```
Delivery Partners (7+):
- Talabat, Careem, Nashmi, Dhub
- TopDelivery, JoodDelivery, Tawasi

Each follows same pattern:
├── checkOrderEstimations/branch/{branchId}
├── createOrder/branch/{branchId}  
└── checkOrderStatus/orderId/{orderId}
```

## 💡 **Business Logic Patterns**

### **1. Order Processing Workflow**
```
Order Creation → POS Sync → Delivery Assignment → Status Tracking → Completion
     ↓              ↓            ↓                ↓              ↓
  Validation    Print Receipt  Route to Partner  Real-time     Analytics
  Customer      Auto/Manual    Best Price/Time   Updates       Reporting
  Loyalty       Kitchen        Partner Selection  Customer      Revenue
  Points        Display        Fee Calculation    Notification  Tracking
```

### **2. Customer Loyalty System**
```
Customer Actions → Points Calculation → Loyalty Status → Rewards
     ↓                    ↓                  ↓           ↓
- Order Placed      - Order Value %      - Status      - Discounts
- Account Created   - Bonus Points       - Categories   - Free Items  
- Referrals        - Special Events     - Tiers       - Cashback
```

### **3. Multi-Channel Management**
```
Order Sources:
├── Mobile App (Native)
├── Website (Web)  
├── Phone Orders (Call Center)
├── WhatsApp Bot
├── Third-party Aggregators
│   ├── Talabat
│   ├── Careem
│   └── Others
└── Walk-in (POS)

All routes through unified Order API
```

## 🔧 **Technical Implementation Patterns**

### **1. Configuration Management**
```
Environment-based configs:
├── appsettings.json (Base)
├── appsettings.Development.json
├── appsettings.Uat.json  
└── appsettings.Hetzner.json (Production)

Pattern: Environment-specific service URLs and credentials
```

### **2. Data Access Pattern**
```
Layered Architecture:
├── API Layer (Controllers)
├── Domain Layer (Business Logic)
├── Infrastructure Layer (External Services)
├── DAL Layer (Data Access)
└── DapperLayer (High-performance queries)

Tools: EntityFramework + Dapper hybrid approach
```

### **3. Caching Strategy**
```json
"Redis": {
  "Enabled": true,
  "ConnectionString": "127.0.0.1:6379",
  "DatabaseId": -1,
  "UseForCaching": true,
  "UseToStoreDataProtectionKeys": true
}
```

### **4. Communication Patterns**
```
Internal: HTTP REST APIs between microservices
External: 
├── SMS (Infobip)
├── WhatsApp (Business API)
├── Email (SendGrid)
├── Push Notifications
└── WebSocket (Real-time updates)
```

## 🎯 **Key API Design Principles**

### **1. Consistent Resource Naming**
- Use plural nouns: `/Customers/`, `/Orders/`, `/Branches/`
- Action-based endpoints: `/Create`, `/Update`, `/Delete`
- Query parameters for filters: `/GetCustomersBycompany`

### **2. Hierarchical Organization**  
- Company → Branch → Resource pattern
- Tenant isolation at every level
- Clear ownership and access control

### **3. Integration-First Design**
- External service abstraction
- Configuration-driven endpoints
- Retry and fallback mechanisms
- Consistent error responses

### **4. Performance Optimization**
- Caching at multiple levels
- Async processing for heavy operations
- Connection pooling for databases
- CDN for static assets

### **5. Security by Design**
- JWT tokens with proper expiration
- API key authentication for services
- Encryption for sensitive data
- Role-based access control

This analysis provides the blueprint for building our restaurant platform backend with industry-proven patterns and enterprise-grade architecture. 🚀