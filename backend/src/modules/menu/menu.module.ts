import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { PreparationTimeService } from './services/preparation-time.service';
import { ImageUploadService } from './services/image-upload.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    MulterModule.register({
      storage: require('multer').memoryStorage(), // Use memory storage to keep files in buffer
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
      },
    })
  ],
  controllers: [MenuController],
  providers: [MenuService, PreparationTimeService, ImageUploadService],
  exports: [MenuService, PreparationTimeService, ImageUploadService]
})
export class MenuModule {}
