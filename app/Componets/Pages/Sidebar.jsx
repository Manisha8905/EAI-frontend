"use client";

import React, { useEffect, useState } from "react";
import { logoutUser } from "../../Redux/actions/authActions";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import Metrics from "@/app/assets/Images/Metrics.png";
import Reporting from "@/app/assets/Images/Reporting.png";
import Logs from "@/app/assets/Images/Logs.png";
import UserManagement from "@/app/assets/Images/UserManagement.png";
import Logout from "@/app/assets/Images/Logout.png";
import Image from "next/image";

/* ─── CSS-only accordion ──────────────────────────────────────── */
const Accordion = ({ open, children }) => (
  <div
    style={{
      maxHeight: open ? "500px" : "0px",
      overflow: "hidden",
      transition: open
        ? "max-height 350ms cubic-bezier(0.4,0,0.2,1)"
        : "max-height 250ms cubic-bezier(0.4,0,0.2,1)",
    }}
  >
    {children}
  </div>
);

/* ─── Chevron ─────────────────────────────────────────────────── */
const Chevron = ({ open, active }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 16 16"
    fill="none"
    style={{
      transition: "transform 300ms cubic-bezier(0.4,0,0.2,1)",
      transform: open ? "rotate(90deg)" : "rotate(0deg)",
      color: active ? "#2563eb" : "#9ca3af",
      flexShrink: 0,
    }}
  >
    <path
      d="M6 4l4 4-4 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ─── Inline SVG icons ────────────────────────────────────────── */
const EmailIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
const CrmIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const SettingsIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const QuoteIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);
const ScraperIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
const AnalyticsIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

/* ─── Section config ──────────────────────────────────────────── */
const sections = [
  {
    key: "ai",
    label: "AI SDR",
    subtitle: "Automated sales outreach",
    icon: null,
    activeRoutes: ["/metrics", "/reporting", "/campaign"],
    links: [
      { href: "/metrics", label: "Metrics", img: Metrics },
      { href: "/reporting", label: "Reporting", img: Reporting },
      { href: "/campaign", label: "Campaign", img: Logs },
    ],
  },
  {
    key: "quote",
    label: "Quote Automation",
    subtitle: "Quote generation",
    icon: QuoteIcon,
    activeRoutes: ["/quote"],
    links: [
      { href: "/quote/create", label: "Create Quote", icon: QuoteIcon },
      { href: "/quote/history", label: "Quote History", icon: QuoteIcon },
    ],
  },
  {
    key: "scraping",
    label: "Web Scraping",
    subtitle: "Data collection",
    icon: ScraperIcon,
    activeRoutes: ["/scraping"],
    links: [
      { href: "/scraping/jobs", label: "Scraping Jobs", icon: ScraperIcon },
      { href: "/scraping/results", label: "Results", icon: ScraperIcon },
    ],
  },
  {
    key: "analytics",
    label: "Sales Analytics",
    subtitle: "Performance analytics",
    icon: AnalyticsIcon,
    activeRoutes: ["/analytics"],
    links: [
      { href: "/analytics/overview", label: "Overview", icon: AnalyticsIcon },
      { href: "/analytics/forecasts", label: "Forecasts", icon: AnalyticsIcon },
    ],
  },
  // {
  //   key: "setting",
  //   label: "Settings",
  //   subtitle: "App configuration",
  //   icon: SettingsIcon,
  //   activeRoutes: ["/setting"],
  //   links: [
  //     {
  //       href: "/setting",
  //       label: "Settings",
  //       icon: SettingsIcon,
  //     },
  //   ],
  // },
];

/* ─── Role helper ─────────────────────────────────────────────── */
const isAdmin = (role) => {
  const r = (role || "").toLowerCase().replace(/[\s_-]/g, "");
  return r === "admin" || r === "superadmin";
};

/* ─── Role → allowed sidebar section keys (null = all) ───────── */
const ROLE_SECTION_KEYS = {
  SALES: ["ai", "analytics", "setting"],
};

