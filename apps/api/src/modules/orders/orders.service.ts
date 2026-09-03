import { ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { BalanceTransactionStatus, BalanceTransactionType, GiftSource, OrderStatus, Prisma } from '@prisma/client';
import { serializeGift, serializeOrder } from '../../common/serializers';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramGiftsService } from '../telegram-gifts/telegram-gifts.service';

const orderGiftSelect = {
  id: true,
  slug: true,
  name: true,
  imageUrl: true,
  artwork: true,
  source: true,
  telegramGiftId: true,
} as const;

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly telegramGifts: TelegramGiftsService,
  ) {}

  async create(userId: string, giftId: string) {
    const gift = await this.findGift(giftId);
    if (gift.source === GiftSource.TELEGRAM) return this.createTelegramGiftOrder(userId, gift);
    return this.createInternalOrder(userId, gift);
  }

  async findForUser(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: { gift: { select: orderGiftSelect } },
      orderBy: { createdAt: 'desc' },
    });
    return orders.map(serializeOrder);
  }

  private async createInternalOrder(userId: string, gift: Awaited<ReturnType<OrdersService['findGift']>>) {
    return this.prisma.$transaction(async (transaction) => {
      await this.debitUser(transaction, userId, gift.price);
      await this.reserveGift(transaction, gift.id);
      const order = await transaction.order.create({
        data: { userId, giftId: gift.id, amount: gift.price, status: OrderStatus.PAID, source: GiftSource.INTERNAL },
        include: { gift: { select: orderGiftSelect } },
      });
      await transaction.balanceTransaction.create({
        data: {
          userId,
          orderId: order.id,
          type: BalanceTransactionType.PURCHASE,
          amount: gift.price.negated(),
          status: BalanceTransactionStatus.COMPLETED,
        },
      });
      const inventoryItem = await transaction.inventoryItem.create({
        data: { userId, giftId: gift.id, orderId: order.id, purchasedPrice: gift.price, source: GiftSource.INTERNAL },
      });
      const user = await transaction.user.findUniqueOrThrow({ where: { id: userId }, select: { balance: true } });
      return {
        order: serializeOrder(order),
        inventoryItem: {
          ...inventoryItem,
          purchasedPrice: inventoryItem.purchasedPrice.toString(),
          createdAt: inventoryItem.createdAt.toISOString(),
          gift: serializeGift(gift),
        },
        balance: user.balance.toString(),
      };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }

  private async createTelegramGiftOrder(userId: string, gift: Awaited<ReturnType<OrdersService['findGift']>>) {
    if (!gift.telegramGiftId) throw new ConflictException('Telegram gift mapping is incomplete');
    const reservation = await this.prisma.$transaction(async (transaction) => {
      const user = await transaction.user.findUniqueOrThrow({ where: { id: userId }, select: { telegramId: true } });
      await this.debitUser(transaction, userId, gift.price);
      await this.reserveGift(transaction, gift.id, false);
      const order = await transaction.order.create({
        data: { userId, giftId: gift.id, amount: gift.price, status: OrderStatus.PENDING, source: GiftSource.TELEGRAM },
        include: { gift: { select: orderGiftSelect } },
      });
      await transaction.balanceTransaction.create({
        data: {
          userId,
          orderId: order.id,
          type: BalanceTransactionType.PURCHASE,
          amount: gift.price.negated(),
          status: BalanceTransactionStatus.PENDING,
        },
      });
      return { order, telegramId: user.telegramId.toString() };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    try {
      await this.telegramGifts.sendGift(reservation.telegramId, gift.telegramGiftId);
    } catch (error) {
      await this.failTelegramDelivery(userId, gift.id, gift.price, reservation.order.id);
      throw error;
    }

    const completed = await this.prisma.$transaction(async (transaction) => {
      const order = await transaction.order.update({
        where: { id: reservation.order.id },
        data: { status: OrderStatus.PAID },
        include: { gift: { select: orderGiftSelect } },
      });
      await transaction.balanceTransaction.update({
        where: { orderId: order.id },
        data: { status: BalanceTransactionStatus.COMPLETED },
      });
      await transaction.gift.update({ where: { id: gift.id }, data: { popularity: { increment: 1 } } });
      const user = await transaction.user.findUniqueOrThrow({ where: { id: userId }, select: { balance: true } });
      return { order, balance: user.balance };
    });

    return {
      order: serializeOrder(completed.order),
      inventoryItem: null,
      telegramDelivery: { source: GiftSource.TELEGRAM, telegramGiftId: gift.telegramGiftId },
      balance: completed.balance.toString(),
    };
  }

  private async failTelegramDelivery(userId: string, giftId: string, price: Prisma.Decimal, orderId: string) {
    await this.prisma.$transaction([
      this.prisma.order.update({ where: { id: orderId }, data: { status: OrderStatus.FAILED } }),
      this.prisma.balanceTransaction.update({ where: { orderId }, data: { status: BalanceTransactionStatus.FAILED } }),
      this.prisma.user.update({ where: { id: userId }, data: { balance: { increment: price } } }),
      this.prisma.gift.update({ where: { id: giftId }, data: { available: { increment: 1 } } }),
    ]);
  }

  private async debitUser(transaction: Prisma.TransactionClient, userId: string, amount: Prisma.Decimal) {
    const debit = await transaction.user.updateMany({
      where: { id: userId, balance: { gte: amount } },
      data: { balance: { decrement: amount } },
    });
    if (debit.count !== 1) throw new HttpException('Insufficient internal marketplace balance', HttpStatus.PAYMENT_REQUIRED);
  }

  private async reserveGift(transaction: Prisma.TransactionClient, giftId: string, incrementPopularity = true) {
    const availability = await transaction.gift.updateMany({
      where: { id: giftId, available: { gte: 1 } },
      data: {
        available: { decrement: 1 },
        ...(incrementPopularity ? { popularity: { increment: 1 } } : {}),
      },
    });
    if (availability.count !== 1) throw new ConflictException('Gift is not available');
  }

  private async findGift(idOrExternalId: string) {
    const gift = await this.prisma.gift.findFirst({
      where: {
        OR: [
          ...(this.isUuid(idOrExternalId) ? [{ id: idOrExternalId }] : []),
          { telegramGiftId: idOrExternalId },
        ],
      },
      include: { category: true },
    });
    if (!gift) throw new NotFoundException('Gift not found');
    if (gift.available < 1) throw new ConflictException('Gift is not available');
    return gift;
  }

  private isUuid(value: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  }
}
