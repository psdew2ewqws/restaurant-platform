#!/usr/bin/env node

const os = require('os');
const path = require('path');
const fs = require('fs');

class ServiceManager {
  constructor() {
    this.platform = os.platform();
    this.serviceName = 'PrinterMaster';
    this.serviceDisplayName = 'PrinterMaster - Restaurant Printer Management';
    this.serviceDescription = 'Enterprise Printer Management System for Restaurant POS';
    this.appPath = path.resolve(__dirname, 'main.js');
    this.nodePath = process.execPath;
  }

  async install() {
    console.log(`Installing ${this.serviceName} service...`);
    
    try {
      switch (this.platform) {
        case 'win32':
          await this.installWindowsService();
          break;
        case 'linux':
          await this.installLinuxService();
          break;
        case 'darwin':
          await this.installMacOSService();
          break;
        default:
          throw new Error(`Unsupported platform: ${this.platform}`);
      }
      
      console.log(`${this.serviceName} service installed successfully`);
    } catch (error) {
      console.error('Failed to install service:', error.message);
      process.exit(1);
    }
  }

  async uninstall() {
    console.log(`Uninstalling ${this.serviceName} service...`);
    
    try {
      switch (this.platform) {
        case 'win32':
          await this.uninstallWindowsService();
          break;
        case 'linux':
          await this.uninstallLinuxService();
          break;
        case 'darwin':
          await this.uninstallMacOSService();
          break;
        default:
          throw new Error(`Unsupported platform: ${this.platform}`);
      }
      
      console.log(`${this.serviceName} service uninstalled successfully`);
    } catch (error) {
      console.error('Failed to uninstall service:', error.message);
      process.exit(1);
    }
  }

  async start() {
    console.log(`Starting ${this.serviceName} service...`);
    
    try {
      switch (this.platform) {
        case 'win32':
          await this.startWindowsService();
          break;
        case 'linux':
          await this.startLinuxService();
          break;
        case 'darwin':
          await this.startMacOSService();
          break;
        default:
          throw new Error(`Unsupported platform: ${this.platform}`);
      }
      
      console.log(`${this.serviceName} service started successfully`);
    } catch (error) {
      console.error('Failed to start service:', error.message);
      process.exit(1);
    }
  }

  async stop() {
    console.log(`Stopping ${this.serviceName} service...`);
    
    try {
      switch (this.platform) {
        case 'win32':
          await this.stopWindowsService();
          break;
        case 'linux':
          await this.stopLinuxService();
          break;
        case 'darwin':
          await this.stopMacOSService();
          break;
        default:
          throw new Error(`Unsupported platform: ${this.platform}`);
      }
      
      console.log(`${this.serviceName} service stopped successfully`);
    } catch (error) {
      console.error('Failed to stop service:', error.message);
      process.exit(1);
    }
  }

  async status() {
    try {
      switch (this.platform) {
        case 'win32':
          await this.getWindowsServiceStatus();
          break;
        case 'linux':
          await this.getLinuxServiceStatus();
          break;
        case 'darwin':
          await this.getMacOSServiceStatus();
          break;
        default:
          throw new Error(`Unsupported platform: ${this.platform}`);
      }
    } catch (error) {
      console.error('Failed to get service status:', error.message);
      process.exit(1);
    }
  }

  // Windows Service Management
  async installWindowsService() {
    const nodeWindows = require('node-windows');
    const Service = nodeWindows.Service;

    const svc = new Service({
      name: this.serviceName,
      description: this.serviceDescription,
      script: this.appPath,
      nodeOptions: [
        '--max_old_space_size=4096'
      ],
      env: {
        name: 'NODE_ENV',
        value: 'production'
      },
      wait: 2,
      grow: 0.5,
      maxRestarts: 5
    });

    return new Promise((resolve, reject) => {
      svc.on('install', () => {
        console.log('Windows service installed');
        svc.start();
        resolve();
      });

      svc.on('error', (error) => {
        reject(error);
      });

      svc.install();
    });
  }

