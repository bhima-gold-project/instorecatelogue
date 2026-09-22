"use client"

import { bhima_boy_Image } from "@/app/Api/api_list"
import { Font_24px, Font_36px } from "@/app/components/labels/page"
import { getOrderList, getOrdersDetails } from "@/app/function/action"
import { formatDate, formatPrice, formatToThreeDecimals } from "@/app/function/fx"
import Image from "next/image"
import React, { useState, useEffect } from "react"

const BranchOrders = () => {

  const [choosenBranch, setChoosenBranch] = useState("") // keep this empty initially to avoid SSR mismatch
  const [order, setOrder] = useState<any>([])
  const [orderdetails, setOrderDetails] = useState<any>([])
  const [selectedOrderNo, setSelectedOrderNo] = useState("")
  const [loadingOrders, setLoadingOrders] = useState(false)
  



  useEffect(() => {
    const getBranchOrder = async () => {
      setLoadingOrders(true)
      try {
        const branchorder = await  getOrderList()
    
        setOrder(branchorder)
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setLoadingOrders(false)
      }
    }
  
      getBranchOrder()
    
  }, [])


 


  
  const getOrder = async (orderNo: string) => {
    setSelectedOrderNo(orderNo)
  

    try {
      const orderDetails = await getOrdersDetails(orderNo)
       setOrderDetails(orderDetails)
    } catch (error) {
      console.error("Error fetching order details:", error)
    }
  }

  




  return (
    <div className="mx-10 w-full">
      <div className="mt-4">
        <Font_36px
          label={choosenBranch ? `${choosenBranch} Branch Orders` : "Orders"}
        />

     
      </div>

      <div>
        {loadingOrders ? (
          <p>Loading orders...</p>
        ) : (
          <table className="table-auto container mx-auto w-full border-collapse border border-b-1 border-r-0 border-l-0 mt-4">
            <thead>
              <tr className="bg-gray-100 bg-[linear-gradient(146deg,_rgba(62,138,255,1)_0%,_rgba(0,212,255,1)_100%)]">
                <th className=" border border-b-1 border-r-0 border-l-0 p-2"></th>
                <th className=" border border-b-1 border-r-0 border-l-0 p-2">
                  Order ID
                </th>
                <th className=" border border-b-1 border-r-0 border-l-0 p-2">
                  Barcode No
                </th>
                <th className=" border border-b-1 border-r-0 border-l-0 p-2">
                  Item Branch Code
                </th>
                <th className=" border border-b-1 border-r-0 border-l-0 p-2">
                  Order Date
                </th>
                <th className=" border border-b-1 border-r-0 border-l-0 p-2">
                  Gross Weight
                </th>
                <th className=" border border-b-1 border-r-0 border-l-0 p-2">
                  Quantity
                </th>
              </tr>
            </thead>
            <tbody className="text-center">
              
              {order?.data?.map((orderItem: any, index: number) => (
                <React.Fragment key={index}>
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "" : "bg-[#d7e8fa]"}
                  >
                    <td className=" border border-b-1 border-r-0 border-l-0 p-2">
                      {index + 1}
                    </td>
                    <td
                      className=" border border-b-1 border-r-0 border-l-0 p-2 cursor-pointer text-blue-600"
                      onClick={() => getOrder(orderItem.order_no)}
                    >
                      {orderItem.order_no}
                    </td>
                    <td
                      className=" border border-b-1 border-r-0 border-l-0 p-2 "
                      onClick={() => getOrder(orderItem.order_no)}
                    >
                      {orderItem.barcode_no}
                    </td>
                    <td
                      className=" border border-b-1 border-r-0 border-l-0 p-2"
                      onClick={() => getOrder(orderItem.order_no)}
                    >
                      {orderItem.ItemBranch}
                    </td>
                    <td
                      className=" border border-b-1 border-r-0 border-l-0 p-2"
                      onClick={() => getOrder(orderItem.order_no)}
                    >
                      {formatDate(orderItem.order_date)}
                    </td>
                    <td className=" border border-b-1 border-r-0 border-l-0 p-2">
                      {formatToThreeDecimals(orderItem.GrossWt)} g
                    </td>
                    <td className=" border border-b-1 border-r-0 border-l-0 p-2">
                      {orderItem.quantity}
                    </td>
                  </tr>

                  {/* Render images only for the selected order */}
                  {selectedOrderNo === orderItem.order_no &&orderdetails.data &&
                     (
                      <tr>
                        <td colSpan={7}>
                          {orderdetails.data?.map((detail: any, idx: number) => (
                            <div key={idx} className="flex shadow-md border border-gray-300 p-2 mb-3 w-full">
                              <div className="flex flex-col">
                                <div className="flex  ">
                                  {" "}
                                  <Image
                                    className="border aspect-square mr-3"
                                    key={idx}
                                    src={detail.ImageUrl || bhima_boy_Image}
                                    alt="Order Image"
                                    height={150}
                                    width={200}
                                    quality={100}
                                  />
                                  <div className="flex flex-col mt-2">
                                    <div className="mb-4">
                                      <Font_24px
                                        label={detail.Name}
                                      ></Font_24px>
                                    </div>
                                    <div className="flex mb-4">
                                      <div className="mr-10">
                                        <label className="mr-2 font-semibold">
                                          Barcode No:
                                        </label>
                                        <label>{detail.barcode_no}</label>
                                      </div>

                                      <div className="mr-10">
                                        <label className="mr-2 font-semibold">
                                          Gross Weight:
                                        </label>
                                        <label>
                                          {formatToThreeDecimals(
                                            detail.from_gwt
                                          ) + " g"}
                                        </label>
                                      </div>

                                      <div className="mr-10">
                                        <label className="mr-2 font-semibold">
                                          Order Rate:
                                        </label>
                                        <label>
                                          {formatPrice(detail.OrderRate, true)}
                                        </label>
                                      </div>
                                    </div>
                                    <div className="flex mb-4 ">
                                      {detail.StoneAmount ? (
                                        <div className="mr-10">
                                          <label className="mr-2 font-semibold">
                                            Stone Amount:
                                          </label>
                                          <label>
                                            {formatPrice(
                                              detail.StoneAmount,
                                              true
                                            )}
                                          </label>
                                        </div>
                                      ) : (
                                        ""
                                      )}

                                      {detail.DiamondAmount ? (
                                        <div className="mr-10">
                                          <label className="mr-2 font-semibold">
                                            Diamond Amount:
                                          </label>
                                          <label>
                                            {formatPrice(
                                              detail.DiamondAmount,
                                              true
                                            )}
                                          </label>
                                        </div>
                                      ) : (
                                        ""
                                      )}

                                      {detail.DiscountAmount ? (
                                        <div className="mr-10">
                                          <label className="mr-2 font-semibold">
                                            Discount Amount:
                                          </label>
                                          <label>
                                            {formatPrice(
                                              detail.DiscountAmount,
                                              true
                                            )}
                                          </label>
                                        </div>
                                      ) : (
                                        ""
                                      )}
                                    </div>
                                    <div className="flex mb-4">
                                      <div className="mr-10">
                                        <label className="mr-2 font-semibold">
                                          Taxable Amount:
                                        </label>
                                        <label>
                                          {formatPrice(
                                            detail.taxable_amt,
                                            true
                                          )}
                                        </label>
                                      </div>

                                      <div className="mr-10">
                                        <label className="mr-2 font-semibold">
                                          Va Amount:
                                        </label>
                                        <label>
                                          {formatPrice(detail.va_amount, true)}
                                        </label>
                                      </div>

                                      <div className="mr-10">
                                        <label className="mr-2 font-semibold">
                                          Total Amount:
                                        </label>
                                        <label className="font-semibold">
                                          {formatPrice(
                                            detail.total_amount,
                                            true
                                          )}
                                        </label>
                                      </div>

                                      <div className="mr-10">
                                        <label className="mr-2 font-semibold">
                                         Order Status:
                                        </label>
                                        <label className=" text-orange-500 font-semibold">
                                         
                                          {  detail.orderstatus}
                                               
                                        </label>
                                      </div>

                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </td>
                      </tr>
                    )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}

        {/* Handle no orders gracefully */}
        {order?.data?.length === 0 && (
          <span className="flex border font-semibold text-red-600 border-gray-700 outline-none bg-[#C8ECFF] w-full justify-center p-5">
            No Order Found in {choosenBranch} Branch
          </span>
        )}
      </div>
    </div>
   
  )
}

export default BranchOrders
