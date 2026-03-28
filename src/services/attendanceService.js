import api from "./api";

const attendanceService = {
  // 1. Lấy dữ liệu lịch chấm công theo tháng
  getMyCalendar: (month, year) => {
    return api.get(`/Attendance/my-calendar?month=${month}&year=${year}`);
  },

  // 2. Nút Check-in
  checkIn: () => {
    return api.post("/Attendance/check-in");
  },

  // 3. Nút Check-out
  checkOut: () => {
    return api.put("/Attendance/check-out");
  },

  // 4. Gửi form xin nghỉ phép
  createLeaveRequest: (data) => {
    return api.post("/Attendance/leave-request", data);
  },
};

export default attendanceService;
