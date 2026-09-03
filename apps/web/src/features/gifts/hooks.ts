import { useQuery } from '@tanstack/react-query';
import { getCatalog, getGift, type CatalogFilters } from './api';

export function useGifts(filters: CatalogFilters = {}) {
  return useQuery({ queryKey: ['gifts', filters], queryFn: () => getCatalog(filters) });
}

export function useGift(id: string | undefined) {
  return useQuery({
    queryKey: ['gift', id],
    queryFn: () => getGift(id!),
    enabled: Boolean(id),
  });
}
