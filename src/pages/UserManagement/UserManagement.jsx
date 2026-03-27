import React, { useState, useEffect, useMemo } from "react";
import api from "../../services/api";
import {
  Search,
  Key,
  Shield,
  UserX,
  UserCheck,
  RotateCcw,
  Save,
  X,
  Loader2,
  Info,
} from "lucide-react";
import "./UserManagement.scss";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // States cho Modals
  const [editingRoles, setEditingRoles] = useState(null); // Lưu user đang được chỉnh Role
  const [selectedRoles, setSelectedRoles] = useState([]);

  const allRoles = ["Admin", "Director", "Manager", "Employee"];

  useEffect(() => {
    // Tạo một timer để trì hoãn việc gọi fetchUsers
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 600);

    // Quan trọng: Xóa timer cũ nếu useEffect bị kích hoạt lại (khi user gõ tiếp)
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      const res = await api.get(
        `/Account/user_list?search=${searchTerm}&role=${roleFilter}`,
      );
      if (res.success) setUsers(res.data);
    } catch (err) {
      console.error("Lỗi fetch user:", err);
    } finally {
      setLoading(false);
    }
  };

  // C1: Toggle Status (Active/Inactive)
  const handleToggleStatus = async (id) => {
    try {
      const res = await api.patch(`/Account/${id}/toggle-status`);
      if (res.success) {
        setUsers(
          users.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u)),
        );
      }
    } catch (err) {
      alert("Không thể thay đổi trạng thái tài khoản");
    } finally {
      fetchUsers();
    }
  };

  // C2: Reset Password
  const handleResetPassword = async (id, username) => {
    const newPass = prompt(
      `Nhập mật khẩu mới cho tài khoản ${username}:`,
      "Hrf@123456",
    );
    if (!newPass) return;

    try {
      const res = await api.put(
        `/Account/${id}/reset-password`,
        JSON.stringify(newPass),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
      if (res.success) alert("Đã reset mật khẩu thành công!");
    } catch (err) {
      alert("Lỗi khi reset mật khẩu");
    }
  };

  // C2: Update Roles
  const openRoleModal = (user) => {
    setEditingRoles(user);
    setSelectedRoles(user.roles || []);
  };

  const handleUpdateRoles = async () => {
    try {
      const res = await api.put(
        `/Account/${editingRoles.id}/roles`,
        selectedRoles,
      );
      if (res.success) {
        alert("Cập nhật quyền thành công");
        setEditingRoles(null);
        fetchUsers();
      }
    } catch (err) {
      alert("Lỗi cập nhật quyền");
    }
  };

  return (
    <div className="user-management">
      <div className="page-header">
        <h1>Quản lý Tài khoản</h1>
        <p>Phân quyền và quản lý trạng thái truy cập hệ thống</p>
      </div>

      <div className="filter-bar">
        <div className="search-wrapper">
          <Search size={18} />
          <input
            placeholder="Tìm theo username, tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">Tất cả quyền hạn</option>
          {allRoles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div className="table-wrapper">
        <table className="hr-table">
          <thead>
            <tr>
              <th>Tài khoản</th>
              <th>Nhân viên</th>
              <th>Quyền hạn</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className={!user.isActive ? "row-inactive" : ""}
              >
                <td>
                  <strong>{user.username}</strong>
                </td>
                <td>{user.fullName}</td>
                <td>
                  <div className="role-badges">
                    {user.roles?.map((r) => (
                      <span key={r} className={`badge role-${r.toLowerCase()}`}>
                        {r}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <span
                    className={`status-text ${user.status === "Active" ? "active" : "inactive"}`}
                  >
                    {user.status === "Active" ? "Đang hoạt động" : "Đã khóa"}
                  </span>
                </td>
                <td className="actions">
                  <button
                    className="btn-icon"
                    title="Đổi quyền"
                    onClick={() => openRoleModal(user)}
                  >
                    <Shield size={16} />
                  </button>
                  <button
                    className="btn-icon"
                    title="Reset Pass"
                    onClick={() => handleResetPassword(user.id, user.username)}
                  >
                    <Key size={16} />
                  </button>
                  <button
                    className={`btn-icon ${user.isActive ? "lock" : "unlock"}`}
                    onClick={() => handleToggleStatus(user.id)}
                  >
                    {user.isActive ? (
                      <UserX size={16} />
                    ) : (
                      <UserCheck size={16} />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal chỉnh sửa Roles */}
      {editingRoles && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Chỉnh sửa quyền: {editingRoles.username}</h3>
              <X className="close" onClick={() => setEditingRoles(null)} />
            </div>
            <div className="modal-body">
              <div className="role-grid">
                {allRoles.map((role) => (
                  <label key={role} className="role-item">
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role)}
                      onChange={(e) => {
                        if (e.target.checked)
                          setSelectedRoles([...selectedRoles, role]);
                        else
                          setSelectedRoles(
                            selectedRoles.filter((r) => r !== role),
                          );
                      }}
                    />
                    <span>{role}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setEditingRoles(null)}
              >
                Hủy
              </button>
              <button className="btn-primary" onClick={handleUpdateRoles}>
                <Save size={16} /> Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
