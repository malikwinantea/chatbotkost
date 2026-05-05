"use client";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { usePathname } from "next/navigation";

export function AOSInit() {
    const pathname = usePathname();

    useEffect(() => {
        if (pathname?.startsWith("/admin")) return;

        AOS.init({
            duration: 800,
            once: true,
            easing: "ease-out",
        });
    }, [pathname]);

    return null;
}
