"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const modules = [
  { name: "Sales", path: "/" },
  { name: "Customer Support", path: "/support" },
  { name: "General", path: "/general" },
  { name: "Finance", path: "/finance" },
  { name: "HR", path: "/hr" },
  { name: "Marketing", path: "/marketing" },
  { name: "Legal", path: "/legal" },
];

/* Role → allowed navbar module paths ─────────────────────────────
     null  = all accessible  |  []   = none accessible
──────────────────────────────────────────────────────────────── */
const ROLE_MODULE_PATHS = {
  ADMIN:   [],            // Admin: no module tabs accessible
  MANAGER: null,          // Manager: all modules accessible
  SALES:   ["/"],         // Sales: Sales tab only
  FINANCE: ["/finance"],  // Finance: Finance tab only
  SUPPORT: ["/support"],  // Support: Customer Support tab only
};

const normalizeRole = (role) =>
  (role || "").toUpperCase().replace(/[\s_-]/g, "");

export default function Navbar() {
  const pathname = usePathname();
  const { auth, loading, error } = useSelector((state) => state.auth);
  const [storedRole, setStoredRole] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role) setStoredRole(role.toUpperCase());
  }, []);

  const role = storedRole || normalizeRole(auth?.role);
  const allowedPaths = ROLE_MODULE_PATHS[role] ?? null; // null = all accessible

  // A module is accessible if allowedPaths is null (all) or includes its path
  const isAllowed = (path) =>
    allowedPaths === null || allowedPaths.includes(path);


  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 h-[60px]">
        {/* Left — Logo & Title */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-lg font-bold text-sm shadow">
            AI
          </div>
          <div>
            <h1 className="font-poppins text-[14px] font-[700] text-[#0a0a0a] leading-tight">
              Enterprise AI Portal
            </h1>
            <p className="font-inter text-[11px] text-gray-500 leading-tight">{auth?.role_display}</p>
          </div>
        </div>

        {/* Center — Module Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {modules.map((module) => {
            const isActive =
              module.name === "Sales"
                ? pathname === "/" || pathname.startsWith("/sales")
                : pathname.startsWith(module.path);
            const allowed = isAllowed(module.path);

            if (!allowed) {
              // visible but disabled — no navigation, grayed out
              return (
                <span
                  key={module.name}
                  title="Access restricted"
                  className="px-3 py-1.5 rounded-lg text-[13px] font-[500] whitespace-nowrap
                             text-slate-300 cursor-not-allowed select-none"
                >
                  {module.name}
                </span>
              );
            }

            return (
              <Link
                key={module.name}
                href={module.path}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-[500] transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-[600]"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {module.name}
              </Link>
            );
          })}
        </nav>

        {/* Right — user profile */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Notification bell */}
          <button
            type="button"
            className="relative w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
            aria-label="Notifications"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {/* red dot badge */}
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          {/* Divider */}
          <div className="w-px h-5 bg-gray-200" />

          {/* User avatar */}
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow">
              SA
            </div>
            <div className="hidden lg:block">
              <p className="text-[13px] font-[600] text-gray-800 leading-tight">Super Admin</p>
              <p className="text-[11px] text-gray-500 leading-tight">Administrator</p>
            </div>
            <svg
              className="text-gray-400 hidden lg:block"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
}
