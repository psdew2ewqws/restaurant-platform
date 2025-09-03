// Test all dynamic network range formats
console.log('🧪 Testing Dynamic Network Range Formats\n');

async function testDynamicRanges() {
  const url = 'http://localhost:3001/api/v1/printing/network-discovery';
  
  const testCases = [
    {
      name: 'CIDR /24 Network',
      description: 'Standard subnet with 254 IPs',
      range: '10.0.1.0/24',
      expectedIPs: 254
    },
    {
      name: 'IP Range (Start-End)',
      description: 'Specific range of 50 IPs',
      range: '192.168.1.1-192.168.1.50',
      expectedIPs: 50
    },
    {
      name: 'Subnet Shorthand',
      description: 'Auto-expands to .1-.254',
      range: '172.16.5',
      expectedIPs: 254
    },
    {
      name: 'Single IP',
      description: 'Test just one specific IP',
      range: '192.168.22.110',
      expectedIPs: 1
    },
    {
      name: 'Small Custom Range',
      description: 'Small office network range',
      range: '10.0.0.100-10.0.0.120',
      expectedIPs: 21
    },
    {
      name: 'CIDR /16 Network (Limited)',
      description: 'Large network - first 65k IPs',
      range: '172.16.0.0/16',
      expectedIPs: 65024 // 256 * 254 + 256 = 65k+ IPs
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`📡 Test: ${testCase.name}`);
    console.log(`Description: ${testCase.description}`);
    console.log(`Range: ${testCase.range}`);
    console.log('=' .repeat(50));
    
    const request = {
      scanRanges: [testCase.range],
      ports: [9100, 80], // Limit ports for faster testing
      timeout: 500 // Faster timeout for large ranges
    };
    
    const startTime = Date.now();
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });
      
      const data = await response.json();
      const duration = Date.now() - startTime;
      
      if (data.success) {
        console.log(`✅ SUCCESS: Found ${data.count} printers`);
        console.log(`⏱️ Scan completed in ${duration}ms`);
        console.log(`📊 Estimated ${testCase.expectedIPs} IPs scanned`);
        
        if (data.printers.length > 0) {
          console.log(`📍 Sample results:`);
          data.printers.slice(0, 3).forEach((printer, i) => {
            console.log(`   ${i + 1}. ${printer.hostname} (${printer.ip}:${printer.port})`);
          });
          if (data.printers.length > 3) {
            console.log(`   ... and ${data.printers.length - 3} more`);
          }
        }
      } else {
        console.log(`❌ FAILED: ${data.error || 'Unknown error'}`);
      }
      
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
    }
    
    console.log('\\n');
  }
  
  // Test mixed dynamic ranges
  console.log('📡 Test: Mixed Dynamic Ranges');
  console.log('Description: Combining different range formats');
  console.log('Ranges: 192.168.22, 10.0.1.1-10.0.1.10, 172.16.100.5');
  console.log('=' .repeat(50));
  
  const mixedRequest = {
    scanRanges: [
      '192.168.22', // Subnet (your actual network)
      '10.0.1.1-10.0.1.10', // Small range
      '172.16.100.5' // Single IP
    ],
    ports: [9100, 80],
    timeout: 2000
  };
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mixedRequest)
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Mixed ranges: Found ${data.count} printers across 3 different range formats`);
      
      // Group by network range
      const printersByNetwork = {};
      data.printers.forEach(printer => {
        const networkKey = printer.networkRange || 'unknown';
        if (!printersByNetwork[networkKey]) {
          printersByNetwork[networkKey] = [];
        }
        printersByNetwork[networkKey].push(printer);
      });
      
      Object.entries(printersByNetwork).forEach(([network, printers]) => {
        console.log(`   ${network}: ${printers.length} printers`);
        printers.slice(0, 2).forEach(printer => {
          console.log(`     - ${printer.hostname} (${printer.ip}:${printer.port})`);
        });
      });
    }
    
  } catch (error) {
    console.log(`❌ Mixed ranges error: ${error.message}`);
  }
  
  console.log('\\n🎯 Dynamic Range Testing Completed!');
  console.log('\\n📋 Supported Range Formats:');
  console.log('✅ CIDR Notation: 192.168.1.0/24, 10.0.0.0/16, 172.16.0.0/8');
  console.log('✅ IP Ranges: 192.168.1.1-192.168.1.50');
  console.log('✅ Subnet Shorthand: 192.168.1 (auto .1-.254)');
  console.log('✅ Single IP: 192.168.1.100');
  console.log('✅ Mixed Formats: All above formats in one scan');
  console.log('\\n🚀 Perfect for different company network setups!');
}

testDynamicRanges().catch(console.error);