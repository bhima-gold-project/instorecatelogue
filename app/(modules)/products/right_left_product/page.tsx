"use client";

import { LeftCircleFilled, RightCircleFilled, LoadingOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const NextBackProduct = ({ pid }: { pid: any }) => {
  const router = useRouter();
  const [localProduct, setLocalProduct] = useState<any[]>([]); // Array of products
  const [currentIndex, setCurrentIndex] = useState(0); // State for the current product index
  const [plpPage, setPlpPage] = useState(1);
  const [plpTotalPages, setPlpTotalPages] = useState(1);
  const [plpQueryUrl, setPlpQueryUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load product list from localStorage
    const plpList = localStorage.getItem("plp_list");
    const page = localStorage.getItem("plp_page");
    const totalPages = localStorage.getItem("plp_total_pages");
    const queryUrl = localStorage.getItem("plp_query_url");

    if (page) setPlpPage(Number(page));
    if (totalPages) setPlpTotalPages(Number(totalPages));
    if (queryUrl) setPlpQueryUrl(queryUrl);

    if (plpList && plpList !== "undefined") {
      try {
        const parsedData = JSON.parse(plpList) || [];
        setLocalProduct(parsedData);
        const initialIndex = parsedData.findIndex((product: any) => product.barcode === pid);
        setCurrentIndex(initialIndex >= 0 ? initialIndex : 0);
      } catch (error) {
        console.error("Error parsing localStorage data:", error);
        setLocalProduct([]); // Fallback to an empty array
      }
    }
  }, [pid]);

  const loadPageProducts = async (targetPage: number, direction: 'next' | 'prev') => {
    if (!plpQueryUrl) return;
    setIsLoading(true);
    try {
      // Replace page=\d+ with page=targetPage
      const targetUrl = plpQueryUrl.replace(/page=\d+/, `page=${targetPage}`);
      const res = await fetch(targetUrl);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      const newProducts = Array.isArray(data?.products) ? data.products : [];
      
      if (newProducts.length > 0) {
        // Update local storage
        localStorage.setItem("plp_list", JSON.stringify(newProducts));
        localStorage.setItem("plp_page", targetPage.toString());
        setPlpPage(targetPage);
        setLocalProduct(newProducts);
        
        const newIndex = direction === 'next' ? 0 : newProducts.length - 1;
        setCurrentIndex(newIndex);
        router.push(`/products/${newProducts[newIndex]?.barcode}`);
      }
    } catch (error) {
      console.error("Error loading more products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (isLoading) return;
    if (currentIndex < localProduct.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex); // Update the current index
      router.push(`/products/${localProduct[nextIndex]?.barcode}`); // Navigate to the next product
    } else if (plpPage < plpTotalPages) {
      // Load next page
      loadPageProducts(plpPage + 1, 'next');
    }
  };

  const handleBack = () => {
    if (isLoading) return;
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex); // Update the current index
      router.push(`/products/${localProduct[prevIndex]?.barcode}`); // Navigate to the previous product
    } else if (plpPage > 1) {
      // Load previous page
      loadPageProducts(plpPage - 1, 'prev');
    }
  };

  const hasNext = currentIndex < localProduct.length - 1 || plpPage < plpTotalPages;
  const hasPrev = currentIndex > 0 || plpPage > 1;

  return (
    <div>
      {localProduct.length > 0 ? (
        <div className="flex absolute top-1/2 items-center align-middle justify-between w-full z-50">
          {/* Back button */}
          <button
            className="fixed top-1/2 left-1 bg-white rounded-full flex items-center justify-center p-1 shadow-md hover:scale-105 transition-transform"
            onClick={handleBack}
            disabled={!hasPrev || isLoading}
            style={{ display: hasPrev ? 'block' : 'none', zIndex: 1000 }}
          >
            {isLoading && currentIndex === 0 ? <LoadingOutlined style={{ fontSize: '30px', color: '#3C5448' }} /> : <LeftCircleFilled style={{ fontSize: '30px', color: '#3C5448' }} />}
          </button>

          {/* Next button */}
          <button
            className="fixed top-1/2 right-1 bg-white rounded-full flex items-center justify-center p-1 shadow-md hover:scale-105 transition-transform"
            onClick={handleNext}
            disabled={!hasNext || isLoading}
            style={{ display: hasNext ? 'block' : 'none', zIndex: 1000 }}
          >
            {isLoading && currentIndex === localProduct.length - 1 ? <LoadingOutlined style={{ fontSize: '30px', color: '#3C5448' }} /> : <RightCircleFilled style={{ fontSize: '30px', color: '#3C5448' }} />}
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default NextBackProduct;
