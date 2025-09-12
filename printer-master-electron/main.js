const { app, BrowserWindow, Tray, Menu, ipcMain, dialog, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const windowState = require('electron-window-state');
const contextMenu = require('electron-context-menu');
const Store = require('electron-store');
const path = require('path');
const os = require('os');
const fs = require('fs');

// Import backend services
const WebSocketServer = require('./src/backend/websocket-server');
const PrinterManager = require('./src/backend/printer-manager');
const ConfigManager = require('./src/backend/config');
const Logger = require('./src/utils/logger');
const RestaurantIntegration = require('./src/backend/restaurant-integration');

// Initialize services
const logger = new Logger();
const config = new ConfigManager();
const store = new Store();
const printerManager = new PrinterManager(logger, config);
const restaurantIntegration = new RestaurantIntegration(config, logger);

// Global variables
let mainWindow = null;
let tray = null;
let wsServer = null;
let isQuitting = false;
let isDev = false;

// Check if running in development mode
isDev = process.argv.includes('--dev') || !app.isPackaged;

// Configure auto-updater
if (!isDev) {
  autoUpdater.checkForUpdatesAndNotify();
  
  autoUpdater.on('update-available', () => {
    logger.info('Update available, downloading...');
  });
  
  autoUpdater.on('update-downloaded', () => {
    logger.info('Update downloaded, will install on restart');
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Ready',
      message: 'Update downloaded. The application will restart to apply the update.',
      buttons: ['Restart Now', 'Later']
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });
}

// Configure context menu
contextMenu({
  showCopyImageAddress: false,
  showSaveImageAs: false,
  showInspectElement: isDev,
  showServices: false
});

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  logger.warn('Another instance is already running');
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, focus our window instead
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// App event handlers
app.whenReady().then(async () => {
  logger.info('PrinterMaster starting up...');
  
  // Load configuration
  await config.initialize();
  
  // Start backend services
  await startBackendServices();
  
  // Create main window
  createMainWindow();
  
  // Create system tray
  createTray();
  
  // Start restaurant integration
  if (config.get('restaurant.enabled', true)) {
    await restaurantIntegration.start();
  }
  
  logger.info('PrinterMaster started successfully');
});

app.on('window-all-closed', (event) => {
  // On macOS, keep app running in dock
  if (process.platform !== 'darwin') {
    if (!isQuitting) {
      event.preventDefault();
      return false;
    }
  }
});

app.on('activate', () => {
  // On macOS, re-create window when dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.on('before-quit', (event) => {
  if (!isQuitting) {
    event.preventDefault();
    performGracefulShutdown();
  }
});

// Create main application window
function createMainWindow() {
  // Load window state
  let mainWindowState = windowState({
    defaultWidth: 1200,
    defaultHeight: 800
  });

  // Create the browser window
  mainWindow = new BrowserWindow({
    'x': mainWindowState.x,
    'y': mainWindowState.y,
    'width': mainWindowState.width,
    'height': mainWindowState.height,
    minWidth: 800,
    minHeight: 600,
    title: 'PrinterMaster - Restaurant Printer Management',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    show: false, // Don't show until ready
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: !isDev
    }
  });

  // Manage window state
  mainWindowState.manage(mainWindow);

  // Load the app
  mainWindow.loadFile(path.join(__dirname, 'src', 'renderer', 'index.html'));

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Open DevTools in development
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window events
  mainWindow.on('minimize', (event) => {
    if (config.get('ui.minimizeToTray', true)) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('close', (event) => {
    if (!isQuitting && config.get('ui.closeToTray', true)) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// Create system tray
function createTray() {
  const trayIconPath = path.join(__dirname, 'assets', 'tray-icon.png');
  
  // Check if tray icon exists
  if (!fs.existsSync(trayIconPath)) {
    logger.warn('Tray icon not found, skipping tray creation');
    return;
  }
  
  tray = new Tray(trayIconPath);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show PrinterMaster',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        } else {
          createMainWindow();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Printer Status',
      click: async () => {
        const printers = await printerManager.getAllPrinters();
        const onlinePrinters = printers.filter(p => p.status === 'online').length;
        const totalPrinters = printers.length;
        
        dialog.showMessageBox(mainWindow, {
          type: 'info',
          title: 'Printer Status',
          message: `${onlinePrinters} of ${totalPrinters} printers online`,
          detail: printers.map(p => `${p.name}: ${p.status}`).join('\\n')
        });
      }
    },
    {
      label: 'Refresh Printers',
      click: async () => {
        await printerManager.discoverPrinters();
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('printers-updated');
        }
      }
    },
    { type: 'separator' },
    {
      label: 'WebSocket Server',
      submenu: [
        {
          label: wsServer && wsServer.isRunning() ? 'Running ✓' : 'Stopped ✗',
          enabled: false
        },
        {
          label: `Port: ${config.get('websocket.port', 9012)}`,
          enabled: false
        },
        { type: 'separator' },
        {
          label: 'Restart Server',
          click: async () => {
            await restartWebSocketServer();
          }
        }
      ]
    },
    { type: 'separator' },
    {
      label: 'Settings',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
          mainWindow.webContents.send('navigate-to', 'settings');
        }
      }
    },
    {
      label: 'View Logs',
      click: () => {
        const logPath = logger.getLogPath();
        shell.showItemInFolder(logPath);
      }
    },
    { type: 'separator' },
    {
      label: 'Quit PrinterMaster',
      click: () => {
        performGracefulShutdown();
      }
    }
  ]);

  tray.setToolTip('PrinterMaster - Restaurant Printer Management');
  tray.setContextMenu(contextMenu);
  
  // Handle tray click
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    } else {
      createMainWindow();
    }
  });
}

