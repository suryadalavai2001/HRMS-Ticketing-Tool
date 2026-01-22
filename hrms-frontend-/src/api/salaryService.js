import axiosInstance from './axiosConfig';

const salaryService = {
  // Get my salary
  getMySalary: async () => {
    const response = await axiosInstance.get('/payslip/salary/');
    return response.data;
  },

  // Generate payslip
  generatePayslip: async (employeeId, month, year) => {
    const response = await axiosInstance.get(
      `/payslip/generate/${employeeId}/${month}/${year}/`
    );
    return response.data;
  },

  // Download payslip PDF
  downloadPayslipPDF: async (employeeId, month, year) => {
    const response = await axiosInstance.get(
      `/payslip/download/${employeeId}/${month}/${year}/`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  // Get payslip history
  getPayslipHistory: async () => {
    const response = await axiosInstance.get('/payslip/history/');
    return response.data;
  },
};

export default salaryService;
