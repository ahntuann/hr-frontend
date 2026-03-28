import React, { useState, useEffect } from "react";
import approvalService from "../../services/approvalService";

export default function ApprovalCenter() {
  const [pendingList, setPendingList] = useState([]);
  const [onLeaveToday, setOnLeaveToday] = useState([]);
  const [loading, setLoading] = useState(false);

  // State tra cứu nhân viên
  const [searchId, setSearchId] = useState("");
  const [searchMonth, setSearchMonth] = useState(new Date().getMonth() + 1);
  const [searchYear, setSearchYear] = useState(new Date().getFullYear());
  const [searchResult, setSearchResult] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [pendingRes, onLeaveRes] = await Promise.all([
        approvalService.getPendingRequests(),
        approvalService.getOnLeaveToday(),
      ]);
      if (pendingRes.success) setPendingList(pendingRes.data);
      if (onLeaveRes.success) setOnLeaveToday(onLeaveRes.data);
    } catch (error) {
      console.error("Lỗi tải dữ liệu Director:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (requestId, isApproved) => {
    try {
      const res = await approvalService.processRequest({
        requestId,
        isApproved,
      });
      if (res.success) {
        alert(isApproved ? "Đã duyệt đơn!" : "Đã từ chối đơn!");
        setPendingList((prev) => prev.filter((item) => item.id !== requestId));
      }
    } catch (error) {
      alert(error.errorMessage || "Thao tác thất bại");
    }
  };

  const handleSearchEmployee = async () => {
    if (!searchId) return alert("Vui lòng nhập mã nhân viên");
    setSearchLoading(true);
    try {
      const res = await approvalService.getEmployeeCalendar(
        searchId,
        searchMonth,
        searchYear,
      );
      if (res.success) setSearchResult(res.data);
    } catch (error) {
      alert(error.errorMessage || "Không tìm thấy dữ liệu nhân viên");
      setSearchResult([]);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "24px",
        padding: "24px",
      }}
    >
      {/* CỘT TRÁI: DANH SÁCH DUYỆT ĐƠN */}
      <div
        style={{
          backgroundColor: "white",
          padding: "24px",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
        }}
      >
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            marginBottom: "20px",
            color: "#1e293b",
          }}
        >
          📥 Đơn nghỉ phép chờ duyệt
        </h2>

        {loading ? (
          <p>Đang tải đơn...</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  textAlign: "left",
                  borderBottom: "2px solid #f1f5f9",
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                <th style={{ padding: "12px" }}>Nhân viên</th>
                <th style={{ padding: "12px" }}>Loại & Thời gian</th>
                <th style={{ padding: "12px" }}>Lý do</th>
                <th style={{ padding: "12px" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {pendingList.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    style={{
                      padding: "20px",
                      textAlign: "center",
                      color: "#94a3b8",
                    }}
                  >
                    Không có đơn nào cần duyệt.
                  </td>
                </tr>
              ) : (
                pendingList.map((req) => (
                  <tr
                    key={req.id}
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                  >
                    <td style={{ padding: "12px", fontWeight: "600" }}>
                      {req.employeeName}
                    </td>
                    <td style={{ padding: "12px", fontSize: "13px" }}>
                      <span
                        style={{
                          display: "block",
                          color: "#0369a1",
                          fontWeight: "bold",
                        }}
                      >
                        {req.leaveType}
                      </span>
                      <span style={{ color: "#64748b" }}>
                        {new Date(req.fromDate).toLocaleDateString()} -{" "}
                        {new Date(req.toDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        fontSize: "13px",
                        maxWidth: "200px",
                      }}
                    >
                      {req.reason}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => handleApproval(req.id, true)}
                          style={{
                            backgroundColor: "#10b981",
                            color: "white",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={() => handleApproval(req.id, false)}
                          style={{
                            backgroundColor: "#ef4444",
                            color: "white",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          Từ chối
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* CỘT PHẢI: THỐNG KÊ & TRA CỨU */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* 1. Nghỉ phép hôm nay */}
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
          }}
        >
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              marginBottom: "16px",
              color: "#f59e0b",
            }}
          >
            🗓️ Nhân viên nghỉ hôm nay
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {onLeaveToday.length === 0 ? (
              <p style={{ fontSize: "13px", color: "#94a3b8" }}>
                Hôm nay quân số đủ.
              </p>
            ) : (
              onLeaveToday.map((name, i) => (
                <span
                  key={i}
                  style={{
                    backgroundColor: "#fef3c7",
                    color: "#92400e",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  {name}
                </span>
              ))
            )}
          </div>
        </div>

        {/* 2. Tìm kiếm lịch nhân viên */}
        <div
          style={{
            backgroundColor: "#1e293b",
            padding: "20px",
            borderRadius: "12px",
            color: "white",
          }}
        >
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              marginBottom: "16px",
            }}
          >
            🔍 Tra cứu lịch làm việc
          </h3>
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            <input
              type="number"
              placeholder="Mã NV..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "6px",
                border: "none",
                outline: "none",
              }}
            />
            <button
              onClick={handleSearchEmployee}
              style={{
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Tìm
            </button>
          </div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            <select
              value={searchMonth}
              onChange={(e) => setSearchMonth(e.target.value)}
              style={{ flex: 1, padding: "4px", borderRadius: "4px" }}
            >
              {[...Array(12).keys()].map((i) => (
                <option key={i + 1} value={i + 1}>
                  Tháng {i + 1}
                </option>
              ))}
            </select>
            <select
              value={searchYear}
              onChange={(e) => setSearchYear(e.target.value)}
              style={{ flex: 1, padding: "4px", borderRadius: "4px" }}
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>

          {/* Kết quả tra cứu nhanh */}
          <div
            style={{
              maxHeight: "300px",
              overflowY: "auto",
              fontSize: "12px",
              borderTop: "1px solid #334155",
              paddingTop: "12px",
            }}
          >
            {searchLoading ? (
              <p>Đang tìm...</p>
            ) : (
              searchResult.map((log) => (
                <div
                  key={log.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "6px 0",
                    borderBottom: "1px solid #334155",
                  }}
                >
                  <span>{new Date(log.date).toLocaleDateString("vi-VN")}</span>
                  <span style={{ color: log.checkIn ? "#4ade80" : "#fb7185" }}>
                    {log.checkIn || "Nghỉ"} - {log.checkOut || ""}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
