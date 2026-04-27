"use client";

import axios from "axios";

const defaultHeaders = {
  "Content-Type": "application/json",
};

const axiosInstance = axios.create({
  // Keep frontend requests same-origin so no backend CORS changes are required.
  baseURL: "/backend",
  headers: defaultHeaders,
});

// Attach session_token automatically.
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const session_token = localStorage.getItem("session_token");

      // Prevent "Bearer undefined".
      if (session_token && session_token !== "undefined") {
        config.headers.Authorization = `Bearer ${session_token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Normalize all error responses so UI code can use a stable message field.
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const data = error?.response?.data;
    let errorMessage = error.message || "An error occurred";

    if (data instanceof Blob && data.type?.includes("json")) {
      try {
        const text = await data.text();
        const json = JSON.parse(text);
        error.response.data = json;
        errorMessage = json?.detail || json?.message || errorMessage;
      } catch {
        // Leave error as-is if blob parsing fails.
      }
    } else if (data && typeof data === "object") {
      if (data.detail !== undefined && data.detail !== null && data.detail !== "") {
        errorMessage = data.detail;
      } else if (
        data.message !== undefined &&
        data.message !== null &&
        data.message !== ""
      ) {
        errorMessage = data.message;
      } else if (data.error !== undefined && data.error !== null && data.error !== "") {
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
