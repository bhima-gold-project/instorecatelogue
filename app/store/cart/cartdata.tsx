import { GET_CART_BY_CART_ID, GET_CART_BY_USERID } from "@/app/Api/api_list";
import Cookies from "js-cookie";
import { useState, useEffect, useCallback } from "react";
import { getData } from "@/app/Api/get/get_api_service";
import { getHomeBranchFromToken, getLoginIdFromToken } from "@/app/function/authUtils";

// Global state variables for the cart to share across components
let globalCartData: any = null;
let globalCartError: any = null;
let globalIsFetching = false;
let fetchPromise: Promise<any> | null = null;
const listeners = new Set<() => void>();

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

export function useCartData() {
  const usercartid = getLoginIdFromToken();
  const branch: any = getHomeBranchFromToken();

  const [data, setData] = useState<any>(globalCartData);
  const [error, setError] = useState<any>(globalCartError);

  const fetchCartData = useCallback(async (force = false) => {
    const currentUserId = getLoginIdFromToken() || usercartid;
    if (!currentUserId) return;
    
    // Deduplicate concurrent requests unless forced
    if (!force && globalIsFetching && fetchPromise) {
        await fetchPromise;
        return;
    }

    const currentPromise = getData(`${GET_CART_BY_USERID}${currentUserId}`);
    globalIsFetching = true;
    fetchPromise = currentPromise;

    try {
      const result = await currentPromise;
      // Only update if this is still the most recent fetch
      if (fetchPromise === currentPromise) {
        globalCartData = result;
        if (Array.isArray(result) && result.length > 0 && result[0].id) {
          Cookies.set("_si_cart_id", result[0].id);
        }
        globalCartError = null;
        notifyListeners();
      }
    } catch (err) {
      if (fetchPromise === currentPromise) {
        globalCartError = err;
        notifyListeners();
      }
    } finally {
      if (fetchPromise === currentPromise) {
        globalIsFetching = false;
        fetchPromise = null;
      }
    }
  }, [usercartid]);

  useEffect(() => {
    const listener = () => {
      setData(globalCartData);
      setError(globalCartError);
    };
    listeners.add(listener);

    // Only fetch if we don't have data yet
    if (!globalCartData && !globalIsFetching) {
      fetchCartData();
    } else {
      listener();
    }

    return () => {
      listeners.delete(listener);
    };
  }, [fetchCartData]);

  const clearCartCache = () => {
    globalCartData = [];
    globalCartError = null;
    notifyListeners();
  };

  return {
    branch: branch,
    cart: data,
    isLoading: !error && !data,
    isError: error,
    refreshCart: () => fetchCartData(true),
    clearCartCache
  };
}
