import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:7165/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// --- CÁC BIẾN DÙNG CHO REFRESH TOKEN ---
// Biến cờ đánh dấu xem có đang gọi API refresh không
let isRefreshing = false;
// Hàng đợi chứa các request bị lỗi 401 đang chờ token mới
let failedQueue = [];

// Hàm xử lý hàng đợi: Chạy lại các request nếu có token mới, hoặc hủy bỏ nếu lỗi
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
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response) {
      const status = error.response.status;

      // Xử lý Lỗi 401: Token hết hạn
      // _retry là cờ tự tạo để đảm bảo request này không bị lặp vô hạn
      if (status === 401 && !originalRequest._retry) {
        // Nếu ĐANG có một request refresh token chạy rồi, thì nhét request này vào hàng đợi
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

        // Bắt đầu quá trình Refresh Token
        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = localStorage.getItem("refreshToken");

        // Nếu không có refresh token ở local, văng luôn ra login
        if (!refreshToken) {
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
          return Promise.reject(error);
        }

        try {
          // GỌI API REFRESH TOKEN
          // Lưu ý: Phải dùng axios mặc định (axios.post), KHÔNG dùng 'api.post'
          // để tránh bị dính lại cái interceptor này tạo ra vòng lặp vô hạn
          const response = await axios.post(
            "https://localhost:7165/api/Auth/refresh-token",
            {
              refreshToken: refreshToken,
            },
          );

          // Lấy token mới từ Backend trả về
          // (Tuỳ BE của bạn trả về tên biến là gì, ở đây ví dụ là accessToken và refreshToken)
          const newAccessToken = response.data.accessToken;
          const newRefreshToken = response.data.refreshToken;

          // Lưu lại vào LocalStorage
          localStorage.setItem("accessToken", newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken);
          }

          // Gọi hàm nhả hàng đợi, báo cho các request đang chờ biết là "Có token mới rồi, chạy đi"
          processQueue(null, newAccessToken);

          // Chạy lại chính cái request gốc vừa bị lỗi
          originalRequest.headers["Authorization"] = "Bearer " + newAccessToken;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh Token bị lỗi (ví dụ: Refresh token cũng hết hạn luôn hoặc bị BE thu hồi)
          processQueue(refreshError, null);

          console.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false; // Đặt lại cờ
        }
      }

      // Xử lý các lỗi khác
      else if (status === 403) {
        console.error("Bạn không có quyền thực hiện hành động này!");
      } else if (status === 500) {
        console.error("Lỗi hệ thống từ Backend!");
      }
    }

    return Promise.reject(error);
  },
);

export default api;
