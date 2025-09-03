// Comprehensive printer discovery test to find all 18 network printers
console.log('🔍 Comprehensive Printer Discovery Test\n');

async function comprehensivePrinterDiscovery() {
  const discoveryUrl = 'http://localhost:3001/api/v1/printing/network-discovery';
  
  console.log('🎯 ENHANCED DISCOVERY STRATEGY:');
  console.log('=' .repeat(60));
  console.log('✅ Multiple network ranges (192.168.x.x, 10.x.x.x, 172.16.x.x)');
  console.log('✅ Extended port range (80, 443, 515, 631, 9100-9110, 8080-8090)');
  console.log('✅ Reduced timeout for faster scanning');
  console.log('✅ Parallel processing for speed');
  console.log('✅ SNMP printer detection (if supported)');
  console.log('');

  // Comprehensive network ranges to scan
  const networkRanges = [
    // Common home/office ranges
    '192.168.1.0/24',   // Most common home network
    '192.168.0.0/24',   // Alternative home network
    '192.168.2.0/24',   // Some router configs
    '10.0.0.0/24',      // Corporate/cloud networks
    '10.0.1.0/24',      // Extended corporate
    '172.16.0.0/24',    // Private corporate range
    '172.16.1.0/24',    // Extended corporate
    // VM/Development ranges
    '10.0.2.0/24',      // VirtualBox NAT
    '192.168.122.0/24', // Libvirt default
    // Auto-detect current network
    await detectCurrentNetwork()
  ].filter(Boolean);

  // Extended printer ports
  const printerPorts = [
    9100,  // RAW/ESC-POS (most common)
    9101, 9102, 9103, 9104, 9105, // Extended RAW ports
    9106, 9107, 9108, 9109, 9110, // More RAW ports
    515,   // LPR (Line Printer Remote)
    631,   // IPP (Internet Printing Protocol)
    80,    // HTTP (Web interface)
    443,   // HTTPS (Secure web interface)
    8080,  // Alternative HTTP
    8000, 8001, 8008, 8443, // Common alternatives
    // Brother specific ports
    54921, 54925,
    // Canon specific ports  
    8610, 8611,
    // HP specific ports
    3911, 3912, 3913
  ];

  console.log('🌐 Scanning Network Ranges:');
  networkRanges.forEach((range, index) => {
    console.log(`   ${index + 1}. ${range}`);
  });
  
  console.log(`\n📡 Scanning ${printerPorts.length} Printer Ports:`);
  console.log(`   Primary: 9100-9110 (RAW), 515 (LPR), 631 (IPP)`);
  console.log(`   Secondary: 80, 443, 8080 (Web interfaces)`);
  console.log(`   Brand-specific: 54921 (Brother), 8610 (Canon), 3911 (HP)`);
  console.log('');

  const request = {
    scanRanges: networkRanges,
    ports: printerPorts,
    timeout: 2000,  // Faster timeout per connection
    maxConcurrent: 50, // Higher concurrency
    enableSNMP: true,  // Enable SNMP detection
    deepScan: true     // Enable advanced detection
  };

  try {
    console.log('🚀 Starting comprehensive network scan...');
    console.log(`   • Scanning ${networkRanges.length} network ranges`);
    console.log(`   • Testing ${printerPorts.length} ports per IP`);
    console.log(`   • Max ${request.maxConcurrent} concurrent connections`);
    console.log(`   • ${request.timeout}ms timeout per connection`);
    console.log('');
    
    const startTime = Date.now();
    
    const response = await fetch(discoveryUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    const data = await response.json();
    const scanTime = Date.now() - startTime;

    console.log('📊 DISCOVERY RESULTS:');
    console.log('=' .repeat(60));
    
    if (data.success && data.printers && data.printers.length > 0) {
      console.log(`✅ Found ${data.printers.length} printer(s) in ${scanTime}ms:`);
      console.log('');
      
      // Group printers by network range
      const printersByNetwork = {};
      data.printers.forEach(printer => {
        const network = printer.networkRange || getNetworkFromIP(printer.ip);
        if (!printersByNetwork[network]) {
          printersByNetwork[network] = [];
        }
        printersByNetwork[network].push(printer);
      });

      Object.keys(printersByNetwork).forEach(network => {
        console.log(`🌐 Network: ${network}`);
        printersByNetwork[network].forEach((printer, index) => {
          console.log(`   ${index + 1}. ${printer.hostname || 'Unknown'} (${printer.ip}:${printer.port})`);
          console.log(`      Model: ${printer.manufacturer} ${printer.model}`);
          console.log(`      Status: ${printer.status} (${printer.responseTime}ms)`);
          console.log(`      Capabilities: ${printer.capabilities.join(', ')}`);
          
          if (printer.port === 9100) {
            console.log(`      🖨️  RAW/ESC-POS - READY FOR PRINTING`);
          } else if (printer.port === 80) {
            console.log(`      🌐 Web Interface - Management Only`);
          } else if (printer.port === 515) {
            console.log(`      📄 LPR Protocol - Alternative Printing`);
          } else if (printer.port === 631) {
            console.log(`      🔄 IPP Protocol - Modern Printing`);
          }
          console.log('');
        });
      });

      // Analysis
      const rawPrinters = data.printers.filter(p => p.port >= 9100 && p.port <= 9110).length;
      const webPrinters = data.printers.filter(p => [80, 443, 8080].includes(p.port)).length;
      const lprPrinters = data.printers.filter(p => p.port === 515).length;
      const ippPrinters = data.printers.filter(p => p.port === 631).length;
      
      console.log('📈 PRINTER TYPE ANALYSIS:');
      console.log('=' .repeat(40));
      console.log(`🖨️  RAW/ESC-POS Printers: ${rawPrinters} (for direct printing)`);
      console.log(`🌐 Web Interface Printers: ${webPrinters} (for management)`);
      console.log(`📄 LPR Protocol Printers: ${lprPrinters} (alternative)`);
      console.log(`🔄 IPP Protocol Printers: ${ippPrinters} (modern)`);
      console.log('');

      // Recommendations
      console.log('💡 RECOMMENDATIONS:');
      console.log('=' .repeat(40));
      if (rawPrinters > 0) {
        console.log(`✅ Use ${rawPrinters} RAW printers for direct printing`);
      }
      if (data.printers.length < 18) {
        console.log(`⚠️  Found ${data.printers.length}/18 printers. Missing ${18 - data.printers.length} printers may be:`);
        console.log('   • On different network ranges not scanned');
        console.log('   • Using non-standard ports');
        console.log('   • Powered off or in sleep mode');
        console.log('   • Behind firewalls blocking connections');
        console.log('   • Using different protocols (Bluetooth, WiFi Direct)');
      } else {
        console.log(`🎉 Found all expected printers!`);
      }
      
    } else {
      console.log('❌ No printers found. This could be because:');
      console.log('   • Printers are on different network ranges');
      console.log('   • Firewalls are blocking discovery');
      console.log('   • Printers are using non-standard ports');
      console.log('   • Network connectivity issues');
      console.log('');
      console.log('🔧 TROUBLESHOOTING STEPS:');
      console.log('   1. Check if printers are powered on');
      console.log('   2. Verify network connectivity (ping test)');
      console.log('   3. Check firewall settings');
      console.log('   4. Try manual IP discovery');
      console.log('   5. Use printer manufacturer tools');
    }

  } catch (error) {
    console.log(`❌ Discovery failed: ${error.message}`);
    console.log('');
    console.log('🔧 FALLBACK OPTIONS:');
    console.log('   1. Check if discovery server is running on port 3001');
    console.log('   2. Try nmap scan: nmap -p 9100,80,515,631 192.168.1.0/24');
    console.log('   3. Use arp-scan: sudo arp-scan -l');
    console.log('   4. Check router admin panel for device list');
  }
}

// Helper function to detect current network
async function detectCurrentNetwork() {
  try {
    // Try to determine current network from system
    const response = await fetch('http://localhost:3001/api/v1/network/detect');
    if (response.ok) {
      const data = await response.json();
      return data.networkRange;
    }
  } catch (error) {
    // Fallback - try to guess from common patterns
    return null;
  }
}

// Helper function to get network range from IP
function getNetworkFromIP(ip) {
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
  }
  return 'Unknown';
}

comprehensivePrinterDiscovery().catch(console.error);