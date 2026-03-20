import axios from "axios";

const api = axios.create({
  baseURL: "https://bookleaf-support-portal-r4pt.onrender.com/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
