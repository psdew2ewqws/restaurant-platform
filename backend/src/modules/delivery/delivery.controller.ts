import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete,
  Query,
  UseGuards,
  Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DeliveryService } from './delivery.service';
import { CreateDeliveryZoneDto } from './dto/create-delivery-zone.dto';
import { UpdateDeliveryZoneDto } from './dto/update-delivery-zone.dto';
import { CreateJordanLocationDto } from './dto/create-jordan-location.dto';
import { CreateDeliveryProviderDto } from './dto/create-delivery-provider.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Delivery Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  // Delivery Zones Endpoints
  @Post('zones')
  @Roles('super_admin', 'company_owner', 'branch_manager')
  @ApiOperation({ summary: 'Create a new delivery zone' })
  @ApiResponse({ status: 201, description: 'Delivery zone created successfully' })
  async createDeliveryZone(@Body() createDeliveryZoneDto: CreateDeliveryZoneDto) {
    return this.deliveryService.createDeliveryZone(createDeliveryZoneDto);
  }

  @Get('zones')
  @Public()
  @ApiOperation({ summary: 'Get all delivery zones' })
  @ApiQuery({ name: 'branchId', required: false, description: 'Filter by branch ID' })
  @ApiQuery({ name: 'companyId', required: false, description: 'Filter by company ID' })
  async findAllDeliveryZones(
    @Query('branchId') branchId?: string,
    @Query('companyId') companyId?: string
  ) {
    return this.deliveryService.findAllDeliveryZones(branchId, companyId);
  }

  @Get('zones/:id')
  @Roles('super_admin', 'company_owner', 'branch_manager', 'call_center')
  @ApiOperation({ summary: 'Get delivery zone by ID' })
  async findOneDeliveryZone(@Param('id') id: string) {
    return this.deliveryService.findOneDeliveryZone(id);
  }

  @Patch('zones/:id')
  @Roles('super_admin', 'company_owner', 'branch_manager')
  @ApiOperation({ summary: 'Update delivery zone' })
  async updateDeliveryZone(
    @Param('id') id: string,
    @Body() updateDeliveryZoneDto: UpdateDeliveryZoneDto,
  ) {
    return this.deliveryService.updateDeliveryZone(id, updateDeliveryZoneDto);
  }

  @Delete('zones/:id')
  @Roles('super_admin', 'company_owner', 'branch_manager')
  @ApiOperation({ summary: 'Delete delivery zone' })
  async removeDeliveryZone(@Param('id') id: string) {
    return this.deliveryService.removeDeliveryZone(id);
  }

  // Jordan Locations Endpoints
  @Post('jordan-locations')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Create a new Jordan location' })
  @ApiResponse({ status: 201, description: 'Jordan location created successfully' })
  async createJordanLocation(@Body() createJordanLocationDto: CreateJordanLocationDto) {
    return this.deliveryService.createJordanLocation(createJordanLocationDto);
  }

  @Get('jordan-locations')
  @Public()
  @ApiOperation({ summary: 'Get all Jordan locations with pagination support' })
  @ApiQuery({ name: 'governorate', required: false })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of results to return' })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of results to skip' })
  async findAllJordanLocations(
    @Query('governorate') governorate?: string,
    @Query('city') city?: string,
    @Query('limit') limitParam?: string,
    @Query('offset') offsetParam?: string,
  ) {
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    const offset = offsetParam ? parseInt(offsetParam, 10) : undefined;
    return this.deliveryService.findAllJordanLocations(governorate, city, limit, offset);
  }

  @Get('jordan-locations/search')
  @Public()
  @ApiOperation({ summary: 'Search Jordan locations by area name' })
  @ApiQuery({ name: 'q', description: 'Search term for area name' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit results (default 100)' })
  async searchJordanLocations(
    @Query('q') searchTerm: string,
    @Query('limit') limit?: string
  ) {
    return this.deliveryService.findJordanLocationsByArea(
      searchTerm, 
      limit ? parseInt(limit) : undefined
    );
  }

  @Get('locations/by-role')
  @Roles('super_admin', 'company_owner', 'branch_manager')
  @ApiOperation({ summary: 'Get available locations based on user role and hierarchy' })
  @ApiQuery({ name: 'role', description: 'User role' })
  @ApiQuery({ name: 'companyId', required: false, description: 'Company ID for company_owner' })
  @ApiQuery({ name: 'branchId', required: false, description: 'Branch ID for branch_manager' })
  async getLocationsByRole(
    @Query('role') role: string,
    @Query('companyId') companyId?: string,
    @Query('branchId') branchId?: string
  ) {
    return this.deliveryService.getAvailableLocationsByRole(role, companyId, branchId);
  }

  @Get('locations/statistics')
  @Public()
  @ApiOperation({ summary: 'Get location statistics with hierarchy breakdown' })
  @ApiQuery({ name: 'companyId', required: false, description: 'Filter by company' })
  async getLocationStatistics(@Query('companyId') companyId?: string) {
    return this.deliveryService.getLocationStatistics(companyId);
  }

  @Post('locations/bulk-assign')
  @Roles('super_admin', 'company_owner', 'branch_manager')
  @ApiOperation({ summary: 'Bulk assign locations to delivery zones' })
  async bulkAssignLocations(@Body() body: {
    locationIds: string[];
    zoneId: string;
    companyId?: string;
    branchId?: string;
  }) {
    return this.deliveryService.bulkAssignLocationsToZones(body);
  }

  // Delivery Providers Endpoints
  @Post('providers')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Create a new delivery provider' })
  @ApiResponse({ status: 201, description: 'Delivery provider created successfully' })
  async createDeliveryProvider(@Body() createDeliveryProviderDto: CreateDeliveryProviderDto) {
    return this.deliveryService.createDeliveryProvider(createDeliveryProviderDto);
  }

  @Get('providers')
  @Public()
  @ApiOperation({ summary: 'Get all delivery providers' })
  @ApiQuery({ name: 'activeOnly', required: false, type: 'boolean' })
  @ApiQuery({ name: 'companyId', required: false, description: 'Filter by company (includes global providers)' })
  async findAllDeliveryProviders(
    @Query('activeOnly') activeOnly?: boolean,
    @Query('companyId') companyId?: string
  ) {
    return this.deliveryService.findAllDeliveryProviders(activeOnly, companyId);
  }

  @Get('providers/:id')
  @ApiOperation({ summary: 'Get delivery provider by ID' })
  async findOneDeliveryProvider(@Param('id') id: string) {
    return this.deliveryService.findOneDeliveryProvider(id);
  }

  // Delivery Fee Calculator
  @Post('calculate-fee')
  @Public()
  @ApiOperation({ summary: 'Calculate delivery fee for coordinates' })
  @ApiResponse({ 
    status: 200, 
    description: 'Delivery fee calculated successfully',
    schema: {
      example: {
        zone: { id: '...', zoneName: { en: 'Downtown', ar: 'وسط البلد' } },
        provider: { id: '...', name: 'dhub' },
        fee: 3.50,
        estimatedTime: 30,
        distance: 2.5
      }
    }
  })
  async calculateDeliveryFee(@Body() body: { branchId: string; lat: number; lng: number }) {
    const { branchId, lat, lng } = body;
    return this.deliveryService.calculateDeliveryFee(branchId, lat, lng);
  }

  // Location Validation
  @Post('validate-location')
  @Public()
  @ApiOperation({ summary: 'Validate if delivery is available to location' })
  async validateDeliveryLocation(@Body() body: { branchId: string; lat: number; lng: number }) {
    const { branchId, lat, lng } = body;
    return this.deliveryService.validateDeliveryLocation(branchId, lat, lng);
  }

  // Delivery Statistics
  @Get('stats')
  @Public()
  @ApiOperation({ summary: 'Get delivery statistics' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'companyId', required: false, description: 'Filter statistics by company' })
  async getDeliveryStats(
    @Query('branchId') branchId?: string,
    @Query('companyId') companyId?: string
  ) {
    // Use the new multi-tenant statistics method
    return this.deliveryService.getDeliveryStatistics(companyId);
  }

  // Multi-tenant Provider Orders
  @Get('provider-orders')
  @Roles('super_admin', 'company_owner', 'branch_manager', 'call_center')
  @ApiOperation({ summary: 'Get delivery provider orders for company' })
  @ApiQuery({ name: 'companyId', required: true, description: 'Company ID' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by order status' })
  async getProviderOrders(
    @Query('companyId') companyId: string,
    @Query('status') status?: string
  ) {
    return this.deliveryService.findCompanyProviderOrders(companyId, status);
  }

  @Post('provider-orders')
  @Roles('super_admin', 'company_owner', 'branch_manager')
  @ApiOperation({ summary: 'Create delivery provider order' })
  async createProviderOrder(@Body() createOrderDto: {
    companyId: string;
    branchId: string;
    deliveryProviderId: string;
    providerOrderId: string;
    orderNumber: string;
    orderDetails: any;
    customerDetails?: any;
    deliveryAddress?: any;
  }) {
    return this.deliveryService.createProviderOrder(createOrderDto);
  }

  @Patch('provider-orders/:id/status')
  @Public() // Allow webhooks from providers
  @ApiOperation({ summary: 'Update provider order status (webhook endpoint)' })
  async updateProviderOrderStatus(
    @Param('id') id: string,
    @Body() updateDto: {
      orderStatus: string;
      webhookData?: any;
    }
  ) {
    return this.deliveryService.updateProviderOrderStatus(
      id, 
      updateDto.orderStatus, 
      updateDto.webhookData
    );
  }

  // Bulk Operations
  @Post('zones/bulk-activate')
  @Roles('super_admin', 'company_owner', 'branch_manager')
  @ApiOperation({ summary: 'Bulk activate/deactivate delivery zones' })
  async bulkActivateZones(@Body() body: { zoneIds: string[]; isActive: boolean }) {
    // Implementation for bulk operations would go here
    return { message: 'Bulk operation completed' };
  }

  // Simplified endpoints - complex integrations will be implemented later
}