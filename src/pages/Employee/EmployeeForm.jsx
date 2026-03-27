import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { ArrowLeft, Save, Edit3, Loader2 } from "lucide-react";
import "./EmployeeForm.scss";

const EmployeeForm = ({ mode = "view" }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Data cho Dropdowns
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);

  // State khớp với Create/Update/List DTO
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    gender: "Male",
    address: "",
    phone: "",
    doB: "",
    departmentId: "",
    positionId: "",
    joinDate: new Date().toISOString().split("T")[0],
    status: "Active",
  });

  useEffect(() => {
    fetchDropdownData();
    if ((mode === "view" || mode === "edit") && id) {
      fetchEmployeeDetail();
    }
  }, [id, mode]);

  // Load danh sách Phòng ban và Chức vụ
  const fetchDropdownData = async () => {
    try {
      const [deptRes, posRes] = await Promise.all([
        api.get("/Common/departments"),
        api.get("/Common/positions"),
      ]);
      if (deptRes.success) setDepartments(deptRes.data);
      if (posRes.success) setPositions(posRes.data);
    } catch (err) {
      console.error("Lỗi load danh mục:", err);
    }
  };

  const fetchEmployeeDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/Employee/${id}`);
      if (res.success) {
        const data = res.data;
        setFormData({
          ...data,
          doB: data.doB ? data.doB.split("T")[0] : "",
          joinDate: data.joinDate ? data.joinDate.split("T")[0] : "",
          // Đảm bảo ID là string để khớp với value của <select>
          departmentId: data.departmentId?.toString() || "",
          positionId: data.positionId?.toString() || "",
        });
      }
    } catch (err) {
      alert("Không tìm thấy nhân viên");
      navigate("/employee-management");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Parse ID về số trước khi gửi cho đúng DTO của BE
    const payload = {
      ...formData,
      departmentId: parseInt(formData.departmentId),
      positionId: parseInt(formData.positionId),
    };

    try {
      let res;
      if (mode === "add") {
        res = await api.post("/Employee/add_employee", payload);
      } else {
        // Gửi UpdateEmployeeDto
        res = await api.put(`/Employee/${id}`, payload);
      }

      if (res.success) {
        alert("Thao tác thành công!");
        navigate("/employee-management");
      }
    } catch (err) {
      alert(err.errorMessage || "Lỗi hệ thống");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="form-loader">
        <Loader2 className="animate-spin" />
      </div>
    );

  const isReadOnly = mode === "view";

  return (
    <div className="employee-form-container">
      <div className="form-header">
        <button
          className="btn-back"
          onClick={() => navigate("/employee-management")}
        >
          <ArrowLeft size={18} /> Quay lại
        </button>
        <h2>
          {mode === "add" && "Thêm nhân sự mới"}
          {mode === "edit" && "Cập nhật thông tin"}
          {mode === "view" && "Chi tiết hồ sơ"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-section">
          <h3>
            <span className="section-num">1</span> Thông tin cá nhân
          </h3>
          <div className="form-row">
            <div className="form-group">
              <label>Họ và Tên</label>
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                readOnly={isReadOnly}
                required
              />
            </div>
            <div className="form-group">
              <label>Giới tính</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                disabled={isReadOnly}
              >
                <option value="Male">Nam</option>
                <option value="Female">Nữ</option>
                <option value="Other">Khác</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                readOnly={isReadOnly || mode === "edit"}
                required
              />
            </div>
            <div className="form-group">
              <label>Số điện thoại</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                readOnly={isReadOnly}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Ngày sinh</label>
              <input
                type="date"
                name="doB"
                value={formData.doB}
                onChange={handleChange}
                readOnly={isReadOnly}
                required
              />
            </div>
            <div className="form-group">
              <label>Địa chỉ</label>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                readOnly={isReadOnly}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>
            <span className="section-num">2</span> Công việc & Tổ chức
          </h3>
          <div className="form-row">
            <div className="form-group">
              <label>Phòng ban</label>
              <select
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                disabled={isReadOnly}
                required
              >
                <option value="">-- Chọn phòng ban --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Chức vụ</label>
              <select
                name="positionId"
                value={formData.positionId}
                onChange={handleChange}
                disabled={isReadOnly}
                required
              >
                <option value="">-- Chọn chức vụ --</option>
                {positions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Ngày gia nhập</label>
              <input
                type="date"
                name="joinDate"
                value={formData.joinDate}
                onChange={handleChange}
                readOnly={isReadOnly || mode === "edit"}
              />
            </div>
            <div className="form-group">
              <label>Trạng thái</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isReadOnly || mode === "add"}
              >
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
            </div>
          </div>
        </div>

        <div className="form-footer">
          {mode === "view" ? (
            <button
              type="button"
              className="btn-edit-mode"
              onClick={() => navigate(`/employee-management/edit/${id}`)}
            >
              <Edit3 size={18} /> Chỉnh sửa hồ sơ
            </button>
          ) : (
            <button type="submit" className="btn-save" disabled={submitting}>
              {submitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Save size={18} />
              )}
              {mode === "add" ? "Tạo nhân viên" : "Lưu thay đổi"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;
