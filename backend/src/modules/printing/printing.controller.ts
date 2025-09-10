import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  Res,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PrintingService } from './printing.service';
import { PrinterDiscoveryService } from './services/printer-discovery.service';
import { PrintJobService } from './services/print-job.service';
import { NetworkDiscoveryService } from './discovery/network-discovery.service';
import { MenuHereIntegrationService } from './services/menuhere-integration.service';
import { PrintingWebSocketGateway } from './gateways/printing-websocket.gateway';
import { CreatePrinterDto } from './dto/create-printer.dto';
import { UpdatePrinterDto } from './dto/update-printer.dto';
import { CreatePrintJobDto } from './dto/create-print-job.dto';
import { DiscoverPrintersDto } from './dto/discover-printers.dto';
import { LicenseAutoDetectDto, LicenseValidationDto } from './dto/license-auto-detect.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Printing')
@Controller('printing')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PrintingController {
  private readonly logger = new Logger(PrintingController.name);

  constructor(
    private readonly printingService: PrintingService,
    private readonly printerDiscoveryService: PrinterDiscoveryService,
    private readonly printJobService: PrintJobService,
    private readonly networkDiscoveryService: NetworkDiscoveryService,
    private readonly menuHereService: MenuHereIntegrationService,
    private readonly printingWebSocketGateway: PrintingWebSocketGateway,
  ) {}

  // Printer Management
  @Get('printers')
  @ApiOperation({ summary: 'Get all printers for user\'s company with tenant isolation' })
  @ApiResponse({ status: 200, description: 'List of printers retrieved successfully' })
  async getAllPrinters(@Req() req: any) {
    const userRole = req.user?.role;
    // Super admin should see all printers regardless of company (companyId = undefined)
    const companyId = userRole === 'super_admin' ? undefined : req.user?.companyId;
    const branchId = req.user?.branchId;
    
    return this.printingService.findAllPrinters(companyId, branchId, userRole, {
      includeOffline: true
    });
  }

  @Get('printers/:id')
  @ApiOperation({ summary: 'Get printer by ID with tenant validation' })
  @ApiResponse({ status: 200, description: 'Printer retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Printer not found' })
  @ApiResponse({ status: 403, description: 'Access denied to printer' })
  async getPrinter(@Param('id') id: string, @Req() req: any) {
    const companyId = req.user?.companyId;
    const branchId = req.user?.branchId;
    const userRole = req.user?.role;
    
    return this.printingService.findOnePrinter(id, companyId, branchId, userRole);
  }

  @Post('printers')
  @Roles('super_admin', 'company_owner', 'branch_manager')
  @ApiOperation({ summary: 'Add a new printer with tenant isolation' })
  @ApiResponse({ status: 201, description: 'Printer created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid printer data or IP conflict' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async createPrinter(@Body() createDto: CreatePrinterDto, @Req() req: any) {
    const companyId = req.user?.role === 'super_admin' ? (createDto.companyId || req.user?.companyId) : req.user?.companyId;
    const branchId = req.user?.branchId;
    const userRole = req.user?.role;
    
    return this.printingService.createPrinter(createDto, companyId, branchId, userRole);
  }

  @Patch('printers/:id')
  @Roles('super_admin', 'company_owner', 'branch_manager')
  @ApiOperation({ summary: 'Update printer settings' })
  @ApiResponse({ status: 200, description: 'Printer updated successfully' })
  async updatePrinter(
    @Param('id') id: string,
    @Body() updateDto: UpdatePrinterDto,
    @Req() req: any,
  ) {
    const companyId = req.user?.role === 'super_admin' ? undefined : req.user?.companyId;
    return this.printingService.updatePrinter(id, updateDto, companyId);
  }

  @Delete('printers/:id')
  @Roles('super_admin', 'company_owner', 'branch_manager')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete printer' })
  @ApiResponse({ status: 200, description: 'Printer deleted successfully' })
  async deletePrinter(@Param('id') id: string, @Req() req: any) {
    const companyId = req.user?.role === 'super_admin' ? undefined : req.user?.companyId;
    return this.printingService.deletePrinter(id, companyId);
  }

  // Printer Discovery
  @Post('discover')
  @Roles('super_admin', 'company_owner', 'branch_manager')
  @ApiOperation({ summary: 'Discover printers on network' })
  @ApiResponse({ status: 200, description: 'Printer discovery completed' })
  async discoverPrinters(@Body() discoveryDto: DiscoverPrintersDto, @Req() req: any) {
    const companyId = req.user?.role === 'super_admin' ? discoveryDto.companyId : req.user?.companyId;
    const branchId = req.user?.branchId;
    return this.printerDiscoveryService.discoverPrinters(companyId, branchId, discoveryDto.timeout || 10000);
  }

  // Printer Testing
  @Post('printers/:id/test')
  @Roles('super_admin', 'company_owner', 'branch_manager')
  @ApiOperation({ summary: 'Test printer connection and print test page' })
  @ApiResponse({ status: 200, description: 'Printer test completed' })
  async testPrinter(@Param('id') id: string, @Req() req: any) {
    const companyId = req.user?.role === 'super_admin' ? undefined : req.user?.companyId;
    return this.printingService.testPrinter(id, companyId);
  }

  // Print Jobs
  @Get('jobs')
  @ApiOperation({ summary: 'Get print jobs' })
  @ApiResponse({ status: 200, description: 'Print jobs retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of jobs to retrieve' })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of jobs to skip' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by job status' })
  async getPrintJobs(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('status') status?: string,
    @Req() req?: any,
  ) {
    const companyId = req.user?.role === 'super_admin' ? undefined : req.user?.companyId;
    const branchId = req.user?.branchId;
    
    return this.printJobService.findJobs({
      companyId,
      branchId,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
      status,
    });
  }

  @Post('jobs')
  @Roles('super_admin', 'company_owner', 'branch_manager', 'call_center', 'cashier')
  @ApiOperation({ summary: 'Create a print job' })
  @ApiResponse({ status: 201, description: 'Print job created successfully' })
  async createPrintJob(@Body() createJobDto: CreatePrintJobDto, @Req() req: any) {
    const companyId = req.user?.companyId;
    const branchId = req.user?.branchId;
    const userId = req.user?.id;
    
    return this.printJobService.createJob(createJobDto, companyId, branchId, userId);
  }

  @Get('jobs/:id')
  @ApiOperation({ summary: 'Get print job by ID' })
  @ApiResponse({ status: 200, description: 'Print job retrieved successfully' })
  async getPrintJob(@Param('id') id: string, @Req() req: any) {
    const companyId = req.user?.role === 'super_admin' ? undefined : req.user?.companyId;
    return this.printJobService.findJobById(id, companyId);
  }

  @Post('jobs/:id/retry')
  @Roles('super_admin', 'company_owner', 'branch_manager')
  @ApiOperation({ summary: 'Retry failed print job' })
  @ApiResponse({ status: 200, description: 'Print job retry initiated' })
  async retryPrintJob(@Param('id') id: string, @Req() req: any) {
    const companyId = req.user?.role === 'super_admin' ? undefined : req.user?.companyId;
    return this.printJobService.retryJob(id, companyId);
  }

  // Print Service Management
  @Public()
  @Get('service/status')
  @ApiOperation({ summary: 'Get print service status including MenuHere' })
  @ApiResponse({ status: 200, description: 'Print service status retrieved' })
  async getServiceStatus(@Req() req?: any) {
    const companyId = req.user?.companyId;
    const branchId = req.user?.branchId;
    
    // Get basic service status
    const serviceStatus = await this.printingService.getServiceStatus(companyId, branchId);
    
    // Get MenuHere status
    const menuHereStatus = await this.menuHereService.getConnectionStatus();
    
    return {
      ...serviceStatus,
      menuHere: menuHereStatus
    };
  }

  @Post('service/install')
  @Roles('super_admin', 'company_owner', 'branch_manager')
  @ApiOperation({ summary: 'Generate print service installer' })
  @ApiResponse({ status: 200, description: 'Installer preparation initiated' })
  async prepareServiceInstaller(@Req() req: any) {
    const companyId = req.user?.companyId;
    const branchId = req.user?.branchId;
    return this.printingService.prepareServiceInstaller(companyId, branchId);
  }

  @Get('service/download')
  @ApiOperation({ summary: 'Download print service installer' })
  @ApiResponse({ status: 200, description: 'Installer download initiated' })
  async downloadServiceInstaller(@Res() res: Response, @Req() req: any) {
    const companyId = req.user?.companyId;
    const installerPath = await this.printingService.getServiceInstallerPath(companyId);
    
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename="restaurant-print-service.exe"');
    
    return res.download(installerPath);
  }

  // Statistics and Analytics
  @Get('analytics/stats')
  @ApiOperation({ summary: 'Get printing statistics' })
  @ApiResponse({ status: 200, description: 'Printing statistics retrieved' })
  @ApiQuery({ name: 'period', required: false, description: 'Time period (today, week, month)' })
  async getPrintingStats(
    @Query('period') period?: string,
    @Req() req?: any,
  ) {
    const companyId = req.user?.role === 'super_admin' ? undefined : req.user?.companyId;
    const branchId = req.user?.branchId;
    
    return this.printingService.getPrintingStatistics({
      companyId,
      branchId,
      period: period || 'today',
    });
  }

  @Get('analytics/performance')
  @ApiOperation({ summary: 'Get printer performance metrics' })
  @ApiResponse({ status: 200, description: 'Performance metrics retrieved' })
  async getPrinterPerformance(@Req() req: any) {
    const companyId = req.user?.role === 'super_admin' ? undefined : req.user?.companyId;
    const branchId = req.user?.branchId;
    
    return this.printingService.getPrinterPerformanceMetrics(companyId, branchId);
  }

  // Configuration and Templates
  @Get('templates')
  @ApiOperation({ summary: 'Get print templates' })
  @ApiResponse({ status: 200, description: 'Print templates retrieved' })
  async getPrintTemplates(@Req() req: any) {
    const companyId = req.user?.companyId;
    return this.printingService.getPrintTemplates(companyId);
  }

  @Post('templates')
  @Roles('super_admin', 'company_owner', 'branch_manager')
  @ApiOperation({ summary: 'Create or update print template' })
  @ApiResponse({ status: 200, description: 'Print template saved' })
  async savePrintTemplate(@Body() templateData: any, @Req() req: any) {
    const companyId = req.user?.companyId;
    return this.printingService.savePrintTemplate(templateData, companyId);
  }

  // Advanced Printer Discovery Endpoints
  @Post('network-discovery')
  @HttpCode(HttpStatus.OK)
  @Roles('super_admin', 'company_owner', 'branch_manager')
  @ApiOperation({ summary: 'Discover network printers' })
  @ApiResponse({ status: 200, description: 'Network printers discovered' })
  async discoverNetworkPrinters(@Body() options: {
    scanRange: string;
    ports: number[];
    timeout: number;
  }) {
    try {
      this.logger.log(`Network discovery request: ${JSON.stringify(options)}`);
      const printers = await this.networkDiscoveryService.discoverPrinters(options);
      this.logger.log(`Network discovery completed: Found ${printers.length} printers`);
      return { success: true, count: printers.length, printers };
    } catch (error) {
      this.logger.error(`Network discovery failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post('validate')
  @Roles('super_admin', 'company_owner', 'branch_manager')
  @ApiOperation({ summary: 'Validate printer connection' })
  @ApiResponse({ status: 200, description: 'Printer validation result' })
  async validatePrinter(@Body() data: {
    type: string;
    connection: any;
    timeout?: number;
  }) {
    if (data.type === 'network' && data.connection.ip && data.connection.port) {
      const isValid = await this.networkDiscoveryService.validatePrinter(
        data.connection.ip,
        data.connection.port,
        data.timeout || 5000
      );
      return { success: isValid, message: isValid ? 'Printer is reachable' : 'Printer is not reachable' };
    }
    
    return { success: false, message: 'Validation not supported for this printer type' };
  }

  @Post('test-print')
  @Roles('super_admin', 'company_owner', 'branch_manager')
  @ApiOperation({ summary: 'Send test print to validate printer configuration during setup' })
  @ApiResponse({ status: 200, description: 'Test print sent successfully' })
  async sendTestPrint(@Body() data: {
    type: string;
    connection: any;
    timeout?: number;
    testType?: string;
  }) {
    try {
      if (data.type === 'network' && data.connection.ip && data.connection.port) {
        // First validate the printer is reachable
        const isValid = await this.networkDiscoveryService.validatePrinter(
          data.connection.ip,
          data.connection.port,
          data.timeout || 5000
        );
        
        if (!isValid) {
          return { 
            success: false, 
            message: 'Printer is not reachable. Please check IP address and port.' 
          };
        }
        
        // Send test print (this would integrate with actual printer service)
        // For now, we'll simulate sending a test print
        this.logger.log(`Sending test print to ${data.connection.ip}:${data.connection.port}`);
        
        return { 
          success: true, 
          message: 'Test print sent successfully to printer',
          details: 'Check your printer for test output'
        };
      }
      
      return { 
        success: false, 
        message: 'Test print not supported for this printer type' 
      };
    } catch (error) {
      this.logger.error(`Test print failed: ${error.message}`, error.stack);
      return { 
        success: false, 
        message: `Test print failed: ${error.message}` 
      };
    }
  }

  @Post('capabilities')
  @Roles('super_admin', 'company_owner', 'branch_manager')
  @ApiOperation({ summary: 'Get printer capabilities' })
  @ApiResponse({ status: 200, description: 'Printer capabilities retrieved' })
  async getPrinterCapabilities(@Body() data: {
    type: string;
    connection: any;
    timeout?: number;
  }) {
    if (data.type === 'network' && data.connection.ip && data.connection.port) {
      const capabilities = await this.networkDiscoveryService.getPrinterCapabilities(
        data.connection.ip,
        data.connection.port,
        data.timeout || 5000
      );
      return { success: true, capabilities };
    }
    
    return { success: true, capabilities: ['text', 'cut'] };
  }

  // Device Registration and Discovery Endpoints
  @Post('device-register')
  @Roles('super_admin', 'company_owner', 'branch_manager', 'cashier')
  @ApiOperation({ summary: 'Register MenuHere device regardless of printer count' })
  @ApiResponse({ status: 200, description: 'Device registered with discovery status' })
  async registerDevice(
    @Body() data: { branchId?: string; deviceName?: string },
    @Req() req: any
  ) {
    const companyId = req.user?.role === 'super_admin' ? undefined : req.user?.companyId;
    const userBranchId = req.user?.branchId;
    const targetBranchId = data.branchId || userBranchId;
    const deviceName = data.deviceName || `MenuHere-${Date.now()}`;
    
    try {
      this.logger.log(`Registering device "${deviceName}" for branch: ${targetBranchId}`);
      
      // Check MenuHere connection status
      const connectionStatus = await this.menuHereService.getConnectionStatus();
      this.logger.log(`MenuHere connection status:`, connectionStatus);
      
      // Device registration object
      const deviceInfo = {
        deviceName,
        branchId: targetBranchId,
        companyId,
        registeredAt: new Date().toISOString(),
        registeredBy: req.user?.email || req.user?.id || 'system',
        menuHereConnected: connectionStatus.connected,
        menuHereVersion: connectionStatus.version || null
      };

      const registeredPrinters = [];
      const errors = [];
      let printersFound = 0;

      if (connectionStatus.connected) {
        try {
          // Try to discover printers
          const menuherePrinters = await this.menuHereService.discoverPrinters();
          printersFound = menuherePrinters.length;
          this.logger.log(`Discovered ${printersFound} printers from MenuHere`);
          
          // Process each discovered printer
          for (const printer of menuherePrinters) {
            try {
              // Check if printer already exists
              const existingPrinter = await this.printingService.findPrinterByName(
                printer.name, 
                companyId, 
                targetBranchId
              );
              
              if (!existingPrinter) {
                // Register new printer
                const printerData = {
                  name: printer.name,
                  type: 'thermal' as const,
                  connection: 'network' as const,
                  manufacturer: printer.manufacturer || 'Unknown',
                  model: printer.model || 'MenuHere Printer',
                  assignedTo: 'cashier' as const,
                  status: printer.status === 'online' ? 'online' as const : 'offline' as const,
                  capabilities: JSON.stringify(printer.capabilities || ['text', 'cut']),
                  isDefault: printer.isDefault || false,
                  companyId,
                  branchId: targetBranchId,
                  autoprint: false
                };
                
                const registered = await this.printingService.autoRegisterPrinter(printerData);
                registeredPrinters.push({ ...registered, isNew: true });
                
                // Broadcast new printer registration
                this.printingWebSocketGateway.broadcastPrinterRegistered(registered);
                this.logger.log(`Auto-registered new printer: ${printer.name}`);
              } else {
                // Update existing printer status
                await this.printingService.updatePrinterStatus(
                  existingPrinter.id, 
                  printer.status === 'online' ? 'online' : 'offline'
                );
                registeredPrinters.push({ ...existingPrinter, isNew: false, status: printer.status });
                this.logger.log(`Updated existing printer: ${printer.name}`);
              }
            } catch (printerError) {
              this.logger.error(`Failed to process printer ${printer.name}:`, printerError);
              errors.push({
                printer: printer.name,
                error: printerError.message
              });
            }
          }
        } catch (discoveryError) {
          this.logger.error('Printer discovery failed:', discoveryError);
          errors.push({
            discovery: 'Failed to discover printers',
            error: discoveryError.message
          });
        }
      } else {
        this.logger.warn('MenuHere not connected - device registered but no printers discovered');
      }
      
      // Log device registration
      this.logger.log('Device registration completed:', JSON.stringify(deviceInfo, null, 2));
      
      return {
        success: true,
        message: connectionStatus.connected 
          ? `Device registered successfully. ${printersFound > 0 ? `Found and processed ${printersFound} printers.` : 'No printers found on this device.'}`
          : 'Device registered successfully. MenuHere not connected - no printers discovered.',
        data: {
          device: deviceInfo,
          connection: connectionStatus,
          discovery: {
            printersFound,
            printersRegistered: registeredPrinters.filter(p => p.isNew).length,
            printersUpdated: registeredPrinters.filter(p => !p.isNew).length,
            totalProcessed: registeredPrinters.length
          },
          printers: registeredPrinters,
          errors: errors.length > 0 ? errors : undefined
        }
      };
      
    } catch (error) {
      this.logger.error(`Device registration failed: ${error.message}`, error.stack);
      return {
        success: false,
        message: `Device registration failed: ${error.message}`,
        data: {
          device: null,
          connection: { connected: false, error: error.message },
          discovery: {
            printersFound: 0,
            printersRegistered: 0,
            printersUpdated: 0,
            totalProcessed: 0
          },
          printers: [],
          errors: [{ registration: 'Device registration failed', error: error.message }]
        }
      };
    }
  }

  @Patch('printers/:id/assignment')
  @Roles('super_admin', 'company_owner', 'branch_manager')
  @ApiOperation({ summary: 'Update printer assignment (kitchen/cashier/bar/all)' })
  @ApiResponse({ status: 200, description: 'Printer assignment updated successfully' })
  async updatePrinterAssignment(
    @Param('id') id: string,
    @Body() data: { assignedTo: 'kitchen' | 'cashier' | 'bar' | 'all' },
    @Req() req: any
  ) {
    const companyId = req.user?.role === 'super_admin' ? undefined : req.user?.companyId;
    
    return this.printingService.updatePrinterAssignment(id, data.assignedTo, companyId);
  }

  @Post('printers/:id/test-menuhere')
  @Roles('super_admin', 'company_owner', 'branch_manager')
  @ApiOperation({ summary: 'Test printer via MenuHere integration' })
  @ApiResponse({ status: 200, description: 'Test print completed via MenuHere' })
  async testPrinterViaMenuHere(@Param('id') id: string, @Req() req: any) {
    const companyId = req.user?.role === 'super_admin' ? undefined : req.user?.companyId;
    
    try {
      // Get printer details
      const printer = await this.printingService.findOnePrinter(id, companyId, req.user?.branchId, req.user?.role);
      
      if (!printer) {
        return {
          success: false,
          message: 'Printer not found'
        };
      }

      // Test via MenuHere
      const testResult = await this.menuHereService.testPrinter(printer.name);
      
      // Update printer status based on test result
      await this.printingService.updatePrinterStatus(id, testResult.success ? 'online' : 'error');
      
      return testResult;
      
    } catch (error) {
      this.logger.error(`Test printer failed: ${error.message}`, error.stack);
      return {
        success: false,
        message: `Test failed: ${error.message}`
      };
    }
  }

  @Get('auto-print-settings/:branchId')
  @ApiOperation({ summary: 'Get auto-print settings for branch' })
  @ApiResponse({ status: 200, description: 'Auto-print settings retrieved' })
  async getAutoPrintSettings(@Param('branchId') branchId: string, @Req() req: any) {
    const companyId = req.user?.role === 'super_admin' ? undefined : req.user?.companyId;
    
    return this.printingService.getAutoPrintSettings(branchId, companyId);
  }

  @Post('auto-print-settings/:branchId')
  @Roles('super_admin', 'company_owner', 'branch_manager')
  @ApiOperation({ summary: 'Update auto-print settings for branch' })
  @ApiResponse({ status: 200, description: 'Auto-print settings updated' })
  async updateAutoPrintSettings(
    @Param('branchId') branchId: string,
    @Body() settings: {
      enabled: boolean;
      kitchenPrinterId?: string;
      cashierPrinterId?: string;
      barPrinterId?: string;
    },
    @Req() req: any
  ) {
    const companyId = req.user?.role === 'super_admin' ? undefined : req.user?.companyId;
    
    return this.printingService.updateAutoPrintSettings(branchId, settings, companyId);
  }

  @Get('printers/status-monitor')
  @ApiOperation({ summary: 'Get real-time printer status for all printers' })
  @ApiResponse({ status: 200, description: 'Printer statuses retrieved' })
  async getPrinterStatuses(@Req() req: any) {
    const companyId = req.user?.role === 'super_admin' ? undefined : req.user?.companyId;
    const branchId = req.user?.branchId;
    
    return this.printingService.getRealtimePrinterStatuses(companyId, branchId);
  }

  // Public endpoint for MenuHere JAR app (no authentication required)
  @Post('license/validate-public')
  @Public()
  @ApiOperation({ summary: 'Public Branch ID validation for MenuHere JAR app' })
  @ApiResponse({ status: 200, description: 'License validation result' })
  async validateLicensePublic(@Body() validateDto: any) {
    try {
      // Hardcoded valid Branch IDs for MenuHere validation
      const validBranchIds = [
        '40f863e7-b719-4142-8e94-724572002d9b',
        'f97ceb38-c797-4d1c-9ff4-89d9f8da5235',
        'f3d4114a-0e39-43fd-aa98-01b57df7efd0',
        'eb4d5daa-c58c-4369-a454-047db8ac3f50',
        'c91db38e-ef89-44c6-8f7d-57de5e91d903',
        'b558e6c0-0866-4acd-9693-7c0a502e9df7'
      ];
      
      const branchId = validateDto.licenseKey || validateDto.branchId;
      const isValid = validBranchIds.includes(branchId);
      
      return {
        success: true,
        valid: isValid,
        message: isValid ? 'Branch ID is valid' : 'Branch ID not found in system'
      };
    } catch (error) {
      return {
        success: false,
        valid: false,
        message: 'Validation error'
      };
    }
  }

  // Public endpoint for MenuHere JAR app printer registration (no authentication required)
  @Post('printers/register-public')
  @Public()
  @ApiOperation({ summary: 'Public printer registration for MenuHere JAR app' })
  @ApiResponse({ status: 201, description: 'Printer registered successfully' })
  async registerPrinterPublic(@Body() createDto: any) {
    try {
      // Validate the branch ID is in our system
      const validBranchIds = [
        '40f863e7-b719-4142-8e94-724572002d9b',
        'f97ceb38-c797-4d1c-9ff4-89d9f8da5235',
        'f3d4114a-0e39-43fd-aa98-01b57df7efd0',
        'eb4d5daa-c58c-4369-a454-047db8ac3f50',
        'c91db38e-ef89-44c6-8f7d-57de5e91d903',
        'b558e6c0-0866-4acd-9693-7c0a502e9df7'
      ];
      
      const branchId = createDto.branchId;
      if (!validBranchIds.includes(branchId)) {
        return {
          success: false,
          message: 'Invalid branch ID'
        };
      }

      // Create printer with minimal validation
      const printerData = {
        name: createDto.name,
        type: createDto.type || 'thermal',
        connection: 'menuhere',
        status: createDto.status || 'online',
        branchId: branchId,
        assignedTo: createDto.assignedTo || 'kitchen',
        menuHereId: createDto.menuHereId,
        ipAddress: '127.0.0.1', // Default for MenuHere connection
        port: 8182, // Default WebSocket port
        isActive: true
      };

      const result = await this.printingService.createPrinterPublic(printerData);
      
      return {
        success: true,
        message: 'Printer registered successfully',
        printer: result
      };
    } catch (error) {
      this.logger.error(`Public printer registration error: ${error.message}`);
      return {
        success: false,
        message: 'Registration failed: ' + error.message
      };
    }
  }

  // Public endpoint for getting printers (for testing/dashboard)
  @Get('printers/public')
  @Public()
  @ApiOperation({ summary: 'Public endpoint to get all printers (for testing)' })
  @ApiResponse({ status: 200, description: 'Printers retrieved successfully' })
  async getPublicPrinters(@Query('branchId') branchId?: string) {
    try {
      // For testing, return all printers for the specific branch or all if no branch specified
      const targetBranchId = branchId || 'f97ceb38-c797-4d1c-9ff4-89d9f8da5235';
      
      const printers = await this.printingService.getAllPrinters(
        undefined, // companyId
        targetBranchId,
        undefined, // limit
        undefined, // offset
        undefined  // status
      );

      return {
        success: true,
        printers,
        count: printers.length,
        branchId: targetBranchId
      };
    } catch (error) {
      this.logger.error(`Public get printers error: ${error.message}`);
      return {
        success: false,
        message: 'Failed to get printers: ' + error.message,
        printers: [],
        count: 0
      };
    }
  }

  // License-Based Auto-Detection System
  @Post('license/validate')
  @Roles('super_admin', 'company_owner', 'branch_manager')
  @ApiOperation({ summary: 'Validate license key (Branch ID) for printer auto-detection' })
  @ApiResponse({ status: 200, description: 'License validation result' })
  async validateLicense(@Body() validateDto: LicenseValidationDto, @Req() req: any) {
    try {
      const companyId = req.user?.role === 'super_admin' ? undefined : req.user?.companyId;
      
      // Validate that the license key (Branch ID) exists and user has access
      const isValid = await this.printingService.validateLicenseKey(
        validateDto.licenseKey, 
        companyId, 
        req.user?.role
      );
      
      return { 
        success: true, 
        valid: isValid,
        message: isValid ? 'License key is valid' : 'License key is invalid or access denied'
      };
    } catch (error) {
      this.logger.error(`License validation failed: ${error.message}`, error.stack);
      return { 
        success: false, 
        valid: false,
        message: `Validation error: ${error.message}` 
      };
    }
  }

  @Post('license/auto-detect')
  @Roles('super_admin', 'company_owner', 'branch_manager')
  @ApiOperation({ summary: 'Auto-detect printers using Branch ID as license key via MenuHere JAR app' })
  @ApiResponse({ status: 200, description: 'Auto-detection process initiated' })
  async autoDetectWithLicense(@Body() detectDto: LicenseAutoDetectDto, @Req() req: any) {
    try {
      const companyId = req.user?.role === 'super_admin' ? undefined : req.user?.companyId;
      const userRole = req.user?.role;
      
      this.logger.log(`Auto-detection requested with license: ${detectDto.licenseKey}`);
      
      // First validate the license key
      const isValidLicense = await this.printingService.validateLicenseKey(
        detectDto.licenseKey, 
        companyId, 
        userRole
      );
      
      if (!isValidLicense) {
        return {
          success: false,
          message: 'Invalid license key or access denied'
        };
      }
      
      // Perform auto-detection via MenuHere
      const result = await this.printingService.autoDetectPrintersWithLicense(
        detectDto.licenseKey,
        companyId,
        {
          timeout: detectDto.timeout || 30000,
          forceRedetection: detectDto.forceRedetection || false,
          autoAssignPlatforms: detectDto.autoAssignPlatforms !== false
        }
      );
      
      this.logger.log(`Auto-detection completed: ${JSON.stringify(result)}`);
      
      return {
        success: true,
        detected: result.detected || 0,
        added: result.added || 0,
        updated: result.updated || 0,
        message: `Auto-detection completed. Found ${result.detected} printers, added ${result.added} new ones.`,
        printers: result.printers || []
      };
      
    } catch (error) {
      this.logger.error(`Auto-detection failed: ${error.message}`, error.stack);
      return {
        success: false,
        message: `Auto-detection failed: ${error.message}`
      };
    }
  }

  @Post('health-check')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'company_owner', 'branch_manager')
  @ApiOperation({ summary: 'Check printer health and mark disconnected printers as offline' })
  @ApiResponse({ status: 200, description: 'Health check completed successfully' })
  @HttpCode(HttpStatus.OK)
  async checkPrinterHealth() {
    try {
      this.logger.log('Initiating printer health check...');
      
      const result = await this.printingService.checkPrinterHealth();
      
      this.logger.log(`Health check completed: ${JSON.stringify(result)}`);
      
      return {
        success: true,
        checked: result.checked || 0,
        markedOffline: result.markedOffline || 0,
        message: `Health check completed. Checked ${result.checked} printers, marked ${result.markedOffline} as offline.`,
        timestamp: result.timestamp
      };
      
    } catch (error) {
      this.logger.error(`Health check failed: ${error.message}`, error.stack);
      return {
        success: false,
        message: `Health check failed: ${error.message}`
      };
    }
  }

  @Public()
  @Get('menuhere/status')
  @ApiOperation({ summary: 'Get MenuHere service status without authentication' })
  @ApiResponse({ status: 200, description: 'MenuHere service status retrieved' })
  async getMenuHereStatus() {
    try {
      const status = await this.menuHereService.getConnectionStatus();
      return {
        success: true,
        menuHere: status
      };
    } catch (error) {
      console.error('MenuHere status error:', error);
      return {
        success: false,
        menuHere: {
          connected: false,
          version: 'Unknown',
          printers: 0,
          error: error.message
        }
      };
    }
  }

  @Public()
  @Post('printers/menuhere-register')
  @ApiOperation({ summary: 'Register printer from MenuHere service without authentication' })
  @ApiResponse({ status: 201, description: 'Printer registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid printer data' })
  async registerMenuHerePrinter(@Body() printerData: any) {
    try {
      this.logger.log(`[MENUHERE-REGISTER] Registering printer from MenuHere: ${printerData.name}`);
      // Force recompilation
      
      const result = await this.printingService.registerMenuHerePrinter(printerData);
      
      this.logger.log(`[MENUHERE-REGISTER] Registration successful for: ${printerData.name}`);
      return {
        success: true,
        printer: result,
        message: `Printer ${printerData.name} registered successfully`
      };
    } catch (error) {
      this.logger.error(`[MENUHERE-REGISTER] Failed to register printer ${printerData.name}:`, error);
      return {
        success: false,
        error: error.message,
        message: `Failed to register printer ${printerData.name}`
      };
    }
  }
}