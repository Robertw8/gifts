import { ConfigService } from '@nestjs/config';
import { GiftRarity, GiftSource } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramBotApiService } from './telegram-bot-api.service';
import { TelegramGiftsService } from './telegram-gifts.service';

describe('TelegramGiftsService', () => {
  const telegramGift = {
    id: '5170233102089322756',
    sticker: {
      file_id: 'sticker-file',
      file_unique_id: 'sticker-unique',
      type: 'regular',
      width: 512,
      height: 512,
      is_animated: true,
      is_video: false,
      thumbnail: { file_id: 'thumb-file', file_unique_id: 'thumb-unique', width: 128, height: 128 },
      emoji: '🎁',
    },
    star_count: 100,
    total_count: 10_000,
    remaining_count: 8_500,
  };

  function createSubject() {
    const prisma = {
      category: { upsert: jest.fn().mockResolvedValue({ id: 'telegram-category' }) },
      gift: {
        findMany: jest.fn(({ select }: { select?: { name?: boolean } }) => select?.name
          ? [{ id: 'database-gift-id', telegramGiftId: telegramGift.id, name: 'Mapped Gift', rarity: GiftRarity.EPIC }]
          : []),
        upsert: jest.fn().mockResolvedValue({}),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    } as unknown as PrismaService;
    const botApi = {
      getAvailableGifts: jest.fn().mockResolvedValue({ gifts: [telegramGift] }),
      getUserGifts: jest.fn().mockResolvedValue({
        total_count: 1,
        gifts: [{ type: 'regular', gift: telegramGift, send_date: 1_700_000_000 }],
      }),
    } as unknown as TelegramBotApiService;
    const config = {
      get: (_key: string, fallback: string) => _key === 'PUBLIC_API_URL' ? 'https://api.example.test/api' : fallback,
    } as unknown as ConfigService;
    return { service: new TelegramGiftsService(prisma, botApi, config), prisma, botApi };
  }

  it('upserts official gifts by Telegram gift ID and marks their source', async () => {
    const { service, prisma } = createSubject();
    const result = await service.synchronizeAvailableGifts();
    expect(result).toMatchObject({ source: GiftSource.TELEGRAM, total: 1, created: 1 });
    expect(prisma.gift.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { telegramGiftId: telegramGift.id },
      create: expect.objectContaining({
        telegramGiftId: telegramGift.id,
        source: GiftSource.TELEGRAM,
        price: '100',
        imageUrl: 'https://api.example.test/api/telegram/files/thumb-file',
      }),
    }));
  });

  it('normalizes live Telegram-owned gifts with an explicit marketplace mapping', async () => {
    const { service } = createSubject();
    const result = await service.getOwnedGifts('12345');
    expect(result.source).toBe(GiftSource.TELEGRAM);
    expect(result.items[0]).toMatchObject({
      source: GiftSource.TELEGRAM,
      kind: 'REGULAR',
      telegramGiftId: telegramGift.id,
      marketplaceGiftId: telegramGift.id,
      internalMarketplaceId: 'database-gift-id',
      name: 'Mapped Gift',
    });
  });
});
