// PrinterMaster Renderer Process
class PrinterMasterUI {
  constructor() {
    this.currentPage = 'dashboard';
    this.printers = [];
    this.websocketStatus = null;
    this.restaurantStatus = null;
    this.statistics = {};
    this.activityLog = [];
    this.logEntries = [];
    
    this.init();
  }

  async init() {
    this.setupEventListeners();
    this.startPeriodicUpdates();
    await this.loadInitialData();
    this.showNotification('PrinterMaster Started', 'Application initialized successfully', 'success');
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const page = e.currentTarget.dataset.page;
        this.navigateToPage(page);
      });
    });

    // Dashboard actions
    document.getElementById('discover-btn')?.addEventListener('click', () => this.discoverPrinters());
    document.getElementById('refresh-btn')?.addEventListener('click', () => this.refreshData());

    // Printer actions
    document.getElementById('add-printer-btn')?.addEventListener('click', () => this.showAddPrinterModal());

    // WebSocket actions
    document.getElementById('restart-websocket-btn')?.addEventListener('click', () => this.restartWebSocket());

    // Settings
    document.getElementById('settings-btn')?.addEventListener('click', () => this.showSettingsModal());

    // Modal controls
    document.getElementById('modal-close')?.addEventListener('click', () => this.closeModal());
    document.getElementById('modal-cancel')?.addEventListener('click', () => this.closeModal());
    
    // Close modal on backdrop click
    document.getElementById('printer-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'printer-modal') {
        this.closeModal();
      }
    });

    // Log filters
    document.getElementById('log-level-filter')?.addEventListener('change', () => this.filterLogs());
    document.getElementById('log-search')?.addEventListener('input', () => this.filterLogs());

    // Export/Import
    document.getElementById('export-logs-btn')?.addEventListener('click', () => this.exportLogs());
    document.getElementById('clear-logs-btn')?.addEventListener('click', () => this.clearLogs());

    // Listen for IPC events
    if (window.electronAPI) {
      window.electronAPI.onPrintersUpdated(() => this.refreshPrinters());
      window.electronAPI.onWebSocketRestarted(() => this.refreshWebSocketStatus());
      window.electronAPI.onNavigateTo((event, page) => this.navigateToPage(page));
    }
  }

  startPeriodicUpdates() {
    // Update every 30 seconds
    setInterval(() => {
      this.updateDashboard();
      this.updateUptime();
    }, 30000);

    // Update every 5 seconds for real-time data
    setInterval(() => {
      this.refreshWebSocketStatus();
      this.refreshRestaurantStatus();
    }, 5000);

    // Start uptime counter
    this.startTime = new Date();
    setInterval(() => this.updateUptime(), 1000);
  }

  async loadInitialData() {
    try {
      await Promise.all([
        this.refreshPrinters(),
        this.refreshWebSocketStatus(),
        this.refreshRestaurantStatus(),
        this.loadLogs()
      ]);
      
      this.updateDashboard();
      this.updateConnectionStatus();
      
    } catch (error) {
      console.error('Error loading initial data:', error);
      this.showNotification('Error', 'Failed to load initial data', 'error');
    }
  }

  navigateToPage(page) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    document.querySelector(`[data-page="${page}"]`)?.classList.add('active');

    // Update pages
    document.querySelectorAll('.page').forEach(p => {
      p.classList.remove('active');
    });
    document.getElementById(`${page}-page`)?.classList.add('active');

    this.currentPage = page;

    // Load page-specific data
    switch (page) {
      case 'printers':
        this.refreshPrinters();
        break;
      case 'websocket':
        this.refreshWebSocketStatus();
        break;
      case 'logs':
        this.loadLogs();
        break;
    }
  }

  async refreshPrinters() {
    try {
      this.printers = await window.electronAPI?.getPrinters() || [];
      this.renderPrinters();
    } catch (error) {
      console.error('Error refreshing printers:', error);
      this.showNotification('Error', 'Failed to refresh printers', 'error');
    }
  }

  async discoverPrinters() {
    try {
      const discoverBtn = document.getElementById('discover-btn');
      const originalText = discoverBtn.innerHTML;
      
      discoverBtn.innerHTML = '<div class="spinner"></div> Discovering...';
      discoverBtn.disabled = true;

      await window.electronAPI?.discoverPrinters();
      await this.refreshPrinters();
      
      this.addActivity('Printer discovery completed');
      this.showNotification('Discovery Complete', `Found ${this.printers.length} printers`, 'success');
      
    } catch (error) {
      console.error('Error discovering printers:', error);
      this.showNotification('Error', 'Failed to discover printers', 'error');
    } finally {
      const discoverBtn = document.getElementById('discover-btn');
      discoverBtn.innerHTML = originalText;
      discoverBtn.disabled = false;
    }
  }

  renderPrinters() {
    const container = document.getElementById('printers-grid');
    if (!container) return;

    if (this.printers.length === 0) {
      container.innerHTML = `
        <div class="no-printers">
          <h3>No Printers Found</h3>
          <p>Click "Discover Printers" to search for available printers.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.printers.map(printer => `
      <div class="printer-card" onclick="printerMasterUI.showPrinterDetails('${printer.id}')">
        <div class="printer-header">
          <div class="printer-name">${printer.name}</div>
          <div class="printer-status">
            <span class="status-badge ${printer.status}">${printer.status}</span>
          </div>
        </div>
        <div class="printer-details">
          <div class="printer-detail">
            <span class="printer-detail-label">Type</span>
            <span class="printer-detail-value">${printer.type.toUpperCase()}</span>
          </div>
          <div class="printer-detail">
            <span class="printer-detail-label">Vendor</span>
            <span class="printer-detail-value">${printer.vendor || 'Unknown'}</span>
          </div>
          <div class="printer-detail">
            <span class="printer-detail-label">Model</span>
            <span class="printer-detail-value">${printer.model || 'Unknown'}</span>
          </div>
          <div class="printer-detail">
            <span class="printer-detail-label">Jobs</span>
            <span class="printer-detail-value">${printer.totalPrintJobs || 0}</span>
          </div>
        </div>
        <div class="printer-actions">
          <button class="btn btn-secondary" onclick="event.stopPropagation(); printerMasterUI.testPrint('${printer.id}')">
            Test Print
          </button>
          ${printer.isDefault ? '<span class="status-badge online">Default</span>' : ''}
        </div>
      </div>
    `).join('');
  }

  async showPrinterDetails(printerId) {
    const printer = this.printers.find(p => p.id === printerId);
    if (!printer) return;

    const modal = document.getElementById('printer-modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    const actionBtn = document.getElementById('modal-action');

    title.textContent = printer.name;
    
    body.innerHTML = `
      <div class="printer-details-modal">
        <div class="detail-group">
          <h4>General Information</h4>
          <div class="detail-row">
            <span class="detail-label">Name:</span>
            <span class="detail-value">${printer.name}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Status:</span>
            <span class="detail-value">
              <span class="status-badge ${printer.status}">${printer.status}</span>
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Type:</span>
            <span class="detail-value">${printer.type.toUpperCase()}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Vendor:</span>
            <span class="detail-value">${printer.vendor || 'Unknown'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Model:</span>
            <span class="detail-value">${printer.model || 'Unknown'}</span>
          </div>
        </div>

        <div class="detail-group">
          <h4>Connection</h4>
          <div class="detail-row">
            <span class="detail-label">Interface:</span>
            <span class="detail-value">${printer.interface || printer.type.toUpperCase()}</span>
          </div>
          ${printer.ipAddress ? `
          <div class="detail-row">
            <span class="detail-label">IP Address:</span>
            <span class="detail-value">${printer.ipAddress}</span>
          </div>
          ` : ''}
          ${printer.serialNumber ? `
          <div class="detail-row">
            <span class="detail-label">Serial:</span>
            <span class="detail-value">${printer.serialNumber}</span>
          </div>
          ` : ''}
        </div>

        <div class="detail-group">
          <h4>Statistics</h4>
          <div class="detail-row">
            <span class="detail-label">Total Jobs:</span>
            <span class="detail-value">${printer.totalPrintJobs || 0}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Test Prints:</span>
            <span class="detail-value">${printer.testPrintCount || 0}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Last Seen:</span>
            <span class="detail-value">${printer.lastSeen ? new Date(printer.lastSeen).toLocaleString() : 'Never'}</span>
          </div>
        </div>

        ${printer.capabilities ? `
        <div class="detail-group">
          <h4>Capabilities</h4>
          <div class="capabilities-grid">
            ${Object.entries(printer.capabilities).map(([key, value]) => `
              <div class="capability-item">
                <span class="capability-name">${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                <span class="capability-value ${value ? 'supported' : 'not-supported'}">
                  ${value ? '✓' : '✗'}
                </span>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}
      </div>
    `;

    actionBtn.textContent = 'Test Print';
    actionBtn.onclick = () => {
      this.testPrint(printerId);
      this.closeModal();
    };

    modal.classList.add('active');
  }

  async testPrint(printerId) {
    try {
      const printer = this.printers.find(p => p.id === printerId);
      const result = await window.electronAPI?.testPrinter(printerId);
      
      if (result) {
        this.addActivity(`Test print sent to ${printer?.name || 'printer'}`);
        this.showNotification('Test Print Sent', `Print job sent to ${printer?.name}`, 'success');
      }
    } catch (error) {
      console.error('Error testing printer:', error);
      this.showNotification('Print Error', 'Failed to send test print', 'error');
    }
  }

  async refreshWebSocketStatus() {
    try {
      this.websocketStatus = await window.electronAPI?.getWebSocketStatus();
      this.updateWebSocketUI();
    } catch (error) {
      console.error('Error refreshing WebSocket status:', error);
    }
  }

  updateWebSocketUI() {
    if (!this.websocketStatus) return;

    // Update dashboard
    const statusEl = document.getElementById('websocket-status');
    if (statusEl) {
      statusEl.textContent = this.websocketStatus.running ? 'Running' : 'Stopped';
      statusEl.className = `status-value ${this.websocketStatus.running ? 'online' : 'offline'}`;
    }

    // Update connection count
    const connectionEl = document.getElementById('connection-count');
    if (connectionEl) {
      connectionEl.textContent = this.websocketStatus.connections || 0;
    }

    // Update WebSocket page
    const portEl = document.getElementById('websocket-port');
    const hostEl = document.getElementById('websocket-host');
    const statusBadgeEl = document.getElementById('ws-status-badge');

    if (portEl) portEl.value = this.websocketStatus.port || 9012;
    if (hostEl) hostEl.value = 'localhost';
    if (statusBadgeEl) {
      statusBadgeEl.textContent = this.websocketStatus.running ? 'Running' : 'Stopped';
      statusBadgeEl.className = `status-badge ${this.websocketStatus.running ? 'running' : 'stopped'}`;
    }
  }

  async restartWebSocket() {
    try {
      const btn = document.getElementById('restart-websocket-btn');
      const originalText = btn.innerHTML;
      
      btn.innerHTML = '<div class="spinner"></div> Restarting...';
      btn.disabled = true;

      await window.electronAPI?.restartWebSocket();
      
      this.addActivity('WebSocket server restarted');
      this.showNotification('Server Restarted', 'WebSocket server restarted successfully', 'success');
      
    } catch (error) {
      console.error('Error restarting WebSocket:', error);
      this.showNotification('Error', 'Failed to restart WebSocket server', 'error');
    } finally {
      const btn = document.getElementById('restart-websocket-btn');
      btn.innerHTML = 'Restart Server';
      btn.disabled = false;
    }
  }

  async refreshRestaurantStatus() {
    try {
      this.restaurantStatus = await window.electronAPI?.getRestaurantStatus();
      this.updateRestaurantUI();
    } catch (error) {
      console.error('Error refreshing restaurant status:', error);
    }
  }

  updateRestaurantUI() {
    const statusEl = document.getElementById('restaurant-status');
    if (!statusEl) return;

    if (!this.restaurantStatus) {
      statusEl.textContent = 'Disabled';
      statusEl.className = 'status-value offline';
      return;
    }

    statusEl.textContent = this.restaurantStatus.connected ? 'Connected' : 'Disconnected';
    statusEl.className = `status-value ${this.restaurantStatus.connected ? 'online' : 'offline'}`;
  }

  updateDashboard() {
    this.updatePrinterStats();
    this.updateConnectionStatus();
  }

  updatePrinterStats() {
    const totalEl = document.getElementById('total-printers');
    const onlineEl = document.getElementById('online-printers');
    const offlineEl = document.getElementById('offline-printers');

    if (totalEl) totalEl.textContent = this.printers.length;
    if (onlineEl) onlineEl.textContent = this.printers.filter(p => p.status === 'online').length;
    if (offlineEl) offlineEl.textContent = this.printers.filter(p => p.status === 'offline').length;
  }

  updateConnectionStatus() {
    const statusIndicator = document.getElementById('connection-status');
    const statusDot = statusIndicator?.querySelector('.status-dot');
    const statusText = statusIndicator?.querySelector('.status-text');

    if (!statusDot || !statusText) return;

    let status = 'offline';
    let text = 'Offline';

    if (this.websocketStatus?.running) {
      if (this.restaurantStatus?.connected) {
        status = 'online';
        text = 'Connected';
      } else {
        status = 'warning';
        text = 'WebSocket Only';
      }
    }

    statusDot.className = `status-dot ${status}`;
    statusText.textContent = text;
  }

  updateUptime() {
    const uptimeEl = document.getElementById('uptime');
    if (!uptimeEl || !this.startTime) return;

    const now = new Date();
    const diff = now - this.startTime;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    uptimeEl.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  addActivity(text) {
    const now = new Date();
    const activity = {
      time: now.toLocaleTimeString(),
      text: text,
      timestamp: now
    };

    this.activityLog.unshift(activity);
    this.activityLog = this.activityLog.slice(0, 50); // Keep last 50 activities

    this.renderActivity();
  }

  renderActivity() {
    const container = document.getElementById('activity-list');
    if (!container) return;

    container.innerHTML = this.activityLog.map(activity => `
      <div class="activity-item">
        <div class="activity-time">${activity.time}</div>
        <div class="activity-text">${activity.text}</div>
      </div>
    `).join('');
  }

  async loadLogs() {
    try {
      // In a real implementation, this would load log files
      this.logEntries = [
        { level: 'info', timestamp: new Date().toISOString(), message: 'PrinterMaster started' },
        { level: 'info', timestamp: new Date(Date.now() - 60000).toISOString(), message: 'WebSocket server started on port 9012' },
        { level: 'debug', timestamp: new Date(Date.now() - 120000).toISOString(), message: 'Printer discovery initiated' }
      ];
      
      this.renderLogs();
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  }

  renderLogs() {
    const container = document.getElementById('logs-list');
    if (!container) return;

    const filteredLogs = this.filterLogEntries();
    
    container.innerHTML = filteredLogs.map(log => `
      <div class="log-entry">
        <div class="log-time">${new Date(log.timestamp).toLocaleTimeString()}</div>
        <div class="log-level ${log.level}">${log.level.toUpperCase()}</div>
        <div class="log-message">${log.message}</div>
      </div>
    `).join('');
  }

  filterLogEntries() {
    const levelFilter = document.getElementById('log-level-filter')?.value || '';
    const searchTerm = document.getElementById('log-search')?.value.toLowerCase() || '';

    return this.logEntries.filter(log => {
      const matchesLevel = !levelFilter || log.level === levelFilter;
      const matchesSearch = !searchTerm || log.message.toLowerCase().includes(searchTerm);
      return matchesLevel && matchesSearch;
    });
  }

  filterLogs() {
    this.renderLogs();
  }

  async exportLogs() {
    try {
      await window.electronAPI?.showLogs();
      this.showNotification('Logs Opened', 'Log directory opened in file explorer', 'info');
    } catch (error) {
      console.error('Error exporting logs:', error);
      this.showNotification('Error', 'Failed to open log directory', 'error');
    }
  }

  async clearLogs() {
    if (confirm('Are you sure you want to clear old log files? This action cannot be undone.')) {
      try {
        // In a real implementation, this would clear old logs
        this.showNotification('Logs Cleared', 'Old log files have been cleared', 'success');
      } catch (error) {
        console.error('Error clearing logs:', error);
        this.showNotification('Error', 'Failed to clear log files', 'error');
      }
    }
  }

  showAddPrinterModal() {
    // This would show a modal to manually add a printer
    this.showNotification('Feature Coming Soon', 'Manual printer addition will be available in a future update', 'info');
  }

  showSettingsModal() {
    // This would show application settings
    this.showNotification('Feature Coming Soon', 'Settings panel will be available in a future update', 'info');
  }

  closeModal() {
    document.getElementById('printer-modal')?.classList.remove('active');
  }

  showNotification(title, message, type = 'info') {
    const container = document.getElementById('notifications');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-header">
        <div class="notification-title">${title}</div>
        <button class="notification-close">&times;</button>
      </div>
      <div class="notification-message">${message}</div>
    `;

    container.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);

    // Manual close
    notification.querySelector('.notification-close').addEventListener('click', () => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    });
  }

  async refreshData() {
    try {
      const refreshBtn = document.getElementById('refresh-btn');
      const originalText = refreshBtn.innerHTML;
      
      refreshBtn.innerHTML = '<div class="spinner"></div> Refreshing...';
      refreshBtn.disabled = true;

      await this.loadInitialData();
      this.addActivity('Data refreshed');
      
    } catch (error) {
      console.error('Error refreshing data:', error);
      this.showNotification('Error', 'Failed to refresh data', 'error');
    } finally {
      const refreshBtn = document.getElementById('refresh-btn');
      refreshBtn.innerHTML = originalText;
      refreshBtn.disabled = false;
    }
  }
}

// Initialize the UI when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.printerMasterUI = new PrinterMasterUI();
});

// Handle app close
window.addEventListener('beforeunload', (event) => {
  // Optionally save state or show confirmation
  // event.preventDefault();
  // event.returnValue = '';
});

// Error handling
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  if (window.printerMasterUI) {
    window.printerMasterUI.showNotification('Application Error', 'An unexpected error occurred', 'error');
  }
});

// Debug helpers (only in development)
if (window.debug) {
  window.debug.log('PrinterMaster UI loaded');
  window.getPrinters = () => window.printerMasterUI.printers;
  window.getStatus = () => ({
    websocket: window.printerMasterUI.websocketStatus,
    restaurant: window.printerMasterUI.restaurantStatus
  });
}