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
  async create(createCompanyDto: Prisma.CompanyCreateInput): Promise<Company> {
    try {
      // Check if slug already exists
      const existingCompany = await this.prisma.company.findUnique({
        where: { slug: createCompanyDto.slug },
      });

      if (existingCompany) {
        throw new ConflictException(`Company with slug '${createCompanyDto.slug}' already exists`);
      }

      const company = await this.prisma.company.create({
        data: {
          ...createCompanyDto,
          status: createCompanyDto.status || 'trial', // Default to trial like Picolinate
        },
        include: {
          branches: true,
          users: true,
        },
      });

      this.logger.log(`Created company: ${company.name} (${company.slug})`);
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
  async update(id: string, updateCompanyDto: Prisma.CompanyUpdateInput): Promise<Company> {
    try {
      const company = await this.prisma.company.update({
        where: { 
          id,
          deletedAt: null,
        },
        data: {
          ...updateCompanyDto,
          updatedAt: new Date(),
        },
        include: {
          branches: true,
          users: true,
        },
      });

      this.logger.log(`Updated company: ${company.name} (${company.id})`);
      return company;
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
}