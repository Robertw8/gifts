import { ConflictException, HttpException } from '@nestjs/common';
import { GiftRarity, GiftSource, OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  const category = { id: 'category-id', slug: 'cosmic', name: 'Cosmic', artwork: '🚀', accent: '#38bdf8', sortOrder: 1, createdAt: new Date() };
  const gift = {
    id: 'gift-id', slug: 'moon-capsule', name: 'Moon Capsule', imageUrl: '', artwork: '🚀', description: 'A test gift',
    rarity: GiftRarity.EPIC, price: new Prisma.Decimal(120), supply: 100, available: 10, categoryId: category.id,
    featured: true, popularity: 10, source: GiftSource.INTERNAL, telegramGiftId: null, telegramStarCount: null,
    telegramUpgradeStarCount: null, telegramFileId: null, telegramFileUniqueId: null, telegramIsPremium: false,
    telegramRaw: null, telegramSyncedAt: null, createdAt: new Date(), category,
  };
  const order = {
    id: 'order-id', userId: 'user-id', giftId: gift.id, amount: gift.price, status: OrderStatus.PAID, source: GiftSource.INTERNAL, createdAt: new Date(),
    gift: { id: gift.id, slug: gift.slug, name: gift.name, imageUrl: gift.imageUrl, artwork: gift.artwork, source: gift.source, telegramGiftId: gift.telegramGiftId },
  };

  function createSubject({ balanceUpdated = 1, availabilityUpdated = 1, available = 10 } = {}) {
    const currentGift = { ...gift, available };
    const transaction = {
      gift: {
        updateMany: jest.fn().mockResolvedValue({ count: availabilityUpdated }),
      },
      user: {
        updateMany: jest.fn().mockResolvedValue({ count: balanceUpdated }),
        findUniqueOrThrow: jest.fn().mockResolvedValue({ balance: new Prisma.Decimal(880) }),
      },
      order: { create: jest.fn().mockResolvedValue(order) },
      balanceTransaction: { create: jest.fn().mockResolvedValue({}) },
      inventoryItem: {
        create: jest.fn().mockResolvedValue({ id: 'inventory-id', userId: 'user-id', giftId: gift.id, orderId: order.id, status: 'OWNED', source: GiftSource.INTERNAL, purchasedPrice: gift.price, createdAt: new Date() }),
      },
    };
    const prisma = {
      gift: { findFirst: jest.fn().mockResolvedValue(currentGift) },
      $transaction: jest.fn((callback: (tx: typeof transaction) => unknown) => callback(transaction)),
    } as unknown as PrismaService;
    const telegramGifts = { sendGift: jest.fn() };
    return { service: new OrdersService(prisma, telegramGifts as never), transaction };
  }

  it('atomically creates a paid order, debit ledger entry, and inventory item', async () => {
    const { service, transaction } = createSubject();
    const result = await service.create('user-id', gift.id);
    expect(result.balance).toBe('880');
    expect(result.order.status).toBe('PAID');
    expect(result.inventoryItem?.orderId).toBe(order.id);
    expect(transaction.gift.updateMany).toHaveBeenCalledWith(expect.objectContaining({ data: { available: { decrement: 1 }, popularity: { increment: 1 } } }));
    const ledgerData = transaction.balanceTransaction.create.mock.calls[0]![0].data;
    expect(ledgerData.orderId).toBe(order.id);
    expect(ledgerData.amount.toString()).toBe('-120');
  });

  it('rejects a purchase when the balance cannot be debited', async () => {
    const { service, transaction } = createSubject({ balanceUpdated: 0 });
    await expect(service.create('user-id', gift.id)).rejects.toBeInstanceOf(HttpException);
    expect(transaction.order.create).not.toHaveBeenCalled();
  });

  it('rejects an unavailable gift before debiting the user', async () => {
    const { service, transaction } = createSubject({ available: 0 });
    await expect(service.create('user-id', gift.id)).rejects.toBeInstanceOf(ConflictException);
    expect(transaction.user.updateMany).not.toHaveBeenCalled();
  });

  it('sends synchronized Telegram gifts without creating internal inventory', async () => {
    const telegramGift = { ...gift, source: GiftSource.TELEGRAM, telegramGiftId: 'telegram-gift-id' };
    const pendingOrder = {
      ...order,
      source: GiftSource.TELEGRAM,
      status: OrderStatus.PENDING,
      gift: { ...order.gift, source: GiftSource.TELEGRAM, telegramGiftId: 'telegram-gift-id' },
    };
    const paidOrder = { ...pendingOrder, status: OrderStatus.PAID };
    const transaction = {
      user: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findUniqueOrThrow: jest.fn()
          .mockResolvedValueOnce({ telegramId: 12345n })
          .mockResolvedValueOnce({ balance: new Prisma.Decimal(880) }),
      },
      gift: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        update: jest.fn().mockResolvedValue({}),
      },
      order: {
        create: jest.fn().mockResolvedValue(pendingOrder),
        update: jest.fn().mockResolvedValue(paidOrder),
      },
      balanceTransaction: {
        create: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
      },
    };
    const prisma = {
      gift: { findFirst: jest.fn().mockResolvedValue(telegramGift) },
      $transaction: jest.fn((callback: (client: typeof transaction) => unknown) => callback(transaction)),
    } as unknown as PrismaService;
    const telegramGifts = { sendGift: jest.fn().mockResolvedValue(true) };
    const service = new OrdersService(prisma, telegramGifts as never);

    const result = await service.create('user-id', telegramGift.telegramGiftId);

    expect(telegramGifts.sendGift).toHaveBeenCalledWith('12345', telegramGift.telegramGiftId);
    expect(result.inventoryItem).toBeNull();
    expect(result.order.status).toBe(OrderStatus.PAID);
    expect(result).toMatchObject({ telegramDelivery: { source: GiftSource.TELEGRAM, telegramGiftId: telegramGift.telegramGiftId } });
  });
});
