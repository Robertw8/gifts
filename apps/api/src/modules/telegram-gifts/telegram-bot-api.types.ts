export interface TelegramPhotoSize {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
}

export interface TelegramSticker {
  file_id: string;
  file_unique_id: string;
  type: string;
  width: number;
  height: number;
  is_animated: boolean;
  is_video: boolean;
  thumbnail?: TelegramPhotoSize;
  emoji?: string;
}

export interface TelegramGift {
  id: string;
  sticker: TelegramSticker;
  star_count: number;
  upgrade_star_count?: number;
  is_premium?: true;
  has_colors?: true;
  total_count?: number;
  remaining_count?: number;
  personal_total_count?: number;
  personal_remaining_count?: number;
  background?: {
    center_color: number;
    edge_color: number;
    text_color: number;
  };
  unique_gift_variant_count?: number;
}

export interface TelegramUniqueGift {
  gift_id: string;
  base_name: string;
  name: string;
  number: number;
  model: {
    name: string;
    sticker: TelegramSticker;
    rarity_per_mille: number;
    rarity?: 'uncommon' | 'rare' | 'epic' | 'legendary';
  };
  symbol: { name: string; sticker: TelegramSticker; rarity_per_mille: number };
  backdrop: {
    name: string;
    rarity_per_mille: number;
    colors: { center_color: number; edge_color: number; symbol_color: number; text_color: number };
  };
  is_premium?: true;
  is_burned?: true;
  is_from_blockchain?: true;
}

export interface TelegramOwnedGiftRegular {
  type: 'regular';
  gift: TelegramGift;
  owned_gift_id?: string;
  sender_user?: TelegramBotUser;
  send_date: number;
  text?: string;
  is_private?: true;
  is_saved?: true;
  can_be_upgraded?: true;
  was_refunded?: true;
  convert_star_count?: number;
  prepaid_upgrade_star_count?: number;
  unique_gift_number?: number;
}

export interface TelegramOwnedGiftUnique {
  type: 'unique';
  gift: TelegramUniqueGift;
  owned_gift_id?: string;
  sender_user?: TelegramBotUser;
  send_date: number;
  is_saved?: true;
  can_be_transferred?: true;
  transfer_star_count?: number;
  next_transfer_date?: number;
}

export type TelegramOwnedGift = TelegramOwnedGiftRegular | TelegramOwnedGiftUnique;

export interface TelegramOwnedGifts {
  total_count: number;
  gifts: TelegramOwnedGift[];
  next_offset?: string;
}

export interface TelegramBotUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
}

export interface TelegramPreCheckoutQuery {
  id: string;
  from: TelegramBotUser;
  currency: string;
  total_amount: number;
  invoice_payload: string;
}

export interface TelegramSuccessfulPayment {
  currency: string;
  total_amount: number;
  invoice_payload: string;
  telegram_payment_charge_id: string;
  provider_payment_charge_id: string;
}

export interface TelegramUpdate {
  update_id: number;
  pre_checkout_query?: TelegramPreCheckoutQuery;
  message?: {
    message_id: number;
    from?: TelegramBotUser;
    successful_payment?: TelegramSuccessfulPayment;
  };
}

export interface TelegramFile {
  file_id: string;
  file_unique_id: string;
  file_size?: number;
  file_path?: string;
}
