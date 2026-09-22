import Cookies from "js-cookie";

export async function PostData(url: string, body: any, customToken?: string): Promise<any | null> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (typeof window !== "undefined") {
      const token = customToken || Cookies.get("auth_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.log("Network response was not ok, status:", response.status);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("There was an error fetching the data:", error);
    return null;
  }
}

export async function PutData(url: string, body: any, customToken?: string): Promise<any | null> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (typeof window !== "undefined") {
      const token = customToken || Cookies.get("auth_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.log("Network response was not ok, status:", response.status);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("There was an error updating the data:", error);
    return null;
  }
}

export async function DeleteData(url: string, customToken?: string): Promise<any | null> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (typeof window !== "undefined") {
      const token = customToken || Cookies.get("auth_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const response = await fetch(url, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      console.log("Network response was not ok, status:", response.status);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("There was an error deleting the data:", error);
    return null;
  }
}
