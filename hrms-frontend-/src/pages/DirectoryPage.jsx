import React, { useState, useEffect, useContext } from 'react';
import Sidebar from '../components/common/Sidebar';
import { AuthContext } from '../context/AuthContext';
import employeeService from '../api/employeeService';
import { getInitials } from '../utils/helpers';
import CreateEmployeeModal from '../components/employee/CreateEmployeeModal';
import EditEmployeeModal from '../components/employee/EditEmployeeModal';
import { toast } from 'react-toastify';
import '../styles/directory.css'; // ✅ ADD THIS LINE
const DirectoryPage = () => {
  const { user } = useContext(AuthContext);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedRole, setSelectedRole] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [searchTerm, selectedDepartment, selectedRole, employees]);

  const fetchEmployees = async () => {
    try {
      const data = await employeeService.getAllEmployees();
      setEmployees(data.employees || data);
      setFilteredEmployees(data.employees || data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = [...employees];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (emp) =>
          emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.employee_id.toString().includes(searchTerm)
      );
    }

    // Filter by department
    if (selectedDepartment !== 'All') {
      filtered = filtered.filter((emp) => emp.department === selectedDepartment);
    }

    // Filter by role
    if (selectedRole !== 'All') {
      filtered = filtered.filter((emp) => emp.role === selectedRole);
    }

    setFilteredEmployees(filtered);
  };

  const departments = ['All', ...new Set(employees.map((emp) => emp.department))];
  const roles = ['All', 'Admin', 'Manager', 'Employee'];

  const getRoleColor = (role) => {
    const colors = {
      Admin: '#dc3545',
      Manager: '#ffc107',
      Employee: '#007bff',
    };
    return colors[role] || '#6c757d';
  };

  const handleEditClick = (employee) => {
    setSelectedEmployee(employee);
    setShowEditModal(true);
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedEmployee(null);
  };

  const handleSuccess = () => {
    fetchEmployees();
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
            <p>Only administrators can access the Company Directory.</p>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="content">
          <div className="loading">Loading directory...</div>
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
            <i className="fa-solid fa-address-book"></i> Company Directory
          </h1>
          <button className="btn btn-success" onClick={() => setShowCreateModal(true)}>
            <i className="fa-solid fa-user-plus"></i> Add New Employee
          </button>
        </div>

        {/* Search and Filters */}
        <div className="card">
          <div className="directory-filters">
            <div className="search-box">
              <i className="fa-solid fa-search"></i>
              <input
                type="text"
                placeholder="Search by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="results-count">
            Showing {filteredEmployees.length} of {employees.length} employees
          </p>
        </div>

        {/* Employee Cards Grid */}
        <div className="employee-grid">
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((employee) => (
              <div 
                key={employee.employee_id} 
                className="employee-card"
                onClick={() => handleEditClick(employee)}
                style={{ cursor: 'pointer' }}
              >
                <div className="employee-card-header">
                  <div
                    className="employee-avatar"
                    style={{ backgroundColor: getRoleColor(employee.role) }}
                  >
                    {employee.profile_photo ? (
                      <img src={employee.profile_photo} alt={employee.name} />
                    ) : (
                      getInitials(employee.name)
                    )}
                  </div>
                  <span
                    className="role-badge"
                    style={{ backgroundColor: getRoleColor(employee.role) }}
                  >
                    {employee.role}
                  </span>
                </div>

                <div className="employee-card-body">
                  <h3>{employee.name}</h3>
                  <p className="employee-designation">{employee.role_level}</p>

                  <div className="employee-details">
                    <div className="detail-item">
                      <i className="fa-solid fa-id-card"></i>
                      <span>ID: {employee.employee_id}</span>
                    </div>
                    <div className="detail-item">
                      <i className="fa-solid fa-building"></i>
                      <span>{employee.department}</span>
                    </div>
                    <div className="detail-item">
                      <i className="fa-solid fa-envelope"></i>
                      <span>{employee.email}</span>
                    </div>
                    {employee.manager_name && (
                      <div className="detail-item">
                        <i className="fa-solid fa-user-tie"></i>
                        <span>Reports to: {employee.manager_name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <i className="fa-solid fa-users-slash"></i>
              <p>No employees found matching your criteria</p>
            </div>
          )}
        </div>

        {/* Modals */}
        {showCreateModal && (
          <CreateEmployeeModal
            onClose={handleModalClose}
            onSuccess={handleSuccess}
          />
        )}

        {showEditModal && selectedEmployee && (
          <EditEmployeeModal
            employee={selectedEmployee}
            onClose={handleModalClose}
            onSuccess={handleSuccess}
          />
        )}
      </main>
    </div>
  );
};

export default DirectoryPage;
