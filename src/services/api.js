import axios from "axios";

// 1. Khởi tạo một instance của axios
const api = axios.create({
  baseURL: "https://localhost:7165/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // Nếu API gọi quá 10 giây không phản hồi thì báo lỗi
});

// 2. REQUEST INTERCEPTOR: Can thiệp trước khi gửi API lên server
api.interceptors.request.use(
  (config) => {
    // Lấy token từ LocalStorage (sau khi user đăng nhập thành công)
    const token = localStorage.getItem("accessToken");

    // Nếu có token, tự động đính kèm vào Header của mọi request
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 3. RESPONSE INTERCEPTOR: Can thiệp ngay khi server trả dữ liệu về
api.interceptors.response.use(
  (response) => {
    // Chỉ lấy phần data của response cho gọn, team đỡ phải ghi .data nhiều lần
    return response.data;
  },
  (error) => {
    // Xử lý lỗi tập trung tại đây
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        // Lỗi 401: Unauthorized (Chưa đăng nhập hoặc Token hết hạn)
        console.error(
          "Token hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.",
        );
        // Thực hiện xóa token và đá user về trang Login
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      } else if (status === 403) {
        // Lỗi 403: Forbidden (Không có quyền truy cập, ví dụ Nhân viên ráng vào trang Admin)
        console.error("Bạn không có quyền thực hiện hành động này!");
      } else if (status === 500) {
        console.error("Lỗi hệ thống từ Backend!");
      }
    }
    return Promise.reject(error);
  },
);

export default api;
