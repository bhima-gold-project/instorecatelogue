import Cookies from "js-cookie";

export interface DecodedToken {
  loginId?: number | string;
  userName?: string;
  branchCode?: string;
  HomeBranch?: string;
  role?: string;
  deviceId?: string;
  device_id?: string;
  MobileDeviceID?: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

/**
 * Safely decodes a JWT token without verifying signature on client side
 */
export function decodeJwtToken(token?: string | null): DecodedToken | null {
  if (!token || typeof token !== "string") return null;
  try {
    const cleanToken = token.trim();
    const parts = cleanToken.split(".");
    if (parts.length !== 3) return null;

    let base64Url = parts[1];
    let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    // Standard Base64 requires length to be a multiple of 4. Add missing '=' padding.
    const pad = base64.length % 4;
    if (pad === 2) {
      base64 += "==";
    } else if (pad === 3) {
      base64 += "=";
    } else if (pad === 1) {
      return null;
    }

    let jsonPayload: string;
    if (typeof window !== "undefined" && typeof window.atob === "function") {
      const decodedBinary = window.atob(base64);
      jsonPayload = decodeURIComponent(
        decodedBinary
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
    } else {
      jsonPayload = Buffer.from(base64, "base64").toString("utf-8");
    }

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode JWT token:", error);
    return null;
  }
}

/**
 * Gets active JWT token string from cookies (main site)
 */
export function getAuthToken(): string | null {
  return Cookies.get("auth_token") || null;
}

/**
 * Gets mobile admin JWT token from cookies
 */
export function getMobileAuthToken(): string | null {
  return Cookies.get("mobile_auth_token") || null;
}

/**
 * Extracts Home Branch code directly from JWT token
 */
export function getHomeBranchFromToken(): string | null {
  const token = getAuthToken();
  if (!token) return null;
  const decoded = decodeJwtToken(token);
  return decoded?.branchCode || decoded?.HomeBranch || null;
}

/**
 * Extracts Login ID directly from JWT token
 */
export function getLoginIdFromToken(): number | string | null {
  const token = getAuthToken();
  if (!token) return null;
  const decoded = decodeJwtToken(token);
  return decoded?.loginId || decoded?.LoginID || null;
}

/**
 * Extracts User Name directly from JWT token
 */
export function getUserNameFromToken(): string | null {
  const token = getAuthToken();
  if (!token) return null;
  const decoded = decodeJwtToken(token);
  return decoded?.userName || decoded?.UserName || null;
}

/**
 * Extracts User Role directly from JWT token
 */
export function getRoleFromToken(): string | null {
  const token = getAuthToken() || getMobileAuthToken();
  if (!token) return null;
  const decoded = decodeJwtToken(token);
  return decoded?.role || decoded?.RoleName || decoded?.roleCode || decoded?.RoleCode || null;
}

/**
 * Checks if the currently logged-in user has the 'CPC User' role
 */
export function isCpcUser(): boolean {
  const token = getAuthToken() || getMobileAuthToken();
  let role = "";
  let roleId: number | undefined;

  if (token) {
    const decoded = decodeJwtToken(token);
    role = String(decoded?.role || decoded?.RoleName || decoded?.roleCode || decoded?.RoleCode || "").toLowerCase().trim();
    roleId = Number(decoded?.roleId || decoded?.RoleID);
  }

  if (!role && typeof window !== "undefined") {
    role = String(Cookies.get("role") || "").toLowerCase().trim();
  }

  return role === "cpc user" || role === "cpc_user" || role === "cpc" || roleId === 3;
}

/**
 * Extracts the full user profile directly from JWT token
 */
export function getUserFromToken(): DecodedToken | null {
  const token = getAuthToken();
  if (!token) return null;
  return decodeJwtToken(token);
}

/**
 * Saves auth session - Stores ONLY the JWT token in cookies and cleans up any individual cookies
 */
export function saveAuthSession(token: string, fallbackData?: any) {
  // Store ONLY the JWT token in cookies
  Cookies.set("auth_token", token, { expires: 7, path: "/" });

  // Remove individual cookies so they are never stored in cookies
  Cookies.remove("homebranch", { path: "/" });
  Cookies.remove("_si_login_id", { path: "/" });
  Cookies.remove("role", { path: "/" });
  Cookies.remove("username", { path: "/" });

  const decoded = decodeJwtToken(token);
  const homeBranch = decoded?.branchCode || decoded?.HomeBranch || decoded?.branch_code || fallbackData?.HomeBranch;
  const loginId = decoded?.loginId || decoded?.LoginID || fallbackData?.LoginID;
  const role = decoded?.role || decoded?.RoleName || fallbackData?.RoleName;
  const userName = decoded?.userName || decoded?.UserName || fallbackData?.UserName;

  return { homeBranch, loginId, role, userName };
}

/**
 * Clears authentication token and session on logout
 */
export function clearAuthSession() {
  Cookies.remove("auth_token", { path: "/" });
  Cookies.remove("mobile_auth_token", { path: "/" });
  Cookies.remove("is_mobile", { path: "/" });
  Cookies.remove("homebranch", { path: "/" });
  Cookies.remove("_si_login_id", { path: "/" });
  Cookies.remove("role", { path: "/" });
  Cookies.remove("username", { path: "/" });
}