  async uninstallWindowsService() {
    const nodeWindows = require('node-windows');
    const Service = nodeWindows.Service;

    const svc = new Service({
      name: this.serviceName,
      script: this.appPath
    });

    return new Promise((resolve, reject) => {
      svc.on('uninstall', () => {
        console.log('Windows service uninstalled');
        resolve();
      });

      svc.on('error', (error) => {
        reject(error);
      });

      svc.uninstall();
    });
  }

  async startWindowsService() {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    await execAsync(`net start "${this.serviceName}"`);
  }

  async stopWindowsService() {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    await execAsync(`net stop "${this.serviceName}"`);
  }

  async getWindowsServiceStatus() {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    try {
      const { stdout } = await execAsync(`sc query "${this.serviceName}"`);
      console.log(stdout);
    } catch (error) {
      if (error.message.includes('does not exist')) {
        console.log(`${this.serviceName} service is not installed`);
      } else {
        throw error;
      }
    }
  }

  // Linux Service Management (systemd)
  async installLinuxService() {
    const serviceContent = this.generateSystemdService();
    const servicePath = `/etc/systemd/system/${this.serviceName.toLowerCase()}.service`;

    // Write service file
    fs.writeFileSync(servicePath, serviceContent);

    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    // Reload systemd and enable service
    await execAsync('systemctl daemon-reload');
    await execAsync(`systemctl enable ${this.serviceName.toLowerCase()}`);
    
    console.log(`Linux service installed at ${servicePath}`);
  }

  async uninstallLinuxService() {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    const serviceName = this.serviceName.toLowerCase();
    const servicePath = `/etc/systemd/system/${serviceName}.service`;

    try {
      // Stop and disable service
      await execAsync(`systemctl stop ${serviceName}`);
      await execAsync(`systemctl disable ${serviceName}`);

      // Remove service file
      if (fs.existsSync(servicePath)) {
        fs.unlinkSync(servicePath);
      }

      // Reload systemd
      await execAsync('systemctl daemon-reload');
      
      console.log('Linux service uninstalled');
    } catch (error) {
      // Service might not exist, continue with cleanup
      console.warn('Service cleanup warning:', error.message);
    }
  }

  async startLinuxService() {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    await execAsync(`systemctl start ${this.serviceName.toLowerCase()}`);
  }

  async stopLinuxService() {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    await execAsync(`systemctl stop ${this.serviceName.toLowerCase()}`);
  }

  async getLinuxServiceStatus() {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    try {
      const { stdout } = await execAsync(`systemctl status ${this.serviceName.toLowerCase()}`);
      console.log(stdout);
    } catch (error) {
      console.log(`${this.serviceName} service status:`, error.message);
    }
  }

  generateSystemdService() {
    const user = process.env.SUDO_USER || process.env.USER || 'root';
    const workingDirectory = path.dirname(this.appPath);

    return `[Unit]
Description=${this.serviceDescription}
After=network.target
Wants=network.target

[Service]
Type=simple
User=${user}
WorkingDirectory=${workingDirectory}
Environment=NODE_ENV=production
Environment=PATH=/usr/bin:/usr/local/bin
ExecStart=${this.nodePath} ${this.appPath} --service
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=${this.serviceName.toLowerCase()}

# Resource limits
LimitNOFILE=65536
MemoryMax=1G

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectHome=true
ProtectSystem=strict
ReadWritePaths=${workingDirectory}
ReadWritePaths=/home/${user}/.printermaster

[Install]
WantedBy=multi-user.target`;
  }

  // macOS Service Management (launchd)
  async installMacOSService() {
    const plistContent = this.generateLaunchdPlist();
    const plistPath = `/Library/LaunchDaemons/com.restaurant-platform.${this.serviceName.toLowerCase()}.plist`;

    // Write plist file
    fs.writeFileSync(plistPath, plistContent);

    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    // Load the service
    await execAsync(`launchctl load ${plistPath}`);
    
    console.log(`macOS service installed at ${plistPath}`);
  }

  async uninstallMacOSService() {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    const plistPath = `/Library/LaunchDaemons/com.restaurant-platform.${this.serviceName.toLowerCase()}.plist`;

    try {
      // Unload the service
      await execAsync(`launchctl unload ${plistPath}`);

      // Remove plist file
      if (fs.existsSync(plistPath)) {
        fs.unlinkSync(plistPath);
      }
      
      console.log('macOS service uninstalled');
    } catch (error) {
      console.warn('Service cleanup warning:', error.message);
    }
  }

