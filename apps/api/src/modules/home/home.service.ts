import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GiftSource, Prisma } from '@prisma/client';
import { serializeBanner, serializeGift, serializeOrder } from '../../common/serializers';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HomeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async getForUser(userId: string) {
    const sourceWhere = this.catalogSourceWhere();
    const availableWhere = { ...sourceWhere, available: { gt: 0 } };
    const [user, featuredGifts, popularGifts, categories, banners, recentActivity] = await this.prisma.$transaction([
      this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { balance: true } }),
      this.prisma.gift.findMany({ where: availableWhere, include: { category: true }, orderBy: [{ featured: 'desc' }, { popularity: 'desc' }], take: 7 }),
      this.prisma.gift.findMany({ where: availableWhere, include: { category: true }, orderBy: { popularity: 'desc' }, take: 6 }),
      this.prisma.category.findMany({
        where: { gifts: { some: sourceWhere } },
        include: { _count: { select: { gifts: { where: sourceWhere } } } },
        orderBy: { sortOrder: 'asc' },
      }),
      this.prisma.banner.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' } }),
      this.prisma.order.findMany({
        where: { userId },
        include: { gift: { select: { id: true, slug: true, name: true, imageUrl: true, artwork: true, source: true, telegramGiftId: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);
    return {
      balance: user.balance.toString(),
      featuredGifts: featuredGifts.map(serializeGift),
      popularGifts: popularGifts.map(serializeGift),
      categories: categories.map(({ _count, ...category }) => ({ ...category, createdAt: category.createdAt.toISOString(), giftCount: _count.gifts })),
      banners: banners.map(serializeBanner),
      recentActivity: recentActivity.map(serializeOrder),
    };
  }

  private catalogSourceWhere(): Prisma.GiftWhereInput {
    return this.config.get<boolean>('ENABLE_DEVELOPMENT_GIFT_FALLBACK', false)
      && this.config.get<string>('NODE_ENV', 'development') !== 'production'
      ? {}
      : { source: GiftSource.TELEGRAM };
  }
}
