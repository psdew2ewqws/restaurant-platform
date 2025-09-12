/**
 * ESC/POS Command Builder
 * Utility class for building ESC/POS commands for thermal printers
 */

class ESCPOSBuilder {
  constructor() {
    this.commands = [];
    
    // ESC/POS Control Characters
    this.ESC = 0x1B;
    this.GS = 0x1D;
    this.FS = 0x1C;
    this.US = 0x1F;
    this.LF = 0x0A;
    this.CR = 0x0D;
    this.FF = 0x0C;
    this.CAN = 0x18;
    this.SUB = 0x1A;
    this.SP = 0x20;
    this.HT = 0x09;
    
    // Character sets
    this.charSets = {
      USA: 0,
      FRANCE: 1,
      GERMANY: 2,
      UK: 3,
      DENMARK: 4,
      SWEDEN: 5,
      ITALY: 6,
      SPAIN: 7,
      JAPAN: 8,
      NORWAY: 9,
      DENMARK2: 10
    };
    
    // Code pages
    this.codePages = {
      CP437: 0,
      CP850: 2,
      CP860: 3,
      CP863: 4,
      CP865: 5,
      WCP1252: 16,
      CP866: 17,
      CP852: 18,
      CP858: 19,
      WCP1253: 32,
      WCP1254: 33,
      WCP1257: 34
    };
  }

  // Basic text operations
  text(str) {
    if (typeof str === 'string') {
      this.commands.push(Buffer.from(str, 'utf8'));
    }
    return this;
  }

  newLine(count = 1) {
    for (let i = 0; i < count; i++) {
      this.commands.push(Buffer.from([this.LF]));
    }
    return this;
  }

  carriageReturn() {
    this.commands.push(Buffer.from([this.CR]));
    return this;
  }

  tab() {
    this.commands.push(Buffer.from([this.HT]));
    return this;
  }

  // Text formatting
  bold(enable = true) {
    this.commands.push(Buffer.from([this.ESC, 0x45, enable ? 1 : 0]));
    return this;
  }

  underline(mode = 0) {
    // mode: 0 = off, 1 = single, 2 = double
    this.commands.push(Buffer.from([this.ESC, 0x2D, mode]));
    return this;
  }

  italic(enable = true) {
    this.commands.push(Buffer.from([this.ESC, 0x34, enable ? 1 : 0]));
    return this;
  }

  invert(enable = true) {
    this.commands.push(Buffer.from([this.GS, 0x42, enable ? 1 : 0]));
    return this;
  }

  doubleWidth(enable = true) {
    this.commands.push(Buffer.from([this.ESC, 0x21, enable ? 0x20 : 0x00]));
    return this;
  }

  doubleHeight(enable = true) {
    this.commands.push(Buffer.from([this.ESC, 0x21, enable ? 0x10 : 0x00]));
    return this;
  }

  doubleSize(enable = true) {
    this.commands.push(Buffer.from([this.ESC, 0x21, enable ? 0x30 : 0x00]));
    return this;
  }

  // Text size (0-7, where 0 is normal)
  size(width = 0, height = 0) {
    const value = (width << 4) | height;
    this.commands.push(Buffer.from([this.GS, 0x21, value]));
    return this;
  }

  // Font selection
  fontA() {
    this.commands.push(Buffer.from([this.ESC, 0x4D, 0x00]));
    return this;
  }

  fontB() {
    this.commands.push(Buffer.from([this.ESC, 0x4D, 0x01]));
    return this;
  }

  fontC() {
    this.commands.push(Buffer.from([this.ESC, 0x4D, 0x02]));
    return this;
  }

  // Alignment
  alignLeft() {
    this.commands.push(Buffer.from([this.ESC, 0x61, 0x00]));
    return this;
  }

  alignCenter() {
    this.commands.push(Buffer.from([this.ESC, 0x61, 0x01]));
    return this;
  }

  alignRight() {
    this.commands.push(Buffer.from([this.ESC, 0x61, 0x02]));
    return this;
  }

  // Line spacing
  lineSpacing(n = 32) {
    this.commands.push(Buffer.from([this.ESC, 0x33, n]));
    return this;
  }

  defaultLineSpacing() {
    this.commands.push(Buffer.from([this.ESC, 0x32]));
    return this;
  }

  // Character spacing
  characterSpacing(n = 0) {
    this.commands.push(Buffer.from([this.ESC, 0x20, n]));
    return this;
  }

