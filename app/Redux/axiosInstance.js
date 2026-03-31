"use client";

import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://ai-sdr-campaign-management-elevenlabs-1.technologymindz.com/",
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});
  // baseURL: "https://channelbeacon-11labs-agent2.technologymindz.com/",
  // baseURL: "https://ai-sdr-campaign-management-elevenlabs-1.technologymindz.com/",

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