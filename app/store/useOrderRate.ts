import { useEffect } from 'react';
import { create } from 'zustand';
import { toast } from 'sonner';
import useSWR from 'swr';
import { GET_CENTRAL_DATA_BY_BARCODE } from '../Api/api_list';

// ✅ Zustand Store (Manages OrderRate)
const useOrderStore = create((set) => ({
  orderRate: null,
  setOrderRate: (rate:any) => set({ orderRate: rate }),
}));

// ✅ Fetcher Function for SWR
const fetcher = (url:any) => fetch(url).then((res) => res.json());

/**
 * useOrderRate - Handles everything (fetching, state, and toast)
 */
export function useOrderRate(barcode:any) {
  const { data } = useSWR(`${GET_CENTRAL_DATA_BY_BARCODE}${barcode}`, fetcher, { refreshInterval: 5000 });

  const orderRate = useOrderStore((state:any) => state.orderRate);
  const setOrderRate = useOrderStore((state:any) => state.setOrderRate);

  useEffect(() => {
    if (data?.OrderRate && orderRate !== null && data.OrderRate !== orderRate) {
      toast.info(`Order rate changed from ${orderRate} to ${data.OrderRate}`);
    }
    setOrderRate(data?.OrderRate ?? null);
  }, [data?.OrderRate]);
}