// Start backend services
async function startBackendServices() {
  try {
    logger.info('Starting backend services...');
    
    // Initialize printer manager
    await printerManager.initialize();
    
    // Start WebSocket server
    wsServer = new WebSocketServer(printerManager, config, logger);
    await wsServer.start();
    
    logger.info('Backend services started successfully');
  } catch (error) {
    logger.error('Failed to start backend services:', error);
    
    dialog.showErrorBox('Startup Error', 
      `Failed to start PrinterMaster services:\\n${error.message}`);
    
    app.quit();
  }
}

// Restart WebSocket server
async function restartWebSocketServer() {
  try {
    logger.info('Restarting WebSocket server...');
    
    if (wsServer) {
      await wsServer.stop();
    }
    
    wsServer = new WebSocketServer(printerManager, config, logger);
    await wsServer.start();
    
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('websocket-restarted');
    }
    
    logger.info('WebSocket server restarted successfully');
  } catch (error) {
    logger.error('Failed to restart WebSocket server:', error);
  }
}

// Graceful shutdown
async function performGracefulShutdown() {
  if (isQuitting) return;
  
  logger.info('Performing graceful shutdown...');
  isQuitting = true;
  
  try {
    // Stop restaurant integration
    if (restaurantIntegration) {
      await restaurantIntegration.stop();
    }
    
    // Stop WebSocket server
    if (wsServer) {
      await wsServer.stop();
    }
    
    // Close printer manager
    if (printerManager) {
      await printerManager.close();
    }
    
    // Close logger
    if (logger) {
      logger.info('PrinterMaster shutdown completed');
      await logger.close();
    }
    
  } catch (error) {
    console.error('Error during shutdown:', error);
  } finally {
    app.quit();
  }
}

// IPC handlers
ipcMain.handle('get-config', (event, key, defaultValue) => {
  return config.get(key, defaultValue);
});

ipcMain.handle('set-config', (event, key, value) => {
  return config.set(key, value);
});

ipcMain.handle('get-printers', async () => {
  return await printerManager.getAllPrinters();
});

ipcMain.handle('discover-printers', async () => {
  return await printerManager.discoverPrinters();
});

ipcMain.handle('test-printer', async (event, printerId) => {
  return await printerManager.testPrint(printerId);
});

ipcMain.handle('print-receipt', async (event, printerId, receiptData) => {
  return await printerManager.printReceipt(printerId, receiptData);
});

ipcMain.handle('get-websocket-status', () => {
  return {
    running: wsServer ? wsServer.isRunning() : false,
    port: config.get('websocket.port', 9012),
    connections: wsServer ? wsServer.getConnectionCount() : 0
  };
});

ipcMain.handle('restart-websocket', async () => {
  await restartWebSocketServer();
  return true;
});

ipcMain.handle('get-restaurant-status', () => {
  return restaurantIntegration.getStatus();
});

ipcMain.handle('show-logs', () => {
  const logPath = logger.getLogPath();
  shell.showItemInFolder(logPath);
});

ipcMain.handle('export-config', async () => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Export Configuration',
    defaultPath: `printermaster-config-${new Date().toISOString().split('T')[0]}.json`,
    filters: [
      { name: 'JSON Files', extensions: ['json'] }
    ]
  });
  
  if (!result.canceled) {
    try {
      const configData = config.getAll();
      fs.writeFileSync(result.filePath, JSON.stringify(configData, null, 2));
      return { success: true, path: result.filePath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  return { success: false, error: 'Export cancelled' };
});

ipcMain.handle('import-config', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Import Configuration',
    filters: [
      { name: 'JSON Files', extensions: ['json'] }
    ],
    properties: ['openFile']
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    try {
      const configData = JSON.parse(fs.readFileSync(result.filePaths[0], 'utf8'));
      config.setAll(configData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  return { success: false, error: 'Import cancelled' };
});

// Handle app events for service mode
if (process.argv.includes('--service')) {
  logger.info('Running in service mode');
  
  // Hide from taskbar in service mode
  app.on('ready', () => {
    if (mainWindow) {
      mainWindow.setSkipTaskbar(true);
    }
  });
}

// Error handling
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = { app, mainWindow, tray };