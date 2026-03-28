import api from "./api";

const payrollService = {
  getPreview: (month, year) =>
    api.get(`/Payroll/preview?month=${month}&year=${year}`),
  calculate: (month, year) =>
    api.post(`/Payroll/calculate?month=${month}&year=${year}`),
};

export default payrollService;
