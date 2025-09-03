// Test A4 paper formatting fix
console.log('📄 Testing A4 Paper Formatting Fix\n');

async function testA4PaperPrinting() {
  const testPrintUrl = 'http://localhost:3001/api/v1/printing/test-print';
  
  console.log('🎯 Problem Summary:');
  console.log('Before: ESC/POS commands caused only 1 line to print');
  console.log('After:  Plain text should print ALL lines on A4 paper');
  console.log('');
  
  const testTypes = [
    { type: 'basic', description: 'Basic printer test with multiple lines' },
    { type: 'receipt', description: 'Full restaurant receipt format' },
    { type: 'alignment', description: 'Text alignment demonstration' }
  ];
  
  for (const test of testTypes) {
    console.log(`📋 Testing ${test.type.toUpperCase()} print format:`);
    console.log(`   ${test.description}`);
    console.log('   ' + '='.repeat(50));
    
    const request = {
      type: 'network',
      connection: {
        ip: '192.168.1.50',
        port: 9100,
        hostname: 'A4-Test-Printer'
      },
      timeout: 5000,
      testType: test.type
    };
    
    try {
      const response = await fetch(testPrintUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`   ✅ SUCCESS: ${test.type} test sent to printer`);
        console.log(`   📄 Data size: ${data.testDetails?.bytesSent} bytes (plain text)`);
        console.log(`   ⏱️  Response: ${data.testDetails?.responseTime}ms`);
        
        // Show what should be printed
        if (test.type === 'basic') {
          console.log(`   📝 Expected on A4 paper:`);
          console.log(`      • "PRINTER TEST SUCCESSFUL"`);
          console.log(`      • "Connection: OK"`);
          console.log(`      • "Data Transfer: OK"`);
          console.log(`      • "Text Printing: OK"`);
          console.log(`      • Current date and time`);
          console.log(`      • "Multiple lines are printing properly"`);
          console.log(`      • "End of test"`);
        } else if (test.type === 'receipt') {
          console.log(`   📝 Expected on A4 paper:`);
          console.log(`      • "RESTAURANT TEST RECEIPT"`);
          console.log(`      • Order details with items and prices`);
          console.log(`      • Subtotal, tax, and total calculations`);
          console.log(`      • "Thank you for testing!"`);
          console.log(`      • Multiple formatted lines`);
        } else if (test.type === 'alignment') {
          console.log(`   📝 Expected on A4 paper:`);
          console.log(`      • "PRINTER ALIGNMENT TEST"`);
          console.log(`      • Left aligned text`);
          console.log(`      • Center aligned text (with spacing)`);
          console.log(`      • Right aligned text (with spacing)`);
          console.log(`      • Multiple alignment examples`);
        }
        
        console.log('');
      } else {
        console.log(`   ❌ FAILED: ${data.message}`);
        console.log('');
      }
      
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
      console.log('');
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('🔧 Technical Changes Made:');
  console.log('=' .repeat(50));
  console.log('✅ Removed all ESC/POS binary commands (0x1B, 0x40, etc.)');
  console.log('✅ Replaced with pure plain text content');
  console.log('✅ Added proper line breaks with \\n');
  console.log('✅ Added spacing and formatting for readability');
  console.log('✅ No more printer control codes that A4 printers ignore');
  console.log('');
  
  console.log('🎯 What You Should See Now:');
  console.log('=' .repeat(50));
  console.log('✅ Multiple lines should print on each test');
  console.log('✅ All text content should be visible');
  console.log('✅ No blank pages with only 1 line');
  console.log('✅ Proper A4 paper formatting');
  console.log('✅ Receipt-style layouts work correctly');
  console.log('');
  
  console.log('💡 If you still see only 1 line:');
  console.log('   1. Check if printer is set to "Text/Plain" mode');
  console.log('   2. Ensure printer driver supports raw text printing');
  console.log('   3. Try printing via different ports (515, 631) if available');
  console.log('   4. Check printer queue for multiple documents');
  console.log('');
  
  console.log('🏆 A4 Paper Test Complete!');
  console.log('The system now sends plain text instead of ESC/POS commands.');
  console.log('This should resolve the single-line printing issue on office printers.');
}

testA4PaperPrinting().catch(console.error);