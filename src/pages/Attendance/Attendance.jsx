import React, { useState, useEffect } from "react";
import attendanceService from "../../services/attendanceService";

export default function Attendance() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [timeLogs, setTimeLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // State quản lý Modal xin nghỉ
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leaveType: "Phép năm",
    fromDate: "",
    toDate: "",
    reason: "",
  });

  // Thông báo (Toast/Message)
  const [message, setMessage] = useState({ type: "", text: "" });
  const [modalMessage, setModalMessage] = useState({ type: "", text: "" });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // getMonth() trả từ 0-11

  useEffect(() => {
    fetchCalendarData();
  }, [month, year]);

  const fetchCalendarData = async () => {
    try {
      setIsLoading(true);
      const res = await attendanceService.getMyCalendar(month, year);
      if (res.success) {
        setTimeLogs(res.data);
      }
    } catch (error) {
      console.error("Lỗi tải lịch:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- XỬ LÝ CHECK-IN / CHECK-OUT ---
  const handleAction = async (actionType) => {
    setMessage({ type: "", text: "" });
    try {
      const res =
        actionType === "in"
          ? await attendanceService.checkIn()
          : await attendanceService.checkOut();

      if (res.success) {
        setMessage({
          type: "success",
          text:
            actionType === "in"
              ? "Check-in thành công!"
              : "Check-out thành công!",
        });
        fetchCalendarData(); // Refresh lại lịch để update giao diện
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.errorMessage || "Có lỗi xảy ra!",
      });
    }
  };

  // --- XỬ LÝ FORM XIN NGHỈ ---
  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setModalMessage({ type: "", text: "" });
    try {
      const res = await attendanceService.createLeaveRequest(leaveForm);
      if (res.success) {
        setModalMessage({
          type: "success",
          text: "Gửi đơn xin nghỉ thành công! Đang chờ duyệt.",
        });
        setTimeout(() => {
          setIsModalOpen(false);
          setLeaveForm({
            leaveType: "Phép năm",
            fromDate: "",
            toDate: "",
            reason: "",
          });
          setModalMessage({ type: "", text: "" });
        }, 2000);
      }
    } catch (error) {
      setModalMessage({
        type: "error",
        text: error.errorMessage || "Lỗi khi tạo đơn.",
      });
    }
  };

  // --- LOGIC VẼ LỊCH ---
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  // Đẩy thứ 2 lên đầu tuần (0 là CN, chuyển thành 6)
  const emptyDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  // Tìm log của ngày hôm nay để quyết định hiển thị nút Check-in hay Check-out
  const todayStr = new Date().toDateString();
  const todayLog = timeLogs.find(
    (l) => new Date(l.date).toDateString() === todayStr,
  );

  const renderCalendarDays = () => {
    let days = [];
    for (let i = 0; i < emptyDays; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}
        ></div>,
      );
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const loopDate = new Date(year, month - 1, d);
      const isToday = loopDate.toDateString() === todayStr;

      // So sánh ngày để lấy data (Bỏ qua giờ phút giây)
      const log = timeLogs.find(
        (l) => new Date(l.date).toDateString() === loopDate.toDateString(),
      );

      days.push(
        <div
          key={d}
          style={{
            border: "1px solid #e2e8f0",
            minHeight: "100px",
            padding: "8px",
            backgroundColor: isToday ? "#f0f9ff" : "white",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontWeight: isToday ? "bold" : "500",
              color: isToday ? "#0284c7" : "#475569",
              marginBottom: "8px",
            }}
          >
            {d}
          </div>

          {log && (
            <div
              style={{
                fontSize: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              {log.checkIn && (
                <span
                  style={{
                    color: "#059669",
                    backgroundColor: "#d1fae5",
                    padding: "4px 6px",
                    borderRadius: "4px",
                    fontWeight: "500",
                  }}
                >
                  Vào: {log.checkIn}
                </span>
              )}
              {log.checkOut && (
                <span
                  style={{
                    color: "#d97706",
                    backgroundColor: "#fef3c7",
                    padding: "4px 6px",
                    borderRadius: "4px",
                    fontWeight: "500",
                  }}
                >
                  Ra: {log.checkOut}
                </span>
              )}
              <span
                style={{
                  color: "#64748b",
                  fontSize: "11px",
                  fontWeight: "600",
                }}
              >
                {log.status}
              </span>
            </div>
          )}
        </div>,
      );
    }
    return days;
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "20px" }}>
      {/* HEADER & THÔNG BÁO LỖI */}
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
              margin: "0 0 8px 0",
            }}
          >
            Bảng Chấm Công
          </h2>
          <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
            Hôm nay: {new Date().toLocaleDateString("vi-VN")}
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          {/* Nút Xin Nghỉ */}
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              backgroundColor: "white",
              color: "#374151",
              border: "1px solid #d1d5db",
              padding: "10px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              transition: "0.2s",
            }}
          >
            Tạo đơn xin nghỉ
          </button>

          {/* Logic hiện nút Check-in / Check-out */}
          {!todayLog?.checkIn ? (
            <button
              onClick={() => handleAction("in")}
              style={{
                backgroundColor: "#10b981",
                color: "white",
                border: "none",
                padding: "10px 24px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Check-in ngay
            </button>
          ) : !todayLog?.checkOut ? (
            <button
              onClick={() => handleAction("out")}
              style={{
                backgroundColor: "#f59e0b",
                color: "white",
                border: "none",
                padding: "10px 24px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Check-out
            </button>
          ) : (
            <button
              disabled
              style={{
                backgroundColor: "#e5e7eb",
                color: "#9ca3af",
                border: "none",
                padding: "10px 24px",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "not-allowed",
              }}
            >
              Đã xong ca
            </button>
          )}
        </div>
      </div>

      {/* GIAO DIỆN LỊCH (CALENDAR) */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
        }}
      >
        {/* Điều hướng tháng */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 24px",
            borderBottom: "1px solid #e5e7eb",
            backgroundColor: "#f9fafb",
          }}
        >
          <button
            onClick={() => setCurrentDate(new Date(year, month - 2, 1))}
            style={{
              padding: "8px 12px",
              cursor: "pointer",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              backgroundColor: "white",
              fontWeight: "500",
            }}
          >
            &larr; Tháng trước
          </button>
          <h3
            style={{
              margin: 0,
              fontSize: "18px",
              color: "#1e293b",
              fontWeight: "bold",
            }}
          >
            Tháng {month} / {year}
          </h3>
          <button
            onClick={() => setCurrentDate(new Date(year, month, 1))}
            style={{
              padding: "8px 12px",
              cursor: "pointer",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              backgroundColor: "white",
              fontWeight: "500",
            }}
          >
            Tháng sau &rarr;
          </button>
        </div>

        {/* Khung Grid Lịch */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            backgroundColor: "#f1f5f9",
            textAlign: "center",
            fontWeight: "600",
            color: "#475569",
            fontSize: "14px",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <div style={{ padding: "12px 0" }}>Thứ 2</div>
          <div style={{ padding: "12px 0" }}>Thứ 3</div>
          <div style={{ padding: "12px 0" }}>Thứ 4</div>
          <div style={{ padding: "12px 0" }}>Thứ 5</div>
          <div style={{ padding: "12px 0" }}>Thứ 6</div>
          <div style={{ padding: "12px 0" }}>Thứ 7</div>
          <div style={{ padding: "12px 0", color: "#ef4444" }}>Chủ nhật</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {isLoading ? (
            <div
              style={{
                gridColumn: "span 7",
                padding: "60px",
                textAlign: "center",
                color: "#6b7280",
              }}
            >
              Đang tải lịch...
            </div>
          ) : (
            renderCalendarDays()
          )}
        </div>
      </div>

      {/* MODAL TẠO ĐƠN XIN NGHỈ */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "32px",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "500px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                fontSize: "20px",
                color: "#1f2937",
                marginBottom: "20px",
              }}
            >
              Đơn xin nghỉ phép
            </h3>

            {modalMessage.text && (
              <div
                style={{
                  padding: "12px",
                  marginBottom: "20px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  backgroundColor:
                    modalMessage.type === "error" ? "#fee2e2" : "#dcfce3",
                  color: modalMessage.type === "error" ? "#991b1b" : "#166534",
                }}
              >
                {modalMessage.text}
              </div>
            )}

            <form onSubmit={handleLeaveSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  Loại nghỉ
                </label>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, leaveType: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    outline: "none",
                    fontSize: "14px",
                  }}
                >
                  <option value="Phép năm">Phép năm (Có hưởng lương)</option>
                  <option value="Ốm">Nghỉ ốm (Hưởng BHXH)</option>
                  <option value="Việc riêng">
                    Việc riêng (Không hưởng lương)
                  </option>
                </select>
              </div>

              <div
                style={{ display: "flex", gap: "16px", marginBottom: "16px" }}
              >
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    Từ ngày
                  </label>
                  <input
                    type="date"
                    required
                    value={leaveForm.fromDate}
                    onChange={(e) =>
                      setLeaveForm({ ...leaveForm, fromDate: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    Đến ngày
                  </label>
                  <input
                    type="date"
                    required
                    value={leaveForm.toDate}
                    onChange={(e) =>
                      setLeaveForm({ ...leaveForm, toDate: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  Lý do (Chi tiết)
                </label>
                <textarea
                  required
                  rows="3"
                  value={leaveForm.reason}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, reason: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    outline: "none",
                    resize: "none",
                    boxSizing: "border-box",
                    fontSize: "14px",
                  }}
                  placeholder="Vui lòng nhập lý do xin nghỉ..."
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    backgroundColor: "white",
                    cursor: "pointer",
                    fontWeight: "600",
                    color: "#4b5563",
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "#0284c7",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Gửi đơn duyệt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
