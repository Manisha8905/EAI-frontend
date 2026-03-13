"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Componets/Pages/Navbar";
import Sidebar from "./Componets/Pages/Sidebar";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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