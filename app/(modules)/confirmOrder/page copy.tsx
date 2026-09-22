"use client";
import RemoveFromCart from "@/app/components/popups/removefromcart/page";
import { CreateCentralOrder, CreateOrder, getCentralDbdataforcart } from "@/app/function/action";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
const ConfirmOrder = ({ amount, cart, customer,customerId }: any) => {
 

  const [outofstock, setOutofstock] = useState(false);
  const [outofstockalert, setoutofstockalert] = useState(false);
  const [ordercreated, setordercreated] = useState(false);

  const router = useRouter();


  const getCookieValue = (name: string) => {
    if (typeof document !== "undefined") {
      // Ensure `document` is available
      const value = `; ${document.cookie}`; // Prepend a semicolon for easier parsing
      const parts = value.split(`; ${name}=`); // Split based on the cookie name
      if (parts.length === 2) return parts.pop()?.split(";").shift(); // Return the cookie value if found
    }
    return undefined;
  };

  // Example usage
  const homeBranchValue = getCookieValue("homebranch");
//check out of stock product======>>>>
const CheckOutstockproduct = async() => {
  
  for (let i = 0; i < cart.length; i++) {
    const centraldata=await getCentralDbdataforcart(cart[i].barcode)
  
      if (centraldata[0].stockStatus === 0) {
          setOutofstock(true);
          return; // Exit the function as soon as an out-of-stock product is found
      }
  }
  setOutofstock(false); // Only runs if no product is out of stock
};

useEffect(()=>{
  CheckOutstockproduct()

},[outofstock,cart.length])


  useEffect(() => {
    const getOrderDetails = async () => {
    


      const orderPromises = cart.map(async (item:any) => {
        
       const centraldata=await getCentralDbdataforcart(item.barcode)
       let newcentraldata=centraldata[0]
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
              OrderStatus: newcentraldata.stockStatus ==0 ?"Made To Order":"Confirmed"
          },
          orderDetails: {
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
            CompanyCode: "BH",
            GSCode: "NGO",
          
          },
        };
      
        return await CreateCentralOrder(data);
      });


      
       // Wait for all orders to be created
      const results = await Promise.all(orderPromises);
   //   setordercreated(results.every((res) => res.success));
      setordercreated(results[0].success)
    

      const status=results.every((res) => res.success)
   
   
      if (status) {
        alert("Order Confirmed "); 

        const promises = cart.map(async (item: any, i: number) => {
          const centraldata=await getCentralDbdataforcart(item.barcode)
            
         let newcentraldata=centraldata[0]
          const data = {
            cart_status: "purchased",
            itm_status: "purchased",
            line_item_status: newcentraldata.stockStatus ==0 ?"Made To Order":"Confirmed",
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
              unit_price:newcentraldata.grandTotal,
              quantity: 1,
              metal_rate: newcentraldata.OrderRate,
              metal_value: newcentraldata.metalAmount,
              stone_value: newcentraldata.stoneAmount,
              diamond_value: newcentraldata.diamondAmount,
              va_amount:newcentraldata.vaAmount,
              discount_amount: 0,
              total_price: newcentraldata.grandTotal,
              gst_amount: newcentraldata.taxAmount,
              taxable_amount: newcentraldata.taxableamount,
              gross_weight: newcentraldata.gwt,
              item_branch: item.item_branch,
              home_branch: item.home_branch,
            },
          };
  
          const resp = await CreateOrder(data);
          return resp;
        });
  
        await Promise.all(promises);

        

        
        router.push("/order");
        setTimeout(() => {
          router.refresh();
        }, 3000);
      }
 
      
    };

    const verifyBeforeCheckOut = async () => {



      if (customer.length == 0) {
        alert("Please Upadte Billing Address");

        return false;
      }

      return true;
    };

    const button = document.getElementById("rzp-button1");
    if (button) {
      button.onclick = async function (e) {
        try {
          const isValidated = await verifyBeforeCheckOut();

          if (isValidated) {
            router.refresh()
            await   CheckOutstockproduct()
            if(outofstock==true){
              const stock=confirm("Do want Procced with Out of Stock");
              if(stock){
                await getOrderDetails();
              }
              else{
                alert("Please Remove out of Stock Products")
                return
              }
            }
            else{
              await getOrderDetails();
            }
         
          }
        } catch (error) {
          console.error("Error in Razorpay button click:", error);
        }
        e.preventDefault();
      };
    }
  }, [customer, amount, cart, homeBranchValue,ordercreated]);



  return (
    <>
  
      <RemoveFromCart
        popup={outofstockalert}
        message={"Plz remove Out of Stock Products from cart!"}
      ></RemoveFromCart>
   

      <div className="flex flex-row flex-nowrap my-2">
        <div className="h-full"></div>
      </div>

      <button
        className=" bg-[linear-gradient(146deg,_rgba(62,138,255,1)_0%,_rgba(0,212,255,1)_100%)] flex justify-center items-center py-2 px-10 h-20 w-full"
        id="rzp-button1"
      >
        CONFIRM ORDER
      </button>

    
    </>
  );
};

export default ConfirmOrder;
