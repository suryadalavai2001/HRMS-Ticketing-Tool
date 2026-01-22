import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './components/auth/Login';

// Pages
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import AttendancePage from './pages/AttendancePage';
import LeavePage from './pages/LeavePage';
import DocumentsPage from './pages/DocumentsPage';
import PayslipPage from './pages/PayslipPage';
import DirectoryPage from './pages/DirectoryPage';
import CalendarPage from './pages/CalendarPage';
import TimesheetPage from './pages/TimesheetPage';
import AdminTimesheetPage from './pages/AdminTimesheetPage';
import AdminPayslipPage from './pages/AdminPayslipPage';

function App() {
  return (
    <div className="App">
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
        <Route path="/leave" element={<ProtectedRoute><LeavePage /></ProtectedRoute>} />
        <Route path="/documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
        <Route path="/payslip" element={<ProtectedRoute><PayslipPage /></ProtectedRoute>} />
        <Route path="/directory" element={<ProtectedRoute><DirectoryPage /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
        <Route path="/timesheet" element={<ProtectedRoute><TimesheetPage /></ProtectedRoute>} />
        
        {/* ✅ NEW ADMIN ROUTES */}
        <Route path="/admin/timesheet" element={ <ProtectedRoute roles={['Admin']}><AdminTimesheetPage /></ProtectedRoute>}/>
        <Route path="/admin/payslips"element={<ProtectedRoute roles={['Admin']}><AdminPayslipPage /></ProtectedRoute>}/>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

export default App;
