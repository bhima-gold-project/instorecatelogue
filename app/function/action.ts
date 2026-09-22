import { PostData, PutData, DeleteData } from '@/app/Api/post/post_api_service';
import { BRANCH_MASTER_PUSH, BRANCH_ORDER_PUSH, CREATE_ORDER, CUSTOMER_NEW_REGISTRATION_SERVER, DELETE_CART_ITEM, ERP_DATA_PUSH_URL, GENDER_LIST, GET_ALL_BRANCH_LIST, GET_BANNER_LIST, GET_CART_BY_CART_ID, GET_CART_BY_USERID, GET_CATEGORY_FROM_SERVER, GET_V2_CATEGORIES_API, GET_ITEM_CATEGORIES_BY_GSCODE, GET_CENTRAL_DATA_BY_BARCODE, GET_CUSTOMER_DETAILS_FROM_SERVER, GET_RATE_BY_BARCODE, ORDER_BY_BRANCH_URL, ORDER_DETAILS_BY_ORDER_ID, RATE_UPADTE, RESET_INV, STORE_REGISTARTION, VERIFY_OTP_URL, CHECK_BRANCH_RATE, BRANCH_WISE_CART, CHANGE_PASSWORD_API, ADMIN_SETTINGS_API, USERS_API, GENERATE_OTP_API, VERIFY_OTP_API, RESEND_OTP_API, PRODUCT_COUNT_API, GET_ALL_CATEGORY_COUNT_API, MAGIC_LINK_GENERATE_API, MAGIC_LINK_VERIFY_API, GET_COUNTERS_V2, GET_SUPPLIERS_V2, GET_MASTER_DESIGN_NAMES_V2, GET_DESIGN_NAMES_V2, GET_BRANCH_GSCODES_API, TOGGLE_BRANCH_GSCODE_API } from "../Api/api_list"
import { getData } from "../Api/get/get_api_service"
import Cookies from "js-cookie"
import { getHomeBranchFromToken, getLoginIdFromToken, clearAuthSession } from "./authUtils"

const cartid: any = Cookies.get("_si_cart_id")
const test: any = "cart_1739351790746SEH985"
export let homeBranchValue = getHomeBranchFromToken()
export let loginid = getLoginIdFromToken()

// const getCookieValue = (name: string) => {
//     if (typeof window !== "undefined") {
//       const value = `; ${document.cookie}`
//       const parts = value.split(`; ${name}=`)
//       if (parts.length === 2) return parts.pop()?.split(";").shift()
//     }
//     return null 
//   }


// const userid=getCookieValue("_si_login_id")


export const getCartData = async () => {
    const response = await getData(`${GET_CART_BY_CART_ID}${test}`)
    if (response) {
        return response
    }
    else
        return []
}


export const getOrderList = async () => {

    const res = await getData(`${ORDER_BY_BRANCH_URL}/${homeBranchValue}`)

    if (res) {
        return res
    }
    else {
        return []
    }
}


export const getOrdersDetails = async (orderId: any) => {
    const res = await getData(`${ORDER_DETAILS_BY_ORDER_ID}/${orderId}`)
    if (res) {
        return res
    }
    else {
        return []
    }
}


export const customerLoginApi = async (mobilenumber: any) => {
    const res = await getData(`${GET_CUSTOMER_DETAILS_FROM_SERVER}${mobilenumber}`)
    if (res) {
        return res
    }
    else {
        return []
    }

}

export const customerRegistrationApi = async (data: any) => {
    const res = await PostData(`${CUSTOMER_NEW_REGISTRATION_SERVER}`, data)
    if (res) {
        return res
    }
    else {
        return []
    }

}

export const deleteLineItem = async (id: any, uid: any) => {

    const data =
    {
        "line_item_id": id
    }
    const res = await PostData(`${DELETE_CART_ITEM}`, data)
    
    if (res) {
        return true
    }
    else {
        return false
    }
}


