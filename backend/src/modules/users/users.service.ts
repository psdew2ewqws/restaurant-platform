import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcryptjs';
import { BaseService } from '../../common/services/base.service';

@Injectable()
export class UsersService extends BaseService<any> {
  constructor(prisma: PrismaService) {
    super(prisma, 'User');
  }

  async findAll(currentUser: any, page: number = 1, limit: number = 10) {
    try {
      const { skip, take: limitNum, pageNum } = this.buildPaginationParams(page, limit);
      
      // Build where clause with company filtering and soft delete
      const where = this.buildBaseWhereClause(currentUser);

      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          include: {
            company: {
              select: {
                id: true,
                name: true,
              },
            },
            branch: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          skip: skip,
          take: limitNum,
        }),
        this.prisma.user.count({ where }),
      ]);

      // Remove sensitive fields and add isActive field
      const sanitizedUsers = users.map(user => {
        const { passwordHash, pin, ...safeUser } = user;
        return {
          ...safeUser,
          isActive: user.status === 'active',
        };
      });

      return {
        users: sanitizedUsers,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      };
    } catch (error) {
      console.error('Error in findAll users:', error);
      throw error;
    }
  }

  async create(createUserDto: any, currentUser: any) {
    try {
      // Check if email already exists (removed email validation)
      // Hash password from form data
      const password = createUserDto.password || 'password123'; // Fallback to default if not provided
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate unique email using phone number and timestamp to avoid duplicates
      const phoneDigits = createUserDto.phone.replace(/[^0-9]/g, '');
      const timestamp = Date.now();
      const uniqueEmail = `${phoneDigits}_${timestamp}@placeholder.local`;

      const userData = {
        name: `${createUserDto.firstName} ${createUserDto.lastName}`,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        email: uniqueEmail,
        phone: createUserDto.phone,
        passwordHash: hashedPassword,
        role: createUserDto.role,
        status: createUserDto.isActive ? 'active' : 'inactive',
        companyId: currentUser.companyId,
        branchId: createUserDto.branchId || null,
        createdBy: currentUser.id,
      };

      const newUser = await this.prisma.user.create({
        data: userData,
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          branch: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Remove sensitive fields and add isActive field
      const { passwordHash, pin, ...safeUser } = newUser;
      return { 
        user: {
          ...safeUser,
          isActive: newUser.status === 'active',
        }
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async findOne(id: string, currentUser?: any) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user has access (same company or self)
    if (currentUser && user.companyId !== currentUser.companyId && user.id !== currentUser.id) {
      throw new ForbiddenException('Access denied');
    }

    // Remove sensitive fields and add isActive field
    const { passwordHash, pin, ...safeUser } = user;
    return { 
      user: {
        ...safeUser,
        isActive: user.status === 'active',
      }
    };
  }

  async update(id: string, updateUserDto: any, currentUser: any) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Check if user has access (same company)
    if (existingUser.companyId !== currentUser.companyId) {
      throw new ForbiddenException('Access denied');
    }

    // Process the update data like we do in create
    const updateData: any = {
      name: `${updateUserDto.firstName} ${updateUserDto.lastName}`,
      firstName: updateUserDto.firstName,
      lastName: updateUserDto.lastName,
      phone: updateUserDto.phone,
      role: updateUserDto.role,
      status: updateUserDto.isActive ? 'active' : 'inactive',
      updatedBy: currentUser.id,
      updatedAt: new Date(),
    };

    // Hash password if provided
    if (updateUserDto.password) {
      const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
      updateData.passwordHash = hashedPassword;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Remove sensitive fields and add isActive field
    const { passwordHash, pin, ...safeUser } = updatedUser;
    return { 
      user: {
        ...safeUser,
        isActive: updatedUser.status === 'active',
      }
    };
  }

  async remove(id: string, currentUser: any) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Check if user has access (same company)
    if (existingUser.companyId !== currentUser.companyId) {
      throw new ForbiddenException('Access denied');
    }

    // Soft delete
    await this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: currentUser.id,
        updatedAt: new Date(),
      },
    });

    return { message: 'User deleted successfully' };
  }
}