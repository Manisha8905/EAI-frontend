"use client";

import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://6b0f-2405-201-5c1a-80e7-6d4e-c18a-5ebc-2247.ngrok-free.app",
  headers: {
    "Content-Type": "application/json",
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