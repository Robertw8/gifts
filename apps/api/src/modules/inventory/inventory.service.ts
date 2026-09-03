import { Injectable } from '@nestjs/common';
import { GiftSource } from '@prisma/client';
import { serializeGift } from '../../common/serializers';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findForUser(userId: string) {
    const items = await this.prisma.inventoryItem.findMany({
      where: { userId, source: GiftSource.INTERNAL },
      include: { gift: { include: { category: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return items.map((item) => ({
      ...item,
      purchasedPrice: item.purchasedPrice.toString(),
      createdAt: item.createdAt.toISOString(),
      gift: serializeGift(item.gift),
    }));
  }
}
