"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Database, ChevronRight, Sparkles, Gem, Layers } from "lucide-react";
import { bhima_boy_Image } from "@/app/Api/api_list";
import { getAllCategoryApi, getV2CategoriesApi, getAdminSettings } from "@/app/function/action";

const CATEGORY_GS_MAP: Record<string, string> = {
  gold: "NGO",
  diamond: "NGD",
  "silver articles": "SLA",
  "silver article": "SLA",
  "silver jewellery": "SLJ",
  "silver jewelry": "SLJ",
};

const getCategoryGsCode = (categoryName: string, subCats: any[] = []): string => {
  const normalized = (categoryName || "").trim().toLowerCase();
  if (CATEGORY_GS_MAP[normalized]) {
    return CATEGORY_GS_MAP[normalized];
  }

  if (normalized.includes("gold")) return "NGO";
  if (normalized.includes("diamond")) return "NGD";
  if (normalized.includes("silver") && (normalized.includes("article") || normalized.includes("articles"))) return "SLA";
  if (normalized.includes("silver") && (normalized.includes("jewellery") || normalized.includes("jewelry"))) return "SLJ";

  const subGs = subCats.map((s: any) => s.gs_code || s.GsCode).filter(Boolean).join(",");
  return subGs || "";
};

const CategoryPage = () => {
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [v2Categories, setV2Categories] = useState<any[]>([]);
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);
  const [isHideAllCategoriesEnabled, setIsHideAllCategoriesEnabled] = useState(false);
  const [isShowSubCategoriesEnabled, setIsShowSubCategoriesEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const settingsRes = await getAdminSettings();

        if (settingsRes?.isHideAllCategoriesEnabled) {
          setIsHideAllCategoriesEnabled(true);
          setLoading(false);
          return; // Skip category API call completely!
        }

        const isSubCat = Boolean(settingsRes?.isShowCategoriesAndSubCategoriesEnabled);
        setIsShowSubCategoriesEnabled(isSubCat);

        if (settingsRes && Array.isArray(settingsRes.hiddenCategories)) {
          setHiddenCategories(settingsRes.hiddenCategories);
        }

        if (isSubCat) {
          // Fetch hierarchical categories & subcategories from /api/v2/categories
          const v2Res = await getV2CategoriesApi();
          if (v2Res && Array.isArray(v2Res)) {
            setV2Categories(v2Res);
          }
        } else {
          // Fetch standard flat categories
          const categoriesRes = await getAllCategoryApi();
          if (categoriesRes && Array.isArray(categoriesRes)) {
            const validCategories = categoriesRes.filter(
              (c: any) =>
                (c.CategoryName || c.categoryName) &&
                (c.CategoryName || c.categoryName) !== "All"
            );
            setAllCategories(validCategories);
          }
        }
      } catch (error) {
        console.error("Error loading categories or settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // If hide all categories configuration is enabled, do not render categories section
  if (isHideAllCategoriesEnabled) {
    return null;
  }

  // Filter categories based on admin hidden settings
  const visibleCategories = allCategories.filter((category: any) => {
    const name = category.CategoryName || category.categoryName;
    return !hiddenCategories.includes(name);
  });

  const displayedCategories =
    visibleCategories.length > 0 ? visibleCategories : allCategories;

  return (
    <div className="container mx-auto px-4 md:px-9 my-8 mb-20 selection:bg-amber-100/30">
      {/* Sections Head */}
      <div className="flex items-baseline justify-between mb-8 pb-1 border-b border-[#2A2420]/10">
        <h2 className="relative font-cormorant font-semibold text-[32px] text-ink pb-2.5 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-[46px] after:h-[2px] after:bg-gold flex items-center gap-2">
          <span>Categories</span>
        </h2>

        {/* Header 'View all categories' Action Link (Passes 'All' parameter to PLP) */}
        <Link
          href="/categories/All"
          className="group font-jost text-[13px] font-medium tracking-wider text-ink-soft hover:text-gold-deep border-b border-transparent hover:border-gold-deep pb-0.5 transition-all duration-200 flex items-center gap-1 cursor-pointer select-none no-underline"
        >
          <span>View All</span>
          <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-20">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white border border-[rgba(42,36,32,0.06)] rounded-2xl p-5 pb-6 animate-pulse space-y-4"
            >
              <div className="h-6 w-1/2 rounded bg-stone-200/60" />
              <div className="space-y-2 pt-2">
                <div className="h-9 w-full rounded-xl bg-stone-200/50" />
                <div className="h-9 w-full rounded-xl bg-stone-200/50" />
                <div className="h-9 w-full rounded-xl bg-stone-200/50" />
              </div>
            </div>
          ))}
        </div>
      ) : isShowSubCategoriesEnabled ? (
        // Hierarchical Categories and Subcategories View (/api/v2/categories)
        v2Categories.length > 0 ? (
          <>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-12">
              {v2Categories.map((cat: any, index: number) => {
                const catName = cat.CategoryName || cat.categoryName;
                const subCats = Array.isArray(cat.SubCategories) ? cat.SubCategories : [];
                const categoryGsCode = getCategoryGsCode(catName, subCats);
                const catLink = categoryGsCode
                  ? `/categories/All?gscode=${encodeURIComponent(categoryGsCode)}`
                  : `/categories/${encodeURIComponent(catName)}`;

                return (
                  <div
                    key={cat.CategoryID || index}
                    className="group bg-white border border-[rgba(42,36,32,0.1)] rounded-2xl p-5 pb-6 shadow-[0_14px_30px_-22px_rgba(42,36,32,0.18)] hover:shadow-[0_24px_42px_-20px_rgba(184,146,79,0.32)] hover:-translate-y-[3px] hover:border-[rgba(184,146,79,0.4)] transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Category Header */}
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-[rgba(184,146,79,0.2)] mb-4">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-[#B8924F]/10 text-[#8C6B33] flex items-center justify-center">
                            <Gem size={15} />
                          </span>
                          <Link
                            href={catLink}
                            className="font-marcellus text-[16px] font-bold text-ink hover:text-gold-deep transition-colors tracking-wide no-underline"
                          >
                            {catName}
                          </Link>
                        </div>
                        <span className="text-[11px] font-jost font-semibold text-ink-soft bg-stone-100 px-2 py-0.5 rounded-full">
                          {subCats.length} Types
                        </span>
                      </div>

                      {/* SubCategories List */}
                      <div className="space-y-2">
                        {subCats.map((sub: any, subIdx: number) => {
                          const subName = sub.SubCategoryName || sub.subCategoryName || sub.name || "";
                          const subGsCode = sub.gs_code || sub.GsCode || "";
                          const isNewArrival = subName.toLowerCase().includes("new arrival") || subName.toLowerCase().includes("90 days");

                          let subHref = "";
                          if (isNewArrival) {
                            subHref = `/categories/All?days=90${subGsCode ? `&gscode=${encodeURIComponent(subGsCode)}` : ''}`;
                          } else if (subGsCode) {
                            subHref = `/categories/All?gscode=${encodeURIComponent(subGsCode)}`;
                          } else {
                            subHref = `/categories/${encodeURIComponent(subName)}`;
                          }

                          return (
                            <Link
                              key={sub.SubCategoryID || subIdx}
                              href={subHref}
                              className="group/sub w-full flex items-center justify-between p-2.5 px-3 rounded-xl bg-stone-50/70 border border-gray-100 hover:border-[#B8924F]/50 hover:bg-[#B8924F]/5 hover:shadow-xs transition-all duration-200 no-underline"
                            >
                              <span className="text-xs font-medium text-[#2A2420] group-hover/sub:text-gold-deep transition-colors">
                                {subName}
                              </span>
                              <ChevronRight
                                size={13}
                                className="text-gray-400 group-hover/sub:text-[#B8924F] group-hover/sub:translate-x-0.5 transition-all"
                              />
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    {/* View Category Link */}
                    <div className="pt-4 mt-4 border-t border-gray-50 flex items-center justify-between">
                      <Link
                        href={catLink}
                        className="text-xs font-semibold text-[#8C6B33] hover:text-[#2A2420] flex items-center gap-1 no-underline"
                      >
                        <span>Explore {catName}</span>
                        <ChevronRight size={13} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Prominent 'View All Categories' Button */}
           
          </>
        ) : (
          <div className="flex container mx-auto items-center justify-center p-8 rounded-lg bg-red-50 space-x-4 mb-20">
            <Database className="w-10 h-10 text-red-500 animate-pulse" />
            <div>
              <p className="text-red-700 font-medium">No Hierarchical Categories Found</p>
              <p className="text-red-400 text-sm">Please try again later</p>
            </div>
          </div>
        )
      ) : displayedCategories.length > 0 ? (
        <>
          {/* Grid of Categories */}
          <div className="grid gap-6 grid-cols-2 md:grid-cols-4 mb-12">
            {displayedCategories.map((category: any, index: number) => {
              const name = category.CategoryName || category.categoryName || "";
              const isNewArrival = name.toLowerCase().includes("new arrival") || name.toLowerCase().includes("90 days");
              const catGs = getCategoryGsCode(name);
              const href = isNewArrival
                ? `/categories/All?days=90`
                : catGs
                  ? `/categories/All?gscode=${encodeURIComponent(catGs)}`
                  : `/categories/${name}`;

              return (
                <Link
                  key={`${name}-${index}`}
                  className="group bg-white border border-[rgba(42,36,32,0.1)] rounded-2xl p-3.5 pb-5 text-center no-underline shadow-[0_14px_30px_-22px_rgba(42,36,32,0.18)] hover:shadow-[0_24px_42px_-20px_rgba(184,146,79,0.32)] hover:-translate-y-[5px] hover:border-[rgba(184,146,79,0.35)] transition-all duration-300 cursor-pointer relative"
                  href={href}
                >
                  {/* Inner Thumbnail */}
                  <div className="relative aspect-square w-full rounded-[11px] overflow-hidden bg-[#11161a] mb-3 z-0">
                    <Image
                      src={category.ImageUrl || bhima_boy_Image}
                      alt={name || "Category"}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                  </div>

                  {/* Category Name - Classic Boutique Style */}
                  <div className="py-1.5 px-2 border-t border-b border-[rgba(184,146,79,0.22)] bg-gradient-to-r from-transparent via-[rgba(184,146,79,0.04)] to-transparent group-hover:from-[rgba(184,146,79,0.03)] group-hover:via-[rgba(184,146,79,0.25)] group-hover:to-[rgba(184,146,79,0.03)] group-hover:border-[rgba(184,146,79,0.7)] transition-all duration-500 w-full flex items-center justify-center">
                    <span className="font-marcellus text-[12px] sm:text-[13px] font-medium tracking-[0.1em] uppercase text-ink group-hover:text-gold-deep transition-colors duration-300 truncate">
                      {name}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Bottom Prominent 'View All Categories' Button - Navigates to PLP with 'All' parameter */}
          <div className="flex flex-col items-center justify-center pt-2 pb-10">
            <Link
              href="/categories/All"
              className="group inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-white border border-[rgba(184,146,79,0.4)] shadow-[0_10px_24px_-10px_rgba(184,146,79,0.3)] hover:shadow-[0_16px_36px_-8px_rgba(184,146,79,0.45)] hover:border-[#B8924F] hover:bg-[#B8924F]/5 transition-all duration-300 cursor-pointer no-underline"
            >
              <Sparkles size={16} className="text-[#B8924F] group-hover:rotate-12 transition-transform duration-300" />
              <span className="font-marcellus text-[13px] sm:text-[14px] font-semibold tracking-[0.12em] uppercase text-ink group-hover:text-gold-deep transition-colors">
                View All Categories
              </span>
              <span className="w-6 h-6 rounded-full bg-[#B8924F]/10 flex items-center justify-center text-[#B8924F] group-hover:translate-x-1 transition-transform">
                <ChevronRight size={14} />
              </span>
            </Link>
          </div>
        </>
      ) : (
        <div className="flex container mx-auto items-center justify-center p-8 rounded-lg bg-red-50 space-x-4 mb-20">
          <Database className="w-10 h-10 text-red-500 animate-pulse" />
          <div>
            <p className="text-red-700 font-medium">No Categories Found</p>
            <p className="text-red-400 text-sm">Please try again later</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
