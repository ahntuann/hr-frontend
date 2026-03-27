import React, { useState, useEffect, useMemo } from "react";
import api from "../../services/api";
import { getUserRoles } from "../../utils/authUtils";
import { useNavigate } from "react-router-dom"; // Thêm điều hướng
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import "./Employees.scss";

const Employees = () => {
  const navigate = useNavigate(); // Hook để chuyển trang
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const userRoles = useMemo(() => getUserRoles(), []);
  const isAdmin = userRoles.includes("Admin");
  const isDirector = userRoles.includes("Director");

  // State cho Modal cấp tài khoản
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [accountForm, setAccountForm] = useState({
    username: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("All");
  const [deptId, setDeptId] = useState(""); // Để trống nếu chọn "Tất cả"
  const [joinDateDes, setJoinDateDes] = useState(true);
  const [showDeleted, setShowDeleted] = useState(false);
  const [metadata, setMetadata] = useState({
    departments: [],
    positions: [],
  });

  // Gọi API lấy Metadata khi trang vừa load
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        // Giả sử API của bạn là /Common/metadata hoặc gọi lẻ 2 cái
        const [deptRes, posRes] = await Promise.all([
          api.get("/Common/departments"),
          api.get("/Common/positions"),
        ]);

        setMetadata((prev) => ({
          ...prev,
          departments: deptRes.data || [],
          positions: posRes.data || [],
        }));
      } catch (err) {
        console.error("Lỗi lấy danh mục:", err);
      }
    };

    fetchMetadata();
  }, []);

  // Dùng useEffect để tự động gọi API khi bất kỳ bộ lọc nào thay đổi
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchEmployees();
    }, 600);
    return () => clearTimeout(handler);
  }, [searchTerm, status, deptId, joinDateDes, showDeleted]);

  const fetchEmployees = async () => {
    try {
      // Khớp chính xác với tham số của Backend [FromQuery]
      const queryParams = new URLSearchParams({
        search: searchTerm.trim(),
        status: status,
        joinDateDes: joinDateDes,
        isDeleted: showDeleted,
      });

      // Nếu có chọn phòng ban cụ thể mới append deptId
      if (deptId) queryParams.append("deptId", deptId);

      const res = await api.get(
        `/Employee/employee_list?${queryParams.toString()}`,
      );

      if (res.success) {
        setEmployees(res.data);
        setCurrentPage(1); // Luôn về trang 1 khi lọc mới
      }
    } catch (err) {
      console.error("Lỗi fetch:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Logic Xóa nhân viên (Soft Delete)
  const handleDelete = async (id, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa nhân viên ${name}?`)) {
      try {
        const res = await api.delete(`/Employee/${id}`);
        if (res.success) {
          alert("Xóa thành công!");
          fetchEmployees();
        }
      } catch (err) {
        alert(err.errorMessage || "Không thể xóa nhân viên này");
      }
    }
  };

  // Logic Tìm kiếm & Phân trang
  const { currentItems, totalPages, filteredCount } = useMemo(() => {
    const filtered = employees.filter(
      (emp) =>
        emp.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    const indexOfLastItem = currentPage * itemsPerPage;
    return {
      currentItems: filtered.slice(
        indexOfLastItem - itemsPerPage,
        indexOfLastItem,
      ),
      totalPages: Math.ceil(filtered.length / itemsPerPage),
      filteredCount: filtered.length,
    };
  }, [employees, searchTerm, currentPage]);

  const openAccountModal = (emp) => {
    setSelectedEmp(emp);
    setAccountForm({
      username: emp.email ? emp.email.split("@")[0] : "",
      password: "Hrf@" + Math.floor(1000 + Math.random() * 9000),
    });
    setIsAccountModalOpen(true);
  };

  const handlePromoteToManager = async (emp) => {
    if (
      window.confirm(`Bạn có chắc muốn nâng ${emp.fullName} lên làm Quản lý?`)
    ) {
      try {
        // Gọi đúng endpoint bạn vừa tạo trong Controller
        const res = await api.put(`/Employee/${emp.id}/promote-to-manager`);

        if (res.success) {
          alert(`Nâng cấp thành công! ${emp.fullName} hiện đã là Quản lý.`);
          fetchEmployees(); // Reload lại danh sách để cập nhật UI
        }
      } catch (err) {
        alert(err.errorMessage || "Lỗi khi thăng chức nhân viên");
      }
    }
  };

  const handleCreateAccount = async () => {
    if (!accountForm.username || !accountForm.password)
      return alert("Vui lòng điền đủ thông tin");
    setSubmitting(true);
    try {
      const payload = {
        employeeId: selectedEmp.id,
        username: accountForm.username,
        password: accountForm.password,
      };
      const res = await api.post("/Account/create", payload);
      if (res.success) {
        alert(`Đã cấp tài khoản thành công cho ${selectedEmp.fullName}`);
        setIsAccountModalOpen(false);
        fetchEmployees();
      }
    } catch (err) {
      alert(err.errorMessage || "Lỗi khi tạo tài khoản");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="page-loader">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="employee-management">
      <div className="page-header">
        <div>
          <h1>Danh sách Nhân sự</h1>
          <p>Tổng số {filteredCount} nhân viên</p>
        </div>
        {(isAdmin || isDirector) && (
          <button
            className="btn-add"
            onClick={() => navigate("/employee-management/add")}
          >
            <Plus size={18} /> Thêm nhân viên
          </button>
        )}
      </div>

      <div className="filter-bar">
        <div className="search-wrapper">
          <Search size={18} />
          <input
            placeholder="Tìm theo tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {(isAdmin || isDirector) && (
          <button
            className={`btn-show-deleted ${showDeleted ? "active" : ""}`}
            onClick={() => setShowDeleted(!showDeleted)}
            title={
              showDeleted
                ? "Xem nhân viên đang làm việc"
                : "Xem nhân viên đã xóa"
            }
          >
            <Trash2 size={18} />
            <span>{showDeleted ? "Đã nghỉ việc" : "Đang làm"}</span>
          </button>
        )}
        <div className="filter-group">
          {/* Bộ lọc Trạng thái */}
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="All">Tất cả trạng thái</option>
            <option value="Active">Đang làm việc</option>
            <option value="Probation">Thử việc</option>
            <option value="OnLeave">Đang nghỉ phép</option>
            <option value="BusinessTrip">Đi công tác</option>
            <option value="Remote">Làm việc từ xa</option>
            <option value="SickLeave">Nghỉ ốm</option>
            <option value="MaternityLeave">Nghỉ thai sản</option>
            <option value="Training">Đang đào tạo</option>
            <option value="Suspended">Tạm đình chỉ</option>
          </select>

          {/* Bộ lọc Sắp xếp ngày gia nhập */}
          <select
            value={joinDateDes}
            onChange={(e) => setJoinDateDes(e.target.value === "true")}
          >
            <option value="true">Gia nhập: Mới nhất</option>
            <option value="false">Gia nhập: Cũ nhất</option>
          </select>

          {/* Lọc theo Phòng ban (Chỉ dành cho Admin/Director) */}
          {(isAdmin || isDirector) && (
            <select value={deptId} onChange={(e) => setDeptId(e.target.value)}>
              <option value="">Tất cả phòng ban</option>
              {metadata.departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="table-wrapper">
        <table className="hr-table">
          <thead>
            <tr>
              <th>Nhân viên</th>
              <th>Vị trí / Phòng ban</th>
              <th>Ngày gia nhập</th>
              <th>Tài khoản hệ thống</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((emp) => (
              <tr key={emp.id}>
                <td>
                  <div className="user-cell">
                    <div className="avatar">{emp.fullName?.charAt(0)}</div>
                    <div className="info">
                      <span className="name">{emp.fullName}</span>
                      <span className="email">{emp.email}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="pos-cell">
                    <span className="pos">{emp.positionName}</span>
                    <span className="dept">{emp.departmentName}</span>
                  </div>
                </td>
                <td>{new Date(emp.joinDate).toLocaleDateString("vi-VN")}</td>
                <td>
                  {emp.hasAccount ? (
                    <div className="status-tag success">
                      <CheckCircle2 size={14} /> <span>{emp.username}</span>
                    </div>
                  ) : (
                    <div className="status-tag warning">
                      <AlertCircle size={14} /> <span>Chưa cấp</span>
                    </div>
                  )}
                </td>
                <td className="actions">
                  {/* Nút Xem chi tiết */}
                  <button
                    className="btn-icon view"
                    onClick={() =>
                      navigate(`/employee-management/view/${emp.id}`)
                    }
                  >
                    <Eye size={16} />
                  </button>

                  {/* Nút Chỉnh sửa */}
                  <button
                    className="btn-icon edit"
                    onClick={() =>
                      navigate(`/employee-management/edit/${emp.id}`)
                    }
                  >
                    <Edit size={16} />
                  </button>
                  {(isAdmin || isDirector) &&
                    emp.positionName !== "Manager" &&
                    !showDeleted && (
                      <button
                        className="btn-icon promote"
                        onClick={() => handlePromoteToManager(emp)}
                        title="Nâng lên Quản lý"
                      >
                        <ShieldCheck size={16} />
                      </button>
                    )}
                  {isAdmin && !emp.hasAccount && (
                    <button
                      className="btn-icon account"
                      onClick={() => openAccountModal(emp)}
                    >
                      <UserPlus size={16} />
                    </button>
                  )}

                  {/* Nút Xóa */}
                  {(isAdmin || isDirector) && (
                    <button
                      className="btn-icon delete"
                      onClick={() => handleDelete(emp.id, emp.fullName)}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination UI */}
      <div className="pagination-footer">
        <span>
          Trang {currentPage} / {totalPages || 1}
        </span>
        <div className="btns">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            <ChevronLeft />
          </button>
          <button
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      {/* Modal Cấp Tài Khoản */}
      {isAccountModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Cấp tài khoản hệ thống</h3>
              <X
                className="close"
                onClick={() => setIsAccountModalOpen(false)}
              />
            </div>
            <div className="modal-body">
              <p className="target-name">
                Nhân viên: <strong>{selectedEmp?.fullName}</strong>
              </p>
              <div className="field">
                <label>Tên đăng nhập</label>
                <input
                  value={accountForm.username}
                  onChange={(e) =>
                    setAccountForm({ ...accountForm, username: e.target.value })
                  }
                />
              </div>
              <div className="field">
                <label>Mật khẩu tạm thời</label>
                <input
                  type="text"
                  value={accountForm.password}
                  onChange={(e) =>
                    setAccountForm({ ...accountForm, password: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setIsAccountModalOpen(false)}
              >
                Hủy bỏ
              </button>
              <button
                className="btn-primary"
                disabled={submitting}
                onClick={handleCreateAccount}
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={16} /> Đang xử lý...
                  </>
                ) : (
                  "Xác nhận cấp"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
