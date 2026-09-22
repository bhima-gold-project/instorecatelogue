"use client";
import RemoveFromCart from "@/app/components/popups/removefromcart/page";
import { CreateCentralOrder, CreateOrder, getCentralDbdataforcart, GetRateByBarcode, checkBranchProductsRate, branchWiseCart } from "@/app/function/action";
import { getHomeBranchFromToken } from "@/app/function/authUtils";
import { getData } from "@/app/Api/get/get_api_service";
import { ADMIN_SETTINGS_API } from "@/app/Api/api_list";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { useCartData } from "@/app/store/cart/cartdata";




const ConfirmOrder = ({ amount, cart, customer, customerId }: any) => {
  // console.log("order confirm", amount, cart, customer,customerId);

  const [outofstock, setOutofstock] = useState(false);
  const [outofstockalert, setoutofstockalert] = useState(false);
  const [invalidRateAlert, setInvalidRateAlert] = useState(false);
  const [ordercreated, setordercreated] = useState(false);

  const { refreshCart, clearCartCache } = useCartData()
  const router = useRouter();


  const getCookieValue = (name: string) => {
    if (typeof document !== "undefined") {
      // Ensure `document` is available
      const value = `; ${document.cookie}`; // Prepend a semicolon for easier parsing
      const parts = value.split(`; ${name}=`); // Split based on the cookie name
      if (parts?.length === 2) return parts.pop()?.split(";").shift(); // Return the cookie value if found
    }
    return undefined;
  };

  // Example usage
  const homeBranchValue = getHomeBranchFromToken() || getCookieValue("homebranch");
  //check out of stock product======>>>>
  //console.log('cart data=====>',cart)
  const [ratechanges, setratechanged] = useState(false)
  const CheckOutstockproduct = async () => {
    let outOfStockFound = false;
    let invalidRateFound = false;

    for (let i = 0; i < cart?.length; i++) {
      const centraldata = await getCentralDbdataforcart(cart[i].barcode)

      let rateValid = true;
      if (homeBranchValue) {
        try {
          const branchData = await checkBranchProductsRate({
            "branchcode": homeBranchValue,
            "BarcodeNo": cart[i].barcode,
            "ProductBranch": cart[i].item_branch || centraldata?.branch_code
          });
          if (!branchData?.success || !branchData?.data || branchData.data.length === 0) {
            rateValid = false;
          }
        } catch (e) {
          rateValid = false;
        }
      } else {
        rateValid = false;
      }

      if (!rateValid && homeBranchValue) {
        invalidRateFound = true;
      }

      const trackorderrate = await GetRateByBarcode(cart[i].barcode)
      console.log(centraldata?.OrderRate, trackorderrate.rate, "central data for cart====>")
      if (centraldata?.OrderRate != trackorderrate.rate) {
        setratechanged(true)

      }
      if (centraldata?.stockStatus === 0) {
        outOfStockFound = true;
      }
    }
    
    setOutofstock(outOfStockFound);
    setInvalidRateAlert(invalidRateFound);
  };

  useEffect(() => {
    CheckOutstockproduct()

  }, [outofstock, cart?.length])


  useEffect(() => {
    const getOrderDetails = async () => {
      if (ratechanges == true) {
        alert("Cart Updated With Latest Price")
      }
      setratechanged(false)

      // Call branchWiseCart API with cart items
      if (cart?.length > 0 && homeBranchValue) {
        try {
          // Check if Branch Wise Cart is enabled in admin settings
          let isBranchWiseCartEnabled = false;
          try {
            const settingsRes = await getData(ADMIN_SETTINGS_API);
            if (settingsRes && settingsRes.data) {
              isBranchWiseCartEnabled = settingsRes.data.isBranchWiseCartEnabled === true;
            }
          } catch (e) {
            console.error("Error fetching admin settings:", e);
          }

          if (isBranchWiseCartEnabled) {
            const branchWiseCartData = cart.map((item: any) => ({
              LoginBranch: homeBranchValue,
              ItemBranch: item.item_branch || homeBranchValue,
              BarcodeNo: item.barcode,
              CustomerDetails: customer
            }));
            const branchCartResult = await branchWiseCart(branchWiseCartData);
            console.log("branchWiseCart API result:", branchCartResult);
          } else {
            console.log("branchWiseCart API call skipped because it is disabled in Admin Panel.");
          }
        } catch (error) {
          console.error("Error calling branchWiseCart API:", error);
        }
      }



      const orderDetails = await Promise.all(
        cart.map(async (item: any) => {
          console.log("item data",item)

          let centraldata = await getCentralDbdataforcart(item.barcode);
          let newcentraldata = centraldata
          console.log("Central data for item in order details:", centraldata)

          if (homeBranchValue) {
            try {
              const branchData = await checkBranchProductsRate({
                "branchcode": homeBranchValue,
                "BarcodeNo": item.barcode,
                "ProductBranch": item.item_branch
              });

              if (branchData?.success && branchData?.data?.length > 0) {
                const bData = branchData.data[0];
                let nwt = bData.NetWT;
                let gwt = bData.GWT;
                let swt = bData.SWT;

                if (branchData?.barcodeDetails?.length > 0 && branchData?.barcodeDetails[0]?.ProductDetails) {
                  const productDetails = branchData.barcodeDetails[0].ProductDetails;
                  nwt = productDetails.NetWeight;
                  gwt = productDetails.GrossWeight;
                  swt = productDetails.StoneWeight;
                }
                const stockStatus = branchData?.barcodeDetails?.[0]?.ProductDetails?.Status ?? newcentraldata.stockStatus;
                // Override central data with branch specific data
                newcentraldata = {
                  ...newcentraldata,
                  taxableamount: bData.TaxableValue,
                  vaAmount: bData.MakingCharges,
                  grandTotal: bData.FinalAmount,
                  OrderRate: bData.GoldRate,
                  stoneAmount: bData.StoneAmount,
                  diamondAmount: bData.DiamondAmount,
                  taxAmount: bData.GSTAmount,
                  stockStatus: stockStatus,
                  metalAmount: bData.GoldAmount,
                  nwt: nwt,
                  gwt: gwt,
                  swt: swt
                }
              }
            } catch (e) {
              console.log("Error fetching branch rate for order:", e)
            }
          }

          return {
            quantity: 1,
            from_gwt: newcentraldata.gwt,
            to_gwt: newcentraldata.nwt,
            taxable_amt: newcentraldata.taxableamount,
            barcode_no: item.barcode.toString(),
            va_amount: newcentraldata.vaAmount.toString(),
            total_amount: newcentraldata.grandTotal.toString(),
            rate_per_gram: newcentraldata.OrderRate.toString(),
            MRP: newcentraldata.grandTotal.toString(),
            HomeBranch: item.home_branch,
            BranchCode: newcentraldata.branch_code,
            ItemCode: newcentraldata.branch_code,
            StoneAmount: newcentraldata.stoneAmount,
            DiamondAmount: newcentraldata.diamondAmount,
            CompanyCode: "NJ",
            GSCode: newcentraldata.gs_code,
            PURITY: newcentraldata.PURITY,
            OrderStatus: newcentraldata.stockStatus === 0
              ? "Made To Order"
              : "Confirmed",
          };
        })
      );
      // const cartId1 = uuidv4();
      const cartId = `${Date.now()}${Math.floor(Math.random() * 1000)}`;

      const data = {
        orderMaster: {
          Cust_Id: customerId,
          cust_name: customer.Name,
          remarks: null,
          address1: customer?.Address1,
          address2: customer?.Address2,
          address3: customer?.Address3,
          city: customer?.City,
          pin_code: customer?.Pincode,
          state: customer?.State,
          mobile_no: customer?.MobileNo,
          shipping_address: "",
          instoreorderid: cartId


        },
        orderDetails: orderDetails, // Array of all items
      };


      if (true) {
        alert("Order Confirmed ");

        const promises = cart.map(async (item: any, i: number) => {
          const centraldata = await getCentralDbdataforcart(item.barcode)

          let newcentraldata = centraldata
          
          if (homeBranchValue) {
            try {
              const branchData = await checkBranchProductsRate({
                "branchcode": homeBranchValue,
                "BarcodeNo": item.barcode,
                "ProductBranch": item.item_branch || newcentraldata.branch_code
              });

              if (branchData?.success && branchData?.data?.length > 0) {
                const bData = branchData.data[0];
                let nwt = bData.NetWT;
                let gwt = bData.GWT;
                let swt = bData.SWT;

                if (branchData?.barcodeDetails?.length > 0 && branchData?.barcodeDetails[0]?.ProductDetails) {
                  const productDetails = branchData.barcodeDetails[0].ProductDetails;
                  nwt = productDetails.NetWeight;
                  gwt = productDetails.GrossWeight;
                  swt = productDetails.StoneWeight;
                }
                const stockStatus = branchData?.barcodeDetails?.[0]?.ProductDetails?.Status ?? newcentraldata.stockStatus;
                newcentraldata = {
                  ...newcentraldata,
                  taxableamount: bData.TaxableValue,
                  vaAmount: bData.MakingCharges,
                  grandTotal: bData.FinalAmount,
                  OrderRate: bData.GoldRate,
                  stoneAmount: bData.StoneAmount,
                  diamondAmount: bData.DiamondAmount,
                  taxAmount: bData.GSTAmount,
                  stockStatus: stockStatus,
                  metalAmount: bData.GoldAmount,
                  nwt: nwt,
                  gwt: gwt,
                  swt: swt
                }
              }
            } catch (e) {
              console.log("Error fetching branch rate for order push:", e)
            }
          }
          
          const data = {
            cart_status: "purchased",
            itm_status: "purchased",
            line_item_status: newcentraldata.stockStatus == 0 ? "Made To Order" : "Confirmed",
            cart_id: item.id,
            line_item_id: item.line_item_id,
            line_item_status_id: "",
            product: {
              bi_mobile_no: customer?.MobileNo,
              CustName: customer?.Name,
              address1: customer?.Address1,
              address2: customer?.Address2,
              city: customer?.City,
              pincode: customer?.Pincode,
              state: customer?.State,
              title: item.title,
              thumbnail: item.thumbnail,
              unit_price: newcentraldata.grandTotal,
              quantity: 1,
              metal_rate: newcentraldata.OrderRate,
              metal_value: newcentraldata.metalAmount,
              stone_value: newcentraldata.stoneAmount,
              diamond_value: newcentraldata.diamondAmount,
              va_amount: newcentraldata.vaAmount,
              discount_amount: 0,
              total_price: newcentraldata.grandTotal,
              gst_amount: newcentraldata.taxAmount,
              taxable_amount: newcentraldata.taxableamount,
              gross_weight: newcentraldata.gwt,
              item_branch: item.item_branch,
              home_branch: item.home_branch,
            },
          };
           debugger
          const resp = await CreateOrder(data);
          return resp;
        });

        await Promise.all(promises);


        clearCartCache()
        router.push("/order");
        // window.location.reload()
      }


    };

    const verifyBeforeCheckOut = async () => {



      if (customer?.length == 0) {
        alert("Please update billing address");

        return false;
      }
      const cnf = confirm("do you want to confirm order?")
      if (cnf) {
        return true;
      }
      return false;
    };

    const button = document.getElementById("rzp-button1");
    const handleClick = async function (e: Event) {
      try {
        if (amount <= 0) {
          alert("Amount Must Be Greater Than 0")
          return
        }
        const isValidated = await verifyBeforeCheckOut();

        if (isValidated) {
          router.refresh()
          await CheckOutstockproduct()

          if (invalidRateAlert) {
            alert("Please remove product with 'xxxx' value from cart before confirming order.")
            return;
          }

          if (outofstock == true) {
            const stock = confirm("Do want Procced with Out of Stock");
            if (stock) {
              await getOrderDetails();
            }
            else {
              //  alert("Please Remove out of Stock Products")
              return
            }
          }
          else {
            await getOrderDetails();
          }

        }
      } catch (error) {
        console.error("Error in Razorpay button click:", error);
      }
      e.preventDefault();
    };

    if (button) {
      button.onclick = handleClick;
    }

    // Cleanup: remove handler when dependencies change or component unmounts
    return () => {
      if (button) {
        button.onclick = null;
      }
    };
  }, [customer, amount, cart, homeBranchValue, ordercreated]);

  console.log("rate changed =====>>", ratechanges)

  return (
    <>

      <RemoveFromCart
        popup={outofstockalert}
        message={"Plz remove Out of Stock Products from cart!"}
      ></RemoveFromCart>
      
      <RemoveFromCart
        popup={invalidRateAlert}
        message={"Plz remove products with 'xxxx' value from cart!"}
      ></RemoveFromCart>


      <div className="flex flex-row flex-nowrap my-2">
        <div className="h-full"></div>
      </div>

      <button
        className="relative w-full mt-[20px] border-none rounded-[10px] p-[16px] bg-[linear-gradient(100deg,#3C5448,#2B3E34)] text-[#F4EFE6] font-jost text-[13.5px] font-semibold tracking-[0.08em] uppercase cursor-pointer overflow-hidden transition-all duration-150 shadow-[0_16px_30px_-16px_rgba(43,62,52,0.55)] hover:-translate-y-[2px] hover:shadow-[0_20px_36px_-14px_rgba(184,146,79,0.45)] active:translate-y-0 active:scale-[0.99]"
        id="rzp-button1"
      >
        <div className="absolute top-0 -left-[60%] w-[35%] h-full bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.35),transparent)] -skew-x-[20deg] animate-[shimmer_3.4s_ease-in-out_infinite]"></div>
        CONFIRM ORDER
      </button>


    </>
  );
};

export default ConfirmOrder;
