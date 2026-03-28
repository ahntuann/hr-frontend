import React, { useState, useEffect } from "react";
import payrollService from "../../services/payrollService";

export default function PayrollManagement() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const [payrolls, setPayrolls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchPreview();
  }, [month, year]);

  const fetchPreview = async () => {
    try {
      setIsLoading(true);
      const res = await payrollService.getPreview(month, year);
      if (res.success) setPayrolls(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalculate = async () => {
    if (
      !window.confirm(
        `Bạn có chắc muốn quét lại dữ liệu chấm công và tính lương tháng ${month}/${year}? Dữ liệu bản nháp cũ sẽ bị ghi đè.`,
      )
    )
      return;

    setMessage({ type: "", text: "" });
    setIsCalculating(true);
    try {
      const res = await payrollService.calculate(month, year);
      if (res.success) {
        setPayrolls(res.data);
        setMessage({
          type: "success",
          text: "Tính lương thành công! Dữ liệu đã được cập nhật.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.errorMessage || "Lỗi khi tính lương.",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const formatCurrency = (amount) => amount.toLocaleString("vi-VN") + " đ";

  const handleConfirmPayroll = async () => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn CHỐT LƯƠNG tháng ${month}/${year}? Sau khi chốt, nhân viên sẽ nhìn thấy phiếu lương.`,
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const res = await payrollService.confirmPayroll(month, year);
      if (res.success) {
        alert(
          "🎉 Chốt lương thành công! Phiếu lương đã được gửi tới toàn bộ nhân viên.",
        );
      } else {
        alert(res.errorMessage);
      }
    } catch (error) {
      alert("Lỗi kết nối hệ thống.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      {message.text && (
        <div
          style={{
            padding: "12px 20px",
            marginBottom: "20px",
            borderRadius: "8px",
            fontWeight: "500",
            backgroundColor: message.type === "error" ? "#fee2e2" : "#dcfce3",
            color: message.type === "error" ? "#991b1b" : "#166534",
          }}
        >
          {message.text}
        </div>
      )}

      {/* HEADER & CONTROLS */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          backgroundColor: "white",
          padding: "24px",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          border: "1px solid #e5e7eb",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#1f2937",
              margin: "0 0 12px 0",
            }}
          >
            Quản lý Bảng lương
          </h2>
          <div style={{ display: "flex", gap: "12px" }}>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                outline: "none",
                fontWeight: "500",
              }}
            >
              {[...Array(12).keys()].map((i) => (
                <option key={i + 1} value={i + 1}>
                  Tháng {i + 1}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                outline: "none",
                fontWeight: "500",
              }}
            >
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>
                  Năm {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleCalculate}
          disabled={isCalculating}
          style={{
            backgroundColor: isCalculating ? "#93c5fd" : "#2563eb",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "8px",
            cursor: isCalculating ? "not-allowed" : "pointer",
            fontWeight: "bold",
            transition: "0.2s",
          }}
        >
          {isCalculating ? "Đang xử lý..." : "⚡ Quét dữ liệu & Tính lương"}
        </button>

        <button
          onClick={handleConfirmPayroll}
          disabled={loading}
          style={{
            backgroundColor: loading ? "#94a3b8" : "#10b981",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold",
          }}
        >
          {loading ? "Đang xử lý..." : "✅ Chốt & Công bố bảng lương"}
        </button>
      </div>

      {/* BẢNG DỮ LIỆU */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          border: "1px solid #e5e7eb",
          overflowX: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            fontSize: "14px",
            whiteSpace: "nowrap",
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: "#f8fafc",
                borderBottom: "2px solid #e2e8f0",
              }}
            >
              <th style={{ padding: "16px", color: "#475569" }}>Mã NV</th>
              <th style={{ padding: "16px", color: "#475569" }}>Họ và tên</th>
              <th style={{ padding: "16px", color: "#475569" }}>
                Lương cơ bản
              </th>
              <th
                style={{
                  padding: "16px",
                  color: "#475569",
                  textAlign: "center",
                }}
              >
                Ngày công
              </th>
              <th style={{ padding: "16px", color: "#475569" }}>Lương Gross</th>
              <th style={{ padding: "16px", color: "#475569" }}>
                BHXH (10.5%)
              </th>
              <th style={{ padding: "16px", color: "#475569" }}>Thuế TNCN</th>
              <th
                style={{
                  padding: "16px",
                  color: "#0f766e",
                  fontWeight: "bold",
                }}
              >
                Thực nhận (NET)
              </th>
              <th style={{ padding: "16px", color: "#475569" }}>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan="9"
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#64748b",
                  }}
                >
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : payrolls.length === 0 ? (
              <tr>
                <td
                  colSpan="9"
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#64748b",
                  }}
                >
                  Chưa có dữ liệu lương tháng {month}/{year}. Hãy bấm "Tính
                  lương".
                </td>
              </tr>
            ) : (
              payrolls.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td
                    style={{
                      padding: "16px",
                      fontWeight: "600",
                      color: "#1e293b",
                    }}
                  >
                    {p.employeeCode}
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      fontWeight: "500",
                      color: "#334155",
                    }}
                  >
                    {p.employeeName}
                  </td>
                  <td style={{ padding: "16px", color: "#64748b" }}>
                    {formatCurrency(p.basicSalary)}
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      textAlign: "center",
                      fontWeight: "bold",
                      color: "#0284c7",
                    }}
                  >
                    {p.totalWorkDays}
                  </td>
                  <td style={{ padding: "16px", color: "#64748b" }}>
                    {formatCurrency(p.totalSalary)}
                  </td>
                  <td style={{ padding: "16px", color: "#ef4444" }}>
                    - {formatCurrency(p.insurance)}
                  </td>
                  <td style={{ padding: "16px", color: "#ef4444" }}>
                    - {formatCurrency(p.tax)}
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      fontWeight: "bold",
                      color: "#0f766e",
                    }}
                  >
                    {formatCurrency(p.netSalary)}
                  </td>
                  <td style={{ padding: "16px" }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "600",
                        backgroundColor: p.isPaid ? "#dcfce3" : "#fef3c7",
                        color: p.isPaid ? "#166534" : "#b45309",
                      }}
                    >
                      {p.isPaid ? "Đã chốt" : "Bản nháp"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
