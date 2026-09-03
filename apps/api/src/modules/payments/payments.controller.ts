import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, type AuthUser } from '../../common/auth-user';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { TelegramUpdate } from '../telegram-gifts/telegram-bot-api.types';
import { CreateStarsInvoiceDto } from './dto/create-stars-invoice.dto';
import { PaymentsService } from './payments.service';
import { TelegramWebhookGuard } from './telegram-webhook.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post('stars/invoice')
  @UseGuards(JwtAuthGuard)
  createStarsInvoice(@CurrentUser() user: AuthUser, @Body() dto: CreateStarsInvoiceDto) {
    return this.payments.createStarsInvoice(user.id, dto.starCount);
  }

  @Get('stars/:id')
  @UseGuards(JwtAuthGuard)
  getStarsPayment(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.payments.getStarsPayment(user.id, id);
  }

  @Post('telegram/webhook')
  @UseGuards(TelegramWebhookGuard)
  @HttpCode(200)
  handleTelegramWebhook(@Body() update: TelegramUpdate) {
    return this.payments.handleTelegramUpdate(update);
  }
}
