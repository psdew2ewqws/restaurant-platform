// Test script to simulate printer discovery API call
// This will help us debug if the API call is working

const testDiscovery = async () => {
  console.log('🧪 Testing network printer discovery...');
  
  const url = 'http://localhost:3001/api/v1/printing/discovery/network';
  const token = localStorage.getItem('auth-token');
  
  console.log('🔑 Token from localStorage:', token ? 'Present' : 'Missing');
  
  const requestBody = {
    scanRange: '192.168.1.0/24',
    ports: [9100, 515, 631],
    timeout: 5000
  };
  
  console.log('📤 Request details:');
  console.log('  URL:', url);
  console.log('  Method: POST');
  console.log('  Body:', requestBody);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', [...response.headers.entries()]);
    
    if (!response.ok) {
      console.error('❌ Request failed with status:', response.status);
      const errorText = await response.text();
      console.error('❌ Error text:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Success! Response data:', data);
    
  } catch (error) {
    console.error('💥 Request failed with error:', error);
  }
};

// Auto-run the test
testDiscovery();