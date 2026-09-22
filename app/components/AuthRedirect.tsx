"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAuthToken } from "../function/authUtils";
import Cookies from "js-cookie";

export default function AuthRedirect() {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const token = getAuthToken();
        const isMobile = Cookies.get("is_mobile");

        if (!token && !isMobile && pathname !== "/auth/login" && !pathname.startsWith("/mobile")) {
            router.push("/auth/login");
        }
    }, [router, pathname]);

    return null;
}