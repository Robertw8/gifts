import type { Gift, GiftRarity, PaginatedResponse } from '@gifts/types';
import { apiRequest } from '../../lib/api';

export interface CatalogFilters {
  search?: string;
  rarity?: GiftRarity | 'ALL';
  category?: string;
  sort?: 'featured' | 'popular' | 'price-asc' | 'price-desc' | 'newest';
  page?: number;
  pageSize?: number;
}

export async function getCatalog(filters: CatalogFilters = {}): Promise<PaginatedResponse<Gift>> {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.rarity && filters.rarity !== 'ALL') params.set('rarity', filters.rarity);
  if (filters.category) params.set('category', filters.category);
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.pageSize) params.set('pageSize', String(filters.pageSize));
  return apiRequest<PaginatedResponse<Gift>>(`/gifts?${params}`);
}

export function getGift(id: string) {
  return apiRequest<Gift>(`/gifts/${id}`);
}
