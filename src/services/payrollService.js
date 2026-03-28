import api from "./api";

const payrollService = {
  getPreview: (month, year) =>
    api.get(`/Payroll/preview?month=${month}&year=${year}`),
  calculate: (month, year) =>
    api.post(`/Payroll/calculate?month=${month}&year=${year}`),
  getMyPayslip: (month, year) =>
    api.get(`/Payroll/my-payslip?month=${month}&year=${year}`),
  confirmPayroll: (month, year) =>
    api.post(`/Payroll/confirm-payroll?month=${month}&year=${year}`),
};

export default payrollService;
