import Cookies from "js-cookie";

export async function getData(url: string, customToken?: string) {
  try {
    const headers: Record<string, string> = {};
    if (typeof window !== "undefined") {
      const token = customToken || Cookies.get("auth_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const response = await fetch(url, { 
      cache: "no-store",
      headers
    });
    
    if (!response.ok) {
      console.log("Network response was not ok, status:", response.status);
      return [];
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("There was an error fetching the data:", error);
    return [];
  }
}

