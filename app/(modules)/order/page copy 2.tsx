"use client";

import { bhima_boy_Image } from "@/app/Api/api_list";
import { Font_18px, Font_24px, Font_36px } from "@/app/components/labels/page";
import { getOrderList, getOrdersDetails } from "@/app/function/action";
import {
  formatDate,
  formatPrice,
  formatToThreeDecimals,
} from "@/app/function/fx";
import { Pagination } from "antd";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";

const BranchOrders = () => {
  const [choosenBranch, setChoosenBranch] = useState(""); // keep this empty initially to avoid SSR mismatch
  const [orders, setOrder] = useState<any>([]);
  const [orderdetails, setOrderDetails] = useState<any>([]);
  const [selectedOrderNo, setSelectedOrderNo] = useState("");
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    const getBranchOrder = async () => {
      setLoadingOrders(true);
      try {
        const branchorder = await getOrderList();
     
        setOrder(branchorder);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoadingOrders(false);
      }
    };

    getBranchOrder();
  }, []);

  const getOrder = async (orderNo: string) => {
    setSelectedOrderNo(orderNo);
    

    try {
      const orderDetails = await getOrdersDetails(orderNo);
      setOrderDetails(orderDetails);
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  

  //pagination -----------------------start-----------
  // Current page number
  const [itemsPerPage] = useState(25);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const order = orders?.data?.slice(indexOfFirstItem, indexOfLastItem);


  const paginate = (pageNumber: any) => setCurrentPage(pageNumber);
  const [nextcount,setnextcount]=useState(0)
  const nextPage = () => {
 
    if (currentPage < Math.ceil(orders?.data?.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
      setnextcount(nextcount+itemsPerPage)
    }
  };


  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setnextcount(nextcount-itemsPerPage)
    }
  };

 
  //pagination -----------------------end--------------

  return (
    <div className="w-full container mx-auto pt-16 px-4">
      <div className="mt-8">
        <Font_36px
          label={choosenBranch ? `${choosenBranch} Branch Orders` : "Orders"}
        />
      </div>

      <div className="overflow-x-auto">
        {loadingOrders ? (
          <p className="text-center">Loading orders...</p>
        ) : (
          <>
            <table className="table-auto w-full border-collapse  mt-4 min-w-[600px]">
              <thead>
                <tr className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white">
                  <th className="border border-b-1 p-2"></th>
                  <th className="text-sm border border-b-1 p-2">Order ID</th>
                  <th className="text-sm border border-b-1 p-2 hidden md:table-cell">
                    Barcode No
                  </th>
                  <th className="text-sm border border-b-1 p-2">
                    Item Branch Code
                  </th>
                  <th className="text-sm border border-b-1 p-2">Order Date</th>
                  <th className="text-sm border border-b-1 p-2 hidden md:table-cell">
                    Gross Weight
                  </th>
                  <th className="text-sm border border-b-1 p-2 hidden md:table-cell">
                    Quantity
                  </th>
                </tr>
              </thead>
              <tbody className="text-center">
                {order?.map((orderItem: any, index: number) => (
                  <React.Fragment key={index}>
                    <tr
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-blue-100"
                      }`}
                    >
                      <td className="border p-2">{index + 1+nextcount}</td>
                      <td
                        className="border p-2 text-blue-600 cursor-pointer"
                        onClick={() => getOrder(orderItem.order_no)}
                      >
                        {orderItem.order_no}
                      </td>
                      <td
                        className="border p-2 hidden md:table-cell cursor-pointer"
                        onClick={() => getOrder(orderItem.order_no)}
                      >
                        {orderItem.barcode_no}
                      </td>
                      <td className="border p-2">{orderItem.ItemBranch}</td>
                      <td className="border p-2">
                        {formatDate(orderItem.order_date)}
                      </td>
                      <td className="border p-2 hidden md:table-cell">
                        {formatToThreeDecimals(orderItem.GrossWt)} g
                      </td>
                      <td className="border p-2 hidden md:table-cell">
                        {orderItem.quantity}
                      </td>
                    </tr>

                    {/* Order Details (Shown Only for Selected Order) */}
                    {selectedOrderNo === orderItem.order_no &&
                      orderdetails?.data && (
                        <tr>
                          <td colSpan={7} className="p-4 ">
                            <div className="border border-gray-200">
                              <div className=" p-4 grid grid-cols-2 items-start  bg-blue-100">
                                <div className=" flex items-start ">
                                  <p className="text-md font-semibold">
                                    <span className="font-semibold">
                                      Customer Name:{" "}
                                    </span>
                                    {orderdetails?.data[0]?.cust_name || ""}
                                  </p>
                                </div>
                                <div className="  flex items-start ">
                                  <p className="text-md">
                                    <span className="font-semibold">
                                      Mobile:{" "}
                                    </span>
                                    {orderdetails?.data[0]?.mobile_no || ""}
                                  </p>
                                </div>
                              </div>

                              {/* order details===========>> */}
                              {orderdetails.data.map(
                                (detail: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="flex  md:flex-row shadow-md p-4 mb-3 w-full"
                                  >
                                    <Link href={`/products/${detail.barcode_no}`}><Image
                                      className="border aspect-square mx-auto md:mx-0 mb-4 md:mb-0"
                                      src={detail.ImageUrl || bhima_boy_Image}
                                      alt="Order Image"
                                      height={150}
                                      width={200}
                                      quality={100}
                                    /></Link>
                                    <div className="flex flex-col ml-4 w-full">
                                      <Font_18px label={detail.Name} />
                                      <div className="grid grid-cols-1 pt-5 sm:grid-cols-2 lg:grid-cols-3 gap-4  ">
                                        <div className=" flex justify-start">
                                          <label className="font-semibold ">
                                            Barcode No:
                                          </label>{" "}
                                          {detail.barcode_no}
                                        </div>
                                        <div className=" flex justify-start">
                                          <label className="font-semibold">
                                            Gross Weight:
                                          </label>{" "}
                                          {formatToThreeDecimals(
                                            detail.from_gwt
                                          )}{" "}
                                          g
                                        </div>
                                        <div className=" flex justify-start">
                                          <label className="font-semibold">
                                            Order Rate:
                                          </label>{" "}
                                          {formatPrice(detail.OrderRate, true)}
                                        </div>
                                        {detail.StoneAmount !== 0 && (
                                          <div className=" flex justify-start">
                                            <label className="font-semibold">
                                              Stone Amount:
                                            </label>{" "}
                                            {formatPrice(
                                              detail.StoneAmount,
                                              true
                                            )}
                                          </div>
                                        )}
                                        {detail.DiamondAmount !== 0 && (
                                          <div className=" flex justify-start">
                                            <label className="font-semibold">
                                              Diamond Amount:
                                            </label>{" "}
                                            {formatPrice(
                                              detail.DiamondAmount,
                                              true
                                            )}
                                          </div>
                                        )}
                                        {/* {detail.DiscountAmount  !==0  && (
                                <div>
                                  <label className="font-semibold">Discount Amount:</label> {formatPrice(detail.DiscountAmount, true)}
                                </div>
                              )} */}
                                        <div className=" flex justify-start">
                                          <label className="font-semibold">
                                            Taxable Amount:
                                          </label>{" "}
                                          {formatPrice(
                                            detail.taxable_amt,
                                            true
                                          )}
                                        </div>
                                        <div className=" flex justify-start">
                                          <label className="font-semibold">
                                            VA Amount:
                                          </label>{" "}
                                          {formatPrice(detail.va_amount, true)}
                                        </div>
                                        <div className=" flex justify-start">
                                          <label className="font-semibold">
                                            Total Amount:
                                          </label>
                                          <span className="font-semibold">
                                            {formatPrice(
                                              detail.total_amount,
                                              true
                                            )}
                                          </span>
                                        </div>
                                        <div className=" flex justify-start">
                                          <label className="font-semibold">
                                            Order Status:
                                          </label>
                                          <span className="text-orange-500 font-semibold">
                                            {detail.orderstatus}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>

            <div className="flex gap-4  rounded-md mb-40  mt-5 justify-center items-center">
              <button className="flex gap-4 border  px-3 rounded-md py-1">
                {" "}
                <div
                  onClick={() => prevPage()}
                  className="cursor-pointer"
                >{`Prev`}</div>
                <div>{currentPage} / {Math.ceil(orders?.data?.length / itemsPerPage)}</div>
                <div
                  className="cursor-pointer "
                  onClick={() => nextPage()}
                >{`Next `}</div>
              </button>
            </div>
          </>
        )}

        {/* Handle No Orders Gracefully */}
        {order?.data?.length === 0 && (
          <div className="flex justify-center bg-blue-100 text-red-600 font-semibold p-5 border border-gray-700">
            No Orders Found in {choosenBranch} Branch
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchOrders;
