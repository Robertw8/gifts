import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BalanceTransactionStatus, BalanceTransactionType, Prisma, StarsPaymentStatus } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramBotApiService } from '../telegram-gifts/telegram-bot-api.service';
import type { TelegramPreCheckoutQuery, TelegramSuccessfulPayment, TelegramUpdate } from '../telegram-gifts/telegram-bot-api.types';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly botApi: TelegramBotApiService,
  ) {}

  async createStarsInvoice(userId: string, starCount: number) {
    const id = randomUUID();
    const invoicePayload = `stars:${id}`;
    const payment = await this.prisma.starsPayment.create({
      data: { id, userId, invoicePayload, starCount },
    });
    try {
      const invoiceUrl = await this.botApi.createInvoiceLink({
        title: `${starCount} Marketplace Stars`,
        description: `Add ${starCount} units to your internal marketplace balance. This does not represent your Telegram Stars balance.`,
        invoicePayload,
        starCount,
      });
      return { paymentId: payment.id, invoiceUrl, starCount, status: payment.status };
    } catch (error) {
      await this.prisma.starsPayment.update({ where: { id }, data: { status: StarsPaymentStatus.FAILED } });
      throw error;
    }
  }

  async getStarsPayment(userId: string, paymentId: string) {
    const payment = await this.prisma.starsPayment.findFirst({
      where: { id: paymentId, userId },
      include: { user: { select: { balance: true } } },
    });
    if (!payment) throw new NotFoundException('Stars payment not found');
    return {
      paymentId: payment.id,
      starCount: payment.starCount,
      status: payment.status,
      balance: payment.user.balance.toString(),
      paidAt: payment.paidAt?.toISOString() ?? null,
    };
  }

  async handleTelegramUpdate(update: TelegramUpdate) {
    if (update.pre_checkout_query) await this.handlePreCheckout(update.pre_checkout_query);
    const successfulPayment = update.message?.successful_payment;
    if (successfulPayment) await this.processSuccessfulPayment(successfulPayment, update.message?.from?.id);
    return { ok: true };
  }

  private async handlePreCheckout(query: TelegramPreCheckoutQuery) {
    const payment = await this.prisma.starsPayment.findUnique({
      where: { invoicePayload: query.invoice_payload },
      include: { user: { select: { telegramId: true } } },
    });
    const valid = payment
      && payment.status !== StarsPaymentStatus.FAILED
      && payment.status !== StarsPaymentStatus.PAID
      && payment.user.telegramId === BigInt(query.from.id)
      && query.currency === 'XTR'
      && query.total_amount === payment.starCount;

    if (!valid) {
      await this.botApi.answerPreCheckoutQuery(query.id, false, 'This marketplace invoice is invalid or has expired.');
      return;
    }

    await this.prisma.starsPayment.updateMany({
      where: { id: payment.id, status: StarsPaymentStatus.PENDING },
      data: { status: StarsPaymentStatus.PRECHECKOUT_APPROVED },
    });
    await this.botApi.answerPreCheckoutQuery(query.id, true);
  }

  private async processSuccessfulPayment(payment: TelegramSuccessfulPayment, telegramUserId?: number) {
    if (payment.currency !== 'XTR' || !telegramUserId) throw new BadRequestException('Successful Telegram payment is invalid');

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        return await this.prisma.$transaction(async (transaction) => {
          const existingCharge = await transaction.starsPayment.findUnique({
            where: { telegramPaymentChargeId: payment.telegram_payment_charge_id },
            include: { user: { select: { balance: true } } },
          });
          if (existingCharge) return { paymentId: existingCharge.id, balance: existingCharge.user.balance.toString(), idempotent: true };

          const invoice = await transaction.starsPayment.findUnique({
            where: { invoicePayload: payment.invoice_payload },
            include: { user: { select: { telegramId: true, balance: true } } },
          });
          if (!invoice || invoice.user.telegramId !== BigInt(telegramUserId) || invoice.starCount !== payment.total_amount) {
            throw new BadRequestException('Successful Telegram payment does not match its invoice');
          }
          if (invoice.status === StarsPaymentStatus.PAID) {
            return { paymentId: invoice.id, balance: invoice.user.balance.toString(), idempotent: true };
          }

          const balanceTransaction = await transaction.balanceTransaction.create({
            data: {
              userId: invoice.userId,
              type: BalanceTransactionType.DEPOSIT,
              amount: String(invoice.starCount),
              status: BalanceTransactionStatus.COMPLETED,
            },
          });
          const user = await transaction.user.update({
            where: { id: invoice.userId },
            data: { balance: { increment: String(invoice.starCount) } },
            select: { balance: true },
          });
          await transaction.starsPayment.update({
            where: { id: invoice.id },
            data: {
              status: StarsPaymentStatus.PAID,
              telegramPaymentChargeId: payment.telegram_payment_charge_id,
              providerPaymentChargeId: payment.provider_payment_charge_id,
              balanceTransactionId: balanceTransaction.id,
              paidAt: new Date(),
            },
          });
          return { paymentId: invoice.id, balance: user.balance.toString(), idempotent: false };
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError
          && (error.code === 'P2034' || error.code === 'P2002')
          && attempt < 2
        ) continue;
        throw error;
      }
    }
    throw new Error('Telegram payment processing could not be serialized');
  }
}
