import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Modifier, Prisma } from '@prisma/client';
import { CreateModifierDto } from './dto/create-modifier.dto';
import { UpdateModifierDto } from './dto/update-modifier.dto';

@Injectable()
export class ModifiersService {
  private readonly logger = new Logger(ModifiersService.name);

  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateModifierDto, userCompanyId?: string): Promise<Modifier> {
    try {
      const companyId = createDto.companyId || userCompanyId;

      if (!companyId) {
        throw new BadRequestException('Company ID is required');
      }

      // Verify modifier category exists and belongs to company
      const category = await this.prisma.modifierCategory.findFirst({
        where: {
          id: createDto.modifierCategoryId,
          companyId,
          deletedAt: null
        }
      });

      if (!category) {
        throw new NotFoundException(`Modifier category ${createDto.modifierCategoryId} not found or doesn't belong to your company`);
      }

      const modifier = await this.prisma.modifier.create({
        data: {
          companyId,
          modifierCategoryId: createDto.modifierCategoryId,
          name: createDto.name,
          description: createDto.description,
          basePrice: createDto.basePrice,
          pricing: createDto.pricing || {},
          cost: createDto.cost || 0,
          displayNumber: createDto.displayNumber || 0,
          isDefault: createDto.isDefault,
          image: createDto.image,
        },
        include: {
          modifierCategory: {
            select: {
              id: true,
              name: true,
              selectionType: true
            }
          }
        }
      });

      this.logger.log(`Created modifier: ${JSON.stringify(modifier.name)} in category ${createDto.modifierCategoryId}`);
      return modifier;
    } catch (error) {
      this.logger.error(`Failed to create modifier: ${error.message}`);
      throw error;
    }
  }

  async findAll(params: {
    companyId?: string;
    categoryId?: string;
    skip?: number;
    take?: number;
    search?: string;
    status?: number;
  }) {
    const { companyId, categoryId, skip, take = 50, search, status } = params;

    const where: Prisma.ModifierWhereInput = {
      deletedAt: null,
      ...(companyId && { companyId }),
      ...(categoryId && { modifierCategoryId: categoryId }),
      ...(status !== undefined && { status }),
      ...(search && {
        OR: [
          { name: { path: ['en'], string_contains: search } },
          { name: { path: ['ar'], string_contains: search } },
          { description: { path: ['en'], string_contains: search } },
          { description: { path: ['ar'], string_contains: search } },
        ]
      })
    };

    return this.prisma.modifier.findMany({
      where,
      skip,
      take,
      orderBy: [
        { modifierCategoryId: 'asc' },
        { displayNumber: 'asc' }
      ],
      include: {
        modifierCategory: {
          select: {
            id: true,
            name: true,
            selectionType: true,
            isRequired: true
          }
        }
      }
    });
  }

  async findByCategoryId(categoryId: string, companyId?: string) {
    return this.prisma.modifier.findMany({
      where: {
        modifierCategoryId: categoryId,
        deletedAt: null,
        status: 1,
        ...(companyId && { companyId })
      },
      orderBy: { displayNumber: 'asc' },
      include: {
        modifierCategory: {
          select: {
            id: true,
            name: true,
            selectionType: true,
            isRequired: true,
            minSelections: true,
            maxSelections: true
          }
        }
      }
    });
  }

  async findOne(id: string, companyId?: string): Promise<Modifier> {
    const modifier = await this.prisma.modifier.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(companyId && { companyId })
      },
      include: {
        modifierCategory: {
          select: {
            id: true,
            name: true,
            selectionType: true,
            isRequired: true,
            minSelections: true,
            maxSelections: true
          }
        }
      }
    });

    if (!modifier) {
      throw new NotFoundException(`Modifier with ID ${id} not found`);
    }

    return modifier;
  }

  async update(id: string, updateDto: UpdateModifierDto, companyId?: string): Promise<Modifier> {
    try {
      // If modifierCategoryId is being updated, verify it exists and belongs to company
      if (updateDto.modifierCategoryId) {
        const category = await this.prisma.modifierCategory.findFirst({
          where: {
            id: updateDto.modifierCategoryId,
            companyId: companyId,
            deletedAt: null
          }
        });

        if (!category) {
          throw new NotFoundException(`Modifier category ${updateDto.modifierCategoryId} not found or doesn't belong to your company`);
        }
      }

      const modifier = await this.prisma.modifier.update({
        where: { 
          id,
          deletedAt: null,
          ...(companyId && { companyId })
        },
        data: {
          ...updateDto,
          updatedAt: new Date()
        },
        include: {
          modifierCategory: {
            select: {
              id: true,
              name: true,
              selectionType: true,
              isRequired: true
            }
          }
        }
      });

      this.logger.log(`Updated modifier: ${id}`);
      return modifier;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Modifier with ID ${id} not found`);
      }
      this.logger.error(`Failed to update modifier ${id}: ${error.message}`);
      throw error;
    }
  }

  async remove(id: string, companyId?: string): Promise<Modifier> {
    try {
      const modifier = await this.prisma.modifier.update({
        where: { 
          id,
          deletedAt: null,
          ...(companyId && { companyId })
        },
        data: {
          deletedAt: new Date(),
          updatedAt: new Date()
        }
      });

      this.logger.log(`Soft deleted modifier: ${id}`);
      return modifier;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Modifier with ID ${id} not found`);
      }
      this.logger.error(`Failed to delete modifier ${id}: ${error.message}`);
      throw error;
    }
  }

  async updateStatus(id: string, status: number, companyId?: string): Promise<Modifier> {
    try {
      const modifier = await this.prisma.modifier.update({
        where: { 
          id,
          deletedAt: null,
          ...(companyId && { companyId })
        },
        data: {
          status,
          updatedAt: new Date()
        }
      });

      this.logger.log(`Updated modifier status: ${id} -> ${status}`);
      return modifier;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Modifier with ID ${id} not found`);
      }
      throw error;
    }
  }

  async bulkUpdateStatus(ids: string[], status: number, companyId?: string): Promise<number> {
    const result = await this.prisma.modifier.updateMany({
      where: {
        id: { in: ids },
        deletedAt: null,
        ...(companyId && { companyId })
      },
      data: {
        status,
        updatedAt: new Date()
      }
    });

    this.logger.log(`Bulk updated ${result.count} modifiers to status ${status}`);
    return result.count;
  }

  async getStatistics(companyId?: string) {
    const where = {
      deletedAt: null,
      ...(companyId && { companyId })
    };

    const [
      totalModifiers,
      activeModifiers,
      defaultModifiers,
      withPricing
    ] = await Promise.all([
      this.prisma.modifier.count({ where }),
      this.prisma.modifier.count({ where: { ...where, status: 1 } }),
      this.prisma.modifier.count({ where: { ...where, isDefault: true } }),
      this.prisma.modifier.count({ 
        where: { 
          ...where, 
          OR: [
            { basePrice: { gt: 0 } },
            { pricing: { not: {} } }
          ]
        }
      })
    ]);

    return {
      total: totalModifiers,
      active: activeModifiers,
      inactive: totalModifiers - activeModifiers,
      defaults: defaultModifiers,
      withPricing: withPricing,
      free: totalModifiers - withPricing
    };
  }

  async reorderModifiers(categoryId: string, modifierIds: string[], companyId?: string): Promise<void> {
    try {
      // Verify all modifiers belong to the category and company
      const modifiers = await this.prisma.modifier.findMany({
        where: {
          id: { in: modifierIds },
          modifierCategoryId: categoryId,
          deletedAt: null,
          ...(companyId && { companyId })
        }
      });

      if (modifiers.length !== modifierIds.length) {
        throw new BadRequestException('Some modifiers do not belong to the specified category or company');
      }

      // Update display numbers
      const updates = modifierIds.map((id, index) => 
        this.prisma.modifier.update({
          where: { id },
          data: { displayNumber: index + 1 }
        })
      );

      await Promise.all(updates);
      
      this.logger.log(`Reordered ${modifierIds.length} modifiers in category ${categoryId}`);
    } catch (error) {
      this.logger.error(`Failed to reorder modifiers: ${error.message}`);
      throw error;
    }
  }
}