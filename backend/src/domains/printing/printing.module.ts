import { Module } from '@nestjs/common';
import { PrintingService } from './printing.service';
import { PrintingController } from './printing.controller';
import { PrinterDiscoveryService } from './services/printer-discovery.service';
import { PrintJobService } from './services/print-job.service';
import { ESCPOSService } from './services/escpos.service';
// import { AIESCPOSService } from './services/ai-escpos.service';
import { PrintingWebSocketGateway } from './gateways/printing-websocket.gateway';
import { NetworkDiscoveryService } from './discovery/network-discovery.service';
import { TenantPrintingService } from './services/tenant-printing.service';
import { DatabaseModule } from '../../shared/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [PrintingController],
  providers: [
    PrintingService,
    PrinterDiscoveryService,
    PrintJobService,
    ESCPOSService,
    // AIESCPOSService,
    PrintingWebSocketGateway,
    NetworkDiscoveryService,
    TenantPrintingService
  ],
  exports: [PrintingService, PrintJobService, /* AIESCPOSService, */ PrintingWebSocketGateway, TenantPrintingService]
})
export class PrintingModule {}