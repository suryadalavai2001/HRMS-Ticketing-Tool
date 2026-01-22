import React, { useState, useContext } from 'react';
import Sidebar from '../components/common/Sidebar';
import { AuthContext } from '../context/AuthContext';
import employeeService from '../api/employeeService';
import { toast } from 'react-toastify';
import '../styles/adminpanel.css';

const AdminTimesheetPage = () => {
  const { user } = useContext(AuthContext);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [timesheetData, setTimesheetData] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeTimesheet, setEmployeeTimesheet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'single'

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  // Fetch all employees timesheet
  const fetchAllTimesheets = async () => {
    setLoading(true);
    try {
      const data = await employeeService.getAllEmployeesTimesheet(selectedMonth, selectedYear);
      setTimesheetData(data.timesheets || []);
      toast.success('Timesheets loaded successfully');
    } catch (error) {
      toast.error('Failed to load timesheets');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch specific employee timesheet
  const fetchEmployeeTimesheet = async (employeeId) => {
    setLoading(true);
    try {
      const data = await employeeService.getEmployeeMonthlyTimesheet(
        employeeId,
        selectedMonth,
        selectedYear
      );
      setEmployeeTimesheet(data);
      toast.success('Employee timesheet loaded');
    } catch (error) {
      toast.error('Failed to load employee timesheet');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAllTimesheets = () => {
    setViewMode('all');
    setEmployeeTimesheet(null);
    fetchAllTimesheets();
  };

  const handleViewEmployeeTimesheet = (employee) => {
    setSelectedEmployee(employee);
    setViewMode('single');
    fetchEmployeeTimesheet(employee.employee_id);
  };

  // Check if user is Admin
  if (user?.role !== 'Admin') {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="content">
          <div className="error-message">
            <i className="fa-solid fa-lock"></i>
            <h2>Access Denied</h2>
            <p>Only administrators can access timesheet management.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="content">
        <div className="page-header">
          <h1>
            <i className="fa-solid fa-clock"></i> Admin Timesheet Management
          </h1>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="timesheet-filters">
            <div className="filter-group">
              <label>Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              >
                {months.map((month, index) => (
                  <option key={index} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleViewAllTimesheets}
              disabled={loading}
            >
              <i className="fa-solid fa-search"></i>
              {loading ? 'Loading...' : 'View All Timesheets'}
            </button>

            {viewMode === 'single' && (
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setViewMode('all');
                  setEmployeeTimesheet(null);
                }}
              >
                <i className="fa-solid fa-arrow-left"></i>
                Back to All
              </button>
            )}
          </div>
        </div>

        {/* All Employees Timesheet View */}
        {viewMode === 'all' && timesheetData.length > 0 && (
          <div className="card">
            <h2>
              <i className="fa-solid fa-users"></i> All Employees - {months[selectedMonth - 1]} {selectedYear}
            </h2>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Total Hours</th>
                    <th>Days Present</th>
                    <th>Days Absent</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {timesheetData.map((employee) => (
                    <tr key={employee.employee_id}>
                      <td>{employee.employee_id}</td>
                      <td>{employee.employee_name}</td>
                      <td>{employee.department}</td>
                      <td>{employee.total_hours || 0} hrs</td>
                      <td>{employee.days_present || 0}</td>
                      <td>{employee.days_absent || 0}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleViewEmployeeTimesheet(employee)}
                        >
                          <i className="fa-solid fa-eye"></i> View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Single Employee Timesheet View */}
        {viewMode === 'single' && employeeTimesheet && (
          <div className="card">
            <h2>
              <i className="fa-solid fa-user"></i> {selectedEmployee?.employee_name} - Timesheet
            </h2>
            <div className="employee-timesheet-details">
              <div className="timesheet-summary">
                <div className="summary-card">
                  <i className="fa-solid fa-clock"></i>
                  <div>
                    <h3>Total Hours</h3>
                    <p>{employeeTimesheet.total_hours || 0} hrs</p>
                  </div>
                </div>
                <div className="summary-card">
                  <i className="fa-solid fa-calendar-check"></i>
                  <div>
                    <h3>Days Present</h3>
                    <p>{employeeTimesheet.days_present || 0}</p>
                  </div>
                </div>
                <div className="summary-card">
                  <i className="fa-solid fa-calendar-times"></i>
                  <div>
                    <h3>Days Absent</h3>
                    <p>{employeeTimesheet.days_absent || 0}</p>
                  </div>
                </div>
              </div>

              <h3>Daily Attendance</h3>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Hours Worked</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employeeTimesheet.attendance_records?.map((record, index) => (
                      <tr key={index}>
                        <td>{new Date(record.date).toLocaleDateString()}</td>
                        <td>{record.check_in || '--'}</td>
                        <td>{record.check_out || '--'}</td>
                        <td>{record.total_hours || 0} hrs</td>
                        <td>
                          <span
                            className={`badge badge-${record.status.toLowerCase().replace(' ', '-')}`}
                          >
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && viewMode === 'all' && timesheetData.length === 0 && (
          <div className="card">
            <div className="empty-state">
              <i className="fa-solid fa-inbox"></i>
              <p>No timesheet data available for the selected period.</p>
              <p className="text-muted">Select a month and year, then click "View All Timesheets"</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminTimesheetPage;
