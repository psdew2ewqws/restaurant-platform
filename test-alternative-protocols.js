// Test alternative printing protocols for better A4 paper handling
console.log('🔧 Testing Alternative Printing Protocols for A4 Paper\n');

async function testAlternativeProtocols() {
  const testPrintUrl = 'http://localhost:3001/api/v1/printing/test-print';
  
  console.log('🎯 Your printer seems to create new pages for each line break.');
  console.log('Let\'s try different protocols and single-line format:');
  console.log('');
  
  // Test different protocols that might handle A4 paper better
  const protocols = [
    { port: 9100, name: 'RAW/ESC-POS', description: 'Direct socket connection' },
    { port: 515, name: 'LPR (Line Printer)', description: 'Standard Unix printing' },
    { port: 631, name: 'IPP (Internet Printing)', description: 'Modern HTTP-based printing' }
  ];
  
  for (const protocol of protocols) {
    console.log(`📡 Testing ${protocol.name} (Port ${protocol.port}):`);
    console.log(`   ${protocol.description}`);
    console.log('   ' + '='.repeat(40));
    
    // Test with single-line format
    const request = {
      type: 'network',
      connection: {
        ip: '192.168.1.50',
        port: protocol.port,
        hostname: 'A4-Paper-Test'
      },
      timeout: 5000,
      testType: 'basic' // Now uses single line format
    };
    
    try {
      const response = await fetch(testPrintUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`   ✅ SUCCESS: Test sent via ${protocol.name}`);
        console.log(`   📄 Data size: ${data.testDetails?.bytesSent} bytes`);
        console.log(`   ⏱️  Response: ${data.testDetails?.responseTime}ms`);
        console.log(`   📝 Content: Single line with all test information`);
        console.log(`   🎯 Expected: ONE page with complete test line`);
      } else {
        console.log(`   ❌ FAILED: ${data.message}`);
      }
      
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
    }
    
    console.log('');
    
    // Small delay between protocol tests
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  console.log('🔍 Single Line Format Details:');
  console.log('=' .repeat(50));
  console.log('✅ All test information on ONE line');
  console.log('✅ No line breaks (\\n) to trigger new pages');
  console.log('✅ Complete test data in single print job');
  console.log('✅ Should print: "PRINTER TEST: Connection OK, Data Transfer OK..."');
  console.log('');
  
  console.log('🎯 Expected Result:');
  console.log('=' .repeat(50));
  console.log('📄 Single A4 page with one long line containing:');
  console.log('   • "PRINTER TEST: Connection OK"');
  console.log('   • "Data Transfer OK, Text Printing OK"');
  console.log('   • Current date and time');
  console.log('   • "Multiple words on single line work correctly"');
  console.log('   • "End of test"');
  console.log('');
  
  console.log('💡 If this still creates multiple pages:');
  console.log('   1. Try LPR (port 515) or IPP (port 631) instead of RAW (9100)');
  console.log('   2. Check printer settings for "Form Feed" or "Page Break" options');
  console.log('   3. Look for "Continuous paper" or "Single line" printing mode');
  console.log('   4. The printer might be configured for receipt/slip printing mode');
  console.log('');
  
  console.log('🔧 Next Steps if Issue Persists:');
  console.log('   • Try printing via HTTP (port 80) with web interface');
  console.log('   • Check if printer has A4 vs thermal paper settings');
  console.log('   • Test with printer\'s native driver instead of raw printing');
}

testAlternativeProtocols().catch(console.error);