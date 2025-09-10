import { Module } from '@nestjs/common';
import { PrintingService } from './printing.service';
import { PrintingController } from './printing.controller';
// import { TestMenuHereController } from '../../test-menuhere.controller';
import { PrinterDiscoveryService } from './services/printer-discovery.service';
import { PrintJobService } from './services/print-job.service';
import { ESCPOSService } from './services/escpos.service';
import { MenuHereIntegrationService } from './services/menuhere-integration.service';
// import { AIESCPOSService } from './services/ai-escpos.service';
import { PrintingWebSocketGateway } from './gateways/printing-websocket.gateway';
import { NetworkDiscoveryService } from './discovery/network-discovery.service';
import { TenantPrintingService } from './services/tenant-printing.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [PrintingController], // TestMenuHereController temporarily disabled
  providers: [
    PrintingService,
    PrinterDiscoveryService,
    PrintJobService,
    ESCPOSService,
    MenuHereIntegrationService,
    // AIESCPOSService,
    PrintingWebSocketGateway,
    NetworkDiscoveryService,
    TenantPrintingService
  ],
  exports: [PrintingService, PrintJobService, MenuHereIntegrationService, /* AIESCPOSService, */ PrintingWebSocketGateway, TenantPrintingService]
})
export class PrintingModule {}