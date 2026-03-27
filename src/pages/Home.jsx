import React from "react";
import { getUserRoles } from "../utils/authUtils";
import AdminDashboard from "./Dashboard/AdminDashboard";
// import ManagerDashboard from "./Dashboard/ManagerDashboard";
// import EmployeeDashboard from "./Dashboard/EmployeeDashboard";

const Home = () => {
  const userRoles = getUserRoles();

  // 1. Nếu là Admin hoặc Director
  if (userRoles.some((role) => ["Admin", "Director"].includes(role))) {
    return <AdminDashboard />;
  }

  // 2. Nếu là Manager (Bỏ comment khi đã có component)
  // if (userRoles.includes("Manager")) {
  //   return <ManagerDashboard />;
  // }

  // 3. QUAN TRỌNG: Phải có giá trị trả về mặc định để tránh trang trắng
  // Tạm thời trả về một thông báo hoặc EmployeeDashboard
  return (
    <div style={{ padding: "20px" }}>
      <h2>Chào mừng bạn quay trở lại!</h2>
      <p>Bạn đang đăng nhập với quyền: {userRoles.join(", ")}</p>
    </div>
  );
};

export default Home;
