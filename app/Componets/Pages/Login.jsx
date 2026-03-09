"use client";

import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { loginUser } from "../../Redux/actions/authActions";

const Login = () => {
  const dispatch = useDispatch();
  const router = useRouter();

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
    <div className="min-h-screen flex items-center justify-center bg-gray-200">
      <form
        onSubmit={formik.handleSubmit}
        className="bg-white px-8 py-8 rounded-[12px] shadow-lg w-[420px]"
      >
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="font-poppins text-[16px] font-[600] text-[#0a0a0a]">
            Enterprise AI Portal
          </h1>

          <p className="font-inter text-[13px] text-gray-600 mt-1">
            Sign in to access your dashboard
          </p>
        </div>

        {/* Email */}
        <label className="block text-[14px] text-[#0a0a0a] font-inter font-[400]">
          Email
        </label>

        <input
          type="email"
          name="email"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.email}
          className="w-full px-2 py-[6px] mt-1 mb-2 bg-[#ececf0] text-[13px] text-[#0a0a0a] rounded-lg border border-gray-400 outline-none transition focus:ring-3 focus:ring-gray-400/40"
        />

        {formik.touched.email && formik.errors.email && (
          <p className="text-red-500 text-[10px] font-bold mb-1">
            {formik.errors.email}
          </p>
        )}

        {/* Password */}
        <label className="block text-[14px] text-[#0a0a0a] font-inter font-[400]">
          Password
        </label>

        <input
          type="password"
          name="password"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.password}
          className="w-full px-2 py-[6px] mt-1 mb-2 bg-[#ececf0] text-[13px] text-[#0a0a0a] rounded-lg border border-gray-400 outline-none transition focus:ring-3 focus:ring-gray-400/40"
        />

        {formik.touched.password && formik.errors.password && (
          <p className="text-red-500 text-[10px] font-bold mb-1">
            {formik.errors.password}
          </p>
        )}

        {/* API Error */}
        {error && (
          <p className="text-red-500 text-[11px] mb-2 text-center">{error}</p>
        )}

        {/* Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-[8px] rounded-[8px] text-[13px] font-medium transition hover:bg-gray-900 active:scale-[0.98]"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;