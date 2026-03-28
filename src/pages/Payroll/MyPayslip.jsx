import React, { useState, useEffect } from "react";
import payrollService from "../../services/payrollService";

export default function MyPayslip() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [payslip, setPayslip] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPayslip = async () => {
    setLoading(true);
    try {
      const res = await payrollService.getMyPayslip(month, year);
      if (res.success) setPayslip(res.data);
      else setPayslip(null);
    } catch (error) {
      setPayslip(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayslip();
  }, [month, year]);

  const formatVND = (val) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ fontWeight: "bold", fontSize: "24px" }}>
          Phiếu lương cá nhân
        </h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            style={{ padding: "5px 10px" }}
          >
            {[...Array(12).keys()].map((i) => (
              <option key={i + 1} value={i + 1}>
                Tháng {i + 1}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            style={{ padding: "5px 10px" }}
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : payslip ? (
        <div
          id="payslip-content"
          style={{
            backgroundColor: "white",
            padding: "40px",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            border: "1px solid #eee",
          }}
        >
          {/* Header Phiếu Lương */}
          <div
            style={{
              textAlign: "center",
              borderBottom: "2px solid #333",
              paddingBottom: "20px",
              marginBottom: "30px",
            }}
          >
            <h1
              style={{
                fontSize: "22px",
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
            >
              Phiếu thanh toán lương
            </h1>
            <p>
              Kỳ lương: Tháng {month} năm {year}
            </p>
          </div>

          {/* Chi tiết thu nhập */}
          <div style={{ marginBottom: "30px" }}>
            <h3
              style={{
                borderBottom: "1px solid #ddd",
                paddingBottom: "5px",
                color: "#2563eb",
              }}
            >
              1. Thu nhập (Earnings)
            </h3>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
              }}
            >
              <span>Số ngày công thực tế:</span>
              <span style={{ fontWeight: "bold" }}>
                {payslip.totalWorkDays} ngày
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
              }}
            >
              <span>Lương tổng (Gross):</span>
              <span style={{ fontWeight: "bold" }}>
                {formatVND(payslip.totalSalary)}
              </span>
            </div>
          </div>

          {/* Chi tiết khấu trừ */}
          <div style={{ marginBottom: "30px" }}>
            <h3
              style={{
                borderBottom: "1px solid #ddd",
                paddingBottom: "5px",
                color: "#dc2626",
              }}
            >
              2. Khấu trừ (Deductions)
            </h3>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
              }}
            >
              <span>Bảo hiểm xã hội (10.5%):</span>
              <span style={{ color: "#dc2626" }}>
                - {formatVND(payslip.insurance)}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
              }}
            >
              <span>Thuế TNCN:</span>
              <span style={{ color: "#dc2626" }}>
                - {formatVND(payslip.tax)}
              </span>
            </div>
          </div>

          {/* Tổng kết */}
          <div
            style={{
              backgroundColor: "#f8fafc",
              padding: "20px",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "18px", fontWeight: "bold" }}>
              Thực nhận (Net Salary):
            </span>
            <span
              style={{ fontSize: "24px", fontWeight: "bold", color: "#059669" }}
            >
              {formatVND(payslip.netSalary)}
            </span>
          </div>

          {/* Nút Tải PDF */}
          <div style={{ marginTop: "30px", textAlign: "right" }}>
            <button
              onClick={() => window.print()}
              style={{
                backgroundColor: "#1e293b",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              📄 Xuất file PDF
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "50px",
            backgroundColor: "#fef2f2",
            color: "#991b1b",
            borderRadius: "8px",
          }}
        >
          Bảng lương tháng {month}/{year} chưa được chốt hoặc không tồn tại.
        </div>
      )}
    </div>
  );
}
