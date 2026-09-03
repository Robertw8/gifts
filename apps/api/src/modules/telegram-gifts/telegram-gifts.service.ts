import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GiftRarity, GiftSource, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramBotApiService } from './telegram-bot-api.service';
import type {
  TelegramGift,
  TelegramOwnedGift,
  TelegramOwnedGiftUnique,
  TelegramSticker,
} from './telegram-bot-api.types';

const UNLIMITED_SUPPLY = 2_000_000_000;

@Injectable()
export class TelegramGiftsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly botApi: TelegramBotApiService,
    private readonly config: ConfigService,
  ) {}

  async synchronizeAvailableGifts() {
    const { gifts } = await this.botApi.getAvailableGifts();
    const category = await this.prisma.category.upsert({
      where: { slug: 'telegram-gifts' },
      update: { name: 'Telegram Gifts', artwork: '⭐', accent: '#8269df' },
      create: { slug: 'telegram-gifts', name: 'Telegram Gifts', artwork: '⭐', accent: '#8269df', sortOrder: 0 },
    });
    const existing = await this.prisma.gift.findMany({
      where: { telegramGiftId: { in: gifts.map((gift) => gift.id) } },
      select: { telegramGiftId: true },
    });
    const existingIds = new Set(existing.map((gift) => gift.telegramGiftId));
    const synchronizedAt = new Date();

    for (const [index, gift] of gifts.entries()) {
      const telegramData = this.telegramGiftData(gift, synchronizedAt);
      const artwork = gift.sticker.emoji ?? '🎁';
      await this.prisma.gift.upsert({
        where: { telegramGiftId: gift.id },
        update: telegramData,
        create: {
          ...telegramData,
          telegramGiftId: gift.id,
          slug: this.telegramSlug(gift.id),
          name: `${artwork} Telegram Gift`,
          artwork,
          description: `Official Telegram Gift available for ${gift.star_count} Stars.`,
          rarity: this.rarityFromGift(gift),
          categoryId: category.id,
          featured: index < 7,
          popularity: Math.max(0, 10_000 - gift.star_count),
        },
      });
    }

    const unavailable = await this.prisma.gift.updateMany({
      where: {
        source: GiftSource.TELEGRAM,
        ...(gifts.length ? { telegramGiftId: { notIn: gifts.map((gift) => gift.id) } } : {}),
      },
      data: { available: 0, telegramSyncedAt: synchronizedAt },
    });

    return {
      source: GiftSource.TELEGRAM,
      synchronizedAt: synchronizedAt.toISOString(),
      total: gifts.length,
      created: gifts.filter((gift) => !existingIds.has(gift.id)).length,
      updated: gifts.filter((gift) => existingIds.has(gift.id)).length,
      markedUnavailable: unavailable.count,
    };
  }

  async getOwnedGifts(telegramId: string) {
    const numericTelegramId = Number(telegramId);
    if (!Number.isSafeInteger(numericTelegramId)) throw new Error('Telegram user ID is outside the supported range');

    const owned: TelegramOwnedGift[] = [];
    let offset = '';
    let totalCount = 0;
    for (let page = 0; page < 20; page += 1) {
      const response = await this.botApi.getUserGifts(numericTelegramId, offset, 100);
      totalCount = response.total_count;
      owned.push(...response.gifts);
      if (!response.next_offset || response.next_offset === offset) break;
      offset = response.next_offset;
    }

    const externalIds = [...new Set(owned.map((item) => item.type === 'regular' ? item.gift.id : item.gift.gift_id))];
    const marketplaceGifts = await this.prisma.gift.findMany({
      where: { source: GiftSource.TELEGRAM, telegramGiftId: { in: externalIds } },
      select: { id: true, telegramGiftId: true, name: true, rarity: true },
    });
    const mapping = new Map(marketplaceGifts.map((gift) => [gift.telegramGiftId, gift]));

    return {
      source: GiftSource.TELEGRAM,
      totalCount,
      items: owned.map((item, index) => this.normalizeOwnedGift(item, index, mapping)),
    };
  }

  sendGift(telegramId: string, telegramGiftId: string) {
    const numericTelegramId = Number(telegramId);
    if (!Number.isSafeInteger(numericTelegramId)) throw new Error('Telegram user ID is outside the supported range');
    return this.botApi.sendGift(numericTelegramId, telegramGiftId);
  }

  async downloadGiftFile(fileId: string) {
    return this.botApi.downloadFile(fileId);
  }

  private telegramGiftData(gift: TelegramGift, synchronizedAt: Date) {
    const total = gift.personal_total_count ?? gift.total_count ?? UNLIMITED_SUPPLY;
    const remaining = gift.personal_remaining_count ?? gift.remaining_count ?? UNLIMITED_SUPPLY;
    const displayFile = gift.sticker.thumbnail ?? gift.sticker;
    return {
      source: GiftSource.TELEGRAM,
      price: String(gift.star_count),
      supply: total,
      available: remaining,
      imageUrl: this.fileProxyUrl(displayFile.file_id),
      artwork: gift.sticker.emoji ?? '🎁',
      telegramStarCount: gift.star_count,
      telegramUpgradeStarCount: gift.upgrade_star_count,
      telegramFileId: displayFile.file_id,
      telegramFileUniqueId: displayFile.file_unique_id,
      telegramIsPremium: Boolean(gift.is_premium),
      telegramRaw: gift as unknown as Prisma.InputJsonValue,
      telegramSyncedAt: synchronizedAt,
    };
  }

  private normalizeOwnedGift(
    owned: TelegramOwnedGift,
    index: number,
    mappings: Map<string | null, { id: string; telegramGiftId: string | null; name: string; rarity: GiftRarity }>,
  ) {
    if (owned.type === 'regular') {
      const gift = owned.gift;
      const mapping = mappings.get(gift.id);
      return {
        ...this.ownedGiftBase(owned, index, gift.id, gift.sticker, mapping),
        kind: 'REGULAR' as const,
        name: mapping?.name ?? `${gift.sticker.emoji ?? '🎁'} Telegram Gift`,
        rarity: mapping?.rarity ?? this.rarityFromGift(gift),
        isPrivate: Boolean(owned.is_private),
        wasRefunded: Boolean(owned.was_refunded),
        canBeUpgraded: Boolean(owned.can_be_upgraded),
        canBeTransferred: false,
        starCount: gift.star_count,
        uniqueNumber: owned.unique_gift_number ?? null,
      };
    }

    const gift = owned.gift;
    const mapping = mappings.get(gift.gift_id);
    return {
      ...this.ownedGiftBase(owned, index, gift.gift_id, gift.model.sticker, mapping),
      kind: 'UNIQUE' as const,
      name: gift.name,
      rarity: this.rarityFromUniqueGift(owned),
      isPrivate: false,
      wasRefunded: false,
      canBeUpgraded: false,
      canBeTransferred: Boolean(owned.can_be_transferred),
      starCount: null,
      uniqueNumber: gift.number,
    };
  }

  private ownedGiftBase(
    owned: TelegramOwnedGift,
    index: number,
    externalGiftId: string,
    sticker: TelegramSticker,
    mapping?: { id: string; telegramGiftId: string | null; name: string; rarity: GiftRarity },
  ) {
    return {
      id: owned.owned_gift_id ?? `${owned.type}:${externalGiftId}:${owned.send_date}:${index}`,
      source: GiftSource.TELEGRAM,
      telegramGiftId: externalGiftId,
      ownedGiftId: owned.owned_gift_id ?? null,
      marketplaceGiftId: mapping?.telegramGiftId ?? null,
      internalMarketplaceId: mapping?.id ?? null,
      artwork: sticker.emoji ?? '🎁',
      imageUrl: this.fileProxyUrl((sticker.thumbnail ?? sticker).file_id),
      sentAt: new Date(owned.send_date * 1000).toISOString(),
      sender: owned.sender_user ? {
        id: String(owned.sender_user.id),
        firstName: owned.sender_user.first_name,
        lastName: owned.sender_user.last_name ?? null,
        username: owned.sender_user.username ?? null,
      } : null,
      isSaved: Boolean(owned.is_saved),
    };
  }

  private rarityFromGift(gift: TelegramGift) {
    if (!gift.total_count) return GiftRarity.COMMON;
    if (gift.total_count <= 1_000) return GiftRarity.LEGENDARY;
    if (gift.total_count <= 10_000) return GiftRarity.EPIC;
    return GiftRarity.RARE;
  }

  private rarityFromUniqueGift(owned: TelegramOwnedGiftUnique) {
    const rarity = owned.gift.model.rarity;
    if (rarity === 'legendary') return GiftRarity.LEGENDARY;
    if (rarity === 'epic') return GiftRarity.EPIC;
    if (rarity === 'rare') return GiftRarity.RARE;
    return GiftRarity.COMMON;
  }

  private telegramSlug(id: string) {
    return `telegram-${id.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
  }

  private fileProxyUrl(fileId: string) {
    const baseUrl = this.config.get<string>('PUBLIC_API_URL', 'http://localhost:3000/api').replace(/\/$/, '');
    return `${baseUrl}/telegram/files/${encodeURIComponent(fileId)}`;
  }
}
