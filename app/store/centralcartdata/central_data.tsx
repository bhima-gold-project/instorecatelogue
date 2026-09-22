

import { GET_CART_BY_USERID, GET_CENTRAL_DATA_BY_BARCODE } from "@/app/Api/api_list";
import Cookies from "js-cookie";
import useSWR from "swr";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch");
  return response.json();
};

export function useCartDatafromCentral(barcode:any) {


  const { data, error, mutate } = useSWR(`${GET_CENTRAL_DATA_BY_BARCODE}${barcode}`, fetcher, {
    refreshInterval: 2000, 
    revalidateOnMount: true, // Always fetch fresh data on mount
      revalidateOnFocus: true,
    // Fetch latest cart data every 5 seconds
  });
  const clearCartCache = () => {
    mutate(null, false); // Remove cache without revalidating
  };

  return {

    centraldata: data,
    isLoading: !error && !data,
    isError: error,
    refreshCart: mutate,
    clearCartCache// Function to manually refresh cart data
  };
}
