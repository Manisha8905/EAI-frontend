"use client";
import React, { useEffect, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { editUser, getSingleUser } from "../../Redux/actions/authActions";

/* ─── Role options ───────────────────────────────────────────── */
const roleOptions = [
  { label: "Manager",          value: "MANAGER", color: "amber"  },
  { label: "Admin",            value: "ADMIN",   color: "blue"   },
  { label: "Sales",            value: "SALES",   color: "violet" },
  { label: "Finance",          value: "FINANCE", color: "green"  },
  { label: "Customer Support", value: "SUPPORT", color: "gray"   },
];

const roleColorMap = {
  amber:  { pill: "bg-amber-50 text-amber-700 border-amber-200",    ring: "ring-amber-400/40",  dot: "bg-amber-400"  },
  blue:   { pill: "bg-blue-50 text-blue-700 border-blue-200",       ring: "ring-blue-400/40",   dot: "bg-blue-500"   },
  violet: { pill: "bg-purple-50 text-purple-700 border-purple-200", ring: "ring-purple-400/40", dot: "bg-violet-500" },
  green:  { pill: "bg-green-50 text-green-700 border-green-200",    ring: "ring-green-400/40",  dot: "bg-green-500"  },
  gray:   { pill: "bg-gray-100 text-gray-600 border-gray-200",      ring: "ring-gray-400/40",   dot: "bg-gray-400"   },
};

/* ─── Validation ─────────────────────────────────────────────── */
const validationSchema = Yup.object({
  name:     Yup.string().required("Name is required"),
  email:    Yup.string().email("Invalid email format").required("Email is required"),
  password: Yup.string(),
  role:     Yup.string().required("Please select a role"),
});

/* ─── Icons ──────────────────────────────────────────────────── */
const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconUser = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconMail = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const IconLock = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconCheck = () => (
  <svg width="8" height="8" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

/* ════════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════════ */
const UserEdit = ({ isOpen, onClose, user }) => {
  const dispatch   = useDispatch();
  const overlayRef = useRef(null);

  const { singleUser } = useSelector((state) => state.admin);

  /* ── ALL hooks BEFORE any early return ─────────────────────── */

  useEffect(() => {
    if (isOpen && user?.id) dispatch(getSingleUser(user.id));
  }, [dispatch, isOpen, user]);

  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape" && isOpen) onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const formik = useFormik({
    initialValues: {
      name:     singleUser?.username || "",
      email:    singleUser?.email    || "",
      password: "",
      role:     singleUser?.role     || "",
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      const updatedData = {
        user_id:  user.id,
        username: values.name,
        email:    values.email,
        role:     values.role,
      };
      if (values.password) updatedData.password = values.password;
      await dispatch(editUser(updatedData));
      onClose();
    },
  });

  /* ── Early returns AFTER all hooks ─────────────────────────── */
  if (!isOpen) return null;
  if (!singleUser) return null;

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const err = (name) =>
    formik.touched[name] && formik.errors[name] ? formik.errors[name] : null;

  /* ─── render ─────────────────────────────────────────────── */
  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center
                 bg-black/40 backdrop-blur-[2px]"
    >
      <div
        className="relative bg-white rounded-2xl border border-gray-200 shadow-xl
                   w-[440px] flex flex-col overflow-auto"
        style={{ maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── header ── */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4
                        border-b border-gray-100 shrink-0">
          <div>
            <h2 className="font-poppins text-[15px] font-[700] text-[#0a0a0a] leading-tight">
              Edit User
            </h2>
            <p className="font-inter text-[12px] text-gray-500 mt-0.5">
              Update user information and roles
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-lg
                       border border-gray-200 text-gray-400 hover:bg-gray-100
                       hover:text-gray-700 transition shrink-0"
          >
            <IconX />
          </button>
        </div>

        {/* ── body — no overflow scroll needed now role is compact ── */}
        <div className="px-5 py-4">
          <form id="user-edit-form" onSubmit={formik.handleSubmit} noValidate>

            {/* text fields */}
            {[
              { id: "name",     label: "User Name", type: "text",     icon: <IconUser />, placeholder: "e.g. John Doe"              },
              { id: "email",    label: "Email",     type: "email",    icon: <IconMail />, placeholder: "e.g. john@company.com"      },
              { id: "password", label: "Password",  type: "password", icon: <IconLock />, placeholder: "Leave blank to keep current" },
            ].map(({ id, label, type, icon, placeholder }) => (
              <div key={id} className="mb-3.5">
                <label htmlFor={id}
                       className="block text-[12px] font-[600] text-[#0a0a0a] mb-1.5">
                  {label}
                  {id === "password" && (
                    <span className="ml-1.5 text-[10px] font-[400] text-gray-400">(optional)</span>
                  )}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-2.5 flex items-center
                                   pointer-events-none text-gray-400">
                    {icon}
                  </span>
                  <input
                    id={id} name={id} type={type} placeholder={placeholder}
                    style={{ color: "#111827", caretColor: "#111827" }}
                    className={`w-full pl-8 pr-3 py-2 text-[12px] rounded-lg border
                                bg-gray-50 outline-none transition-all placeholder:text-gray-400
                                focus:bg-white focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400
                                ${err(id)
                                  ? "border-red-300 bg-red-50/30 focus:ring-red-400/20 focus:border-red-400"
                                  : "border-gray-200"}`}
                    value={formik.values[id]}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
                {err(id) && (
                  <p className="mt-1 text-[11px] text-red-500 font-[500]">{err(id)}</p>
                )}
              </div>
            ))}

            {/* ── Role — compact pill chips, wraps to 2 rows max ── */}
            <div className="mb-1">
              <label className="block text-[12px] font-[600] text-[#0a0a0a] mb-2">
                Role
              </label>

              <div className="flex flex-wrap gap-2">
                {roleOptions.map((role) => {
                  const selected = formik.values.role === role.value;
                  const c        = roleColorMap[role.color];
                  return (
                    <label
                      key={role.value}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5
                                  rounded-full border cursor-pointer select-none
                                  transition-all text-[11px] font-[600] whitespace-nowrap
                                  ${selected
                                    ? `${c.pill} ring-2 ${c.ring} shadow-sm`
                                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50"}`}
                    >
                      <input
                        type="radio"
                        className="sr-only"
                        name="role"
                        value={role.value}
                        checked={selected}
                        onChange={() => formik.setFieldValue("role", role.value)}
                      />
                      {/* coloured dot */}
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0
                                        ${selected ? c.dot : "bg-gray-300"}`} />
                      {role.label}
                      {/* tick when selected */}
                      {selected && (
                        <span className="shrink-0 ml-0.5"><IconCheck /></span>
                      )}
                    </label>
                  );
                })}
              </div>

              {err("role") && (
                <p className="mt-1.5 text-[11px] text-red-500 font-[500]">{err("role")}</p>
              )}
            </div>

          </form>
        </div>

        {/* ── sticky footer ── */}
        <div className="shrink-0 flex items-center justify-end gap-2
                        px-5 py-3.5 border-t border-gray-100 bg-gray-50/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[12px] font-[500] text-gray-600
                       border border-gray-200 rounded-lg hover:bg-white
                       hover:border-gray-300 transition active:scale-[0.97]"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="user-edit-form"
            className="px-4 py-2 text-[12px] font-[600] bg-black text-white
                       rounded-lg hover:bg-gray-800 active:bg-gray-900
                       active:scale-[0.97] transition shadow-sm"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserEdit;