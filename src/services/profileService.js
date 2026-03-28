import api from "./api";

const profileService = {
  // Lấy thông tin cá nhân
  getProfile: () => {
    return api.get("/Profile/me");
  },

  // Lấy danh sách hợp đồng
  getContracts: () => {
    return api.get("/Profile/my-contracts");
  },

  // Đổi mật khẩu
  changePassword: (data) => {
    // data gồm { oldPassword, newPassword }
    return api.put("/Profile/change-password", data);
  },
};

export default profileService;
