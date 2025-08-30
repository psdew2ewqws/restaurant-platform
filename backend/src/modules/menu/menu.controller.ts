import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CompanyGuard } from '../../common/guards/company.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductFiltersDto,
  BulkStatusUpdateDto,
  BulkDeleteDto,
  CreateCategoryDto
} from './dto';

@Controller('menu')
@UseGuards(JwtAuthGuard, RolesGuard, CompanyGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // Get paginated products for VirtualizedProductGrid
  @Post('products/paginated')
  @Roles('super_admin', 'company_owner', 'branch_manager', 'call_center', 'cashier')
  async getPaginatedProducts(@Body() filters: ProductFiltersDto, @Request() req) {
    // Super admin can specify companyId, others use their own
    const userCompanyId = req.user.role === 'super_admin' ? undefined : req.user.companyId;
    return this.menuService.getPaginatedProducts(filters, userCompanyId, req.user.role);
  }

  // Get all categories for filters
  @Get('categories')
  @Roles('super_admin', 'company_owner', 'branch_manager', 'call_center', 'cashier')
  async getCategories(@Request() req) {
    const userCompanyId = req.user.role === 'super_admin' ? undefined : req.user.companyId;
    return this.menuService.getCategories(userCompanyId, req.user.role);
  }

  // Get available tags for filters
  @Get('tags')
  @Roles('super_admin', 'company_owner', 'branch_manager', 'call_center', 'cashier')
  async getTags(@Request() req) {
    const userCompanyId = req.user.role === 'super_admin' ? undefined : req.user.companyId;
    return this.menuService.getTags(userCompanyId);
  }

  // Get product statistics
  @Get('stats')
  @Roles('super_admin', 'company_owner', 'branch_manager')
  async getProductStats(@Request() req) {
    const userCompanyId = req.user.role === 'super_admin' ? undefined : req.user.companyId;
    return this.menuService.getProductStats(userCompanyId);
  }

  // Create new product
  @Post('products')
  @Roles('super_admin', 'company_owner', 'branch_manager')
  async createProduct(@Body() createProductDto: CreateProductDto, @Request() req) {
    const userCompanyId = req.user.role === 'super_admin' ? undefined : req.user.companyId;
    return this.menuService.createProduct(createProductDto, userCompanyId);
  }

  // Get single product
  @Get('products/:id')
  @Roles('super_admin', 'company_owner', 'branch_manager', 'call_center', 'cashier')
  async getProduct(@Param('id') id: string, @Request() req) {
    const userCompanyId = req.user.role === 'super_admin' ? undefined : req.user.companyId;
    return this.menuService.getProduct(id, userCompanyId);
  }

  // Update product
  @Put('products/:id')
  @Roles('super_admin', 'company_owner', 'branch_manager')
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req
  ) {
    const userCompanyId = req.user.role === 'super_admin' ? undefined : req.user.companyId;
    return this.menuService.updateProduct(id, updateProductDto, userCompanyId);
  }

  // Delete product
  @Delete('products/:id')
  @Roles('super_admin', 'company_owner')
  async deleteProduct(@Param('id') id: string, @Request() req) {
    const userCompanyId = req.user.role === 'super_admin' ? undefined : req.user.companyId;
    return this.menuService.deleteProduct(id, userCompanyId);
  }

  // Bulk status update
  @Post('products/bulk-status')
  @Roles('super_admin', 'company_owner', 'branch_manager')
  @HttpCode(HttpStatus.OK)
  async bulkUpdateStatus(@Body() bulkStatusDto: BulkStatusUpdateDto, @Request() req) {
    const userCompanyId = req.user.role === 'super_admin' ? undefined : req.user.companyId;
    return this.menuService.bulkUpdateStatus(bulkStatusDto, userCompanyId);
  }

  // Bulk delete
  @Post('products/bulk-delete')
  @Roles('super_admin', 'company_owner')
  @HttpCode(HttpStatus.OK)
  async bulkDelete(@Body() bulkDeleteDto: BulkDeleteDto, @Request() req) {
    const userCompanyId = req.user.role === 'super_admin' ? undefined : req.user.companyId;
    return this.menuService.bulkDelete(bulkDeleteDto, userCompanyId);
  }

  // Create category
  @Post('categories')
  @Roles('super_admin', 'company_owner', 'branch_manager')
  async createCategory(@Body() createCategoryDto: CreateCategoryDto, @Request() req) {
    const userCompanyId = req.user.role === 'super_admin' ? undefined : req.user.companyId;
    return this.menuService.createCategory(createCategoryDto, userCompanyId);
  }
}