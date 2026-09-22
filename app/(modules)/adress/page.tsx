"use client";

import { useEffect, useState } from "react";
import AddBillingAddressButton from "./add-billing-adress/page";

export default function AdressPage({ cart, getcustomerdata }: any) {
  const [phone, setPhone] = useState("");
  const [customeraddress, setcustomerAddress] = useState<any>([]);
  const [mobile, setMobile] = useState("");
  const [customerid, setcustomerid] = useState("");
  
  const getCustomerDatafromCentralserver = (customerdata: any,Id:any) => {
    setcustomerAddress(customerdata);

    let data = [];
     setcustomerid(Id)
    data.push(customerdata);


    const sendCustomerData = () => {
      getcustomerdata(data);
    };
    sendCustomerData();
  };

  const customerdatawithid:any=[]
  customerdatawithid.push(customeraddress)
  customerdatawithid.push({"customerid":customerid})


  const sendCustomerData = () => {
    getcustomerdata(customerdatawithid);

  };
 
  useEffect(() => {
    if (customeraddress) {
      sendCustomerData();
    }
  }, [customeraddress]);

  const getMobilenumber = (phone: any) => {
    setPhone(phone);
  };

  const [error, setError] = useState("");

  const validateMobile = (value: any) => {
    // Allow only numbers
    if (!/^\d*$/.test(value)) {
      setError("Only numeric values are allowed.");
      return;
    }

    // Update mobile and validate length
    setMobile(value);
    if (value.length !== 10 && value.length > 0) {
      setError("Mobile number must be exactly 10 digits.");
    } else {
      setError(""); // Clear the error
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <AddBillingAddressButton
        cart={cart}
        getCustomerData={getCustomerDatafromCentralserver}
        MobileNumber={getMobilenumber}
      />

      {/* <h1>{phone}</h1> */}

      <div className="">
        {customeraddress && (
          <>
            {" "}
            <div className="flex flex-wrap font-rubik">
              {customeraddress?.Name && (
                <p className="mr-1 font-bold text-black">
                  {customeraddress.Name},
                </p>
              )}
              {customeraddress?.MobileNo && (
                <p className="mr-1">{customeraddress.MobileNo},</p>
              )}
              {customeraddress?.Address1 && (
                <p className="mr-1">{customeraddress.Address1},</p>
              )}
              {customeraddress?.Address2 && (
                <p className="mr-1">{customeraddress.Address2},</p>
              )}
              {customeraddress?.Address3 && (
                <p className="mr-1">{customeraddress.Address3},</p>
              )}
              {customeraddress?.City && (
                <p className="mr-1">{customeraddress.City},</p>
              )}
              {customeraddress?.PinCode && (
                <p className="mr-1">{customeraddress.PinCode},</p>
              )}
              {customeraddress?.State && (
                <p className="mr-1">{customeraddress.State}</p>
              )}
            </div>
          </>
        )}
      </div>

      {customeraddress?.length < 1 && (
        <p className="mr-1 font-medium font-rubik text-red-600">
          Please Add Your Address
        </p>
      )}

      <div className="relative mb-2">
        {<p className="text-red-500 absolute text-sm mt-1">{error}</p>}
      </div>
    </div>
  );
}
