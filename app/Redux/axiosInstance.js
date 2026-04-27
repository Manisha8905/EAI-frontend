"use client";

import axios from "axios";

const defaultHeaders = {
  "Content-Type": "application/json",
};

const axiosInstance = axios.create({
  baseURL: "/backend",
  headers: defaultHeaders,
  withCredentials: true, // ✅ support cookies
});

// ✅ REQUEST INTERCEPTOR
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const session_token = localStorage.getItem("session_token");

      // ✅ Ensure headers exist
      config.headers = config.headers || {};

      // ✅ Attach token safely
      if (session_token && session_token !== "undefined") {
        config.headers.Authorization = `Bearer ${session_token}`;
      }

      // 🔍 Debug (remove later)
      console.log("➡️ API:", config.url);
      console.log("➡️ Token:", session_token);
      console.log("➡️ Authorization:", config.headers.Authorization);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ RESPONSE INTERCEPTOR
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const data = error?.response?.data;

    // 🔁 AUTO RETRY ON 401
    if (
      error?.response?.status === 401 &&
      !originalRequest?._retry
    ) {
      originalRequest._retry = true;

      const session_token = localStorage.getItem("session_token");

      if (session_token) {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${session_token}`;

        console.warn("🔁 Retrying request with token:", originalRequest.url);

        return axiosInstance(originalRequest);
      }
    }

    // ✅ NORMALIZE ERROR RESPONSE (your existing logic improved)
    let errorMessage = error.message || "An error occurred";

    if (data instanceof Blob && data.type?.includes("json")) {
      try {
        const text = await data.text();
        const json = JSON.parse(text);
        error.response.data = json;
        errorMessage = json?.detail || json?.message || errorMessage;
      } catch {
        // ignore parsing error
      }
    } else if (data && typeof data === "object") {
      if (data.detail) {
        errorMessage = data.detail;
      } else if (data.message) {
        errorMessage = data.message;
      } else if (data.error) {
        errorMessage = data.error;
      }
    }

    error.message = errorMessage;
    error.response = error.response || {};
    error.response.data = error.response.data || { detail: errorMessage };

    return Promise.reject(error);
  }
);

export default axiosInstance;