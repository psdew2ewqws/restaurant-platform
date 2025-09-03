// Test the real network discovery with your actual network
console.log('🧪 Testing Real Network Discovery at 192.168.22.0/24\n');

async function testRealNetwork() {
  const url = 'http://localhost:3001/api/v1/printing/network-discovery';
  
  const request = {
    scanRanges: ['192.168.22.0/24'],
    ports: [9100, 515, 631, 80],
    timeout: 3000
  };
  
  console.log('🔍 Scanning your actual network range...');
  console.log('Request:', JSON.stringify(request, null, 2));
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    
    const data = await response.json();
    
    console.log(`\n🎯 SUCCESS: Found ${data.count} real devices on your network!\n`);
    
    data.printers.forEach((printer, i) => {
      console.log(`📱 Device ${i + 1}:`);
      console.log(`   Name: ${printer.hostname}`);
      console.log(`   IP:Port: ${printer.ip}:${printer.port}`);
      console.log(`   Type: ${printer.manufacturer} ${printer.model}`);
      console.log(`   Capabilities: ${printer.capabilities.join(', ')}`);
      console.log(`   Status: ${printer.status}`);
      console.log(`   Response Time: ${printer.responseTime}ms`);
      console.log('');
    });
    
    // Specifically highlight the target printer
    const targetPrinter = data.printers.find(p => p.ip === '192.168.22.110');
    if (targetPrinter) {
      console.log('🎉 FOUND YOUR TARGET PRINTER:');
      console.log(`   ✅ ${targetPrinter.hostname} at ${targetPrinter.ip}:${targetPrinter.port}`);
      console.log(`   ✅ ${targetPrinter.manufacturer} ${targetPrinter.model}`);
      console.log(`   ✅ Status: ${targetPrinter.status}`);
    } else {
      console.log('⚠️ Target printer 192.168.22.110 not found in results');
    }
    
  } catch (error) {
    console.error('❌ Discovery failed:', error.message);
  }
}

testRealNetwork().catch(console.error);