export const CreateOrder = async (data: any) => {
    const res = await PostData(`${CREATE_ORDER}`, data)
    if (res) {
        return res
    }
    else {

        return []

    }

}


export const GetCartByUserId = async (userid?: any) => {
    const loginId = getLoginIdFromToken() || userid;
    if (!loginId) {
        return [];
    }

    const res = await getData(`${GET_CART_BY_USERID}${loginId}`);
    if (res && Array.isArray(res)) {
        if (res.length > 0 && res[0].id) {
            Cookies.set("_si_cart_id", res[0].id);
        }
        Cookies.set("_cart_length", String(res.length));
        return res;
    } else {
        return [];
    }
};



export const CreateCentralOrder = async (data: any) => {
    const res = await PostData(`${ERP_DATA_PUSH_URL}`, data)
    if (res) {
        return res
    }
    else {
        return []
    }
}



export const getBranches = async () => {
    const token = typeof window !== "undefined" ? (Cookies.get("mobile_auth_token") || Cookies.get("auth_token")) : undefined;
    const res = await getData(`${GET_ALL_BRANCH_LIST}`, token);
    if (res) {
        if (Array.isArray(res)) {
            return res.filter((item: any) => item.branch_code && item.branch_code.toUpperCase() !== "ALL")
        }
        return res
    }
    else {
        return []
    }
}


export const getAllCategoryApi = async () => {

    const res = await getData(`${GET_CATEGORY_FROM_SERVER}`)
    if (res) {
        if (Array.isArray(res)) {
            return res.map((item: any) => {
                const name = item.CategoryName || item.categoryName;
                return {
                    ...item,
                    categoryName: name,
                    CategoryName: name
                };
            });
        }
        return res
    }
    else {
        return []
    }
}

export const getV2CategoriesApi = async () => {
    const res = await getData(`${GET_V2_CATEGORIES_API}`);
    if (res && res.data && Array.isArray(res.data)) {
        return res.data;
    } else if (res && Array.isArray(res)) {
        return res;
    }
    return [];
}

export const getItemCategoriesByGsCodeApi = async (gsCode: string) => {
    const res = await getData(`${GET_ITEM_CATEGORIES_BY_GSCODE}${encodeURIComponent(gsCode || '')}`);
    if (res && res.data && Array.isArray(res.data)) {
        return res.data;
    } else if (res && Array.isArray(res)) {
        return res;
    }
    return [];
}

export const getProductsCountApi = async (handle?: string, queryString?: string) => {
    const url = (handle && handle !== 'All') 
        ? `${PRODUCT_COUNT_API}/${encodeURIComponent(handle)}${queryString ? `?${queryString}` : ''}`
        : `${GET_ALL_CATEGORY_COUNT_API}${queryString ? `?${queryString}` : ''}`;
    const res = await getData(url);
    return res?.total || 0;
}


export const VerifyBranchLogin = async (email: any, otpOrPassword: any, deviceId?: any, isMobile?: boolean, otp?: any) => {
    const data: any = {
        UserName: email,
        Password: otpOrPassword,
    };

    if (deviceId) {
        data.DeviceID = deviceId;
        data.deviceId = deviceId;
        data.device_id = deviceId;
    }

    if (isMobile) {
        data.IsMobile = true;
        data.is_mobile = true;
    }

    if (otp) {
        data.OTP = otp;
        data.otp = otp;
    }

    const res = await PostData(`${VERIFY_OTP_URL}`, data);
    if (res) {
        return res;
    } else {
        return [];
    }
};

export const GenerateLoginOtp = async (username: string, password?: string, extraData?: any) => {
    const data: any = {
        UserName: username,
        Password: password,
        ...extraData
    };
    const res = await PostData(`${GENERATE_OTP_API}`, data);
    return res;
};

export const VerifyLoginOtp = async (username: string, otp: string, extraData?: any) => {
    const data: any = {
        UserName: username,
        OTP: otp,
        ...extraData
    };
    const res = await PostData(`${VERIFY_OTP_API}`, data);
    return res;
};

