"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";
import {
  Building,
  ShoppingBag,
  LogOut,
  Search,
  X,
  Eye,
  EyeOff,
  Lock,
  User,
  Users,
  RefreshCw,
  SlidersHorizontal,
  ArrowLeft,
  Calendar,
  Phone,
  Hash,
  CircleDot,
  Layers,
  Filter,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Database,
  ChevronDown,
  ChevronUp,
  Tag,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { getData } from "@/app/Api/get/get_api_service";
import {
  ORDER_BY_BRANCH_URL,
  ORDER_DETAILS_BY_ORDER_ID,
  GET_ALL_BRANCH_LIST,
  PRODUCT_SYNC_API,
  PRODUCT_SYNC_STOP_API,
  ADMIN_SETTINGS_API,
  GET_COUNTERS_V2
} from "@/app/Api/api_list";
import { PostData } from "@/app/Api/post/post_api_service";
import { getAllCategoryApi, getBranchGsCodesApi, toggleBranchGsCodeApi } from "@/app/function/action";
import FallbackImage from "@/app/components/FallbackImage";

// Interfaces
interface Order {
  order_no: string | number;
  order_date: string;
  cust_name: string;
  mobile_no: string;
}

interface OrderDetailItem {
  barcode_no: string;
  ImageUrl: string;
  Name: string;
  order_no: string | number;
  from_gwt: number;
  OrderRate: number;
  StoneAmount: number;
  DiamondAmount: number;
  taxable_amt: number;
  va_amount: number;
  total_amount: number;
  orderstatus: string;
  item_branch: string;
}

interface Branch {
  branch_code: string;
}

interface BranchGsCodeItem {
  gs_code: string;
  is_enabled: boolean;
}

interface BranchGsCodeGroup {
  branch_code: string;
  total_gscodes: number;
  enabled_count: number;
  disabled_count: number;
  gscodes: BranchGsCodeItem[];
}

const AdminPage = () => {
  const router = useRouter();
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [loadingCheck, setLoadingCheck] = useState(true);

  // Login Form States
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // App Settings
  const [isBranchWiseCartEnabled, setIsBranchWiseCartEnabled] = useState(false);
  const [isAmountVisibleInPLP, setIsAmountVisibleInPLP] = useState(true);
  const [isTitleVisibleInPLP, setIsTitleVisibleInPLP] = useState(true);
  const [isBranchCodeVisibleInPLP, setIsBranchCodeVisibleInPLP] = useState(false);
  const [isWeightVisibleInPLP, setIsWeightVisibleInPLP] = useState(false);
  const [isCaratVisibleInPLP, setIsCaratVisibleInPLP] = useState(false);
  const [isGrossWeightVisibleInPLP, setIsGrossWeightVisibleInPLP] = useState(false);
  const [isNetWeightVisibleInPLP, setIsNetWeightVisibleInPLP] = useState(false);
  const [isMCPerGramVisible, setIsMCPerGramVisible] = useState(true);
  const [isMCPerPieceVisible, setIsMCPerPieceVisible] = useState(true);
  const [isMCPercentVisible, setIsMCPercentVisible] = useState(true);
  const [isWastageGramsVisible, setIsWastageGramsVisible] = useState(true);
  const [isWastagePercentVisible, setIsWastagePercentVisible] = useState(true);
  const [isCombinedMetalValueEnabled, setIsCombinedMetalValueEnabled] = useState(false);
  const [isCustomerDataUpdateEnabled, setIsCustomerDataUpdateEnabled] = useState(false);
  const [isWebOtpLoginEnabled, setIsWebOtpLoginEnabled] = useState(false);
  const [isHideAllCategoriesEnabled, setIsHideAllCategoriesEnabled] = useState(false);
  const [isShowCategoriesAndSubCategoriesEnabled, setIsShowCategoriesAndSubCategoriesEnabled] = useState(false);
  const [isCounterOtpValidationEnabled, setIsCounterOtpValidationEnabled] = useState(true);
  const [otpRequiredCounters, setOtpRequiredCounters] = useState<string[]>([]);
  const [countersList, setCountersList] = useState<{ counter_name: string; counter_code: string; is_otp_required?: boolean }[]>([]);
  const [loadingCounters, setLoadingCounters] = useState(false);
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [updatingSettings, setUpdatingSettings] = useState(false);
  
  // Branch GS Code DB Visibility Configuration States
  const [branchGsCodesData, setBranchGsCodesData] = useState<BranchGsCodeGroup[]>([]);
  const [loadingBranchGsCodes, setLoadingBranchGsCodes] = useState(false);
  const [expandedBranches, setExpandedBranches] = useState<Record<string, boolean>>({});
  const [updatingBranchGsCode, setUpdatingBranchGsCode] = useState<string | null>(null);
  const [branchGsSearchQuery, setBranchGsSearchQuery] = useState("");

  // Storefront Filter Display Settings
  const [isFilterBarVisible, setIsFilterBarVisible] = useState(true);
  const [isBranchFilterVisible, setIsBranchFilterVisible] = useState(true);
  const [isCategoryFilterVisible, setIsCategoryFilterVisible] = useState(true);
  const [isProductCodeFilterVisible, setIsProductCodeFilterVisible] = useState(true);
  const [isCounterFilterVisible, setIsCounterFilterVisible] = useState(true);
  const [isSupplierFilterVisible, setIsSupplierFilterVisible] = useState(true);
  const [isStockFilterVisible, setIsStockFilterVisible] = useState(true);
  const [isPurityFilterVisible, setIsPurityFilterVisible] = useState(true);
  const [isPriceFilterVisible, setIsPriceFilterVisible] = useState(true);
  const [isGenderFilterVisible, setIsGenderFilterVisible] = useState(true);
  const [isWeightFilterVisible, setIsWeightFilterVisible] = useState(true);
  const [isCaratFilterVisible, setIsCaratFilterVisible] = useState(true);
  const [isDesignFilterVisible, setIsDesignFilterVisible] = useState(true);
  const [isMasterDesignFilterVisible, setIsMasterDesignFilterVisible] = useState(true);

  // Dashboard States
  const [orders, setOrders] = useState<Order[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);

  // Product Sync States
  const [selectedSyncBranches, setSelectedSyncBranches] = useState<string[]>([]);
  const [syncingProducts, setSyncingProducts] = useState(false);
  const [syncLimit, setSyncLimit] = useState("");
  const [syncDate, setSyncDate] = useState("");

  // Order Details Modal States
  const [selectedOrderNo, setSelectedOrderNo] = useState<string | number | null>(null);
  const [selectedOrderCustomer, setSelectedOrderCustomer] = useState<string>("");
  const [orderDetails, setOrderDetails] = useState<OrderDetailItem[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Check login on mount
  useEffect(() => {
    const adminSession = Cookies.get("is_admin_logged_in");
    if (adminSession === "true") {
      setIsAdminLoggedIn(true);
    }
    setLoadingCheck(false);
  }, []);

  // Fetch branches, orders, settings, categories, and counters when logged in
  useEffect(() => {
    if (isAdminLoggedIn) {
      fetchBranches();
      fetchOrders();
      fetchSettings();
      fetchCategories();
      fetchCounters();
      fetchBranchGsCodes();
    }
  }, [isAdminLoggedIn, selectedBranch]);

  const fetchCounters = async () => {
    setLoadingCounters(true);
    try {
      const res = await getData(GET_COUNTERS_V2);
      if (res && res.data && Array.isArray(res.data)) {
        setCountersList(res.data);
      } else if (Array.isArray(res)) {
        setCountersList(res);
      }
    } catch (error) {
      console.error("Error fetching counters:", error);
    } finally {
      setLoadingCounters(false);
    }
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await getAllCategoryApi();
      if (res && Array.isArray(res)) {
        setCategoriesList(
          res.filter(
            (c: any) =>
              (c.CategoryName || c.categoryName) &&
              (c.CategoryName || c.categoryName) !== "All"
          )
        );
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await getData(ADMIN_SETTINGS_API);
      if (res && res.data) {
        setIsBranchWiseCartEnabled(res.data.isBranchWiseCartEnabled || false);
        setIsAmountVisibleInPLP(res.data.isAmountVisibleInPLP ?? true);
        setIsTitleVisibleInPLP(res.data.isTitleVisibleInPLP ?? true);
        setIsBranchCodeVisibleInPLP(res.data.isBranchCodeVisibleInPLP ?? false);
        setIsWeightVisibleInPLP(res.data.isWeightVisibleInPLP ?? false);
        setIsCaratVisibleInPLP(res.data.isCaratVisibleInPLP ?? false);
        setIsGrossWeightVisibleInPLP(res.data.isGrossWeightVisibleInPLP ?? false);
        setIsNetWeightVisibleInPLP(res.data.isNetWeightVisibleInPLP ?? false);
        setIsMCPerGramVisible(res.data.isMCPerGramVisible ?? true);
        setIsMCPerPieceVisible(res.data.isMCPerPieceVisible ?? true);
        setIsMCPercentVisible(res.data.isMCPercentVisible ?? true);
        setIsWastageGramsVisible(res.data.isWastageGramsVisible ?? true);
        setIsWastagePercentVisible(res.data.isWastagePercentVisible ?? true);
        setIsCombinedMetalValueEnabled(res.data.isCombinedMetalValueEnabled ?? false);
        setIsCustomerDataUpdateEnabled(res.data.isCustomerDataUpdateEnabled ?? false);
        setIsWebOtpLoginEnabled(res.data.isWebOtpLoginEnabled ?? false);
        setIsHideAllCategoriesEnabled(res.data.isHideAllCategoriesEnabled ?? false);
        setIsShowCategoriesAndSubCategoriesEnabled(res.data.isShowCategoriesAndSubCategoriesEnabled ?? false);
        setIsCounterOtpValidationEnabled(res.data.isCounterOtpValidationEnabled ?? true);
        setOtpRequiredCounters(Array.isArray(res.data.otpRequiredCounters) ? res.data.otpRequiredCounters : []);
        setHiddenCategories(Array.isArray(res.data.hiddenCategories) ? res.data.hiddenCategories : []);
        setIsFilterBarVisible(res.data.isFilterBarVisible ?? true);
        setIsBranchFilterVisible(res.data.isBranchFilterVisible ?? true);
        setIsCategoryFilterVisible(res.data.isCategoryFilterVisible ?? true);
        setIsProductCodeFilterVisible(res.data.isProductCodeFilterVisible ?? true);
        setIsCounterFilterVisible(res.data.isCounterFilterVisible ?? true);
        setIsSupplierFilterVisible(res.data.isSupplierFilterVisible ?? true);
        setIsStockFilterVisible(res.data.isStockFilterVisible ?? true);
        setIsPurityFilterVisible(res.data.isPurityFilterVisible ?? true);
        setIsPriceFilterVisible(res.data.isPriceFilterVisible ?? true);
        setIsGenderFilterVisible(res.data.isGenderFilterVisible ?? true);
        setIsWeightFilterVisible(res.data.isWeightFilterVisible ?? true);
        setIsCaratFilterVisible(res.data.isCaratFilterVisible ?? true);
        setIsDesignFilterVisible(res.data.isDesignFilterVisible ?? true);
        setIsMasterDesignFilterVisible(res.data.isMasterDesignFilterVisible ?? true);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  // Generic reusable setting toggle handler (DRY)
  const updateSetting = async (
    key: string,
    enabled: boolean,
    label: string,
    setter: (val: boolean) => void
  ) => {
    setUpdatingSettings(true);
    try {
      const res = await PostData(ADMIN_SETTINGS_API, { [key]: enabled });
      if (res && res.success) {
        setter(enabled);
        toast.success(`${label} ${enabled ? "enabled" : "disabled"} successfully`);
      } else {
        toast.error("Failed to update setting");
      }
    } catch (error) {
      console.error(`Error updating setting ${key}:`, error);
      toast.error("Error updating setting");
    } finally {
      setUpdatingSettings(false);
    }
  };

  const handleToggleBranchWiseCart = (enabled: boolean) =>
    updateSetting("isBranchWiseCartEnabled", enabled, "Branch wise cart", setIsBranchWiseCartEnabled);

  const handleToggleAmountVisibleInPLP = (enabled: boolean) =>
    updateSetting("isAmountVisibleInPLP", enabled, "Amount visibility in PLP", setIsAmountVisibleInPLP);

  const handleToggleTitleVisibleInPLP = (enabled: boolean) =>
    updateSetting("isTitleVisibleInPLP", enabled, "Title visibility in PLP", setIsTitleVisibleInPLP);

  const handleToggleBranchCodeVisibleInPLP = (enabled: boolean) =>
    updateSetting("isBranchCodeVisibleInPLP", enabled, "Branch code visibility in PLP", setIsBranchCodeVisibleInPLP);

  const handleToggleWeightVisibleInPLP = (enabled: boolean) =>
    updateSetting("isWeightVisibleInPLP", enabled, "Weight visibility in PLP", setIsWeightVisibleInPLP);

  const handleToggleCaratVisibleInPLP = (enabled: boolean) =>
    updateSetting("isCaratVisibleInPLP", enabled, "Carat visibility in PLP", setIsCaratVisibleInPLP);

  const handleToggleGrossWeightVisibleInPLP = (enabled: boolean) =>
    updateSetting("isGrossWeightVisibleInPLP", enabled, "Gross Weight visibility in PLP", setIsGrossWeightVisibleInPLP);

  const handleToggleNetWeightVisibleInPLP = (enabled: boolean) =>
    updateSetting("isNetWeightVisibleInPLP", enabled, "Net Weight visibility in PLP", setIsNetWeightVisibleInPLP);

  const handleToggleMCPerGramVisible = (enabled: boolean) =>
    updateSetting("isMCPerGramVisible", enabled, "MC Per Gram visibility", setIsMCPerGramVisible);

  const handleToggleMCPerPieceVisible = (enabled: boolean) =>
    updateSetting("isMCPerPieceVisible", enabled, "MC Per Piece visibility", setIsMCPerPieceVisible);

  const handleToggleMCPercentVisible = (enabled: boolean) =>
    updateSetting("isMCPercentVisible", enabled, "MC Percent visibility", setIsMCPercentVisible);

  const handleToggleWastageGramsVisible = (enabled: boolean) =>
    updateSetting("isWastageGramsVisible", enabled, "Wastage Grams visibility", setIsWastageGramsVisible);

  const handleToggleWastagePercentVisible = (enabled: boolean) =>
    updateSetting("isWastagePercentVisible", enabled, "Wastage Percent visibility", setIsWastagePercentVisible);

  const handleToggleCombinedMetalValue = (enabled: boolean) =>
    updateSetting("isCombinedMetalValueEnabled", enabled, "Combined metal value", setIsCombinedMetalValueEnabled);

  const handleToggleCustomerDataUpdateEnabled = (enabled: boolean) =>
    updateSetting("isCustomerDataUpdateEnabled", enabled, "Customer data update", setIsCustomerDataUpdateEnabled);

  const handleToggleWebOtpLoginEnabled = (enabled: boolean) =>
    updateSetting("isWebOtpLoginEnabled", enabled, "Web Application OTP Login", setIsWebOtpLoginEnabled);

  const handleToggleHideAllCategoriesSetting = (enabled: boolean) =>
    updateSetting("isHideAllCategoriesEnabled", enabled, "Hide all categories section", setIsHideAllCategoriesEnabled);

  const handleToggleCategoriesAndSubCategories = (enabled: boolean) =>
    updateSetting("isShowCategoriesAndSubCategoriesEnabled", enabled, "Categories & Subcategories hierarchy view", setIsShowCategoriesAndSubCategoriesEnabled);

  // Storefront Filter Handlers
  const handleToggleFilterBarVisible = (enabled: boolean) =>
    updateSetting("isFilterBarVisible", enabled, "Storefront Filter Bar", setIsFilterBarVisible);

  const handleToggleBranchFilterVisible = (enabled: boolean) =>
    updateSetting("isBranchFilterVisible", enabled, "Branch filter", setIsBranchFilterVisible);

  const handleToggleCategoryFilterVisible = (enabled: boolean) =>
    updateSetting("isCategoryFilterVisible", enabled, "Category filter", setIsCategoryFilterVisible);

  const handleToggleProductCodeFilterVisible = (enabled: boolean) =>
    updateSetting("isProductCodeFilterVisible", enabled, "Product Code filter", setIsProductCodeFilterVisible);

  const handleToggleCounterFilterVisible = (enabled: boolean) =>
    updateSetting("isCounterFilterVisible", enabled, "Counter filter", setIsCounterFilterVisible);

  const handleToggleSupplierFilterVisible = (enabled: boolean) =>
    updateSetting("isSupplierFilterVisible", enabled, "Supplier filter", setIsSupplierFilterVisible);

  const handleToggleStockFilterVisible = (enabled: boolean) =>
    updateSetting("isStockFilterVisible", enabled, "Stock filter", setIsStockFilterVisible);

  const handleTogglePurityFilterVisible = (enabled: boolean) =>
    updateSetting("isPurityFilterVisible", enabled, "Purity filter", setIsPurityFilterVisible);

  const handleTogglePriceFilterVisible = (enabled: boolean) =>
    updateSetting("isPriceFilterVisible", enabled, "Price filter", setIsPriceFilterVisible);

  const handleToggleGenderFilterVisible = (enabled: boolean) =>
    updateSetting("isGenderFilterVisible", enabled, "Gender filter", setIsGenderFilterVisible);

  const handleToggleWeightFilterVisible = (enabled: boolean) =>
    updateSetting("isWeightFilterVisible", enabled, "Weight filter", setIsWeightFilterVisible);

  const handleToggleCaratFilterVisible = (enabled: boolean) =>
    updateSetting("isCaratFilterVisible", enabled, "Carat filter", setIsCaratFilterVisible);

  const handleToggleDesignFilterVisible = (enabled: boolean) =>
    updateSetting("isDesignFilterVisible", enabled, "Design filter", setIsDesignFilterVisible);

  const handleToggleMasterDesignFilterVisible = (enabled: boolean) =>
    updateSetting("isMasterDesignFilterVisible", enabled, "Master Design filter", setIsMasterDesignFilterVisible);

  const handleToggleCategoryVisibility = async (categoryName: string) => {
    const isCurrentlyHidden = hiddenCategories.includes(categoryName);
    const updated = isCurrentlyHidden
      ? hiddenCategories.filter((c) => c !== categoryName)
      : [...hiddenCategories, categoryName];

    setHiddenCategories(updated);
    setUpdatingSettings(true);
    try {
      const res = await PostData(ADMIN_SETTINGS_API, { hiddenCategories: updated });
      if (res && res.success) {
        toast.success(
          isCurrentlyHidden
            ? `"${categoryName}" category is now visible on storefront`
            : `"${categoryName}" category is now hidden from storefront`
        );
      } else {
        toast.error("Failed to update category visibility");
        setHiddenCategories(hiddenCategories);
      }
    } catch (error) {
      console.error("Error updating category visibility:", error);
      toast.error("Error updating category visibility");
      setHiddenCategories(hiddenCategories);
    } finally {
      setUpdatingSettings(false);
    }
  };

  const handleShowAllCategories = async () => {
    setHiddenCategories([]);
    setUpdatingSettings(true);
    try {
      const res = await PostData(ADMIN_SETTINGS_API, { hiddenCategories: [] });
      if (res && res.success) {
        toast.success("All categories are now visible on storefront");
      } else {
        toast.error("Failed to update settings");
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Error updating settings");
    } finally {
      setUpdatingSettings(false);
    }
  };

  const handleHideAllCategories = async () => {
    const allCatNames = categoriesList.map(
      (c: any) => c.CategoryName || c.categoryName
    );
    setHiddenCategories(allCatNames);
    setUpdatingSettings(true);
    try {
      const res = await PostData(ADMIN_SETTINGS_API, { hiddenCategories: allCatNames });
      if (res && res.success) {
        toast.success("All categories marked as hidden on storefront");
      } else {
        toast.error("Failed to update settings");
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Error updating settings");
    } finally {
      setUpdatingSettings(false);
    }
  };

  const handleToggleCounterOtpValidationEnabled = (enabled: boolean) =>
    updateSetting("isCounterOtpValidationEnabled", enabled, "Counter OTP validation", setIsCounterOtpValidationEnabled);

  const handleToggleCounterOtp = async (counterCode: string, counterName: string) => {
    const isCurrentlyRequired = otpRequiredCounters.includes(counterCode);
    const updated = isCurrentlyRequired
      ? otpRequiredCounters.filter((c) => c !== counterCode)
      : [...otpRequiredCounters, counterCode];

    setOtpRequiredCounters(updated);
    setUpdatingSettings(true);
    try {
      const res = await PostData(ADMIN_SETTINGS_API, { otpRequiredCounters: updated });
      if (res && res.success) {
        toast.success(
          isCurrentlyRequired
            ? `OTP validation disabled for "${counterName}" (${counterCode})`
            : `OTP validation enabled for "${counterName}" (${counterCode})`
        );
      } else {
        toast.error("Failed to update counter OTP setting");
        setOtpRequiredCounters(otpRequiredCounters);
      }
    } catch (error) {
      console.error("Error updating counter OTP setting:", error);
      toast.error("Error updating counter OTP setting");
      setOtpRequiredCounters(otpRequiredCounters);
    } finally {
      setUpdatingSettings(false);
    }
  };

  const handleEnableAllCounterOtp = async () => {
    const allCodes = countersList.map((c) => c.counter_code);
    setOtpRequiredCounters(allCodes);
    setUpdatingSettings(true);
    try {
      const res = await PostData(ADMIN_SETTINGS_API, { otpRequiredCounters: allCodes });
      if (res && res.success) {
        toast.success("OTP validation enabled for all counters");
      } else {
        toast.error("Failed to update settings");
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Error updating settings");
    } finally {
      setUpdatingSettings(false);
    }
  };

  const handleDisableAllCounterOtp = async () => {
    setOtpRequiredCounters([]);
    setUpdatingSettings(true);
    try {
      const res = await PostData(ADMIN_SETTINGS_API, { otpRequiredCounters: [] });
      if (res && res.success) {
        toast.success("OTP validation removed for all counters");
      } else {
        toast.error("Failed to update settings");
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Error updating settings");
    } finally {
      setUpdatingSettings(false);
    }
  };

  // Branch GS Code Configuration Handlers
  const fetchBranchGsCodes = async () => {
    setLoadingBranchGsCodes(true);
    try {
      const res = await getBranchGsCodesApi();
      if (res && Array.isArray(res)) {
        setBranchGsCodesData(res);
        // Default expand first 3 branches
        const initialExpanded: Record<string, boolean> = {};
        res.slice(0, 3).forEach((b: BranchGsCodeGroup) => {
          initialExpanded[b.branch_code] = true;
        });
        setExpandedBranches(prev => ({ ...initialExpanded, ...prev }));
      }
    } catch (error) {
      console.error("Error fetching branch GS codes:", error);
      toast.error("Failed to fetch branch GS codes");
    } finally {
      setLoadingBranchGsCodes(false);
    }
  };

  const handleToggleBranchGsCode = async (branch_code: string, gs_code: string, currentEnabled: boolean) => {
    const targetState = !currentEnabled;
    const itemKey = `${branch_code}_${gs_code}`;
    setUpdatingBranchGsCode(itemKey);

    // Optimistic UI update
    setBranchGsCodesData(prev => prev.map(branch => {
      if (branch.branch_code !== branch_code) return branch;
      const updatedGscodes = branch.gscodes.map(gs => {
        if (gs.gs_code === gs_code) {
          return { ...gs, is_enabled: targetState };
        }
        return gs;
      });
      const enabledCount = updatedGscodes.filter(g => g.is_enabled).length;
      return {
        ...branch,
        enabled_count: enabledCount,
        disabled_count: updatedGscodes.length - enabledCount,
        gscodes: updatedGscodes
      };
    }));

    try {
      const res = await toggleBranchGsCodeApi({
        branch_code,
        gs_code,
        is_enabled: targetState
      });

      if (res && res.success) {
        toast.success(
          targetState
            ? `GS Code "${gs_code}" enabled for branch "${branch_code}"`
            : `GS Code "${gs_code}" disabled for branch "${branch_code}" (excluded from PLP & search)`
        );
      } else {
        toast.error("Failed to update GS code status in DB");
        fetchBranchGsCodes();
      }
    } catch (error) {
      console.error("Error updating branch GS code:", error);
      toast.error("Error saving GS code status to DB");
      fetchBranchGsCodes();
    } finally {
      setUpdatingBranchGsCode(null);
    }
  };

  const handleToggleAllGsCodesForBranch = async (branch_code: string, targetEnabled: boolean) => {
    const branch = branchGsCodesData.find(b => b.branch_code === branch_code);
    if (!branch || branch.gscodes.length === 0) return;

    setUpdatingBranchGsCode(`branch_${branch_code}`);

    // Optimistic UI update
    setBranchGsCodesData(prev => prev.map(b => {
      if (b.branch_code !== branch_code) return b;
      const updatedGscodes = b.gscodes.map(gs => ({ ...gs, is_enabled: targetEnabled }));
      return {
        ...b,
        enabled_count: targetEnabled ? b.total_gscodes : 0,
        disabled_count: targetEnabled ? 0 : b.total_gscodes,
        gscodes: updatedGscodes
      };
    }));

    try {
      const items = branch.gscodes.map(gs => ({
        branch_code,
        gs_code: gs.gs_code,
        is_enabled: targetEnabled
      }));

      const res = await toggleBranchGsCodeApi({ items });
      if (res && res.success) {
        toast.success(
          targetEnabled
            ? `All GS codes enabled for branch "${branch_code}"`
            : `All GS codes disabled for branch "${branch_code}"`
        );
      } else {
        toast.error("Failed to update branch GS codes in DB");
        fetchBranchGsCodes();
      }
    } catch (error) {
      console.error("Error bulk updating branch GS codes:", error);
      toast.error("Error saving updates to DB");
      fetchBranchGsCodes();
    } finally {
      setUpdatingBranchGsCode(null);
    }
  };

  const toggleBranchExpand = (branch_code: string) => {
    setExpandedBranches(prev => ({
      ...prev,
      [branch_code]: !prev[branch_code]
    }));
  };

  const handleExpandAllBranches = (expand: boolean) => {
    const updated: Record<string, boolean> = {};
    branchGsCodesData.forEach(b => {
      updated[b.branch_code] = expand;
    });
    setExpandedBranches(updated);
  };

  const filteredBranchGsCodes = useMemo(() => {
    if (!branchGsSearchQuery.trim()) return branchGsCodesData;
    const query = branchGsSearchQuery.trim().toLowerCase();
    return branchGsCodesData
      .map(branch => {
        const branchMatches = branch.branch_code.toLowerCase().includes(query);
        const matchedGscodes = branch.gscodes.filter(gs =>
          gs.gs_code.toLowerCase().includes(query)
        );
        if (branchMatches) return branch;
        if (matchedGscodes.length > 0) {
          return {
            ...branch,
            gscodes: matchedGscodes
          };
        }
        return null;
      })
      .filter(Boolean) as BranchGsCodeGroup[];
  }, [branchGsCodesData, branchGsSearchQuery]);

  // Sync branches handler
  const handleToggleSyncBranch = (branchCode: string) => {
    setSelectedSyncBranches(prev => 
      prev.includes(branchCode) 
        ? prev.filter(b => b !== branchCode) 
        : [...prev, branchCode]
    );
  };

  const handleTriggerSync = async () => {
    if (selectedSyncBranches.length === 0) {
      toast.error("Please select at least one branch to synchronize.");
      return;
    }

    if (!window.confirm("Are you sure you want to start product synchronization?")) return;

    setSyncingProducts(true);
    const toastId = toast.loading("Initiating product synchronization. This may take a few minutes...");
    try {
      const branchesQuery = selectedSyncBranches.join(",");
      let url = branchesQuery
        ? `${PRODUCT_SYNC_API}?branches=${branchesQuery}`
        : PRODUCT_SYNC_API;
      if (syncLimit) {
        url += url.includes('?') ? `&limit=${syncLimit}` : `?limit=${syncLimit}`;
      }
      if (syncDate) {
        url += url.includes('?') ? `&barcodeDate=${syncDate}` : `?barcodeDate=${syncDate}`;
      }
      const res = await fetch(url);
      const text = await res.text();
      toast.dismiss(toastId);
      if (res.status === 200) {
        toast.success("Product sync completed successfully!");
        fetchOrders();
      } else {
        toast.error(`Sync failed: ${text || 'Unknown error'}`);
      }
    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error(`Sync error: ${error.message}`);
    } finally {
      setSyncingProducts(false);
    }
  };

  const handleStopSync = async () => {
    if (!window.confirm("Are you sure you want to stop the ongoing synchronization?")) return;
    
    try {
      const res = await fetch(PRODUCT_SYNC_STOP_API);
      if (res.status === 200) {
        toast.success("Stop signal sent successfully!");
        // The syncingProducts flag will be set to false when the original handleTriggerSync fetch completes or errors out
      } else {
        toast.error("Failed to stop synchronization.");
      }
    } catch (error: any) {
      toast.error(`Stop sync error: ${error.message}`);
    }
  };

  // Actions
  const fetchBranches = async () => {
    setLoadingBranches(true);
    try {
      const res = await getData(GET_ALL_BRANCH_LIST);
      if (res && Array.isArray(res)) {
        // Filter out invalid/All branches as they are handled explicitly
        const validBranches = res.filter(
          (b: any) => b.branch_code && b.branch_code.toUpperCase() !== "ALL"
        );
        setBranches(validBranches);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    } finally {
      setLoadingBranches(false);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      // If selectedBranch is 'ALL', fetch '/orders/ALL', otherwise fetch '/orders/:branch'
      const url = `${ORDER_BY_BRANCH_URL}/${selectedBranch}`;
      const res = await getData(url);
      if (res && res.data && Array.isArray(res.data)) {
        setOrders(res.data);
      } else if (Array.isArray(res)) {
        setOrders(res);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders.");
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchOrderDetails = async (orderNo: string | number, custName: string) => {
    setSelectedOrderNo(orderNo);
    setSelectedOrderCustomer(custName);
    setLoadingDetails(true);
    try {
      const url = `${ORDER_DETAILS_BY_ORDER_ID}/${orderNo}`;
      const res = await getData(url);
      if (res && res.data && Array.isArray(res.data)) {
        setOrderDetails(res.data);
      } else if (Array.isArray(res)) {
        setOrderDetails(res);
      } else {
        setOrderDetails([]);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.error("Failed to load order details.");
    } finally {
      setLoadingDetails(false);
    }
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate verification delay
    setTimeout(() => {
      if (username.trim() === "admin" && password === "admin@12345") {
        Cookies.set("is_admin_logged_in", "true", { expires: 1 });
        setIsAdminLoggedIn(true);
        toast.success("Login Successful");
      } else {
        toast.error("Invalid Username or Password");
      }
      setIsSubmitting(false);
    }, 800);
  };

  // Logout handler
  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out of Admin Panel?");
    if (confirmLogout) {
      Cookies.remove("is_admin_logged_in");
      setIsAdminLoggedIn(false);
      setOrders([]);
      setBranches([]);
      setUsername("");
      setPassword("");
      toast.info("Logged out successfully");
    }
  };

  // Search filter
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const query = searchQuery.toLowerCase().trim();
    return orders.filter(
      (o) =>
        String(o.order_no).toLowerCase().includes(query) ||
        String(o.cust_name).toLowerCase().includes(query) ||
        String(o.mobile_no).includes(query)
    );
  }, [orders, searchQuery]);

  if (loadingCheck) {
    return (
      <div className="min-h-screen bg-[#FBF7F1] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="animate-spin text-[#B8924F]" size={36} />
          <p className="text-[#6B5F55] tracking-wider text-sm">Verifying Session...</p>
        </div>
      </div>
    );
  }

  // --- Admin Login Screen ---
  if (!isAdminLoggedIn) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center p-4 bg-[#FBF7F1]"
        style={{
          backgroundImage: `radial-gradient(circle at 10% 20%, rgba(60, 84, 72, 0.03) 0%, transparent 50%), 
                            radial-gradient(circle at 90% 80%, rgba(184, 146, 127, 0.03) 0%, transparent 50%)`
        }}
      >
        <Toaster position="top-center" richColors duration={2000} />

        <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
          {/* Header Banner */}
          <div
            className="p-8 text-center text-white relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #3C5448 0%, #2B3E34 100%)"
            }}
          >
            {/* Ambient Background Lights */}
            <div className="absolute inset-0 pointer-events-none opacity-30">
              <div className="absolute top-[-50%] left-[-50%] w-[200px] h-[200px] rounded-full bg-white blur-[60px]"></div>
              <div className="absolute bottom-[-50%] right-[-50%] w-[200px] h-[200px] rounded-full bg-[#B8924F] blur-[60px]"></div>
            </div>

            <div className="relative z-10">
              <span className="w-12 h-12 rounded-full flex items-center justify-center mx-auto text-[#2B3E34] text-md font-bold mb-3 shadow-md bg-gradient-to-tr from-[#B8924F] via-[#E9C77B] to-[#8C6B33]">
                AD
              </span>
              <h1 className="font-serif text-2xl font-semibold tracking-wide">
                Administrative Portal
              </h1>
              <p className="text-[12px] text-gray-300 tracking-wider uppercase mt-1">
                Instore Catalogue
              </p>
            </div>
          </div>

          {/* Form Panel */}
          <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Username field */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6B5F55]">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter admin username"
                    className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#2A2420] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B8924F]/30 focus:border-[#B8924F] transition-all"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6B5F55]">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#2A2420] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B8924F]/30 focus:border-[#B8924F] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-[#3C5448] hover:bg-[#2B3E34] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3C5448] transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? (
                  <RefreshCw className="animate-spin mr-2" size={16} />
                ) : (
                  "Access Dashboard"
                )}
              </button>

              <button
                type="button"
                onClick={() => router.push("/")}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-[#6B5F55] hover:text-[#2A2420] transition-colors mt-2"
              >
                <ArrowLeft size={14} /> Back to Catalog
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --- Admin Dashboard Screen ---
  return (
    <div className="min-h-screen bg-[#FBF7F1] flex flex-col font-sans">
      <Toaster position="top-center" richColors duration={2000} />

      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="w-[36px] h-[36px] rounded-full flex items-center justify-center text-[#2B3E34] text-xs font-semibold"
              style={{
                background:
                  "conic-gradient(from 180deg, #B8924F, #E9C77B, #8C6B33, #B8924F)"
              }}
            >
              AD
            </span>
            <div>
              <h1 className="font-serif text-lg font-bold text-[#2A2420] tracking-wide leading-tight">
                Instore Catalog Admin
              </h1>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
                  Administrator Area
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/mobile/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#2B3E34] hover:text-[#1E3354] border border-[#B8924F]/50 bg-amber-50/70 rounded-lg hover:bg-amber-100/70 font-semibold transition-colors shadow-xs"
            >
              <Users size={14} className="text-[#8C6B33]" /> User & Device Mapping
            </Link>

            <button
              onClick={() => router.push("/")}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#6B5F55] hover:text-[#2A2420] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={14} /> View Store catalog
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs text-white bg-red-600 hover:bg-red-700 font-medium rounded-lg transition-colors shadow-sm hover:shadow"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeInUp">
        {/* Quick Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Total Orders */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                Total Orders Audited
              </span>
              <span className="text-3xl font-bold font-serif text-[#2A2420]">
                {loadingOrders ? "..." : orders.length}
              </span>
              <span className="text-[11px] text-gray-500 block">
                Across {selectedBranch === "ALL" ? "all branches" : `branch ${selectedBranch}`}
              </span>
            </div>
            <div className="p-3 bg-[#B8924F]/10 rounded-lg text-[#B8924F]">
              <ShoppingBag size={24} />
            </div>
          </div>

          {/* Card 2: Branches Registered */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                Active Branches
              </span>
              <span className="text-3xl font-bold font-serif text-[#2A2420]">
                {loadingBranches ? "..." : branches.length}
              </span>
              <span className="text-[11px] text-gray-500 block">
                Registered store locations
              </span>
            </div>
            <div className="p-3 bg-[#3C5448]/10 rounded-lg text-[#3C5448]">
              <Building size={24} />
            </div>
          </div>

          {/* Card 3: Server Health Status */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                System Status
              </span>
              <div className="flex items-center gap-1.5 py-1">
                <CircleDot size={16} className="text-emerald-500 animate-pulse" />
                <span className="text-lg font-bold text-emerald-600">Online</span>
              </div>
              <span className="text-[11px] text-gray-500 block">
                Connected to Central DB APIs
              </span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
              <RefreshCw size={24} className="animate-spin-slow" style={{ animationDuration: "12s" }} />
            </div>
          </div>
        </section>

        {/* Global Application Settings Panel */}
        <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-5 mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2A2420] flex items-center gap-2">
                <SlidersHorizontal size={20} className="text-[#B8924F]" />
                Application Settings
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Configure global settings for the catalog application.
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <div>
              <h3 className="text-sm font-semibold text-[#2A2420]">Branch Wise Cart Updates</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xl">
                When enabled, the cart automatically updates product pricing based on the selected branch's local rates during checkout.
              </p>
            </div>
            
            <button
              disabled={updatingSettings}
              onClick={() => handleToggleBranchWiseCart(!isBranchWiseCartEnabled)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8924F]/50 focus:ring-offset-2 ${isBranchWiseCartEnabled ? 'bg-emerald-500' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isBranchWiseCartEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <div>
              <h3 className="text-sm font-semibold text-[#2A2420]">Customer Data Update in Cart</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xl">
                When enabled, allows updating customer details directly from the shopping cart. When disabled, customer data updates from the cart are blocked.
              </p>
            </div>
            
            <button
              disabled={updatingSettings}
              onClick={() => handleToggleCustomerDataUpdateEnabled(!isCustomerDataUpdateEnabled)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8924F]/50 focus:ring-offset-2 ${isCustomerDataUpdateEnabled ? 'bg-emerald-500' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isCustomerDataUpdateEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[#2A2420]">Web Application OTP Login</h3>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isWebOtpLoginEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                  {isWebOtpLoginEnabled ? 'OTP Required' : 'Direct Password'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 max-w-xl">
                When enabled, web application login requires OTP authentication sent via SMS to the user's registered mobile number after entering their password. When disabled, users log in directly with password.
              </p>
            </div>
            
            <button
              disabled={updatingSettings}
              onClick={() => handleToggleWebOtpLoginEnabled(!isWebOtpLoginEnabled)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8924F]/50 focus:ring-offset-2 ${isWebOtpLoginEnabled ? 'bg-emerald-500' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isWebOtpLoginEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
          </div>
        </section>

        {/* PLP Display Configuration Panel */}
        <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-4 mb-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2A2420] flex items-center gap-2">
                <SlidersHorizontal size={20} className="text-[#B8924F]" />
                PLP Display Configuration
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Configure which product fields are visible on the Product Listing Pages (PLP).
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
          <div className="flex items-center justify-between py-3 border-b border-gray-50 md:border-b-0 md:odd:border-r md:odd:border-gray-100 md:odd:pr-6 md:even:pl-6 md:last:border-r-0">
            <div>
              <h3 className="text-sm font-semibold text-[#2A2420]">Show Title in PLP</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xl">
                Toggle the visibility of the product name (title) in the product listing pages.
              </p>
            </div>
            
            <button
              disabled={updatingSettings}
              onClick={() => handleToggleTitleVisibleInPLP(!isTitleVisibleInPLP)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8924F]/50 focus:ring-offset-2 ${isTitleVisibleInPLP ? 'bg-emerald-500' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isTitleVisibleInPLP ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-50 md:border-b-0 md:odd:border-r md:odd:border-gray-100 md:odd:pr-6 md:even:pl-6 md:last:border-r-0">
            <div>
              <h3 className="text-sm font-semibold text-[#2A2420]">Show Amount in PLP</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xl">
                When disabled, product amount will be hidden in the product listing pages. Rate API calls will also be skipped.
              </p>
            </div>
            
            <button
              disabled={updatingSettings}
              onClick={() => handleToggleAmountVisibleInPLP(!isAmountVisibleInPLP)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8924F]/50 focus:ring-offset-2 ${isAmountVisibleInPLP ? 'bg-emerald-500' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isAmountVisibleInPLP ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-50 md:border-b-0 md:odd:border-r md:odd:border-gray-100 md:odd:pr-6 md:even:pl-6 md:last:border-r-0">
            <div>
              <h3 className="text-sm font-semibold text-[#2A2420]">Show Branch Code in PLP</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xl">
                Toggle the visibility of the product's branch code in the product listing pages.
              </p>
            </div>
            
            <button
              disabled={updatingSettings}
              onClick={() => handleToggleBranchCodeVisibleInPLP(!isBranchCodeVisibleInPLP)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8924F]/50 focus:ring-offset-2 ${isBranchCodeVisibleInPLP ? 'bg-emerald-500' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isBranchCodeVisibleInPLP ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-50 md:border-b-0 md:odd:border-r md:odd:border-gray-100 md:odd:pr-6 md:even:pl-6 md:last:border-r-0">
            <div>
              <h3 className="text-sm font-semibold text-[#2A2420]">Show Weight in PLP</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xl">
                Toggle the visibility of the product's weight in the product listing pages.
              </p>
            </div>
            
            <button
              disabled={updatingSettings}
              onClick={() => handleToggleWeightVisibleInPLP(!isWeightVisibleInPLP)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8924F]/50 focus:ring-offset-2 ${isWeightVisibleInPLP ? 'bg-emerald-500' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isWeightVisibleInPLP ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-50 md:border-b-0 md:odd:border-r md:odd:border-gray-100 md:odd:pr-6 md:even:pl-6 md:last:border-r-0">
            <div>
              <h3 className="text-sm font-semibold text-[#2A2420]">Show Carat in PLP</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xl">
                Toggle the visibility of the product's carat (diamond weight) in the product listing pages.
              </p>
            </div>
            
            <button
              disabled={updatingSettings}
              onClick={() => handleToggleCaratVisibleInPLP(!isCaratVisibleInPLP)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8924F]/50 focus:ring-offset-2 ${isCaratVisibleInPLP ? 'bg-emerald-500' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isCaratVisibleInPLP ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-50 md:border-b-0 md:odd:border-r md:odd:border-gray-100 md:odd:pr-6 md:even:pl-6 md:last:border-r-0">
            <div>
              <h3 className="text-sm font-semibold text-[#2A2420]">Show Gross Weight in PLP</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xl">
                Toggle the visibility of the product's gross weight in the product listing pages.
              </p>
            </div>
            
            <button
              disabled={updatingSettings}
              onClick={() => handleToggleGrossWeightVisibleInPLP(!isGrossWeightVisibleInPLP)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8924F]/50 focus:ring-offset-2 ${isGrossWeightVisibleInPLP ? 'bg-emerald-500' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isGrossWeightVisibleInPLP ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-50 md:border-b-0 md:odd:border-r md:odd:border-gray-100 md:odd:pr-6 md:even:pl-6 md:last:border-r-0">
            <div>
              <h3 className="text-sm font-semibold text-[#2A2420]">Show Net Weight in PLP</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xl">
                Toggle the visibility of the product's net weight in the product listing pages.
              </p>
            </div>
            
            <button
              disabled={updatingSettings}
              onClick={() => handleToggleNetWeightVisibleInPLP(!isNetWeightVisibleInPLP)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8924F]/50 focus:ring-offset-2 ${isNetWeightVisibleInPLP ? 'bg-emerald-500' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isNetWeightVisibleInPLP ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
          </div>
          </div>
        </section>

        {/* PDP Display Configuration Panel */}
        <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-4 mb-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2A2420] flex items-center gap-2">
                <SlidersHorizontal size={20} className="text-[#B8924F]" />
                PDP Product Details Configuration
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Configure which product detail fields are visible on the Product Details Page (PDP).
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
          <div className="flex items-center justify-between py-3 border-b border-gray-50 md:border-b-0 md:odd:border-r md:odd:border-gray-100 md:odd:pr-6 md:even:pl-6 md:last:border-r-0">
            <div>
              <h3 className="text-sm font-semibold text-[#2A2420]">Show MC Per Gram</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xl">
                Toggle the visibility of Making Charges per gram in the product details page.
              </p>
            </div>
            
            <button
              disabled={updatingSettings}
              onClick={() => handleToggleMCPerGramVisible(!isMCPerGramVisible)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8924F]/50 focus:ring-offset-2 ${isMCPerGramVisible ? 'bg-emerald-500' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isMCPerGramVisible ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-50 md:border-b-0 md:odd:border-r md:odd:border-gray-100 md:odd:pr-6 md:even:pl-6 md:last:border-r-0">
            <div>
              <h3 className="text-sm font-semibold text-[#2A2420]">Show MC Per Piece</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xl">
                Toggle the visibility of Making Charges per piece in the product details page.
              </p>
            </div>
            
            <button
              disabled={updatingSettings}
              onClick={() => handleToggleMCPerPieceVisible(!isMCPerPieceVisible)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8924F]/50 focus:ring-offset-2 ${isMCPerPieceVisible ? 'bg-emerald-500' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isMCPerPieceVisible ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-50 md:border-b-0 md:odd:border-r md:odd:border-gray-100 md:odd:pr-6 md:even:pl-6 md:last:border-r-0">
            <div>
              <h3 className="text-sm font-semibold text-[#2A2420]">Show MC Percent</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xl">
                Toggle the visibility of Making Charges percentage in the product details page.
              </p>
            </div>
            
            <button
              disabled={updatingSettings}
              onClick={() => handleToggleMCPercentVisible(!isMCPercentVisible)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8924F]/50 focus:ring-offset-2 ${isMCPercentVisible ? 'bg-emerald-500' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isMCPercentVisible ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-50 md:border-b-0 md:odd:border-r md:odd:border-gray-100 md:odd:pr-6 md:even:pl-6 md:last:border-r-0">
            <div>
              <h3 className="text-sm font-semibold text-[#2A2420]">Show Wastage Grams</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xl">
                Toggle the visibility of Wastage Grams in the product details page.
              </p>
            </div>
            
            <button
              disabled={updatingSettings}
              onClick={() => handleToggleWastageGramsVisible(!isWastageGramsVisible)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8924F]/50 focus:ring-offset-2 ${isWastageGramsVisible ? 'bg-emerald-500' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isWastageGramsVisible ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-50 md:border-b-0 md:odd:border-r md:odd:border-gray-100 md:odd:pr-6 md:even:pl-6 md:last:border-r-0">
            <div>
              <h3 className="text-sm font-semibold text-[#2A2420]">Show Wastage Percent</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xl">
                Toggle the visibility of Wastage Percent in the product details page.
              </p>
            </div>
            
            <button
              disabled={updatingSettings}
              onClick={() => handleToggleWastagePercentVisible(!isWastagePercentVisible)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8924F]/50 focus:ring-offset-2 ${isWastagePercentVisible ? 'bg-emerald-500' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isWastagePercentVisible ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-50 md:border-b-0 md:odd:border-r md:odd:border-gray-100 md:odd:pr-6 md:even:pl-6 md:last:border-r-0">
            <div>
              <h3 className="text-sm font-semibold text-[#2A2420]">Combine Metal & Making Charges</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xl">
                When enabled, making charges value will be combined into the metal (Gold) value on the product details page.
              </p>
            </div>
            
            <button
              disabled={updatingSettings}
              onClick={() => handleToggleCombinedMetalValue(!isCombinedMetalValueEnabled)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8924F]/50 focus:ring-offset-2 ${isCombinedMetalValueEnabled ? 'bg-emerald-500' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isCombinedMetalValueEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
          </div>
          </div>
        </section>

        {/* Storefront Filter Display Configuration Panel */}
        <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-4 mb-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2A2420] flex items-center gap-2">
                <Filter size={20} className="text-[#B8924F]" />
                Storefront Filters Display Configuration
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Configure which filter controls are visible on Category Listing (PLP) and Search pages.
              </p>
            </div>

            {/* Master Toggle Banner */}
            <div className="flex items-center gap-3 bg-amber-50/70 border border-amber-200/60 px-4 py-2 rounded-lg">
              <span className="text-xs font-semibold text-[#2A2420]">
                All Filters Bar: {isFilterBarVisible ? "Visible" : "Hidden"}
              </span>
              <button
                disabled={updatingSettings}
                onClick={() => handleToggleFilterBarVisible(!isFilterBarVisible)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8924F]/50 focus:ring-offset-2 ${isFilterBarVisible ? 'bg-emerald-500' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isFilterBarVisible ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
            {/* Branch Filter */}
            <div className="flex items-center justify-between py-3 border-b border-gray-50 md:border-b-0 md:odd:border-r md:odd:border-gray-100 md:odd:pr-6 md:even:pl-6 md:last:border-r-0">
              <div>
                <h3 className="text-sm font-semibold text-[#2A2420]">Branch Filter</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xl">
                  Allow users to filter products by branch / store location.
                </p>
              </div>
              <button
                disabled={updatingSettings || !isFilterBarVisible}
                onClick={() => handleToggleBranchFilterVisible(!isBranchFilterVisible)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8924F]/50 focus:ring-offset-2 ${!isFilterBarVisible ? 'opacity-40 cursor-not-allowed bg-gray-300' : isBranchFilterVisible ? 'bg-emerald-500' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isBranchFilterVisible ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Category Filter */}
            <div className="flex items-center justify-between py-3 border-b border-gray-50 md:border-b-0 md:odd:border-r md:odd:border-gray-100 md:odd:pr-6 md:even:pl-6 md:last:border-r-0">
              <div>
                <h3 className="text-sm font-semibold text-[#2A2420]">Category Filter</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xl">
                  Display category selection dropdown in the filter bar.
                </p>
              </div>
              <button
                disabled={updatingSettings || !isFilterBarVisible}
                onClick={() => handleToggleCategoryFilterVisible(!isCategoryFilterVisible)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8924F]/50 focus:ring-offset-2 ${!isFilterBarVisible ? 'opacity-40 cursor-not-allowed bg-gray-300' : isCategoryFilterVisible ? 'bg-emerald-500' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isCategoryFilterVisible ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Product Code Filter */}
            <div className="flex items-center justify-between py-3 border-b border-gray-50 md:border-b-0 md:odd:border-r md:odd:border-gray-100 md:odd:pr-6 md:even:pl-6 md:last:border-r-0">
              <div>
                <h3 className="text-sm font-semibold text-[#2A2420]">Product Code Filter</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xl">
                  Allow filtering by Item / Product code in the filter bar.
                </p>
              </div>
              <button
                disabled={updatingSettings || !isFilterBarVisible}
                onClick={() => handleToggleProductCodeFilterVisible(!isProductCodeFilterVisible)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8924F]/50 focus:ring-offset-2 ${!isFilterBarVisible ? 'opacity-40 cursor-not-allowed bg-gray-300' : isProductCodeFilterVisible ? 'bg-emerald-500' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isProductCodeFilterVisible ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Counter Filter */}
            <div className="flex items-center justify-between py-3 border-b border-gray-50 md:border-b-0 md:odd:border-r md:odd:border-gray-100 md:odd:pr-6 md:even:pl-6 md:last:border-r-0">
              <div>
                <h3 className="text-sm font-semibold text-[#2A2420]">Counter Filter</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xl">
                  Display counter dropdown with OTP validation support.
                </p>
              </div>
              <button
                disabled={updatingSettings || !isFilterBarVisible}
                onClick={() => handleToggleCounterFilterVisible(!isCounterFilterVisible)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8924F]/50 focus:ring-offset-2 ${!isFilterBarVisible ? 'opacity-40 cursor-not-allowed bg-gray-300' : isCounterFilterVisible ? 'bg-emerald-500' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isCounterFilterVisible ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Supplier Filter */}
            <div className="flex items-center justify-between py-3 border-b border-gray-50 md:border-b-0 md:odd:border-r md:odd:border-gray-100 md:odd:pr-6 md:even:pl-6 md:last:border-r-0">
              <div>
                <h3 className="text-sm font-semibold text-[#2A2420]">Supplier Filter</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xl">
                  Display supplier / party filter dropdown in the catalogue (Visible to CPC Users only).
                </p>
              </div>
              <button
                disabled={updatingSettings || !isFilterBarVisible}
                onClick={() => handleToggleSupplierFilterVisible(!isSupplierFilterVisible)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8924F]/50 focus:ring-offset-2 ${!isFilterBarVisible ? 'opacity-40 cursor-not-allowed bg-gray-300' : isSupplierFilterVisible ? 'bg-emerald-500' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isSupplierFilterVisible ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Stock Filter */}
            <div className="flex items-center justify-between py-3 border-b border-gray-50 md:border-b-0 md:odd:border-r md:odd:border-gray-100 md:odd:pr-6 md:even:pl-6 md:last:border-r-0">
              <div>
                <h3 className="text-sm font-semibold text-[#2A2420]">Stock Filter</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xl">
                  Allow filtering by In Stock vs Out of Stock products.
                </p>
              </div>
              <button
                disabled={updatingSettings || !isFilterBarVisible}
                onClick={() => handleToggleStockFilterVisible(!isStockFilterVisible)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8924F]/50 focus:ring-offset-2 ${!isFilterBarVisible ? 'opacity-40 cursor-not-allowed bg-gray-300' : isStockFilterVisible ? 'bg-emerald-500' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isStockFilterVisible ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Purity Filter */}
            <div className="flex items-center justify-between py-3 border-b border-gray-50 md:border-b-0 md:odd:border-r md:odd:border-gray-100 md:odd:pr-6 md:even:pl-6 md:last:border-r-0">
              <div>
                <h3 className="text-sm font-semibold text-[#2A2420]">Purity Filter</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xl">
                  Allow filtering products by gold purity (e.g., 22KT, 18KT, 24KT).
                </p>
              </div>
              <button
                disabled={updatingSettings || !isFilterBarVisible}
                onClick={() => handleTogglePurityFilterVisible(!isPurityFilterVisible)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8924F]/50 focus:ring-offset-2 ${!isFilterBarVisible ? 'opacity-40 cursor-not-allowed bg-gray-300' : isPurityFilterVisible ? 'bg-emerald-500' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isPurityFilterVisible ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Price Filter */}
            <div className="flex items-center justify-between py-3 border-b border-gray-50 md:border-b-0 md:odd:border-r md:odd:border-gray-100 md:odd:pr-6 md:even:pl-6 md:last:border-r-0">
              <div>
                <h3 className="text-sm font-semibold text-[#2A2420]">Price Range Filter</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xl">
                  Allow filtering products by predefined price ranges.
                </p>
              </div>
              <button
                disabled={updatingSettings || !isFilterBarVisible}
                onClick={() => handleTogglePriceFilterVisible(!isPriceFilterVisible)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8924F]/50 focus:ring-offset-2 ${!isFilterBarVisible ? 'opacity-40 cursor-not-allowed bg-gray-300' : isPriceFilterVisible ? 'bg-emerald-500' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isPriceFilterVisible ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Gender Filter */}
            <div className="flex items-center justify-between py-3 border-b border-gray-50 md:border-b-0 md:odd:border-r md:odd:border-gray-100 md:odd:pr-6 md:even:pl-6 md:last:border-r-0">
              <div>
                <h3 className="text-sm font-semibold text-[#2A2420]">Gender Filter</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xl">
                  Allow filtering products by target gender (Men, Women, Kids, Unisex).
                </p>
              </div>
              <button
                disabled={updatingSettings || !isFilterBarVisible}
                onClick={() => handleToggleGenderFilterVisible(!isGenderFilterVisible)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8924F]/50 focus:ring-offset-2 ${!isFilterBarVisible ? 'opacity-40 cursor-not-allowed bg-gray-300' : isGenderFilterVisible ? 'bg-emerald-500' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isGenderFilterVisible ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Weight Filter */}
            <div className="flex items-center justify-between py-3 border-b border-gray-50 md:border-b-0 md:odd:border-r md:odd:border-gray-100 md:odd:pr-6 md:even:pl-6 md:last:border-r-0">
              <div>
                <h3 className="text-sm font-semibold text-[#2A2420]">Weight Filter (g)</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xl">
                  Display weight dropdown options and custom Min/Max weight inputs.
                </p>
              </div>
              <button
                disabled={updatingSettings || !isFilterBarVisible}
                onClick={() => handleToggleWeightFilterVisible(!isWeightFilterVisible)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8924F]/50 focus:ring-offset-2 ${!isFilterBarVisible ? 'opacity-40 cursor-not-allowed bg-gray-300' : isWeightFilterVisible ? 'bg-emerald-500' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isWeightFilterVisible ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Carat Filter */}
            <div className="flex items-center justify-between py-3 border-b border-gray-50 md:border-b-0 md:odd:border-r md:odd:border-gray-100 md:odd:pr-6 md:even:pl-6 md:last:border-r-0">
              <div>
                <h3 className="text-sm font-semibold text-[#2A2420]">Carat Filter</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xl">
                  Display custom Min/Max diamond carat inputs.
                </p>
              </div>
              <button
                disabled={updatingSettings || !isFilterBarVisible}
                onClick={() => handleToggleCaratFilterVisible(!isCaratFilterVisible)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8924F]/50 focus:ring-offset-2 ${!isFilterBarVisible ? 'opacity-40 cursor-not-allowed bg-gray-300' : isCaratFilterVisible ? 'bg-emerald-500' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isCaratFilterVisible ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Design Filter */}
            <div className="flex items-center justify-between py-3 border-b border-gray-50 md:border-b-0 md:odd:border-r md:odd:border-gray-100 md:odd:pr-6 md:even:pl-6 md:last:border-r-0">
              <div>
                <h3 className="text-sm font-semibold text-[#2A2420]">Designs</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xl">
                  Display design name dropdown filter in the catalogue.
                </p>
              </div>
              <button
                disabled={updatingSettings || !isFilterBarVisible}
                onClick={() => handleToggleDesignFilterVisible(!isDesignFilterVisible)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8924F]/50 focus:ring-offset-2 ${!isFilterBarVisible ? 'opacity-40 cursor-not-allowed bg-gray-300' : isDesignFilterVisible ? 'bg-emerald-500' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isDesignFilterVisible ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Master Design Filter */}
            <div className="flex items-center justify-between py-3 border-b border-gray-50 md:border-b-0 md:odd:border-r md:odd:border-gray-100 md:odd:pr-6 md:even:pl-6 md:last:border-r-0">
              <div>
                <h3 className="text-sm font-semibold text-[#2A2420]">Master Designs</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xl">
                  Display master design name dropdown filter in the catalogue.
                </p>
              </div>
              <button
                disabled={updatingSettings || !isFilterBarVisible}
                onClick={() => handleToggleMasterDesignFilterVisible(!isMasterDesignFilterVisible)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8924F]/50 focus:ring-offset-2 ${!isFilterBarVisible ? 'opacity-40 cursor-not-allowed bg-gray-300' : isMasterDesignFilterVisible ? 'bg-emerald-500' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isMasterDesignFilterVisible ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Category Visibility Configuration Panel */}
        <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-4 mb-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2A2420] flex items-center gap-2">
                <Layers size={20} className="text-[#B8924F]" />
                Storefront Category Visibility Configuration
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Configure which product categories are visible by default on the storefront home page, or hide the entire categories section.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShowAllCategories}
                disabled={updatingSettings || hiddenCategories.length === 0}
                className="px-3 py-1.5 text-xs font-semibold text-[#3C5448] hover:text-[#2B3E34] bg-[#3C5448]/10 hover:bg-[#3C5448]/20 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                Make All Visible
              </button>
              <button
                type="button"
                onClick={handleHideAllCategories}
                disabled={updatingSettings || (categoriesList.length > 0 && hiddenCategories.length === categoriesList.length)}
                className="px-3 py-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                Hide All
              </button>
              <button
                type="button"
                onClick={fetchCategories}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                title="Refresh Categories"
              >
                <RefreshCw size={14} className={loadingCategories ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {/* Master Toggle: Hide All Categories Section & Skip API Calls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 mb-3 rounded-xl bg-amber-50/70 border border-amber-200/90 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#2A2420]">Hide All Categories (Skip API Calls)</h3>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${isHideAllCategoriesEnabled ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}`}>
                  {isHideAllCategoriesEnabled ? 'Categories Hidden & API Skipped' : 'Categories Active'}
                </span>
              </div>
              <p className="text-xs text-[#6B5F55] mt-1 max-w-2xl">
                When enabled, the categories section is completely hidden from the storefront home page and category API calls are skipped to optimize performance.
              </p>
            </div>

            <button
              type="button"
              disabled={updatingSettings}
              onClick={() => handleToggleHideAllCategoriesSetting(!isHideAllCategoriesEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8924F]/50 focus:ring-offset-2 flex-shrink-0 cursor-pointer ${isHideAllCategoriesEnabled ? 'bg-red-600' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isHideAllCategoriesEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* Toggle: Categories & Subcategories Hierarchy (/api/v2/categories) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 mb-5 rounded-xl bg-[#3C5448]/5 border border-[#3C5448]/20 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#2A2420]">Show Categories & Subcategories Hierarchy</h3>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${isShowCategoriesAndSubCategoriesEnabled ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-gray-100 text-gray-700'}`}>
                  {isShowCategoriesAndSubCategoriesEnabled ? 'Hierarchy Enabled (/api/v2/categories)' : 'Flat Category Grid'}
                </span>
              </div>
              <p className="text-xs text-[#6B5F55] mt-1 max-w-2xl">
                When enabled, the storefront loads hierarchical categories with nested subcategories from <code className="bg-gray-100 px-1 py-0.5 rounded text-[11px] font-mono">/api/v2/categories</code> (e.g. Gold &rarr; 22KT, 18KT, 14KT, New Arrivals).
              </p>
            </div>

            <button
              type="button"
              disabled={updatingSettings}
              onClick={() => handleToggleCategoriesAndSubCategories(!isShowCategoriesAndSubCategoriesEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#3C5448]/50 focus:ring-offset-2 flex-shrink-0 cursor-pointer ${isShowCategoriesAndSubCategoriesEnabled ? 'bg-[#3C5448]' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isShowCategoriesAndSubCategoriesEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="mb-4 flex items-center justify-between text-xs text-[#6B5F55]">
            <span>
              Total Categories: <strong className="text-[#2A2420]">{categoriesList.length}</strong> | Visible: <strong className="text-emerald-600">{categoriesList.length - hiddenCategories.length}</strong> | Hidden: <strong className="text-amber-600">{hiddenCategories.length}</strong>
            </span>
            <span className="text-[11px] text-gray-400 italic">
              Click any category card to toggle visibility on storefront
            </span>
          </div>

          {loadingCategories ? (
            <div className="py-12 text-center text-xs text-gray-400">
              <RefreshCw className="animate-spin text-[#B8924F] mx-auto mb-2" size={20} />
              Loading category list...
            </div>
          ) : categoriesList.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              No categories found. Click refresh to retry.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {categoriesList.map((cat: any) => {
                const name = cat.CategoryName || cat.categoryName;
                const isHidden = hiddenCategories.includes(name);

                return (
                  <div
                    key={name}
                    onClick={() => handleToggleCategoryVisibility(name)}
                    className={`relative cursor-pointer rounded-xl border p-3 flex flex-col items-center justify-between gap-2 transition-all duration-200 select-none ${
                      isHidden
                        ? "bg-amber-50/40 border-amber-300/80 shadow-xs hover:border-amber-400 opacity-75"
                        : "bg-white border-gray-200 shadow-xs hover:border-[#B8924F] hover:shadow-md"
                    }`}
                  >
                    {/* Badge */}
                    <div className="w-full flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                          isHidden
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {isHidden ? (
                          <>
                            <EyeOff size={10} /> Hidden
                          </>
                        ) : (
                          <>
                            <Eye size={10} /> Visible
                          </>
                        )}
                      </span>
                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors ${
                          isHidden
                            ? "bg-amber-500 border-amber-600 text-white"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {isHidden && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                    </div>

                    {/* Image */}
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 my-1">
                      <FallbackImage
                        src={cat.ImageUrl}
                        alt={name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Name */}
                    <span className="text-xs font-semibold text-[#2A2420] text-center truncate w-full" title={name}>
                      {name}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Counter OTP Validation Configuration Panel */}
        <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-4 mb-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2A2420] flex items-center gap-2">
                <ShieldCheck size={20} className="text-[#B8924F]" />
                Counter OTP Validation Configuration
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Configure which store counters require OTP verification before accessing products or performing actions.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleEnableAllCounterOtp}
                disabled={updatingSettings || (countersList.length > 0 && otpRequiredCounters.length === countersList.length)}
                className="px-3 py-1.5 text-xs font-semibold text-[#3C5448] hover:text-[#2B3E34] bg-[#3C5448]/10 hover:bg-[#3C5448]/20 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                Require All
              </button>
              <button
                type="button"
                onClick={handleDisableAllCounterOtp}
                disabled={updatingSettings || otpRequiredCounters.length === 0}
                className="px-3 py-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                Disable All
              </button>
              <button
                type="button"
                onClick={fetchCounters}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                title="Refresh Counters"
              >
                <RefreshCw size={14} className={loadingCounters ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {/* Master Toggle: Counter OTP Validation Global Switch */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 mb-4 rounded-xl bg-[#3C5448]/5 border border-[#3C5448]/20 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#2A2420]">Enable Counter OTP Protection</h3>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${isCounterOtpValidationEnabled ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-gray-100 text-gray-700'}`}>
                  {isCounterOtpValidationEnabled ? 'Protection Active' : 'Protection Disabled'}
                </span>
              </div>
              <p className="text-xs text-[#6B5F55] mt-1 max-w-2xl">
                Master toggle for counter-level security. When enabled, any counter marked below will enforce OTP verification.
              </p>
            </div>

            <button
              type="button"
              disabled={updatingSettings}
              onClick={() => handleToggleCounterOtpValidationEnabled(!isCounterOtpValidationEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#3C5448]/50 focus:ring-offset-2 flex-shrink-0 cursor-pointer ${isCounterOtpValidationEnabled ? 'bg-[#3C5448]' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isCounterOtpValidationEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="mb-4 flex items-center justify-between text-xs text-[#6B5F55]">
            <span>
              Total Counters: <strong className="text-[#2A2420]">{countersList.length}</strong> | OTP Required: <strong className="text-amber-600">{otpRequiredCounters.length}</strong> | Open Access: <strong className="text-emerald-600">{countersList.length - otpRequiredCounters.length}</strong>
            </span>
            <span className="text-[11px] text-gray-400 italic">
              Click any counter card to toggle OTP validation requirement
            </span>
          </div>

          {loadingCounters ? (
            <div className="py-12 text-center text-xs text-gray-400">
              <RefreshCw className="animate-spin text-[#B8924F] mx-auto mb-2" size={20} />
              Loading counter list...
            </div>
          ) : countersList.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              No counters found from <code className="font-mono text-[11px]">/api/v2/counters</code>. Click refresh to retry.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {countersList.map((counter) => {
                const code = counter.counter_code;
                const name = counter.counter_name;
                const isRequired = otpRequiredCounters.includes(code);

                return (
                  <div
                    key={code}
                    onClick={() => handleToggleCounterOtp(code, name)}
                    className={`relative cursor-pointer rounded-xl border p-4 flex flex-col justify-between gap-3 transition-all duration-200 select-none ${
                      isRequired
                        ? "bg-amber-50/50 border-amber-300/80 shadow-xs hover:border-amber-400"
                        : "bg-white border-gray-200 shadow-xs hover:border-[#B8924F] hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                          {code}
                        </span>
                        <h4 className="text-sm font-semibold text-[#2A2420] mt-1.5" title={name}>
                          {name}
                        </h4>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors flex-shrink-0 mt-0.5 ${
                          isRequired
                            ? "bg-amber-500 border-amber-600 text-white"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {isRequired ? <KeyRound size={12} className="text-white" /> : null}
                      </div>
                    </div>

                    <div className="w-full pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                          isRequired
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {isRequired ? (
                          <>
                            <ShieldAlert size={11} /> OTP Required
                          </>
                        ) : (
                          <>
                            <ShieldCheck size={11} /> Open Access
                          </>
                        )}
                      </span>

                      <span className="text-[11px] font-medium text-gray-400">
                        {isRequired ? "Protected" : "Standard"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Branch-wise GS Code Visibility Configuration (Database Level) */}
        <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-[#2A2420] flex items-center gap-2">
                  <Database size={20} className="text-[#B8924F]" />
                  Branch-wise GS Code Visibility Configuration
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 size={10} /> Database Level
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Configure which product GS codes are visible in PLP listings and Search for each store branch.
                Disabled GS codes are completely excluded at the database query level.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleExpandAllBranches(true)}
                className="px-3 py-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                Expand All
              </button>
              <button
                type="button"
                onClick={() => handleExpandAllBranches(false)}
                className="px-3 py-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                Collapse All
              </button>
              <button
                type="button"
                onClick={fetchBranchGsCodes}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                title="Refresh Branch GS Codes"
              >
                <RefreshCw size={14} className={loadingBranchGsCodes ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {/* Search bar & statistics banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search branch or GS code (e.g. NJM, SL, GL)..."
                value={branchGsSearchQuery}
                onChange={(e) => setBranchGsSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#3C5448] focus:border-[#3C5448]"
              />
              {branchGsSearchQuery && (
                <button
                  type="button"
                  onClick={() => setBranchGsSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-gray-500">
                Total Branches: <strong className="text-gray-800">{branchGsCodesData.length}</strong>
              </span>
              <span className="h-3 w-px bg-gray-200" />
              <span className="text-emerald-700 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Active: <strong>{branchGsCodesData.reduce((acc, b) => acc + b.enabled_count, 0)}</strong>
              </span>
              <span className="h-3 w-px bg-gray-200" />
              <span className="text-amber-700 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                Disabled: <strong>{branchGsCodesData.reduce((acc, b) => acc + b.disabled_count, 0)}</strong>
              </span>
            </div>
          </div>

          {/* Branch List */}
          {loadingBranchGsCodes && branchGsCodesData.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-gray-400">
              <RefreshCw size={24} className="animate-spin mb-2 text-[#B8924F]" />
              <p className="text-sm">Loading branch GS code configurations from database...</p>
            </div>
          ) : filteredBranchGsCodes.length === 0 ? (
            <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm font-medium">No branch GS codes found matching "{branchGsSearchQuery}"</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBranchGsCodes.map((branch) => {
                const isExpanded = expandedBranches[branch.branch_code] ?? false;
                const isAllEnabled = branch.disabled_count === 0;
                const isAllDisabled = branch.enabled_count === 0;
                const isUpdatingBranch = updatingBranchGsCode === `branch_${branch.branch_code}`;

                return (
                  <div
                    key={branch.branch_code}
                    className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-200 bg-white"
                  >
                    {/* Branch Accordion Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50/60 hover:bg-gray-50 transition-colors gap-3">
                      <div
                        onClick={() => toggleBranchExpand(branch.branch_code)}
                        className="flex items-center gap-3 cursor-pointer flex-1 select-none"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#3C5448]/10 text-[#3C5448] font-bold flex items-center justify-center text-xs tracking-wider border border-[#3C5448]/20">
                          {branch.branch_code.slice(0, 3)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#2A2420]">
                              Branch: {branch.branch_code}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                              {branch.total_gscodes} GS Codes
                            </span>
                            {branch.disabled_count > 0 ? (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                                <XCircle size={10} /> {branch.disabled_count} Disabled
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                <CheckCircle2 size={10} /> All Active
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {branch.enabled_count} visible &bull; {branch.disabled_count} hidden
                          </p>
                        </div>
                      </div>

                      {/* Branch Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          type="button"
                          disabled={isUpdatingBranch || isAllEnabled}
                          onClick={() => handleToggleAllGsCodesForBranch(branch.branch_code, true)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-[#3C5448] hover:text-[#2B3E34] bg-[#3C5448]/10 hover:bg-[#3C5448]/20 rounded-md transition-colors disabled:opacity-40 cursor-pointer"
                        >
                          Enable All
                        </button>
                        <button
                          type="button"
                          disabled={isUpdatingBranch || isAllDisabled}
                          onClick={() => handleToggleAllGsCodesForBranch(branch.branch_code, false)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-md transition-colors disabled:opacity-40 cursor-pointer"
                        >
                          Disable All
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleBranchExpand(branch.branch_code)}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-200/50 transition-colors ml-1 cursor-pointer"
                          aria-label={isExpanded ? "Collapse branch" : "Expand branch"}
                        >
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* GS Codes Grid */}
                    {isExpanded && (
                      <div className="p-4 border-t border-gray-100 bg-white">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                          {branch.gscodes.map((gs) => {
                            const isItemUpdating = updatingBranchGsCode === `${branch.branch_code}_${gs.gs_code}`;
                            return (
                              <div
                                key={gs.gs_code}
                                className={`p-3 rounded-lg border transition-all flex flex-col justify-between gap-2 ${
                                  gs.is_enabled
                                    ? "bg-white border-gray-200 hover:border-emerald-300 hover:shadow-xs"
                                    : "bg-red-50/40 border-red-200"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-1">
                                  <div className="min-w-0">
                                    <span className="font-bold text-xs text-[#2A2420] block truncate">
                                      {gs.gs_code}
                                    </span>
                                    <span
                                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider inline-block mt-0.5 ${
                                        gs.is_enabled
                                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                          : "bg-red-100 text-red-700 border border-red-300"
                                      }`}
                                    >
                                      {gs.is_enabled ? "Visible" : "Hidden"}
                                    </span>
                                  </div>

                                  {/* Toggle Switch */}
                                  <button
                                    type="button"
                                    disabled={isItemUpdating}
                                    onClick={() =>
                                      handleToggleBranchGsCode(branch.branch_code, gs.gs_code, gs.is_enabled)
                                    }
                                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                      gs.is_enabled ? "bg-emerald-600" : "bg-gray-300"
                                    } ${isItemUpdating ? "opacity-50 cursor-wait" : ""}`}
                                    title={gs.is_enabled ? "Click to disable" : "Click to enable"}
                                  >
                                    <span
                                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                        gs.is_enabled ? "translate-x-4" : "translate-x-0"
                                      }`}
                                    />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Database Synchronization Panel */}
        <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2A2420] flex items-center gap-2">
                <RefreshCw size={20} className="text-[#B8924F]" />
                Product Database Synchronization
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Select branches to pull live product catalog details from MSSQL central database.
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedSyncBranches(branches.map(b => b.branch_code))}
                className="px-2.5 py-1 text-[11px] font-semibold text-[#3C5448] hover:text-[#2B3E34] bg-gray-50 rounded hover:bg-gray-100 transition-colors"
              >
                Select All
              </button>
              <button
                onClick={() => setSelectedSyncBranches([])}
                className="px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:text-red-700 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2.5">
              {loadingBranches ? (
                <div className="flex items-center gap-2 py-2 text-xs text-gray-400">
                  <RefreshCw className="animate-spin" size={14} /> Loading branch configurations...
                </div>
              ) : branches.length === 0 ? (
                // Fallbacks if branches are empty
                ['NJM', 'NJR'].map(code => (
                  <button
                    type="button"
                    key={code}
                    onClick={() => handleToggleSyncBranch(code)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                      selectedSyncBranches.includes(code)
                        ? "bg-[#3C5448] text-white border-[#3C5448] shadow-sm"
                        : "bg-gray-50 text-[#6B5F55] border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {code}
                  </button>
                ))
              ) : (
                branches.map((b) => (
                  <button
                    type="button"
                    key={b.branch_code}
                    onClick={() => handleToggleSyncBranch(b.branch_code)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                      selectedSyncBranches.includes(b.branch_code)
                        ? "bg-[#3C5448] text-white border-[#3C5448] shadow-sm"
                        : "bg-gray-50 text-[#6B5F55] border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {b.branch_code}
                  </button>
                ))
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 gap-4 border-t border-gray-50">
              <div className="flex flex-col gap-2">
                <div className="text-xs text-[#6B5F55]">
                  Selected branches to sync: <span className="font-semibold text-[#2A2420]">{selectedSyncBranches.length === 0 ? "None selected" : selectedSyncBranches.join(', ')}</span>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="syncDate" className="text-xs font-semibold text-[#2A2420]">Barcode Date:</label>
                    <div className="relative">
                      <input
                        id="syncDate"
                        type="date"
                        value={syncDate}
                        onChange={(e) => setSyncDate(e.target.value)}
                        disabled={syncingProducts}
                        className="w-40 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#2A2420] focus:outline-none focus:ring-2 focus:ring-[#B8924F]/30 focus:border-[#B8924F] disabled:opacity-50 transition-all shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="syncLimit" className="text-xs font-semibold text-[#2A2420]">Limit Products:</label>
                    <div className="relative">
                      <input
                        id="syncLimit"
                        type="number"
                        min="1"
                        placeholder="All (e.g. 500)"
                        value={syncLimit}
                        onChange={(e) => setSyncLimit(e.target.value)}
                        disabled={syncingProducts}
                        className="w-40 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#2A2420] focus:outline-none focus:ring-2 focus:ring-[#B8924F]/30 focus:border-[#B8924F] disabled:opacity-50 transition-all shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {syncingProducts && (
                  <button
                    onClick={handleStopSync}
                    className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-xs transition-all shadow hover:shadow-md flex items-center gap-2"
                  >
                    <X size={14} /> Stop Sync
                  </button>
                )}
                <button
                  onClick={handleTriggerSync}
                  disabled={syncingProducts}
                  className="px-6 py-2.5 bg-[#B8924F] hover:bg-[#8C6B33] text-white font-semibold rounded-lg text-xs transition-all shadow hover:shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {syncingProducts ? (
                    <>
                      <RefreshCw className="animate-spin" size={14} /> Synchronizing...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={14} /> Trigger Product Sync
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Filters and Search */}
        <section className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-[#2A2420] font-semibold">
            <SlidersHorizontal size={18} className="text-[#B8924F]" />
            <span>Audit Filters</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Branch dropdown */}
            <div className="relative">
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full sm:w-48 pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#2A2420] focus:outline-none focus:ring-2 focus:ring-[#B8924F]/30 focus:border-[#B8924F] appearance-none"
              >
                <option value="ALL">All Branches</option>
                {branches.map((b) => (
                  <option key={b.branch_code} value={b.branch_code}>
                    {b.branch_code}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <Building size={14} />
              </div>
            </div>

            {/* Search inputs */}
            <div className="relative flex-1 sm:w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders..."
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#2A2420] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B8924F]/30 focus:border-[#B8924F]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Orders Table Section */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h2 className="font-serif text-md font-semibold text-[#2A2420]">
              Orders Audit Log
            </h2>
            <button
              onClick={fetchOrders}
              className="text-xs text-[#B8924F] hover:text-[#8C6B33] flex items-center gap-1 font-semibold focus:outline-none"
            >
              <RefreshCw size={12} className={loadingOrders ? "animate-spin" : ""} /> Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            {loadingOrders ? (
              <div className="py-24 text-center">
                <RefreshCw className="animate-spin text-[#B8924F] mx-auto mb-3" size={28} />
                <p className="text-xs text-gray-500">Retrieving system orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="py-24 text-center">
                <ShoppingBag className="text-gray-300 mx-auto mb-3" size={42} />
                <p className="text-sm font-medium text-gray-600">No orders found</p>
                <p className="text-xs text-gray-400 mt-1">
                  Try adjusting filters or search string.
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/30 text-left">
                  <tr>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Order No
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Order Date
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Customer Details
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredOrders.map((order) => {
                    const formattedDate = order.order_date
                      ? new Date(order.order_date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })
                      : "N/A";

                    return (
                      <tr
                        key={order.order_no}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2A2420]">
                          <span className="inline-flex items-center gap-1 font-mono text-[#3C5448]">
                            <Hash size={13} className="text-[#B8924F]" />
                            {order.order_no}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-gray-400" />
                            {formattedDate}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-[#2A2420]">
                            {order.cust_name || "Unknown Customer"}
                          </div>
                          {order.mobile_no && (
                            <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5 font-mono">
                              <Phone size={11} />
                              {order.mobile_no}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <button
                            onClick={() =>
                              fetchOrderDetails(order.order_no, order.cust_name)
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#3C5448] hover:bg-[#2B3E34] rounded-lg transition-colors shadow-sm"
                          >
                            <Eye size={12} /> View Items
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>

      {/* Order Details Modal */}
      {selectedOrderNo && (
        <div className="fixed inset-0 bg-[#2A2420]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-gray-100 animate-scaleIn">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#3C5448] to-[#2B3E34] text-white">
              <div>
                <h3 className="font-serif text-lg font-bold flex items-center gap-1.5">
                  <Hash size={18} className="text-[#E9C77B]" />
                  Order #{selectedOrderNo} Items
                </h3>
                <p className="text-xs text-gray-300 mt-0.5">
                  Customer: <span className="text-white font-medium">{selectedOrderCustomer}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderNo(null)}
                className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all focus:outline-none"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-[#FBF7F1]/40">
              {loadingDetails ? (
                <div className="py-20 text-center">
                  <RefreshCw className="animate-spin text-[#B8924F] mx-auto mb-3" size={32} />
                  <p className="text-xs text-gray-500">Fetching order details...</p>
                </div>
              ) : orderDetails.length === 0 ? (
                <div className="py-20 text-center">
                  <ShoppingBag className="text-gray-300 mx-auto mb-3" size={48} />
                  <p className="text-sm text-gray-500 font-medium">No items found in this order</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Detailed Items list */}
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-100 text-left">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                            Product
                          </th>
                          <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                            GS Code / Barcode
                          </th>
                          <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                            Branch
                          </th>
                          <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-right">
                            Weight
                          </th>
                          <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-right">
                            Pricing Details
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {orderDetails.map((item, idx) => (
                          <tr key={`${item.barcode_no}-${idx}`} className="hover:bg-gray-50/50">
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12 bg-gray-50 border border-gray-200 rounded-md overflow-hidden flex-shrink-0">
                                  <FallbackImage
                                    src={item.ImageUrl}
                                    alt={item.Name}
                                    fill
                                    className="object-contain"
                                  />
                                </div>
                                <div>
                                  <span className="text-sm font-semibold text-[#2A2420] block max-w-[200px] truncate">
                                    {item.Name || "Product Item"}
                                  </span>
                                  {item.orderstatus && (
                                    <span className="inline-flex mt-1 items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#3C5448]/10 text-[#3C5448]">
                                      {item.orderstatus}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-xs font-mono text-gray-500">
                              <div>{item.barcode_no || "N/A"}</div>
                            </td>
                            <td className="px-4 py-4 text-xs font-semibold text-gray-600">
                              <span className="inline-flex items-center gap-1">
                                <Building size={11} className="text-gray-400" />
                                {item.item_branch || "N/A"}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-right text-xs font-mono text-gray-700">
                              {item.from_gwt ? `${Number(item.from_gwt).toFixed(3)}g` : "N/A"}
                            </td>
                            <td className="px-4 py-4 text-right text-xs">
                              <div className="font-mono font-bold text-[#2A2420]">
                                ₹{Number(item.total_amount || 0).toLocaleString("en-IN")}
                              </div>
                              <div className="text-[10px] text-gray-400 mt-0.5 font-mono">
                                Rate: ₹{Number(item.OrderRate || 0).toLocaleString("en-IN")}
                              </div>
                              {(item.StoneAmount > 0 || item.DiamondAmount > 0) && (
                                <div className="text-[10px] text-[#B8924F] font-mono">
                                  Stones: ₹
                                  {Number(
                                    (item.StoneAmount || 0) + (item.DiamondAmount || 0)
                                  ).toLocaleString("en-IN")}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary info card */}
                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between gap-4 text-sm text-[#2A2420]">
                    <div>
                      <h4 className="font-semibold text-gray-400 uppercase tracking-wider text-[11px]">
                        Order Summary
                      </h4>
                      <div className="mt-1 space-y-1 font-mono text-xs text-gray-600">
                        <div>Items count: {orderDetails.length}</div>
                        <div>Total weight: {orderDetails.reduce((acc, curr) => acc + (Number(curr.from_gwt) || 0), 0).toFixed(3)}g</div>
                      </div>
                    </div>
                    <div className="sm:text-right flex flex-col justify-end">
                      <div className="text-xs text-gray-400 uppercase font-semibold">
                        Total Order Price
                      </div>
                      <div className="text-2xl font-serif font-bold text-[#B8924F] font-mono mt-0.5">
                        ₹
                        {orderDetails
                          .reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0)
                          .toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setSelectedOrderNo(null)}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-[#6B5F55] hover:text-[#2A2420] text-sm font-semibold rounded-lg transition-colors focus:outline-none"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
