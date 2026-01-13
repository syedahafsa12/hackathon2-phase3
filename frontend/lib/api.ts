import axios from "axios";

/**
 * Production-safe API config with proper local development support
 */

// Determine API URL based on environment
const getApiUrl = () => {
  // In browser, check if we're on localhost
  if (typeof window !== "undefined") {
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    if (isLocalhost) {
      // Local development - use localhost backend
      return "http://localhost:8001";
    }
  }

  // Production or SSR - use environment variable or fallback
  const PRODUCTION_API_URL = "https://syedahafsa58-todo-phase2.hf.space";
  return process.env.NEXT_PUBLIC_API_URL || PRODUCTION_API_URL;
};

const API_URL = getApiUrl();

// Debug logging (will show in browser console)
if (typeof window !== "undefined") {
  console.log("🔧 API Configuration:");
  console.log("  Hostname:", window.location.hostname);
  console.log(
    "  NEXT_PUBLIC_API_URL from env:",
    process.env.NEXT_PUBLIC_API_URL
  );
  console.log("  Using API_URL:", API_URL);
  console.log("  NODE_ENV:", process.env.NODE_ENV);
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token (client-side only)
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// import axios from "axios";

// const getBaseUrl = () => {
//   if (process.env.NODE_ENV === "production") {
//     const envUrl = process.env.NEXT_PUBLIC_API_URL;
//     if (envUrl && !envUrl.includes("localhost")) {
//       return envUrl.replace("http://", "https://").replace(/\/$/, "");
//     }
//     // Hardcoded fallback for immediate fix if Env Var is missing/wrong
//     return "https://syedahafsa58-todo-phase2.hf.space";
//   }
//   return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
// };

// const api = axios.create({
//   baseURL: getBaseUrl(),
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Add JWT to requests
// api.interceptors.request.use((config) => {
//   if (typeof window !== "undefined") {
//     const token = localStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//   }
//   return config;
// });

// // Handle 401 errors
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401 && typeof window !== "undefined") {
//       localStorage.removeItem("token");
//       window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;
