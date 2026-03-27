import React, { useMemo } from "react"; // Dùng useMemo để tối ưu lọc menu
import { Link, Outlet, useLocation } from "react-router-dom";
import { getUserRoles } from "../utils/authUtils"; // Import helper vừa tạo
import "./MainLayout.scss"; // Khuyên dùng SCSS cho gọn

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

export default function MainLayout() {
  const location = useLocation();

  // 1. Lấy Roles thực tế từ Token
  const userRoles = useMemo(() => getUserRoles(), []);

  // 2. Lọc menu dựa trên Roles thật
  const allowedMenus = useMemo(() => {
    return MENU_ITEMS.filter((menu) =>
      userRoles.some((r) => menu.roles.includes(r)),
    );
  }, [userRoles]);

  // Style helper (giữ nguyên logic của bạn)
  const getMenuItemClass = (path) => {
    return location.pathname === path ? "menu-item active" : "menu-item";
  };

  return (
    <div className="main-layout">
      <aside className="sidebar">
        <h1 className="logo">HR Flow</h1>
        <nav>
          <ul>
            {allowedMenus.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.path}
                  className={
                    location.pathname === item.path
                      ? "menu-item active"
                      : "menu-item"
                  }
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="content-wrapper">
        <header className="main-header">
          <div className="user-info">
            <div className="role-badges">
              {userRoles.map((r) => (
                <span className="badge" key={r}>
                  {r}
                </span>
              ))}
            </div>
            <span className="user-name">Hello, User!</span>
            <div className="avatar">U</div>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
