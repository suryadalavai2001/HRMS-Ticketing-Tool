import React, { useState, useEffect, useContext } from 'react';
import Sidebar from '../components/common/Sidebar';
import { AuthContext } from '../context/AuthContext';
import attendanceService from '../api/attendanceService';
import { toast } from 'react-toastify';
import { formatDate } from '../utils/helpers';

const TimesheetPage = () => {
  const { user } = useContext(AuthContext);
  const [timesheetData, setTimesheetData] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  function getCurrentWeek() {
    const date = new Date();
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  useEffect(() => {
    fetchTimesheet();
  }, [selectedWeek, selectedYear]);

  const fetchTimesheet = async () => {
    try {
      const data = await attendanceService.getTimesheet(
        user.employee_id,
        selectedWeek,
        selectedYear
      );
      setTimesheetData(data);
    } catch (error) {
      console.error('Error fetching timesheet:', error);
      toast.error('Failed to load timesheet');
    } finally {
      setLoading(false);
    }
  };

  const weeks = Array.from({ length: 52 }, (_, i) => i + 1);
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="content">
          <div className="loading">Loading timesheet...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="content">
        <div className="page-header">
          <h1><i className="fa-regular fa-clock"></i> Timesheet</h1>
        </div>

        {/* Week Selector */}
        <div className="card">
          <h2>Select Period</h2>
          
          <div className="timesheet-selector">
            <div className="form-group">
              <label>Week Number</label>
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
              >
                {weeks.map(week => (
                  <option key={week} value={week}>Week {week}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Timesheet Summary */}
        {timesheetData && (
          <>
            <div className="card">
              <h2>
                <i className="fa-solid fa-chart-bar"></i> Week Summary - Week {selectedWeek}, {selectedYear}
              </h2>
              
              <div className="timesheet-summary">
                <div className="summary-card">
                  <h3>Total Hours</h3>
                  <p className="summary-number">{timesheetData.total_hours || 0}</p>
                  <p className="summary-label">hours worked</p>
                </div>

                <div className="summary-card">
                  <h3>Days Present</h3>
                  <p className="summary-number">
                    {timesheetData.days?.filter(d => d.status === 'Present' || d.status === 'Late').length || 0}
                  </p>
                  <p className="summary-label">out of 7 days</p>
                </div>

                <div className="summary-card">
                  <h3>Average Hours/Day</h3>
                  <p className="summary-number">
                    {timesheetData.total_hours && timesheetData.days 
                      ? (timesheetData.total_hours / timesheetData.days.length).toFixed(2)
                      : 0}
                  </p>
                  <p className="summary-label">hours per day</p>
                </div>
              </div>
            </div>

            {/* Daily Breakdown */}
            <div className="card">
              <h2><i className="fa-solid fa-list"></i> Daily Breakdown</h2>
              
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Day</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Total Hours</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timesheetData.days && timesheetData.days.length > 0 ? (
                      timesheetData.days.map((day, index) => (
                        <tr key={index}>
                          <td>{formatDate(day.date)}</td>
                          <td>{new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })}</td>
                          <td>{day.check_in || '--:--'}</td>
                          <td>{day.check_out || '--:--'}</td>
                          <td>{day.total_hours || '0.00'} hrs</td>
                          <td>
                            <span className="badge" style={{
                              backgroundColor: day.status === 'Present' ? '#4caf50' :
                                             day.status === 'Late' ? '#ff9800' :
                                             day.status === 'Absent' ? '#f44336' : '#2196f3',
                              color: 'white'
                            }}>
                              {day.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">No timesheet data available for this period</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Additional Info */}
            <div className="card">
              <h2><i className="fa-solid fa-info-circle"></i> Additional Information</h2>
              <div className="info-grid">
                <div className="info-item">
                  <label>Employee:</label>
                  <span>{timesheetData.employee_name || user?.name}</span>
                </div>
                <div className="info-item">
                  <label>Employee ID:</label>
                  <span>{timesheetData.employee_id || user?.employee_id}</span>
                </div>
                <div className="info-item">
                  <label>Week:</label>
                  <span>Week {selectedWeek} of {selectedYear}</span>
                </div>
                <div className="info-item">
                  <label>Total Working Hours:</label>
                  <span>{timesheetData.total_hours || 0} hours</span>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default TimesheetPage;
