import React, { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import leaveService from '../api/leaveService';
import attendanceService from '../api/attendanceService';
import { toast } from 'react-toastify';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState({});
  const [holidays, setHolidays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate]);

  const fetchCalendarData = async () => {
    try {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      
      // Fetch calendar data from backend (includes holidays)
      const calendarResponse = await leaveService.getCalendarView(month, year);
      
      // Fetch attendance data
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;
      
      const attendanceData = await attendanceService.getMyAttendance(startDate, endDate);

      const combined = {};
      
      // Add holidays from backend
      if (calendarResponse.holidays) {
        calendarResponse.holidays.forEach((holiday) => {
          const dateKey = holiday.date;
          combined[dateKey] = {
            type: 'holiday',
            status: 'Holiday',
            name: holiday.name,
          };
        });
      }
      
      // Add leave data from backend
      if (calendarResponse.leaves) {
        calendarResponse.leaves.forEach((leave) => {
          const fromDate = new Date(leave.fromdate);
          const toDate = new Date(leave.todate);
          
          for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
            const dateKey = d.toISOString().split('T')[0];
            // Don't override holidays with leaves
            if (!combined[dateKey] || combined[dateKey].type !== 'holiday') {
              combined[dateKey] = {
                type: 'leave',
                status: leave.leavetype,
                details: leave,
              };
            }
          }
        });
      }
      
      // Add attendance data
      if (attendanceData) {
        const records = attendanceData.records || attendanceData;
        if (Array.isArray(records)) {
          records.forEach((record) => {
            const dateKey = record.date;
            // Don't override holidays or leaves
            if (!combined[dateKey]) {
              combined[dateKey] = {
                type: 'attendance',
                status: record.status,
                details: record,
              };
            }
          });
        }
      }
      
      setCalendarData(combined);
      setHolidays(calendarResponse.holidays || []);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      toast.error('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const changeMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getStatusColor = (status) => {
    const colors = {
      Present: '#4caf50',
      Late: '#ff9800',
      Absent: '#f44336',
      'On Leave': '#2196f3',
      Holiday: '#9e9e9e',
      Casual: '#2196f3',
      Sick: '#9c27b0',
      Paid: '#00bcd4',
    };
    return colors[status] || '#e0e0e0';
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="calendar-day empty"></div>
      );
    }

    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const dayData = calendarData[dateKey];
      const isToday = new Date().toDateString() === new Date(dateKey).toDateString();

      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? 'today' : ''} ${dayData ? 'has-data' : ''}`}
          onClick={() => setSelectedDate(dayData ? { date: dateKey, ...dayData } : null)}
        >
          <div className="day-number">{day}</div>
          {dayData && (
            <div
              className="day-status"
              style={{ backgroundColor: getStatusColor(dayData.status) }}
              title={dayData.name || dayData.status}
            >
              {dayData.type === 'holiday' ? dayData.name : dayData.status}
            </div>
          )}
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
          <div className="loading">Loading calendar...</div>
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
            <i className="fa-solid fa-calendar"></i> Calendar View
          </h1>
        </div>

        <div className="calendar-page-container">
          <div className="card calendar-card">
            {/* Calendar Header */}
            <div className="calendar-header">
              <button className="btn btn-secondary" onClick={() => changeMonth(-1)}>
                <i className="fa-solid fa-chevron-left"></i> Previous
              </button>
              <h2>
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button className="btn btn-secondary" onClick={() => changeMonth(1)}>
                Next <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="calendar-weekdays">
              <div className="weekday">Sun</div>
              <div className="weekday">Mon</div>
              <div className="weekday">Tue</div>
              <div className="weekday">Wed</div>
              <div className="weekday">Thu</div>
              <div className="weekday">Fri</div>
              <div className="weekday">Sat</div>
            </div>

            {/* Calendar Grid */}
            <div className="calendar-grid">{renderCalendar()}</div>
          </div>

          {/* Legend */}
          <div className="card">
            <h3>
              <i className="fa-solid fa-info-circle"></i> Legend
            </h3>
            <div className="calendar-legend">
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#4caf50' }}></span>
                <span>Present</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#ff9800' }}></span>
                <span>Late</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#2196f3' }}></span>
                <span>Casual Leave</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#9c27b0' }}></span>
                <span>Sick Leave</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#00bcd4' }}></span>
                <span>Paid Leave</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#f44336' }}></span>
                <span>Absent</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#9e9e9e' }}></span>
                <span>Public Holiday</span>
              </div>
            </div>
          </div>

          {/* Holidays List */}
          {holidays.length > 0 && (
            <div className="card">
              <h3>
                <i className="fa-solid fa-gift"></i> Public Holidays ({monthNames[currentDate.getMonth()]})
              </h3>
              <div className="holidays-list">
                {holidays.map((holiday, index) => (
                  <div key={index} className="holiday-item">
                    <span className="holiday-date">{new Date(holiday.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    <span className="holiday-name">{holiday.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected Date Details */}
          {selectedDate && (
            <div className="card">
              <h3>
                <i className="fa-solid fa-info-circle"></i> Details for{' '}
                {new Date(selectedDate.date).toLocaleDateString('en-IN', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </h3>
              <div className="date-details">
                <p>
                  <strong>Type:</strong> {selectedDate.type}
                </p>
                <p>
                  <strong>Status:</strong> {selectedDate.status}
                </p>

                {selectedDate.type === 'holiday' && (
                  <p>
                    <strong>Holiday:</strong> {selectedDate.name}
                  </p>
                )}

                {selectedDate.type === 'attendance' && selectedDate.details && (
                  <>
                    <p>
                      <strong>Check In:</strong> {selectedDate.details.checkin || 'N/A'}
                    </p>
                    <p>
                      <strong>Check Out:</strong> {selectedDate.details.checkout || 'N/A'}
                    </p>
                    <p>
                      <strong>Total Hours:</strong> {selectedDate.details.totalhours || 0} hrs
                    </p>
                  </>
                )}

                {selectedDate.type === 'leave' && selectedDate.details && (
                  <>
                    <p>
                      <strong>Leave Type:</strong> {selectedDate.details.leavetype}
                    </p>
                    <p>
                      <strong>From:</strong> {selectedDate.details.fromdate}
                    </p>
                    <p>
                      <strong>To:</strong> {selectedDate.details.todate}
                    </p>
                    {selectedDate.details.reason && (
                      <p>
                        <strong>Reason:</strong> {selectedDate.details.reason}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CalendarPage;
