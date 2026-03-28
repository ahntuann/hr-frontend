import React, { useState, useEffect } from "react";
import profileService from "../../services/profileService";

export default function MyProfile() {
  const [activeTab, setActiveTab] = useState("info");

  // States chứa dữ liệu
  const [profile, setProfile] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // States cho form đổi mật khẩu
  const [pwdForm, setPwdForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Gọi song song 2 API cho nhanh
      const [profileRes, contractsRes] = await Promise.all([
        profileService.getProfile(),
        profileService.getContracts(),
      ]);

      if (profileRes.success) setProfile(profileRes.data);
      if (contractsRes.success) setContracts(contractsRes.data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu cá nhân:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    // Validate Frontend cơ bản
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setMessage({ type: "error", text: "Mật khẩu xác nhận không khớp!" });
      return;
    }

    try {
      const res = await profileService.changePassword({
        oldPassword: pwdForm.oldPassword,
        newPassword: pwdForm.newPassword,
      });

      if (res.success) {
        setMessage({ type: "success", text: "Đổi mật khẩu thành công!" });
        setPwdForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (error) {
      // Interceptor của bạn đã ném ra cục errorData chứa errorMessage
      setMessage({
        type: "error",
        text: error.errorMessage || "Lỗi khi đổi mật khẩu",
      });
    }
  };

  // Helper format ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return "---";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  if (isLoading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
        Đang tải dữ liệu...
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#ef4444" }}>
        Không tải được hồ sơ cá nhân.
      </div>
    );
  }

  // Khai báo Style dùng chung
  const tabStyle = (isActive) => ({
    padding: "12px 24px",
    cursor: "pointer",
    borderBottom: isActive ? "2px solid #0284c7" : "2px solid transparent",
    color: isActive ? "#0284c7" : "#6b7280",
    fontWeight: isActive ? "600" : "500",
    backgroundColor: "transparent",
    borderTop: "none",
    borderLeft: "none",
    borderRight: "none",
    fontSize: "15px",
    transition: "all 0.2s",
  });

  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "32px",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        border: "1px solid #e5e7eb",
        maxWidth: "1000px",
        margin: "0 auto",
      }}
    >
      <h2
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          color: "#1f2937",
          marginBottom: "24px",
        }}
      >
        Hồ sơ của tôi
      </h2>

      {/* TABS HEADER */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #e5e7eb",
          marginBottom: "24px",
        }}
      >
        <button
          style={tabStyle(activeTab === "info")}
          onClick={() => setActiveTab("info")}
        >
          Thông tin cá nhân
        </button>
        <button
          style={tabStyle(activeTab === "contracts")}
          onClick={() => setActiveTab("contracts")}
        >
          Hợp đồng
        </button>
        <button
          style={tabStyle(activeTab === "password")}
          onClick={() => setActiveTab("password")}
        >
          Đổi mật khẩu
        </button>
      </div>

      {/* TAB 1: THÔNG TIN CÁ NHÂN */}
      {activeTab === "info" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          <InfoRow
            label="Mã nhân viên"
            value={profile.employeeCode}
            highlight
          />
          <InfoRow label="Họ và tên" value={profile.fullName} highlight />
          <InfoRow label="Phòng ban" value={profile.departmentName} />
          <InfoRow label="Vị trí công việc" value={profile.positionName} />
          <InfoRow label="Email" value={profile.email} />
          <InfoRow label="Số điện thoại" value={profile.phone} />
          <InfoRow label="Ngày sinh" value={formatDate(profile.doB)} />
          <InfoRow label="Ngày gia nhập" value={formatDate(profile.joinDate)} />
          <div style={{ gridColumn: "span 2" }}>
            <InfoRow label="Địa chỉ hiện tại" value={profile.address} />
          </div>
        </div>
      )}

      {/* TAB 2: HỢP ĐỒNG */}
      {activeTab === "contracts" && (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
              fontSize: "14px",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#f9fafb",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <th
                  style={{
                    padding: "14px",
                    color: "#4b5563",
                    fontWeight: "600",
                  }}
                >
                  Số HĐ
                </th>
                <th
                  style={{
                    padding: "14px",
                    color: "#4b5563",
                    fontWeight: "600",
                  }}
                >
                  Loại HĐ
                </th>
                <th
                  style={{
                    padding: "14px",
                    color: "#4b5563",
                    fontWeight: "600",
                  }}
                >
                  Lương cơ bản
                </th>
                <th
                  style={{
                    padding: "14px",
                    color: "#4b5563",
                    fontWeight: "600",
                  }}
                >
                  Ngày bắt đầu
                </th>
                <th
                  style={{
                    padding: "14px",
                    color: "#4b5563",
                    fontWeight: "600",
                  }}
                >
                  Ngày kết thúc
                </th>
                <th
                  style={{
                    padding: "14px",
                    color: "#4b5563",
                    fontWeight: "600",
                  }}
                >
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody>
              {contracts.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      padding: "20px",
                      textAlign: "center",
                      color: "#6b7280",
                    }}
                  >
                    Không có dữ liệu hợp đồng.
                  </td>
                </tr>
              ) : (
                contracts.map((c, index) => {
                  // Giả định hợp đồng mới nhất (index 0) là Active, còn lại là Đã chốt (Expired)
                  const isActive = index === 0;
                  return (
                    <tr
                      key={c.id}
                      style={{
                        borderBottom: "1px solid #f3f4f6",
                        transition: "background-color 0.2s",
                        ":hover": { backgroundColor: "#f9fafb" },
                      }}
                    >
                      <td
                        style={{
                          padding: "14px",
                          fontWeight: "500",
                          color: "#111827",
                        }}
                      >
                        {c.contractNumber}
                      </td>
                      <td style={{ padding: "14px", color: "#4b5563" }}>
                        {c.contractType}
                      </td>
                      <td
                        style={{
                          padding: "14px",
                          color: "#4b5563",
                          fontWeight: "500",
                        }}
                      >
                        {c.basicSalary.toLocaleString("vi-VN")} đ
                      </td>
                      <td style={{ padding: "14px", color: "#4b5563" }}>
                        {formatDate(c.startDate)}
                      </td>
                      <td style={{ padding: "14px", color: "#4b5563" }}>
                        {c.endDate ? formatDate(c.endDate) : "Vô thời hạn"}
                      </td>
                      <td style={{ padding: "14px" }}>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "600",
                            backgroundColor: isActive ? "#dcfce3" : "#f3f4f6",
                            color: isActive ? "#166534" : "#4b5563",
                          }}
                        >
                          {isActive ? "Đang hiệu lực" : "Đã kết thúc"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: ĐỔI MẬT KHẨU */}
      {activeTab === "password" && (
        <form onSubmit={handlePasswordSubmit} style={{ maxWidth: "450px" }}>
          {message.text && (
            <div
              style={{
                padding: "12px",
                marginBottom: "20px",
                borderRadius: "8px",
                fontSize: "14px",
                backgroundColor:
                  message.type === "error" ? "#fee2e2" : "#dcfce3",
                color: message.type === "error" ? "#991b1b" : "#166534",
                border: `1px solid ${message.type === "error" ? "#f87171" : "#86efac"}`,
              }}
            >
              {message.text}
            </div>
          )}

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#4b5563",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Mật khẩu hiện tại
            </label>
            <input
              type="password"
              required
              value={pwdForm.oldPassword}
              onChange={(e) =>
                setPwdForm({ ...pwdForm, oldPassword: e.target.value })
              }
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                outline: "none",
                fontSize: "14px",
              }}
              placeholder="Nhập mật khẩu cũ..."
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#4b5563",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Mật khẩu mới
            </label>
            <input
              type="password"
              required
              value={pwdForm.newPassword}
              onChange={(e) =>
                setPwdForm({ ...pwdForm, newPassword: e.target.value })
              }
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                outline: "none",
                fontSize: "14px",
              }}
              placeholder="Nhập mật khẩu mới..."
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#4b5563",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Xác nhận mật khẩu mới
            </label>
            <input
              type="password"
              required
              value={pwdForm.confirmPassword}
              onChange={(e) =>
                setPwdForm({ ...pwdForm, confirmPassword: e.target.value })
              }
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                outline: "none",
                fontSize: "14px",
              }}
              placeholder="Nhập lại mật khẩu mới..."
            />
          </div>

          <button
            type="submit"
            style={{
              backgroundColor: "#0284c7",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
              transition: "background-color 0.2s",
            }}
          >
            Cập nhật mật khẩu
          </button>
        </form>
      )}
    </div>
  );
}

// Component phụ để hiển thị các hàng thông tin cá nhân cho gọn code
const InfoRow = ({ label, value, highlight }) => (
  <div
    style={{
      padding: "14px",
      backgroundColor: highlight ? "#f0f9ff" : "#f9fafb",
      borderRadius: "8px",
      border: `1px solid ${highlight ? "#bae6fd" : "transparent"}`,
    }}
  >
    <div
      style={{
        fontSize: "13px",
        color: highlight ? "#0369a1" : "#6b7280",
        marginBottom: "4px",
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontSize: "15px",
        color: "#111827",
        fontWeight: highlight ? "600" : "500",
      }}
    >
      {value || "---"}
    </div>
  </div>
);
