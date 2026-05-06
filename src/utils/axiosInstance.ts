import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://hrm-backend-dver.onrender.com/api/v1",
  // baseURL: "http://localhost:5000/api/v1",

  timeout: 10000,

 

  headers: {
    "Content-Type": "application/json",
  },
});

// 🔥 REQUEST INTERCEPTOR (AUTO TOKEN)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // ✅ main change
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🔥 RESPONSE INTERCEPTOR (AUTO LOGOUT)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized - redirecting...");

      localStorage.removeItem("token");

      if (typeof window !== "undefined") {
        window.location.href = "/login-2";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;