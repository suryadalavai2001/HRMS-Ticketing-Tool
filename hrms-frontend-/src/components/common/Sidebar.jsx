import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import '../../styles/sidebar.css';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <aside className="sidebar">
      {/* User Profile Section */}
      <div className="user-block">
        <div className="avatar">
          {user?.profile_photo ? (
            <img src={user.profile_photo} alt={user.name} />
          ) : (
            <div className="avatar-initials">{getInitials(user?.name)}</div>
          )}
        </div>
        <div className="user-info">
          <div className="user-name">{user?.name || 'User'}</div>
          <div className="user-role">{user?.role || 'Employee'}</div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="menu">
        {/* Common Menu Items for All Users */}
        <Link to="/dashboard" className={`menu-item ${isActive('/dashboard') || isActive('/')}`}>
          <i className="fa-solid fa-house icon"></i>
          <span className="label">Home</span>
        </Link>

        <Link to="/profile" className={`menu-item ${isActive('/profile')}`}>
          <i className="fa-solid fa-user icon"></i>
          <span className="label">My Profile</span>
        </Link>

        <Link to="/documents" className={`menu-item ${isActive('/documents')}`}>
          <i className="fa-solid fa-folder-open icon"></i>
          <span className="label">My Documents</span>
        </Link>

        <Link to="/timesheet" className={`menu-item ${isActive('/timesheet')}`}>
          <i className="fa-regular fa-clock icon"></i>
          <span className="label">Timesheets</span>
        </Link>

        <Link to="/attendance" className={`menu-item ${isActive('/attendance')}`}>
          <i className="fa-solid fa-clipboard-check icon"></i>
          <span className="label">Attendance</span>
        </Link>

        <Link to="/leave" className={`menu-item ${isActive('/leave')}`}>
          <i className="fa-regular fa-calendar-days icon"></i>
          <span className="label">Time Off & Leave</span>
        </Link>

        <Link to="/payslip" className={`menu-item ${isActive('/payslip')}`}>
          <i className="fa-solid fa-file-invoice icon"></i>
          <span className="label">Payslip</span>
        </Link>

        <Link to="/calendar" className={`menu-item ${isActive('/calendar')}`}>
          <i className="fa-solid fa-calendar icon"></i>
          <span className="label">Calendar</span>
        </Link>

        {/* Manager & Admin Menu Items */}
        {(user?.role === 'Manager' || user?.role === 'Admin') && (
          <Link to="/directory" className={`menu-item ${isActive('/directory')}`}>
            <i className="fa-solid fa-address-book icon"></i>
            <span className="label">Directory</span>
          </Link>
        )}

        {/* ✅ Admin-Only Menu Items */}
        {user?.role === 'Admin' && (
          <>
            <div className="menu-divider">
              <span>Admin Panel</span>
            </div>

            <Link to="/admin/timesheet" className={`menu-item ${isActive('/admin/timesheet')}`}>
              <i className="fa-solid fa-users-clock icon"></i>
              <span className="label">All Timesheets</span>
            </Link>

            <Link to="/admin/payslips" className={`menu-item ${isActive('/admin/payslips')}`}>
              <i className="fa-solid fa-file-invoice-dollar icon"></i>
              <span className="label">Bulk Payslips</span>
            </Link>
          </>
        )}

        {/* Logout Button */}
        <button onClick={logout} className="menu-item logout-btn">
          <i className="fa-solid fa-sign-out-alt icon"></i>
          <span className="label">Logout</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
