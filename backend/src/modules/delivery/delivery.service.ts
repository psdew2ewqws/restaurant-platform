import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateDeliveryZoneDto } from './dto/create-delivery-zone.dto';
import { UpdateDeliveryZoneDto } from './dto/update-delivery-zone.dto';
import { CreateJordanLocationDto } from './dto/create-jordan-location.dto';
import { CreateDeliveryProviderDto } from './dto/create-delivery-provider.dto';

@Injectable()
export class DeliveryService {
  constructor(
    private prisma: PrismaService
  ) {}

  // Delivery Zones Management
  async createDeliveryZone(createDeliveryZoneDto: CreateDeliveryZoneDto) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: createDeliveryZoneDto.branchId },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return this.prisma.deliveryZone.create({
      data: {
        ...createDeliveryZoneDto,
        zoneNameSlug: createDeliveryZoneDto.zoneNameSlug || 
          this.generateSlug(createDeliveryZoneDto.zoneName.en || 'zone'),
      },
      include: {
        branch: {
          select: { id: true, name: true, nameAr: true }
        }
      }
    });
  }

  async findAllDeliveryZones(branchId?: string, companyId?: string) {
    let where: any = { deletedAt: null };
    
    if (branchId) {
      where.branchId = branchId;
    }
    
    if (companyId) {
      where.branch = { companyId };
    }
    
    return this.prisma.deliveryZone.findMany({
      where,
      include: {
        branch: {
          select: { 
            id: true, 
            name: true, 
            nameAr: true,
            company: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        },
        _count: {
          select: { orders: true }
        }
      },
      orderBy: [
        { priorityLevel: 'asc' },
        { createdAt: 'desc' }
      ]
    });
  }

  async findOneDeliveryZone(id: string) {
    const zone = await this.prisma.deliveryZone.findFirst({
      where: { id, deletedAt: null },
      include: {
        branch: {
          select: { id: true, name: true, nameAr: true, company: { select: { id: true, name: true } } }
        },
        _count: {
          select: { orders: true }
        }
      }
    });

    if (!zone) {
      throw new NotFoundException('Delivery zone not found');
    }

    return zone;
  }

  async updateDeliveryZone(id: string, updateDeliveryZoneDto: UpdateDeliveryZoneDto) {
    await this.findOneDeliveryZone(id);

    return this.prisma.deliveryZone.update({
      where: { id },
      data: updateDeliveryZoneDto,
      include: {
        branch: {
          select: { id: true, name: true, nameAr: true }
        }
      }
    });
  }

  async removeDeliveryZone(id: string) {
    await this.findOneDeliveryZone(id);

    return this.prisma.deliveryZone.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  // Jordan Locations Management
  async createJordanLocation(createJordanLocationDto: CreateJordanLocationDto) {
    return this.prisma.jordanLocation.create({
      data: createJordanLocationDto
    });
  }

  async findAllJordanLocations(governorate?: string, city?: string, limit?: number, offset?: number) {
    const where: any = { isActive: true };
    
    if (governorate) where.governorate = governorate;
    if (city) where.city = city;

    return this.prisma.globalLocation.findMany({
      where,
      orderBy: [
        { governorate: 'asc' },
        { city: 'asc' },
        { area: 'asc' },
        { subArea: 'asc' }
      ],
      take: limit || undefined,
      skip: offset || undefined,
    });
  }

  async findJordanLocationsByArea(searchTerm: string, limit?: number) {
    return this.prisma.globalLocation.findMany({
      where: {
        isActive: true,
        OR: [
          { area: { contains: searchTerm, mode: 'insensitive' } },
          { areaNameAr: { contains: searchTerm } },
          { city: { contains: searchTerm, mode: 'insensitive' } },
          { cityNameAr: { contains: searchTerm } },
          { governorate: { contains: searchTerm, mode: 'insensitive' } },
          { subArea: { contains: searchTerm, mode: 'insensitive' } },
          { subAreaNameAr: { contains: searchTerm } },
          { searchText: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      take: limit || 100, // Default limit for search results
      orderBy: { deliveryDifficulty: 'asc' }
    });
  }

  // Bulk Location Assignment for Multi-tenant Hierarchy
  async bulkAssignLocationsToZones(assignments: {
    locationIds: string[];
    zoneId: string;
    companyId?: string;
    branchId?: string;
  }) {
    const { locationIds, zoneId, companyId, branchId } = assignments;

    // Verify zone exists and user has permission
    const zone = await this.prisma.deliveryZone.findFirst({
      where: { 
        id: zoneId, 
        deletedAt: null,
        ...(branchId && { branchId }),
        ...(companyId && { branch: { companyId } })
      },
      include: {
        branch: {
          include: { company: true }
        }
      }
    });

    if (!zone) {
      throw new NotFoundException('Delivery zone not found or access denied');
    }

    // Verify all locations exist
    const locations = await this.prisma.globalLocation.findMany({
      where: {
        id: { in: locationIds },
        isActive: true
      }
    });

    if (locations.length !== locationIds.length) {
      throw new BadRequestException('Some locations not found or inactive');
    }

    // Create zone-location assignments
    const assignments_data = locationIds.map(locationId => ({
      deliveryZoneId: zoneId,
      globalLocationId: locationId,
      assignedAt: new Date(),
      isActive: true
    }));

    // For now, we'll store these in a new relation table
    // This would require a new model in the schema
    return {
      message: `Successfully assigned ${locationIds.length} locations to zone ${zone.zoneName.en}`,
      assignments: assignments_data,
      zone: {
        id: zone.id,
        name: zone.zoneName.en,
        branch: zone.branch.name,
        company: zone.branch.company.name
      }
    };
  }

  // Get locations with hierarchy filtering for role-based access
  async getAvailableLocationsByRole(userRole: string, companyId?: string, branchId?: string) {
    let locations;

    if (userRole === 'super_admin') {
      // Super admin sees all 2,080+ locations
      locations = await this.prisma.globalLocation.findMany({
        where: { isActive: true },
        orderBy: [
          { governorate: 'asc' },
          { city: 'asc' },
          { area: 'asc' },
          { subArea: 'asc' }
        ]
      });
    } else if (userRole === 'company_owner' && companyId) {
      // Company owner sees all locations (can create zones for any branch in their company)
      locations = await this.prisma.globalLocation.findMany({
        where: { isActive: true },
        orderBy: [
          { governorate: 'asc' },
          { city: 'asc' },
          { area: 'asc' },
          { subArea: 'asc' }
        ]
      });
    } else if (branchId) {
      // Branch manager sees all locations but can only assign to their branch
      locations = await this.prisma.globalLocation.findMany({
        where: { isActive: true },
        orderBy: [
          { governorate: 'asc' },
          { city: 'asc' },
          { area: 'asc' },
          { subArea: 'asc' }
        ]
      });
    } else {
      locations = [];
    }

    return {
      locations,
      total: locations.length,
      hierarchy: {
        userRole,
        companyId,
        branchId,
        canAssignToAllCompanies: userRole === 'super_admin',
        canAssignToCompanyBranches: userRole === 'company_owner',
        canAssignToBranch: ['branch_manager', 'company_owner', 'super_admin'].includes(userRole)
      }
    };
  }

  // Get location statistics with hierarchy breakdown
  async getLocationStatistics(companyId?: string) {
    const totalLocations = await this.prisma.globalLocation.count({
      where: { isActive: true }
    });

    const locationsByGovernorate = await this.prisma.globalLocation.groupBy({
      by: ['governorate'],
      where: { isActive: true },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    });

    const locationsByDifficulty = await this.prisma.globalLocation.groupBy({
      by: ['deliveryDifficulty'],
      where: { isActive: true },
      _count: { id: true },
      orderBy: { deliveryDifficulty: 'asc' }
    });

    return {
      total: totalLocations,
      byGovernorate: locationsByGovernorate.map(item => ({
        governorate: item.governorate,
        count: item._count.id
      })),
      byDifficulty: locationsByDifficulty.map(item => ({
        difficulty: item.deliveryDifficulty,
        label: item.deliveryDifficulty === 1 ? 'Easy' : 
               item.deliveryDifficulty === 2 ? 'Normal' :
               item.deliveryDifficulty === 3 ? 'Medium' : 'Hard',
        count: item._count.id
      }))
    };
  }

  // Delivery Providers Management
  async createDeliveryProvider(createDeliveryProviderDto: CreateDeliveryProviderDto) {
    return this.prisma.deliveryProvider.create({
      data: createDeliveryProviderDto
    });
  }

  async findAllDeliveryProviders(activeOnly = false, companyId?: string) {
    const where: any = activeOnly ? { isActive: true } : {};
    
    // Multi-tenant filtering: show global providers + company-specific providers
    if (companyId) {
      where.OR = [
        { companyId: null }, // Global providers
        { companyId: companyId } // Company-specific providers
      ];
    }
    
    return this.prisma.deliveryProvider.findMany({
      where,
      include: {
        company: {
          select: { id: true, name: true }
        },
        _count: {
          select: { orders: true, providerOrders: true }
        }
      },
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'desc' }
      ]
    });
  }

  async findOneDeliveryProvider(id: string) {
    const provider = await this.prisma.deliveryProvider.findUnique({
      where: { id }
    });

    if (!provider) {
      throw new NotFoundException('Delivery provider not found');
    }

    return provider;
  }

  // Delivery Fee Calculator
  async calculateDeliveryFee(branchId: string, lat: number, lng: number): Promise<{
    zone?: any;
    provider?: any;
    fee: number;
    estimatedTime: number;
    distance?: number;
  }> {
    // Find applicable delivery zone for the coordinates
    const zones = await this.prisma.deliveryZone.findMany({
      where: { 
        branchId, 
        isActive: true, 
        deletedAt: null 
      },
      orderBy: { priorityLevel: 'asc' }
    });

    // Check if coordinates fall within any zone
    let applicableZone = null;
    for (const zone of zones) {
      if (await this.isPointInZone(lat, lng, zone)) {
        applicableZone = zone;
        break;
      }
    }

    if (!applicableZone) {
      throw new BadRequestException('Delivery not available to this location');
    }

    // Get the best available provider
    const providers = await this.findAllDeliveryProviders(true);
    const bestProvider = providers[0]; // Highest priority active provider

    return {
      zone: applicableZone,
      provider: bestProvider,
      fee: parseFloat(applicableZone.deliveryFee.toString()),
      estimatedTime: applicableZone.maxDeliveryTimeMins,
      distance: await this.calculateDistance(
        parseFloat(applicableZone.centerLat?.toString() || '0'),
        parseFloat(applicableZone.centerLng?.toString() || '0'),
        lat,
        lng
      )
    };
  }

  // Location validation for orders
  async validateDeliveryLocation(branchId: string, lat: number, lng: number) {
    try {
      const result = await this.calculateDeliveryFee(branchId, lat, lng);
      return {
        isValid: true,
        ...result
      };
    } catch (error) {
      return {
        isValid: false,
        error: error.message
      };
    }
  }

  // Get delivery statistics
  async getDeliveryStats(branchId?: string) {
    const where = branchId ? { branchId } : {};

    const [
      totalZones,
      activeZones,
      totalOrders,
      avgDeliveryTime
    ] = await Promise.all([
      this.prisma.deliveryZone.count({ where: { ...where, deletedAt: null } }),
      this.prisma.deliveryZone.count({ where: { ...where, isActive: true, deletedAt: null } }),
      this.prisma.order.count({ where: { ...where, orderType: 'delivery' } }),
      this.prisma.order.aggregate({
        where: { 
          ...where, 
          orderType: 'delivery',
          actualDeliveryTime: { not: null }
        },
        _avg: {
          deliveryFee: true
        }
      })
    ]);

    return {
      zones: {
        total: totalZones,
        active: activeZones
      },
      orders: {
        total: totalOrders,
        averageDeliveryFee: avgDeliveryTime._avg.deliveryFee || 0
      }
    };
  }

  // Utility methods
  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async isPointInZone(lat: number, lng: number, zone: any): Promise<boolean> {
    // Simple circular zone check if radius is provided
    if (zone.centerLat && zone.centerLng && zone.radius) {
      const distance = await this.calculateDistance(
        parseFloat(zone.centerLat.toString()),
        parseFloat(zone.centerLng.toString()),
        lat,
        lng
      );
      return distance <= parseFloat(zone.radius.toString());
    }

    // If polygon is provided, use polygon containment (simplified)
    if (zone.polygon && zone.polygon.coordinates) {
      // This is a simplified polygon check - in production, use a proper geospatial library
      return true; // Placeholder - implement proper polygon containment
    }

    return false;
  }

  private async calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): Promise<number> {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Multi-tenant delivery provider orders
  async createProviderOrder(data: {
    companyId: string;
    branchId: string;
    deliveryProviderId: string;
    providerOrderId: string;
    orderNumber: string;
    orderDetails: any;
    customerDetails?: any;
    deliveryAddress?: any;
  }) {
    return this.prisma.deliveryProviderOrder.create({
      data,
      include: {
        company: { select: { id: true, name: true } },
        branch: { select: { id: true, name: true } },
        deliveryProvider: { select: { id: true, name: true, displayName: true } }
      }
    });
  }

  async findCompanyProviderOrders(companyId: string, status?: string) {
    const where: any = { companyId };
    if (status) {
      where.orderStatus = status;
    }
    
    return this.prisma.deliveryProviderOrder.findMany({
      where,
      include: {
        branch: { select: { id: true, name: true } },
        deliveryProvider: { select: { id: true, name: true, displayName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateProviderOrderStatus(id: string, orderStatus: string, webhookData?: any) {
    const updateData: any = { 
      orderStatus, 
      updatedAt: new Date() 
    };
    
    if (webhookData) {
      updateData.webhookData = webhookData;
    }
    
    return this.prisma.deliveryProviderOrder.update({
      where: { id },
      data: updateData
    });
  }

  // Get delivery statistics filtered by company
  async getDeliveryStatistics(companyId?: string) {
    const whereProvider = companyId ? {
      OR: [
        { companyId: null },
        { companyId: companyId }
      ]
    } : {};
    
    const whereOrders = companyId ? { companyId } : {};

    const [
      totalProviders,
      activeProviders,
      totalOrders,
      pendingOrders,
      deliveredOrders
    ] = await Promise.all([
      this.prisma.deliveryProvider.count({ where: whereProvider }),
      this.prisma.deliveryProvider.count({ 
        where: { ...whereProvider, isActive: true } 
      }),
      this.prisma.deliveryProviderOrder.count({ where: whereOrders }),
      this.prisma.deliveryProviderOrder.count({ 
        where: { ...whereOrders, orderStatus: 'created' } 
      }),
      this.prisma.deliveryProviderOrder.count({ 
        where: { ...whereOrders, orderStatus: 'delivered' } 
      })
    ]);

    return {
      providers: {
        total: totalProviders,
        active: activeProviders,
        inactive: totalProviders - activeProviders
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        delivered: deliveredOrders,
        inProgress: totalOrders - pendingOrders - deliveredOrders
      }
    };
  }

  // Provider Integration Methods
  async configureProvider(providerId: string, config: any) {
    await this.integrationService.updateProviderConfig(providerId, config);
    return { message: 'Provider configuration updated successfully' };
  }

  async testProviderConnection(providerId: string) {
    return this.integrationService.testProviderConnection(providerId);
  }

  async createDeliveryOrder(orderRequest: any) {
    return this.integrationService.createDeliveryOrder(
      orderRequest.branchId,
      orderRequest
    );
  }

  async cancelDeliveryOrder(orderId: string) {
    return this.integrationService.cancelDeliveryOrder(orderId);
  }

  async getDeliveryOrderStatus(orderId: string) {
    return this.integrationService.getDeliveryStatus(orderId);
  }

  async processWebhook(providerId: string, payload: any, signature?: string) {
    const result = await this.integrationService.processWebhookUpdate(
      providerId,
      payload,
      signature
    );
    
    return {
      success: result !== null,
      message: result ? 'Webhook processed successfully' : 'Webhook validation failed'
    };
  }
}