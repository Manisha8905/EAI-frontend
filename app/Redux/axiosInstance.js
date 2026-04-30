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

      // ✅ Attach token safely (header only)
      if (session_token && session_token !== "undefined") {
        config.headers.Authorization = `Bearer ${session_token}`;
        console.log("✅ Authorization header attached");
      } else {
        console.warn("⚠️ WARNING: No session_token found in localStorage");
      }

      // ✅ 3. Ensure token is in cookie (survives cross-origin redirects)
      if (session_token && !document.cookie.includes("session_token=")) {
        document.cookie = `session_token=${session_token}; path=/; samesite=none; secure`;
        console.log("🍪 Session token set as cookie");
      }

      console.log("➡️ Request to:", config.url);
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