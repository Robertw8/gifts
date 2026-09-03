import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TelegramGiftsModule } from '../telegram-gifts/telegram-gifts.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { TelegramWebhookGuard } from './telegram-webhook.guard';

@Module({
  imports: [AuthModule, TelegramGiftsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, TelegramWebhookGuard],
})
export class PaymentsModule {}