  // Margins
  leftMargin(n = 0) {
    this.commands.push(Buffer.from([this.GS, 0x4C, n % 256, Math.floor(n / 256)]));
    return this;
  }

  printWidth(n = 576) {
    this.commands.push(Buffer.from([this.GS, 0x57, n % 256, Math.floor(n / 256)]));
    return this;
  }

  // Character set and code page
  characterSet(charset = 0) {
    this.commands.push(Buffer.from([this.ESC, 0x52, charset]));
    return this;
  }

  codePage(codePage = 0) {
    this.commands.push(Buffer.from([this.ESC, 0x74, codePage]));
    return this;
  }

  // Drawing operations
  drawLine(char = '-', length = 48) {
    const line = char.repeat(length);
    this.text(line);
    return this;
  }

  horizontalRule(style = 0) {
    // Style: 0 = single line, 1 = double line
    const char = style === 1 ? '=' : '-';
    return this.drawLine(char, 48);
  }

  // Paper operations
  cut(mode = 0) {
    // mode: 0 = full cut, 1 = partial cut
    if (mode === 1) {
      this.commands.push(Buffer.from([this.GS, 0x56, 0x01])); // Partial cut
    } else {
      this.commands.push(Buffer.from([this.GS, 0x56, 0x00])); // Full cut
    }
    return this;
  }

  cutPartial() {
    return this.cut(1);
  }

  feedAndCut(lines = 3) {
    this.feed(lines);
    this.cut();
    return this;
  }

  feed(lines = 1) {
    this.commands.push(Buffer.from([this.ESC, 0x64, lines]));
    return this;
  }

  reverseFeed(lines = 1) {
    this.commands.push(Buffer.from([this.ESC, 0x65, lines]));
    return this;
  }

  // Cash drawer
  openDrawer(pin = 0) {
    // pin: 0 = pin 2, 1 = pin 5
    if (pin === 1) {
      this.commands.push(Buffer.from([this.ESC, 0x70, 0x01, 0x64, 0x64]));
    } else {
      this.commands.push(Buffer.from([this.ESC, 0x70, 0x00, 0x64, 0x64]));
    }
    return this;
  }

  // Buzzer/beeper
  beep(n = 1, t = 9) {
    // n: number of beeps, t: beep duration (1-9)
    this.commands.push(Buffer.from([this.ESC, 0x42, n, t]));
    return this;
  }

  // Status commands
  statusRequest() {
    this.commands.push(Buffer.from([this.GS, 0x72, 0x01]));
    return this;
  }

  paperStatus() {
    this.commands.push(Buffer.from([this.GS, 0x72, 0x04]));
    return this;
  }

  // Barcode operations
  barcode(data, type = 'CODE128') {
    const barcodeTypes = {
      'UPC-A': 0,
      'UPC-E': 1,
      'EAN13': 2,
      'EAN8': 3,
      'CODE39': 4,
      'ITF': 5,
      'CODABAR': 6,
      'CODE93': 7,
      'CODE128': 8
    };

    const barcodeType = barcodeTypes[type] || 8;
    
    // Set barcode height
    this.commands.push(Buffer.from([this.GS, 0x68, 162]));
    
    // Set barcode width
    this.commands.push(Buffer.from([this.GS, 0x77, 3]));
    
    // Print barcode
    this.commands.push(Buffer.from([this.GS, 0x6B, barcodeType]));
    this.commands.push(Buffer.from(data, 'ascii'));
    this.commands.push(Buffer.from([0x00]));
    
    return this;
  }

  // QR Code
  qrCode(data, size = 3) {
    // QR Code model
    this.commands.push(Buffer.from([0x1D, 0x28, 0x6B, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00]));
    
    // QR Code size
    this.commands.push(Buffer.from([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, size]));
    
    // QR Code error correction
    this.commands.push(Buffer.from([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 0x31]));
    
    // Store data
    const dataLength = data.length + 3;
    this.commands.push(Buffer.from([0x1D, 0x28, 0x6B, dataLength % 256, Math.floor(dataLength / 256), 0x31, 0x50, 0x30]));
    this.commands.push(Buffer.from(data, 'utf8'));
    
    // Print QR Code
    this.commands.push(Buffer.from([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30]));
    
    return this;
  }

