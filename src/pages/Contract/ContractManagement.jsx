import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import {
  Search,
  FilePlus,
  FileText,
  UserMinus,
  Filter,
  Eye,
  Calendar,
  ChevronDown,
  ChevronUp,
  RefreshCcw,
  X,
  AlertCircle,
  DollarSign,
  Briefcase,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ContractManagement.scss";

const ContractManagement = () => {
  // --- States ---
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Metadata cho Select
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const contractTypes = ["Thử việc", "Xác định thời hạn", "Không thời hạn"];

  // Modal control
  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | 'view' | 'terminate'
  const [selectedData, setSelectedData] = useState(null);

  // Form Filter (Khớp ContractFilterDto)
  const [filters, setFilters] = useState({
    EmployeeSearch: "",
    DepartmentId: "",
    PositionId: "",
    JoinedBefore: "",
    ContractType: "",
  });

  // --- Actions ---
  const loadMetadata = useCallback(async () => {
    try {
      const [d, p] = await Promise.all([
        api.get("/Common/departments"),
        api.get("/Common/positions"),
      ]);
      if (d.success) setDepartments(d.data);
      if (p.success) setPositions(p.data);
    } catch (err) {
      console.error("Metadata error", err);
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params.append(k, v);
      });

      const res = await api.get(`/Contract/search?${params.toString()}`);
      if (res.success) setContracts(res.data);
      else toast.error(res.errorMessage || "Lỗi quyền truy cập");
    } catch (err) {
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetadata();
    fetchData();
  }, [loadMetadata]);

  // Mở Modal (View hoặc Edit đều gọi API GetDetail {id})
  const handleOpenModal = async (id, mode) => {
    if (mode === "terminate") {
      const item = contracts.find((c) => c.id === id);
      setSelectedData({
        ...item,
        terminateDate: new Date().toISOString().split("T")[0],
      });
      setModalMode(mode);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`/Contract/${id}`);
      if (res.success) {
        const data = res.data;
        // Format date cho input
        data.startDate = data.startDate?.split("T")[0];
        data.endDate = data.endDate?.split("T")[0];
        setSelectedData(data);
        setModalMode(mode);
      } else toast.error(res.errorMessage);
    } catch (err) {
      toast.error("Lỗi lấy chi tiết");
    } finally {
      setLoading(false);
    }
  };

  // Submit Logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (modalMode === "add") {
        res = await api.post("/Contract/add_contract", selectedData);
      } else if (modalMode === "edit") {
        res = await api.put(`/Contract/${selectedData.id}`, selectedData);
      } else if (modalMode === "terminate") {
        res = await api.delete(
          `/Contract/${selectedData.id}/terminate?terminateDate=${selectedData.terminateDate}`,
        );
      }

      if (res.success) {
        toast.success("Thao tác thành công!");
        setModalMode(null);
        fetchData();
      } else {
        toast.error(res.errorMessage, { autoClose: 5000 });
      }
    } catch (err) {
      toast.error(err.errorMessage);
    }
  };

  return (
    <div className="contract-page">
      <ToastContainer position="top-right" />

      {/* Title Section */}
      <div className="dashboard-header">
        <div>
          <h2 className="title">Hợp đồng nhân sự</h2>
          <p className="subtitle">
            Quản lý vòng đời hợp đồng và chính sách lương
          </p>
        </div>
        <button
          className="btn-add"
          onClick={() => {
            setSelectedData({
              contractType: "Thử việc",
              startDate: new Date().toISOString().split("T")[0],
              basicSalary: 0,
            });
            setModalMode("add");
          }}
        >
          <FilePlus size={20} /> Ký hợp đồng mới
        </button>
      </div>

      {/* Filter Card */}
      <div className="card filter-card">
        <div className="search-bar">
          <div className="input-icon">
            <Search size={18} />
            <input
              type="text"
              placeholder="Tìm tên nhân viên, email hoặc mã số..."
              value={filters.EmployeeSearch}
              onChange={(e) =>
                setFilters({ ...filters, EmployeeSearch: e.target.value })
              }
            />
          </div>
          <button
            className={`btn-filter ${showFilters ? "active" : ""}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} /> Bộ lọc nâng cao
          </button>
          <button className="btn-search" onClick={fetchData}>
            Tìm kiếm
          </button>
        </div>

        {showFilters && (
          <div className="filter-expand">
            <div className="grid-4">
              <div className="form-group">
                <label>Phòng ban</label>
                <select
                  value={filters.DepartmentId}
                  onChange={(e) =>
                    setFilters({ ...filters, DepartmentId: e.target.value })
                  }
                >
                  <option value="">Tất cả phòng ban</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Vị trí</label>
                <select
                  value={filters.PositionId}
                  onChange={(e) =>
                    setFilters({ ...filters, PositionId: e.target.value })
                  }
                >
                  <option value="">Tất cả vị trí</option>
                  {positions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Loại hợp đồng</label>
                <select
                  value={filters.ContractType}
                  onChange={(e) =>
                    setFilters({ ...filters, ContractType: e.target.value })
                  }
                >
                  <option value="">Mọi loại hình</option>
                  {contractTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Ngày gia nhập trước</label>
                <input
                  type="date"
                  value={filters.JoinedBefore}
                  onChange={(e) =>
                    setFilters({ ...filters, JoinedBefore: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="card table-card">
        <table className="main-table">
          <thead>
            <tr>
              <th>Thông tin hợp đồng</th>
              <th>Nhân viên</th>
              <th>Đơn vị công tác</th>
              <th>Thời hạn</th>
              <th>Lương cơ bản</th>
              <th className="text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading && contracts.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-10">
                  <RefreshCcw className="spin" /> Đang tải dữ liệu...
                </td>
              </tr>
            ) : (
              contracts.map((c) => (
                <tr
                  key={c.id}
                  className={c.status === "Terminated" ? "status-closed" : ""}
                >
                  <td>
                    <div className="contract-num">
                      <strong>{c.contractNumber}</strong>
                      <span
                        className={`tag ${c.contractType === "Thử việc" ? "warning" : "info"}`}
                      >
                        {c.contractType}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="user-info">
                      <div className="avatar">{c.employeeName.charAt(0)}</div>
                      <div className="details">
                        <span className="name">{c.employeeName}</span>
                        <span className="id-sub">ID: #{c.employeeId}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="dept-info">
                      <p>{c.departmentName}</p>
                      <small>{c.positionName}</small>
                    </div>
                  </td>
                  <td>
                    <div className="date-stack">
                      <span>
                        Bắt đầu:{" "}
                        {new Date(c.startDate).toLocaleDateString("vi-VN")}
                      </span>
                      <span className="end">
                        Kết thúc:{" "}
                        {c.endDate
                          ? new Date(c.endDate).toLocaleDateString("vi-VN")
                          : "Vô thời hạn"}
                      </span>
                    </div>
                  </td>
                  <td className="salary-cell">
                    {c.basicSalary?.toLocaleString()} ₫
                  </td>
                  <td className="actions">
                    <button
                      className="act-btn view"
                      onClick={() => handleOpenModal(c.id, "view")}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="act-btn edit"
                      onClick={() => handleOpenModal(c.id, "edit")}
                    >
                      <FileText size={16} />
                    </button>
                    <button
                      className="act-btn delete"
                      onClick={() => handleOpenModal(c.id, "terminate")}
                    >
                      <UserMinus size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL SYSTEM --- */}
      {modalMode && (
        <div className="modal-wrapper">
          <div
            className={`modal-content ${modalMode === "view" ? "size-sm" : ""}`}
          >
            <div className="modal-header">
              <h3>
                {modalMode === "add" && "Ký kết hợp đồng mới"}
                {modalMode === "edit" && "Cập nhật hợp đồng"}
                {modalMode === "view" && "Chi tiết hợp đồng"}
                {modalMode === "terminate" && "Chấm dứt hợp đồng"}
              </h3>
              <X className="close-icon" onClick={() => setModalMode(null)} />
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {modalMode === "terminate" ? (
                  <div className="terminate-confirm">
                    <div className="warning-box">
                      <AlertCircle size={24} />
                      <p>
                        Bạn đang thực hiện chấm dứt hợp đồng của{" "}
                        <strong>{selectedData.employeeName}</strong>. Hành động
                        này không thể hoàn tác.
                      </p>
                    </div>
                    <div className="form-group mt-4">
                      <label>
                        Ngày kết thúc hiệu lực (Chỉ từ hôm nay trở đi)
                      </label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split("T")[0]}
                        value={selectedData.terminateDate}
                        onChange={(e) =>
                          setSelectedData({
                            ...selectedData,
                            terminateDate: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <div className="form-grid">
                    {modalMode === "add" && (
                      <div className="form-group span-2">
                        <label>ID Nhân viên</label>
                        <input
                          type="number"
                          required
                          placeholder="Nhập ID nhân viên cần ký hợp đồng..."
                          onChange={(e) =>
                            setSelectedData({
                              ...selectedData,
                              employeeId: e.target.value,
                            })
                          }
                        />
                      </div>
                    )}

                    <div className="form-group">
                      <label>Số hợp đồng</label>
                      <input
                        readOnly={modalMode === "view"}
                        value={selectedData?.contractNumber || ""}
                        onChange={(e) =>
                          setSelectedData({
                            ...selectedData,
                            contractNumber: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>Loại hợp đồng</label>
                      <select
                        disabled={modalMode === "view"}
                        value={selectedData?.contractType || ""}
                        onChange={(e) =>
                          setSelectedData({
                            ...selectedData,
                            contractType: e.target.value,
                          })
                        }
                      >
                        {contractTypes.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Ngày bắt đầu</label>
                      <input
                        type="date"
                        readOnly={modalMode === "view"}
                        value={selectedData?.startDate || ""}
                        onChange={(e) =>
                          setSelectedData({
                            ...selectedData,
                            startDate: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>Ngày kết thúc</label>
                      <input
                        type="date"
                        readOnly={modalMode === "view"}
                        value={selectedData?.endDate || ""}
                        onChange={(e) =>
                          setSelectedData({
                            ...selectedData,
                            endDate: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="form-group span-2">
                      <label>Lương cơ bản (VND)</label>
                      <div className="input-with-label">
                        <input
                          type="number"
                          readOnly={modalMode === "view"}
                          value={selectedData?.basicSalary || 0}
                          onChange={(e) =>
                            setSelectedData({
                              ...selectedData,
                              basicSalary: e.target.value,
                            })
                          }
                        />
                        <DollarSign size={16} className="suffix" />
                      </div>
                      {modalMode === "edit" && (
                        <small className="text-muted">
                          Lưu ý: Lương sẽ bị khóa chỉnh sửa sau ngày 15 hàng
                          tháng.
                        </small>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setModalMode(null)}
                >
                  Đóng
                </button>
                {modalMode !== "view" && (
                  <button
                    type="submit"
                    className={`btn-submit ${modalMode === "terminate" ? "danger" : ""}`}
                  >
                    {modalMode === "terminate"
                      ? "Xác nhận chấm dứt"
                      : "Lưu thông tin"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractManagement;
