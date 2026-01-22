import axiosInstance from './axiosConfig';

const leaveService = {
  // Apply for leave
  applyLeave: async (leaveData) => {
    const response = await axiosInstance.post('/leave/apply/', leaveData);
    return response.data;
  },

  // Get my leaves
  getMyLeaves: async () => {
    const response = await axiosInstance.get('/leave/my/');
    return response.data;
  },

  // Get pending leaves (Manager/Admin)
  getPendingLeaves: async () => {
    const response = await axiosInstance.get('/leave/pending/');
    return response.data;
  },
// Approve leave (Manager/Admin)
approveLeave: async (leaveId) => {
  const response = await axiosInstance.put(`/leave/approve/${leaveId}/`);
  return response.data;
},

// Reject leave (Manager/Admin)
rejectLeave: async (leaveId) => {
  const response = await axiosInstance.put(`/leave/reject/${leaveId}/`);
  return response.data;
},

// Cancel leave
cancelLeave: async (leaveId) => {
  const response = await axiosInstance.put(`/leave/cancel/${leaveId}/`);
  return response.data;
},
  // Get leave balance
  getLeaveBalance: async (employeeId) => {
    const endpoint = employeeId 
      ? `/leave/balance/${employeeId}/` 
      : '/leave/balance/';
    const response = await axiosInstance.get(endpoint);
    return response.data;
  },

  // Get calendar view
  getCalendarView: async (month, year) => {
    const params = {};
    if (month) params.month = month;
    if (year) params.year = year;
    
    const response = await axiosInstance.get('/leave/calendar/', { params });
    return response.data;
  },
};

export default leaveService;
