# PrinterMaster v2.0.0

Enterprise Printer Management System for Restaurant POS - QZ-Tray Replacement

## Overview

PrinterMaster is a production-ready Electron application designed to replace QZ-Tray for restaurant POS systems. It provides comprehensive printer management with QZ-Tray API compatibility, enterprise deployment features, and restaurant-specific integrations.

## Key Features

### 🖨️ Printer Management
- **Auto-Discovery**: Automatically detect USB and network thermal printers
- **Multi-Protocol Support**: ESC/POS, raw printing, system printers
- **Real-Time Status**: Monitor printer health and connectivity
- **Queue Management**: Print job queuing with priority support
- **Test Printing**: Built-in test receipt functionality

### 🌐 QZ-Tray Compatibility
- **WebSocket API**: Drop-in replacement for QZ-Tray WebSocket server
- **Same API Structure**: Compatible with existing POS integrations
- **Port 9012**: Default QZ-Tray port for seamless migration
- **Command Compatibility**: Support for all standard QZ-Tray commands

### 🏢 Enterprise Ready
- **Windows Service**: Install as system service with auto-start
- **Linux SystemD**: Full Linux service integration
- **Silent Installation**: MSI and NSIS installers for mass deployment
- **Auto-Update**: Remote update capabilities
- **Centralized Logging**: Comprehensive audit trails

### 🍽️ Restaurant Integration
- **Backend Connection**: Connect to restaurant management systems
- **Branch Management**: Multi-branch deployment support
- **Remote Control**: Start/stop printing from central dashboard
- **Health Monitoring**: Real-time status reporting to backend

## System Requirements

### Minimum Requirements
- **OS**: Windows 7+, Ubuntu 18.04+, macOS 10.13+
- **RAM**: 2GB minimum, 4GB recommended
- **Disk**: 500MB available space
- **Network**: Internet connection for updates and backend integration

### Supported Printers
- **Thermal Printers**: ESC/POS compatible (Epson, Star, Zebra)
- **Network Printers**: IP-based thermal printers (Port 9100)
- **USB Printers**: Direct USB connection support
- **System Printers**: Windows/Linux/macOS installed printers

## Installation

### Quick Start

1. **Download** the latest release for your platform:
   - Windows: `PrinterMaster-Setup.exe`
   - Linux: `PrinterMaster.AppImage`
   - macOS: `PrinterMaster.dmg`

2. **Install** using the appropriate installer
3. **Run** PrinterMaster from desktop shortcut or start menu
4. **Configure** your printers using the built-in discovery tool

### Windows Service Installation

```bash
# Install as Windows Service (Administrator required)
PrinterMaster-Setup.exe

# Or manually after installation
node service.js install
```

### Linux Service Installation

```bash
# Install and setup service (Root required)
sudo chmod +x PrinterMaster.AppImage
sudo ./PrinterMaster.AppImage --install-service

# Or manually
sudo node service.js install
```

## Configuration

### Default Settings

PrinterMaster creates configuration files in:
- **Windows**: `%APPDATA%\PrinterMaster\config.json`
- **Linux**: `~/.printermaster/config.json`
- **macOS**: `~/Library/Preferences/PrinterMaster/config.json`

### Key Configuration Options

```json
{
  "websocket": {
    "port": 9012,
    "host": "localhost",
    "enabled": true
  },
  "restaurant": {
    "enabled": true,
    "backendUrl": "https://your-restaurant-backend.com",
    "branchId": "branch-001",
    "heartbeatInterval": 30000
  },
  "printers": {
    "autoDiscovery": true,
    "discoveryInterval": 300000,
    "defaultPaperWidth": 58
  }
}
```

## API Usage

### WebSocket Connection

```javascript
// Connect to PrinterMaster WebSocket (same as QZ-Tray)
const socket = new WebSocket('ws://localhost:9012');

socket.onopen = function() {
  console.log('Connected to PrinterMaster');
};
```

### Find Printers

```javascript
// Find available printers
const message = {
  call: 'qz.printers.find',
  params: {},
  callback: 'findPrintersCallback'
};

socket.send(JSON.stringify(message));
```

### Print Receipt

```javascript
// Print thermal receipt
const printJob = {
  call: 'qz.print.raw',
  params: {
    printer: 'EPSON TM-T88V',
    data: [
      '\\x1B\\x40', // Initialize printer
      'PrinterMaster Test Receipt\\n',
      '\\x1B\\x64\\x02' // Cut paper
    ]
  },
  callback: 'printCallback'
};

socket.send(JSON.stringify(printJob));
```

## Development

### Prerequisites

```bash
# Install Node.js 18+
curl -fsSL https://nodejs.org/dist/v18.19.0/node-v18.19.0-linux-x64.tar.xz | tar -xJ

# Install dependencies
npm install
```

