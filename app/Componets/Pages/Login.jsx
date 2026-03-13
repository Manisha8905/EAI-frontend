"use client";

import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { loginUser } from "../../Redux/actions/authActions";

const Login = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const { loading, error } = useSelector((state) => state.auth);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .min(6, "Minimum 6 characters")
        .required("Password is required"),
    }),
    onSubmit: async (values) => {
      await dispatch(loginUser(values, router));
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative w-full max-w-md px-4">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

          <div className="px-8 py-8">
            {/* Logo + Branding */}
            <div className="flex flex-col items-center mb-7">
              <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-xl shadow-lg mb-3">
                AI
              </div>
              <h1 className="font-poppins text-[18px] font-[700] text-[#0a0a0a] tracking-tight">
                Enterprise AI Portal
              </h1>
              <p className="font-inter text-[13px] text-gray-500 mt-1">
                Sign in to access your dashboard
              </p>
            </div>

            <form onSubmit={formik.handleSubmit} noValidate>
              {/* Email field */}
              <div className="mb-4">
                <label className="block text-[13px] font-[500] text-gray-700 mb-1.5 font-inter">
                  Email address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@company.com"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                    className={`w-full pl-9 pr-3 py-2.5 bg-gray-50 text-[13px] text-[#0a0a0a] rounded-lg border outline-none transition focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white ${
                      formik.touched.email && formik.errors.email
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200"
                    }`}
                  />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <p className="text-red-500 text-[11px] font-medium mt-1">
                    {formik.errors.email}
                  </p>
                )}
              </div>

              {/* Password field */}
              <div className="mb-5">
                <label className="block text-[13px] font-[500] text-gray-700 mb-1.5 font-inter">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.password}
                    className={`w-full pl-9 pr-10 py-2.5 bg-gray-50 text-[13px] text-[#0a0a0a] rounded-lg border outline-none transition focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white ${
                      formik.touched.password && formik.errors.password
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <p className="text-red-500 text-[11px] font-medium mt-1">
                    {formik.errors.password}
                  </p>
                )}
              </div>

              {/* API Error */}
              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
                  <svg className="shrink-0 text-red-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p className="text-red-600 text-[12px] font-medium">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                // disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-lg text-[13px] font-semibold tracking-wide transition hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-blue-500/20"
              >
                {/* {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : ( */}
                  Sign In
                {/* )} */}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-[12px] text-slate-400 mt-5">
          Enterprise AI Portal &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default Login;