export const ResendLoginOtp = async (username: string) => {
    const data: any = {
        UserName: username
    };
    const res = await PostData(`${RESEND_OTP_API}`, data);
    return res;
};

export const VerifyMagicToken = async (token: string, deviceId?: string) => {
    const data: any = {
        token: token
    };
    if (deviceId && String(deviceId).trim()) {
        data.DeviceID = String(deviceId).trim();
        data.deviceId = String(deviceId).trim();
    }
    const res = await PostData(`${MAGIC_LINK_VERIFY_API}`, data);
    return res;
};

export const GenerateMagicLink = async (params: {
    UserName?: string;
    LoginID?: number;
    TokenType?: string;
    ExpiresInMinutes?: number;
    TargetRedirect?: string;
    MobileNo?: string;
    SendSms?: boolean;
    CreatedBy?: string;
}) => {
    const res = await PostData(`${MAGIC_LINK_GENERATE_API}`, params);
    return res;
};

export const ChangePassword = async (data: any) => {
    const res = await PostData(`${CHANGE_PASSWORD_API}`, data)
    if (res) {
        if (res.message === 'Password changed successfully.') {
            return res;
        } else {
            return { error: res.message || "Failed to change password" };
        }
    }
    else {
        return { error: "Failed to connect to server." }
    }
}

export const Logout = () => {
    const status = confirm(`Are you sure you want to logout ?`);
    if (status) {
        clearAuthSession();
        Cookies.remove("homebranch");
        Cookies.remove("_cart_length");
        Cookies.remove("_si_login_id");
        Cookies.remove("_si_cart_id");
        window.location.href = "/auth/login";
    }
};



export const getBanner = async () => {
    const res = await getData(`${GET_BANNER_LIST}`)
    if (res) {
        return res
    }
    else {
        return []
    }

}

export const UpdateRate = async (data: any) => {
    const res = await PostData(`${RATE_UPADTE}`, data)

    if (res) {
        return res
    }
    else {
        return []
    }
}

export const getCentralDbdata = async (barcode: any) => {

    const res = await getData(`${GET_CENTRAL_DATA_BY_BARCODE}${barcode}`)

    if (res) {

        return res
    }
    else {
        return []
    }

}


export const getCentralDbdataforcart = async (barcode: any) => {
    let res = await getData(`${GET_CENTRAL_DATA_BY_BARCODE}${barcode}`)
    if (Array.isArray(res)) {
        res = res.length > 0 ? res[0] : null;
    }
    if (res) {
        return res
    }
    else {
        return []
    }

}

export const NewStoreRegistration = async (data: any) => {

    const payload = {
        UserName: data.username,
        Password: data.password,
        Email: data.email,
        Branch_Code: data.branchcode,
        RoleID: null // Assuming a default role, can be null
    };

    const res = await PostData(`${STORE_REGISTARTION}`, payload)
    if (res) {
        if (res.message === 'User registered successfully.') {
            return res;
        } else {
            return { error: res.message };
        }
    }
    else {
        return { error: "Registration failed." }
    }

}



export const getGender = async () => {
    const res = await getData(`${GENDER_LIST}`)
    if (res) {
        return res
    }
    else {
        return []
    }

}

export const fetcher = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch");
    return response.json();
};



export const GetRateByBarcode = async (barcode: any) => {
    const res = await getData(`${GET_RATE_BY_BARCODE}${barcode}`)
    if (res) {
        return res
    }
    else {
        return []
    }
}


export const barnchOrderPush = async (barcode: any) => {
    const res = await getData(`${BRANCH_ORDER_PUSH}${barcode}`)
    if (res) {
        return res
    }
    else {
        return []
    }
}

export const barnchMasterPush = async (barcode: any) => {
    const res = await getData(`${BRANCH_MASTER_PUSH}${barcode}`)
    if (res) {
        return res
    }
    else {
        return []
    }
}


export const invUpdation = async (data: any) => {


    const res = await PostData(`${RESET_INV}`, data)
    if (res) {

        return res
    }
    else {
        return []
    }

}

