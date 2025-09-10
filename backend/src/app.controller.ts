import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';

@ApiTags('Health')
@Controller()
export class AppController {
  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ 
    status: 200, 
    description: 'Service is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2025-09-05T04:00:00.000Z' },
        service: { type: 'string', example: 'restaurant-platform-backend' },
        version: { type: 'string', example: '1.0.0' },
      }
    }
  })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'restaurant-platform-backend',
      version: '1.0.0',
    };
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Root endpoint - API information' })
  @ApiResponse({ 
    status: 200, 
    description: 'API information',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Restaurant Platform API v1.0' },
        documentation: { type: 'string', example: '/api/docs' },
        status: { type: 'string', example: 'running' },
      }
    }
  })
  getRoot() {
    return {
      message: 'Restaurant Platform API v1.0',
      documentation: '/api/docs',
      status: 'running',
    };
  }
}