/* ════════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════════ */
const Sidebar = () => {
  const { auth } = useSelector((state) => state.auth);
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();

  const [openSection, setOpenSection] = useState("ai");
  const [storedRole, setStoredRole] = useState(null);
  /* derive admin flag from auth — checks both role and role_display */
  const userIsAdmin = storedRole === "ADMIN" || isAdmin(auth?.role) || isAdmin(auth?.role_display);

  /* derive visible sections based on role */
  const normalizedRole = storedRole || (auth?.role || "").toUpperCase().replace(/[\s_-]/g, "");
  const allowedKeys = ROLE_SECTION_KEYS[normalizedRole] ?? null; // null = all sections
  const visibleSections = allowedKeys
    ? sections.filter((s) => allowedKeys.includes(s.key))
    : sections;
  /* Auto-open section that owns the current route */
  useEffect(() => {
    const matched = sections.find((s) =>
      s.activeRoutes.some((r) => pathname.startsWith(r)),
    );
    if (matched) setOpenSection(matched.key);
  }, [pathname]);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role) {
      setStoredRole(role.toUpperCase());
    }
  }, []);

  const handleSectionClick = (sec) => {
    const isOpen = openSection === sec.key;
    setOpenSection(isOpen ? null : sec.key);
    if (!isOpen && !sec.activeRoutes.some((r) => pathname.startsWith(r))) {
      router.push(sec.links[0].href);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem("userRole");
    await dispatch(logoutUser());
    router.push("/login");
  };

  return (
    <div className="h-full w-64 bg-white flex flex-col border-r border-gray-200">
      {/* ── Hover / active keyframes ── */}
      <style>{`
        @keyframes sidebarPop {
          0%   { transform: scale(1); }
          40%  { transform: scale(0.97); }
          80%  { transform: scale(1.01); }
          100% { transform: scale(1); }
        }
        @keyframes slideInLink {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .sb-section-btn  { transition: background 0.18s ease, box-shadow 0.18s ease, transform 0.12s ease; }
        .sb-section-btn:hover  { box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .sb-section-btn:active { animation: sidebarPop 0.25s ease; }
        .sb-link  { transition: background 0.15s ease, transform 0.15s ease, color 0.15s ease; }
        .sb-link:hover  { transform: translateX(3px); }
        .sb-link:active { transform: translateX(3px) scale(0.98); }
        .sb-icon  { transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), color 0.15s ease; }
        .sb-section-btn:hover .sb-icon  { transform: scale(1.18) rotate(-6deg); }
        .sb-section-btn.is-active .sb-icon { transform: scale(1.12); }
        .sb-logout { transition: background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease, transform 0.12s ease; }
        .sb-logout:hover { box-shadow: 0 2px 10px rgba(239,68,68,0.15); }
        .sb-logout:active { transform: scale(0.97); }
        .sb-logout:hover .logout-icon { transform: rotate(-12deg) scale(1.15); }
        .logout-icon { transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1); }
        .sb-usermgmt { transition: background 0.15s ease, color 0.15s ease, transform 0.15s ease; }
        .sb-usermgmt:hover { transform: translateX(2px); }
        .sb-usermgmt:active { transform: translateX(2px) scale(0.98); }
        .sb-active-glow { box-shadow: inset 3px 0 0 #2563eb, 0 2px 10px rgba(37,99,235,0.10); }
      `}</style>

      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100">
        <h2 className="font-poppins text-[14px] font-[700] text-[#0a0a0a]">
          Sales
        </h2>
        <p className="font-inter text-[12px] text-gray-500 mt-0.5">
          Available applications
        </p>
      </div>

      {/* ── Nav — hidden entirely for admin ── */}
      {!userIsAdmin && (
        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {visibleSections.map((sec) => {
            const isParentActive = sec.activeRoutes.some((r) =>
              pathname.startsWith(r),
            );
            const isOpen = openSection === sec.key;
            const SIcon = sec.icon;
            if (!storedRole && !auth) return null;

            return (
              <div key={sec.key}>
                <button
                  type="button"
                  onClick={() => handleSectionClick(sec)}
                  className={`sb-section-btn w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left ${
                    isParentActive
                      ? "is-active bg-blue-50 sb-active-glow"
                      : "hover:bg-blue-50/40 border-l-4 border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {SIcon && (
                      <span
                        className={`sb-icon ${
                          isParentActive ? "text-blue-600" : "text-gray-400"
                        }`}
                      >
                        <SIcon />
                      </span>
                    )}
                    <div className="min-w-0">
                      <p
                        className={`text-[13px] font-[600] truncate ${isParentActive ? "text-blue-600" : "text-gray-700"}`}
                      >
                        {sec.label}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate">
                        {sec.subtitle}
                      </p>
                    </div>
                  </div>
                  <Chevron open={isOpen} active={isParentActive} />
                </button>

                <Accordion open={isOpen}>
                  <div className="ml-3 mt-0.5 mb-1 space-y-0.5 border-l-2 border-gray-100 pl-3">
                    {sec.links.map((link) => {
                      const linkActive = pathname.startsWith(link.href);
                      const LIcon = link.icon;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={`sb-link flex items-center gap-2 px-2 py-2 rounded-md text-[13px] ${
                            linkActive
                              ? "bg-blue-50 text-blue-600 font-[600] shadow-sm"
                              : "text-gray-600 hover:bg-blue-50/50 hover:text-blue-700"
                          }`}
                        >
                          {link.img ? (
                            <Image
                              src={link.img}
                              alt={link.label}
                              width={14}
                              height={14}
                            />
                          ) : LIcon ? (
                            <span
                              className={`sb-icon ${
                                linkActive ? "text-blue-500" : "text-gray-400"
                              }`}
                            >
                              <LIcon />
                            </span>
                          ) : null}
                          {link.label}
                        </Link>
                      );
                    })}
                  </div>
                </Accordion>
              </div>
            );
          })}
        </nav>
      )}

      {/* spacer for admin so bottom section still sits at the bottom */}
      {userIsAdmin && <div className="flex-1" />}

      {/* ── Bottom ── */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-0.5">
        {/* User Management — always visible */}
        <Link
          href="/user-management"
          className={`sb-usermgmt flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-[500] ${
            pathname === "/user-management"
              ? "bg-blue-50 text-blue-600 font-[600] shadow-sm"
              : "text-gray-600 hover:bg-blue-50/50 hover:text-blue-700"
          }`}
        >
          <Image
            src={UserManagement}
            alt="User Management"
            width={14}
            height={14}
          />
          User Management
        </Link>

        {/* Logout — always visible */}
        <button
          type="button"
          onClick={handleLogout}
          className="sb-logout w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-[500] text-gray-600 hover:bg-red-50 hover:text-red-600"
        >
          <span className="logout-icon">
            <Image src={Logout} alt="Logout" width={14} height={14} />
          </span>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
