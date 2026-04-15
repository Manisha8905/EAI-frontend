"use client";

import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://ai-sdr-campaign-management-elevenlabs-1.technologymindz.com/",
    // baseURL: "https://6336-2405-201-5c1a-80e7-60a8-a13d-d8e1-e609.ngrok-free.app/",

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

// ✅ Normalize all error responses — extract `detail` (FastAPI) or `message` into error.message
// Also handles blob responses: parses blob JSON so catch blocks can read .detail directly
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
        // leave error as-is if blob can't be parsed
      }
    } else if (data && typeof data === "object") {
      // Handle FastAPI detail (even if empty or null)
      if (data.detail !== undefined && data.detail !== null && data.detail !== "") {
        errorMessage = data.detail;
      } else if (data.message !== undefined && data.message !== null && data.message !== "") {
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