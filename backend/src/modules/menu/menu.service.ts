import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PreparationTimeService } from './services/preparation-time.service';
import { CreateProductDto, UpdateProductDto, ProductFiltersDto, BulkStatusUpdateDto, BulkDeleteDto, CreateCategoryDto } from './dto';

@Injectable()
export class MenuService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly preparationTimeService: PreparationTimeService
  ) {}

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

    // Case-insensitive search using Prisma's ILIKE-equivalent for JSONB
    if (search) {
      // Use Prisma raw queries for proper case-insensitive JSONB search
      const searchPattern = `%${search.toLowerCase()}%`;
      
      where.OR = [
        // Search in English names (case-insensitive)
        {
          name: {
            path: ['en'],
            string_contains: search,
            mode: 'insensitive'
          }
        },
        // Search in Arabic names (case-insensitive)  
        {
          name: {
            path: ['ar'],
            string_contains: search,
            mode: 'insensitive'
          }
        },
        // Search in tags (try different cases)
        { 
          tags: { 
            hasSome: [search, search.toLowerCase(), search.toUpperCase()] 
          } 
        }
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
    const { companyId, calculatePreparationTime, preparationTimeOverride, ...productData } = createProductDto;
    
    // Use provided companyId (super_admin) or user's company (others)
    const effectiveCompanyId = companyId || userCompanyId;
    
    if (!effectiveCompanyId) {
      throw new ForbiddenException('Company ID is required');
    }

    // Verify category belongs to the same company
    const category = await this.prisma.menuCategory.findFirst({
      where: { 
        id: productData.categoryId,
        companyId: effectiveCompanyId
      }
    });

    if (!category) {
      throw new NotFoundException('Category not found or does not belong to your company');
    }

    // Calculate or use provided preparation time
    let finalPreparationTime = preparationTimeOverride;
    if (calculatePreparationTime && !preparationTimeOverride) {
      finalPreparationTime = this.preparationTimeService.calculatePreparationTime({
        basePrice: productData.basePrice,
        categoryId: productData.categoryId,
        tags: productData.tags || []
      });
    }

    // Process images array - use first image as primary image for backward compatibility
    const primaryImage = productData.images?.[0] || productData.image;
    const additionalImages = productData.images?.slice(1) || [];

    return this.prisma.menuProduct.create({
      data: {
        ...productData,
        companyId: effectiveCompanyId,
        status: productData.status ?? 1, // Default to active
        priority: productData.priority ?? 999, // Default to end of list
        tags: productData.tags ?? [],
        image: primaryImage,
        images: productData.images || [],
        preparationTime: finalPreparationTime,
        pricing: (productData.pricing as any) || {}
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

    const { companyId, ...updateData } = updateProductDto;
    
    return this.prisma.menuProduct.update({
      where: { id },
      data: updateData as any,
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

  // Get categories for filters and management (includes both active and inactive)
  async getCategories(userCompanyId?: string, userRole?: string) {
    // Super admin can see all categories, regular users only their company's
    const shouldFilterByCompany = userRole !== 'super_admin' && userCompanyId;
    
    const categories = await this.prisma.menuCategory.findMany({
      where: {
        ...(shouldFilterByCompany && { companyId: userCompanyId }),
        // Remove isActive filter so we get both active and inactive categories for management
      },
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        displayNumber: true,
        isActive: true
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

  // Update category
  async updateCategory(id: string, updateCategoryDto: CreateCategoryDto, userCompanyId?: string) {
    const { companyId, ...categoryData } = updateCategoryDto;
    
    // Determine effective company ID for data isolation
    const effectiveCompanyId = userCompanyId || companyId;
    
    if (!effectiveCompanyId) {
      throw new ForbiddenException('Company ID is required');
    }

    // Verify category exists and belongs to user's company
    const existingCategory = await this.prisma.menuCategory.findFirst({
      where: { 
        id, 
        companyId: effectiveCompanyId 
      }
    });

    if (!existingCategory) {
      throw new NotFoundException('Category not found or access denied');
    }

    return this.prisma.menuCategory.update({
      where: { id },
      data: categoryData
    });
  }

  // Delete category
  async deleteCategory(id: string, userCompanyId?: string) {
    // Verify category exists and belongs to user's company
    const existingCategory = await this.prisma.menuCategory.findFirst({
      where: { 
        id, 
        ...(userCompanyId && { companyId: userCompanyId })
      }
    });

    if (!existingCategory) {
      throw new NotFoundException('Category not found or access denied');
    }

    // Check if category has products
    const productCount = await this.prisma.menuProduct.count({
      where: { categoryId: id }
    });

    if (productCount > 0) {
      throw new ForbiddenException('Cannot delete category with existing products. Please move or delete products first.');
    }

    return this.prisma.menuCategory.delete({
      where: { id }
    });
  }
}