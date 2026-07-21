import axios from "axios";

const axiosFieldTrack = axios.create({
  baseURL: process.env.NEXT_PUBLIC_FIELDTRACK_API_URL || "http://localhost:5001/api/v1",
});

axiosFieldTrack.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default axiosFieldTrack;
