// Test login and token generation
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function testLogin() {
  console.log('🔐 Testing login and token generation...\n');
  
  const credentials = [
    { emailOrUsername: 'admin@platform.com', password: 'E$$athecode006', description: 'Super Admin' },
    { emailOrUsername: 'admin@platform.com', password: 'thecode007', description: 'Super Admin (alt password)' },
    { emailOrUsername: 'step2@criptext.com', password: 'thecode007', description: 'Company Owner' },
    { emailOrUsername: 'issadalu2', password: 'thecode007', description: 'Company Owner (username)' },
  ];
  
  for (const cred of credentials) {
    console.log(`🧪 Testing: ${cred.description} (${cred.emailOrUsername})`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailOrUsername: cred.emailOrUsername,
          password: cred.password
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.accessToken) {
        console.log('✅ LOGIN SUCCESS!');
        console.log(`   Token: ${data.accessToken.substring(0, 50)}...`);
        console.log(`   User: ${data.user?.email} (${data.user?.role})`);
        
        // Test the token with a protected endpoint
        const testResponse = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${data.accessToken}` }
        });
        
        if (testResponse.ok) {
          const userData = await testResponse.json();
          console.log('✅ TOKEN VALID - Authentication working properly');
          console.log(`   Verified user: ${userData.email} (${userData.role})`);
          
          // Test creating a provider config with this valid token
          await testProviderConfigCreation(data.accessToken);
          
        } else {
          console.log('❌ TOKEN INVALID - Authentication failed');
        }
        
        return data.accessToken; // Return the first working token
        
      } else {
        console.log('❌ LOGIN FAILED');
        console.log(`   Status: ${response.status}`);
        console.log(`   Error: ${data.message || 'Unknown error'}`);
      }
      
    } catch (error) {
      console.log('❌ LOGIN ERROR');
      console.log(`   Error: ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }
  
  return null;
}

async function testProviderConfigCreation(token) {
  console.log('\n🔧 Testing provider config creation with valid token...');
  
  const testConfig = {
    companyId: 'dc3c6a10-96c6-4467-9778-313af66956af', // Default Restaurant from our companies test
    providerType: 'dhub',
    configuration: { 
      apiBaseUrl: 'https://api.dhub.com/v1',
      clientId: 'test-client',
      environment: 'test'
    },
    credentials: { 
      accessToken: 'test-token',
      refreshToken: 'test-refresh'
    },
    isActive: true,
    priority: 1,
    maxDistance: 15,
    baseFee: 2.5,
    feePerKm: 0.5,
    avgDeliveryTime: 30
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}/delivery/company-provider-configs`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testConfig)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ PROVIDER CONFIG CREATED SUCCESSFULLY!');
      console.log('   The authentication issue is resolved');
      console.log('   Frontend components should work properly now');
    } else {
      console.log('❌ PROVIDER CONFIG CREATION FAILED');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${JSON.stringify(data, null, 2)}`);
    }
    
  } catch (error) {
    console.log('❌ PROVIDER CONFIG ERROR');
    console.log(`   Error: ${error.message}`);
  }
}

// Run the test
testLogin().then(token => {
  if (token) {
    console.log('\n✅ AUTHENTICATION TEST COMPLETED SUCCESSFULLY');
    console.log('\n📋 INSTRUCTIONS FOR USER:');
    console.log('1. Login to the application with the working credentials above');
    console.log('2. Navigate to http://localhost:3000/settings/delivery');
    console.log('3. Try creating a provider configuration');
    console.log('4. It should work without authentication errors');
  } else {
    console.log('\n❌ NO VALID CREDENTIALS FOUND');
    console.log('\n🔧 SOLUTIONS:');
    console.log('1. Reset user password in database');
    console.log('2. Create a new super_admin user');
    console.log('3. Check if authentication system is working properly');
  }
}).catch(console.error);