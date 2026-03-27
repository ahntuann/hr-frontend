import axios from "axios";

// 1. Khởi tạo instance
const api = axios.create({
  baseURL: "https://localhost:7165/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// --- CÁC BIẾN DÙNG CHO REFRESH TOKEN ---
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 2. REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 3. RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => {
    // API trả về HTTP 200 Ok() thành công.
    // Trả nguyên cục Data chuẩn { success, data, errorCode, errorMessage } về cho component
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Nếu server có phản hồi (có status code)
    if (error.response) {
      const status = error.response.status;

      // Móc lấy data theo chuẩn mới của bạn để lấy errorMessage
      const errorData = error.response.data;
      const backendMessage =
        errorData?.errorMessage || "Có lỗi xảy ra, vui lòng thử lại!";

      // Xử lý Lỗi 401: Token hết hạn (Giữ nguyên logic Refresh)
      if (status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise(function (resolve, reject) {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers["Authorization"] = "Bearer " + token;
              return api(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
          return Promise.reject(error);
        }

        try {
          // Lưu ý: Dùng axios.post để không dính vòng lặp
          const response = await axios.post(
            "https://localhost:7165/api/Auth/refresh-token",
            {
              refreshToken: refreshToken,
            },
          );

          // Giả sử API refresh cũng trả về chuẩn { success, data: { accessToken, refreshToken } }
          // Cần check response.data.success nếu BE của bạn áp dụng chuẩn đó cho cả Auth
          const newAccessToken =
            response.data.data?.accessToken || response.data.accessToken;
          const newRefreshToken =
            response.data.data?.refreshToken || response.data.refreshToken;

          localStorage.setItem("accessToken", newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken);
          }

          processQueue(null, newAccessToken);
          originalRequest.headers["Authorization"] = "Bearer " + newAccessToken;

          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          console.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Xử lý các HTTP Status còn lại theo đúng chuẩn API Docs
      else if (status === 400) {
        console.error(`[400 Bad Request]: ${backendMessage}`);
      } else if (status === 403) {
        console.error(
          `[403 Forbidden]: Bạn không có quyền! - ${backendMessage}`,
        );
      } else if (status === 404) {
        console.error(`[404 Not Found]: ${backendMessage}`);
      } else if (status >= 500) {
        console.error(`[Lỗi Server]: ${backendMessage}`);
      }
    } else {
      console.error("Lỗi mạng hoặc Server không phản hồi!");
    }

    // Vẫn ném lỗi ra ngoài để component biết mà hiển thị Toast/Alert
    return Promise.reject(error);
  },
);

export default api;
