import type { BalanceResponse, HomeResponse, InventoryItem, Order, PurchaseResponse, StarsInvoiceResponse, StarsPaymentResponse, TelegramOwnedGiftsResponse, User } from '@gifts/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/api';

export function useProfile() {
  return useQuery({ queryKey: ['me'], queryFn: () => apiRequest<User>('/users/me') });
}

export function useBalance() {
  return useQuery({ queryKey: ['balance'], queryFn: () => apiRequest<BalanceResponse>('/balance') });
}

export function useHome() {
  return useQuery({ queryKey: ['home'], queryFn: () => apiRequest<HomeResponse>('/home') });
}

export function useInventory() {
  return useQuery({ queryKey: ['inventory'], queryFn: () => apiRequest<InventoryItem[]>('/inventory') });
}

export function useTelegramOwnedGifts() {
  return useQuery({ queryKey: ['telegram-owned-gifts'], queryFn: () => apiRequest<TelegramOwnedGiftsResponse>('/telegram/gifts/me') });
}

export function useOrders() {
  return useQuery({ queryKey: ['orders'], queryFn: () => apiRequest<Order[]>('/orders') });
}

export function useBuyGift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (giftId: string) => apiRequest<PurchaseResponse>('/orders', { method: 'POST', body: JSON.stringify({ giftId }) }),
    onSuccess: (response) => {
      queryClient.setQueryData<BalanceResponse>(['balance'], (current) => current ? { ...current, balance: response.balance } : current);
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ['home'] }),
        queryClient.invalidateQueries({ queryKey: ['inventory'] }),
        queryClient.invalidateQueries({ queryKey: ['telegram-owned-gifts'] }),
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
        queryClient.invalidateQueries({ queryKey: ['balance'] }),
        queryClient.invalidateQueries({ queryKey: ['gifts'] }),
        queryClient.invalidateQueries({ queryKey: ['gift'] }),
      ]);
    },
  });
}

export function useCreateStarsInvoice() {
  return useMutation({
    mutationFn: (starCount: number) => apiRequest<StarsInvoiceResponse>('/payments/stars/invoice', {
      method: 'POST',
      body: JSON.stringify({ starCount }),
    }),
  });
}

export function useConfirmStarsPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (paymentId: string) => {
      for (let attempt = 0; attempt < 30; attempt += 1) {
        const payment = await apiRequest<StarsPaymentResponse>(`/payments/stars/${paymentId}`);
        if (payment.status === 'PAID' || payment.status === 'FAILED') return payment;
        await new Promise((resolve) => window.setTimeout(resolve, 1_000));
      }
      return apiRequest<StarsPaymentResponse>(`/payments/stars/${paymentId}`);
    },
    onSuccess: (payment) => {
      if (payment.status !== 'PAID') return;
      queryClient.setQueryData<BalanceResponse>(['balance'], (current) => current ? { ...current, balance: payment.balance } : current);
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ['balance'] }),
        queryClient.invalidateQueries({ queryKey: ['home'] }),
        queryClient.invalidateQueries({ queryKey: ['me'] }),
      ]);
    },
  });
}
