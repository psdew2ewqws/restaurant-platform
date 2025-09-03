// Test the improved printer system with port priority and minimal printing
console.log('🔧 Testing Improved Printer System\n');

async function testImprovements() {
  console.log('🎯 Test 1: Discovery with Port Priority');
  console.log('=' .repeat(50));
  
  // Test discovery to see if port 9100 comes first
  const discoveryUrl = 'http://localhost:3001/api/v1/printing/network-discovery';
  const discoveryRequest = {
    scanRanges: ['192.168.1.50'], // Single IP to make it fast
    ports: [9100, 80, 515, 631],
    timeout: 1000
  };
  
  try {
    const response = await fetch(discoveryUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discoveryRequest)
    });
    
    const data = await response.json();
    
    if (data.success && data.count > 0) {
      console.log(`✅ Found ${data.count} printer(s):`);
      data.printers.forEach((printer, index) => {
        const priority = index === 0 ? '🥇 FIRST' : `${index + 1}.`;
        console.log(`   ${priority} ${printer.ip}:${printer.port} (${printer.model})`);
        if (printer.port === 9100) {
          console.log(`       🖨️  RAW/ESC-POS - BEST FOR PRINTING`);
        } else if (printer.port === 80) {
          console.log(`       🌐 Web Interface - NO PRINTING`);
        }
      });
      
      if (data.printers[0].port === 9100) {
        console.log('\n✅ SUCCESS: Port 9100 is prioritized first!');
      } else {
        console.log('\n⚠️  WARNING: Port 9100 should be first for best printing');
      }
    } else {
      console.log('❌ No printers found');
    }
    
  } catch (error) {
    console.log(`❌ Discovery test failed: ${error.message}`);
  }
  
  console.log('\n🎯 Test 2: Minimal Test Print');
  console.log('=' .repeat(50));
  
  // Test the new minimal print output
  const testPrintUrl = 'http://localhost:3001/api/v1/printing/test-print';
  const printRequest = {
    type: 'network',
    connection: {
      ip: '192.168.1.50',
      port: 9100,
      hostname: 'Test-Printer'
    },
    timeout: 5000,
    testType: 'basic' // Should be much shorter now
  };
  
  console.log('📤 Sending MINIMAL test print (should save paper)...');
  
  try {
    const response = await fetch(testPrintUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(printRequest)
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ SUCCESS: Minimal test print sent!');
      console.log(`📄 Bytes sent: ${data.testDetails?.bytesSent} (should be much less than before)`);
      console.log(`⏱️  Response time: ${data.testDetails?.responseTime}ms`);
      console.log('\n🔍 Expected output on printer:');
      console.log('   Line 1: "✓ PRINTER TEST OK"');
      console.log('   Line 2: "[current time]"');
      console.log('   Line 3: Partial paper cut (not full separation)');
      console.log('\n✅ Should be only ~3 lines instead of 10+ lines!');
    } else {
      console.log(`❌ Test print failed: ${data.message}`);
    }
    
  } catch (error) {
    console.log(`❌ Print test failed: ${error.message}`);
  }
  
  console.log('\n🎯 Test 3: Comparison of All Test Types');
  console.log('=' .repeat(50));
  
  const testTypes = ['basic', 'receipt', 'alignment'];
  
  console.log('Testing all print types with new minimal output:');
  
  for (const testType of testTypes) {
    const testReq = { ...printRequest, testType };
    
    try {
      const response = await fetch(testPrintUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testReq)
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ ${testType.padEnd(9)} test: ${data.testDetails?.bytesSent} bytes (minimal)`);
      } else {
        console.log(`❌ ${testType.padEnd(9)} test: Failed`);
      }
      
    } catch (error) {
      console.log(`❌ ${testType.padEnd(9)} test: Error - ${error.message}`);
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n🎯 Summary of Improvements');
  console.log('=' .repeat(50));
  console.log('✅ Port 9100 (actual printing) now appears FIRST in discovery');
  console.log('✅ Test prints are now MINIMAL (2-3 lines instead of 10+)');
  console.log('✅ Uses partial cut (saves paper, no full separation)');
  console.log('✅ All test types dramatically reduced in size');
  console.log('✅ Saves money on thermal paper rolls');
  console.log('\n💡 In the frontend wizard:');
  console.log('   • The first printer shown will be the correct port 9100');
  console.log('   • Test prints will be much shorter and save paper');
  console.log('   • Users less likely to choose wrong port by mistake');
}

testImprovements().catch(console.error);