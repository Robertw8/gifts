import { GiftRarity } from '@prisma/client';
import { IsBoolean, IsDecimal, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, IsUUID, Matches, MaxLength, Min } from 'class-validator';

export class CreateGiftDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsOptional()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug?: string;

  @IsUrl({ require_protocol: true })
  imageUrl: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  artwork?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description: string;

  @IsEnum(GiftRarity)
  rarity: GiftRarity;

  @IsDecimal({ decimal_digits: '0,9' })
  price: string;

  @IsInt()
  @Min(0)
  supply: number;

  @IsInt()
  @Min(0)
  available: number;

  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  popularity?: number;
}