  // Image operations (simplified)
  image(imageBuffer, width, height) {
    // This is a simplified version - real implementation would need image processing
    // For now, we'll just add a placeholder
    this.text('[IMAGE PLACEHOLDER]');
    return this;
  }

  // Tables and formatting helpers
  tableRow(columns, widths = null) {
    if (!widths) {
      const columnWidth = Math.floor(48 / columns.length);
      widths = new Array(columns.length).fill(columnWidth);
    }
    
    let row = '';
    for (let i = 0; i < columns.length; i++) {
      const column = String(columns[i] || '');
      const width = widths[i] || 10;
      
      if (column.length > width) {
        row += column.substring(0, width);
      } else {
        row += column.padEnd(width, ' ');
      }
    }
    
    this.text(row);
    return this;
  }

  // Receipt helpers
  receiptHeader(title, width = 48) {
    this.alignCenter();
    this.bold(true);
    this.doubleWidth(true);
    this.text(title);
    this.doubleWidth(false);
    this.bold(false);
    this.newLine();
    this.drawLine('=', width);
    this.newLine();
    this.alignLeft();
    return this;
  }

  receiptFooter(message = 'Thank you!', width = 48) {
    this.newLine();
    this.drawLine('-', width);
    this.newLine();
    this.alignCenter();
    this.text(message);
    this.newLine(2);
    this.alignLeft();
    return this;
  }

  itemLine(name, price, width = 48) {
    const priceStr = String(price);
    const maxNameWidth = width - priceStr.length - 1;
    const truncatedName = name.length > maxNameWidth ? 
      name.substring(0, maxNameWidth) : name;
    
    const spaces = width - truncatedName.length - priceStr.length;
    const line = truncatedName + ' '.repeat(spaces) + priceStr;
    
    this.text(line);
    return this;
  }

  // Control and initialization
  initialize() {
    this.commands.push(Buffer.from([this.ESC, 0x40]));
    return this;
  }

  reset() {
    this.initialize();
    return this;
  }

  // Build final command buffer
  build() {
    return Buffer.concat(this.commands);
  }

  // Clear command buffer
  clear() {
    this.commands = [];
    return this;
  }

  // Get raw commands as array of buffers
  getCommands() {
    return [...this.commands];
  }

  // Add raw command
  raw(buffer) {
    if (Buffer.isBuffer(buffer)) {
      this.commands.push(buffer);
    } else if (Array.isArray(buffer)) {
      this.commands.push(Buffer.from(buffer));
    }
    return this;
  }

  // Static helper methods
  static createReceipt() {
    return new ESCPOSBuilder().initialize();
  }

  static testReceipt() {
    return new ESCPOSBuilder()
      .initialize()
      .receiptHeader('TEST RECEIPT')
      .text('This is a test receipt')
      .newLine()
      .text('Date: ' + new Date().toLocaleString())
      .newLine()
      .itemLine('Test Item 1', '$10.00')
      .newLine()
      .itemLine('Test Item 2', '$15.50')
      .newLine()
      .drawLine('-')
      .newLine()
      .itemLine('TOTAL', '$25.50')
      .receiptFooter()
      .cut();
  }

  // Common receipt layouts
  static orderReceipt(order) {
    const receipt = new ESCPOSBuilder()
      .initialize()
      .receiptHeader(order.restaurantName || 'Restaurant')
      .text(`Order #${order.orderNumber}`)
      .newLine()
      .text(`Date: ${new Date(order.timestamp).toLocaleString()}`)
      .newLine()
      .text(`Table: ${order.table || 'N/A'}`)
      .newLine(2);

    // Add items
    for (const item of order.items) {
      receipt
        .itemLine(item.name, `$${item.price.toFixed(2)}`)
        .newLine();
      
      if (item.modifiers && item.modifiers.length > 0) {
        for (const modifier of item.modifiers) {
          receipt
            .text(`  + ${modifier.name}`)
            .newLine();
        }
      }
    }

    receipt
      .drawLine('-')
      .newLine()
      .itemLine('Subtotal', `$${order.subtotal.toFixed(2)}`)
      .newLine()
      .itemLine('Tax', `$${order.tax.toFixed(2)}`)
      .newLine()
      .itemLine('TOTAL', `$${order.total.toFixed(2)}`)
      .newLine()
      .receiptFooter('Thank you for your order!')
      .cut();

    return receipt;
  }
}

module.exports = ESCPOSBuilder;