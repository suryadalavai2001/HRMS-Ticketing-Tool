import React, { useState, useEffect, useContext } from 'react';
import Sidebar from '../components/common/Sidebar';
import { AuthContext } from '../context/AuthContext';
import attendanceService from '../api/attendanceService';
import { toast } from 'react-toastify';
import { formatDate, formatTime, getStatusColor } from '../utils/helpers';

const AttendancePage = () => {
  const { user } = useContext(AuthContext);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [teamAttendance, setTeamAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    fetchAttendanceData();
  }, []);
const fetchAttendanceData = async () => {
  try {
    const [today, history] = await Promise.all([
      attendanceService.getTodayAttendance(),
      attendanceService.getMyAttendance(),
    ]);
    
    console.log("Today Attendance:", today);
    console.log("History Response:", history);
    
    setTodayAttendance(today);
    setAttendanceHistory(Array.isArray(history) ? history : (history?.records || history?.data || []));

    // Fetch team attendance if manager
    if (user?.role === "Manager" || user?.role === "Admin") {
      const team = await attendanceService.getTeamAttendance();
      console.log("Team Attendance:", team);
      setTeamAttendance(Array.isArray(team) ? team : (team?.records || team?.data || []));
    }
  } catch (error) {
    console.error("Error fetching attendance:", error);
    toast.error("Failed to load attendance data");
  } finally {
    setLoading(false);
  }
};

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      await attendanceService.checkIn(user.employee_id);
      toast.success('Checked in successfully!');
      fetchAttendanceData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to check in');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckingOut(true);
    try {
      await attendanceService.checkOut(user.employee_id);
      toast.success('Checked out successfully!');
      fetchAttendanceData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to check out');
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="content">
          <div className="loading">Loading attendance...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="content">
        <div className="page-header">
          <h1><i className="fa-solid fa-clipboard-check"></i> Attendance Management</h1>
        </div>

        {/* Today's Attendance Card */}
        <div className="card">
          <h2>Today's Attendance - {formatDate(new Date().toISOString())}</h2>
          
          <div className="attendance-status-grid">
            <div className="status-card">
              <h3>Check In</h3>
              <p className="time-display">
                {todayAttendance?.check_in ? formatTime(todayAttendance.check_in) : '--:--'}
              </p>
            </div>

            <div className="status-card">
              <h3>Check Out</h3>
              <p className="time-display">
                {todayAttendance?.check_out ? formatTime(todayAttendance.check_out) : '--:--'}
              </p>
            </div>

            <div className="status-card">
              <h3>Status</h3>
              <p className="status-badge" style={{ 
                backgroundColor: getStatusColor(todayAttendance?.status || 'Not Checked In'),
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                display: 'inline-block'
              }}>
                {todayAttendance?.status || 'Not Checked In'}
              </p>
            </div>

            <div className="status-card">
              <h3>Total Hours</h3>
              <p className="time-display">
                {todayAttendance?.total_hours || '0.00'} hrs
              </p>
            </div>
          </div>

          <div className="attendance-actions">
            <button
              className="btn btn-success"
              onClick={handleCheckIn}
              disabled={checkingIn || todayAttendance?.check_in}
            >
              <i className="fa-solid fa-sign-in-alt"></i> 
              {checkingIn ? 'Checking In...' : 'Check In'}
            </button>

            <button
              className="btn btn-primary"
              onClick={handleCheckOut}
              disabled={checkingOut || !todayAttendance?.check_in || todayAttendance?.check_out}
            >
              <i className="fa-solid fa-sign-out-alt"></i> 
              {checkingOut ? 'Checking Out...' : 'Check Out'}
            </button>
          </div>
        </div>

        {/* Attendance History */}
        <div className="card">
          <h2><i className="fa-solid fa-history"></i> Attendance History</h2>
          
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Total Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceHistory.length > 0 ? (
                  attendanceHistory.map((record) => (
                    <tr key={record.attendance_id}>
                      <td>{formatDate(record.date)}</td>
                      <td>{formatTime(record.check_in)}</td>
                      <td>{formatTime(record.check_out)}</td>
                      <td>{record.total_hours || '0.00'} hrs</td>
                      <td>
                        <span className="badge" style={{ 
                          backgroundColor: getStatusColor(record.status),
                          color: 'white'
                        }}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">No attendance records found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Team Attendance (Manager/Admin Only) */}
        {(user?.role === 'Manager' || user?.role === 'Admin') && (
          <div className="card">
            <h2><i className="fa-solid fa-users"></i> Team Attendance</h2>
            
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee Name</th>
                    <th>Employee ID</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {teamAttendance.length > 0 ? (
                    teamAttendance.map((record) => (
                      <tr key={record.attendance_id}>
                        <td>{record.employee_name}</td>
                        <td>{record.employee}</td>
                        <td>{formatTime(record.check_in)}</td>
                        <td>{formatTime(record.check_out)}</td>
                        <td>
                          <span className="badge" style={{ 
                            backgroundColor: getStatusColor(record.status),
                            color: 'white'
                          }}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">No team attendance records found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AttendancePage;
