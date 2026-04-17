"use client";
import React, { useEffect, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

/* ─── Validation ─────────────────────────────────────────────── */
const validationSchema = Yup.object({
  name:          Yup.string().required("Name is required"),
  email:         Yup.string().email("Invalid email format").required("Email is required"),
  contactNumber: Yup.string().required("Contact number is required").matches(/^[0-9+\-\s()]*$/, "Invalid phone format"),
  company:       Yup.string().required("Company is required"),
  title:         Yup.string().required("Title is required"),
});

/* ─── Hide scrollbar styles ─────────────────────────────────── */
const scrollableStyleSheet = `
  .lead-form-scrollable {
    scrollbar-width: none;  /* Firefox */
    -ms-overflow-style: none;  /* IE and Edge */
  }
  .lead-form-scrollable::-webkit-scrollbar {
    display: none;  /* Chrome, Safari and Opera */
  }
`;

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

const IconPhone = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const IconBuilding = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="2" width="18" height="20" rx="2" ry="2"/><line x1="9" y1="2" x2="9" y2="22"/><line x1="15" y1="2" x2="15" y2="22"/><line x1="3" y1="5" x2="21" y2="5"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="3" y1="15" x2="21" y2="15"/>
  </svg>
);

const IconBriefcase = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
  </svg>
);

