"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import UserAdd    from "./UserAdd";
import UserDelete from "./UserDelete";
import UserEdit   from "./UserEdit";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../../Redux/actions/authActions";
import abuser     from "@/app/assets/Images/abuser.png";
import edit       from "@/app/assets/Images/edit.png";
import deleteuser from "@/app/assets/Images/deleteuser.png";
import Spinner    from "../Spinner";
import Image      from "next/image";

/* ─── Role badge colours ─────────────────────────────────────── */
const roleBadgeClass = (role) => {
  const r = (role || "").toLowerCase();

  if (r === "admin")
    return "bg-blue-50 text-blue-700 border border-blue-200";

  if (r === "support")
    return "bg-purple-50 text-purple-700 border border-purple-200";

  if (r === "manager")
    return "bg-amber-50 text-amber-700 border border-amber-200";

  if (r === "sales")
    return "bg-green-50 text-green-700 border border-green-200";

  if (r === "finance")
    return "bg-pink-50 text-pink-700 border border-pink-200";

  return "bg-gray-100 text-gray-600 border border-gray-200";
};

/* ─── Constants ──────────────────────────────────────────────── */
const ROWS_PER_PAGE = 8;
const ROLE_OPTIONS  = [
  "All Roles",
  "ADMIN",
  "SUPPORT",
  "MANAGER",
  "SALES",
  "FINANCE"
];
/* ─── Micro icons ────────────────────────────────────────────── */
const IconSearch = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconX = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconChevronDown = ({ open }) => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
       style={{ transition: "transform 150ms", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const IconChevronLeft = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const IconChevronRight = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const IconPlus = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconFunnel = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);
const IconCheck = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconEmptyUsers = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

/* ════════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════════ */
const Usertable = () => {
  const dispatch = useDispatch();
  const { admin, deleteSuccess, updateSuccess, createSuccess, loading } =
    useSelector((state) => state.admin);

  /* modal state */
  const [isAddModalOpen,  setIsAddModalOpen]  = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser,    setSelectedUser]    = useState(null);

  /* filter state */
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter,  setRoleFilter]  = useState("All Roles");
  const [dropOpen,    setDropOpen]    = useState(false);
  const dropRef = useRef(null);

  /* pagination */
  const [currentPage, setCurrentPage] = useState(1);

  /* close dropdown on outside click */
  useEffect(() => {
    const fn = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  /* fetch */
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch, deleteSuccess, updateSuccess, createSuccess]);

  /* reset page when filters change */
  useEffect(() => { setCurrentPage(1); }, [searchQuery, roleFilter]);

  const handleEditClick   = (user) => { setSelectedUser(user); setIsEditModalOpen(true); };
  const handleDeleteClick = (user) => { setSelectedUser(user); setDeleteModalOpen(true); };

  const toCapitalize = (text) =>
    text ? text.replace(/\b\w/g, (c) => c.toUpperCase()) : "";
  

  const allUsers = admin?.users ?? [];

  /* filtered list */
  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const r = roleFilter === "All Roles" ? "" : roleFilter.toLowerCase();
    return allUsers.filter((u) => {
      const okSearch =
        !q ||
        (u.username || "").toLowerCase().includes(q) ||
        (u.email    || "").toLowerCase().includes(q) ||
        (u.role     || "").toLowerCase().includes(q);
      const okRole = !r || (u.role || "").toLowerCase() === r;
      return okSearch && okRole;
    });
  }, [allUsers, searchQuery, roleFilter]);

  /* pagination */
  const totalPages  = Math.max(1, Math.ceil(filteredUsers.length / ROWS_PER_PAGE));
  const safePage    = Math.min(currentPage, totalPages);
  const pageStart   = (safePage - 1) * ROWS_PER_PAGE;
  const pageUsers   = filteredUsers.slice(pageStart, pageStart + ROWS_PER_PAGE);
  const goTo        = (p) => setCurrentPage(Math.max(1, Math.min(totalPages, p)));

  /* visible page numbers — first, last, ±1 around current, with … gaps */
  const allPageNums    = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePageNums = allPageNums.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1
  );

  const hasFilters = searchQuery.trim() !== "" || roleFilter !== "All Roles";

  /* ─── render ─────────────────────────────────────────────── */
  return (
    <div className="p-6 bg-[#f4f5f7]  min-h-screen overflow-hidden">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        {/* ══ Header ══ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-poppins text-[15px] font-[700] text-[#0a0a0a] leading-tight">
              User Management
            </h2>
            <p className="font-inter text-[12px] text-gray-500 mt-0.5">
              Manage accounts and role assignments
            </p>
          </div>

          {/* ── Controls ── */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Search */}
            <div className="relative">
              <span className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-gray-400">
                <IconSearch />
              </span>
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                /* inline style ensures typed text is always visible regardless of
                   any global CSS reset or Tailwind base-layer colour override    */
                style={{ color: "#111827", caretColor: "#111827" }}
                className="pl-7 pr-7 py-1.5 text-[12px] border border-gray-200 rounded-lg
                           bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30
                           focus:border-blue-400 focus:bg-white transition w-[190px]
                           placeholder:text-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  title="Clear search"
                  className="absolute inset-y-0 right-2 flex items-center justify-center
                             text-gray-400 hover:text-gray-700 transition"
                >
                  <IconX />
                </button>
              )}
            </div>

            {/* Role dropdown */}
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setDropOpen((o) => !o)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-[500]
                            border rounded-lg transition whitespace-nowrap
                            ${roleFilter !== "All Roles"
                              ? "border-blue-400 bg-blue-50 text-blue-700"
                              : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-white hover:border-gray-300"
                            }`}
              >
                <IconFunnel />
                {roleFilter === "All Roles" ? "Role" : roleFilter}
                <IconChevronDown open={dropOpen} />
              </button>

              {dropOpen && (
                <div className="absolute right-0 top-[calc(100%+5px)] w-[148px] z-50
                                bg-white border border-gray-200 rounded-xl shadow-lg py-1 overflow-hidden">
                  {ROLE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setRoleFilter(opt); setDropOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-1.5
                                  text-[12px] transition
                                  ${roleFilter === opt
                                    ? "bg-blue-50 text-blue-700 font-[600]"
                                    : "text-gray-600 hover:bg-gray-50 font-[400]"}`}
                    >
                      {opt}
                      {roleFilter === opt && <IconCheck />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Add User */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 text-[12px] bg-black text-white
                         font-[600] px-3 py-1.5 rounded-lg hover:bg-gray-800
                         active:scale-[0.97] transition whitespace-nowrap shadow-sm"
            >
              <IconPlus />
              Add User
            </button>
          </div>
        </div>

        {/* ══ Body ══ */}
        {loading ? (
          <div className="py-14 flex justify-center">
            <Spinner loading={loading} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed">
              <colgroup>
                <col className="w-[22%]" />
                <col className="w-[28%]" />
                <col className="w-[14%]" />
                <col className="w-[18%]" />
                <col className="w-[12%]" />
              </colgroup>

              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Name", "Email", "Role", "Created", "Actions"].map((h, i) => (
                    <th
                      key={h}
                      className={`px-4 py-2.5 text-[11px] font-[600] text-gray-500
                                  uppercase tracking-wide
                                  ${i === 4 ? "text-center" : "text-left"}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {pageUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <IconEmptyUsers />
                        <p className="text-[12px] font-medium text-gray-500">
                          {hasFilters ? "No users match your filters" : "No users found"}
                        </p>
                        {hasFilters && (
                          <button
                            onClick={() => { setSearchQuery(""); setRoleFilter("All Roles"); }}
                            className="text-[11px] text-blue-500 hover:underline mt-0.5"
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/70 transition-colors">

                      {/* Name */}
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400
                                          to-violet-500 flex items-center justify-center
                                          text-white text-[9px] font-bold shrink-0">
                            {(user.username || "?")?.[0]?.toUpperCase()}
                          </div>
                          <span className="text-[12px] font-[500] text-[#0a0a0a] truncate">
                            {toCapitalize(user.username)}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-2.5 text-[12px] text-gray-600 truncate max-w-0">
                        <span className="block truncate">{user.email}</span>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-2.5">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-[600]
                                         rounded-full leading-tight ${roleBadgeClass(user.role)}`}>
                          {toCapitalize(user.role)}
                        </span>
                      </td>

                      {/* Created */}
                      <td className="px-4 py-2.5 text-[12px] text-gray-500 whitespace-nowrap">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString("en-GB", {
                              day: "numeric", month: "short", year: "numeric",
                            })
                          : "—"}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleEditClick(user)}
                            title="Edit user"
                            className="inline-flex items-center justify-center w-7 h-7 rounded-md
                                       border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition"
                          >
                            <Image src={edit} alt="Edit" width={12} height={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user)}
                            title="Delete user"
                            className="inline-flex items-center justify-center w-7 h-7 rounded-md
                                       border border-gray-200 hover:bg-red-50 hover:border-red-200 transition"
                          >
                            <Image src={deleteuser} alt="Delete" width={12} height={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* ══ Footer — count + pagination ══ */}
            {filteredUsers.length > 0 && (
              <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50
                              flex items-center justify-between gap-3 flex-wrap">

                {/* count */}
                <span className="text-[11px] text-gray-400 select-none">
                  Showing&nbsp;{pageStart + 1}–{pageStart + pageUsers.length}&nbsp;of&nbsp;
                  {filteredUsers.length}&nbsp;user{filteredUsers.length !== 1 ? "s" : ""}
                  {filteredUsers.length !== allUsers.length && (
                    <span className="ml-1 text-gray-300">(filtered from {allUsers.length})</span>
                  )}
                </span>

                {/* page controls — only when >1 page */}
                {totalPages > 1 && (
                  <div className="flex items-center gap-1 select-none">

                    {/* ← prev */}
                    <button
                      onClick={() => goTo(safePage - 1)}
                      disabled={safePage === 1}
                      className="inline-flex items-center justify-center w-6 h-6 rounded-md
                                 border border-gray-200 text-gray-500 hover:bg-white
                                 hover:border-gray-300 disabled:opacity-30
                                 disabled:pointer-events-none transition"
                    >
                      <IconChevronLeft />
                    </button>

                    {/* numbered pages */}
                    {visiblePageNums.map((p, idx, arr) => (
                      <React.Fragment key={p}>
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <span className="text-[11px] text-gray-400 px-0.5">…</span>
                        )}
                        <button
                          onClick={() => goTo(p)}
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-md
                                     border text-[11px] font-[500] transition
                                     ${safePage === p
                                       ? "bg-black text-white border-black"
                                       : "border-gray-200 text-gray-600 hover:bg-white hover:border-gray-300"}`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    ))}

                    {/* next → */}
                    <button
                      onClick={() => goTo(safePage + 1)}
                      disabled={safePage === totalPages}
                      className="inline-flex items-center justify-center w-6 h-6 rounded-md
                                 border border-gray-200 text-gray-500 hover:bg-white
                                 hover:border-gray-300 disabled:opacity-30
                                 disabled:pointer-events-none transition"
                    >
                      <IconChevronRight />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <UserAdd    isOpen={isAddModalOpen}  onClose={() => setIsAddModalOpen(false)} />
      <UserEdit   isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} user={selectedUser} />
      <UserDelete isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} user={selectedUser} />
    </div>
  );
};

export default Usertable;