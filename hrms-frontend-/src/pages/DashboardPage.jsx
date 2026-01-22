import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import { AuthContext } from '../context/AuthContext';

import employeeService from '../api/employeeService';
import attendanceService from '../api/attendanceService';
import leaveService from '../api/leaveService';
import { formatDate } from '../utils/helpers';
import '../styles/dashboard.css';

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [calendarData, setCalendarData] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [currentMonth]);

  const fetchDashboardData = async () => {
    try {
      const [attendance, balance] = await Promise.all([
        attendanceService.getTodayAttendance(),
        leaveService.getLeaveBalance(),
      ]);

      setTodayAttendance(attendance);
      setLeaveBalance(balance);

      // Fetch pending leaves for Manager/Admin
      if (user?.role === 'Manager' || user?.role === 'Admin') {
        const pending = await leaveService.getPendingLeaves();
        setPendingLeaves(pending);
      }

      // Fetch calendar data
      await fetchCalendarData();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendarData = async () => {
    try {
      const month = currentMonth.getMonth() + 1;
      const year = currentMonth.getFullYear();
      
      const [leaveData, attendanceData] = await Promise.all([
        leaveService.getCalendarView(month, year),
        attendanceService.getMyAttendance(
          `${year}-${month.toString().padStart(2, '0')}-01`,
          `${year}-${month.toString().padStart(2, '0')}-31`
        ),
      ]);

      const combined = {};
      
      // Add holidays
      if (leaveData.holidays) {
        leaveData.holidays.forEach((holiday) => {
          combined[holiday.date] = { type: 'holiday', name: holiday.name };
        });
      }
      
      // Add leaves
      if (leaveData.leaves) {
        leaveData.leaves.forEach((leave) => {
          const fromDate = new Date(leave.fromdate);
          const toDate = new Date(leave.todate);
          
          for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
            const dateKey = d.toISOString().split('T')[0];
            if (!combined[dateKey]) {
              combined[dateKey] = { type: 'leave', status: leave.leavetype };
            }
          }
        });
      }
      
      // Add attendance
      if (attendanceData) {
        const records = attendanceData.records || attendanceData;
        if (Array.isArray(records)) {
          records.forEach((record) => {
            if (!combined[record.date]) {
              combined[record.date] = { type: 'attendance', status: record.status };
            }
          });
        }
      }
      
      setCalendarData(combined);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const changeMonth = (direction) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentMonth(newDate);
  };

  const getStatusColor = (status) => {
    const colors = {
      Present: '#4caf50',
      Late: '#ff9800',
      Absent: '#f44336',
      Casual: '#2196f3',
      Sick: '#9c27b0',
      Paid: '#00bcd4',
    };
    return colors[status] || '#e0e0e0';
  };

  const renderMiniCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day-mini empty"></div>);
    }

    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const dayData = calendarData[dateKey];
      const isToday = new Date().toDateString() === new Date(dateKey).toDateString();

      days.push(
        <div
          key={day}
          className={`calendar-day-mini ${isToday ? 'today' : ''}`}
          style={{
            backgroundColor: dayData ? getStatusColor(dayData.status) : 'transparent',
          }}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="content">
          <div className="loading">Loading dashboard...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="content">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-left">
            <div className="profile-photo">
              {user?.profile_photo ? (
                <img src={user.profile_photo} alt={user.name} />
              ) : (
                <div className="initials-avatar">
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
              )}
            </div>
            <div className="header-info">
              <h1>{user?.name}</h1>
              <p className="designation">{user?.rolelevel}</p>
              <div className="header-details">
                <span><strong>Code:</strong> {user?.employee_id}</span>
                <span><strong>Status:</strong> Full Time</span>
                <span><strong>Dept:</strong> {user?.department}</span>
              </div>
              <div className="header-details">
                <span><strong>Joined:</strong> {formatDate(user?.date_of_joining)}</span>
                <span><strong>Office:</strong> {user?.department} Office</span>
              </div>
            </div>
          </div>
          <div className="header-right">
            <button className="btn-icon">
              <i className="fa-solid fa-bell"></i>
            </button>
            <span className="partner-badge">
              <i className="fa-solid fa-briefcase"></i> HR Partner
            </span>
          </div>
        </div>

        {/* Shortcuts Section */}
        <section className="shortcuts-section">
          <h2><i className="fa-solid fa-bolt"></i> Shortcuts</h2>
          <div className="shortcuts-grid">
            <Link to="/leave" className="shortcut-card">
              <i className="fa-solid fa-calendar-plus"></i>
              <span>Request Time-Off</span>
            </Link>
            
            {(user?.role === 'Manager' || user?.role === 'Admin') && (
              <Link to="/directory" className="shortcut-card">
                <i className="fa-solid fa-users"></i>
                <span>Company Directory</span>
              </Link>
            )}
            
            <Link to="/profile" className="shortcut-card">
              <i className="fa-solid fa-id-card"></i>
              <span>My Profile</span>
            </Link>
            
            <Link to="/attendance" className="shortcut-card">
              <i className="fa-solid fa-clipboard-check"></i>
              <span>Attendance</span>
            </Link>
            
            <Link to="/timesheet" className="shortcut-card">
              <i className="fa-solid fa-clock"></i>
              <span>Fill in Timesheet</span>
            </Link>
            
            <Link to="/documents" className="shortcut-card">
              <i className="fa-solid fa-file-alt"></i>
              <span>My Documents</span>
            </Link>
            
            <Link to="/payslip" className="shortcut-card">
              <i className="fa-solid fa-receipt"></i>
              <span>Payslip</span>
            </Link>
          </div>
        </section>

        {/* Main Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Left Column */}
          <div className="dashboard-column">
            {/* Active Timesheets - Only show if checked in but not checked out */}
            {todayAttendance?.checkin && !todayAttendance?.checkout && (
              <div className="card">
                <h3><i className="fa-regular fa-clock"></i> Active Timesheet</h3>
                <p className="card-subtitle">You have checked in but not checked out yet</p>
                <div className="timesheet-entry">
                  <p>Today - {new Date().toLocaleDateString('en-IN', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                  })}</p>
                  <p><strong>Check In:</strong> {todayAttendance.checkin}</p>
                  <Link to="/attendance" className="btn-success btn-sm">Complete Check-Out</Link>
                </div>
              </div>
            )}

            {/* Active Checklists - Pending Leave Approvals for Manager/Admin */}
            {(user?.role === 'Manager' || user?.role === 'Admin') && pendingLeaves.length > 0 && (
              <div className="card">
                <h3><i className="fa-solid fa-check-circle"></i> Pending Leave Approvals</h3>
                <p className="card-subtitle">You have {pendingLeaves.length} pending leave request(s)</p>
                {pendingLeaves.slice(0, 3).map((leave) => (
                  <div key={leave.leave_id} className="checklist-entry">
                    <p><strong>{leave.employee_name}</strong> - {leave.leave_type} Leave</p>
                    <p>{leave.from_date} to {leave.to_date}</p>
                    <Link to="/leave" className="btn-warning btn-sm">Review</Link>
                  </div>
                ))}
              </div>
            )}

            {/* Calendar */}
            <div className="card calendar-card">
              <h3><i className="fa-regular fa-calendar"></i> Calendar</h3>
              <div className="calendar-widget">
                <div className="calendar-header">
                  <button onClick={() => changeMonth(-1)}>
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>
                  <span>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
                  <button onClick={() => changeMonth(1)}>
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>
                </div>
                <div className="calendar-grid-mini">
                  <div className="calendar-day-header">Sun</div>
                  <div className="calendar-day-header">Mon</div>
                  <div className="calendar-day-header">Tue</div>
                  <div className="calendar-day-header">Wed</div>
                  <div className="calendar-day-header">Thu</div>
                  <div className="calendar-day-header">Fri</div>
                  <div className="calendar-day-header">Sat</div>
                  {renderMiniCalendar()}
                </div>
                <div className="calendar-legend">
                  <span><span className="legend-dot" style={{ backgroundColor: '#4caf50' }}></span> Present</span>
                  <span><span className="legend-dot" style={{ backgroundColor: '#ff9800' }}></span> Late</span>
                  <span><span className="legend-dot" style={{ backgroundColor: '#2196f3' }}></span> Leave</span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column */}
          <div className="dashboard-column">
            {/* Reporting To */}
            {user?.managername && (
              <div className="card">
                <h3><i className="fa-solid fa-user-tie"></i> You Report To</h3>
                <div className="report-to-card">
                  <div className="manager-avatar">
                    {user.managername.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <p className="manager-name">{user.managername}</p>
                    <p className="manager-title">Manager</p>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Reviews - Empty */}
            <div className="card">
              <h3><i className="fa-solid fa-star"></i> Recent Reviews</h3>
              <p className="empty-state">No recent reviews available</p>
            </div>

            {/* Assets Assigned - Empty */}
            <div className="card">
              <h3><i className="fa-solid fa-laptop"></i> Assets In Your Care</h3>
              <p className="empty-state">No assets assigned</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="dashboard-column">
            {/* Job Portal - Empty Box */}
            <div className="card job-portal-card">
              <h3><i className="fa-solid fa-briefcase"></i> Job Portal</h3>
              <p className="empty-state">No job listings available</p>
            </div>

            {/* Recent Training - Empty */}
            <div className="card">
              <h3><i className="fa-solid fa-graduation-cap"></i> Recent Training</h3>
              <p className="empty-state">No recent training available</p>
            </div>

           {/* Position History - Empty */}
                <div className="card">
                <h3><i className="fa-solid fa-history"></i> Your Position History</h3>
                <p className="empty-state">No position history available</p>
                </div>
         </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
