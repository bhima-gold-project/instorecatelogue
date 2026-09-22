"use client";
import GradientBasicButton from "@/app/components/button/page";
import useToggleState from "@/app/components/hook/useToggleState";

const { Option } = Select;
import { Font_20px, Font_24px } from "@/app/components/labels/page";
import Modal from "@/app/components/medusamodal/page";
import { indianStates } from "@/app/Data/data";
import {
  customerLoginApi,
  customerRegistrationApi,
  getAdminSettings,
} from "@/app/function/action";
import { Textarea } from "@headlessui/react";
import { Input, Select } from "antd";
import TextArea from "antd/es/input/TextArea";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

const AddBillingAddressButton = ({
  getCustomerData,
  cart,
  MobileNumber,
}: any) => {
  const [successState, setSuccessState] = useState(false);
  const { state, open, close: closeModal } = useToggleState(false);
  const [loginModalState, setLoginModalState] = useState(false);
  const [erpcustomerdata, seterpcustomerdata] = useState<any>([]);
  const [Editcustmer, setEditcustomer] = useState(false);
  const [adhaarname, setahaarname] = useState("");
  const [error, seterror] = useState("");

  const EditCustomer = () => {
    setEditcustomer(true);
  };

  const [phone, setPhone] = useState("");
  const [Name, setnewName] = useState("");
  const [newname, setnewname] = useState("");
  const [NewuserStatus, setNewuserStatus] = useState(false);
  const [adress2, setadress2] = useState("");
  const [adress3, setadress3] = useState("");
  const [city, setcity] = useState("");
  const [email, setemail] = useState("");
  const [gender, setgender] = useState("");
  const [pincode, setpincode] = useState("");

  //   const [formState, formAction] = useFormState(addCustomerShippingAddress, {
  //     success: false,
  //     error: null,
  //   })

  useEffect(() => {
    if (phone) {
      localStorage.setItem("phone", phone); // Update localStorage when phone changes
    }
  }, [phone]);

  useEffect(() => {
    localStorage.removeItem("phone");
  }, []);
  const onCloseLoginModal = () => {
    setLoginModalState(false);
  };

  const close = () => {
    //setSuccessState(false)
    closeModal();
  };

  //   useEffect(() => {
  //     if (successState) {
  //       close()
  //     }
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  //   }, [successState])

  //   useEffect(() => {
  //     if (formState.success) {
  //       setSuccessState(true)
  //     }
  //   }, [formState])

  const handleAddAddressButton = () => {
    // if (!customer) {
    //   setLoginModalState(!loginModalState)
    // } else {
    open();
    // }
  };

  const validateMobileNumber = (phone: string) => {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(phone);
  };

  const customerLogin = async () => {
    if (!validateMobileNumber(phone)) {
      seterror("Please Enter 10-Digit Valid Number");
      return;
    }
    seterror("");
    // setnewName("")
    // setadress1("")
    // setadress2("")
    // setadress3("")
    // setcity("")
    // setpincode("")

    const loginstatus = await customerLoginApi(phone);


    seterpcustomerdata(loginstatus);
    setnewName(loginstatus?.[0]?.Name || "");
    setadress1(loginstatus?.[0]?.Address1 || "");
    setadress2(loginstatus?.[0]?.Address2 || "");
    // setadress3(loginstatus?.[0]?.Address3 || "");
    setcity(loginstatus?.[0]?.City || "");
    setemail(loginstatus?.[0]?.EmailID || "");
    setgender(loginstatus?.[0]?.Sex || "");
    setpincode(loginstatus?.[0]?.PinCode || "");
    if (loginstatus == false) {
      setNewuserStatus(true);
    } else {
      setNewuserStatus(false);
    }
  };

  const sendMobileNumber = () => {
    MobileNumber(phone);
  };

  useEffect(() => {
    sendMobileNumber();

  }, [phone])


  const [selectedState, setSelectedState] = useState("Karnataka");
  const [statpincode, setstatpincode] = useState(29);

  const [adress1, setadress1] = useState("");

  const [isCustomerUpdateAllowed, setIsCustomerUpdateAllowed] = useState(true);

  useEffect(() => {
    if (state) {
      const fetchSettings = async () => {
        try {
          const settingsRes = await getAdminSettings();
          if (settingsRes && typeof settingsRes.isCustomerDataUpdateEnabled !== 'undefined') {
            setIsCustomerUpdateAllowed(settingsRes.isCustomerDataUpdateEnabled === true);
          }
        } catch (e) {
          console.error("Error fetching admin settings:", e);
        }
      };
      fetchSettings();
    }
  }, [state]);

  const disableFields = !NewuserStatus && !isCustomerUpdateAllowed;

  const [userDetails, setUserDetails] = useState({
    first_name: Name,
    address_1: adress1,
    address_2: adress2,
    // address_3: adress3,
    city: city,
    state: selectedState,
    stateCode: statpincode,
    postal_code: "",
    gender: gender,
    country: "",
    CompanyCode: "",
    BranchCode: "",
    email: email,
  });


  const data = {
    Name: Name,
    Address1: adress1,
    Address2: adress2,
    // Address3: adress3,
    City: city,
    State: selectedState,
    Pincode: pincode,
    MobileNo: phone,
    EmailID: email,
    Sex: gender,
    StateCode: statpincode,
    CountryName: "India",

    // CompanyCode: userDetails.CompanyCode,
    // BranchCode: userDetails.BranchCode,
  };

  const sendCustomerData = async () => {
    let isUpdateEnabled = true;
    try {
      const settingsRes = await getAdminSettings();
      if (settingsRes && typeof settingsRes.isCustomerDataUpdateEnabled !== 'undefined') {
        isUpdateEnabled = settingsRes.isCustomerDataUpdateEnabled === true;
      }
    } catch (e) {
      console.error("Error fetching admin settings:", e);
    }

    if (isUpdateEnabled) {
      await customerRegistrationApi(data);
    } else {
      console.log("Customer data update API is disabled from Admin Panel.");
    }

    getCustomerData(data, erpcustomerdata[0]?.ID);
    closeModal();
  };

  const validateData = (data: any) => {
    const missingFields = [];
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined || value === null || value === "") {
        missingFields.push(key); // Add the field name to the missingFields array
      }
    }

    return missingFields;
  };

  const CustomerRegi = async () => {
    const registrationstatus = await customerRegistrationApi(data);

    if (registrationstatus.success === true) {
      alert("Registration Successful");

      setNewuserStatus(false);
    }
  };


  const validateEmail = (email: any) => {
    const pattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    return pattern.test(email);
  }

  const regApi = async () => {


    if (NewuserStatus) {
      const missingFields = validateData(data);

      if (missingFields.length === 0) {
        const emailres = validateEmail(data.EmailID)
        if (emailres) {
          CustomerRegi();
        } else {
          alert("Invalid Email");
        }

      } else {
        // Display message with missing fields
        alert(`The following fields are missing ${missingFields.join(", ")}`);
        return
      }
    }
    // CustomerRegi()
  };

  const [allstate, setallState] = useState<any>([]);
  const [selectedstate, setselectedstate] = useState("");

  useEffect(() => {
    const getStates = async () => {
      setallState(indianStates);
    };

    getStates();
  }, []);

  useEffect(() => {
    const selected = allstate.find((state: any) => state.name === selectedState);
    setstatpincode(selected?.code || 29); // Update pincode or set empty if not found
  }, [selectedState]);

  useEffect(() => {
    //   debugger
    setnewName("");
    setadress1("");
    setadress2("");
    // setadress3("");
    setcity("");
    setpincode("");
    customerLogin();
  }, [phone, NewuserStatus]);



  return (
    <>
      <div className="flex w-full flex-wrap flex-row justify-between items-center gap-2">
        <div className="my-1 ">
          <Font_20px
            label={"Customer details"}
            fontWeight="font-normal"
            fontFamily="font-rubik"
            color="text-gray-900"
          />
        </div>
        <button
          className="p-2 w-fit flex flex-row justify-between"
          onClick={() => {
            handleAddAddressButton();
          }}
        >
          {/* <span className="text-base-semi">Add Address</span> */}
          <Plus />
        </button>
      </div>

      {state && (
        <div className="fixed inset-0 bg-[rgba(42,36,32,0.38)] backdrop-blur-[2px] flex items-center justify-center z-[100]">
          <style>{`
            @keyframes modalIn{ to{ opacity:1; transform:translateY(0) scale(1); } }
            @keyframes shimmer{ 0%{ left:-60%; } 50%{ left:130%; } 100%{ left:130%; } }
            .fl-raised { top: 6px !important; font-size: 10px !important; letter-spacing: 0.05em !important; text-transform: uppercase !important; color: #8C6B33 !important; font-weight: 500 !important; }
          `}</style>
          <div className="w-[460px] max-w-[92vw] max-h-[90vh] overflow-y-auto bg-[#FFFFFF] rounded-[18px] px-[34px] pt-[34px] pb-[30px] shadow-[0_40px_80px_-30px_rgba(42,36,32,0.5)] relative opacity-0 translate-y-[22px] scale-[0.96] animate-[modalIn_0.5s_cubic-bezier(.2,.8,.2,1)_forwards]">

            <div className="flex items-center justify-between mb-[26px]">
              <h1 className="font-cormorant font-bold text-[27px] text-[#2A2420] relative pb-[8px] after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-[42px] after:h-[2px] after:bg-[#B8924F]">
                Customer Details
              </h1>
              <button type="button" onClick={close} className="w-[32px] h-[32px] rounded-full border border-[rgba(42,36,32,0.12)] bg-transparent flex items-center justify-center cursor-pointer text-[#6B5F55] transition-all hover:bg-[#2A2420] hover:text-white hover:rotate-90">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="w-[14px] h-[14px]"><path d="M6 6l12 12M18 6 6 18" /></svg>
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); }}>
              {/* Phone */}
              <div className="relative mb-[16px]">
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={10} required
                  className={`w-full bg-[rgba(184,146,79,0.045)] border ${error ? 'border-[#C25450] bg-[rgba(194,84,80,0.06)]' : 'border-[rgba(42,36,32,0.12)]'} rounded-[9px] px-[14px] pt-[22px] pb-[8px] text-[#2A2420] font-jost text-[14px] outline-none transition-all focus:border-[#B8924F] focus:bg-[rgba(184,146,79,0.08)] focus:shadow-[0_0_0_3px_rgba(184,146,79,0.12)]`}
                />
                <label className={`absolute left-[14px] text-[#6B5F55] text-[13.5px] pointer-events-none transition-all ${phone ? 'fl-raised' : 'top-[14px]'}`}>
                  Phone
                </label>
                {error && <div className="text-[#C25450] text-[12.5px] mt-[4px] ml-[2px]">{error}</div>}
              </div>

              {/* Name */}
              <div className="relative mb-[16px]">
                <input type="text" value={Name} onChange={(e) => setnewName(e.target.value)} disabled={!NewuserStatus}
                  className="w-full bg-[rgba(184,146,79,0.045)] border border-[rgba(42,36,32,0.12)] rounded-[9px] px-[14px] pt-[22px] pb-[8px] text-[#2A2420] font-jost text-[14px] outline-none transition-all focus:border-[#B8924F] focus:bg-[rgba(184,146,79,0.08)] focus:shadow-[0_0_0_3px_rgba(184,146,79,0.12)] disabled:opacity-75 disabled:cursor-not-allowed"
                />
                <label className={`absolute left-[14px] text-[#6B5F55] text-[13.5px] pointer-events-none transition-all ${Name ? 'fl-raised' : 'top-[14px]'}`}>
                  Name
                </label>
              </div>

              {/* Address 1 */}
              <div className="relative mb-[16px]">
                <textarea rows={1} value={adress1} onChange={(e) => setadress1(e.target.value)} disabled={disableFields}
                  className="w-full min-h-[54px] resize-none bg-[rgba(184,146,79,0.045)] border border-[rgba(42,36,32,0.12)] rounded-[9px] px-[14px] pt-[22px] pb-[8px] text-[#2A2420] font-jost text-[14px] outline-none transition-all focus:border-[#B8924F] focus:bg-[rgba(184,146,79,0.08)] focus:shadow-[0_0_0_3px_rgba(184,146,79,0.12)] disabled:opacity-75 disabled:cursor-not-allowed"
                ></textarea>
                <label className={`absolute left-[14px] text-[#6B5F55] text-[13.5px] pointer-events-none transition-all ${adress1 ? 'fl-raised' : 'top-[14px]'}`}>
                  Address 1
                </label>
              </div>

              {/* Address 2 */}
              <div className="relative mb-[16px]">
                <textarea rows={1} value={adress2} onChange={(e) => setadress2(e.target.value)} disabled={disableFields}
                  className="w-full min-h-[54px] resize-none bg-[rgba(184,146,79,0.045)] border border-[rgba(42,36,32,0.12)] rounded-[9px] px-[14px] pt-[22px] pb-[8px] text-[#2A2420] font-jost text-[14px] outline-none transition-all focus:border-[#B8924F] focus:bg-[rgba(184,146,79,0.08)] focus:shadow-[0_0_0_3px_rgba(184,146,79,0.12)] disabled:opacity-75 disabled:cursor-not-allowed"
                ></textarea>
                <label className={`absolute left-[14px] text-[#6B5F55] text-[13.5px] pointer-events-none transition-all ${adress2 ? 'fl-raised' : 'top-[14px]'}`}>
                  Address 2
                </label>
              </div>

              {/* Email (new user only) */}
              {NewuserStatus && (
                <div className="relative mb-[16px]">
                  <input type="email" value={email} onChange={(e) => setemail(e.target.value)} required
                    className="w-full bg-[rgba(184,146,79,0.045)] border border-[rgba(42,36,32,0.12)] rounded-[9px] px-[14px] pt-[22px] pb-[8px] text-[#2A2420] font-jost text-[14px] outline-none transition-all focus:border-[#B8924F] focus:bg-[rgba(184,146,79,0.08)] focus:shadow-[0_0_0_3px_rgba(184,146,79,0.12)]"
                  />
                  <label className={`absolute left-[14px] text-[#6B5F55] text-[13.5px] pointer-events-none transition-all ${email ? 'fl-raised' : 'top-[14px]'}`}>
                    Email
                  </label>
                </div>
              )}

              {/* Gender (new user only) */}
              {NewuserStatus && (
                <div className="relative mb-[16px]">
                  <select value={gender} onChange={(e) => setgender(e.target.value)} className="w-full bg-[rgba(184,146,79,0.045)] border border-[rgba(42,36,32,0.12)] rounded-[9px] px-[14px] pt-[22px] pb-[8px] text-[#2A2420] font-jost text-[14px] outline-none appearance-none cursor-pointer focus:border-[#B8924F] focus:bg-[rgba(184,146,79,0.08)] focus:shadow-[0_0_0_3px_rgba(184,146,79,0.12)]">
                    <option value="" disabled hidden>Select Gender</option>
                    <option value="m">Male</option>
                    <option value="f">Female</option>
                    <option value="o">Other</option>
                  </select>
                  <label className={`absolute left-[14px] text-[#6B5F55] text-[13.5px] pointer-events-none transition-all ${gender ? 'fl-raised' : 'top-[14px]'}`}>
                    Gender
                  </label>
                  <svg className="absolute right-[14px] top-1/2 -translate-y-1/2 w-[11px] h-[11px] text-[#6B5F55] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
                </div>
              )}

              {/* City + Pin Code */}
              <div className="grid grid-cols-2 gap-[14px] mb-[16px]">
                <div className="relative">
                  <input type="text" value={city} onChange={(e) => setcity(e.target.value)} required disabled={disableFields}
                    className="w-full bg-[rgba(184,146,79,0.045)] border border-[rgba(42,36,32,0.12)] rounded-[9px] px-[14px] pt-[22px] pb-[8px] text-[#2A2420] font-jost text-[14px] outline-none transition-all focus:border-[#B8924F] focus:bg-[rgba(184,146,79,0.08)] focus:shadow-[0_0_0_3px_rgba(184,146,79,0.12)] disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                  <label className={`absolute left-[14px] text-[#6B5F55] text-[13.5px] pointer-events-none transition-all ${city ? 'fl-raised' : 'top-[14px]'}`}>
                    City
                  </label>
                </div>
                <div className="relative">
                  <input type="text" value={pincode} onChange={(e) => setpincode(e.target.value)} maxLength={6} required disabled={disableFields}
                    className="w-full bg-[rgba(184,146,79,0.045)] border border-[rgba(42,36,32,0.12)] rounded-[9px] px-[14px] pt-[22px] pb-[8px] text-[#2A2420] font-jost text-[14px] outline-none transition-all focus:border-[#B8924F] focus:bg-[rgba(184,146,79,0.08)] focus:shadow-[0_0_0_3px_rgba(184,146,79,0.12)] disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                  <label className={`absolute left-[14px] text-[#6B5F55] text-[13.5px] pointer-events-none transition-all ${pincode ? 'fl-raised' : 'top-[14px]'}`}>
                    Pin Code
                  </label>
                </div>
              </div>

              {/* State + Country */}
              <div className="grid grid-cols-2 gap-[14px] mb-[16px]">
                <div className="relative">
                  <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} disabled={disableFields} className="w-full bg-[rgba(184,146,79,0.045)] border border-[rgba(42,36,32,0.12)] rounded-[9px] px-[14px] pt-[22px] pb-[8px] text-[#2A2420] font-jost text-[14px] outline-none appearance-none cursor-pointer focus:border-[#B8924F] focus:bg-[rgba(184,146,79,0.08)] focus:shadow-[0_0_0_3px_rgba(184,146,79,0.12)] disabled:opacity-75 disabled:cursor-not-allowed">
                    <option value="" disabled hidden>Select</option>
                    {allstate?.map((state1: any) => (
                      <option key={state1?.code} value={state1?.name}>{state1?.name}</option>
                    ))}
                  </select>
                  <label className={`absolute left-[14px] text-[#6B5F55] text-[13.5px] pointer-events-none transition-all ${selectedState ? 'fl-raised' : 'top-[14px]'}`}>
                    State
                  </label>
                  <svg className="absolute right-[14px] top-1/2 -translate-y-1/2 w-[11px] h-[11px] text-[#6B5F55] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
                </div>
                <div className="relative">
                  <input type="text" value="India" disabled
                    className="w-full bg-[rgba(184,146,79,0.045)] border border-[rgba(42,36,32,0.12)] rounded-[9px] px-[14px] pt-[22px] pb-[8px] text-[#2A2420] font-jost text-[14px] outline-none disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                  <label className="absolute left-[14px] top-[6px] text-[#8C6B33] text-[10px] tracking-[0.05em] uppercase font-medium pointer-events-none">
                    Country
                  </label>
                </div>
              </div>

              {/* Save Button */}
              {!NewuserStatus ? (
                <button type="button" onClick={() => sendCustomerData()} className="relative overflow-hidden w-full mt-[8px] border-none rounded-[10px] p-[15px] bg-[linear-gradient(100deg,#3C5448,#2B3E34)] text-[#F4EFE6] font-jost text-[14px] font-semibold tracking-[0.06em] cursor-pointer transition-all hover:-translate-y-[2px] shadow-[0_16px_30px_-16px_rgba(43,62,52,0.55)] hover:shadow-[0_20px_36px_-14px_rgba(184,146,79,0.45)] active:translate-y-0 active:scale-[0.99]">
                  <div className="absolute top-0 -left-[60%] w-[35%] h-full bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.35),transparent)] -skew-x-[20deg] animate-[shimmer_3.4s_ease-in-out_infinite]"></div>
                  Save
                </button>
              ) : (
                <button type="button" onClick={regApi} className="relative overflow-hidden w-full mt-[8px] border-none rounded-[10px] p-[15px] bg-[linear-gradient(100deg,#3C5448,#2B3E34)] text-[#F4EFE6] font-jost text-[14px] font-semibold tracking-[0.06em] cursor-pointer transition-all hover:-translate-y-[2px] shadow-[0_16px_30px_-16px_rgba(43,62,52,0.55)] hover:shadow-[0_20px_36px_-14px_rgba(184,146,79,0.45)] active:translate-y-0 active:scale-[0.99]">
                  <div className="absolute top-0 -left-[60%] w-[35%] h-full bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.35),transparent)] -skew-x-[20deg] animate-[shimmer_3.4s_ease-in-out_infinite]"></div>
                  Save
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      {/* <Modal
        isOpen={loginModalState}
        close={() => {
          onCloseLoginModal()
        }}
        size="small"
      >
        <SIOTPLoginModal onClose={() => onCloseLoginModal()} />
      </Modal> */}
    </>
  );
};

export default AddBillingAddressButton;
