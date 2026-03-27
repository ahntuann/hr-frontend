import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { getUserRoles } from "../utils/authUtils";
import "./MainLayout.scss";

const MENU_ITEMS = [
  { title: "Quản lý Tài khoản", path: "/accounts", roles: ["Admin"] },
  { title: "Quản lý Hợp đồng", path: "/contracts", roles: ["Admin"] },
  { title: "Chốt lương", path: "/payroll", roles: ["Admin"] },
  { title: "Dashboard", path: "/", roles: ["Admin", "Director", "Manager"] },
  {
    title: "Quản lý Nhân sự",
    path: "/employee-management",
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

const MainLayout = ({ children }) => {
  const location = useLocation();
  const userRoles = useMemo(() => getUserRoles(), []);

  const allowedMenus = useMemo(() => {
    return MENU_ITEMS.filter((menu) =>
      userRoles.some((r) => menu.roles.includes(r)),
    );
  }, [userRoles]);

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
              {userRoles.map((role) => (
                <span key={role} className="badge">
                  {role}
                </span>
              ))}
            </div>
            <span className="user-name">Hello, User!</span>
            <div className="avatar">U</div>
          </div>
        </header>

        <main className="page-content">
          {/* CỰC KỲ QUAN TRỌNG: children sẽ render component Page từ App.js */}
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
