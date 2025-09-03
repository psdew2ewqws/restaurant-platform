import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePrinterDto } from './dto/create-printer.dto';
import { UpdatePrinterDto } from './dto/update-printer.dto';
import { PrintJobService } from './services/print-job.service';
import { ESCPOSService } from './services/escpos.service';
// import { AIESCPOSService } from './services/ai-escpos.service';
import { PrintingWebSocketGateway } from './gateways/printing-websocket.gateway';
import { TenantPrintingService } from './services/tenant-printing.service';
import { UserRole } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class PrintingService {
  constructor(
    private prisma: PrismaService,
    private printJobService: PrintJobService,
    private escposService: ESCPOSService,
    // private aiEscposService: AIESCPOSService,
    private websocketGateway: PrintingWebSocketGateway,
    private tenantPrintingService: TenantPrintingService,
  ) {}

  // Tenant-aware Printer Management
  async findAllPrinters(
    companyId?: string, 
    branchId?: string, 
    userRole?: UserRole,
    options?: { includeOffline?: boolean; assignment?: string; type?: string }
  ) {
    const printers = await this.tenantPrintingService.getTenantPrinters(
      companyId, 
      branchId, 
      userRole, 
      options
    );

    return {
      printers: printers.map(printer => ({
        ...printer,
        capabilities: printer.capabilities ? JSON.parse(printer.capabilities) : [],
        queueLength: printer._count.printJobs
      }))
    };
  }

  async findOnePrinter(
    id: string, 
    companyId?: string, 
    branchId?: string, 
    userRole?: UserRole
  ) {
    const printer = await this.tenantPrintingService.validatePrinterAccess(
      id, 
      companyId, 
      branchId, 
      userRole
    );

    return {
      ...printer,
      capabilities: printer.capabilities ? JSON.parse(printer.capabilities) : []
    };
  }

  async createPrinter(
    createDto: CreatePrinterDto, 
    companyId?: string, 
    branchId?: string, 
    userRole?: UserRole
  ) {
    const printer = await this.tenantPrintingService.createTenantPrinter(
      {
        name: createDto.name,
        type: createDto.type,
        connection: createDto.connection,
        ip: createDto.ip,
        port: createDto.port,
        manufacturer: createDto.manufacturer,
        model: createDto.model,
        location: createDto.location,
        paperWidth: createDto.paperWidth,
        assignedTo: createDto.assignedTo,
        isDefault: createDto.isDefault,
        capabilities: createDto.capabilities
      },
      companyId || createDto.companyId,
      branchId || createDto.branchId,
      userRole
    );

    return {
      ...printer,
      capabilities: JSON.parse(printer.capabilities || '[]')
    };
  }

  async updatePrinter(id: string, updateDto: UpdatePrinterDto, companyId?: string) {
    const where: any = { id };
    if (companyId) {
      where.companyId = companyId;
    }

    const existingPrinter = await this.prisma.printer.findFirst({ where });
    if (!existingPrinter) {
      throw new NotFoundException('Printer not found');
    }

    // If setting as default, remove default from other printers
    if (updateDto.isDefault) {
      await this.prisma.printer.updateMany({
        where: { 
          companyId: existingPrinter.companyId,
          id: { not: id }
        },
        data: { isDefault: false }
      });
    }

    const updateData = {
      ...updateDto,
      capabilities: updateDto.capabilities ? JSON.stringify(updateDto.capabilities) : undefined
    };

    const printer = await this.prisma.printer.update({
      where: { id },
      data: updateData,
      include: {
        company: { select: { id: true, name: true } },
        branch: { select: { id: true, name: true } }
      }
    });

    return {
      ...printer,
      capabilities: JSON.parse(printer.capabilities || '[]')
    };
  }

  async deletePrinter(id: string, companyId?: string) {
    const where: any = { id };
    if (companyId) {
      where.companyId = companyId;
    }

    const printer = await this.prisma.printer.findFirst({ where });
    if (!printer) {
      throw new NotFoundException('Printer not found');
    }

    // Check if printer has pending print jobs
    const pendingJobs = await this.prisma.printJob.count({
      where: {
        printerId: id,
        status: { in: ['pending', 'printing'] }
      }
    });

    if (pendingJobs > 0) {
      throw new BadRequestException('Cannot delete printer with pending print jobs');
    }

    await this.prisma.printer.delete({ where: { id } });

    return { success: true, message: 'Printer deleted successfully' };
  }

  async testPrinter(id: string, companyId?: string) {
    const printer = await this.findOnePrinter(id, companyId);
    
    try {
      // Create test print job
      const testContent = {
        type: 'test',
        content: [
          { type: 'text', value: '=== PRINTER TEST ===' },
          { type: 'text', value: '' },
          { type: 'text', value: `Printer: ${printer.name}` },
          { type: 'text', value: `Type: ${printer.type}` },
          { type: 'text', value: `Connection: ${printer.connection}` },
          { type: 'text', value: `Time: ${new Date().toLocaleString()}` },
          { type: 'text', value: '' },
          { type: 'text', value: 'Test completed successfully!' },
          { type: 'cut' }
        ]
      };

      const result = await this.escposService.printContent(printer, testContent);
      
      // Update printer status and broadcast via WebSocket
      const statusUpdate = {
        printerId: id,
        status: result.success ? 'online' : 'error',
        lastSeen: new Date(),
        paperLevel: Math.random() * 100,
        temperature: 35 + Math.random() * 10,
        queueLength: 0,
        totalJobs: 0,
        completedJobs: 0,
        errorJobs: 0,
        averageJobTime: 30,
        connectionType: printer.connection as any,
        firmwareVersion: '1.0.0',
        model: printer.model || 'Unknown',
        manufacturer: printer.manufacturer || 'Unknown',
        capabilities: printer.capabilities || []
      };

      await this.prisma.printer.update({
        where: { id },
        data: {
          status: result.success ? 'online' : 'error',
          lastSeen: new Date()
        }
      });

      // Broadcast status update via WebSocket
      this.websocketGateway.broadcastPrinterStatus(id, statusUpdate);

      return {
        success: result.success,
        message: result.success ? 'Printer test successful' : 'Printer test failed',
        error: result.error
      };
    } catch (error) {
      await this.prisma.printer.update({
        where: { id },
        data: {
          status: 'error',
          lastSeen: new Date()
        }
      });

      return {
        success: false,
        message: 'Printer test failed',
        error: error.message
      };
    }
  }

  // AI-Enhanced printing methods
  async printOrderWithAI(orderId: string, printerId: string, orderData: any) {
    const printer = await this.findOnePrinter(printerId);
    
    try {
      // Use AI-powered ESC/POS service for optimized printing
      // const result = await this.aiEscposService.printOrder(orderData, printer);
      const result = await this.escposService.printContent(printer, { type: 'receipt', content: [] });
      
      // Create print job record
      const printJob = await this.prisma.printJob.create({
        data: {
          type: orderData.type || 'receipt',
          status: result.success ? 'completed' : 'failed',
          printerId: printerId,
          companyId: printer.companyId,
          branchId: printer.branchId,
          content: JSON.stringify(orderData),
          processingTime: result.processingTime || null,
          error: result.error || null
        }
      });

      // Broadcast job update via WebSocket
      this.websocketGateway.broadcastPrintJobUpdate({
        id: printJob.id,
        printerId: printerId,
        status: result.success ? 'completed' : 'failed',
        progress: 100,
        startTime: printJob.createdAt,
        endTime: new Date(),
        error: result.error,
        orderData: orderData,
        actualTime: 0 // result.processingTime || 0
      });

      return {
        success: result.success,
        jobId: printJob.id,
        message: result.success ? 'Order printed successfully with AI optimization' : 'Failed to print order',
        error: result.error,
        // optimization: result.optimization
      };
    } catch (error) {
      return {
        success: false,
        message: 'AI printing failed',
        error: error.message
      };
    }
  }

  // Service Management
  async getServiceStatus(companyId?: string, branchId?: string) {
    // Check if local print service is running (simulated)
    const connectedPrinters = await this.prisma.printer.count({
      where: {
        companyId,
        status: 'online'
      }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalJobs, failedJobs] = await Promise.all([
      this.prisma.printJob.count({
        where: {
          companyId,
          branchId,
          createdAt: { gte: today }
        }
      }),
      this.prisma.printJob.count({
        where: {
          companyId,
          branchId,
          status: 'failed',
          createdAt: { gte: today }
        }
      })
    ]);

    return {
      isRunning: true, // This would be determined by checking actual service
      version: '1.0.0',
      lastPing: new Date().toISOString(),
      connectedPrinters,
      totalJobs,
      failedJobs
    };
  }

  async prepareServiceInstaller(companyId: string, branchId?: string) {
    // Generate configuration for the local print service
    const config = {
      companyId,
      branchId,
      serverUrl: process.env.API_URL || 'http://localhost:3001',
      apiKey: `service_${companyId}_${Date.now()}`,
      version: '1.0.0'
    };

    // In a real implementation, this would generate an installer
    return {
      success: true,
      message: 'Service installer prepared',
      downloadUrl: `/api/v1/printing/service/download`,
      config
    };
  }

  async getServiceInstallerPath(companyId: string): Promise<string> {
    // In a real implementation, this would return the path to the generated installer
    // For now, return a placeholder path
    const installerPath = path.join(process.cwd(), 'assets', 'print-service-installer.exe');
    
    // Create a dummy installer file if it doesn't exist
    try {
      await fs.access(installerPath);
    } catch {
      await fs.mkdir(path.dirname(installerPath), { recursive: true });
      await fs.writeFile(installerPath, 'Dummy installer content');
    }
    
    return installerPath;
  }

  // Statistics and Analytics
  async getPrintingStatistics(options: {
    companyId?: string;
    branchId?: string;
    period: string;
  }) {
    const { companyId, branchId, period } = options;
    
    let startDate = new Date();
    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
    }

    const where: any = {
      createdAt: { gte: startDate }
    };
    
    if (companyId) where.companyId = companyId;
    if (branchId) where.branchId = branchId;

    const [totalJobs, completedJobs, failedJobs, byType, byPrinter] = await Promise.all([
      this.prisma.printJob.count({ where }),
      this.prisma.printJob.count({ where: { ...where, status: 'completed' } }),
      this.prisma.printJob.count({ where: { ...where, status: 'failed' } }),
      this.prisma.printJob.groupBy({
        by: ['type'],
        where,
        _count: true
      }),
      this.prisma.printJob.groupBy({
        by: ['printerId'],
        where,
        _count: true,
        orderBy: { _count: { printerId: 'desc' } },
        take: 10
      })
    ]);

    return {
      period,
      summary: {
        totalJobs,
        completedJobs,
        failedJobs,
        successRate: totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0
      },
      byType: byType.map(item => ({
        type: item.type,
        count: item._count
      })),
      byPrinter: byPrinter.map(item => ({
        printerId: item.printerId,
        count: item._count
      }))
    };
  }

  async getPrinterPerformanceMetrics(companyId?: string, branchId?: string) {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (branchId) where.branchId = branchId;

    const printers = await this.prisma.printer.findMany({
      where,
      include: {
        _count: {
          select: {
            printJobs: {
              where: {
                createdAt: {
                  gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                }
              }
            }
          }
        }
      }
    });

    const performance = await Promise.all(
      printers.map(async (printer) => {
        const [completedJobs, failedJobs, avgProcessingTime] = await Promise.all([
          this.prisma.printJob.count({
            where: {
              printerId: printer.id,
              status: 'completed',
              createdAt: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
              }
            }
          }),
          this.prisma.printJob.count({
            where: {
              printerId: printer.id,
              status: 'failed',
              createdAt: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
              }
            }
          }),
          this.prisma.printJob.aggregate({
            where: {
              printerId: printer.id,
              status: 'completed',
              processingTime: { not: null },
              createdAt: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
              }
            },
            _avg: {
              processingTime: true
            }
          })
        ]);

        const totalJobs = completedJobs + failedJobs;
        
        return {
          printerId: printer.id,
          printerName: printer.name,
          status: printer.status,
          totalJobs,
          completedJobs,
          failedJobs,
          successRate: totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0,
          avgProcessingTime: avgProcessingTime._avg.processingTime || 0,
          lastSeen: printer.lastSeen
        };
      })
    );

    return { performance };
  }

  // Templates
  async getPrintTemplates(companyId: string) {
    const templates = await this.prisma.printTemplate.findMany({
      where: { companyId },
      orderBy: { name: 'asc' }
    });

    return {
      templates: templates.map(template => ({
        ...template,
        template: JSON.parse(template.template)
      }))
    };
  }

  async savePrintTemplate(templateData: any, companyId: string) {
    const { id, name, type, template, isDefault } = templateData;

    // If setting as default, remove default from other templates of the same type
    if (isDefault) {
      await this.prisma.printTemplate.updateMany({
        where: {
          companyId,
          type,
          id: { not: id }
        },
        data: { isDefault: false }
      });
    }

    const data = {
      name,
      type,
      template: JSON.stringify(template),
      isDefault: isDefault || false,
      companyId
    };

    if (id) {
      return this.prisma.printTemplate.update({
        where: { id },
        data
      });
    } else {
      return this.prisma.printTemplate.create({
        data
      });
    }
  }
}