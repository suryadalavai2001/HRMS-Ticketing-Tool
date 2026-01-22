import React, { useState, useEffect, useContext } from 'react';
import Sidebar from '../components/common/Sidebar';
import { AuthContext } from '../context/AuthContext';
import leaveService from '../api/leaveService';
import { toast } from 'react-toastify';
import { formatDate, getStatusColor } from '../utils/helpers';
import { LEAVE_TYPES } from '../utils/constants';

const LeavePage = () => {
  const { user } = useContext(AuthContext);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [formData, setFormData] = useState({
    leave_type: '',
    from_date: '',
    to_date: '',
    reason: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const fetchLeaveData = async () => {
  try {
    const [balance, history] = await Promise.all([
      leaveService.getLeaveBalance(),
      leaveService.getMyLeaves(),
    ]);
    
    console.log("Leave Balance:", balance);
    console.log("Leave History:", history);
    
    setLeaveBalance(balance);
    
    // Fix: Handle different response structures
    if (history) {
      if (Array.isArray(history)) {
        setLeaveHistory(history);
      } else if (history.leaves && Array.isArray(history.leaves)) {
        setLeaveHistory(history.leaves);
      } else if (history.data && Array.isArray(history.data)) {
        setLeaveHistory(history.data);
      } else {
        console.log("Unexpected history format:", history);
        setLeaveHistory([]);
      }
    }

    // Fetch pending leaves if manager
    if (user?.role === "Manager" || user?.role === "Admin") {
      const pending = await leaveService.getPendingLeaves();
      console.log("Pending Leaves:", pending);
      
      if (pending) {
        if (Array.isArray(pending)) {
          setPendingLeaves(pending);
        } else if (pending.leaves) {
          setPendingLeaves(pending.leaves);
        } else if (pending.data) {
          setPendingLeaves(pending.data);
        } else {
          setPendingLeaves([]);
        }
      }
    }
  } catch (error) {
    console.error("Error fetching leave data:", error);
    toast.error("Failed to load leave data");
  } finally {
    setLoading(false);
  }
};


  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.leave_type || !formData.from_date || !formData.to_date) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await leaveService.applyLeave({
        employee: user.employee_id,
        leave_type: formData.leave_type,
        from_date: formData.from_date,
        to_date: formData.to_date,
        reason: formData.reason,
      });

      toast.success('Leave application submitted successfully!');
      setShowApplyForm(false);
      setFormData({ leave_type: '', from_date: '', to_date: '', reason: '' });
      fetchLeaveData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to apply for leave');
    }
  };

  const handleApprove = async (leaveId) => {
    try {
      await leaveService.approveLeave(leaveId);
      toast.success('Leave approved successfully!');
      fetchLeaveData();
    } catch (error) {
      toast.error('Failed to approve leave');
    }
  };

  const handleReject = async (leaveId) => {
    try {
      await leaveService.rejectLeave(leaveId);
      toast.success('Leave rejected');
      fetchLeaveData();
    } catch (error) {
      toast.error('Failed to reject leave');
    }
  };

  const handleCancel = async (leaveId) => {
    if (!window.confirm('Are you sure you want to cancel this leave request?')) {
      return;
    }

    try {
      await leaveService.cancelLeave(leaveId);
      toast.success('Leave cancelled successfully!');
      fetchLeaveData();
    } catch (error) {
      toast.error('Failed to cancel leave');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="content">
          <div className="loading">Loading leave data...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="content">
        <div className="page-header">
          <h1><i className="fa-regular fa-calendar-days"></i> Leave Management</h1>
          <button className="btn btn-success" onClick={() => setShowApplyForm(!showApplyForm)}>
            <i className="fa-solid fa-plus"></i> Apply for Leave
          </button>
        </div>

        {/* Leave Balance Card */}
        <div className="card">
          <h2><i className="fa-solid fa-chart-pie"></i> Leave Balance</h2>
          
          <div className="leave-balance-grid">
            <div className="balance-card casual">
              <h3>Casual Leave</h3>
              <p className="balance-number">{leaveBalance?.casual_leave_remaining || 0}</p>
              <p className="balance-label">days remaining</p>
            </div>

            <div className="balance-card sick">
              <h3>Sick Leave</h3>
              <p className="balance-number">{leaveBalance?.sick_leave_remaining || 0}</p>
              <p className="balance-label">days remaining</p>
            </div>

            <div className="balance-card paid">
              <h3>Paid Leave</h3>
              <p className="balance-number">{leaveBalance?.paid_leave_remaining || 0}</p>
              <p className="balance-label">days remaining</p>
            </div>

            <div className="balance-card total">
              <h3>Total Available</h3>
              <p className="balance-number">
                {(leaveBalance?.casual_leave_remaining || 0) + 
                 (leaveBalance?.sick_leave_remaining || 0) + 
                 (leaveBalance?.paid_leave_remaining || 0)}
              </p>
              <p className="balance-label">days remaining</p>
            </div>
          </div>
        </div>

        {/* Apply Leave Form */}
        {showApplyForm && (
          <div className="card">
            <h2><i className="fa-solid fa-file-alt"></i> Apply for Leave</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Leave Type <span className="required">*</span></label>
                  <select
                    name="leave_type"
                    value={formData.leave_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Leave Type</option>
                    <option value={LEAVE_TYPES.CASUAL}>Casual Leave</option>
                    <option value={LEAVE_TYPES.SICK}>Sick Leave</option>
                    <option value={LEAVE_TYPES.PAID}>Paid Leave</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>From Date <span className="required">*</span></label>
                  <input
                    type="date"
                    name="from_date"
                    value={formData.from_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>To Date <span className="required">*</span></label>
                  <input
                    type="date"
                    name="to_date"
                    value={formData.to_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Reason</label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Enter reason for leave..."
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-success">
                  <i className="fa-solid fa-paper-plane"></i> Submit Application
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowApplyForm(false);
                    setFormData({ leave_type: '', from_date: '', to_date: '', reason: '' });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Leave History */}
        <div className="card">
          <h2><i className="fa-solid fa-history"></i> My Leave History</h2>
          
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>From Date</th>
                  <th>To Date</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th>Applied Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaveHistory.length > 0 ? (
                  leaveHistory.map((leave) => (
                    <tr key={leave.leave_id}>
                      <td>{leave.leave_type}</td>
                      <td>{formatDate(leave.from_date)}</td>
                      <td>{formatDate(leave.to_date)}</td>
                      <td>{leave.days_requested}</td>
                      <td>
                        <span className="badge" style={{ 
                          backgroundColor: getStatusColor(leave.status),
                          color: 'white'
                        }}>
                          {leave.status}
                        </span>
                      </td>
                      <td>{formatDate(leave.applied_date)}</td>
                      <td>
                        {leave.status === 'Pending' && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleCancel(leave.leave_id)}
                          >
                            <i className="fa-solid fa-times"></i> Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">No leave history found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Leave Approvals (Manager/Admin Only) */}
        {(user?.role === 'Manager' || user?.role === 'Admin') && pendingLeaves.length > 0 && (
          <div className="card">
            <h2><i className="fa-solid fa-tasks"></i> Pending Leave Approvals</h2>
            
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Leave Type</th>
                    <th>From Date</th>
                    <th>To Date</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingLeaves.map((leave) => (
                    <tr key={leave.leave_id}>
                      <td>{leave.employee_name}</td>
                      <td>{leave.leave_type}</td>
                      <td>{formatDate(leave.from_date)}</td>
                      <td>{formatDate(leave.to_date)}</td>
                      <td>{leave.days_requested}</td>
                      <td>{leave.reason || 'N/A'}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleApprove(leave.leave_id)}
                          >
                            <i className="fa-solid fa-check"></i> Approve
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleReject(leave.leave_id)}
                          >
                            <i className="fa-solid fa-times"></i> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default LeavePage;
