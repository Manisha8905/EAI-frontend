"use client";
import React, { useEffect, useRef } from "react";
import { deleteUser } from "../../Redux/actions/authActions";
import { useDispatch } from "react-redux";

/* ─── Icons ──────────────────────────────────────────────────── */
const IconX = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconTrash = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/>
    <path d="M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const IconWarning = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

/* ════════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════════ */
const UserDelete = ({ isOpen, onClose, user }) => {
  const dispatch   = useDispatch();
  const overlayRef = useRef(null);

  /* ── original logic — untouched ── */
  const handleDelete = () => {
    dispatch(deleteUser(user?.email));
    onClose();
  };

  /* close on overlay click */
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  /* Escape key */
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape" && isOpen) onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [isOpen]);

  /* lock body scroll */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    /* overlay */
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center
                 bg-black/40 backdrop-blur-[2px]"
    >
      {/* card — same shell as UserAdd / UserEdit */}
      <div
        className="relative bg-white rounded-2xl border border-gray-200 shadow-xl
                   w-[400px] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >

        {/* red top accent line */}
        <div className="h-[3px] w-full bg-gradient-to-r from-red-500 to-red-700 shrink-0" />

        {/* ── header ── */}
        <div className="flex items-start justify-between px-5 pt-4 pb-4
                        border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            {/* red icon badge */}
            <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100
                            flex items-center justify-center text-red-500 shrink-0">
              <IconTrash />
            </div>
            <div>
              <h2 className="font-poppins text-[15px] font-[700] text-[#0a0a0a] leading-tight">
                Delete User
              </h2>
              <p className="font-inter text-[12px] text-gray-500 mt-0.5">
                Permanent account removal
              </p>
            </div>
          </div>

          {/* close button */}
          <button
            type="button"
            onClick={onClose}
            className="mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-lg
                       border border-gray-200 text-gray-400 hover:bg-gray-100
                       hover:text-gray-600 transition shrink-0"
          >
            <IconX />
          </button>
        </div>

        {/* ── body ── */}
        <div className="px-5 py-5 flex flex-col gap-4">

          {/* warning banner */}
          <div className="flex items-start gap-2.5 px-3.5 py-3
                          bg-red-50 border border-red-100 rounded-xl">
            <span className="text-red-500 shrink-0 mt-0.5">
              <IconWarning />
            </span>
            <p className="font-inter text-[12px] text-red-700 leading-relaxed">
              This action is <span className="font-[700]">irreversible</span>. All data
              associated with this account will be permanently deleted.
            </p>
          </div>

          {/* user identity card */}
          {(user?.username || user?.email) && (
            <div className="flex items-center gap-3 px-3.5 py-3
                            bg-gray-50 border border-gray-200 rounded-xl">
              {/* avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400
                              to-violet-500 flex items-center justify-center
                              text-white text-[11px] font-bold shrink-0">
                {(user?.username || user?.email || "?")?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                {user?.username && (
                  <p className="font-inter text-[12px] font-[600] text-[#0a0a0a] truncate">
                    {user.username}
                  </p>
                )}
                {user?.email && (
                  <p className="font-inter text-[11px] text-gray-400 truncate">
                    {user.email}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── footer ── */}
        <div className="shrink-0 flex items-center justify-end gap-2
                        px-5 py-3.5 border-t border-gray-100 bg-gray-50/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[12px] font-[500] text-gray-600
                       border border-gray-200 rounded-lg bg-white
                       hover:border-gray-300 hover:bg-gray-50
                       transition active:scale-[0.97]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-[600]
                       text-white bg-red-600 border border-red-600 rounded-lg
                       hover:bg-red-700 hover:border-red-700
                       active:scale-[0.97] transition shadow-sm"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
            Delete User
          </button>
        </div>

      </div>
    </div>
  );
};

export default UserDelete;