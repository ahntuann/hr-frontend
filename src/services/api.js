import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:7165/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// --- REQUEST INTERCEPTOR ---
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// --- RESPONSE INTERCEPTOR ---
api.interceptors.response.use(
  (response) => {
    const res = response.data;
    // Bắt lỗi logic HRFlow (BE trả về 200 nhưng success: false)
    if (res && res.success === false) {
      return Promise.reject(res);
    }
    return res;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data; // Đây là { success, errorMessage, ... }

      // Xử lý 401 Unauthorized (Refresh Token)
      if (status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers["Authorization"] = "Bearer " + token;
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          localStorage.clear();
          window.location.href = "/login";
          return Promise.reject(error);
        }

        try {
          const response = await axios.post(
            "https://localhost:7165/api/Auth/refresh-token",
            {
              refreshToken: refreshToken,
            },
          );

          const newAccessToken =
            response.data.data?.accessToken || response.data.accessToken;
          const newRefreshToken =
            response.data.data?.refreshToken || response.data.refreshToken;

          localStorage.setItem("accessToken", newAccessToken);
          if (newRefreshToken)
            localStorage.setItem("refreshToken", newRefreshToken);

          processQueue(null, newAccessToken);
          originalRequest.headers["Authorization"] = "Bearer " + newAccessToken;
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          localStorage.clear();
          window.location.href = "/login";
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
      // Ném errorData (chứa errorMessage) ra ngoài cho Component
      return Promise.reject(errorData || { errorMessage: "Lỗi hệ thống!" });
    }
    return Promise.reject({ errorMessage: "Không thể kết nối đến Server!" });
  },
);

export default api;
