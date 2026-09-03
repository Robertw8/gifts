import { BadRequestException } from '@nestjs/common';
import { BalanceTransactionStatus, BalanceTransactionType, Prisma, StarsPaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramBotApiService } from '../telegram-gifts/telegram-bot-api.service';
import { PaymentsService } from './payments.service';

describe('PaymentsService', () => {
  const invoice = {
    id: 'payment-id',
    userId: 'user-id',
    invoicePayload: 'stars:payment-id',
    starCount: 100,
    status: StarsPaymentStatus.PRECHECKOUT_APPROVED,
  };

  it('approves only a matching XTR pre-checkout query', async () => {
    const prisma = {
      starsPayment: {
        findUnique: jest.fn().mockResolvedValue({ ...invoice, user: { telegramId: 12345n } }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    } as unknown as PrismaService;
    const botApi = { answerPreCheckoutQuery: jest.fn().mockResolvedValue(true) } as unknown as TelegramBotApiService;
    const service = new PaymentsService(prisma, botApi);
    await service.handleTelegramUpdate({
      update_id: 1,
      pre_checkout_query: {
        id: 'checkout-id',
        from: { id: 12345, is_bot: false, first_name: 'Ada' },
        currency: 'XTR',
        total_amount: 100,
        invoice_payload: invoice.invoicePayload,
      },
    });
    expect(botApi.answerPreCheckoutQuery).toHaveBeenCalledWith('checkout-id', true);
  });

  it('credits a successful payment exactly once for duplicate webhook delivery', async () => {
    let paid = false;
    const transaction = {
      starsPayment: {
        findUnique: jest.fn(({ where }: { where: { telegramPaymentChargeId?: string; invoicePayload?: string } }) => {
          if (where.telegramPaymentChargeId) {
            return paid ? { ...invoice, user: { balance: new Prisma.Decimal(100) } } : null;
          }
          return { ...invoice, user: { telegramId: 12345n, balance: new Prisma.Decimal(0) } };
        }),
        update: jest.fn(() => { paid = true; return invoice; }),
      },
      balanceTransaction: {
        create: jest.fn().mockResolvedValue({ id: 'ledger-id' }),
      },
      user: {
        update: jest.fn().mockResolvedValue({ balance: new Prisma.Decimal(100) }),
      },
    };
    const prisma = {
      $transaction: jest.fn((callback: (client: typeof transaction) => unknown) => callback(transaction)),
    } as unknown as PrismaService;
    const service = new PaymentsService(prisma, {} as TelegramBotApiService);
    const update = {
      update_id: 2,
      message: {
        message_id: 1,
        from: { id: 12345, is_bot: false, first_name: 'Ada' },
        successful_payment: {
          currency: 'XTR',
          total_amount: 100,
          invoice_payload: invoice.invoicePayload,
          telegram_payment_charge_id: 'charge-id',
          provider_payment_charge_id: '',
        },
      },
    } as const;
    await service.handleTelegramUpdate(update);
    await service.handleTelegramUpdate({ ...update, update_id: 3 });

    expect(transaction.balanceTransaction.create).toHaveBeenCalledTimes(1);
    expect(transaction.balanceTransaction.create).toHaveBeenCalledWith({ data: expect.objectContaining({
      type: BalanceTransactionType.DEPOSIT,
      status: BalanceTransactionStatus.COMPLETED,
      amount: '100',
    }) });
    expect(transaction.user.update).toHaveBeenCalledTimes(1);
  });

  it('rejects a successful payment whose amount does not match the invoice', async () => {
    const transaction = {
      starsPayment: {
        findUnique: jest.fn(({ where }: { where: { telegramPaymentChargeId?: string } }) => where.telegramPaymentChargeId
          ? null
          : { ...invoice, user: { telegramId: 12345n, balance: new Prisma.Decimal(0) } }),
      },
    };
    const prisma = { $transaction: jest.fn((callback: (client: typeof transaction) => unknown) => callback(transaction)) } as unknown as PrismaService;
    const service = new PaymentsService(prisma, {} as TelegramBotApiService);
    await expect(service.handleTelegramUpdate({
      update_id: 4,
      message: {
        message_id: 1,
        from: { id: 12345, is_bot: false, first_name: 'Ada' },
        successful_payment: {
          currency: 'XTR',
          total_amount: 99,
          invoice_payload: invoice.invoicePayload,
          telegram_payment_charge_id: 'other-charge',
          provider_payment_charge_id: '',
        },
      },
    })).rejects.toBeInstanceOf(BadRequestException);
  });
});
