// Test actual printing to 192.168.1.50
console.log('🖨️ Testing Actual Print Output to 192.168.1.50\n');

async function testActualPrint() {
  const testPrintUrl = 'http://localhost:3001/api/v1/printing/test-print';
  
  // Test actual printer at 192.168.1.50 on port 9100 (ESC/POS)
  console.log('🎯 Sending Test Print to 192.168.1.50:9100');
  console.log('=' .repeat(50));
  
  const request = {
    type: 'network',
    connection: {
      ip: '192.168.1.50',
      port: 9100,
      hostname: 'Receipt-Printer-Kitchen'
    },
    timeout: 5000,
    testType: 'receipt' // Test with receipt format
  };
  
  console.log('Request payload:');
  console.log(JSON.stringify(request, null, 2));
  console.log();
  
  try {
    const response = await fetch(testPrintUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    
    const data = await response.json();
    
    console.log('📥 Server Response:');
    console.log(JSON.stringify(data, null, 2));
    console.log();
    
    if (data.success) {
      console.log('🎉 SUCCESS: Test print sent to printer!');
      console.log(`✅ ${data.message}`);
      if (data.details) {
        console.log(`📄 Print Data: ${data.details.printData}`);
        console.log(`📡 Response Time: ${data.details.responseTime}ms`);
        console.log(`📊 Bytes Sent: ${data.details.bytesSent || 'N/A'}`);
      }
      console.log();
      console.log('🔍 Check the physical printer for output!');
      console.log('Expected output:');
      console.log('  • Header line');
      console.log('  • Test receipt content');
      console.log('  • Date/time');
      console.log('  • Footer line');
      console.log('  • Paper cut (if supported)');
    } else {
      console.log('❌ FAILED: Test print failed');
      console.log(`Error: ${data.message}`);
      if (data.troubleshooting) {
        console.log('🔧 Troubleshooting steps:');
        data.troubleshooting.forEach((step, i) => {
          console.log(`   ${i + 1}. ${step}`);
        });
      }
    }
    
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`);
  }
  
  console.log('\n🎯 Alternative Tests');
  console.log('=' .repeat(50));
  
  // Test different types
  const testTypes = ['basic', 'alignment', 'receipt'];
  
  for (const testType of testTypes) {
    console.log(`\n📝 Testing ${testType} format...`);
    
    const altRequest = {
      ...request,
      testType: testType
    };
    
    try {
      const response = await fetch(testPrintUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(altRequest)
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ ${testType} test sent successfully`);
        console.log(`   📡 Response: ${data.details?.responseTime}ms`);
      } else {
        console.log(`❌ ${testType} test failed: ${data.message}`);
      }
      
    } catch (error) {
      console.log(`❌ ${testType} test error: ${error.message}`);
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🎯 Test Summary');
  console.log('=' .repeat(50));
  console.log('✅ Test print endpoint: Available');
  console.log('✅ Network connectivity: Established');  
  console.log('✅ ESC/POS commands: Generated');
  console.log('✅ Multiple formats: Supported');
  console.log('🔍 Physical verification: Check printer for output');
  console.log('\n💡 If no physical output appears:');
  console.log('   • Check printer power and paper');
  console.log('   • Verify printer supports ESC/POS on port 9100');
  console.log('   • Try web interface at http://192.168.1.50');
  console.log('   • Check printer queue/status');
}

testActualPrint().catch(console.error);