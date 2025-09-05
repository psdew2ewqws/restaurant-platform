import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';

// Core modules
import { DatabaseModule } from './shared/database/database.module';
import { AuthModule } from './domains/auth/auth.module';
import { CompaniesModule } from './domains/companies/companies.module';
import { BranchesModule } from './domains/branches/branches.module';
import { UsersModule } from './domains/users/users.module';
import { LicensesModule } from './domains/licenses/licenses.module';
import { MenuModule } from './domains/menu/menu.module';
import { ModifiersModule } from './domains/modifiers/modifiers.module';
import { AvailabilityModule } from './domains/availability/availability.module';
import { DeliveryModule } from './domains/delivery/delivery.module';
import { PrintingModule } from './domains/printing/printing.module';
import { PromotionsModule } from './domains/promotions/promotions.module';
import { AnalyticsModule } from './domains/analytics/analytics.module';
import { OrdersModule } from './domains/orders/orders.module';

// Configuration
import { appConfig } from './shared/config/app.config';
import { databaseConfig } from './shared/config/database.config';
import { authConfig } from './shared/config/auth.config';

// Common modules
import { CommonModule } from './shared/common/common.module';

// Security middleware and interceptors
import { SecurityLoggingMiddleware } from './shared/common/middleware/security-logging.middleware';
import { InputSanitizationMiddleware } from './shared/common/middleware/input-sanitization.middleware';
import { SecurityResponseInterceptor } from './shared/common/interceptors/security-response.interceptor';

// App controller for health checks
import { AppController } from './app.controller';

@Module({
  imports: [
    // Configuration module (environment-based like Picolinate)
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [appConfig, databaseConfig, authConfig],
      envFilePath: ['.env.local', '.env.development', '.env'],
    }),

    // Core business modules
    CommonModule,
    DatabaseModule,
    AuthModule,
    CompaniesModule,
    BranchesModule,
    UsersModule,
    LicensesModule,
    MenuModule,
    ModifiersModule,
    AvailabilityModule,
    DeliveryModule,
    PrintingModule,
    PromotionsModule,
    AnalyticsModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [
    // Global security interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: SecurityResponseInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply security middleware to all routes
    consumer
      .apply(SecurityLoggingMiddleware, InputSanitizationMiddleware)
      .forRoutes('*');
  }
}