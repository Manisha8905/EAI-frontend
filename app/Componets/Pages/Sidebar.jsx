"use client";

import React, { useEffect } from "react";
import { logoutUser } from "../../Redux/actions/authActions";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import Link from "next/link";

const Sidebar = () => {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const aiSdrRoutes = ["/metrics", "/reporting", "/campaign"];
  const isParentActive = aiSdrRoutes.includes(pathname);

  useEffect(() => {
    if (isParentActive) {
      setOpen(true);
    }
  }, [pathname]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push("/login");
  };
  return (
    <>
      {" "}
      <div className="h-screen w-64 bg-white text-gray-800 p-5 border-r  border-gray-200">
        <h2 className="font-poppins text-[15px] font-[600] text-[#0a0a0a]">
          Sales
        </h2>
        <p className="font-inter text-[13px] text-gray-600 mb-4">
          Available applications
        </p>

        {/* Parent Menu */}
        <div
          onClick={() => setOpen(!open)}
          className={`flex justify-between items-center px-3 py-2 rounded-lg cursor-pointer transition
        ${
          isParentActive
            ? "bg-blue-50 border-l-4 border-blue-600"
            : "hover:bg-gray-100"
        }`}
        >
          <div>
            <p
              className={`font-[400] text-sm ${
                isParentActive ? "text-blue-600" : "text-gray-700"
              }`}
            >
              AI SDR
            </p>

            <p className="text-xs text-slate-500 mt-0.5">
              Automated sales outreach
            </p>
          </div>

          <span>{open ? "⌄" : "›"}</span>
        </div>

        {/* Submenu */}
        {open && (
          <div className="ml-4 mt-2 space-y-2">
            <Link
              href="/metrics"
              className={`block p-2 rounded-md text-sm transition
            ${
              pathname === "/metrics"
                ? "bg-blue-50/50 text-blue-600 font-[400]"
                : "hover:bg-gray-100 text-gray-700"
            }`}
            >
              {/* 📊 Metrics */}
              Metrics
            </Link>

            <Link
              href="/reporting"
              className={`block p-2 rounded-md text-sm transition
            ${
              pathname === "/reporting"
                ? "bg-blue-50/50 text-blue-600 font-[400]"
                : "hover:bg-gray-100 text-gray-700"
            }`}
            >
              {/* 📄 Reporting */}
              Reporting
            </Link>

            <Link
              href="/campaign"
              className={`block p-2 rounded-md text-sm transition
            ${
              pathname === "/campaign"
                ? "bg-blue-50/50 text-blue-600 font-[400]"
                : "hover:bg-gray-100 text-gray-700"
            }`}
            >
              {/* 📄 Campaign */}
              Campaign
            </Link>
          </div>
        )}

        {/* Other Menu */}
        {/* <div className="mt-6 space-y-4">
        <div className="flex justify-between cursor-pointer hover:text-blue-600">
          <span>Quote Automation</span>
          <span>›</span>
        </div>

        <div className="flex justify-between cursor-pointer hover:text-blue-600">
          <span>Web Scraping</span>
          <span>›</span>
        </div>
      </div> */}

        {/* Bottom Section */}
        <div className="border-t border-gray-300 pt-6 mt-6 space-y-3">
          <Link
            href="/user-management"
            className={`block font-[400] text-sm ${
              pathname === "/user-management"
                ? "text-gray-700 "
                : "hover:text-blue-600 "
            }`}
          >
            User Management
          </Link>

          <Link
            href="/setting"
            className={`block font-[400] text-sm ${
              pathname === "/setting" ? "text-gray-700" : "hover:text-blue-600"
            }`}
          >
            Settings
          </Link>
          {/* <Link
          href="/login"
          className={`block font-[400] text-sm ${
            pathname === "/login"
              ? "text-gray-700"
              : "hover:text-blue-600"
          }`}
        >
          Logout
        </Link> */}

          <button
            onClick={handleLogout}
            className="block font-[400] text-sm text-gray-700"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
