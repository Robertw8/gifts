import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GiftSource, Prisma } from '@prisma/client';
import { serializeGift } from '../../common/serializers';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGiftDto } from './dto/create-gift.dto';
import { GiftSort, ListGiftsDto } from './dto/list-gifts.dto';
import { UpdateGiftDto } from './dto/update-gift.dto';

@Injectable()
export class GiftsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async findAll(query: ListGiftsDto) {
    const where: Prisma.GiftWhereInput = {
      ...this.catalogSourceWhere(),
      ...(query.rarity ? { rarity: query.rarity } : {}),
      ...(query.category ? { category: { slug: query.category } } : {}),
      ...(query.search ? { name: { contains: query.search, mode: 'insensitive' } } : {}),
      available: { gt: 0 },
    };
    const orderBy: Prisma.GiftOrderByWithRelationInput[] = query.sort === GiftSort.PRICE_ASC
      ? [{ price: 'asc' }]
      : query.sort === GiftSort.PRICE_DESC
        ? [{ price: 'desc' }]
        : query.sort === GiftSort.NEWEST
          ? [{ createdAt: 'desc' }]
          : query.sort === GiftSort.POPULAR
            ? [{ popularity: 'desc' }, { createdAt: 'desc' }]
            : [{ featured: 'desc' }, { popularity: 'desc' }, { createdAt: 'desc' }];
    const skip = (query.page - 1) * query.pageSize;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.gift.findMany({ where, orderBy, skip, take: query.pageSize, include: { category: true } }),
      this.prisma.gift.count({ where }),
    ]);
    return { items: items.map(serializeGift), total, page: query.page, pageSize: query.pageSize };
  }

  async findOne(idOrSlug: string) {
    const gift = await this.prisma.gift.findFirst({
      where: {
        ...this.catalogSourceWhere(),
        OR: [
          { id: this.isUuid(idOrSlug) ? idOrSlug : undefined },
          { telegramGiftId: idOrSlug },
          { slug: idOrSlug },
        ],
      },
      include: { category: true },
    });
    if (!gift) throw new NotFoundException('Gift not found');
    return serializeGift(gift);
  }

  async create(dto: CreateGiftDto) {
    this.validateAvailability(dto.supply, dto.available);
    const gift = await this.prisma.gift.create({ data: { ...dto, slug: dto.slug ?? this.slugify(dto.name) }, include: { category: true } });
    return serializeGift(gift);
  }

  async update(id: string, dto: UpdateGiftDto) {
    const current = await this.prisma.gift.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Gift not found');
    this.validateAvailability(dto.supply ?? current.supply, dto.available ?? current.available);
    const gift = await this.prisma.gift.update({ where: { id }, data: dto, include: { category: true } });
    return serializeGift(gift);
  }

  async remove(id: string) {
    const gift = await this.prisma.gift.findUnique({ where: { id } });
    if (!gift) throw new NotFoundException('Gift not found');
    await this.prisma.gift.delete({ where: { id } });
    return { deleted: true };
  }

  private validateAvailability(supply: number, available: number) {
    if (available > supply) throw new BadRequestException('Available quantity cannot exceed supply');
  }

  private slugify(value: string) {
    return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  private isUuid(value: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  }

  private catalogSourceWhere(): Prisma.GiftWhereInput {
    return this.config.get<boolean>('ENABLE_DEVELOPMENT_GIFT_FALLBACK', false)
      && this.config.get<string>('NODE_ENV', 'development') !== 'production'
      ? {}
      : { source: GiftSource.TELEGRAM };
  }

}
