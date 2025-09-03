// Comprehensive authentication test for delivery settings page
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Test both with and without authentication
async function testEndpointAuth(endpoint, method = 'GET', requiresAuth = true, body = null) {
  console.log(`\n🧪 Testing: ${method} ${endpoint}`);
  console.log(`Expected auth requirement: ${requiresAuth ? 'YES' : 'NO'}`);
  
  const results = {
    withoutToken: { status: null, success: false, error: null },
    withFakeToken: { status: null, success: false, error: null }
  };
  
  // Test without token
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : null
    });
    results.withoutToken.status = response.status;
    results.withoutToken.success = response.ok;
    if (!response.ok) {
      const errorText = await response.text();
      results.withoutToken.error = errorText;
    }
  } catch (error) {
    results.withoutToken.error = error.message;
  }
  
  // Test with fake token
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake-token-for-testing'
      },
      body: body ? JSON.stringify(body) : null
    });
    results.withFakeToken.status = response.status;
    results.withFakeToken.success = response.ok;
    if (!response.ok) {
      const errorText = await response.text();
      results.withFakeToken.error = errorText;
    }
  } catch (error) {
    results.withFakeToken.error = error.message;
  }
  
  // Analyze results
  console.log(`Without token: ${results.withoutToken.status} ${results.withoutToken.success ? '✅' : '❌'}`);
  console.log(`With fake token: ${results.withFakeToken.status} ${results.withFakeToken.success ? '✅' : '❌'}`);
  
  // Check if behavior matches expectation
  if (requiresAuth) {
    if (results.withoutToken.status === 401 && results.withFakeToken.status === 401) {
      console.log('✅ CORRECT: Endpoint properly requires valid authentication');
    } else {
      console.log('❌ ISSUE: Endpoint should require authentication but doesn\'t');
    }
  } else {
    if (results.withoutToken.success) {
      console.log('✅ CORRECT: Public endpoint works without authentication');
    } else {
      console.log('❌ ISSUE: Public endpoint should work without authentication');
    }
  }
  
  return results;
}

async function runDeliveryAuthTests() {
  console.log('🔐 DELIVERY SETTINGS PAGE - AUTHENTICATION AUDIT');
  console.log('='.repeat(50));
  
  const endpoints = [
    // GET endpoints used on the delivery settings page
    { endpoint: '/delivery/jordan-locations?limit=10', method: 'GET', requiresAuth: false, description: 'Jordan Locations (LocationsGrid)' },
    { endpoint: '/delivery/providers', method: 'GET', requiresAuth: false, description: 'Delivery Providers (MultiTenantDeliveryProviders)' },
    { endpoint: '/branches', method: 'GET', requiresAuth: false, description: 'Branches (BranchProviderMappingModal)' },
    { endpoint: '/companies', method: 'GET', requiresAuth: false, description: 'Companies (CompanyProviderConfigModal)' },
    
    // GET endpoints that require auth
    { endpoint: '/delivery/provider-analytics?timeframe=7d', method: 'GET', requiresAuth: true, description: 'Provider Analytics (Statistics tab)' },
    { endpoint: '/delivery/webhook-stats?timeframe=24h', method: 'GET', requiresAuth: true, description: 'Webhook Stats (Webhook Monitoring)' },
    { endpoint: '/delivery/provider-configs/credential-health', method: 'GET', requiresAuth: true, description: 'Credential Health (Integration Readiness)' },
    
    // POST endpoints that require auth
    { 
      endpoint: '/delivery/company-provider-configs', 
      method: 'POST', 
      requiresAuth: true, 
      description: 'Create Provider Config (CompanyProviderConfigModal)',
      body: {
        companyId: 'test-company',
        providerType: 'dhub',
        configuration: { apiBaseUrl: 'test' },
        credentials: { apiKey: 'test' },
        isActive: true,
        priority: 1,
        maxDistance: 15,
        baseFee: 2.5,
        feePerKm: 0.5,
        avgDeliveryTime: 30
      }
    },
    { 
      endpoint: '/delivery/branch-provider-mappings', 
      method: 'POST', 
      requiresAuth: true, 
      description: 'Create Branch Mapping (BranchProviderMappingModal)',
      body: {
        branchId: 'test-branch',
        providerId: 'test-provider',
        isActive: true,
        priority: 1
      }
    }
  ];
  
  const results = {};
  
  for (const test of endpoints) {
    console.log(`\n📍 ${test.description}`);
    results[test.endpoint] = await testEndpointAuth(
      test.endpoint, 
      test.method, 
      test.requiresAuth,
      test.body
    );
  }
  
  // Summary
  console.log('\n\n📊 AUTHENTICATION AUDIT SUMMARY');
  console.log('='.repeat(50));
  
  let publicEndpoints = 0;
  let authEndpoints = 0;
  let issues = 0;
  
  for (const test of endpoints) {
    const result = results[test.endpoint];
    const status = test.requiresAuth ? 
      (result.withoutToken.status === 401 ? '✅ SECURE' : '❌ INSECURE') :
      (result.withoutToken.success ? '✅ PUBLIC' : '❌ BLOCKED');
    
    console.log(`${status} ${test.method} ${test.endpoint}`);
    
    if (test.requiresAuth) {
      authEndpoints++;
      if (result.withoutToken.status !== 401) issues++;
    } else {
      publicEndpoints++;
      if (!result.withoutToken.success) issues++;
    }
  }
  
  console.log(`\n📈 STATISTICS:`);
  console.log(`   Public endpoints: ${publicEndpoints}`);
  console.log(`   Auth-required endpoints: ${authEndpoints}`);
  console.log(`   Issues found: ${issues}`);
  
  if (issues === 0) {
    console.log('\n✅ ALL AUTHENTICATION CHECKS PASSED!');
    console.log('🔒 Security is properly implemented');
  } else {
    console.log(`\n❌ FOUND ${issues} AUTHENTICATION ISSUES`);
    console.log('🔧 Review the failing endpoints above');
  }
  
  console.log('\n💡 RECOMMENDATIONS:');
  console.log('   1. Public endpoints should work without tokens (for loading data)');
  console.log('   2. Mutation endpoints should require valid authentication');
  console.log('   3. Sensitive data endpoints should require proper roles');
  console.log('   4. Frontend should handle 401 errors gracefully');
  
  return { results, publicEndpoints, authEndpoints, issues };
}

// Run the tests
runDeliveryAuthTests().catch(console.error);