/* ════════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════════ */
const LeadAdd = ({ isOpen, onClose, onSubmit }) => {
  const overlayRef = useRef(null);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      contactNumber: "",
      company: "",
      title: "",
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      if (onSubmit) {
        onSubmit(values);
      }
      resetForm();
      onClose();
    },
  });

  /* close on overlay click */
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      formik.resetForm();
      onClose();
    }
  };

  /* Escape key */
  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape" && isOpen) {
        formik.resetForm();
        onClose();
      }
    };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [isOpen]);

  /* lock body scroll */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const field = (name) => ({
    name,
    value: formik.values[name],
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
  });

  const err = (name) =>
    formik.touched[name] && formik.errors[name] ? formik.errors[name] : null;

  const fields = [
    {
      id: "name",
      label: <>Name <span className="text-red-500">*</span></>,
      type: "text",
      icon: <IconUser />,
      placeholder: "e.g. John Doe",
    },
    {
      id: "email",
      label: <>Email Address <span className="text-red-500">*</span></>,
      type: "email",
      icon: <IconMail />,
      placeholder: "e.g. john@company.com",
    },
    {
      id: "contactNumber",
      label: <>Contact Number <span className="text-red-500">*</span></>,
      type: "tel",
      icon: <IconPhone />,
      placeholder: "e.g. +1 (555) 123-4567",
    },
    {
      id: "company",
      label: <>Company <span className="text-red-500">*</span></>,
      type: "text",
      icon: <IconBuilding />,
      placeholder: "e.g. Acme Corporation",
    },
    {
      id: "title",
      label: <>Title <span className="text-red-500">*</span></>,
      type: "text",
      icon: <IconBriefcase />,
      placeholder: "e.g. Sales Manager",
    },
  ];

  /* ─── render ─────────────────────────────────────────────── */
  return (
    <>
      <style>{scrollableStyleSheet}</style>
      <div
        ref={overlayRef}
        onClick={handleOverlayClick}
        className="fixed inset-0 z-50 flex items-center justify-center
                 bg-black/40 backdrop-blur-[2px]"
      >
        <div
          className="relative bg-white rounded-2xl border border-gray-200 shadow-xl
                   w-[440px] flex flex-col"
          style={{ maxHeight: "90vh" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── header ── */}
          <div className="flex items-start justify-between px-5 pt-5 pb-4
                          border-b border-gray-100 shrink-0">
            <div>
              <h2 className="font-poppins text-[15px] font-[700] text-[#0a0a0a] leading-tight">
                Add New Lead
              </h2>
              <p className="font-inter text-[12px] text-gray-500 mt-0.5">
                Fill in the details below to add a new lead
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                formik.resetForm();
                onClose();
              }}
              className="mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-lg
                         border border-gray-200 text-gray-400 hover:bg-gray-100
                         hover:text-gray-700 transition shrink-0"
            >
              <IconX />
            </button>
          </div>

          {/* ── body (scrollable with hidden scrollbar) ── */}
          <div className="flex-1 overflow-y-auto px-5 py-4 lead-form-scrollable">
            <form id="lead-add-form" onSubmit={formik.handleSubmit} noValidate>
              {/* grid layout - 2 columns */}
              <div className="grid grid-cols-2 gap-3.5">
                {fields.map(({ id, label, type, icon, placeholder }) => (
                  <div key={id} className="flex flex-col">
                    <label
                      htmlFor={id}
                      className="block text-[12px] font-[600] text-[#0a0a0a] mb-1.5"
                    >
                      {label}
                    </label>
                    <div className="relative flex-1">
                      <span
                        className="absolute inset-y-0 left-2.5 flex items-center
                                       pointer-events-none text-gray-400"
                      >
                        {icon}
                      </span>
                      <input
                        id={id}
                        type={type}
                        placeholder={placeholder}
                        style={{ color: "#111827", caretColor: "#111827" }}
                        className={`w-full pl-8 pr-3 py-2 text-[12px] rounded-lg border
                                    bg-gray-50 outline-none transition-all placeholder:text-gray-400
                                    focus:bg-white focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400
                                    ${err(id)
                                      ? "border-red-300 bg-red-50/30 focus:ring-red-400/20 focus:border-red-400"
                                      : "border-gray-200"}`}
                        {...field(id)}
                      />
                    </div>
                    {err(id) && (
                      <p className="mt-1 text-[11px] text-red-500 font-[500]">
                        {err(id)}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Optional fields section */}
              <div className="mt-5 pt-4 border-t border-gray-200">
                <p className="text-[11px] font-[600] text-gray-500 mb-3.5">Additional Information (Optional)</p>
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="flex flex-col">
                    <label className="block text-[12px] font-[600] text-[#0a0a0a] mb-1.5">Lead Source</label>
                    <input type="text" placeholder="e.g. Referral" style={{ color: "#111827", caretColor: "#111827" }} className="w-full px-3 py-2 text-[12px] rounded-lg border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all placeholder:text-gray-400" value={formik.values.lead_source || ""} onChange={(e) => formik.setFieldValue("lead_source", e.target.value)} />
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-[12px] font-[600] text-[#0a0a0a] mb-1.5">Lead Status</label>
                    <input type="text" placeholder="e.g. Active" style={{ color: "#111827", caretColor: "#111827" }} className="w-full px-3 py-2 text-[12px] rounded-lg border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all placeholder:text-gray-400" value={formik.values.lead_status || ""} onChange={(e) => formik.setFieldValue("lead_status", e.target.value)} />
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-[12px] font-[600] text-[#0a0a0a] mb-1.5">Lead Rating</label>
                    <input type="text" placeholder="e.g. Hot" style={{ color: "#111827", caretColor: "#111827" }} className="w-full px-3 py-2 text-[12px] rounded-lg border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all placeholder:text-gray-400" value={formik.values.lead_rating || ""} onChange={(e) => formik.setFieldValue("lead_rating", e.target.value)} />
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-[12px] font-[600] text-[#0a0a0a] mb-1.5">Address Street</label>
                    <input type="text" placeholder="e.g. 123 Main St" style={{ color: "#111827", caretColor: "#111827" }} className="w-full px-3 py-2 text-[12px] rounded-lg border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all placeholder:text-gray-400" value={formik.values.address_street || ""} onChange={(e) => formik.setFieldValue("address_street", e.target.value)} />
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-[12px] font-[600] text-[#0a0a0a] mb-1.5">Address City</label>
                    <input type="text" placeholder="e.g. New York" style={{ color: "#111827", caretColor: "#111827" }} className="w-full px-3 py-2 text-[12px] rounded-lg border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all placeholder:text-gray-400" value={formik.values.address_city || ""} onChange={(e) => formik.setFieldValue("address_city", e.target.value)} />
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-[12px] font-[600] text-[#0a0a0a] mb-1.5">Address State</label>
                    <input type="text" placeholder="e.g. NY" style={{ color: "#111827", caretColor: "#111827" }} className="w-full px-3 py-2 text-[12px] rounded-lg border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all placeholder:text-gray-400" value={formik.values.address_state || ""} onChange={(e) => formik.setFieldValue("address_state", e.target.value)} />
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-[12px] font-[600] text-[#0a0a0a] mb-1.5">Address Zip Code</label>
                    <input type="text" placeholder="e.g. 10001" style={{ color: "#111827", caretColor: "#111827" }} className="w-full px-3 py-2 text-[12px] rounded-lg border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all placeholder:text-gray-400" value={formik.values.address_zip_code || ""} onChange={(e) => formik.setFieldValue("address_zip_code", e.target.value)} />
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-[12px] font-[600] text-[#0a0a0a] mb-1.5">Address Country</label>
                    <input type="text" placeholder="e.g. USA" style={{ color: "#111827", caretColor: "#111827" }} className="w-full px-3 py-2 text-[12px] rounded-lg border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all placeholder:text-gray-400" value={formik.values.address_country || ""} onChange={(e) => formik.setFieldValue("address_country", e.target.value)} />
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-[12px] font-[600] text-[#0a0a0a] mb-1.5">Website</label>
                    <input type="text" placeholder="e.g. www.example.com" style={{ color: "#111827", caretColor: "#111827" }} className="w-full px-3 py-2 text-[12px] rounded-lg border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all placeholder:text-gray-400" value={formik.values.website || ""} onChange={(e) => formik.setFieldValue("website", e.target.value)} />
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-[12px] font-[600] text-[#0a0a0a] mb-1.5">Industry</label>
                    <input type="text" placeholder="e.g. Technology" style={{ color: "#111827", caretColor: "#111827" }} className="w-full px-3 py-2 text-[12px] rounded-lg border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all placeholder:text-gray-400" value={formik.values.industry || ""} onChange={(e) => formik.setFieldValue("industry", e.target.value)} />
                  </div>
                  <div className="col-span-2 flex flex-col">
                    <label className="block text-[12px] font-[600] text-[#0a0a0a] mb-1.5">LinkedIn URL</label>
                    <input type="text" placeholder="e.g. linkedin.com/in/username" style={{ color: "#111827", caretColor: "#111827" }} className="w-full px-3 py-2 text-[12px] rounded-lg border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all placeholder:text-gray-400" value={formik.values.linkedin_url || ""} onChange={(e) => formik.setFieldValue("linkedin_url", e.target.value)} />
                  </div>
                  <div className="col-span-2 flex flex-col">
                    <label className="block text-[12px] font-[600] text-[#0a0a0a] mb-1.5">Notes</label>
                    <textarea placeholder="Add any notes..." style={{ color: "#111827", caretColor: "#111827" }} rows={3} className="w-full px-3 py-2 text-[12px] rounded-lg border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all placeholder:text-gray-400 resize-none" value={formik.values.notes || ""} onChange={(e) => formik.setFieldValue("notes", e.target.value)} />
                  </div>
                  <div className="col-span-2 flex flex-col">
                    <label className="block text-[12px] font-[600] text-[#0a0a0a] mb-1.5">Description</label>
                    <textarea placeholder="Add description..." style={{ color: "#111827", caretColor: "#111827" }} rows={3} className="w-full px-3 py-2 text-[12px] rounded-lg border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all placeholder:text-gray-400 resize-none" value={formik.values.description || ""} onChange={(e) => formik.setFieldValue("description", e.target.value)} />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* ── sticky footer ── */}
          <div
            className="shrink-0 flex items-center justify-end gap-2
                          px-5 py-3.5 border-t border-gray-100 bg-gray-50/60"
          >
            <button
              type="button"
              onClick={() => {
                formik.resetForm();
                onClose();
              }}
              className="px-4 py-2 text-[12px] font-[500] text-gray-600
                         border border-gray-200 rounded-lg hover:bg-white
                         hover:border-gray-300 transition active:scale-[0.97]"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="lead-add-form"
              className="px-4 py-2 text-[12px] font-[600] bg-black text-white
                         rounded-lg hover:bg-gray-800 active:bg-gray-900
                         active:scale-[0.97] transition shadow-sm"
            >
              Add Lead
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LeadAdd;
