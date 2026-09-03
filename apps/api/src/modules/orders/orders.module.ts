import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TelegramGiftsModule } from '../telegram-gifts/telegram-gifts.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [AuthModule, TelegramGiftsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
