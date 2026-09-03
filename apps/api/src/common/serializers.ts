import type { Banner, Category, Gift, Order, User } from '@prisma/client';

export function serializeUser(user: User) {
  return {
    id: user.id,
    telegramId: user.telegramId.toString(),
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: user.avatarUrl,
    balance: user.balance.toString(),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export function serializeCategory(category: Category) {
  return { ...category, createdAt: category.createdAt.toISOString() };
}

export function serializeGift(gift: Gift & { category?: Category }) {
  const { id: internalId, telegramRaw: _telegramRaw, ...publicGift } = gift;
  return {
    ...publicGift,
    id: gift.telegramGiftId ?? internalId,
    internalId,
    price: gift.price.toString(),
    createdAt: gift.createdAt.toISOString(),
    ...(gift.category ? { category: serializeCategory(gift.category) } : {}),
  };
}

export function serializeBanner(banner: Banner) {
  return { ...banner, createdAt: banner.createdAt.toISOString() };
}

export function serializeOrder(order: Order & { gift: Pick<Gift, 'id' | 'slug' | 'name' | 'imageUrl' | 'artwork' | 'source' | 'telegramGiftId'> }) {
  return {
    ...order,
    amount: order.amount.toString(),
    createdAt: order.createdAt.toISOString(),
    gift: {
      ...order.gift,
      internalId: order.gift.id,
      id: order.gift.telegramGiftId ?? order.gift.id,
    },
  };
}
