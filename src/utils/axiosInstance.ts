// src/utils/axiosInstance.ts

// import axios from "axios";

// const axiosInstance = axios.create({
//   baseURL: "http://localhost:3000/api/v1", 
//   timeout: 10000, // 10 sec
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// export default axiosInstance;
// src/utils/axiosInstance.ts

import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://hrm-backend-dver.onrender.com/api/v1", // 🔥 backend URL (fix korlam)
    // baseURL: "http://localhost:5000/api/v1", // 🔥 backend URL (fix korlam)

  timeout: 10000,
  withCredentials: true, // 🔥 VERY IMPORTANT (cookie send)
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔥 REQUEST INTERCEPTOR (companyId auto add)
axiosInstance.interceptors.request.use(
  (config) => {
    const companyId = localStorage.getItem("companyId");

    if (companyId) {
      config.headers["x-company-id"] = companyId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🔥 RESPONSE INTERCEPTOR (optional but useful)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // 🔴 যদি Unauthorized হয়
    if (error.response?.status === 401) {
      console.error("Unauthorized - redirect to login");

      // 👉 redirect (Next.js)
      // if (typeof window !== "undefined") {
      //   window.location.href = "/login-2";
      // }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;