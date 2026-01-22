// import axiosInstance from './axiosConfig';

// const employeeService = {
//   // Get current user profile
//   getMyProfile: async () => {
//     const response = await axiosInstance.get('/profile/');
//     return response.data;
//   },

//   // Get dashboard stats
//   getDashboardStats: async () => {
//     const response = await axiosInstance.get('/dashboard/');
//     return response.data;
//   },

//   // Get all employees (Admin/Manager)
//   getAllEmployees: async () => {
//     const response = await axiosInstance.get('/employees/');
//     return response.data;
//   },

//   // Get employee by ID
//   getEmployeeById: async (employeeId) => {
//     const response = await axiosInstance.get(`/employees/${employeeId}/`);
//     return response.data;
//   },

//   // Update profile
//   updateProfile: async (data) => {
//     const response = await axiosInstance.put('/profile/update/', data);
//     return response.data;
//   },

//   // Upload profile photo
//   uploadProfilePhoto: async (formData) => {
//     const response = await axiosInstance.post('/profile/photo/', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//     return response.data;
//   },

//   // Change password
//   changePassword: async (oldPassword, newPassword, confirmPassword) => {
//     const response = await axiosInstance.post('/profile/change-password/', {
//       old_password: oldPassword,
//       new_password: newPassword,
//       confirm_password: confirmPassword,
//     });
//     return response.data;
//   },
//   createEmployee: async (employeeData) => {
//   const response = await axiosInstance.post('/admin/employees/create/', employeeData);
//   return response.data;
//   },

//   // Admin: Update employee
//   updateEmployee: async (employeeId, employeeData) => {
//     const response = await axiosInstance.put(`/admin/employees/${employeeId}/update/`, employeeData);
//     return response.data;
//   },

//   // Admin: Delete employee
//   deleteEmployee: async (employeeId) => {
//     const response = await axiosInstance.delete(`/admin/employees/${employeeId}/delete/`);
//     return response.data;
//   },
  
//   // Admin: Get all employees timesheet for a month
//   getAllEmployeesTimesheet: async (month, year) => {
//     const response = await axiosInstance.get(`/admin/timesheet/${month}/${year}/`);
//     return response.data;
//   },

//   // Admin: Get specific employee timesheet for a month
//   getEmployeeMonthlyTimesheet: async (employeeId, month, year) => {
//     const response = await axiosInstance.get(`/admin/timesheet/${employeeId}/${month}/${year}/`);
//     return response.data;
//   },

//   // Admin: Bulk generate payslips for all employees
//   generateBulkPayslips: async (month, year) => {
//     const response = await axiosInstance.post(`/admin/payslips/generate/${month}/${year}/`);
//     return response.data;
//   },

//   // Admin: Get all payslips for a specific month
//   getAllPayslipsForMonth: async (month, year) => {
//     const response = await axiosInstance.get(`/admin/payslips/${month}/${year}/`);
//     return response.data;
//   },

//   // Admin: Delete a payslip
//   deletePayslip: async (documentId) => {
//     const response = await axiosInstance.delete(`/admin/payslips/${documentId}/delete/`);
//     return response.data;
//   },
// };


// export default employeeService;



import axiosInstance from './axiosConfig';

const employeeService = {
  // Get current user profile
  getMyProfile: async () => {
    const response = await axiosInstance.get('/profile/');
    return response.data;
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    const response = await axiosInstance.get('/dashboard/');
    return response.data;
  },

  // Get all employees (Admin/Manager)
  getAllEmployees: async () => {
    const response = await axiosInstance.get('/employees/');
    return response.data;
  },

  // Get employee by ID
  getEmployeeById: async (employeeId) => {
    const response = await axiosInstance.get(`/employees/${employeeId}/`);
    return response.data;
  },

  // Create employee (Admin only)
  createEmployee: async (employeeData) => {
    const response = await axiosInstance.post('/admin/employees/create/', employeeData);
    return response.data;
  },

  // Update employee (Admin only)
  updateEmployee: async (employeeId, employeeData) => {
    const response = await axiosInstance.put(`/admin/employees/${employeeId}/update/`, employeeData);
    return response.data;
  },

  // Delete employee (Admin only)
  deleteEmployee: async (employeeId) => {
    const response = await axiosInstance.delete(`/admin/employees/${employeeId}/delete/`);
    return response.data;
  },

  // ✅ ADMIN: Get all employees timesheet for a month
  getAllEmployeesTimesheet: async (month, year) => {
    const response = await axiosInstance.get(`/admin/timesheet/${month}/${year}/`);
    return response.data;
  },

  // ✅ ADMIN: Get specific employee timesheet for a month  
  getEmployeeMonthlyTimesheet: async (employeeId, month, year) => {
    const response = await axiosInstance.get(`/admin/timesheet/${employeeId}/${month}/${year}/`);
    return response.data;
  },

  // ✅ ADMIN: Bulk generate payslips for all employees
  // FIXED: Changed from POST with body to POST with URL params
  generateBulkPayslips: async (month, year) => {
    const response = await axiosInstance.post(`/admin/payslips/generate/${month}/${year}/`);
    return response.data;
  },

  // ✅ ADMIN: Get all payslips for a specific month
  getAllPayslipsForMonth: async (month, year) => {
    const response = await axiosInstance.get(`/admin/payslips/${month}/${year}/`);
    return response.data;
  },

  // ✅ ADMIN: Delete a payslip
  deletePayslip: async (documentId) => {
    const response = await axiosInstance.delete(`/admin/payslips/${documentId}/delete/`);
    return response.data;
  },

  // Update profile
  updateProfile: async (data) => {
    const response = await axiosInstance.put('/profile/update/', data);
    return response.data;
  },

  // Upload profile photo
  uploadProfilePhoto: async (formData) => {
    const response = await axiosInstance.post('/profile/photo/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Change password
  changePassword: async (oldPassword, newPassword, confirmPassword) => {
    const response = await axiosInstance.post('/profile/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
      confirm_password: confirmPassword,
    });
    return response.data;
  },
};

export default employeeService;
