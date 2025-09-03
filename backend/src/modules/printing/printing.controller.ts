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
import { CreatePrinterDto } from './dto/create-printer.dto';
import { UpdatePrinterDto } from './dto/update-printer.dto';
import { CreatePrintJobDto } from './dto/create-print-job.dto';
import { DiscoverPrintersDto } from './dto/discover-printers.dto';

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
  ) {}

  // Printer Management
  @Get('printers')
  @ApiOperation({ summary: 'Get all printers for user\'s company with tenant isolation' })
  @ApiResponse({ status: 200, description: 'List of printers retrieved successfully' })
  async getAllPrinters(@Req() req: any) {
    const companyId = req.user?.companyId;
    const branchId = req.user?.branchId;
    const userRole = req.user?.role;
    
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
    @Req() req: any,
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
  @Get('service/status')
  @ApiOperation({ summary: 'Get print service status' })
  @ApiResponse({ status: 200, description: 'Print service status retrieved' })
  async getServiceStatus(@Req() req: any) {
    const companyId = req.user?.companyId;
    const branchId = req.user?.branchId;
    return this.printingService.getServiceStatus(companyId, branchId);
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
    @Req() req: any,
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
}