  async startMacOSService() {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    const serviceName = `com.restaurant-platform.${this.serviceName.toLowerCase()}`;
    await execAsync(`launchctl start ${serviceName}`);
  }

  async stopMacOSService() {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    const serviceName = `com.restaurant-platform.${this.serviceName.toLowerCase()}`;
    await execAsync(`launchctl stop ${serviceName}`);
  }

  async getMacOSServiceStatus() {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    const serviceName = `com.restaurant-platform.${this.serviceName.toLowerCase()}`;
    
    try {
      const { stdout } = await execAsync(`launchctl list ${serviceName}`);
      console.log(stdout);
    } catch (error) {
      console.log(`${this.serviceName} service is not running or not installed`);
    }
  }

  generateLaunchdPlist() {
    const workingDirectory = path.dirname(this.appPath);

    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.restaurant-platform.${this.serviceName.toLowerCase()}</string>
  
  <key>ProgramArguments</key>
  <array>
    <string>${this.nodePath}</string>
    <string>${this.appPath}</string>
    <string>--service</string>
  </array>
  
  <key>WorkingDirectory</key>
  <string>${workingDirectory}</string>
  
  <key>EnvironmentVariables</key>
  <dict>
    <key>NODE_ENV</key>
    <string>production</string>
  </dict>
  
  <key>RunAtLoad</key>
  <true/>
  
  <key>KeepAlive</key>
  <true/>
  
  <key>StandardOutPath</key>
  <string>/var/log/${this.serviceName.toLowerCase()}.log</string>
  
  <key>StandardErrorPath</key>
  <string>/var/log/${this.serviceName.toLowerCase()}.error.log</string>
</dict>
</plist>`;
  }

  // Utility methods
  async checkPermissions() {
    if (this.platform === 'win32') {
      // Check if running as administrator on Windows
      try {
        const { exec } = require('child_process');
        const { promisify } = require('util');
        const execAsync = promisify(exec);
        
        await execAsync('net session', { windowsHide: true });
      } catch (error) {
        throw new Error('Administrator privileges required. Please run as administrator.');
      }
    } else {
      // Check if running as root on Unix-like systems
      if (process.getuid && process.getuid() !== 0) {
        throw new Error('Root privileges required. Please run with sudo.');
      }
    }
  }

  printUsage() {
    console.log(`
Usage: node service.js <command>

Commands:
  install   - Install ${this.serviceName} as a system service
  uninstall - Uninstall the ${this.serviceName} service
  start     - Start the ${this.serviceName} service
  stop      - Stop the ${this.serviceName} service
  status    - Show service status
  restart   - Restart the ${this.serviceName} service

Examples:
  node service.js install
  sudo node service.js install   (Linux/macOS)
  
Platform: ${this.platform}
Service Name: ${this.serviceName}
`);
  }
}

// CLI Interface
async function main() {
  const serviceManager = new ServiceManager();
  const command = process.argv[2];

  if (!command) {
    serviceManager.printUsage();
    process.exit(0);
  }

  // Check permissions for privileged operations
  if (['install', 'uninstall', 'start', 'stop'].includes(command)) {
    try {
      await serviceManager.checkPermissions();
    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
  }

  try {
    switch (command.toLowerCase()) {
      case 'install':
        await serviceManager.install();
        break;
        
      case 'uninstall':
        await serviceManager.uninstall();
        break;
        
      case 'start':
        await serviceManager.start();
        break;
        
      case 'stop':
        await serviceManager.stop();
        break;
        
      case 'restart':
        await serviceManager.stop();
        await new Promise(resolve => setTimeout(resolve, 2000));
        await serviceManager.start();
        break;
        
      case 'status':
        await serviceManager.status();
        break;
        
      default:
        console.error(`Unknown command: ${command}`);
        serviceManager.printUsage();
        process.exit(1);
    }
  } catch (error) {
    console.error('Service operation failed:', error.message);
    process.exit(1);
  }
}

// Run CLI if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = ServiceManager;