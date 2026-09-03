export type GiftRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
export type GiftSource = 'TELEGRAM' | 'INTERNAL';

export interface TelegramUser {
  id: string;
  firstName: string;
  lastName?: string;
  username?: string;
  avatarUrl?: string;
}

export interface User {
  id: string;
  telegramId: string;
  username?: string | null;
  firstName: string;
  lastName?: string | null;
  avatarUrl?: string | null;
  balance: string;
  createdAt: string;
  updatedAt: string;
}

export interface Gift {
  id: string;
  internalId: string;
  slug: string;
  name: string;
  imageUrl: string;
  artwork: string;
  description: string;
  rarity: GiftRarity;
  price: string;
  supply: number;
  available: number;
  categoryId: string;
  category: Category;
  featured: boolean;
  popularity: number;
  source: GiftSource;
  telegramGiftId?: string | null;
  telegramStarCount?: number | null;
  telegramUpgradeStarCount?: number | null;
  telegramIsPremium: boolean;
  telegramSyncedAt?: string | null;
  createdAt: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  artwork: string;
  accent: string;
  sortOrder: number;
  giftCount?: number;
  createdAt: string;
}

export interface Banner {
  id: string;
  slug: string;
  label: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  artwork: string;
  style: string;
  gradientFrom: string;
  gradientTo: string;
  targetPath: string;
  sortOrder: number;
  active: boolean;
  giftId?: string | null;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  status: 'OWNED' | 'LISTED' | 'TRANSFERRED';
  purchasedPrice: string;
  orderId?: string | null;
  createdAt: string;
  source: 'INTERNAL';
  gift: Gift;
}

export interface Order {
  id: string;
  amount: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'FAILED';
  createdAt: string;
  source: GiftSource;
  gift: Pick<Gift, 'id' | 'internalId' | 'slug' | 'name' | 'imageUrl' | 'artwork' | 'source' | 'telegramGiftId'>;
}

export interface BalanceTransaction {
  id: string;
  userId: string;
  orderId?: string | null;
  type: 'DEPOSIT' | 'PURCHASE' | 'REFUND' | 'BONUS';
  amount: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

export interface BalanceResponse {
  balance: string;
  transactions: BalanceTransaction[];
}

export interface HomeResponse {
  balance: string;
  featuredGifts: Gift[];
  popularGifts: Gift[];
  categories: Category[];
  banners: Banner[];
  recentActivity: Order[];
}

export interface PurchaseResponse {
  order: Order;
  inventoryItem: InventoryItem | null;
  telegramDelivery?: { source: 'TELEGRAM'; telegramGiftId: string };
  balance: string;
}

export interface TelegramOwnedGift {
  id: string;
  source: 'TELEGRAM';
  kind: 'REGULAR' | 'UNIQUE';
  telegramGiftId: string;
  ownedGiftId?: string | null;
  marketplaceGiftId?: string | null;
  internalMarketplaceId?: string | null;
  name: string;
  artwork: string;
  imageUrl: string;
  rarity: GiftRarity;
  sentAt: string;
  sender?: {
    id: string;
    firstName: string;
    lastName?: string | null;
    username?: string | null;
  } | null;
  isSaved: boolean;
  isPrivate: boolean;
  wasRefunded: boolean;
  canBeUpgraded: boolean;
  canBeTransferred: boolean;
  starCount?: number | null;
  uniqueNumber?: number | null;
}

export interface TelegramOwnedGiftsResponse {
  source: 'TELEGRAM';
  totalCount: number;
  items: TelegramOwnedGift[];
}

export type StarsPaymentStatus = 'PENDING' | 'PRECHECKOUT_APPROVED' | 'PAID' | 'FAILED';

export interface StarsInvoiceResponse {
  paymentId: string;
  invoiceUrl: string;
  starCount: number;
  status: StarsPaymentStatus;
}

export interface StarsPaymentResponse {
  paymentId: string;
  starCount: number;
  status: StarsPaymentStatus;
  balance: string;
  paidAt?: string | null;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
