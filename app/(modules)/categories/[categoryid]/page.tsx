"use client"
import { bhima_boy_Image, GET_ALL_CATEGORY, PRODUCT_LIST_API, GET_ITEM_CODES } from "@/app/Api/api_list"
import { Font_20px } from "@/app/components/labels/page"
import { gender, gscodes, prices, purities, stocks, weightlist } from "@/app/Data/filterdata"
import { checkBranchProductsRate, getAllCategoryApi, getItemCategoriesByGsCodeApi, getBranches, getGender, getCentralDbdata, getAdminSettings, getCountersApi, getSuppliersApi, getMasterDesignNamesApi, getDesignNamesApi } from "@/app/function/action"
import { formatIndianNumber } from "@/app/function/fx"
import { RotateCcw, ChevronLeft, ChevronRight } from "lucide-react"
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation"
import React, { useState, useEffect, Suspense } from "react"
import useSWR from "swr"
import ProductThumbnail from "../product-thumbnail/page"
import Breadcrumb from "@/app/components/page"
import Cookies from "js-cookie"
import Link from "next/link"
import SearchableSelect from "@/app/components/SearchableSelect"
import CounterOtpModal from "@/app/components/CounterOtpModal"
import { ShieldCheck, Lock } from "lucide-react"
import { getHomeBranchFromToken, isCpcUser } from "@/app/function/authUtils"

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error("Failed to fetch")
  }
  return response.json()
}

const extractThumbnailFromImageUrl = (imageArray: any[]): string | null => {
  if (!Array.isArray(imageArray) || imageArray.length === 0) return null;

  const getUrl = (img: any): string => {
    if (!img) return "";
    if (typeof img === "string") return img;
    return img.url || img.ImageUrl || img.ImageURL || img.name || img.src || "";
  };

  // 1. Priority 1: image ending with '_1' (e.g. filename_1.jpg, ..._1.png, abc_1)
  const endsWith1 = imageArray.find((item: any) => {
    const url = getUrl(item).toLowerCase();
    if (!url) return false;
    const cleanUrl = url.split("?")[0].split("#")[0];
    const baseName = cleanUrl.substring(0, cleanUrl.lastIndexOf(".")) || cleanUrl;
    return baseName.endsWith("_1") || cleanUrl.includes("_1.") || cleanUrl.endsWith("_1");
  });
  if (endsWith1) return getUrl(endsWith1);

  // 2. Priority 2: image containing 'main'
  const mainImage = imageArray.find((item: any) => {
    const url = getUrl(item).toLowerCase();
    return url.includes("main");
  });
  if (mainImage) return getUrl(mainImage);

  // 3. Priority 3: fallback to first image in array
  return getUrl(imageArray[0]);
};

