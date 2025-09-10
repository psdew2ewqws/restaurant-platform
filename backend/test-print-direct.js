const net = require('net');

console.log('🧪 Testing direct print to MenuHere service...');

const socket = new net.Socket();

socket.connect(8182, '127.0.0.1', () => {
  console.log('✅ Connected to MenuHere service');
  
  // Send WebSocket handshake
  const handshake = [
    'GET / HTTP/1.1',
    'Host: 127.0.0.1:8182',
    'Upgrade: websocket',
    'Connection: Upgrade',
    'Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==',
    'Sec-WebSocket-Version: 13',
    '',
    ''
  ].join('\r\n');
  
  socket.write(handshake);
});

let handshakeComplete = false;

socket.on('data', (data) => {
  const received = data.toString();
  
  if (!handshakeComplete && received.includes('101 Switching Protocols')) {
    console.log('✅ WebSocket handshake completed');
    handshakeComplete = true;
    
    // Send test print command
    setTimeout(() => {
      const printCommand = {
        type: 'print',
        printer: 'POS-80C',
        content: {
          type: 'test',
          data: [
            '=== PRINT TEST ===',
            'Date: ' + new Date().toLocaleString(),
            'Test from Node.js',
            'Printer: POS-80C',
            '==================',
            '',
            'If you can see this,',
            'the print test worked!',
            '',
            '=================='
          ].join('\n')
        }
      };
      
      const message = JSON.stringify(printCommand) + '\n';
      console.log('🖨️ Sending print command:', printCommand);
      socket.write(message);
      
      setTimeout(() => {
        console.log('✅ Print test completed!');
        socket.destroy();
      }, 2000);
    }, 1000);
  } else {
    console.log('📩 Received:', received);
  }
});

socket.on('error', (error) => {
  console.error('❌ Socket error:', error.message);
});

socket.on('close', () => {
  console.log('🔌 Connection closed');
  process.exit(0);
});