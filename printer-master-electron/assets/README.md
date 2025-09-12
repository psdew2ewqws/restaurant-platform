# PrinterMaster Assets

This directory contains the visual assets for PrinterMaster.

## Required Files

For a complete build, you need these icon files:

- `icon.png` - Main application icon (512x512 PNG)
- `tray-icon.png` - System tray icon (32x32 PNG)
- `icon.ico` - Windows application icon (ICO format with multiple sizes)
- `icon.icns` - macOS application icon (ICNS format)

## Icon Specifications

### Main Application Icon (icon.png)
- Format: PNG
- Size: 512x512 pixels
- Transparent background
- Should represent a printer or printing management concept

### System Tray Icon (tray-icon.png)
- Format: PNG
- Size: 32x32 pixels (or smaller, will be scaled)
- Simple, recognizable design
- Works well at small sizes

### Windows Icon (icon.ico)
- Format: ICO
- Multiple sizes: 16x16, 32x32, 48x48, 256x256
- Can be generated from the main PNG icon

### macOS Icon (icon.icns)
- Format: ICNS
- Multiple sizes included
- Can be generated from the main PNG icon

## Creating Icons

You can use tools like:

1. **Online converters**: Convert PNG to ICO/ICNS
2. **GIMP**: Can export to ICO format
3. **ImageMagick**: Command-line conversion
4. **Electron Icon Maker**: Specialized tool for Electron apps

## Default Placeholder

Until custom icons are created, the build process will use default Electron icons.

## Brand Guidelines

The icon should reflect:
- Professional restaurant/hospitality industry
- Printer/printing technology
- Reliability and enterprise quality
- Modern, clean design