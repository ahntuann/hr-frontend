import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

// Định nghĩa toàn bộ Menu của hệ thống
const MENU_ITEMS = [
  { title: "Quản lý Tài khoản", path: "/accounts", roles: ["Admin"] },
  { title: "Quản lý Hợp đồng", path: "/contracts", roles: ["Admin"] },
  { title: "Chốt lương", path: "/payroll", roles: ["Admin"] },
  { title: "Dashboard", path: "/", roles: ["Admin", "Director", "Manager"] },
  {
    title: "Quản lý Nhân sự",
    path: "/employees",
    roles: ["Admin", "Director", "Manager"],
  },
  {
    title: "Phê duyệt Đơn từ",
    path: "/approvals",
    roles: ["Admin", "Director", "Manager"],
  },
  {
    title: "Trang cá nhân",
    path: "/profile",
    roles: ["Admin", "Director", "Manager", "Employee"],
  },
  {
    title: "Chấm công & Nghỉ phép",
    path: "/attendance",
    roles: ["Admin", "Director", "Manager", "Employee"],
  },
  {
    title: "Phiếu lương của tôi",
    path: "/my-payslip",
    roles: ["Admin", "Director", "Manager", "Employee"],
  },
];

const ALL_AVAILABLE_ROLES = ["Admin", "Director", "Manager", "Employee"];

export default function MainLayout() {
  const [testRoles, setTestRoles] = useState(["Employee"]);
  const location = useLocation(); // To highlight active menu

  // Xử lý bật/tắt role
  const handleRoleChange = (role) => {
    setTestRoles(
      (prevRoles) =>
        prevRoles.includes(role)
          ? prevRoles.filter((r) => r !== role) // Xóa nếu đã có
          : [...prevRoles, role], // Thêm nếu chưa có
    );
  };

  // Lọc ra các menu mà bất kỳ Role nào trong mảng hiện tại được phép xem
  const allowedMenus = MENU_ITEMS.filter((menu) =>
    testRoles.some((r) => menu.roles.includes(r)),
  );

  // Helper cho style của menu item
  const getMenuItemStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      color: isActive ? "#0284c7" : "#1f2937", // Xanh dương cho active, xám đậm cho default
      textDecoration: "none",
      display: "block",
      padding: "12px 16px",
      borderRadius: "8px",
      backgroundColor: isActive ? "#f0f9ff" : "transparent", // Nền xanh nhạt cho active
      fontWeight: isActive ? "600" : "400",
      transition: "background-color 0.2s, color 0.2s",
      ":hover": {
        backgroundColor: "#f9fafb", // Hover gray
      },
    };
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "sans-serif",
        color: "#1f2937",
      }}
    >
      {/* SIDEBAR - Cột Menu bên trái (WHITE) */}
      <div
        style={{
          width: "280px",
          backgroundColor: "white",
          padding: "24px",
          borderRight: "1px solid #e5e7eb",
          boxShadow: "1px 0 3px rgba(0,0,0,0.03)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#0284c7",
            marginBottom: "32px",
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          HR Flow
        </h1>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {allowedMenus.map((item, index) => (
            <li key={index} style={{ marginBottom: "8px" }}>
              <Link to={item.path} style={getMenuItemStyle(item.path)}>
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* KHU VỰC NỘI DUNG CHÍNH (Bên phải) */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#f9fafb",
        }}
      >
        {/* HEADER (WHITE) */}
        <div
          style={{
            height: "70px",
            backgroundColor: "white",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            padding: "0 24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          {/* ROLE SELECTOR UI - MULTI-SELECT */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
              fontSize: "14px",
            }}
          >
            <span style={{ fontWeight: "bold", color: "#6b7280" }}>
              Test Phân Quyền (Chọn nhiều):
            </span>
            <div style={{ display: "flex", gap: "12px" }}>
              {ALL_AVAILABLE_ROLES.map((role) => (
                <label
                  key={role}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                    padding: "6px 12px",
                    borderRadius: "16px",
                    backgroundColor: testRoles.includes(role)
                      ? "#0284c7"
                      : "#f3f4f6",
                    color: testRoles.includes(role) ? "white" : "#4b5563",
                    border: "1px solid transparent",
                    transition: "all 0.2s",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={testRoles.includes(role)}
                    onChange={() => handleRoleChange(role)}
                    style={{ cursor: "pointer", display: "none" }} // Ẩn checkbox gốc
                  />
                  {role}
                </label>
              ))}
            </div>
            <div style={{ borderLeft: "1px solid #e5e7eb", height: "30px" }} />
            <span style={{ color: "#4b5563", fontWeight: "bold" }}>
              Hello, User!
            </span>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "#d1d5db",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#1f2937",
                fontWeight: "bold",
              }}
            >
              U
            </div>
          </div>
        </div>

        {/* NỘI DUNG CÁC TRANG (Outlet) */}
        <div style={{ padding: "32px", flex: 1, overflowY: "auto" }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
