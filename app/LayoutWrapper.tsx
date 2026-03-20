"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
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

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "";
    if (ADMIN_ONLY_PATHS.some((p) => pathname.startsWith(p)) && !isAdminRole(role)) {
      router.replace("/");
    }
  }, [pathname, router]);

  const hideLayout = pathname === "/login";

  if (hideLayout) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
<div className="flex min-h-screen overflow-hidden">
          <div className="w-64 shrink-0">
          <Sidebar />
        </div>

        <div className="flex-1 min-w-0 overflow-x-auto bg-[#f4f5f7]">
          {children}
        </div>
      </div>
    </>
  );
}