import { Controller, Post, UseGuards } from '@nestjs/common';
import { InternalApiGuard } from './internal-api.guard';
import { TelegramGiftsService } from './telegram-gifts.service';

@Controller('internal/gifts')
@UseGuards(InternalApiGuard)
export class InternalGiftsController {
  constructor(private readonly telegramGifts: TelegramGiftsService) {}

  @Post('sync')
  synchronize() {
    return this.telegramGifts.synchronizeAvailableGifts();
  }
}
