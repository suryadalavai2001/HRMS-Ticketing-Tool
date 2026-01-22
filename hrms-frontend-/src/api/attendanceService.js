import axiosInstance from './axiosConfig';

const attendanceService = {
  // Check in
  checkIn: async (employeeId) => {
    const response = await axiosInstance.post('/attendance/check-in/', {
      employee_id: employeeId,
      check_in_time: new Date().toTimeString().split(' ')[0],
      date: new Date().toISOString().split('T')[0],
    });
    return response.data;
  },

  // Check out
  checkOut: async (employeeId) => {
    const response = await axiosInstance.post('/attendance/check-out/', {
      employee_id: employeeId,
      check_out_time: new Date().toTimeString().split(' ')[0],
    });
    return response.data;
  },

  // Get my attendance
  getMyAttendance: async (startDate, endDate) => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const response = await axiosInstance.get('/attendance/my/', { params });
    return response.data;
  },

  // Get today's attendance
  getTodayAttendance: async () => {
    const response = await axiosInstance.get('/attendance/today/');
    return response.data;
  },

  // Get team attendance (Manager)
  getTeamAttendance: async (date) => {
    const params = date ? { date } : {};
    const response = await axiosInstance.get('/attendance/team/', { params });
    return response.data;
  },

  // Get monthly report
  getMonthlyReport: async (employeeId, month, year) => {
    const response = await axiosInstance.get(
      `/attendance/monthly/${employeeId}/${month}/${year}/`
    );
    return response.data;
  },

  // Get timesheet
  getTimesheet: async (employeeId, weekNumber, year) => {
    const params = {};
    if (weekNumber) params.week = weekNumber;
    if (year) params.year = year;
    
    const response = await axiosInstance.get(`/attendance/timesheet/${employeeId}/`, { params });
    return response.data;
  },
};

export default attendanceService;