export default function ProductListPage() {

  const params = useParams(); // No need to await
  const searchParams = useSearchParams();
  const id = decodeURIComponent(params.categoryid as string)
  const [collectionDetail, setCollectionDetailState] = useState<any[]>([])
  const [totalproduct, setTotalproducts] = useState(0)

  const [page, setPage] = useState(1)

  const [branch, setBranch] = useState([])
  const [selectedgender, setselectedgender] = useState(searchParams.get("gender") || "All")
  const [choosenBranch, setChoosenBranch] = useState(searchParams.get("branch") || "All")
  const [categoryvalue, setCategoryValue] = useState(id)
  const [selectedstock, setselectedstock] = useState(searchParams.get("stock") || "All")
  const [selectedpurity, seselectedpurity] = useState(searchParams.get("purity") || "All")
  const [selectedgscode, seselectedgscode] = useState(searchParams.get("gscode") || "All")
  const [selecteditemcode, setSelecteditemcode] = useState(searchParams.get("itemcode") || "All")
  const [selectedcounter, setSelectedcounter] = useState(searchParams.get("counter") || searchParams.get("counterCode") || "All")
  const [selectedsupplier, setSelectedsupplier] = useState(searchParams.get("supplier_code") || "All")
  const [countersList, setCountersList] = useState<any[]>([])
  const [suppliersList, setSuppliersList] = useState<any[]>([])
  const [masterDesignNamesList, setMasterDesignNamesList] = useState<any[]>([])
  const [designNamesList, setDesignNamesList] = useState<any[]>([])
  const [selectedMasterDesign, setSelectedMasterDesign] = useState(searchParams.get("master_design") || "All")
  const [selectedDesign, setSelectedDesign] = useState(searchParams.get("design") || "All")
  const [pendingCounter, setPendingCounter] = useState<any>(null)
  const [showCounterOtpModal, setShowCounterOtpModal] = useState<boolean>(false)
  const [authenticatedCounters, setAuthenticatedCounters] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem("auth_counters");
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error("Error reading authenticated counters:", e);
      }
    }
    return [];
  })
  const [selectedprice, setselectedprice] = useState(searchParams.get("price") || "All")
  const [limit, setLimit] = useState(25)
  const [selectedweight, setselectedweight] = useState(searchParams.get("weight") || "All")
  const [filterselected, setFilterselected] = useState(false)
  // Custom range filters
  const [minWeight, setMinWeight] = useState(searchParams.get("minWeight") || "")
  const [maxWeight, setMaxWeight] = useState(searchParams.get("maxWeight") || "")
  const [minCarat, setMinCarat] = useState(searchParams.get("minCarat") || "")
  const [maxCarat, setMaxCarat] = useState(searchParams.get("maxCarat") || "")
  const [totalpages, setTotalPages] = useState(0)
  const [currentpage, setCurrentPage] = useState(1)
  const [reset, setReset] = useState(false)
  const [showAmountInPLP, setShowAmountInPLP] = useState(true)
  const [showTitleInPLP, setShowTitleInPLP] = useState(true)
  const [showBranchCodeInPLP, setShowBranchCodeInPLP] = useState(false)
  const [showWeightInPLP, setShowWeightInPLP] = useState(false)
  const [showCaratInPLP, setShowCaratInPLP] = useState(false)
  const [showGrossWeightInPLP, setShowGrossWeightInPLP] = useState(false)
  const [showNetWeightInPLP, setShowNetWeightInPLP] = useState(false)

  const [category, setcategory] = useState<any>()
  const [genderlist, setGenderlist] = useState<any>()
  const [itemcodeslist, setItemcodeslist] = useState<any[]>([])
  const [isHideCategoriesEnabled, setIsHideCategoriesEnabled] = useState(false)
  const [isShowSubCategoriesEnabled, setIsShowSubCategoriesEnabled] = useState(false)

  // Filter Visibility States
  const [showFilterBar, setShowFilterBar] = useState(true)
  const [showBranchFilter, setShowBranchFilter] = useState(true)
  const [showCategoryFilter, setShowCategoryFilter] = useState(true)
  const [showProductCodeFilter, setShowProductCodeFilter] = useState(true)
  const [showCounterFilter, setShowCounterFilter] = useState(true)
  const [showSupplierFilter, setShowSupplierFilter] = useState(false)
  const [showStockFilter, setShowStockFilter] = useState(true)
  const [showPurityFilter, setShowPurityFilter] = useState(true)
  const [showPriceFilter, setShowPriceFilter] = useState(true)
  const [showGenderFilter, setShowGenderFilter] = useState(true)
  const [showWeightFilter, setShowWeightFilter] = useState(true)
  const [showCaratFilter, setShowCaratFilter] = useState(true)
  const [showDesignFilter, setShowDesignFilter] = useState(true)
  const [showMasterDesignFilter, setShowMasterDesignFilter] = useState(true)



  const days = searchParams.get("days") || ""

  const baseurl = id != "All" ? `${PRODUCT_LIST_API}/${id}` : `${GET_ALL_CATEGORY}`
  // Build query string dynamically for ranges
  const buildQuery = () => {
    const loginbranch = getHomeBranchFromToken() || Cookies.get("homebranch") || "";
    let query = `${baseurl}?page=${page}&branchCode=${choosenBranch}&stockStatus=${selectedstock}&purity=${selectedpurity}&gswise=${selectedgscode}&itemCode=${selecteditemcode}&priceRange=${selectedprice}&gender=${selectedgender}&weightRange=${selectedweight}&loginbranch=${loginbranch}`
    if (selectedcounter && selectedcounter !== "All") query += `&counter=${encodeURIComponent(selectedcounter)}&counterCode=${encodeURIComponent(selectedcounter)}`
    if (authenticatedCounters.length > 0) query += `&auth_counters=${encodeURIComponent(authenticatedCounters.join(","))}`
    if (showSupplierFilter && selectedsupplier && selectedsupplier !== "All") query += `&supplier_code=${encodeURIComponent(selectedsupplier)}`
    if (showMasterDesignFilter && selectedMasterDesign && selectedMasterDesign !== "All") query += `&master_design_name=${encodeURIComponent(selectedMasterDesign)}`
    if (showDesignFilter && selectedDesign && selectedDesign !== "All") query += `&design_name=${encodeURIComponent(selectedDesign)}`
    if (minWeight) query += `&minWeight=${minWeight}`
    if (maxWeight) query += `&maxWeight=${maxWeight}`
    const effectiveMinCarat = (!minCarat || minCarat.trim() === "") ? "0.001" : minCarat;
    query += `&minCarat=${effectiveMinCarat}`
    if (maxCarat) query += `&maxCarat=${maxCarat}`
    if (days) query += `&days=${days}`
    return query
  }
  const base = buildQuery()
  const allcategory = GET_ALL_CATEGORY

  const { data, error, isLoading } = useSWR(
    base, fetcher
  )

  useEffect(() => {
    if (
      choosenBranch !== "All" ||
      selectedstock !== "All" ||
      selectedpurity !== "All" ||
      selectedprice !== "All" ||
      selectedgscode !== "All" ||
      selecteditemcode !== "All" ||
      selectedcounter !== "All" ||
      selectedsupplier !== "All" ||
      selectedMasterDesign !== "All" ||
      selectedDesign !== "All" ||
      selectedgender !== "All" ||
      minWeight !== "" ||
      maxWeight !== "" ||
      minCarat !== "" ||
      maxCarat !== ""
    ) {
      setFilterselected(true)
      setPage(1)
    }
  }, [
    choosenBranch,
    selectedstock,
    selectedpurity,
    selectedprice,
    selectedgscode,
    selecteditemcode,
    selectedcounter,
    selectedsupplier,
    selectedMasterDesign,
    selectedDesign,
    selectedgender,
    minWeight,
    maxWeight,
    minCarat,
    maxCarat,
  ])

  // Fetch admin settings for column display toggles
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getAdminSettings();
        if (settings) {
          if (settings.showAmountInPLP !== undefined) setShowAmountInPLP(settings.showAmountInPLP);
          if (settings.showTitleInPLP !== undefined) setShowTitleInPLP(settings.showTitleInPLP);
          if (settings.showBranchCodeInPLP !== undefined) setShowBranchCodeInPLP(settings.showBranchCodeInPLP);
          if (settings.showWeightInPLP !== undefined) setShowWeightInPLP(settings.showWeightInPLP);
          if (settings.showCaratInPLP !== undefined) setShowCaratInPLP(settings.showCaratInPLP);
          if (settings.showGrossWeightInPLP !== undefined) setShowGrossWeightInPLP(settings.showGrossWeightInPLP);
          if (settings.showNetWeightInPLP !== undefined) setShowNetWeightInPLP(settings.showNetWeightInPLP);
        }
      } catch (err) {
        console.error("Error loading admin settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const fetchRatesForProducts = async (products: any[]) => {
    const branchcode = Cookies.get("homebranch") || "BH"
    if (!products || products.length === 0) return

    try {
      const ratePromises = products.map(async (product: any) => {
        try {
          let price = 'xxxx';
          let apiGwt = null;
          let apiNwt = null;
          let apiCarrat = null;
          
          if (showAmountInPLP) {
            const res = await checkBranchProductsRate({
              branchcode,
              BarcodeNo: product.barcode,
              ProductBranch: product.branch_code,
            })
            
            if (res && res.data && res.data.length > 0) {
              const apiData = res.data[0];
              if (apiData.FinalAmount) {
                price = apiData.FinalAmount;
              }
              if (apiData.gwt !== undefined) apiGwt = apiData.gwt;
              if (apiData.nwt !== undefined) apiNwt = apiData.nwt;
              if (apiData.carrat !== undefined) apiCarrat = apiData.carrat;
            }
          }
          
          let newImageUrl = null;
          let centralGwt = null;
          let centralNwt = null;
          let centralCarrat = null;
          try {
            const centralRes = await getCentralDbdata(product.barcode);
            if (centralRes && !centralRes.message) {
              const g = centralRes.gwt !== undefined ? centralRes.gwt : centralRes.Gwt;
              const n = centralRes.nwt !== undefined ? centralRes.nwt : centralRes.Nwt;
              const c = centralRes.carrat !== undefined ? centralRes.carrat : centralRes.Carat;
              
              if (g !== undefined) centralGwt = g;
              if (n !== undefined) centralNwt = n;
              if (c !== undefined) centralCarrat = c;

              const rawImages = centralRes?.ImageUrl || centralRes?.ImageURL || centralRes?.image_url;
              if (rawImages && Array.isArray(rawImages) && rawImages.length > 0) {
                const chosenThumbnail = extractThumbnailFromImageUrl(rawImages);
                if (chosenThumbnail) {
                  newImageUrl = chosenThumbnail;
                }
              }
            }
          } catch (imgError) {
            console.error(`Error fetching central image for ${product.barcode}:`, imgError);
          }
          
          return { barcode: product.barcode, price, newImageUrl, apiGwt, apiNwt, apiCarrat, centralGwt, centralNwt, centralCarrat }
        } catch (error) {
          console.error(`Error fetching rate for ${product.barcode}:`, error)
        }
        return { barcode: product.barcode, price: 'xxxx', newImageUrl: null, apiGwt: null, apiNwt: null, apiCarrat: null, centralGwt: null, centralNwt: null, centralCarrat: null }
      })

      const results = await Promise.all(ratePromises)
      const validUpdates = results.filter((r) => r !== null)

      if (validUpdates.length > 0) {
        setCollectionDetailState((prev) => {
          const updated = prev?.map((item) => {
            const update = validUpdates.find(
              (u: any) => String(u.barcode) === String(item.barcode)
            )
            if (update) {
              const finalGwt = update.centralGwt !== null ? update.centralGwt : (update.apiGwt !== null ? update.apiGwt : item.gross_weight);
              const finalNwt = update.centralNwt !== null ? update.centralNwt : (update.apiNwt !== null ? update.apiNwt : item.metal_weight);
              const finalCarrat = update.centralCarrat !== null ? update.centralCarrat : (update.apiCarrat !== null ? update.apiCarrat : item.diamond_weight);

              return { 
                ...item, 
                price: update.price, 
                customThumbnail: update.newImageUrl,
                gross_weight: finalGwt,
                metal_weight: finalNwt,
                diamond_weight: finalCarrat,
              }
            }
            return item
          })
          return updated
        })
      }
    } catch (error) {
      console.error("Error in fetchRatesForProducts", error)
    }
  }

  useEffect(() => {
    if (data) {
      if (data.pagination && data.pagination.currentPage !== page) {
        setCollectionDetailState([]);
        return;
      }
      
      setReset(false)
      const newProducts = Array.isArray(data?.products) ? data.products : []
      setCollectionDetailState(newProducts)
      fetchRatesForProducts(newProducts)
      
      if (data?.pagination) {
        setTotalproducts(data.pagination.totalProducts)
        setTotalPages(data.pagination.totalPages)
        setCurrentPage(data.pagination.currentPage)
      }
    }
  }, [
    data,
    choosenBranch,
    selectedstock,
    selectedpurity,
    selectedprice,
    selecteditemcode,
    selectedcounter,
    page,
    totalproduct,
    selectedgender,
    reset,
    selectedweight,
    showAmountInPLP
  ])








  const handleLoadMore = () => {
    setCollectionDetailState([]);
    setPage((prev) => Math.min(totalPages, prev + 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  //branch filter

  useEffect(() => {
    // Fetch branches only once
    const getAllBranch = async () => {
      try {
        const branches = await getBranches()
        setBranch(branches)

        // Check for cookie and set branch if it exist
      } catch (error) {
        console.error("Error fetching branches:", error)
      }
    }
    getAllBranch()
  }, [])


  const handleSingleProductRefresh = async (BarcodeNo: string, productbranch: any) => {
    try {
      console.log("barcode ofter refresh", BarcodeNo)
      const branchcode = Cookies.get("homebranch") || "BH"
      const res = await checkBranchProductsRate({ branchcode, BarcodeNo, ProductBranch: productbranch })
      
      let newImageUrl = null;
      try {
        const centralRes = await getCentralDbdata(BarcodeNo);
        const rawImages = centralRes?.ImageUrl || centralRes?.ImageURL || centralRes?.image_url;
        if (rawImages && Array.isArray(rawImages) && rawImages.length > 0) {
           const chosenThumbnail = extractThumbnailFromImageUrl(rawImages);
           if (chosenThumbnail) {
             newImageUrl = chosenThumbnail;
           }
        }
      } catch (imgError) {
         console.error(`Error fetching central image for ${BarcodeNo}:`, imgError);
      }

      console.log("response after refresh rate", res)
      console.log("loading existing plp data for price updation", collectionDetail)
      
      const updatedPrice = (showAmountInPLP && res && res.data && res.data.length > 0 && res.data[0].FinalAmount) ? res.data[0].FinalAmount : 'xxxx';
      
      setCollectionDetailState((prev) => {
        console.log("Updating state for barcode:", BarcodeNo)

        const updated = prev.map((item) => {
          if (String(item.barcode) === String(BarcodeNo)) {
            console.log("Found match! Updating price from", item.price, "to", updatedPrice)
            const updatedItem = { ...item, price: updatedPrice };
            if (newImageUrl) {
              updatedItem.customThumbnail = newImageUrl;
            }
            return updatedItem;
          }
          return item
        })
        return updated
      })
    } catch (error) {
      console.error("Error refreshing single product rate:", error)
    }
  }



  const handlestockselection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setselectedstock(e.target.value)
  }

  const handleBranchSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setChoosenBranch(e.target.value)
  }

  //purityy filter

  const handlepuritychange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    seselectedpurity(e.target.value)
  }



  //Gscode

  const handlegscodechange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    seselectedgscode(e.target.value)
  }

  //price related purityyyy

  const handlepricechange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setselectedprice(e.target.value)
  }

  const totalPages = Math.ceil(totalproduct / limit)

  const pagesArray = Array.from({ length: totalPages }, (_, i) => i + 1)

  const Reset = async () => {
    // setReset(true)
    setChoosenBranch("All")
    setselectedstock("All")
    seselectedpurity("All")
    seselectedgscode("All")
    setSelecteditemcode("All")
    setSelectedcounter("All")
    setSelectedsupplier("All")
    setselectedprice("All")
    setselectedgender("All")
    setselectedweight("All")
    setMinWeight("")
    setMaxWeight("")
    setMinCarat("")
    setMaxCarat("")
    setSelectedMasterDesign("All")
    setSelectedDesign("All")
  }

  const getData = async () => {
    const gender = await getGender()
    const settings = await getAdminSettings()
    let hideCat = false
    let subCatEnabled = false
    if (settings) {
      if (typeof settings.isAmountVisibleInPLP !== 'undefined') setShowAmountInPLP(settings.isAmountVisibleInPLP);
      if (typeof settings.isTitleVisibleInPLP !== 'undefined') setShowTitleInPLP(settings.isTitleVisibleInPLP);
      if (typeof settings.isBranchCodeVisibleInPLP !== 'undefined') setShowBranchCodeInPLP(settings.isBranchCodeVisibleInPLP);
      if (typeof settings.isWeightVisibleInPLP !== 'undefined') setShowWeightInPLP(settings.isWeightVisibleInPLP);
      if (typeof settings.isCaratVisibleInPLP !== 'undefined') setShowCaratInPLP(settings.isCaratVisibleInPLP);
      if (typeof settings.isGrossWeightVisibleInPLP !== 'undefined') setShowGrossWeightInPLP(settings.isGrossWeightVisibleInPLP);
      if (typeof settings.isNetWeightVisibleInPLP !== 'undefined') setShowNetWeightInPLP(settings.isNetWeightVisibleInPLP);
      if (typeof settings.isFilterBarVisible !== 'undefined') setShowFilterBar(settings.isFilterBarVisible);
      if (typeof settings.isBranchFilterVisible !== 'undefined') setShowBranchFilter(settings.isBranchFilterVisible);
      if (typeof settings.isCategoryFilterVisible !== 'undefined') setShowCategoryFilter(settings.isCategoryFilterVisible);
      if (typeof settings.isProductCodeFilterVisible !== 'undefined') setShowProductCodeFilter(settings.isProductCodeFilterVisible);
      if (typeof settings.isCounterFilterVisible !== 'undefined') setShowCounterFilter(settings.isCounterFilterVisible);
      const isSupplierEnabled = typeof settings.isSupplierFilterVisible !== 'undefined' ? Boolean(settings.isSupplierFilterVisible) : true;
      setShowSupplierFilter(isCpcUser() && isSupplierEnabled);
      if (typeof settings.isStockFilterVisible !== 'undefined') setShowStockFilter(settings.isStockFilterVisible);
      if (typeof settings.isPurityFilterVisible !== 'undefined') setShowPurityFilter(settings.isPurityFilterVisible);
      if (typeof settings.isPriceFilterVisible !== 'undefined') setShowPriceFilter(settings.isPriceFilterVisible);
      if (typeof settings.isGenderFilterVisible !== 'undefined') setShowGenderFilter(settings.isGenderFilterVisible);
      if (typeof settings.isWeightFilterVisible !== 'undefined') setShowWeightFilter(settings.isWeightFilterVisible);
      if (typeof settings.isCaratFilterVisible !== 'undefined') setShowCaratFilter(settings.isCaratFilterVisible);
      if (typeof settings.isDesignFilterVisible !== 'undefined') setShowDesignFilter(settings.isDesignFilterVisible);
      if (typeof settings.isMasterDesignFilterVisible !== 'undefined') setShowMasterDesignFilter(settings.isMasterDesignFilterVisible);
      hideCat = Boolean(settings.isHideAllCategoriesEnabled);
      subCatEnabled = Boolean(settings.isShowCategoriesAndSubCategoriesEnabled);
      setIsHideCategoriesEnabled(hideCat);
      setIsShowSubCategoriesEnabled(subCatEnabled);
    }
    setGenderlist(gender)

    // Category filter loading logic
    if (!hideCat) {
      if (subCatEnabled) {
        const data = await getItemCategoriesByGsCodeApi(selectedgscode || 'All')
        setcategory(data)
      } else {
        const data = await getAllCategoryApi()
        if (data && Array.isArray(data) && settings?.hiddenCategories?.length) {
          setcategory(data.filter((c: any) => !settings.hiddenCategories.includes(c.CategoryName || c.categoryName)))
        } else {
          setcategory(data)
        }
      }
    }
  }

  useEffect(() => {
    if (isShowSubCategoriesEnabled && !isHideCategoriesEnabled) {
      const fetchCategoryByGs = async () => {
        try {
          const data = await getItemCategoriesByGsCodeApi(selectedgscode || 'All')
          setcategory(data)
        } catch (e) {
          console.error("Error fetching categories by gs_code:", e)
        }
      }
      fetchCategoryByGs()
    }
  }, [selectedgscode, isShowSubCategoriesEnabled, isHideCategoriesEnabled]);

  useEffect(() => {
    const fetchItemCodes = async () => {
      try {
        // Decode categoryvalue in case it's URL encoded (like from params)
        const categoryName = decodeURIComponent(categoryvalue);
        const categoryParam = categoryName !== "All" ? `?category=${encodeURIComponent(categoryName)}` : "";
        const res = await fetch(`${GET_ITEM_CODES}${categoryParam}`)
        const itemCodesData = await res.json()
        if (itemCodesData.success) {
          setItemcodeslist(itemCodesData.data)
        }
      } catch (e) {
        console.error("Error fetching item codes:", e)
      }
    };
    fetchItemCodes();
  }, [categoryvalue]);

  useEffect(() => {
    const fetchCounters = async () => {
      try {
        const decodedCat = decodeURIComponent(categoryvalue);
        const data = await getCountersApi({
          category: decodedCat !== "All" ? decodedCat : undefined,
          gs_code: selectedgscode !== "All" ? selectedgscode : undefined,
        });
        setCountersList(data || []);
      } catch (e) {
        console.error("Error fetching counters:", e);
      }
    };
    fetchCounters();
  }, [categoryvalue, selectedgscode]);

  useEffect(() => {
    if (!isCpcUser()) {
      setSuppliersList([]);
      return;
    }
    const fetchSuppliers = async () => {
      try {
        const data = await getSuppliersApi();
        setSuppliersList(data || []);
      } catch (e) {
        console.error("Error fetching suppliers:", e);
      }
    };
    fetchSuppliers();
  }, []);

  useEffect(() => {
    const fetchDesignNames = async () => {
      try {
        const data = await getDesignNamesApi();
        setDesignNamesList(data || []);
      } catch (e) {
        console.error("Error fetching design names:", e);
      }
    };
    fetchDesignNames();
  }, []);

  useEffect(() => {
    const fetchMasterDesignNames = async () => {
      try {
        const data = await getMasterDesignNamesApi();
        setMasterDesignNamesList(data || []);
      } catch (e) {
        console.error("Error fetching master design names:", e);
      }
    };
    fetchMasterDesignNames();
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = sessionStorage.getItem("auth_counters");
        if (saved) {
          setAuthenticatedCounters(JSON.parse(saved));
        }
      }
    } catch (e) {
      console.error("Error reading authenticated counters:", e);
    }
  }, []);

  useEffect(() => {
    if (countersList.length > 0 && selectedcounter !== "All") {
      const counterObj = countersList.find((c: any) => c.counter_code === selectedcounter);
      if (counterObj && counterObj.is_otp_required && !authenticatedCounters.includes(selectedcounter)) {
        setPendingCounter(counterObj);
        setShowCounterOtpModal(true);
      }
    }
  }, [countersList, selectedcounter, authenticatedCounters]);

  const handleCounterSelect = (newCounterCode: string) => {
    if (newCounterCode === "All") {
      setSelectedcounter("All");
      return;
    }
    const counterObj = countersList.find((c: any) => c.counter_code === newCounterCode);
    if (counterObj && counterObj.is_otp_required && !authenticatedCounters.includes(newCounterCode)) {
      setPendingCounter(counterObj);
      setShowCounterOtpModal(true);
      return;
    }
    setSelectedcounter(newCounterCode);
  };

  const handleCounterOtpSuccess = () => {
    if (pendingCounter) {
      const code = pendingCounter.counter_code;
      const updated = Array.from(new Set([...authenticatedCounters, code]));
      setAuthenticatedCounters(updated);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("auth_counters", JSON.stringify(updated));
      }
      setSelectedcounter(code);
    }
    setShowCounterOtpModal(false);
    setPendingCounter(null);
  };

  const handleCounterOtpCancel = () => {
    setShowCounterOtpModal(false);
    if (pendingCounter && selectedcounter === pendingCounter.counter_code && !authenticatedCounters.includes(pendingCounter.counter_code)) {
      setSelectedcounter("All");
    }
    setPendingCounter(null);
  };




  useEffect(() => {
    getData()
  }, [])
  const router = useRouter()
  const handleCategory = (selectedCategory: string) => {
    setCategoryValue(selectedCategory) // Update state
    
    const query = new URLSearchParams()
    if (choosenBranch !== "All") query.set("branch", choosenBranch)
    if (selectedstock !== "All") query.set("stock", selectedstock)
    if (selectedpurity !== "All") query.set("purity", selectedpurity)
    if (selectedgscode !== "All") query.set("gscode", selectedgscode)
    if (selecteditemcode !== "All") query.set("itemcode", selecteditemcode)
    if (selectedcounter !== "All") query.set("counter", selectedcounter)
    if (selectedprice !== "All") query.set("price", selectedprice)
    if (selectedgender !== "All") query.set("gender", selectedgender)
    if (selectedweight !== "All") query.set("weight", selectedweight)
    if (minWeight) query.set("minWeight", minWeight)
    if (maxWeight) query.set("maxWeight", maxWeight)
    if (minCarat) query.set("minCarat", minCarat)
    if (maxCarat) query.set("maxCarat", maxCarat)
    if (days) query.set("days", days)
    
    router.push(`/categories/${selectedCategory}?${query.toString()}`) // Navigate using the selected value with params
  }
  const handlegender = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const gen = e.target.value
    setselectedgender(gen) // Update state
    // Navigate using the selected value
  }



  const handleweight = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const gen = e.target.value
    setselectedweight(gen) // Update state
    // Navigate using the selected value
  }


  useEffect(() => {
    localStorage.setItem("plp_list", JSON.stringify(collectionDetail));
    localStorage.setItem("plp_page", page.toString());
    localStorage.setItem("plp_total_pages", totalPages.toString());
    localStorage.setItem("plp_query_url", base);
  }, [collectionDetail, page, totalPages, base]);

  useEffect(() => {
    const gs = searchParams.get("gscode");
    if (gs !== null && gs !== selectedgscode) {
      seselectedgscode(gs);
    }
  }, [searchParams]);

  const branchOptions = [
    { value: "All", label: "All" },
    ...(branch?.map((item: any) => ({
      value: item.branch_code,
      label: item.branch_code,
    })) || []),
  ];

  const categoryOptions = [
    { value: "All", label: "All" },
    ...(category?.map((item: any) => {
      const name = item.CategoryName || item.categoryName || item.Item_Category_Name;
      return { value: name, label: name };
    }) || []).filter((opt: any) => opt.value && opt.value !== "All")
  ];

  const gscodeOptions = gscodes?.map((item: any) => ({
    value: item.value || item.values || "",
    label: item.label || "",
  })) || [];

  const itemcodeOptions = [
    { value: "All", label: "All" },
    ...(itemcodeslist?.map((item: any) => ({
      value: item.Item_code,
      label: item.Item_code,
    })) || []),
  ];

  const counterOptions = [
    { value: "All", label: "All" },
    ...(countersList?.map((item: any) => {
      const isReq = Boolean(item.is_otp_required);
      const isAuth = authenticatedCounters.includes(item.counter_code);
      return {
        value: item.counter_code,
        label: item.counter_name ? `${item.counter_name} (${item.counter_code})` : item.counter_code,
        isOtpRequired: isReq,
        isUnlocked: isReq && isAuth,
      };
    }) || []),
  ];

  const supplierOptions = [
    { value: "All", label: "All" },
    ...(suppliersList?.map((item: any) => ({
      value: item.SupplierCode,
      label: item.SupplierName,
    })) || []),
  ];

  const designNameOptions = [
    { value: "All", label: "All" },
    ...(designNamesList?.map((item: any) => ({
      value: item.design_name,
      label: item.design_name,
    })) || []),
  ];

  const masterDesignNameOptions = [
    { value: "All", label: "All" },
    ...(masterDesignNamesList?.map((item: any) => ({
      value: item.master_design_name,
      label: item.master_design_name,
    })) || []),
  ];

  const stockOptions = stocks || [];
  const purityOptions = purities || [];
  const priceOptions = prices || [];

  const genderOptions = [
    { value: "All", label: "All" },
    ...(genderlist?.filter((item: any) => item.gender !== 'All').map((item: any) => ({
      value: item.gender,
      label: item.gender,
    })) || []),
  ];

  const weightOptions = weightlist || [];

  const removeSpaces = (str: any) => {
    const decodedStr = decodeURIComponent(str); // Decode %20 to space
    return decodedStr.replace(/\s+/g, " "); // Remove all spaces
  };

  const displayTitle = (days === "90" && id === "All") ? "New Arrivals" : removeSpaces(id);

  return (
    <div className="bg-cream min-h-screen pb-16 selection:bg-amber-100/30">

      {/* Breadcrumb section */}
      <div className="pt-[18px] px-4 md:px-9">
        <div className="inline-flex items-center gap-[7px] bg-white border border-[rgba(42,36,32,0.1)] py-2 px-4 rounded-full text-[12.5px] text-ink-soft">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[13px] h-[13px]"><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></svg>
          <Link href="/" className="hover:text-gold-deep transition-colors">Home</Link>
          <span className="text-[rgba(42,36,32,0.1)]">›</span>
          <span className="text-gold-deep font-medium">{displayTitle}</span>
        </div>
      </div>

      {/* Page Head section */}
      <div className="pt-[22px] px-4 md:px-9 pb-1 flex flex-row items-end justify-between">
        <h1 className="font-cormorant font-bold text-[34px] text-ink relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-[42px] after:h-[2px] after:bg-gold">
          {displayTitle}
        </h1>
        <div className="text-[13px] text-ink-soft">
          Total Products: <b className="text-ink font-semibold">{formatIndianNumber(totalproduct || 0)}</b>
        </div>
      </div>

      {/* Filters section */}
      {showFilterBar && (
        <div className="mx-4 md:mx-9 mt-[22px] bg-white border border-[rgba(42,36,32,0.1)] rounded-[14px] p-[18px] md:px-[22px] flex flex-wrap gap-y-[18px] gap-x-[22px] items-end shadow-[0_14px_30px_-22px_rgba(42,36,32,0.25)]">
          {showBranchFilter && (
            <SearchableSelect
              label="Branch"
              options={branchOptions}
              value={choosenBranch}
              onChange={setChoosenBranch}
            />
          )}
          {!isHideCategoriesEnabled && showCategoryFilter && (
            <SearchableSelect
              label="Category"
              options={categoryOptions}
              value={categoryvalue}
              onChange={handleCategory}
            />
          )}
          {showProductCodeFilter && (
            <SearchableSelect
              label="Product Code"
              options={itemcodeOptions}
              value={selecteditemcode}
              onChange={setSelecteditemcode}
            />
          )}
          {showCounterFilter && (
            <SearchableSelect
              label="Counter"
              options={counterOptions}
              value={selectedcounter}
              onChange={handleCounterSelect}
            />
          )}
          {showDesignFilter && (
            <SearchableSelect
              label="Design"
              options={designNameOptions}
              value={selectedDesign}
              onChange={setSelectedDesign}
            />
          )}
          {showMasterDesignFilter && (
            <SearchableSelect
              label="Master Design"
              options={masterDesignNameOptions}
              value={selectedMasterDesign}
              onChange={setSelectedMasterDesign}
            />
          )}
          {showSupplierFilter && (
            <SearchableSelect
              label="Supplier"
              options={supplierOptions}
              value={selectedsupplier}
              onChange={setSelectedsupplier}
            />
          )}
          {/* <SearchableSelect
            label="GS Code"
            options={gscodeOptions}
            value={selectedgscode}
            onChange={seselectedgscode}
          /> */}
          {showStockFilter && (
            <SearchableSelect
              label="Stock"
              options={stockOptions}
              value={selectedstock}
              onChange={setselectedstock}
            />
          )}
        
          {showPurityFilter && (
            <SearchableSelect
              label="Purity"
              options={purityOptions}
              value={selectedpurity}
              onChange={seselectedpurity}
            />
          )}
         
          {showPriceFilter && (
            <SearchableSelect
              label="Price"
              options={priceOptions}
              value={selectedprice}
              onChange={setselectedprice}
            />
          )}
          {showGenderFilter && (
            <SearchableSelect
              label="Gender"
              options={genderOptions}
              value={selectedgender}
              onChange={setselectedgender}
            />
          )}
          {showWeightFilter && (
            <>
              <SearchableSelect
                label="Weight"
                options={weightOptions}
                value={selectedweight}
                onChange={setselectedweight}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] tracking-[0.06em] uppercase text-ink-soft font-medium">Weight (g)</label>
                <div className="flex items-center gap-[6px]">
                  <input type="number" min="0" placeholder="Min" className="font-jost border border-[rgba(42,36,32,0.1)] bg-cream rounded-lg px-3 py-2 text-[13px] text-ink outline-none w-[70px] focus:border-gold focus:shadow-[0_0_0_3px_rgba(184,146,79,0.12)] transition-all duration-200" value={minWeight} onChange={(e) => setMinWeight(e.target.value)} />
                  <span className="text-ink-soft text-[12px]">–</span>
                  <input type="number" min="0" placeholder="Max" className="font-jost border border-[rgba(42,36,32,0.1)] bg-cream rounded-lg px-3 py-2 text-[13px] text-ink outline-none w-[70px] focus:border-gold focus:shadow-[0_0_0_3px_rgba(184,146,79,0.12)] transition-all duration-200" value={maxWeight} onChange={(e) => setMaxWeight(e.target.value)} />
                </div>
              </div>
            </>
          )}

          {showCaratFilter && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] tracking-[0.06em] uppercase text-ink-soft font-medium">Carat</label>
              <div className="flex items-center gap-[6px]">
                <input type="number" min="0" placeholder="Min" className="font-jost border border-[rgba(42,36,32,0.1)] bg-cream rounded-lg px-3 py-2 text-[13px] text-ink outline-none w-[70px] focus:border-gold focus:shadow-[0_0_0_3px_rgba(184,146,79,0.12)] transition-all duration-200" value={minCarat} onChange={(e) => setMinCarat(e.target.value)} />
                <span className="text-ink-soft text-[12px]">–</span>
                <input type="number" min="0" placeholder="Max" className="font-jost border border-[rgba(42,36,32,0.1)] bg-cream rounded-lg px-3 py-2 text-[13px] text-ink outline-none w-[70px] focus:border-gold focus:shadow-[0_0_0_3px_rgba(184,146,79,0.12)] transition-all duration-200" value={maxCarat} onChange={(e) => setMaxCarat(e.target.value)} />
              </div>
            </div>
          )}

          <button onClick={Reset} className="flex items-center gap-[6px] text-gold-deep text-[13px] font-medium bg-transparent border-none cursor-pointer py-2 px-1 hover:opacity-70 transition-opacity duration-200 group">
            <RotateCcw className="w-[14px] h-[14px] group-hover:-rotate-90 transition-transform duration-400" />
            Clear Filters
          </button>
        </div>
      )}

      {/* Product Grid Section */}
      <div className="pt-[22px] px-4 md:px-9 pb-[70px]">
        {totalPages > 1 && (
          <div className="flex justify-end mb-6">
            <div className="bg-white border border-[rgba(42,36,32,0.1)] rounded-full px-5 py-1.5 text-ink-soft text-[13px] font-medium font-jost shadow-sm">
              Page <span className="text-ink font-semibold">{page}</span> of {totalPages}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="w-full flex flex-col items-center justify-center mt-24 mb-32">
            <div className="w-12 h-12 border-[4px] border-[rgba(42,36,32,0.1)] border-t-emerald rounded-full animate-spin mb-4"></div>
            <div className="text-ink-soft text-[14px] font-medium tracking-wide animate-pulse">Loading Products...</div>
          </div>
        )}

        {!isLoading && data && (!data.products || data.products.length === 0) && (
          <div className="w-full flex justify-center mt-16 mb-24">
            <div className="bg-white border border-[rgba(42,36,32,0.1)] rounded-2xl p-8 px-12 text-center shadow-sm">
              <div className="font-cormorant font-bold text-2xl text-ink mb-2">Product Not Available!</div>
              <p className="text-ink-soft text-[13px] font-jost">Try selecting different filters or check another category.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-[22px]">
          {collectionDetail && collectionDetail.length > 0 && collectionDetail.map((productObj: any, index: number) => {
            const nextProduct = collectionDetail[index + 1]
            if (nextProduct) {
              localStorage.setItem("nextProductId", nextProduct?.id)
            }

            return (
              <ProductThumbnail
                key={productObj.barcode || index}
                imageUrl={productObj?.customThumbnail || bhima_boy_Image}
                label={productObj.title || ""}
                barcode={productObj.barcode}
                amount={productObj.price ?? ""}
                inventoryQuantity={productObj.inventory_quantity}
                onRefresh={handleSingleProductRefresh}
                productbranch={productObj?.branch_code}
                showAmount={showAmountInPLP}
                showTitle={showTitleInPLP}
                showBranchCode={showBranchCodeInPLP}
                showWeight={showWeightInPLP}
                weight={productObj.weight}
                showCarat={showCaratInPLP}
                carat={productObj.diamond_weight}
                showGrossWeight={showGrossWeightInPLP}
                grossWeight={productObj.gross_weight}
                showNetWeight={showNetWeightInPLP}
                netWeight={productObj.metal_weight}
                index={index}
              />
            )
          })}
        </div>

        {totalPages > 1 && (
          <>
            <button
              onClick={() => {
                setCollectionDetailState([]);
                setPage(p => Math.max(1, p - 1))
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              disabled={page === 1}
              className={`fixed left-4 top-1/2 -translate-y-1/2 z-50 flex items-center justify-center w-[50px] h-[50px] rounded-full border bg-white ${page === 1 ? 'border-[rgba(42,36,32,0.1)] text-[rgba(42,36,32,0.3)] cursor-not-allowed opacity-50' : 'border-emerald text-emerald hover:bg-emerald hover:text-white transition-all duration-300 shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:scale-105'}`}
            >
              <ChevronLeft size={28} />
            </button>
            
            <button
              onClick={() => {
                setCollectionDetailState([]);
                setPage(p => Math.min(totalPages, p + 1))
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              disabled={page === totalPages}
              className={`fixed right-4 top-1/2 -translate-y-1/2 z-50 flex items-center justify-center w-[50px] h-[50px] rounded-full border bg-white ${page === totalPages ? 'border-[rgba(42,36,32,0.1)] text-[rgba(42,36,32,0.3)] cursor-not-allowed opacity-50' : 'border-emerald text-emerald hover:bg-emerald hover:text-white transition-all duration-300 shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:scale-105'}`}
            >
              <ChevronRight size={28} />
            </button>
          </>
        )}

        {page < totalPages && (
          <div className="flex justify-center mt-12 mb-20 items-center">
            <button className="bg-emerald text-white tracking-widest text-xs uppercase px-8 py-3 rounded-full hover:bg-gold-deep transition-colors duration-300 shadow-md" onClick={handleLoadMore}>
              Load More...
            </button>
          </div>
        )}
      </div>

      {/* Counter OTP Verification Modal */}
      <CounterOtpModal
        isOpen={showCounterOtpModal}
        counterName={pendingCounter?.counter_name || ""}
        counterCode={pendingCounter?.counter_code || ""}
        onSuccess={handleCounterOtpSuccess}
        onCancel={handleCounterOtpCancel}
      />
    </div>
  )
}
