"use client";
import { ADD_TO_CART, bhima_boy_Image, GET_PDP_DATA, RESET_INV } from "@/app/Api/api_list";
import { getData } from "@/app/Api/get/get_api_service";
import { PostData } from "@/app/Api/post/post_api_service";
import { Image as AntImage } from "antd";
import { formatPrice } from "@/app/function/fx";
import Link from "next/link";
import React, { Suspense, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useParams, useRouter } from "next/navigation";
import {
  GetCartByUserId,
  homeBranchValue,
  loginid,
  checkBranchProductsRate,
  getAdminSettings,
} from "@/app/function/action";
import NextBackProduct from "../right_left_product/page";
import BhimaEmptyScreenTemplete from "../../EmptyScreen/page";
import Loader from "@/app/components/loader/loader1/page";
import { useCartData } from "@/app/store/cart/cartdata";
import Breadcrumb from "@/app/components/page";
import { getHomeBranchFromToken, getLoginIdFromToken } from "@/app/function/authUtils";

const filterImageUrl = (url: string): string => {
  if (typeof url !== "string") return url;
  if (url.includes("suvarnagopura.com")) {
    return url.replace("https://productimages.bhimagold.com/", "");
  }
  return url;
};

const ProductPage = () => {
  const { refreshCart } = useCartData()
  const router = useRouter();
  const params = useParams(); // No need to await
  const barcode = params?.barcode; // D
  const [newproduct, setProduct] = useState<any>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isMCPerGramVisible, setIsMCPerGramVisible] = useState<boolean>(true);
  const [isMCPerPieceVisible, setIsMCPerPieceVisible] = useState<boolean>(true);
  const [isMCPercentVisible, setIsMCPercentVisible] = useState<boolean>(true);
  const [isWastageGramsVisible, setIsWastageGramsVisible] = useState<boolean>(true);
  const [isWastagePercentVisible, setIsWastagePercentVisible] = useState<boolean>(true);
  const [isCombinedMetalValueEnabled, setIsCombinedMetalValueEnabled] = useState<boolean>(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getAdminSettings();
        if (settings) {
          if (typeof settings.isMCPerGramVisible !== 'undefined') setIsMCPerGramVisible(settings.isMCPerGramVisible);
          if (typeof settings.isMCPerPieceVisible !== 'undefined') setIsMCPerPieceVisible(settings.isMCPerPieceVisible);
          if (typeof settings.isMCPercentVisible !== 'undefined') setIsMCPercentVisible(settings.isMCPercentVisible);
          if (typeof settings.isWastageGramsVisible !== 'undefined') setIsWastageGramsVisible(settings.isWastageGramsVisible);
          if (typeof settings.isWastagePercentVisible !== 'undefined') setIsWastagePercentVisible(settings.isWastagePercentVisible);
          if (typeof settings.isCombinedMetalValueEnabled !== 'undefined') setIsCombinedMetalValueEnabled(settings.isCombinedMetalValueEnabled);
        }
      } catch (error) {
        console.error("Error fetching admin settings:", error);
      }
    };
    fetchSettings();
  }, []);

  const barcodeno = {
    sku: barcode
  }
  const UpdateLocalInv = async () => {
    const res = await PostData(RESET_INV, barcodeno);
    console.log("res===", res)

  }
  const getProduct = async () => {
    let data = await getData(`${GET_PDP_DATA}${barcode}`);
    if (Array.isArray(data)) {
      data = data.length > 0 ? data[0] : null;
    }
    let home = getHomeBranchFromToken();

    if (home && data) {
      try {
        const branchData = await checkBranchProductsRate({
          "branchcode": home,
          "BarcodeNo": barcode,
          "ProductBranch": data.branch_code
        });

        if (branchData?.success && branchData?.data?.length > 0) {
          const bData = branchData.data[0];
          let nwt = bData.NetWT;
          let gwt = bData.GWT;
          let swt = bData.SWT;
          let qty = bData.Qty || bData.Quantity;
          let MCPerGram = bData.MCPerGram;
          let MCPerPiece = bData.MCPerPiece;
          let MCPercent = bData.MCPercent;
          let WastageGrams = bData.WastageGrams;
          let WastagePercent = bData.WastagePercent;


          if (branchData?.barcodeDetails?.length > 0 && branchData?.barcodeDetails[0]?.ProductDetails) {
            const productDetails = branchData.barcodeDetails[0].ProductDetails;
            nwt = productDetails.NetWeight;
            gwt = productDetails.GrossWeight;
            swt = productDetails.StoneWeight;
            if (productDetails.Qty !== undefined) qty = productDetails.Qty;
            else if (productDetails.Quantity !== undefined) qty = productDetails.Quantity;

            if (productDetails.MCPerGram !== undefined) MCPerGram = productDetails.MCPerGram;
            if (productDetails.MCPerPiece !== undefined) MCPerPiece = productDetails.MCPerPiece;
            if (productDetails.MCPercent !== undefined) MCPercent = productDetails.MCPercent;
            if (productDetails.WastageGrams !== undefined) WastageGrams = productDetails.WastageGrams;
            if (productDetails.WastagePercent !== undefined) WastagePercent = productDetails.WastagePercent;
          }

          let diamondDetailsList: any[] = [];
          let stoneDetailsList: any[] = [];
          if (branchData?.barcodeDetails?.length > 0 && branchData?.barcodeDetails[0]?.StoneDetails) {
            const allStones = branchData.barcodeDetails[0].StoneDetails;
            if (Array.isArray(allStones)) {
              diamondDetailsList = allStones.filter((s: any) => s.StoneCategoryType === 'D');
              stoneDetailsList = allStones.filter((s: any) => s.StoneCategoryType === 'S');
            }
          }

          const stockStatus = branchData?.barcodeDetails?.[0]?.ProductDetails?.Status ?? data.stockStatus;
          data = {
            ...data,
            OrderRate: bData.GoldRate,
            metalAmount: bData.GoldAmount,
            vaAmount: bData.MakingCharges,
            stoneAmount: bData.StoneAmount,
            diamondAmount: bData.DiamondAmount,
            grandTotal: bData.FinalAmount,
            taxAmount: bData.GSTAmount,
            nwt: nwt,
            gwt: gwt,
            swt: swt,
            qty: qty,
            MCPerGram: MCPerGram ?? data.MCPerGram,
            MCPerPiece: MCPerPiece ?? data.MCPerPiece,
            MCPercent: MCPercent ?? data.MCPercent,
            WastageGrams: WastageGrams ?? data.WastageGrams,
            WastagePercent: WastagePercent ?? data.WastagePercent,
            taxableamount: bData.TaxableValue,
            stockStatus: stockStatus,
            rateNotFound: false,
            diamondDetailsList: diamondDetailsList,
            stoneDetailsList: stoneDetailsList,
          }
        } else {
          data = {
            ...data,
            rateNotFound: true,
          }
        }
      } catch (error) {
        console.error("Error fetching branch rate:", error);
        data = {
          ...data,
          rateNotFound: true,
        }
      }
    }

    if (data) {
      setProduct(data);
      console.log("outttt", data.stockStatus)
      // if(data.stockStatus ==0){
      //   await UpdateLocalInv()

      //}

    }
    if (data?.length == 0) {
      // alert("Product Not Found")
      setProduct(null);

      // router.push("/")
    }
  };

  useEffect(() => {
    getProduct();
  }, [barcode]);

  const [quantityState, setQuantityState] = useState<number>(0);

  const home = getHomeBranchFromToken();
  const loginiduserid = getLoginIdFromToken();
  const cartid = Cookies.get("_si_cart_id");

  const AddToCart = async () => {
    const currentHome = getHomeBranchFromToken() || home;
    const currentLoginId = getLoginIdFromToken() || loginiduserid;
    const currentCartId = Cookies.get("_si_cart_id") || cartid;

    const payload = {
      barcode: barcode,
      user_id: currentLoginId != null ? String(currentLoginId) : undefined,
      cart_id: currentCartId || undefined,
      quantity: 1,
      home_branch: currentHome,
    };

    const response = await PostData(ADD_TO_CART, payload);
    if (response && response.cart_id) {
      Cookies.set("_si_cart_id", response.cart_id);
    }
    refreshCart();
  };

  useEffect(() => {
    const getcartdata = async () => {
      const currentLoginId = getLoginIdFromToken() || loginiduserid;
      let cart = await GetCartByUserId(currentLoginId);
      if (Array.isArray(cart)) {
        const foundItem = cart.some((item: any) => item.barcode === barcode);
        if (foundItem) {
          setQuantityState(1);
        }
      }
    };
    getcartdata();
  }, [barcode, loginiduserid]);


  const [mainImgIdx, setMainImgIdx] = useState<number>(0);
  const [isAdded, setIsAdded] = useState<boolean>(false);

  const imageUrls = (Array.isArray(newproduct?.ImageUrl) && newproduct.ImageUrl.length > 0)
    ? newproduct.ImageUrl.map((img: any) => typeof img === "string" ? img : img?.url).filter(Boolean).map(filterImageUrl)
    : [typeof bhima_boy_Image === "string" ? bhima_boy_Image : (bhima_boy_Image as any)?.src].map(filterImageUrl);

  const handleAddClick = () => {
    setIsAdded(true);
    increment();
    setTimeout(() => setIsAdded(false), 1600);
  };

  const increment = () => {
    setQuantityState(quantityState + 1);
    AddToCart();
  };

  if (newproduct?.length == 0) {
    return <Loader />
  }
  if (newproduct == null) {
    return <BhimaEmptyScreenTemplete message="Product Not Found" />;
  }

  return (
    <>
      <style>{`
        @keyframes stockPulse {
            0% { box-shadow: 0 0 0 0 rgba(79,138,109,0.45); }
            70% { box-shadow: 0 0 0 8px rgba(79,138,109,0); }
            100% { box-shadow: 0 0 0 0 rgba(79,138,109,0); }
        }
        @keyframes rise { to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer {
            0% { left: -60%; } 50% { left: 130%; } 100% { left: 130%; }
        }
      `}</style>

      {newproduct?.length !== 0 ? (
        <Suspense fallback={<Loader />}>
          <NextBackProduct pid={newproduct?.barcode} />

          <div className="pt-[18px] px-[20px] lg:px-[36px] bg-[#FBF7F1]">
            <div className="inline-flex items-center gap-[7px] bg-[#FFFFFF] border border-[rgba(42,36,32,0.1)] py-[8px] px-[16px] rounded-full text-[12.5px] text-[#6B5F55]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[13px] h-[13px]"><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></svg>
              Home <span className="text-[rgba(42,36,32,0.4)]">›</span> Categories <span className="text-[rgba(42,36,32,0.4)]">›</span> {newproduct?.CategoryName || 'Others'} <span className="text-[rgba(42,36,32,0.4)]">›</span> <span className="text-[#8C6B33] font-medium">{newproduct?.Name || 'Product'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-[34px] px-[20px] lg:px-[36px] py-[26px] pb-[70px] items-start bg-[#FBF7F1]">

            {/* Gallery */}
            <div className="bg-[#FFFFFF] border border-[rgba(42,36,32,0.1)] rounded-[16px] overflow-hidden shadow-[0_20px_40px_-26px_rgba(42,36,32,0.3)] opacity-0 -translate-y-[16px] animate-[rise_0.6s_ease_forwards]">
              <div className="flex items-center gap-[7px] px-[18px] py-[12px] border-b border-[rgba(42,36,32,0.1)] bg-[#FBF7F1] text-[12.5px] text-[#6B5F55] font-medium">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[13px] h-[13px] text-[#8C6B33]"><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></svg>
                Home <span className="text-[#8C6B33]">›</span> Categories <span className="text-[#8C6B33]">›</span> <span className="text-[#8C6B33] font-bold text-[14px]">{newproduct?.CategoryName || 'Others'}</span>
              </div>
              <div className="flex items-center justify-between px-[18px] py-[14px] border-b border-[rgba(42,36,32,0.1)]">
                <span className="font-cormorant font-bold text-[16px] tracking-[0.04em]">{newproduct?.branch_code }</span>
                {newproduct?.stockStatus > 0 ? (
                  <span className="flex items-center gap-[6px] text-[12.5px] text-[#4F8A6D] font-medium">
                    <span className="w-[7px] h-[7px] rounded-full bg-[#4F8A6D] shadow-[0_0_0_0_rgba(79,138,109,0.5)] animate-[stockPulse_2s_infinite]"></span>
                    In Stock
                  </span>
                ) : (
                  <span className="flex items-center gap-[6px] text-[12.5px] text-red-500 font-medium">
                    <span className="w-[7px] h-[7px] rounded-full bg-red-500 shadow-[0_0_0_0_rgba(239,68,68,0.5)] animate-[stockPulse_2s_infinite]"></span>
                    MTO
                  </span>
                )}
              </div>
              <div className="relative min-h-[460px] h-[520px] lg:h-[580px] w-full flex items-center justify-center p-4 sm:p-6 bg-[radial-gradient(circle_at_50%_45%,#fdfcfa,#f3f0ea)] overflow-hidden">
                {imageUrls.length > 1 && (
                  <div
                    className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[40px] h-[40px] rounded-full bg-[#FFFFFF]/90 backdrop-blur-sm border border-[rgba(42,36,32,0.12)] shadow-md flex items-center justify-center cursor-pointer text-[#2A2420] transition-all hover:bg-[#3C5448] hover:text-white hover:border-[#3C5448] hover:scale-105 z-10"
                    onClick={() => setMainImgIdx((mainImgIdx - 1 + imageUrls.length) % imageUrls.length)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" className="w-[18px] h-[18px]"><path d="M15 18l-6-6 6-6" /></svg>
                  </div>
                )}

                <AntImage.PreviewGroup>
                  {imageUrls.map((url: string, index: number) => (
                    <div
                      key={index}
                      className={`w-full h-full flex items-center justify-center ${index === mainImgIdx ? 'flex' : 'hidden'}`}
                    >
                      <AntImage
                        src={url}
                        alt={newproduct?.Name}
                        rootClassName="w-full h-full flex items-center justify-center"
                        className="!w-auto !h-auto !max-h-[480px] lg:!max-h-[540px] !max-w-[94%] object-contain drop-shadow-[0_20px_35px_rgba(42,36,32,0.18)] transition-transform duration-500 hover:scale-105 cursor-zoom-in"
                        preview={true}
                      />
                    </div>
                  ))}
                </AntImage.PreviewGroup>

                {imageUrls.length > 1 && (
                  <div
                    className="absolute right-[16px] top-1/2 -translate-y-1/2 w-[40px] h-[40px] rounded-full bg-[#FFFFFF]/90 backdrop-blur-sm border border-[rgba(42,36,32,0.12)] shadow-md flex items-center justify-center cursor-pointer text-[#2A2420] transition-all hover:bg-[#3C5448] hover:text-white hover:border-[#3C5448] hover:scale-105 z-10"
                    onClick={() => setMainImgIdx((mainImgIdx + 1) % imageUrls.length)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" className="w-[18px] h-[18px]"><path d="M9 18l6-6-6-6" /></svg>
                  </div>
                )}
              </div>

              {imageUrls.length > 1 && (
                <div className="flex flex-wrap gap-[10px] px-[18px] py-[14px] border-t border-[rgba(42,36,32,0.1)] bg-[#FFFFFF]">
                  {imageUrls.map((url: string, i: number) => (
                    <span
                      key={i}
                      className={`w-[58px] h-[58px] rounded-[10px] border flex items-center justify-center cursor-pointer overflow-hidden transition-all ${
                        i === mainImgIdx
                          ? 'border-[#B8924F] ring-2 ring-[#B8924F]/30 scale-105 bg-[#FFFFFF]'
                          : 'border-[rgba(42,36,32,0.1)] hover:border-[#B8924F]/60 bg-[#f6f4ef]'
                      }`}
                      onClick={() => setMainImgIdx(i)}
                    >
                      <img src={url} className="w-[85%] h-[85%] object-contain" />
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Details panel */}
            <div className="opacity-0 translate-y-[16px] animate-[rise_0.6s_ease_0.1s_forwards] font-jost">
              <div className="mb-[18px]">
                <h1 className="font-cormorant font-bold text-[34px] tracking-[0.02em] mb-[6px] text-[#2A2420]">{newproduct?.Name || "-"}</h1>
                <div className="text-[#B8924F] text-[13px] tracking-[2px]">✦ ✦ ✦ ✦ ✦</div>
              </div>

              <div className="bg-[#FFFFFF] border border-[rgba(42,36,32,0.1)] rounded-[14px] p-[22px_24px] mb-[18px]">
                <h3 className="font-cormorant text-[19px] font-semibold text-[#2A2420] mb-[14px] pb-[8px] relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-[30px] after:h-[2px] after:bg-[#B8924F]">
                  Product Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-[12px] gap-x-[18px]">
                  <div className="text-[13.5px] flex justify-between border-b border-dashed border-[rgba(42,36,32,0.1)] pb-[8px]">
                    <span className="text-[#6B5F55]">SKU</span>
                    <span className="font-medium text-[#2A2420]">{newproduct?.barcode || "-"}</span>
                  </div>

                  {(newproduct?.qty !== undefined && newproduct?.qty !== null) && (
                    <div className="text-[13.5px] flex justify-between border-b border-dashed border-[rgba(42,36,32,0.1)] pb-[8px]">
                      <span className="text-[#6B5F55]">Quantity</span>
                      <span className="font-medium text-[#2A2420]">{newproduct.qty}</span>
                    </div>
                  )}
          
                  {newproduct?.METALTYPE && (
                    <div className="text-[13.5px] flex justify-between border-b border-dashed border-[rgba(42,36,32,0.1)] pb-[8px]">
                      <span className="text-[#6B5F55]">Metal</span>
                      <span className="font-medium text-[#2A2420]">{newproduct.METALTYPE}</span>
                    </div>
                  )}
                  {newproduct?.gwt > 0 && (
                    <div className="text-[13.5px] flex justify-between border-b border-dashed border-[rgba(42,36,32,0.1)] pb-[8px]">
                      <span className="text-[#6B5F55]">Gross Weight</span>
                      <span className="font-medium text-[#2A2420]">{newproduct.gwt} g</span>
                    </div>
                  )}
                  {newproduct?.PURITY && (
                    <div className="text-[13.5px] flex justify-between border-b border-dashed border-[rgba(42,36,32,0.1)] pb-[8px]">
                      <span className="text-[#6B5F55]">Purity</span>
                      <span className="font-medium text-[#2A2420]">{newproduct.PURITY}</span>
                    </div>
                  )}
                  {newproduct?.nwt > 0 && (
                    <div className="text-[13.5px] flex justify-between border-b border-dashed border-[rgba(42,36,32,0.1)] pb-[8px]">
                      <span className="text-[#6B5F55]">Net Weight</span>
                      <span className="font-medium text-[#2A2420]">{newproduct.nwt} g</span>
                    </div>
                  )}
                  {(newproduct?.OrderRate > 0 || newproduct?.rateNotFound) && (
                    <div className="text-[13.5px] flex justify-between border-b border-dashed border-[rgba(42,36,32,0.1)] pb-[8px]">
                      <span className="text-[#6B5F55]">Metal Rate</span>
                      <span className="font-medium text-[#2A2420]">{newproduct?.rateNotFound ? 'xxxx' : formatPrice(newproduct.OrderRate)}</span>
                    </div>
                  )}
                  {newproduct?.swt > 0 && (
                    <div className="text-[13.5px] flex justify-between border-b border-dashed border-[rgba(42,36,32,0.1)] pb-[8px]">
                      <span className="text-[#6B5F55]">Stone Weight</span>
                      <span className="font-medium text-[#2A2420]">{newproduct.swt} g</span>
                    </div>
                  )}
                  {newproduct?.carrat > 0 && (
                    <div className="text-[13.5px] flex justify-between border-b border-dashed border-[rgba(42,36,32,0.1)] pb-[8px]">
                      <span className="text-[#6B5F55]">Diamond Weight</span>
                      <span className="font-medium text-[#2A2420]">{newproduct.carrat} ct</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-[#FFFFFF] border border-[rgba(42,36,32,0.1)] rounded-[14px] p-[22px_24px] mb-[18px]">
                <h3 className="font-cormorant text-[19px] font-semibold text-[#2A2420] mb-[14px] pb-[8px] relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-[30px] after:h-[2px] after:bg-[#B8924F]">
                  Metal Details
                </h3>
                <table className="w-full border-collapse text-[13.5px]">
                  <thead>
                    <tr>
                      <th className="text-left py-[9px] px-[6px] text-[#6B5F55] font-medium text-[11.5px] tracking-[0.04em] uppercase border-b border-[rgba(42,36,32,0.1)]">Component</th>
                      <th className="text-right py-[9px] px-[6px] text-[#6B5F55] font-medium text-[11.5px] tracking-[0.04em] uppercase border-b border-[rgba(42,36,32,0.1)]">Rate</th>
                      <th className="text-right py-[9px] px-[6px] text-[#6B5F55] font-medium text-[11.5px] tracking-[0.04em] uppercase border-b border-[rgba(42,36,32,0.1)]">Weight</th>
                      <th className="text-right py-[9px] px-[6px] text-[#6B5F55] font-medium text-[11.5px] tracking-[0.04em] uppercase border-b border-[rgba(42,36,32,0.1)]">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-[11px] px-[6px] border-b border-[rgba(42,36,32,0.1)] text-[#8C6B33] font-medium">{newproduct?.METALTYPE || "Gold"}</td>
                      <td className="text-right py-[11px] px-[6px] border-b border-[rgba(42,36,32,0.1)]">{newproduct?.rateNotFound ? 'xxxx' : (newproduct?.OrderRate ? formatPrice(newproduct.OrderRate) : "-")}</td>
                      <td className="text-right py-[11px] px-[6px] border-b border-[rgba(42,36,32,0.1)]">{newproduct?.nwt || 0}</td>
                      <td className="text-right py-[11px] px-[6px] border-b border-[rgba(42,36,32,0.1)]">{newproduct?.rateNotFound ? 'xxxx' : formatPrice((newproduct?.metalAmount || 0) + (isCombinedMetalValueEnabled ? (newproduct?.vaAmount || 0) : 0), true)}</td>
                    </tr>
                    {(!isCombinedMetalValueEnabled && (newproduct?.vaAmount > 0 || newproduct?.rateNotFound)) && (
                      <tr>
                        <td className="py-[11px] px-[6px] text-[#8C6B33] font-medium">Making Charges</td>
                        <td className="text-right py-[11px] px-[6px]">–</td>
                        <td className="text-right py-[11px] px-[6px]">–</td>
                        <td className="text-right py-[11px] px-[6px]">{newproduct?.rateNotFound ? 'xxxx' : formatPrice(newproduct?.vaAmount || 0, true)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {((isMCPerGramVisible && newproduct?.MCPerGram !== undefined && newproduct?.MCPerGram !== null) ||
                  (isMCPerPieceVisible && newproduct?.MCPerPiece !== undefined && newproduct?.MCPerPiece !== null) ||
                  (isMCPercentVisible && newproduct?.MCPercent !== undefined && newproduct?.MCPercent !== null) ||
                  (isWastageGramsVisible && newproduct?.WastageGrams !== undefined && newproduct?.WastageGrams !== null) ||
                  (isWastagePercentVisible && newproduct?.WastagePercent !== undefined && newproduct?.WastagePercent !== null)) && (
                  <div className="mt-4 pt-4 border-t border-[rgba(42,36,32,0.1)]">
                    <h4 className="font-cormorant text-[19px] font-semibold text-[#2A2420] mb-[14px] pb-[8px] relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-[30px] after:h-[2px] after:bg-[#B8924F]">
                      MC Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-[12px] gap-x-[18px]">
                      {(isMCPerGramVisible && newproduct?.MCPerGram !== undefined && newproduct?.MCPerGram !== null) && (
                        <div className="text-[13.5px] flex justify-between border-b border-dashed border-[rgba(42,36,32,0.1)] pb-[8px]">
                          <span className="text-[#6B5F55]">MC Per Gram</span>
                          <span className="font-medium text-[#2A2420]">{newproduct.MCPerGram} g</span>
                        </div>
                      )}
                      {(isMCPerPieceVisible && newproduct?.MCPerPiece !== undefined && newproduct?.MCPerPiece !== null) && (
                        <div className="text-[13.5px] flex justify-between border-b border-dashed border-[rgba(42,36,32,0.1)] pb-[8px]">
                          <span className="text-[#6B5F55]">MC Per Piece</span>
                          <span className="font-medium text-[#2A2420]">{newproduct.MCPerPiece}</span>
                        </div>
                      )}
                      {(isMCPercentVisible && newproduct?.MCPercent !== undefined && newproduct?.MCPercent !== null) && (
                        <div className="text-[13.5px] flex justify-between border-b border-dashed border-[rgba(42,36,32,0.1)] pb-[8px]">
                          <span className="text-[#6B5F55]">MC Percent</span>
                          <span className="font-medium text-[#2A2420]">{newproduct.MCPercent}%</span>
                        </div>
                      )}
                      {(isWastageGramsVisible && newproduct?.WastageGrams !== undefined && newproduct?.WastageGrams !== null) && (
                        <div className="text-[13.5px] flex justify-between border-b border-dashed border-[rgba(42,36,32,0.1)] pb-[8px]">
                          <span className="text-[#6B5F55]">Wastage Grams</span>
                          <span className="font-medium text-[#2A2420]">{newproduct.WastageGrams} g</span>
                        </div>
                      )}
                      {(isWastagePercentVisible && newproduct?.WastagePercent !== undefined && newproduct?.WastagePercent !== null) && (
                        <div className="text-[13.5px] flex justify-between border-b border-dashed border-[rgba(42,36,32,0.1)] pb-[8px]">
                          <span className="text-[#6B5F55]">Wastage Percent</span>
                          <span className="font-medium text-[#2A2420]">{newproduct.WastagePercent}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Stone details */}
                {((newproduct?.stoneDetailsList && newproduct.stoneDetailsList.length > 0) || newproduct?.stoneAmount > 0 || newproduct?.rateNotFound) && (
                  <div className="mt-4 pt-4 border-t border-[rgba(42,36,32,0.1)]">
                    <h4 className="font-cormorant text-[19px] font-semibold text-[#2A2420] mb-[14px] pb-[8px] relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-[30px] after:h-[2px] after:bg-[#B8924F]">
                      Stone Details
                    </h4>
                    <table className="w-full border-collapse text-[13.5px]">
                      <thead>
                        <tr>
                          <th className="text-left py-[9px] px-[6px] text-[#6B5F55] font-medium text-[11.5px] tracking-[0.04em] uppercase border-b border-[rgba(42,36,32,0.1)]">Component</th>
                          <th className="text-right py-[9px] px-[6px] text-[#6B5F55] font-medium text-[11.5px] tracking-[0.04em] uppercase border-b border-[rgba(42,36,32,0.1)]">Qty</th>
                          <th className="text-right py-[9px] px-[6px] text-[#6B5F55] font-medium text-[11.5px] tracking-[0.04em] uppercase border-b border-[rgba(42,36,32,0.1)]">Weight (CT)</th>
                          <th className="text-right py-[9px] px-[6px] text-[#6B5F55] font-medium text-[11.5px] tracking-[0.04em] uppercase border-b border-[rgba(42,36,32,0.1)]">Rate</th>
                          <th className="text-right py-[9px] px-[6px] text-[#6B5F55] font-medium text-[11.5px] tracking-[0.04em] uppercase border-b border-[rgba(42,36,32,0.1)]">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {newproduct?.stoneDetailsList && newproduct.stoneDetailsList.length > 0 ? (
                          newproduct.stoneDetailsList.map((stone: any, index: number) => {
                           // const rate = stone.StoneCarat > 0 ? (stone.StoneAmount / stone.StoneCarat) : (stone.StoneQty > 0 ? (stone.StoneAmount / stone.StoneQty) : 0);
                            return (
                              <tr key={index}>
                                <td className="py-[11px] px-[6px] text-[#8C6B33] font-medium border-b border-[rgba(42,36,32,0.05)]">{stone.StoneType || stone.Type || "Stone"}</td>
                                <td className="text-right py-[11px] px-[6px] border-b border-[rgba(42,36,32,0.05)]">{stone.StoneQty || "-"} </td>
                                <td className="text-right py-[11px] px-[6px] border-b border-[rgba(42,36,32,0.05)]">{stone.StoneCarat || 0}</td>
                                <td className="text-right py-[11px] px-[6px] border-b border-[rgba(42,36,32,0.05)]">{newproduct?.rateNotFound ? 'xxxx' : (stone.Rate ? formatPrice(stone.Rate, true) : "-")}</td>
                                <td className="text-right py-[11px] px-[6px] border-b border-[rgba(42,36,32,0.05)]">{newproduct?.rateNotFound ? 'xxxx' : formatPrice(stone.StoneAmount || 0, true)}</td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td className="py-[11px] px-[6px] text-[#8C6B33] font-medium border-b border-[rgba(42,36,32,0.05)]">{newproduct?.stoneDetails?.[0]?.Type || "Stone"}</td>
                            <td className="text-right py-[11px] px-[6px] border-b border-[rgba(42,36,32,0.05)]">{newproduct?.stoneDetails?.[0]?.Numbers || "-"} </td>
                            <td className="text-right py-[11px] px-[6px] border-b border-[rgba(42,36,32,0.05)]">{newproduct?.swt || 0}</td>
                            <td className="text-right py-[11px] px-[6px] border-b border-[rgba(42,36,32,0.05]">-</td>
                            <td className="text-right py-[11px] px-[6px] border-b border-[rgba(42,36,32,0.05)]">{newproduct?.rateNotFound ? 'xxxx' : formatPrice(newproduct?.stoneAmount || 0, true)}</td>
                          </tr>
                        )}
                      </tbody>
                      {newproduct?.stoneAmount > 0 && (
                        <tfoot>
                          <tr>
                            <td colSpan={4} className="text-right py-[11px] px-[6px] text-[#2A2420] font-bold border-t border-[rgba(42,36,32,0.1)]">Total Stone Amount</td>
                            <td className="text-right py-[11px] px-[6px] text-[#8C6B33] font-bold border-t border-[rgba(42,36,32,0.1)]">{newproduct?.rateNotFound ? 'xxxx' : formatPrice(newproduct?.stoneAmount || 0, true)}</td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                )}

                {/* Diamond details */}
                {((newproduct?.diamondDetailsList && newproduct.diamondDetailsList.length > 0) || newproduct?.diamondAmount > 0 || newproduct?.rateNotFound) && (
                  <div className="mt-4 pt-4 border-t border-[rgba(42,36,32,0.1)]">
                    <h4 className="font-cormorant text-[19px] font-semibold text-[#2A2420] mb-[14px] pb-[8px] relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-[30px] after:h-[2px] after:bg-[#B8924F]">
                      Diamond Details
                    </h4>
                    <table className="w-full border-collapse text-[13.5px]">
                      <thead>
                        <tr>
                          <th className="text-left py-[9px] px-[6px] text-[#6B5F55] font-medium text-[11.5px] tracking-[0.04em] uppercase border-b border-[rgba(42,36,32,0.1)]">Component</th>
                          <th className="text-right py-[9px] px-[6px] text-[#6B5F55] font-medium text-[11.5px] tracking-[0.04em] uppercase border-b border-[rgba(42,36,32,0.1)]">Qty</th>
                          <th className="text-right py-[9px] px-[6px] text-[#6B5F55] font-medium text-[11.5px] tracking-[0.04em] uppercase border-b border-[rgba(42,36,32,0.1)]">Weight (CT)</th>
                          <th className="text-right py-[9px] px-[6px] text-[#6B5F55] font-medium text-[11.5px] tracking-[0.04em] uppercase border-b border-[rgba(42,36,32,0.1)]">Rate</th>
                          <th className="text-right py-[9px] px-[6px] text-[#6B5F55] font-medium text-[11.5px] tracking-[0.04em] uppercase border-b border-[rgba(42,36,32,0.1)]">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {newproduct?.diamondDetailsList && newproduct.diamondDetailsList.length > 0 ? (
                          newproduct.diamondDetailsList.map((diamond: any, index: number) => {
                            return (
                              <tr key={index}>
                                <td className="py-[11px] px-[6px] text-[#8C6B33] font-medium border-b border-[rgba(42,36,32,0.05)]">{diamond.StoneName || "Diamond"}{diamond.Clarity ? ` (${diamond.Clarity})` : ""}</td>
                                <td className="text-right py-[11px] px-[6px] border-b border-[rgba(42,36,32,0.05)]">{diamond.StoneQty || "-"} </td>
                                <td className="text-right py-[11px] px-[6px] border-b border-[rgba(42,36,32,0.05)]">{diamond.StoneCarat || 0}</td>
                                <td className="text-right py-[11px] px-[6px] border-b border-[rgba(42,36,32,0.05)]">{newproduct?.rateNotFound ? 'xxxx' : (diamond.Rate ? formatPrice(diamond.Rate, true) : "-")}</td>
                                <td className="text-right py-[11px] px-[6px] border-b border-[rgba(42,36,32,0.05)]">{newproduct?.rateNotFound ? 'xxxx' : formatPrice(diamond.StoneAmount || 0, true)}</td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td className="py-[11px] px-[6px] text-[#8C6B33] font-medium border-b border-[rgba(42,36,32,0.05)]">{newproduct?.diamondDetails?.[0]?.ColourClarity || "Diamond"}</td>
                            <td className="text-right py-[11px] px-[6px] border-b border-[rgba(42,36,32,0.05)]">{newproduct?.diamondDetails?.[0]?.Numbers || "-"} </td>
                            <td className="text-right py-[11px] px-[6px] border-b border-[rgba(42,36,32,0.05)]">{newproduct?.carrat || 0}</td>
                            <td className="text-right py-[11px] px-[6px] border-b border-[rgba(42,36,32,0.05]">-</td>
                            <td className="text-right py-[11px] px-[6px] border-b border-[rgba(42,36,32,0.05)]">{newproduct?.rateNotFound ? 'xxxx' : formatPrice(newproduct?.diamondAmount || 0, true)}</td>
                          </tr>
                        )}
                      </tbody>
                      {newproduct?.diamondAmount > 0 && (
                        <tfoot>
                          <tr>
                            <td colSpan={4} className="text-right py-[11px] px-[6px] text-[#2A2420] font-bold border-t border-[rgba(42,36,32,0.1)]">Total Diamond Amount</td>
                            <td className="text-right py-[11px] px-[6px] text-[#8C6B33] font-bold border-t border-[rgba(42,36,32,0.1)]">{newproduct?.rateNotFound ? 'xxxx' : formatPrice(newproduct?.diamondAmount || 0, true)}</td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                )}

                <div className="mt-[16px] border-t border-[rgba(42,36,32,0.1)] pt-[16px]">
                  <div className="text-[13.5px] flex justify-between py-[7px] text-[#6B5F55]">
                    <span>Sub Total</span>
                    <span>{newproduct?.rateNotFound ? 'xxxx' : formatPrice(newproduct?.taxableamount || 0, true)}</span>
                  </div>
                  <div className="text-[13.5px] flex justify-between py-[7px] text-[#6B5F55]">
                    <span>GST</span>
                    <span>{newproduct?.rateNotFound ? 'xxxx' : formatPrice(newproduct?.taxAmount || 0, true)}</span>
                  </div>
                  <div className="text-[13.5px] flex justify-between border-t border-[rgba(42,36,32,0.1)] mt-[6px] py-[7px] pt-[14px] font-bold text-[#2A2420]">
                    <span>Grand Total</span>
                    <span className="text-[#8C6B33]">{newproduct?.rateNotFound ? 'xxxx' : formatPrice(String(newproduct?.grandTotal || 0), true)}</span>
                  </div>
                </div>

                {quantityState >= 1 ? (
                  <Link href={newproduct?.rateNotFound ? "#" : "/newcart"} style={{ pointerEvents: newproduct?.rateNotFound ? 'none' : 'auto' }}>
                    <button 
                      className={`relative overflow-hidden w-full border-none rounded-[10px] p-[16px] mt-[16px] bg-[linear-gradient(100deg,#3C5448,#2B3E34)] text-[#F4EFE6] font-jost text-[14px] font-semibold tracking-[0.08em] uppercase flex items-center justify-center gap-[10px] transition-all box-shadow-[0_16px_30px_-16px_rgba(43,62,52,0.55)] ${newproduct?.rateNotFound ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-[2px] shadow-[0_16px_30px_-16px_rgba(43,62,52,0.55)] hover:shadow-[0_20px_36px_-14px_rgba(184,146,79,0.45)]'}`}
                      disabled={newproduct?.rateNotFound}
                    >
                      {quantityState} IN CART
                    </button>
                  </Link>
                ) : (
                  <button
                    className={`relative overflow-hidden w-full border-none rounded-[10px] p-[16px] mt-[16px] bg-[linear-gradient(100deg,#3C5448,#2B3E34)] text-[#F4EFE6] font-jost text-[14px] font-semibold tracking-[0.08em] uppercase flex items-center justify-center gap-[10px] transition-all box-shadow-[0_16px_30px_-16px_rgba(43,62,52,0.55)] ${newproduct?.rateNotFound ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-[2px] shadow-[0_16px_30px_-16px_rgba(43,62,52,0.55)] hover:shadow-[0_20px_36px_-14px_rgba(184,146,79,0.45)] group'}`}
                    disabled={newproduct?.rateNotFound}
                    onClick={() => {
                      if (!newproduct?.rateNotFound) {
                        handleAddClick();
                      }
                    }}
                  >
                    <div className="absolute top-0 -left-[60%] w-[35%] h-full bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.35),transparent)] -skew-x-[20deg] animate-[shimmer_3.4s_ease-in-out_infinite]"></div>
                    {isAdded ? (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="M5 12l5 5L20 7" /></svg>
                        Added to Cart
                      </>
                    ) : newproduct?.stockStatus > 0 ? (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[17px] h-[17px]"><circle cx="9" cy="20" r="1.3" /><circle cx="18" cy="20" r="1.3" /><path d="M2 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21 7H6" /></svg>
                        Add to Cart
                      </>
                    ) : (
                      <>
                        Made To Order
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

          </div>
        </Suspense>
      ) : (
        <BhimaEmptyScreenTemplete message="Product Not Found" />
      )}
    </>
  );
};

export default ProductPage;
