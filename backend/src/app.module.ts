import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Core modules
import { DatabaseModule } from './modules/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { BranchesModule } from './modules/branches/branches.module';
import { UsersModule } from './modules/users/users.module';
import { LicensesModule } from './modules/licenses/licenses.module';
import { MenuModule } from './modules/menu/menu.module';
import { ModifiersModule } from './modules/modifiers/modifiers.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { PrintingModule } from './modules/printing/printing.module';

// Configuration
import { appConfig } from './config/app.config';
import { databaseConfig } from './config/database.config';
import { authConfig } from './config/auth.config';

// Common modules
import { CommonModule } from './common/common.module';

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
    DeliveryModule,
    PrintingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}