### Development Mode

```bash
# Start in development mode
npm run dev

# Build for all platforms
npm run build

# Build for specific platform
npm run build:win
npm run build:linux
npm run build:mac
```

### Project Structure

```
printer-master-electron/
├── main.js                 # Electron main process
├── preload.js             # Preload script for security
├── service.js             # Service management script
├── package.json           # Project configuration
├── src/
│   ├── backend/           # Core business logic
│   │   ├── websocket-server.js    # QZ-Tray compatible API
│   │   ├── printer-manager.js     # Printer operations
│   │   ├── discovery.js           # Printer discovery
│   │   ├── config.js              # Configuration management
│   │   └── restaurant-integration.js # Backend integration
│   ├── renderer/          # Frontend UI
│   │   ├── index.html     # Main dashboard
│   │   ├── styles.css     # UI styling
│   │   └── renderer.js    # Frontend logic
│   └── utils/             # Utility modules
│       ├── escpos.js      # ESC/POS command builder
│       └── logger.js      # Logging system
├── assets/                # Application icons
├── build/                 # Build configuration
└── dist/                  # Built applications
```

## Deployment

### Mass Deployment (Windows)

1. **Create MSI Package**:
   ```bash
   npm run build:win
   ```

2. **Deploy via Group Policy**:
   - Use `dist/PrinterMaster.msi` for silent installation
   - Configure via registry or config files

3. **Service Auto-Installation**:
   - Services are installed automatically during setup
   - No manual configuration required

### Docker Deployment (Linux)

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
EXPOSE 9012

CMD ["node", "main.js", "--service"]
```

### Restaurant Backend Integration

Configure each branch with unique settings:

```json
{
  "restaurant": {
    "enabled": true,
    "backendUrl": "https://restaurant-backend.com",
    "branchId": "branch-001",
    "apiKey": "your-api-key"
  }
}
```

Backend receives:
- Printer status updates
- Print job confirmations
- Health monitoring data
- Remote command execution

## Monitoring & Maintenance

### Logs

PrinterMaster creates detailed logs:
- **Application Log**: General application events
- **Print Jobs Log**: All print operations with audit trail
- **Error Log**: Errors and exceptions
- **System Log**: Service and system integration events

### Health Checks

```bash
# Check service status
node service.js status

# View recent logs
tail -f ~/.printermaster/logs/printermaster-2024-01-01.log

# Monitor print queue
curl http://localhost:9012/status
```

### Performance Monitoring

- **Memory Usage**: Monitored and logged automatically
- **Print Queue**: Real-time queue status in dashboard
- **Connection Health**: WebSocket and restaurant backend status
- **Printer Status**: Continuous monitoring of all printers

## Troubleshooting

### Common Issues

1. **Printer Not Found**:
   - Check USB connections and drivers
   - Verify network printer IP and port 9100
   - Run printer discovery from dashboard

2. **WebSocket Connection Failed**:
   - Verify port 9012 is not in use
   - Check firewall settings
   - Restart PrinterMaster service

3. **Service Won't Start**:
   - Check permissions (Administrator/Root required)
   - Verify Node.js installation
   - Review error logs

### Support

For technical support:
1. Check the logs in `~/.printermaster/logs/`
2. Export configuration from settings panel
3. Run built-in diagnostics from dashboard
4. Contact support with log files and system information

## Migration from QZ-Tray

PrinterMaster is designed for seamless migration:

1. **Install PrinterMaster** alongside QZ-Tray initially
2. **Update POS systems** to use port 9012 (or configure custom port)
3. **Test all printing functions** thoroughly
4. **Uninstall QZ-Tray** once migration is complete

No code changes required - PrinterMaster implements the same API.

## Security

### Security Features
- **No Remote Code Execution**: Sandboxed printing operations
- **Encrypted Communication**: TLS support for backend connections
- **Input Validation**: All print data is validated
- **Service Isolation**: Runs as dedicated service user
- **Audit Logging**: Complete audit trail of all operations

### Network Security
- **Firewall Integration**: Automatic firewall rule creation
- **Port Restrictions**: Only necessary ports are opened
- **Origin Validation**: WebSocket origin checking
- **Rate Limiting**: Built-in DoS protection

## License

MIT License - see LICENSE file for details.

## Version History

### v2.0.0 (Current)
- Complete QZ-Tray replacement
- Enterprise deployment features
- Restaurant backend integration
- Modern Electron-based architecture

### v1.x.x (Legacy)
- Basic printer management
- Limited QZ-Tray compatibility

## Support

- **Documentation**: Full API documentation available
- **Community**: GitHub issues and discussions
- **Enterprise Support**: Available for restaurant chains
- **Training**: On-site installation and training available

---

**PrinterMaster v2.0.0** - Transforming restaurant printer management with enterprise-grade reliability and modern architecture.