import axios from "axios";
import { API_URL } from "./constants";

const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Gắn Accept-Language và Authorization tự động
axiosInstance.interceptors.request.use((config) => {
  const lang = localStorage.getItem("language") || "vi";
  config.headers["Accept-Language"] = lang;

  const auth = localStorage.getItem("auth");
  if (auth) {
    const { token } = JSON.parse(auth);
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
});

export default axiosInstance;
