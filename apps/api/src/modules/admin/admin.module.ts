import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { GiftsModule } from '../gifts/gifts.module';
import { AdminGiftsController } from './admin-gifts.controller';
import { AdminGuard } from './admin.guard';

@Module({
  imports: [AuthModule, GiftsModule],
  controllers: [AdminGiftsController],
  providers: [AdminGuard],
})
export class AdminModule {}
