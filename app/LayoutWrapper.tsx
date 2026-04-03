"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Navbar from "./Componets/Pages/Navbar";
import Sidebar from "./Componets/Pages/Sidebar";

const ADMIN_ONLY_PATHS = ["/user-management"];

const isAdminRole = (role: string) => {
  const r = (role || "").toUpperCase().replace(/[\s_-]/g, "");
  return r === "ADMIN" || r === "SUPERADMIN";
};

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const rawToken = localStorage.getItem("session_token");
    const token = (rawToken || "").trim();
    const isTokenValid = Boolean(token && token !== "undefined" && token !== "null");

    if (!isTokenValid) {
      setIsAuthChecked(true);
      if (pathname !== "/login") {
        router.replace("/login");
      }
      return;
    }

    setIsAuthChecked(true);

    const role = (localStorage.getItem("userRole") || "").toUpperCase().replace(/[\s_-]/g, "");
    // Redirect root "/" to role-appropriate home
    if (pathname === "/") {
      if (isAdminRole(role)) {
        router.replace("/user-management");
      } else if (role === "FINANCE") {
        router.replace("/finance");
      } else if (role === "SUPPORT") {
        router.replace("/support");
      } else {
        router.replace("/sales");
      }
      return;
    }
    // Admin-only path guard — only restrict non-admin from /user-management
    if (pathname.startsWith("/user-management") && !isAdminRole(role)) {
      router.replace("/sales");
    }
  }, [pathname, router]);

  if (!isAuthChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950/80 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  const hideLayout = pathname === "/login";

  if (hideLayout) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>
      <div className="flex" style={{ minHeight: "calc(100vh - 60px)" }}>
        <div className="w-64 shrink-0 sticky top-[60px] h-[calc(100vh-60px)] overflow-hidden">
          <Sidebar />
        </div>
        <div className="flex-1 min-w-0 overflow-x-auto bg-[#f4f5f7]">
          {children}
        </div>
      </div>
    </>
  );
}