import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Company, Prisma } from '@prisma/client';

@Injectable()
export class CompaniesService {
  private readonly logger = new Logger(CompaniesService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a new company (restaurant chain)
   * Inspired by Picolinate's company creation pattern
   */
  async create(createCompanyDto: Prisma.CompanyCreateInput & { 
    licenseDuration?: number 
  }): Promise<Company> {
    try {
      // Check if slug already exists
      const existingCompany = await this.prisma.company.findUnique({
        where: { slug: createCompanyDto.slug },
      });

      if (existingCompany) {
        throw new ConflictException(`Company with slug '${createCompanyDto.slug}' already exists`);
      }

      // Use transaction to create company and license together
      const result = await this.prisma.$transaction(async (prisma) => {
        // Extract license-specific fields from DTO
        const { licenseDuration, ...companyData } = createCompanyDto;
        
        // Create company
        const company = await prisma.company.create({
          data: {
            ...companyData,
            status: companyData.status || 'trial',
          },
        });

        // Create default license with day-based system  
        // Convert months to days if licenseDuration is provided (assuming months)
        const licenseDurationDays = licenseDuration ? licenseDuration * 30 : this.getDefaultDaysForCompanyStatus(companyData.status || 'trial');
        
        const startDate = new Date();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + licenseDurationDays);

        await prisma.license.create({
          data: {
            companyId: company.id,
            status: 'active',
            startDate,
            expiresAt,
            totalDays: licenseDurationDays,
            daysRemaining: licenseDurationDays,
            lastChecked: startDate,
            features: this.getFeaturesForCompanyStatus(companyData.status || 'trial'),
          },
        });

        return company;
      });

      // Fetch the company with all relations
      const company = await this.prisma.company.findUnique({
        where: { id: result.id },
        include: {
          branches: true,
          users: true,
          licenses: {
            where: { status: 'active' },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      this.logger.log(`Created company: ${company.name} (${company.slug}) with license`);
      return company;
    } catch (error) {
      this.logger.error(`Failed to create company: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find all companies with optional filters
   */
  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.CompanyWhereUniqueInput;
    where?: Prisma.CompanyWhereInput;
    orderBy?: Prisma.CompanyOrderByWithRelationInput;
  }): Promise<Company[]> {
    const { skip, take, cursor, where, orderBy } = params;
    
    return this.prisma.company.findMany({
      skip,
      take,
      cursor,
      where: {
        ...where,
        deletedAt: null, // Only return non-deleted companies
      },
      orderBy,
      include: {
        branches: {
          where: { deletedAt: null },
          select: {
            id: true,
            name: true,
            nameAr: true,
            isActive: true,
            isDefault: true,
          },
        },
        users: {
          where: { deletedAt: null },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
          },
        },
        _count: {
          select: {
            branches: true,
            users: true,
          },
        },
      },
    });
  }

  /**
   * Find company by ID or slug
   */
  async findOne(identifier: string): Promise<Company | null> {
    try {
      const company = await this.prisma.company.findFirst({
        where: {
          OR: [
            { id: identifier },
            { slug: identifier },
          ],
          deletedAt: null,
        },
        include: {
          branches: {
            where: { deletedAt: null },
            orderBy: { isDefault: 'desc' },
          },
          users: {
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: {
              branches: true,
              users: true,
            },
          },
        },
      });

      if (!company) {
        throw new NotFoundException(`Company with identifier '${identifier}' not found`);
      }

      return company;
    } catch (error) {
      this.logger.error(`Failed to find company '${identifier}': ${error.message}`);
      throw error;
    }
  }

  /**
   * Update company information
   */
  async update(id: string, updateCompanyDto: Prisma.CompanyUpdateInput & { 
    licenseDuration?: number 
  }): Promise<Company> {
    try {
      const result = await this.prisma.$transaction(async (prisma) => {
        // Extract license-specific fields from DTO
        const { licenseDuration, ...companyData } = updateCompanyDto;
        
        // Update company
        const company = await prisma.company.update({
          where: { 
            id,
            deletedAt: null,
          },
          data: {
            ...companyData,
            updatedAt: new Date(),
          },
          include: {
            branches: true,
            users: true,
          },
        });

        // Update license if license fields are provided or company status changed
        if (licenseDuration !== undefined || companyData.status !== undefined) {
          const currentLicense = await prisma.license.findFirst({
            where: {
              companyId: id,
              status: { in: ['active', 'expired'] },
            },
            orderBy: { createdAt: 'desc' },
          });

          if (currentLicense) {
            const updateData: any = {};
            
            if (companyData.status !== undefined) {
              updateData.features = this.getFeaturesForCompanyStatus(companyData.status as string);
            }

            if (licenseDuration !== undefined) {
              // Convert months to days
              const additionalDays = licenseDuration * 30;
              const now = new Date();
              const newExpiresAt = new Date();
              newExpiresAt.setDate(newExpiresAt.getDate() + additionalDays);
              
              const newDaysRemaining = Math.ceil((newExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

              updateData.expiresAt = newExpiresAt;
              updateData.daysRemaining = newDaysRemaining;
              updateData.totalDays = currentLicense.totalDays + additionalDays;
              updateData.lastChecked = now;
              updateData.status = 'active'; // Reactivate if updating duration
            }

            if (Object.keys(updateData).length > 0) {
              await prisma.license.update({
                where: { id: currentLicense.id },
                data: updateData,
              });
            }
          }
        }

        return company;
      });

      this.logger.log(`Updated company: ${result.name} (${result.id})`);
      return result;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Company with id '${id}' not found`);
      }
      this.logger.error(`Failed to update company '${id}': ${error.message}`);
      throw error;
    }
  }

  /**
   * Soft delete company (mark as deleted)
   */
  async remove(id: string): Promise<Company> {
    try {
      const company = await this.prisma.company.update({
        where: { 
          id,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Soft deleted company: ${company.name} (${company.id})`);
      return company;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Company with id '${id}' not found`);
      }
      this.logger.error(`Failed to delete company '${id}': ${error.message}`);
      throw error;
    }
  }

  /**
   * Get company statistics (inspired by Picolinate's analytics)
   */
  async getStatistics(companyId: string) {
    try {
      const [
        branchesCount,
        activeUsersCount,
        totalUsersCount,
        // ordersCount, // Will implement when orders module is ready
      ] = await Promise.all([
        this.prisma.branch.count({
          where: { 
            companyId,
            deletedAt: null,
            isActive: true,
          },
        }),
        this.prisma.user.count({
          where: { 
            companyId,
            deletedAt: null,
            status: 'active',
          },
        }),
        this.prisma.user.count({
          where: { 
            companyId,
            deletedAt: null,
          },
        }),
      ]);

      return {
        branches: {
          total: branchesCount,
        },
        users: {
          active: activeUsersCount,
          total: totalUsersCount,
        },
        // orders: {
        //   total: ordersCount,
        // },
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to get statistics for company '${companyId}': ${error.message}`);
      throw error;
    }
  }

  /**
   * Get simple list of companies for dropdowns (super_admin only)
   */
  async getCompaniesList() {
    try {
      const companies = await this.prisma.company.findMany({
        where: {
          deletedAt: null,
          status: {
            not: 'suspended',
          },
        },
        select: {
          id: true,
          name: true,
          slug: true,
        },
        orderBy: {
          name: 'asc',
        },
      });

      return { companies };
    } catch (error) {
      this.logger.error(`Failed to get companies list: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if company exists and is active
   */
  async exists(identifier: string): Promise<boolean> {
    try {
      const count = await this.prisma.company.count({
        where: {
          OR: [
            { id: identifier },
            { slug: identifier },
          ],
          deletedAt: null,
          status: {
            not: 'suspended',
          },
        },
      });

      return count > 0;
    } catch (error) {
      this.logger.error(`Failed to check if company exists '${identifier}': ${error.message}`);
      return false;
    }
  }

  /**
   * License helper methods
   */
  private getDefaultDaysForCompanyStatus(status: string): number {
    switch (status) {
      case 'trial': return 30; // 30 days trial
      case 'active': return 365; // 1 year
      default: return 30;
    }
  }


  private getFeaturesForCompanyStatus(status: string): string[] {
    switch (status) {
      case 'trial': return ['basic'];
      case 'active': return ['analytics', 'multi_location'];
      default: return ['basic'];
    }
  }

  /**
   * Update license days remaining and check expiration
   */
  async updateLicenseStatus(companyId: string): Promise<void> {
    try {
      const licenses = await this.prisma.license.findMany({
        where: {
          companyId,
          status: 'active',
        },
      });

      for (const license of licenses) {
        const now = new Date();
        const daysRemaining = Math.ceil((license.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysRemaining <= 0) {
          // License expired - deactivate
          await this.prisma.license.update({
            where: { id: license.id },
            data: {
              status: 'expired',
              daysRemaining: 0,
              lastChecked: now,
            },
          });

          // Also update company status if all licenses expired
          const activeLicenses = await this.prisma.license.count({
            where: {
              companyId,
              status: 'active',
            },
          });

          if (activeLicenses === 0) {
            await this.prisma.company.update({
              where: { id: companyId },
              data: { status: 'suspended' },
            });
          }

          this.logger.warn(`License expired for company ${companyId}. Days remaining: ${daysRemaining}`);
        } else {
          // Update days remaining
          await this.prisma.license.update({
            where: { id: license.id },
            data: {
              daysRemaining,
              lastChecked: now,
            },
          });
        }
      }
    } catch (error) {
      this.logger.error(`Failed to update license status for company ${companyId}: ${error.message}`);
    }
  }

  /**
   * Renew license for a company
   */
  async renewLicense(companyId: string, additionalDays: number): Promise<void> {
    try {
      const license = await this.prisma.license.findFirst({
        where: {
          companyId,
          status: { in: ['active', 'expired'] },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!license) {
        throw new Error('No license found for company');
      }

      const now = new Date();
      const newExpiresAt = new Date(Math.max(license.expiresAt.getTime(), now.getTime()));
      newExpiresAt.setDate(newExpiresAt.getDate() + additionalDays);

      const newDaysRemaining = Math.ceil((newExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      await this.prisma.license.update({
        where: { id: license.id },
        data: {
          status: 'active',
          expiresAt: newExpiresAt,
          daysRemaining: newDaysRemaining,
          totalDays: license.totalDays + additionalDays,
          renewedAt: now,
          lastChecked: now,
        },
      });

      // Reactivate company if it was suspended due to expired license
      await this.prisma.company.update({
        where: { id: companyId },
        data: { status: 'active' },
      });

      this.logger.log(`License renewed for company ${companyId}. Added ${additionalDays} days.`);
    } catch (error) {
      this.logger.error(`Failed to renew license for company ${companyId}: ${error.message}`);
      throw error;
    }
  }
}