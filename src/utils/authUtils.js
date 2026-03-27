import { jwtDecode } from "jwt-decode";

export const getUserRoles = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return [];

  try {
    const decoded = jwtDecode(token);
    // Key mặc định của .NET Role Claim trong JWT
    const roles =
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      decoded["role"];

    if (!roles) return [];
    // Nếu là mảng thì trả về luôn, nếu là chuỗi thì bọc vào mảng
    return Array.isArray(roles) ? roles : [roles];
  } catch (error) {
    console.error("Lỗi giải mã Token:", error);
    return [];
  }
};
