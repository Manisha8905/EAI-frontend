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
      <div className="flex h-screen">
        <div className="w-64 bg-gray-800 text-white">
          <Sidebar />
        </div>

        <div className="flex-1 bg-gray-100">
          {children}
        </div>
      </div>
    </>
  );
}