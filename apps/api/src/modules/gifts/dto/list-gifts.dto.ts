import { GiftRarity } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export enum GiftSort {
  FEATURED = 'featured',
  PRICE_ASC = 'price-asc',
  PRICE_DESC = 'price-desc',
  NEWEST = 'newest',
  POPULAR = 'popular',
}

export class ListGiftsDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: string }) => value.trim())
  search?: string;

  @IsOptional()
  @IsEnum(GiftRarity)
  rarity?: GiftRarity;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(GiftSort)
  sort: GiftSort = GiftSort.FEATURED;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize = 24;
}
