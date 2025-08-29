import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BranchesService } from './branches.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CompanyGuard } from '../../common/guards/company.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateBranchDto, UpdateBranchDto, BranchResponseDto } from './dto';

@ApiTags('Branches')
@Controller('branches')
@UseGuards(JwtAuthGuard, RolesGuard, CompanyGuard)
@ApiBearerAuth()
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('super_admin', 'company_owner')
  @ApiOperation({ summary: 'Create a new branch' })
  @ApiResponse({ status: 201, description: 'Branch created successfully', type: BranchResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async create(
    @Body() createBranchDto: CreateBranchDto,
    @CurrentUser() user: any,
  ) {
    const branch = await this.branchesService.create(createBranchDto, user);
    return { branch };
  }

  @Get()
  @Roles('super_admin', 'company_owner', 'branch_manager')
  @ApiOperation({ summary: 'Get all branches' })
  @ApiResponse({ status: 200, description: 'Branches retrieved successfully' })
  async findAll(@CurrentUser() user: any, @Query('companyId') companyId?: string) {
    const branches = await this.branchesService.findAll(user, { companyId });
    return { branches };
  }

  @Get('/my')
  @ApiOperation({ summary: 'Get current user\'s branch' })
  @ApiResponse({ status: 200, description: 'User branch retrieved successfully' })
  async findMy(@CurrentUser() user: any) {
    const branch = await this.branchesService.findByUser(user.id);
    return { branch };
  }

  @Get(':id')
  @Roles('super_admin', 'company_owner', 'branch_manager')
  @ApiOperation({ summary: 'Get a branch by ID' })
  @ApiResponse({ status: 200, description: 'Branch retrieved successfully', type: BranchResponseDto })
  @ApiResponse({ status: 404, description: 'Branch not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const branch = await this.branchesService.findOne(id, user);
    return { branch };
  }

  @Get(':id/statistics')
  @Roles('super_admin', 'company_owner', 'branch_manager')
  @ApiOperation({ summary: 'Get branch statistics' })
  @ApiResponse({ status: 200, description: 'Branch statistics retrieved successfully' })
  async getStatistics(@Param('id') id: string, @CurrentUser() user: any) {
    const statistics = await this.branchesService.getStatistics(id, user);
    return { statistics };
  }

  @Patch(':id')
  @Roles('super_admin', 'company_owner', 'branch_manager')
  @ApiOperation({ summary: 'Update a branch' })
  @ApiResponse({ status: 200, description: 'Branch updated successfully', type: BranchResponseDto })
  @ApiResponse({ status: 404, description: 'Branch not found' })
  async update(
    @Param('id') id: string,
    @Body() updateBranchDto: UpdateBranchDto,
    @CurrentUser() user: any,
  ) {
    const branch = await this.branchesService.update(id, updateBranchDto, user);
    return { branch };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('super_admin', 'company_owner')
  @ApiOperation({ summary: 'Delete a branch' })
  @ApiResponse({ status: 204, description: 'Branch deleted successfully' })
  @ApiResponse({ status: 404, description: 'Branch not found' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    await this.branchesService.remove(id, user);
  }
}