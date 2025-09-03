// Test printing to the CORRECT port (9100) for 192.168.1.50
console.log('🔧 Testing CORRECT Printing Port for 192.168.1.50\n');

async function testCorrectPort() {
  const testPrintUrl = 'http://localhost:3001/api/v1/printing/test-print';
  
  console.log('🎯 IMPORTANT: Testing RAW Printing Port (9100)');
  console.log('=' .repeat(60));
  console.log('Port 80  = Web interface (NO physical printing)');
  console.log('Port 9100 = RAW/ESC-POS (ACTUAL physical printing)');
  console.log('Port 515 = LPR (Alternative printing protocol)');
  console.log('Port 631 = IPP (Internet Printing Protocol)');
  console.log('');
  
  // Test the CORRECT port for actual printing
  const request = {
    type: 'network',
    connection: {
      ip: '192.168.1.50',
      port: 9100, // ← THE CORRECT PORT FOR PRINTING
      hostname: 'Receipt-Printer-Kitchen'
    },
    timeout: 5000,
    testType: 'basic'
  };
  
  console.log('📤 Sending to RAW printing port 9100...');
  console.log('Request:', JSON.stringify(request, null, 2));
  console.log('');
  
  try {
    const response = await fetch(testPrintUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    
    const data = await response.json();
    
    console.log('📥 Response:', JSON.stringify(data, null, 2));
    console.log('');
    
    if (data.success) {
      console.log('✅ SUCCESS: Test sent to RAW printing port!');
      console.log(`📤 Bytes sent: ${data.testDetails?.bytesSent}`);
      console.log(`⏱️ Response time: ${data.testDetails?.responseTime}ms`);
      console.log('');
      console.log('🖨️ CHECK YOUR PRINTER NOW!');
      console.log('Expected output:');
      console.log('  • "Restaurant Platform Test"');
      console.log('  • "Test Date: [current date/time]"');
      console.log('  • "Port: 9100 (RAW/ESC-POS)"');
      console.log('  • "Status: OK"');
      console.log('  • Paper should cut (if supported)');
      console.log('');
      console.log('🔍 If no output appears:');
      console.log('  1. Check printer has paper loaded');
      console.log('  2. Check printer is powered on');
      console.log('  3. Check printer supports ESC/POS commands');
      console.log('  4. Try accessing printer web interface at http://192.168.1.50');
    } else {
      console.log('❌ FAILED: Could not send to printing port');
      console.log(`Error: ${data.message}`);
    }
    
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`);
  }
  
  console.log('\n🔧 Port Comparison Test');
  console.log('=' .repeat(50));
  
  // Test all ports to show the difference
  const ports = [
    { port: 80, name: 'HTTP/Web Interface', shouldPrint: false },
    { port: 9100, name: 'RAW/ESC-POS', shouldPrint: true },
    { port: 515, name: 'LPR Protocol', shouldPrint: true },
    { port: 631, name: 'IPP Protocol', shouldPrint: true }
  ];
  
  for (const portInfo of ports) {
    console.log(`\n📡 Testing ${portInfo.name} (port ${portInfo.port})`);
    console.log(`   Expected physical printing: ${portInfo.shouldPrint ? '✅ YES' : '❌ NO'}`);
    
    const portRequest = {
      ...request,
      connection: {
        ...request.connection,
        port: portInfo.port
      }
    };
    
    try {
      const response = await fetch(testPrintUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(portRequest)
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`   📤 Data sent: ${data.testDetails?.bytesSent} bytes`);
        console.log(`   ⏱️ Time: ${data.testDetails?.responseTime}ms`);
      } else {
        console.log(`   ❌ Failed: ${data.message}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🎯 SUMMARY');
  console.log('=' .repeat(50));
  console.log('✅ Use port 9100 for thermal receipt printers (ESC/POS)');
  console.log('✅ Use port 515 for LPR-compatible printers');
  console.log('✅ Use port 631 for IPP-compatible printers');
  console.log('❌ Port 80 is for web management ONLY (no printing)');
  console.log('');
  console.log('💡 In the frontend, make sure you select a printer');
  console.log('   discovered on port 9100, 515, or 631 for actual printing!');
}

testCorrectPort().catch(console.error);