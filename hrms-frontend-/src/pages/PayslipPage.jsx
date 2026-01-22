import React, { useState, useEffect, useContext } from "react";
import Sidebar from "../components/common/Sidebar";
import { AuthContext } from "../context/AuthContext";
import salaryService from "../api/salaryService";
import { toast } from "react-toastify";
import { formatCurrency, downloadBlob } from "../utils/helpers";

const PayslipPage = () => {
  const { user } = useContext(AuthContext);
  const [salary, setSalary] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [payslipData, setPayslipData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchSalaryData();
  }, []);

  const fetchSalaryData = async () => {
    try {
      const data = await salaryService.getMySalary();
        console.log("Raw Salary Data from API:", data);  // ✅ ADD THIS LINE
        setSalary(data);
    } catch (error) {
      console.error("Error fetching salary:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePayslip = async () => {
    setGenerating(true);
    try {
      const data = await salaryService.generatePayslip(
        user.employee_id,
        selectedMonth,
        selectedYear
      );
      setPayslipData(data);
      toast.success('Payslip generated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to generate payslip');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const blob = await salaryService.downloadPayslipPDF(
        user.employee_id,
        selectedMonth,
        selectedYear
      );
      downloadBlob(blob, `payslip_${selectedMonth}_${selectedYear}.pdf`);
      toast.success('Payslip downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download payslip');
    }
  };


  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="content">
          <div className="loading">Loading salary data...</div>
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
            <i className="fa-solid fa-file-invoice"></i> Payslip & Salary
          </h1>
        </div>

        {/* Salary Information */}
        {salary && (
          <div className="card salary-card">
            <h2>
              <i className="fa-solid fa-wallet"></i> Salary Information
            </h2>
            
            <div className="salary-summary">
              <div className="salary-row">
                <span className="salary-label">Basic Salary</span>
                <span className="salary-value">{formatCurrency(salary.basic_salary)}</span>
              </div>
              
              <div className="salary-row">
                <span className="salary-label">HRA (40%)</span>
                <span className="salary-value positive">{formatCurrency(salary.hra)}</span>
              </div>
              
              <div className="salary-row">
                <span className="salary-label">PF Deduction (12%)</span>
                <span className="salary-value negative">-{formatCurrency(salary.pf)}</span>
              </div>
              
              <div className="salary-divider"></div>
              
              <div className="salary-row net-salary">
                <span className="salary-label">Net Salary</span>
                <span className="salary-value">{formatCurrency(salary.net_salary)}</span>
              </div>
            </div>

            <div className="breakdown-section">
              <h3>Breakdown:</h3>
              <div className="breakdown-details">
                <p>Basic Salary: <strong>{formatCurrency(salary.basic_salary)}</strong></p>
                <p>+ HRA (40% of Basic): <strong>{formatCurrency(salary.hra)}</strong></p>
                <p>- PF (12% of Basic): <strong>{formatCurrency(salary.pf)}</strong></p>
                <div className="breakdown-divider"></div>
                <p className="breakdown-total">
                  <strong>Net Salary: {formatCurrency(salary.net_salary)}</strong>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Generate Payslip */}
        <div className="card payslip-generator-card">
          <h2>
            <i className="fa-solid fa-file-pdf"></i> Generate Payslip
          </h2>
          
          <div className="payslip-controls">
            <div className="control-group">
              <label>Select Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="payslip-select"
              >
                {months.map((month, index) => (
                  <option key={index} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            <div className="control-group">
              <label>Select Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="payslip-select"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="btn btn-primary btn-generate"
              onClick={handleGeneratePayslip}
              disabled={generating}
            >
              <i className="fa-solid fa-file-alt"></i>
              {generating ? " Generating..." : " Generate Payslip"}
            </button>
          </div>

          {/* Payslip Preview */}
          {payslipData && (
            <div className="payslip-preview">
              <div className="preview-header">
                <h3>Payslip Preview - {months[selectedMonth - 1]} {selectedYear}</h3>
                <button
                  className="btn btn-success"
                  onClick={handleDownloadPDF}
                >
                  <i className="fa-solid fa-download"></i> Download PDF
                </button>
              </div>

              <div className="payslip-document">
                <div className="payslip-company">
                  <h4>ConZura Groups</h4>
                  <p>Employee Payslip</p>
                </div>

                <div className="payslip-employee-info">
                  <div className="info-row">
                    <span>Employee Name:</span>
                    <strong>{user?.name}</strong>
                  </div>
                  <div className="info-row">
                    <span>Employee ID:</span>
                    <strong>{user?.employee_id}</strong>
                  </div>
                  <div className="info-row">
                    <span>Department:</span>
                    <strong>{user?.department}</strong>
                  </div>
                  <div className="info-row">
                    <span>Month:</span>
                    <strong>{months[selectedMonth - 1]} {selectedYear}</strong>
                  </div>
                </div>

                <table className="payslip-table">
                  <thead>
                    <tr>
                      <th>Component</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Basic Salary</td>
                      <td>{formatCurrency(payslipData.basic_salary)}</td>
                    </tr>
                    <tr>
                      <td>HRA (40%)</td>
                      <td>{formatCurrency(payslipData.hra)}</td>
                    </tr>
                    <tr className="gross-row">
                      <td><strong>Gross Salary</strong></td>
                      <td><strong>{formatCurrency(payslipData.gross_salary)}</strong></td>
                    </tr>
                    <tr className="deduction-row">
                      <td>PF Deduction (12%)</td>
                      <td>-{formatCurrency(payslipData.pf)}</td>
                    </tr>
                    <tr className="net-row">
                      <td><strong>Net Salary</strong></td>
                      <td><strong>{formatCurrency(payslipData.net_salary)}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PayslipPage;
