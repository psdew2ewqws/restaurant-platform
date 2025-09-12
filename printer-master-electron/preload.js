const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Configuration management
  getConfig: (key, defaultValue) => ipcRenderer.invoke('get-config', key, defaultValue),
  setConfig: (key, value) => ipcRenderer.invoke('set-config', key, value),
  
  // Printer management
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  discoverPrinters: () => ipcRenderer.invoke('discover-printers'),
  testPrinter: (printerId) => ipcRenderer.invoke('test-printer', printerId),
  printReceipt: (printerId, receiptData) => ipcRenderer.invoke('print-receipt', printerId, receiptData),
  
  // WebSocket management
  getWebSocketStatus: () => ipcRenderer.invoke('get-websocket-status'),
  restartWebSocket: () => ipcRenderer.invoke('restart-websocket'),
  
  // Restaurant integration
  getRestaurantStatus: () => ipcRenderer.invoke('get-restaurant-status'),
  
  // Utility functions
  showLogs: () => ipcRenderer.invoke('show-logs'),
  exportConfig: () => ipcRenderer.invoke('export-config'),
  importConfig: () => ipcRenderer.invoke('import-config'),
  
  // Event listeners
  onPrintersUpdated: (callback) => ipcRenderer.on('printers-updated', callback),
  onWebSocketRestarted: (callback) => ipcRenderer.on('websocket-restarted', callback),
  onNavigateTo: (callback) => ipcRenderer.on('navigate-to', callback),
  
  // Remove event listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  
  // System info
  platform: process.platform,
  arch: process.arch,
  versions: process.versions
});

// Expose version info
contextBridge.exposeInMainWorld('printerMaster', {
  version: '2.0.0',
  name: 'PrinterMaster',
  description: 'Enterprise Printer Management for Restaurant POS',
  author: 'Restaurant Platform',
  license: 'MIT'
});

// Console API for debugging (only in development)
if (process.env.NODE_ENV === 'development' || process.argv.includes('--dev')) {
  contextBridge.exposeInMainWorld('debug', {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info
  });
}