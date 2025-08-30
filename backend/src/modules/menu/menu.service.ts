import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateProductDto, UpdateProductDto, ProductFiltersDto, BulkStatusUpdateDto, BulkDeleteDto, CreateCategoryDto } from './dto';

@Injectable()
export class MenuService {
  constructor(private readonly prisma: PrismaService) {}

  // Enterprise paginated products with company isolation
  async getPaginatedProducts(filters: ProductFiltersDto, userCompanyId?: string, userRole?: string) {
    const {
      search,
      categoryId,
      status,
      tags,
      sortBy = 'priority',
      sortOrder = 'asc',
      page = 1,
      limit = 50,
      companyId
    } = filters;

    // Company isolation - super_admin users can see all companies' products, others only their own
    let effectiveCompanyId;
    if (userRole === 'super_admin') {
      effectiveCompanyId = companyId; // Super admin can optionally filter by specific company
    } else {
      effectiveCompanyId = companyId || userCompanyId; // Regular users restricted to their company
    }
    
    const where: any = {
      ...(effectiveCompanyId && { companyId: effectiveCompanyId }),
      ...(status !== undefined && { status }),
      ...(categoryId && { categoryId }),
      ...(tags?.length && { tags: { hasEvery: tags } }),
    };

    // Multi-language search across name fields
    if (search) {
      where.OR = [
        { name: { path: ['en'], string_contains: search } },
        { name: { path: ['ar'], string_contains: search } },
        { tags: { has: search } }
      ];
    }

    // Sorting configuration
    const orderBy: any = {};
    if (sortBy === 'name') {
      orderBy.name = { path: ['en'] };
    } else if (sortBy === 'price') {
      orderBy.basePrice = sortOrder;
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder;
    } else if (sortBy === 'priority') {
      orderBy.priority = sortOrder;
    }

    const skip = (page - 1) * limit;

    const [products, totalCount] = await Promise.all([
      this.prisma.menuProduct.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true }
          }
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.menuProduct.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;

    return {
      products,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore
      }
    };
  }

  // Create new product with company isolation
  async createProduct(createProductDto: CreateProductDto, userCompanyId?: string) {
    const { companyId, ...productData } = createProductDto;
    
    // Use provided companyId (super_admin) or user's company (others)
    const effectiveCompanyId = companyId || userCompanyId;
    
    if (!effectiveCompanyId) {
      throw new ForbiddenException('Company ID is required');
    }

    // Verify category belongs to the same company
    if (productData.categoryId) {
      const category = await this.prisma.menuCategory.findFirst({
        where: { 
          id: productData.categoryId,
          companyId: effectiveCompanyId
        }
      });

      if (!category) {
        throw new NotFoundException('Category not found or does not belong to your company');
      }
    }

    return this.prisma.menuProduct.create({
      data: {
        ...productData,
        companyId: effectiveCompanyId,
        status: productData.status ?? 1, // Default to active
        priority: productData.priority ?? 0,
        tags: productData.tags ?? []
      },
      include: {
        category: {
          select: { id: true, name: true }
        }
      }
    });
  }

  // Get single product with company isolation
  async getProduct(id: string, userCompanyId?: string) {
    const product = await this.prisma.menuProduct.findFirst({
      where: { 
        id,
        ...(userCompanyId && { companyId: userCompanyId })
      },
      include: {
        category: {
          select: { id: true, name: true, companyId: true }
        }
      }
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  // Update product with company isolation
  async updateProduct(id: string, updateProductDto: UpdateProductDto, userCompanyId?: string) {
    // Verify product exists and belongs to company
    const existingProduct = await this.getProduct(id, userCompanyId);

    // Verify new category belongs to same company if changed
    if (updateProductDto.categoryId && updateProductDto.categoryId !== existingProduct.categoryId) {
      const category = await this.prisma.menuCategory.findFirst({
        where: { 
          id: updateProductDto.categoryId,
          companyId: existingProduct.companyId
        }
      });

      if (!category) {
        throw new NotFoundException('Category not found or does not belong to your company');
      }
    }

    return this.prisma.menuProduct.update({
      where: { id },
      data: updateProductDto,
      include: {
        category: {
          select: { id: true, name: true }
        }
      }
    });
  }

  // Delete product with company isolation
  async deleteProduct(id: string, userCompanyId?: string) {
    // Verify product exists and belongs to company
    await this.getProduct(id, userCompanyId);

    return this.prisma.menuProduct.delete({
      where: { id }
    });
  }

  // Bulk status update with company isolation
  async bulkUpdateStatus(bulkStatusDto: BulkStatusUpdateDto, userCompanyId?: string) {
    const { productIds, status } = bulkStatusDto;

    // Verify all products belong to the company
    const products = await this.prisma.menuProduct.findMany({
      where: {
        id: { in: productIds },
        ...(userCompanyId && { companyId: userCompanyId })
      }
    });

    if (products.length !== productIds.length) {
      throw new ForbiddenException('Some products do not exist or do not belong to your company');
    }

    const result = await this.prisma.menuProduct.updateMany({
      where: {
        id: { in: productIds },
        ...(userCompanyId && { companyId: userCompanyId })
      },
      data: { status }
    });

    return { updatedCount: result.count };
  }

  // Bulk delete with company isolation
  async bulkDelete(bulkDeleteDto: BulkDeleteDto, userCompanyId?: string) {
    const { productIds } = bulkDeleteDto;

    // Verify all products belong to the company
    const products = await this.prisma.menuProduct.findMany({
      where: {
        id: { in: productIds },
        ...(userCompanyId && { companyId: userCompanyId })
      }
    });

    if (products.length !== productIds.length) {
      throw new ForbiddenException('Some products do not exist or do not belong to your company');
    }

    const result = await this.prisma.menuProduct.deleteMany({
      where: {
        id: { in: productIds },
        ...(userCompanyId && { companyId: userCompanyId })
      }
    });

    return { deletedCount: result.count };
  }

  // Get categories for filters
  async getCategories(userCompanyId?: string, userRole?: string) {
    // Super admin can see all categories, regular users only their company's
    const shouldFilterByCompany = userRole !== 'super_admin' && userCompanyId;
    
    const categories = await this.prisma.menuCategory.findMany({
      where: {
        ...(shouldFilterByCompany && { companyId: userCompanyId }),
        isActive: true // Using isActive instead of status
      },
      select: {
        id: true,
        name: true,
        description: true,
        image: true
      },
      orderBy: { displayNumber: 'asc' }
    });

    return { categories };
  }

  // Get available tags for filters
  async getTags(userCompanyId?: string) {
    // Get unique tags from all products in the company
    const products = await this.prisma.menuProduct.findMany({
      where: {
        ...(userCompanyId && { companyId: userCompanyId }),
        status: 1
      },
      select: { tags: true }
    });

    // Extract unique tags
    const allTags = products.flatMap(product => product.tags);
    const uniqueTags = [...new Set(allTags)].filter(tag => tag && tag.trim());

    return { tags: uniqueTags.sort() };
  }

  // Create category
  async createCategory(createCategoryDto: CreateCategoryDto, userCompanyId?: string) {
    const { companyId, ...categoryData } = createCategoryDto;
    const effectiveCompanyId = companyId || userCompanyId;
    
    if (!effectiveCompanyId) {
      throw new ForbiddenException('Company ID is required');
    }

    // Get next display number
    const maxDisplayNumber = await this.prisma.menuCategory.aggregate({
      where: { companyId: effectiveCompanyId },
      _max: { displayNumber: true }
    });

    return this.prisma.menuCategory.create({
      data: {
        ...categoryData,
        companyId: effectiveCompanyId,
        displayNumber: (maxDisplayNumber._max.displayNumber || 0) + 1,
        isActive: true // Default to active
      }
    });
  }

  // Get product statistics for dashboard
  async getProductStats(userCompanyId?: string) {
    const where = userCompanyId ? { companyId: userCompanyId } : {};

    const [totalProducts, activeProducts, avgPrice, categoryCount] = await Promise.all([
      this.prisma.menuProduct.count({ where }),
      this.prisma.menuProduct.count({ where: { ...where, status: 1 } }),
      this.prisma.menuProduct.aggregate({
        where,
        _avg: { basePrice: true }
      }),
      this.prisma.menuCategory.count({ where })
    ]);

    return {
      totalProducts,
      activeProducts,
      inactiveProducts: totalProducts - activeProducts,
      avgPrice: avgPrice._avg.basePrice || 0,
      categoryCount
    };
  }
}