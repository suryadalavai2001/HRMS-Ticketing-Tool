import React, { useState, useContext } from 'react';
import Sidebar from '../components/common/Sidebar';
import { AuthContext } from '../context/AuthContext';
import employeeService from '../api/employeeService';
import { toast } from 'react-toastify';
import '../styles/adminpanel.css';

const AdminPayslipPage = () => {
  const { user } = useContext(AuthContext);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedPayslips, setSelectedPayslips] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  // Generate bulk payslips
  const handleBulkGenerate = async () => {
    if (!window.confirm(`Generate payslips for all employees for ${months[selectedMonth - 1]} ${selectedYear}?`)) {
      return;
    }

    setGenerating(true);
    try {
      const result = await employeeService.generateBulkPayslips(selectedMonth, selectedYear);
      
      const summary = result.summary || result;
      const successCount = summary.success || 0;
      const skippedCount = summary.skipped || 0;
      const errorCount = summary.errors || 0;
      
      if (successCount > 0 || skippedCount > 0) {
        toast.success(
          `Payslip generation completed! Success: ${successCount}, Skipped: ${skippedCount}, Errors: ${errorCount}`
        );
        fetchPayslips();
      } else {
        toast.warning('No payslips generated. Check if employees have salary records.');
      }
    } catch (error) {
      const responseData = error.response?.data;
      if (responseData && responseData.message === 'Bulk payslip generation completed') {
        const summary = responseData.summary || {};
        toast.success(
          `Payslips generated! Success: ${summary.success || 0}, Skipped: ${summary.skipped || 0}, Errors: ${summary.errors || 0}`
        );
        fetchPayslips();
        return;
      }
      
      const errorMessage = error.response?.data?.error 
        || error.response?.data?.message 
        || 'Failed to generate payslips';
      
      toast.error(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  // Fetch all payslips for selected month
  const fetchPayslips = async () => {
    setLoading(true);
    try {
      const data = await employeeService.getAllPayslipsForMonth(selectedMonth, selectedYear);
      setPayslips(data.payslips || []);
      setSelectedPayslips(new Set());
      setSelectAll(false);
      toast.success('Payslips loaded successfully');
    } catch (error) {
      toast.error('Failed to load payslips');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Download single payslip
  const handleDownloadPayslip = async (payslip) => {
    try {
      // Extract employee_id from filename or use document_id
      const employeeId = payslip.employee_id;
      
      // Use the existing download endpoint
      const url = `http://localhost:8000/api/payslip/download/${employeeId}/${selectedMonth}/${selectedYear}/`;
      
      // Create a temporary link and click it
      const link = document.createElement('a');
      link.href = url;
      link.download = payslip.filename;
      link.target = '_blank';
      
      // Add authorization header by opening in new window with token
      const token = localStorage.getItem('access_token');
      
      // Fetch the file with authorization
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      link.href = blobUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      toast.success('Payslip downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download payslip');
      console.error(error);
    }
  };

  // Toggle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedPayslips(new Set());
    } else {
      setSelectedPayslips(new Set(payslips.map(p => p.document_id)));
    }
    setSelectAll(!selectAll);
  };

  // Toggle individual payslip selection
  const handleTogglePayslip = (documentId) => {
    const newSelected = new Set(selectedPayslips);
    if (newSelected.has(documentId)) {
      newSelected.delete(documentId);
    } else {
      newSelected.add(documentId);
    }
    setSelectedPayslips(newSelected);
    setSelectAll(newSelected.size === payslips.length);
  };

  // Download selected payslips as ZIP
  const handleDownloadSelected = async () => {
    if (selectedPayslips.size === 0) {
      toast.warning('Please select at least one payslip to download');
      return;
    }

    try {
      toast.info(`Downloading ${selectedPayslips.size} payslip(s)...`);
      
      const selectedPayslipData = payslips.filter(p => selectedPayslips.has(p.document_id));
      
      // Download each payslip individually
      for (const payslip of selectedPayslipData) {
        await handleDownloadPayslip(payslip);
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      toast.success(`Downloaded ${selectedPayslips.size} payslip(s) successfully!`);
    } catch (error) {
      toast.error('Failed to download selected payslips');
      console.error(error);
    }
  };

  // Delete payslip
  const handleDeletePayslip = async (documentId, employeeName) => {
    if (!window.confirm(`Delete payslip for ${employeeName}?`)) {
      return;
    }

    try {
      await employeeService.deletePayslip(documentId);
      toast.success('Payslip deleted successfully');
      fetchPayslips();
    } catch (error) {
      toast.error('Failed to delete payslip');
      console.error(error);
    }
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
            <p>Only administrators can access payslip management.</p>
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
            <i className="fa-solid fa-file-invoice-dollar"></i> Admin Payslip Management
          </h1>
        </div>

        {/* Controls */}
        <div className="card">
          <div className="payslip-controls">
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

            <div className="action-buttons">
              <button
                className="btn btn-success"
                onClick={handleBulkGenerate}
                disabled={generating}
              >
                <i className="fa-solid fa-file-invoice"></i>
                {generating ? 'Generating...' : 'Generate All Payslips'}
              </button>

              <button
                className="btn btn-primary"
                onClick={fetchPayslips}
                disabled={loading}
              >
                <i className="fa-solid fa-sync"></i>
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Download Actions */}
        {payslips.length > 0 && (
          <div className="card">
            <div className="bulk-actions">
              <div className="bulk-select">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
                <label htmlFor="select-all">
                  Select All ({selectedPayslips.size} of {payslips.length} selected)
                </label>
              </div>
              <button
                className="btn btn-primary"
                onClick={handleDownloadSelected}
                disabled={selectedPayslips.size === 0}
              >
                <i className="fa-solid fa-download"></i>
                Download Selected ({selectedPayslips.size})
              </button>
            </div>
          </div>
        )}

        {/* Payslips Table */}
        {payslips.length > 0 && (
          <div className="card">
            <h2>
              <i className="fa-solid fa-list"></i> Payslips for {months[selectedMonth - 1]} {selectedYear}
            </h2>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th width="50">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Basic Salary</th>
                    <th>HRA</th>
                    <th>PF</th>
                    <th>Net Salary</th>
                    <th>Generated On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payslips.map((payslip) => (
                    <tr key={payslip.document_id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedPayslips.has(payslip.document_id)}
                          onChange={() => handleTogglePayslip(payslip.document_id)}
                        />
                      </td>
                      <td>{payslip.employee_id}</td>
                      <td>{payslip.employee_name}</td>
                      <td>{payslip.department}</td>
                      <td>₹{parseFloat(payslip.basic_salary).toLocaleString()}</td>
                      <td>₹{parseFloat(payslip.hra).toLocaleString()}</td>
                      <td>₹{parseFloat(payslip.pf).toLocaleString()}</td>
                      <td>
                        <strong>₹{parseFloat(payslip.net_salary).toLocaleString()}</strong>
                      </td>
                      <td>{new Date(payslip.uploaded_at).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons-inline">
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleDownloadPayslip(payslip)}
                            title="Download Payslip"
                          >
                            <i className="fa-solid fa-download"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeletePayslip(payslip.document_id, payslip.employee_name)}
                            title="Delete Payslip"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="payslip-summary">
              <p>
                <strong>Total Payslips:</strong> {payslips.length}
              </p>
              <p>
                <strong>Total Disbursement:</strong> ₹
                {payslips
                  .reduce((sum, p) => sum + parseFloat(p.net_salary), 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && payslips.length === 0 && (
          <div className="card">
            <div className="empty-state">
              <i className="fa-solid fa-inbox"></i>
              <p>No payslips found for {months[selectedMonth - 1]} {selectedYear}</p>
              <p className="text-muted">Click "Generate All Payslips" to create payslips for all employees</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPayslipPage;
