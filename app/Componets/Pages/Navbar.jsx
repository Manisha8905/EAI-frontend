"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../Redux/actions/authActions";
import axiosInstance from "../../Redux/axiosInstance";

const modules = [
  { name: "Sales", path: "/" },
  { name: "Customer Support", path: "/support" },
  { name: "General", path: "/general" },
  { name: "Finance", path: "/finance" },
  { name: "HR", path: "/hr" },
  { name: "Marketing", path: "/marketing" },
  { name: "Legal", path: "/legal" },
  { name: "Tile Finder", path: "/tile-finder" },
];

/* Role → allowed navbar module paths ─────────────────────────────
     null  = all accessible  |  []   = none accessible
──────────────────────────────────────────────────────────────── */
const ROLE_MODULE_PATHS = {
  ADMIN:      [],           // Admin: no module tabs accessible
  SUPERADMIN: null,         // SuperAdmin: all modules accessible
  MANAGER:    null,         // Manager: all modules accessible
  SALES:      ["/"],        // Sales: Sales tab only
  FINANCE:    ["/finance"], // Finance: Finance tab only
  SUPPORT:    ["/support"], // Support: Customer Support tab only
};

/* Sales module is active for its own sub-paths */
const SALES_SUB_PATHS = ["/sales", "/metrics", "/campaign", "/setting", "/user-management", "/mapping", "/navbar", "/reporting"];

const normalizeRole = (role) =>
  (role || "").toUpperCase().replace(/[\s_-]/g, "");

const getInitials = (name) =>
  (name || "U")
    .split(" ")
    .map((w) => w[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { auth } = useSelector((state) => state.auth);

  const [storedRole, setStoredRole] = useState(() => {
    if (typeof window !== "undefined") {
      const r = localStorage.getItem("userRole");
      return r ? r.toUpperCase() : null;
    }
    return null;
  });
  const [storedName] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("userName") || "" : ""
  );
  const [storedRoleDisplay] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("userRoleDisplay") || "" : ""
  );

  /* ── User dropdown ── */
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [meData, setMeData] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role) setStoredRole(role.toUpperCase());
  }, []);

  // Fetch /api/me when dropdown opens
  useEffect(() => {
    if (!dropdownOpen || meData) return;
    axiosInstance.get("/api/me")
      .then((res) => setMeData(res.data))
      .catch(() => {});
  }, [dropdownOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await dispatch(logoutUser());
    router.push("/login");
  };

  const role = storedRole || normalizeRole(auth?.role);
  const allowedPaths = ROLE_MODULE_PATHS[role] ?? null;

  const isAllowed = (path) =>
    allowedPaths === null || allowedPaths.includes(path);

  const meUser = meData?.user ?? meData;
  const displayName = (meUser?.name ?? meUser?.username ?? auth?.name ?? auth?.username ?? storedName) || "User";
  const displayEmail = meUser?.email ?? meUser?.username ?? auth?.email ?? "";
  const displayRoleLabel = (meUser?.role_display ?? meUser?.role ?? auth?.role_display ?? storedRoleDisplay) || "";
  const displayRole = normalizeRole((meUser?.role ?? auth?.role ?? storedRole) || "");
  const initials = getInitials(displayName);


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
              Enterprise AI  Platform
            </h1>
            <p className="font-inter text-[11px] text-gray-500 leading-tight">{auth?.role_display}</p>
          </div>
        </div>

        {/* Center — Module Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {modules.map((module) => {
            const isActive =
              module.name === "Sales"
                ? pathname === "/" || SALES_SUB_PATHS.some((p) => pathname.startsWith(p))
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

          {/* User avatar + dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((o) => !o)}
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all ${dropdownOpen ? "bg-gray-100" : "hover:bg-gray-50"}`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-[700] shadow-sm shrink-0 ring-2 ring-white">
                {initials}
              </div>
              <div className="hidden lg:flex flex-col text-left min-w-0">
                <p className="text-[13px] font-[700] text-gray-800 leading-tight truncate max-w-[120px]">{displayRoleLabel || displayRole || "User"}</p>
                <p className="text-[10px] font-[500] text-gray-400 leading-tight uppercase tracking-wider">{displayRole}</p>
              </div>
            </button>

            {/* Dropdown panel */}
            {dropdownOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-54 bg-white text-slate-900 rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                <div className="px-4 py-3 bg-[#f3f7ff] border-b border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-[700]">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-[700] text-gray-900 truncate">{displayName}</p>
                      <p className="text-[11px] text-blue-600 mt-0.5 uppercase tracking-wide truncate">{displayRoleLabel || displayRole}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col py-1">
                  <Link
                    href="/setting"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm font-[600] text-gray-700 hover:bg-gray-100 transition"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01A1.65 1.65 0 0 0 9 4.09V4a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01c.18.52.45 1 .82 1.45z" />
                    </svg>
                    Settings
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm font-[600] text-red-600 hover:bg-gray-100 transition"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-400">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
