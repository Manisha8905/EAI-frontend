"use client";

import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://268c-2405-201-5c1a-80e7-3979-ef4b-ee0e-1354.ngrok-free.app",
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// ✅ Attach session_token automatically
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const session_token = localStorage.getItem("session_token");

      // 🔥 Prevent "Bearer undefined"
      if (session_token && session_token !== "undefined") {
        config.headers.Authorization = `Bearer ${session_token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;