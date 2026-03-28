import api from "./api";

const approvalService = {
  // Lấy đơn chờ duyệt
  getPendingRequests: () => api.get("/Approval/pending-requests"),

  // Lấy danh sách nghỉ hôm nay
  getOnLeaveToday: () => api.get("/Approval/on-leave-today"),

  // Duyệt hoặc Từ chối
  processRequest: (data) => api.post("/Approval/process-request", data),

  // Tra cứu lịch nhân viên bất kỳ (Dùng API Attendance mới viết)
  getEmployeeCalendar: (empId, month, year) =>
    api.get(
      `/Attendance/employee-calendar/${empId}?month=${month}&year=${year}`,
    ),
};

export default approvalService;
