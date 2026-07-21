import axios from "axios";
import { API_URL } from "./constants";

const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const lang = localStorage.getItem("language") || "vi";
  config.headers["Accept-Language"] = lang;

  const auth = localStorage.getItem("auth");
  if (auth) {
    const { accessToken } = JSON.parse(auth);
    if (accessToken) config.headers["Authorization"] = `Bearer ${accessToken}`;
  }

  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  isRefreshing = false;
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
};

export function resolveTokenRefresh(newAccessToken: string) {
  processQueue(null, newAccessToken);
}

export function rejectTokenRefresh() {
  processQueue(new Error("Session expired"), null);
}

export function setupResponseInterceptors(
  dispatch: (action: unknown) => void,
  setSessionExpiredAction: (expired: boolean) => unknown
) {
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      const originalRequest = error.config as typeof error.config & { _retry?: boolean };

      const isTokenExpired =
        error.response?.status === 401 &&
        error.response?.data?.code === "TOKEN_EXPIRED";

      const isRefreshEndpoint = originalRequest.url?.includes("/api/admin/refresh");

      if (isTokenExpired && !originalRequest._retry && !isRefreshEndpoint) {
        originalRequest._retry = true;

        if (!isRefreshing) {
          isRefreshing = true;
          dispatch(setSessionExpiredAction(true));
        }

        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        });
      }

      return Promise.reject(error);
    }
  );
}

export default axiosInstance;
