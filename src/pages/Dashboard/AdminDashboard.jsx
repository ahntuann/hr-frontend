import React, { useState, useEffect } from "react";
import api from "../../services/api";
import {
  Users,
  UserPlus,
  Building2,
  AlertCircle,
  Calendar,
  Loader2,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import "./AdminDashboard.scss";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const res = await api.get("/Dashboard/stats");

        console.log("Dữ liệu nhận được:", res);

        // Kiểm tra nếu res có bọc trong trường .data (thường gặp ở Axios/Custom API)
        const actualData = res?.data || res;

        setStats(actualData);
      } catch (err) {
        console.error("Lỗi fetch dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  if (loading)
    return (
      <div className="dashboard-loading">
        <Loader2 className="spinner" /> <span>Đang thống kê dữ liệu...</span>
      </div>
    );

  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <h1>Tổng quan hệ thống</h1>
        <p>
          Thống kê nhân sự và tình trạng hợp đồng tháng{" "}
          {new Date().getMonth() + 1}
        </p>
      </div>

      {/* 1. Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="info">
            <span className="label">Tổng nhân viên</span>
            <h2 className="value">{stats?.totalEmployees}</h2>
          </div>
          <Users size={40} className="icon" />
        </div>

        <div className="stat-card green">
          <div className="info">
            <span className="label">Nhân sự mới tháng này</span>
            <h2 className="value">+{stats?.newEmployeesThisMonth}</h2>
          </div>
          <UserPlus size={40} className="icon" />
        </div>

        <div className="stat-card purple">
          <div className="info">
            <span className="label">Tổng số phòng ban</span>
            <h2 className="value">{stats?.totalDepartments}</h2>
          </div>
          <Building2 size={40} className="icon" />
        </div>
      </div>

      <div className="dashboard-content">
        {/* 2. Chart: Nhân viên theo phòng ban */}
        <div className="chart-section">
          <h3>Phân bổ nhân sự theo phòng ban</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats?.employeeByDepartment}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {stats?.employeeByDepartment.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. List: Hợp đồng sắp hết hạn */}
        <div className="table-section">
          <div className="section-header">
            <h3>Hợp đồng sắp hết hạn</h3>
            <span className="badge-warning">Cần chú ý</span>
          </div>
          <div className="contract-list">
            {stats?.expiringContracts.length > 0 ? (
              stats.expiringContracts.map((item) => (
                <div key={item.employeeId} className="contract-item">
                  <div className="user-info">
                    <strong>{item.fullName}</strong>
                    <span>ID: #{item.employeeId}</span>
                  </div>
                  <div className="expiry-info">
                    <Calendar size={14} />
                    <span>
                      {new Date(item.expiryDate).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <div
                    className={`days-badge ${item.daysLeft < 7 ? "danger" : ""}`}
                  >
                    {item.daysLeft} ngày còn lại
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-text">Không có hợp đồng nào sắp hết hạn.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
