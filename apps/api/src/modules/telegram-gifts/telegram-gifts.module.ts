import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { InternalApiGuard } from './internal-api.guard';
import { InternalGiftsController } from './internal-gifts.controller';
import { TelegramBotApiService } from './telegram-bot-api.service';
import { TelegramGiftsController } from './telegram-gifts.controller';
import { TelegramGiftsService } from './telegram-gifts.service';

@Module({
  imports: [AuthModule],
  controllers: [InternalGiftsController, TelegramGiftsController],
  providers: [TelegramBotApiService, TelegramGiftsService, InternalApiGuard],
  exports: [TelegramBotApiService, TelegramGiftsService],
})
export class TelegramGiftsModule {}
