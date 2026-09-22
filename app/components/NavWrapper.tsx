"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import HeaderPage from "../(modules)/header/page";
import BottomNavigationBar from "../(modules)/footer/page";

const NavWrapper = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const isAuthOrMobilePage = pathname?.startsWith("/auth") || pathname?.startsWith("/mobile");
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = Cookies.get("auth_token");
        const isMobile = Cookies.get("is_mobile");
        setIsAuthenticated(Boolean(token || isMobile));
    }, [pathname]);

    const showNav = !isAuthOrMobilePage && isAuthenticated;

    return (
        <>
            {showNav && <HeaderPage />}
            {children}
            {showNav && <BottomNavigationBar />}
        </>
    );
};

export default NavWrapper;

