import api from "./api";

const authService = {
  login: (credentials) => {
    // credentials là { username, password }
    return api.post("/Auth/login", credentials);
    // Do interceptor đã return response.data nên kết quả trả về sẽ là ResponseDto
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
  },
};

export default authService;
