// Test companies API endpoint
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function testCompanies() {
  console.log('🧪 Testing companies API endpoint...\n');
  
  try {
    const response = await fetch(`${API_BASE_URL}/companies`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Companies API Response:');
    console.log('   Status:', response.status);
    console.log('   Total companies:', data.length);
    
    if (Array.isArray(data)) {
      data.forEach((company, index) => {
        console.log(`   ${index + 1}. ${company.name} (${company.status})`);
      });
      
      // Filter active and trial companies (what the modal should show)
      const activeCompanies = data.filter(company => 
        company.status === 'active' || company.status === 'trial'
      );
      
      console.log('\n🎯 Filtered companies (active + trial):');
      console.log('   Count:', activeCompanies.length);
      activeCompanies.forEach((company, index) => {
        console.log(`   ${index + 1}. ${company.name} (${company.status})`);
      });
      
      if (activeCompanies.length === 0) {
        console.log('⚠️  Warning: No active or trial companies found!');
        console.log('   This could explain why dropdown appears empty.');
      } else {
        console.log('\n✅ Companies should now appear in the dropdown!');
      }
      
    } else {
      console.log('❌ Unexpected response format - not an array');
      console.log('   Data:', data);
    }
    
  } catch (error) {
    console.error('❌ Companies API test failed:', error.message);
    console.log('\n📝 Fallback: Modal will use mock companies:');
    console.log('   1. Demo Restaurant A');
    console.log('   2. Demo Restaurant B'); 
    console.log('   3. Demo Restaurant C');
  }
  
  console.log('\n🔧 Fix Applied:');
  console.log('   • Changed from /companies/list (auth required) to /companies');
  console.log('   • Added safe error handling with DeliveryTestingHelpers');
  console.log('   • Added mock data fallback for testing');
  console.log('   • Made company dropdown visible to all users');
  console.log('   • Added loading message when companies are fetching');
  
  console.log('\n📍 Next: Reload the page and try opening "Add Provider Configuration" modal');
}

testCompanies();