export const checkBranchProductsRate = async (data: any) => {
    const res = await PostData(`${CHECK_BRANCH_RATE}`, data)
    if (res) {
        return res
    }
    else {
        return []
    }
}

export const branchWiseCart = async (data: any) => {
    const res = await PostData(`${BRANCH_WISE_CART}`, data)
    if (res) {
        return res
    }
    else {
        return []
    }
}

export const getAdminSettings = async () => {
    const res = await getData(`${ADMIN_SETTINGS_API}`);
    if (res && res.data) {
        return res.data;
    }
    return {};
}

export const getAllUsers = async () => {
    const token = typeof window !== "undefined" ? (Cookies.get("mobile_auth_token") || Cookies.get("auth_token")) : undefined;
    const res = await getData(`${USERS_API}`, token);
    if (res && Array.isArray(res)) {
        return res;
    }
    return [];
}

export const createUserManager = async (userData: any) => {
    const token = typeof window !== "undefined" ? (Cookies.get("mobile_auth_token") || Cookies.get("auth_token")) : undefined;
    const res = await PostData(`${USERS_API}`, userData, token);
    return res;
}

export const updateUserManager = async (id: number | string, userData: any) => {
    const token = typeof window !== "undefined" ? (Cookies.get("mobile_auth_token") || Cookies.get("auth_token")) : undefined;
    const res = await PutData(`${USERS_API}/${id}`, userData, token);
    return res;
}

export const deleteUserManager = async (id: number | string) => {
    const token = typeof window !== "undefined" ? (Cookies.get("mobile_auth_token") || Cookies.get("auth_token")) : undefined;
    const res = await DeleteData(`${USERS_API}/${id}`, token);
    return res;
}

export const getRoles = () => {
    return [
        { RoleID: 1, RoleName: "Admin", code: "ADMIN" },
        { RoleID: 2, RoleName: "User", code: "USER" },
        { RoleID: 3, RoleName: "CPC User", code: "CPC_USER" }
    ];
};

export const getCountersApi = async (filters?: { category?: string; gs_code?: string }) => {
    let url = GET_COUNTERS_V2;
    const params = new URLSearchParams();
    if (filters?.category && filters.category !== "All") params.append("category", filters.category);
    if (filters?.gs_code && filters.gs_code !== "All") params.append("gs_code", filters.gs_code);
    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;
    const res = await getData(url);
    if (res && res.data && Array.isArray(res.data)) {
        return res.data;
    }
    if (res && Array.isArray(res)) {
        return res;
    }
    return [];
}

export const getSuppliersApi = async (branchCode?: string) => {
    let url = GET_SUPPLIERS_V2;
    // if (branchCode && branchCode !== "All") {
    //     url += `?branch_code=${encodeURIComponent(branchCode)}`;
    // }
    const res = await getData(url);
    if (res && res.data && Array.isArray(res.data)) {
        return res.data;
    }
    if (res && Array.isArray(res)) {
        return res;
    }
    return [];
}

export const getMasterDesignNamesApi = async () => {
    const res = await getData(GET_MASTER_DESIGN_NAMES_V2);
    if (res && res.data && Array.isArray(res.data)) {
        return res.data;
    }
    if (res && Array.isArray(res)) {
        return res;
    }
    return [];
}

export const getDesignNamesApi = async () => {
    const res = await getData(GET_DESIGN_NAMES_V2);
    if (res && res.data && Array.isArray(res.data)) {
        return res.data;
    }
    if (res && Array.isArray(res)) {
        return res;
    }
    return [];
}

export const getBranchGsCodesApi = async () => {
    const res = await getData(GET_BRANCH_GSCODES_API);
    if (res && res.data && Array.isArray(res.data)) {
        return res.data;
    }
    if (res && Array.isArray(res)) {
        return res;
    }
    return [];
}

export const toggleBranchGsCodeApi = async (data: any) => {
    const res = await PostData(TOGGLE_BRANCH_GSCODE_API, data);
    return res;
}

