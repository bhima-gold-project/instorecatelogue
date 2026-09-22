"use client";

import { bhima_boy_Image, CANCEL_ORDER_API } from "@/app/Api/api_list";
import { getOrderList, getOrdersDetails } from "@/app/function/action";
import {
  formatDate,
  formatPrice,
  formatToThreeDecimals,
} from "@/app/function/fx";
import {
  Copy, ChevronDown, ChevronLeft, ChevronRight,
  User, Calendar, Phone, Package, Search, Gem, Scale,
  BadgeIndianRupee, CircleDot, Store, Sparkles, X,
  ExternalLink, Weight, RefreshCw
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { toast, Toaster } from "sonner";

const BranchOrders = () => {
  const [choosenBranch, setChoosenBranch] = useState("");
  const [orders, setOrder] = useState<any>([]);
  const [orderdetails, setOrderDetails] = useState<any>([]);
  const [selectedOrderNo, setSelectedOrderNo] = useState("");
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const branchorder = await getOrderList();
      setOrder(branchorder);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setSelectedOrderNo("");
    await fetchOrders();
    setIsRefreshing(false);
    toast.success("Orders refreshed!");
  };

  const getOrder = async (orderNo: string) => {
    if (selectedOrderNo === orderNo) {
      setSelectedOrderNo("");
      return;
    }
    setSelectedOrderNo(orderNo);
    setLoadingDetails(true);
    try {
      const orderDetails = await getOrdersDetails(orderNo);
      debugger
      setOrderDetails(orderDetails);
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Search & Pagination
  const [itemsPerPage] = useState(25);
  const filteredOrders = useMemo(() => {
    if (!orders?.data) return [];
    if (!searchQuery.trim()) return orders.data;
    const q = searchQuery.toLowerCase();
    return orders.data.filter((o: any) =>
      o?.order_no?.toLowerCase().includes(q) ||
      o?.cust_name?.toLowerCase().includes(q) ||
      o?.mobile_no?.toLowerCase().includes(q)
    );
  }, [orders, searchQuery]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const order = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const [nextcount, setnextcount] = useState(0);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setnextcount(nextcount + itemsPerPage);
    }
  };
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setnextcount(nextcount - itemsPerPage);
    }
  };

  const handleCopy = async (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if (!navigator.clipboard) {
      toast.info("Clipboard API not supported.");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const handleCancelOrder = async (e: React.MouseEvent, orderNo: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }
    
    const toastId = toast.loading("Cancelling order...");
    try {
      const res = await fetch(CANCEL_ORDER_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_no: orderNo })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Order cancelled successfully!", { id: toastId });
        const orderDetailsData = await getOrdersDetails(orderNo);
        setOrderDetails(orderDetailsData);
        fetchOrders();
      } else {
        toast.error(data.message || "Failed to cancel order", { id: toastId });
      }
    } catch (err) {
      toast.error("Error cancelling order", { id: toastId });
      console.error(err);
    }
  };

  // Stat card helper
  const StatCard = ({ icon: Icon, label, value, highlight = false }: { icon: any; label: string; value: string; highlight?: boolean }) => (
    <div className={`rounded-xl px-3 py-2.5 border transition-all duration-300 hover:translate-y-[-1px] hover:shadow-sm ${
      highlight
        ? "bg-gradient-to-br from-gold/12 to-gold-deep/6 border-gold/20 shadow-sm animate-pulseGold"
        : "bg-cream/30 border-[rgba(42,36,32,0.05)] hover:border-gold/20 hover:bg-cream/50"
    }`}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={12} className={highlight ? "text-gold-deep/70" : "text-ink-soft/35"} />
        <span className={`text-[10px] uppercase tracking-[0.16em] font-bold ${highlight ? "text-gold-deep/80" : "text-ink-soft/45"}`}>{label}</span>
      </div>
      <span className={`font-semibold text-sm ${highlight ? "text-gold-deep text-base font-bold" : "text-ink"}`}>{value}</span>
    </div>
  );

  // Skeleton loader
  const SkeletonRow = () => (
    <tr className="animate-shimmer">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="py-5 px-6"><div className="h-4 bg-ink/5 rounded-lg w-3/4" /></td>
      ))}
    </tr>
  );

  return (
    <div className="w-full min-h-screen pt-16 pb-10">
      <Toaster position="bottom-right" duration={1500} richColors />

      {/* ═══════════════════════ HERO HEADER ═══════════════════════ */}
      <div className="container mx-auto px-4 md:px-11 mt-8 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          {/* Left: Title block */}
          <div className="animate-fadeInUp">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold to-gold-deep flex items-center justify-center shadow-md shadow-gold-deep/20">
                <Package size={18} className="text-white" />
              </div>
              <span className="font-jost text-[11px] uppercase tracking-[0.22em] text-gold-deep font-bold">Order Management</span>
            </div>
            <h1 className="font-cormorant text-4xl md:text-5xl text-ink font-bold tracking-tight leading-[1.1]">
              {choosenBranch ? `${choosenBranch} Branch` : "Your"} Orders
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <p className="font-jost text-sm text-ink-soft/60">
                <span className="text-ink font-semibold">{filteredOrders.length}</span> order{filteredOrders.length !== 1 ? "s" : ""} found
              </p>
              {searchQuery && (
                <span className="text-[11px] font-jost text-gold-deep bg-gold/10 px-2.5 py-0.5 rounded-full font-medium">
                  filtered
                </span>
              )}
            </div>
          </div>

          {/* Right: Search + Refresh */}
          <div className="flex items-center gap-3 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            <div className="relative w-full md:w-80 group">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/40 group-focus-within:text-gold-deep transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); setnextcount(0); }}
                placeholder="Search order, name, mobile..."
                className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white border border-[rgba(42,36,32,0.1)] shadow-sm font-jost text-sm text-ink placeholder:text-ink-soft/35 focus:outline-none focus:ring-2 focus:ring-gold/25 focus:border-gold/40 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(""); setCurrentPage(1); setnextcount(0); }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-ink/8 flex items-center justify-center hover:bg-ink/15 transition-colors"
                >
                  <X size={12} className="text-ink-soft" />
                </button>
              )}
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white border border-[rgba(42,36,32,0.1)] shadow-sm flex items-center justify-center hover:bg-cream hover:border-gold/20 disabled:opacity-50 transition-all"
            >
              <RefreshCw size={18} className={`text-ink-soft ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════ ORDERS TABLE ═══════════════════════ */}
      <div className="container mx-auto px-4 md:px-11">
        <div className="bg-white rounded-[24px] shadow-[0_30px_60px_-15px_rgba(43,62,52,0.18),0_0_0_1px_rgba(42,36,32,0.05)] overflow-hidden">

          {loadingOrders ? (
            /* Skeleton Loading State */
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[640px]">
                <thead>
                  <tr className="bg-gradient-to-r from-cream/70 to-cream/30 border-b border-[rgba(42,36,32,0.06)]">
                    {["#", "Reference No", "Order Date", "Customer", "Mobile", ""].map((h, i) => (
                      <th key={i} className="font-jost font-bold text-[10px] uppercase tracking-[0.18em] text-ink-soft/60 py-4 px-6">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...Array(6)].map((_, i) => <SkeletonRow key={i} />)}
                </tbody>
              </table>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[640px]">
                  <thead>
                    <tr className="bg-gradient-to-r from-cream/70 to-cream/30 border-b border-[rgba(42,36,32,0.06)]">
                      <th className="font-jost font-bold text-[10px] uppercase tracking-[0.18em] text-ink-soft/60 py-4 px-6 text-center w-16">#</th>
                      <th className="font-jost font-bold text-[10px] uppercase tracking-[0.18em] text-ink-soft/60 py-4 px-6">Reference No</th>
                      <th className="font-jost font-bold text-[10px] uppercase tracking-[0.18em] text-ink-soft/60 py-4 px-6">Order Date</th>
                      <th className="font-jost font-bold text-[10px] uppercase tracking-[0.18em] text-ink-soft/60 py-4 px-6">Customer</th>
                      <th className="font-jost font-bold text-[10px] uppercase tracking-[0.18em] text-ink-soft/60 py-4 px-6">Mobile</th>
                      <th className="w-14" />
                    </tr>
                  </thead>
                  <tbody>
                    {order?.map((orderItem: any, index: number) => (
                      orderItem?.order_no && <React.Fragment key={index}>
                        <tr
                          className={`group font-jost transition-all duration-200 cursor-pointer border-b border-[rgba(42,36,32,0.04)] ${
                            selectedOrderNo === orderItem?.order_no
                              ? "bg-gradient-to-r from-gold/[0.06] via-cream/70 to-cream/40 shadow-[inset_4px_0_0_0_#B8924F]"
                              : index % 2 === 0 ? "bg-white" : "bg-[rgba(251,247,241,0.2)]"
                          } hover:bg-cream/50`}
                          onClick={() => getOrder(orderItem?.order_no)}
                        >
                          {/* # */}
                          <td className="py-4 px-6 text-center">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl text-xs font-bold transition-all duration-200 ${
                              selectedOrderNo === orderItem?.order_no
                                ? "bg-gold-deep text-white shadow-sm"
                                : "bg-ink/[0.04] text-ink-soft group-hover:bg-gold/10 group-hover:text-gold-deep"
                            }`}>
                              {index + 1 + nextcount}
                            </span>
                          </td>

                          {/* Reference No */}
                          <td className="py-4 px-6">
                            <span className="text-gold-deep font-semibold text-[13px] tracking-wide group-hover:text-gold transition-colors">
                              {orderItem?.order_no}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="py-4 px-6 text-ink-soft text-[13px] font-medium">
                            <span className="flex items-center gap-2">
                              <Calendar size={13} className="text-ink-soft/30 flex-shrink-0 hidden sm:block" />
                              {formatDate(orderItem?.order_date)}
                            </span>
                          </td>

                          {/* Customer */}
                          <td className="py-4 px-6 text-ink text-[13px] font-medium">
                            <span className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-emerald/8 flex items-center justify-center flex-shrink-0 hidden sm:flex">
                                <User size={12} className="text-emerald-deep/60" />
                              </div>
                              {orderItem?.cust_name}
                            </span>
                          </td>

                          {/* Mobile */}
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center gap-1.5 bg-ink/[0.03] px-3 py-1.5 rounded-xl text-xs font-medium text-ink-soft border border-[rgba(42,36,32,0.04)]">
                              <Phone size={10} className="text-ink-soft/40 hidden sm:block" />
                              {orderItem?.mobile_no}
                            </span>
                          </td>

                          {/* Chevron */}
                          <td className="py-4 px-4">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 ${
                              selectedOrderNo === orderItem?.order_no
                                ? "bg-gold-deep/10 rotate-180"
                                : "bg-transparent group-hover:bg-ink/5"
                            }`}>
                              <ChevronDown size={15} className={`${
                                selectedOrderNo === orderItem?.order_no
                                  ? "text-gold-deep"
                                  : "text-ink-soft/25 group-hover:text-gold-deep"
                              } transition-colors`} />
                            </div>
                          </td>
                        </tr>

                        {/* ═══════ EXPANDED DETAIL PANEL ═══════ */}
                        {selectedOrderNo === orderItem?.order_no && (
                          <tr>
                            <td colSpan={6} className="p-0">
                              <div className="animate-slideDown bg-gradient-to-b from-cream/60 via-cream/30 to-white border-b border-[rgba(42,36,32,0.06)]">
                                <div className="p-4 md:p-5">

                                  {loadingDetails ? (
                                    /* Detail Loading Skeleton */
                                    <div className="flex flex-col md:flex-row gap-4 animate-pulse">
                                      <div className="w-[110px] h-[110px] rounded-xl bg-ink/5 flex-shrink-0 mx-auto md:mx-0" />
                                      <div className="w-full space-y-4">
                                        <div className="h-8 bg-ink/5 rounded-xl w-2/3" />
                                        <div className="h-px bg-ink/5" />
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                          {[...Array(8)].map((_, i) => (
                                            <div key={i} className="h-16 bg-ink/[0.03] rounded-2xl" />
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  ) : orderdetails?.data?.map((detail: any, idx: number) => (
                                    <div
                                      key={idx}
                                      className="animate-scaleIn bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-[rgba(42,36,32,0.05)] mb-4 last:mb-0 overflow-hidden hover:shadow-[0_6px_30px_rgba(0,0,0,0.07)] transition-all duration-500"
                                    >
                                      {/* Gold gradient accent */}
                                      <div className="h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />

                                      <div className="flex flex-col md:flex-row p-4 md:p-5 gap-4 md:gap-6">
                                        {/* ── Product Image ── */}
                                        <Link href={`/products/${detail?.barcode_no}`} className="flex-shrink-0 self-center md:self-start group/img">
                                          <div className="relative w-[110px] h-[110px] overflow-hidden rounded-xl border border-[rgba(42,36,32,0.06)] shadow-sm">
                                            <Image
                                              className="object-cover w-full h-full group-hover/img:scale-110 transition-transform duration-700 ease-out"
                                              src={detail?.ImageUrl || bhima_boy_Image}
                                              alt="Order Image"
                                              height={110}
                                              width={110}
                                              quality={100}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-500" />
                                            <div className="absolute bottom-2 right-2 w-6 h-6 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all duration-300 translate-y-1 group-hover/img:translate-y-0 shadow-sm">
                                              <ExternalLink size={11} className="text-ink-soft" />
                                            </div>
                                          </div>
                                        </Link>

                                        {/* ── Product Details ── */}
                                        <div className="flex flex-col w-full font-jost">

                                          {/* Title + Actions */}
                                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-3">
                                            <div className="flex-1">
                                              <h3 className="font-cormorant font-bold text-xl md:text-2xl text-ink tracking-tight leading-tight">
                                                {detail?.Name}
                                              </h3>
                                              {detail?.item_branch && (
                                                <div className="flex items-center gap-1.5 mt-1">
                                                  <Store size={12} className="text-ink-soft/35" />
                                                  <span className="text-[11px] uppercase tracking-[0.12em] text-ink-soft/50 font-semibold">Branch: {detail?.item_branch}</span>
                                                </div>
                                              )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <button
                                                onClick={(e) => handleCopy(e, detail?.order_no)}
                                                className="flex items-center gap-2 bg-cream/60 hover:bg-cream px-3 py-1.5 rounded-xl border border-[rgba(42,36,32,0.06)] text-xs text-ink transition-all hover:shadow-sm hover:border-gold/15 group/copy flex-shrink-0"
                                              >
                                                <span className="text-ink-soft/70 text-xs font-medium">Order</span>
                                                <span className="font-bold text-ink text-[13px]">{detail?.order_no}</span>
                                                <Copy size={13} className="text-ink-soft/40 group-hover/copy:text-gold-deep transition-colors" />
                                              </button>
                                              
                                              {detail?.orderstatus !== 'Cancelled' ? (
                                                <button
                                                  onClick={(e) => handleCancelOrder(e, detail?.order_no)}
                                                  className="flex items-center gap-2 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl border border-red-100 text-xs text-red-600 transition-all hover:shadow-sm flex-shrink-0 font-semibold"
                                                >
                                                  Cancel Order
                                                </button>
                                              ) : (
                                                <span className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-500 text-xs font-semibold border border-gray-200">
                                                  Cancelled
                                                </span>
                                              )}
                                            </div>
                                          </div>

                                          {/* Gradient Divider */}
                                          <div className="h-px bg-gradient-to-r from-gold/15 via-[rgba(42,36,32,0.06)] to-transparent mb-3" />

                                          {/* Stats Grid with stagger animation */}
                                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-2.5 stagger-children">
                                            <StatCard icon={CircleDot} label="Barcode" value={detail?.barcode_no || "—"} />
                                            <StatCard icon={Scale} label="Gross Wt" value={`${formatToThreeDecimals(detail?.from_gwt)} g`} />
                                            <StatCard icon={BadgeIndianRupee} label="Order Rate" value={formatPrice(detail?.OrderRate, true)} />
                                            {detail?.StoneAmount !== 0 && (
                                              <StatCard icon={Gem} label="Stone" value={formatPrice(detail?.StoneAmount, true)} />
                                            )}
                                            {detail?.DiamondAmount !== 0 && (
                                              <StatCard icon={Sparkles} label="Diamond" value={formatPrice(detail?.DiamondAmount, true)} />
                                            )}
                                            <StatCard icon={BadgeIndianRupee} label="Taxable" value={formatPrice(detail?.taxable_amt, true)} />
                                            <StatCard icon={BadgeIndianRupee} label="VA Amt" value={formatPrice(detail?.va_amount, true)} />
                                            <StatCard icon={BadgeIndianRupee} label="Total" value={formatPrice(detail?.total_amount, true)} highlight />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── Empty State ── */}
              {!loadingOrders && order?.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 bg-gradient-to-b from-cream/20 to-transparent">
                  <div className="w-20 h-20 rounded-3xl bg-cream flex items-center justify-center mb-6 shadow-inner">
                    <Package size={32} className="text-ink-soft/30" />
                  </div>
                  <span className="font-cormorant font-bold text-2xl md:text-3xl text-ink-soft tracking-wide mb-2">
                    No Orders Found
                  </span>
                  <span className="font-jost text-xs md:text-sm text-ink-soft/40 uppercase tracking-[0.14em] mb-6">
                    {searchQuery ? "Try a different search term" : `No orders available${choosenBranch ? ` in ${choosenBranch} Branch` : ""}`}
                  </span>
                  {searchQuery && (
                    <button
                      onClick={() => { setSearchQuery(""); setCurrentPage(1); setnextcount(0); }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-[rgba(42,36,32,0.1)] text-sm font-medium text-ink hover:bg-cream transition-all shadow-sm"
                    >
                      <X size={14} />
                      Clear search
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* ═══════════════════════ PAGINATION ═══════════════════════ */}
        {filteredOrders.length > itemsPerPage && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 mb-10 font-jost">
            {/* Page info */}
            <p className="text-sm text-ink-soft/60">
              Showing <span className="font-semibold text-ink">{(currentPage - 1) * itemsPerPage + 1}</span>–<span className="font-semibold text-ink">{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</span> of <span className="font-semibold text-ink">{filteredOrders.length}</span>
            </p>

            {/* Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[rgba(42,36,32,0.08)] text-sm font-medium text-ink hover:bg-cream hover:border-gold/15 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronLeft size={15} />
                Prev
              </button>

              <div className="flex items-center gap-1 mx-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => { setCurrentPage(pageNum); setnextcount((pageNum - 1) * itemsPerPage); }}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-all duration-200 ${
                        currentPage === pageNum
                          ? "bg-gradient-to-br from-gold to-gold-deep text-white shadow-lg shadow-gold-deep/25 scale-105"
                          : "bg-white border border-[rgba(42,36,32,0.06)] text-ink-soft hover:bg-cream hover:text-ink hover:border-gold/15"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={nextPage}
                disabled={currentPage >= totalPages}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[rgba(42,36,32,0.08)] text-sm font-medium text-ink hover:bg-cream hover:border-gold/15 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Next
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchOrders;
