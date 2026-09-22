import defualt_logo from "../../public/default.jpg"

export const ADMIN_BASE_URl = "";

export const SYNC_API_END_POINT = process.env.NEXT_PUBLIC_SYNC_API_END_POINT || process.env.NEXT_PUBLIC_API_SERVICE_BASE_URL || 'http://192.168.10.12:9006';

// Read API Service Base URL from environment variable
export const API_SERVICE_BASE_URl = process.env.NEXT_PUBLIC_API_SERVICE_BASE_URL || "http://192.168.10.12:9006";

export const GET_PDP_DATA = `${API_SERVICE_BASE_URl}/price?barcode=` //done
export const CHECK_BRANCH_RATE = `${API_SERVICE_BASE_URl}/api/checkbranchrate`;
export const BRANCH_WISE_CART = `${API_SERVICE_BASE_URl}/api/branchwisecart`;
export const BRANCH_ORDER_PUSH = `${API_SERVICE_BASE_URl}/api/branchorderdetails/`
export const BRANCH_MASTER_PUSH = `${API_SERVICE_BASE_URl}/api/branchordermaster?barcode=`
export const GET_CUSTOMER_DETAILS_FROM_SERVER = `${API_SERVICE_BASE_URl}/search?mobile=`;
export const CUSTOMER_NEW_REGISTRATION_SERVER = `${API_SERVICE_BASE_URl}/customerdatapush`;
export const GET_ALL_CATEGORY_FROM_MEDUSA = `${API_SERVICE_BASE_URl}/api/medusacategory`;
export const GET_CATEGORY_FROM_SERVER = `${API_SERVICE_BASE_URl}/api/category`;
export const GET_V2_CATEGORIES_API = `${API_SERVICE_BASE_URl}/api/v2/categories`;
export const GET_ITEM_CATEGORIES_BY_GSCODE = `${API_SERVICE_BASE_URl}/api/v2/categories/item-categories?gs_code=`;
export const GET_BANNER_LIST = `${API_SERVICE_BASE_URl}/api/centralbanners`;
export const GET_ALL_BRANCH_LIST = `${API_SERVICE_BASE_URl}/api/branch`;
export const GENDER_LIST = `${API_SERVICE_BASE_URl}/api/gender`;
export const ORDER_BY_BRANCH_URL = `${API_SERVICE_BASE_URl}/api/orders`;
export const ORDER_DETAILS_BY_ORDER_ID = `${API_SERVICE_BASE_URl}/api/ordersdetails`;
export const UPDATE_CATEGORY_DETAILS = `${API_SERVICE_BASE_URl}/api/categoryupdate`;
export const RATE_UPADTE = `${API_SERVICE_BASE_URl}/api/update`;
export const STORE_REGISTARTION = `${API_SERVICE_BASE_URl}/v1/auth/register`;
export const PRODUCT_LIST_API = `${API_SERVICE_BASE_URl}/api/productslimit`;
export const PRODUCT_COUNT_API = `${API_SERVICE_BASE_URl}/api/productscount`;
export const LOGIN_URL = `${API_SERVICE_BASE_URl}/v1/auth/login`;
export const VERIFY_OTP_URL = `${API_SERVICE_BASE_URl}/v1/auth/login`;
export const GENERATE_OTP_API = `${API_SERVICE_BASE_URl}/v1/auth/generate-otp`;
export const VERIFY_OTP_API = `${API_SERVICE_BASE_URl}/v1/auth/verify-otp`;
export const RESEND_OTP_API = `${API_SERVICE_BASE_URl}/v1/auth/resend-otp`;
export const CHANGE_PASSWORD_API = `${API_SERVICE_BASE_URl}/v1/auth/change-password`;
export const LINE_ITEM_STATUS = `${API_SERVICE_BASE_URl}/api/orderstatus?itm_id=`;
export const ERP_DATA_PUSH_URL = `${API_SERVICE_BASE_URl}/payment/success`;
export const GET_ALL_CATEGORY = `${API_SERVICE_BASE_URl}/api/allcategories`;
export const GET_ALL_CATEGORY_COUNT_API = `${API_SERVICE_BASE_URl}/api/allcategories/count`;
export const DELETE_CART_ITEM = `${API_SERVICE_BASE_URl}/api/remove`
// cart functionality
export const ADD_TO_CART = `${API_SERVICE_BASE_URl}/api/cart`
export const bhima_boy_Image = defualt_logo
// export const bhima_boy_Image = "https://sharaaninfo.com/iijs/logo.png"
export const GET_CART_BY_CART_ID = `${API_SERVICE_BASE_URl}/api/getcart?cart_id=`
export const CREATE_ORDER = `${API_SERVICE_BASE_URl}/api/ordercreation`
export const GET_CART_BY_USERID = `${API_SERVICE_BASE_URl}/api/getcart?user_id=`
export const GET_CENTRAL_DATA_BY_BARCODE = `${API_SERVICE_BASE_URl}/price?barcode=`
export const GET_RATE_BY_BARCODE = `${API_SERVICE_BASE_URl}/api/rate/`
export const RESET_INV = `${API_SERVICE_BASE_URl}/api/reset-inventory`

// Global Search API
export const GLOBAL_SEARCH_API = `${API_SERVICE_BASE_URl}/api/global-search`

export const GET_ITEM_CODES = `${API_SERVICE_BASE_URl}/api/item-codes`
export const CANCEL_ORDER_API = `${API_SERVICE_BASE_URl}/api/cancelorder`

// Product synchronization API
export const PRODUCT_SYNC_API = `${API_SERVICE_BASE_URl}/api/product-sync`
export const PRODUCT_SYNC_STOP_API = `${API_SERVICE_BASE_URl}/api/stop-sync`

// Admin Settings API
export const ADMIN_SETTINGS_API = `${API_SERVICE_BASE_URl}/api/settings`

// User & Device Management API
export const USERS_API = `${API_SERVICE_BASE_URl}/v1/auth/users`
// Magic Link / Tokenized Direct URL API
export const MAGIC_LINK_GENERATE_API = `${API_SERVICE_BASE_URl}/v1/auth/magic-link/generate`
export const MAGIC_LINK_VERIFY_API = `${API_SERVICE_BASE_URl}/v1/auth/magic-link/verify`

// Counters V2 API
export const GET_COUNTERS_V2 = `${API_SERVICE_BASE_URl}/api/v2/counters`

// Suppliers V2 API
export const GET_SUPPLIERS_V2 = `${API_SERVICE_BASE_URl}/api/v2/suppliers`;

// Designs V2 API
export const GET_MASTER_DESIGN_NAMES_V2 = `${API_SERVICE_BASE_URl}/api/v2/designs/master-design-names`;
export const GET_DESIGN_NAMES_V2 = `${API_SERVICE_BASE_URl}/api/v2/designs/design-names`;

// Branch GS Code Configuration V2 API
export const GET_BRANCH_GSCODES_API = `${API_SERVICE_BASE_URl}/api/v2/branch-gscodes`;
export const TOGGLE_BRANCH_GSCODE_API = `${API_SERVICE_BASE_URl}/api/v2/branch-gscodes/toggle`;
