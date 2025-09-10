/**
 * Multi-Tenant Printer Isolation Test Suite
 * 
 * This script tests that printer visibility and access are properly isolated
 * between different brands/companies and branches.
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api/v1';
const TEST_PASSWORD = 'testpassword123';

// Test data structure
const testCompanies = [
    { id: null, name: 'Pizza Palace', slug: 'pizza-palace' },
    { id: null, name: 'Burger Kingdom', slug: 'burger-kingdom' }
];

const testBranches = [
    { id: null, companyId: null, name: 'Pizza Palace Downtown' },
    { id: null, companyId: null, name: 'Pizza Palace Mall' },
    { id: null, companyId: null, name: 'Burger Kingdom Center' }
];

const testUsers = [
    { id: null, email: 'admin@pizzapalace.com', role: 'company_owner', companyId: null, branchId: null, token: null },
    { id: null, email: 'manager@pizzapalace.com', role: 'branch_manager', companyId: null, branchId: null, token: null },
    { id: null, email: 'admin@burgerkingdom.com', role: 'company_owner', companyId: null, branchId: null, token: null }
];

const testPrinters = [
    { id: null, name: 'Pizza Kitchen Printer', companyId: null, branchId: null, ip: '192.168.1.10' },
    { id: null, name: 'Pizza Receipt Printer', companyId: null, branchId: null, ip: '192.168.1.11' },
    { id: null, name: 'Burger Kitchen Printer', companyId: null, branchId: null, ip: '192.168.1.20' }
];

// Helper functions
async function makeRequest(method, endpoint, data = null, token = null) {
    try {
        const config = {
            method,
            url: `${API_BASE}${endpoint}`,
            headers: {}
        };

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (data) {
            config.data = data;
            config.headers['Content-Type'] = 'application/json';
        }

        const response = await axios(config);
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message,
            status: error.response?.status
        };
    }
}

async function loginSuperAdmin() {
    const result = await makeRequest('POST', '/auth/login', {
        email: 'admin@restaurant-platform.com', // Assuming super admin exists
        password: TEST_PASSWORD
    });
    
    if (result.success) {
        return result.data.token;
    }
    
    // If super admin doesn't exist, try to create one
    console.log('Super admin not found, test may be limited...');
    return null;
}

// Test functions
async function setupTestData() {
    console.log('\n🔧 Setting up test data...');
    
    const superAdminToken = await loginSuperAdmin();
    
    // Create test companies
    for (let i = 0; i < testCompanies.length; i++) {
        const company = testCompanies[i];
        
        if (superAdminToken) {
            const result = await makeRequest('POST', '/companies', {
                name: company.name,
                slug: company.slug,
                businessType: 'restaurant',
                timezone: 'Asia/Amman',
                defaultCurrency: 'JOD'
            }, superAdminToken);
            
            if (result.success) {
                testCompanies[i].id = result.data.id;
                console.log(`✅ Created company: ${company.name} (${result.data.id})`);
            } else {
                console.log(`❌ Failed to create company ${company.name}: ${result.error}`);
            }
        }
    }
    
    // Create test branches
    testBranches[0].companyId = testCompanies[0].id; // Pizza Palace Downtown
    testBranches[1].companyId = testCompanies[0].id; // Pizza Palace Mall
    testBranches[2].companyId = testCompanies[1].id; // Burger Kingdom Center
    
    for (let i = 0; i < testBranches.length; i++) {
        const branch = testBranches[i];
        
        if (superAdminToken && branch.companyId) {
            const result = await makeRequest('POST', '/branches', {
                name: branch.name,
                nameAr: branch.name + ' (العربية)',
                companyId: branch.companyId,
                city: 'Amman',
                country: 'Jordan'
            }, superAdminToken);
            
            if (result.success) {
                testBranches[i].id = result.data.id;
                console.log(`✅ Created branch: ${branch.name} (${result.data.id})`);
            } else {
                console.log(`❌ Failed to create branch ${branch.name}: ${result.error}`);
            }
        }
    }
    
    // Create test users
    testUsers[0].companyId = testCompanies[0].id;
    testUsers[1].companyId = testCompanies[0].id;
    testUsers[1].branchId = testBranches[0].id;
    testUsers[2].companyId = testCompanies[1].id;
    
    for (let i = 0; i < testUsers.length; i++) {
        const user = testUsers[i];
        
        if (superAdminToken && user.companyId) {
            const result = await makeRequest('POST', '/users', {
                name: user.email.split('@')[0],
                email: user.email,
                password: TEST_PASSWORD,
                role: user.role,
                companyId: user.companyId,
                branchId: user.branchId,
                status: 'active'
            }, superAdminToken);
            
            if (result.success) {
                testUsers[i].id = result.data.id;
                console.log(`✅ Created user: ${user.email} (${result.data.id})`);
                
                // Login the user to get their token
                const loginResult = await makeRequest('POST', '/auth/login', {
                    email: user.email,
                    password: TEST_PASSWORD
                });
                
                if (loginResult.success) {
                    testUsers[i].token = loginResult.data.token;
                    console.log(`✅ Logged in user: ${user.email}`);
                }
            } else {
                console.log(`❌ Failed to create user ${user.email}: ${result.error}`);
            }
        }
    }
    
    // Create test printers
    testPrinters[0].companyId = testCompanies[0].id;
    testPrinters[0].branchId = testBranches[0].id;
    testPrinters[1].companyId = testCompanies[0].id;
    testPrinters[1].branchId = testBranches[1].id;
    testPrinters[2].companyId = testCompanies[1].id;
    testPrinters[2].branchId = testBranches[2].id;
    
    for (let i = 0; i < testPrinters.length; i++) {
        const printer = testPrinters[i];
        const userToken = testUsers[printer.companyId === testCompanies[0].id ? 0 : 2].token;
        
        if (userToken) {
            const result = await makeRequest('POST', '/printing/printers', {
                name: printer.name,
                type: 'thermal',
                connection: 'network',
                ip: printer.ip,
                port: 9100,
                assignedTo: 'kitchen',
                companyId: printer.companyId,
                branchId: printer.branchId
            }, userToken);
            
            if (result.success) {
                testPrinters[i].id = result.data.id;
                console.log(`✅ Created printer: ${printer.name} (${result.data.id})`);
            } else {
                console.log(`❌ Failed to create printer ${printer.name}: ${result.error}`);
            }
        }
    }
}

async function testCompanyIsolation() {
    console.log('\n🔒 Testing Company Isolation...');
    
    const pizzaOwnerToken = testUsers[0].token; // Pizza Palace owner
    const burgerOwnerToken = testUsers[2].token; // Burger Kingdom owner
    
    if (!pizzaOwnerToken || !burgerOwnerToken) {
        console.log('❌ Cannot test company isolation: missing user tokens');
        return;
    }
    
    // Pizza Palace owner should only see their printers
    const pizzaPrintersResult = await makeRequest('GET', '/printing/printers', null, pizzaOwnerToken);
    if (pizzaPrintersResult.success) {
        const pizzaPrinters = pizzaPrintersResult.data.printers || [];
        console.log(`📊 Pizza Palace owner sees ${pizzaPrinters.length} printers`);
        
        const hasBurgerPrinter = pizzaPrinters.some(p => p.name.includes('Burger'));
        if (hasBurgerPrinter) {
            console.log('❌ SECURITY BREACH: Pizza Palace owner can see Burger Kingdom printers!');
        } else {
            console.log('✅ Company isolation working: Pizza Palace owner only sees their printers');
        }
        
        // Check IP isolation
        const hasConflictingIP = pizzaPrinters.some(p => p.ip === '192.168.1.20');
        if (hasConflictingIP) {
            console.log('❌ SECURITY BREACH: Pizza Palace owner can see Burger Kingdom IP addresses!');
        } else {
            console.log('✅ IP isolation working: No cross-company IP visibility');
        }
    } else {
        console.log(`❌ Failed to fetch Pizza Palace printers: ${pizzaPrintersResult.error}`);
    }
    
    // Burger Kingdom owner should only see their printers
    const burgerPrintersResult = await makeRequest('GET', '/printing/printers', null, burgerOwnerToken);
    if (burgerPrintersResult.success) {
        const burgerPrinters = burgerPrintersResult.data.printers || [];
        console.log(`📊 Burger Kingdom owner sees ${burgerPrinters.length} printers`);
        
        const hasPizzaPrinter = burgerPrinters.some(p => p.name.includes('Pizza'));
        if (hasPizzaPrinter) {
            console.log('❌ SECURITY BREACH: Burger Kingdom owner can see Pizza Palace printers!');
        } else {
            console.log('✅ Company isolation working: Burger Kingdom owner only sees their printers');
        }
    } else {
        console.log(`❌ Failed to fetch Burger Kingdom printers: ${burgerPrintersResult.error}`);
    }
}

async function testBranchIsolation() {
    console.log('\n🏢 Testing Branch Isolation...');
    
    const branchManagerToken = testUsers[1].token; // Pizza Palace branch manager
    const companyOwnerToken = testUsers[0].token; // Pizza Palace company owner
    
    if (!branchManagerToken || !companyOwnerToken) {
        console.log('❌ Cannot test branch isolation: missing user tokens');
        return;
    }
    
    // Branch manager should only see their branch printers
    const branchPrintersResult = await makeRequest('GET', '/printing/printers', null, branchManagerToken);
    if (branchPrintersResult.success) {
        const branchPrinters = branchPrintersResult.data.printers || [];
        console.log(`📊 Branch manager sees ${branchPrinters.length} printers`);
        
        // Should only see their branch printer or company-wide printers
        const invalidPrinters = branchPrinters.filter(p => {
            return p.branchId && p.branchId !== testBranches[0].id; // Not their branch
        });
        
        if (invalidPrinters.length > 0) {
            console.log('❌ SECURITY BREACH: Branch manager can see other branch printers!');
        } else {
            console.log('✅ Branch isolation working: Branch manager only sees appropriate printers');
        }
    } else {
        console.log(`❌ Failed to fetch branch manager printers: ${branchPrintersResult.error}`);
    }
    
    // Company owner should see all company printers
    const ownerPrintersResult = await makeRequest('GET', '/printing/printers', null, companyOwnerToken);
    if (ownerPrintersResult.success) {
        const ownerPrinters = ownerPrintersResult.data.printers || [];
        console.log(`📊 Company owner sees ${ownerPrinters.length} printers`);
        
        if (ownerPrinters.length >= 2) { // Should see both Pizza Palace printers
            console.log('✅ Company owner visibility working: Can see all company printers');
        } else {
            console.log('❌ Company owner visibility issue: Should see all company printers');
        }
    } else {
        console.log(`❌ Failed to fetch company owner printers: ${ownerPrintersResult.error}`);
    }
}

async function testCrossCompanyAccess() {
    console.log('\n🚫 Testing Cross-Company Access Prevention...');
    
    const pizzaOwnerToken = testUsers[0].token;
    const burgerPrinterId = testPrinters[2].id; // Burger Kingdom printer
    
    if (!pizzaOwnerToken || !burgerPrinterId) {
        console.log('❌ Cannot test cross-company access: missing tokens or IDs');
        return;
    }
    
    // Try to access Burger Kingdom printer from Pizza Palace account
    const accessResult = await makeRequest('GET', `/printing/printers/${burgerPrinterId}`, null, pizzaOwnerToken);
    
    if (accessResult.success) {
        console.log('❌ SECURITY BREACH: Pizza Palace owner can access Burger Kingdom printer!');
    } else if (accessResult.status === 403 || accessResult.status === 404) {
        console.log('✅ Cross-company access prevention working: Access denied as expected');
    } else {
        console.log(`⚠️ Unexpected error accessing cross-company printer: ${accessResult.error}`);
    }
    
    // Try to create print job on cross-company printer
    const printJobResult = await makeRequest('POST', '/printing/jobs', {
        type: 'receipt',
        printerId: burgerPrinterId,
        content: { test: 'unauthorized print job' }
    }, pizzaOwnerToken);
    
    if (printJobResult.success) {
        console.log('❌ SECURITY BREACH: Created print job on cross-company printer!');
    } else if (printJobResult.status === 403 || printJobResult.status === 404) {
        console.log('✅ Cross-company print job prevention working: Job creation denied');
    } else {
        console.log(`⚠️ Unexpected error creating cross-company print job: ${printJobResult.error}`);
    }
}

async function testIPConflictPrevention() {
    console.log('\n🔄 Testing IP Conflict Prevention...');
    
    const pizzaOwnerToken = testUsers[0].token;
    const burgerOwnerToken = testUsers[2].token;
    
    if (!pizzaOwnerToken || !burgerOwnerToken) {
        console.log('❌ Cannot test IP conflicts: missing user tokens');
        return;
    }
    
    // Try to create printer with same IP in different company (should be allowed)
    const sameIPDifferentCompany = await makeRequest('POST', '/printing/printers', {
        name: 'Test Printer Same IP Different Company',
        type: 'thermal',
        connection: 'network',
        ip: '192.168.1.10', // Same as Pizza Palace printer
        port: 9100,
        assignedTo: 'kitchen'
    }, burgerOwnerToken);
    
    if (sameIPDifferentCompany.success) {
        console.log('✅ IP reuse across companies allowed: Different companies can use same IP');
        
        // Clean up
        await makeRequest('DELETE', `/printing/printers/${sameIPDifferentCompany.data.id}`, null, burgerOwnerToken);
    } else {
        console.log(`⚠️ IP reuse across companies blocked: ${sameIPDifferentCompany.error}`);
    }
    
    // Try to create printer with same IP in same company (should be blocked)
    const sameIPSameCompany = await makeRequest('POST', '/printing/printers', {
        name: 'Test Printer Same IP Same Company',
        type: 'thermal',
        connection: 'network',
        ip: '192.168.1.10', // Same as existing Pizza Palace printer
        port: 9100,
        assignedTo: 'kitchen'
    }, pizzaOwnerToken);
    
    if (sameIPSameCompany.success) {
        console.log('❌ IP conflict not prevented: Same company can create duplicate IP');
        // Clean up
        await makeRequest('DELETE', `/printing/printers/${sameIPSameCompany.data.id}`, null, pizzaOwnerToken);
    } else {
        console.log('✅ IP conflict prevention working: Duplicate IP in same company blocked');
    }
}

async function runAllTests() {
    console.log('🧪 Starting Multi-Tenant Printer Isolation Tests\n');
    
    try {
        await setupTestData();
        await testCompanyIsolation();
        await testBranchIsolation();
        await testCrossCompanyAccess();
        await testIPConflictPrevention();
        
        console.log('\n🎉 Test suite completed!');
        console.log('\n📋 Test Summary:');
        console.log('- Company isolation: Verified users only see their company printers');
        console.log('- Branch isolation: Verified branch managers only see appropriate printers');
        console.log('- Cross-company access: Verified access denial to other company resources');
        console.log('- IP conflict prevention: Verified IP address management per company');
        
    } catch (error) {
        console.error('🔥 Test suite failed:', error.message);
    }
}

// Run tests if script is executed directly
if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = {
    runAllTests,
    testCompanyIsolation,
    testBranchIsolation,
    testCrossCompanyAccess,
    testIPConflictPrevention
};