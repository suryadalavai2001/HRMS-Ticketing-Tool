import React, { useState } from 'react';
import { toast } from 'react-toastify';
import employeeService from '../../api/employeeService';

const CreateEmployeeModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    employee_id: '',
    name: '',
    email: '',
    password: '',
    confirm_password: '',
    role: 'Employee',
    department: '',
    role_level: '',
    date_of_joining: '',
    manager_id: '',
    initial_salary: ''
  });
  
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    // Prepare data with correct types
    const submitData = {
      employee_id: parseInt(formData.employee_id), // ✅ Convert to integer
      name: formData.name,
      email: formData.email,
      password: formData.password,
      confirm_password: formData.confirm_password,
      role: formData.role,
      department: formData.department,
      role_level: formData.role_level,
      date_of_joining: formData.date_of_joining,
    };

    // Only add optional fields if they have values
    if (formData.manager_id && formData.manager_id.trim() !== '') {
      submitData.manager_id = parseInt(formData.manager_id);
    }
    
    if (formData.initial_salary && formData.initial_salary.trim() !== '') {
      submitData.initial_salary = parseFloat(formData.initial_salary);
    }
    
    setLoading(true);
    try {
      await employeeService.createEmployee(submitData);
      toast.success('Employee created successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      // Better error handling
      const errorData = error.response?.data;
      if (errorData) {
        // Check for specific field errors
        if (errorData.employee_id) {
          toast.error(`Employee ID: ${errorData.employee_id}`);
        } else if (errorData.email) {
          toast.error(`Email: ${errorData.email}`);
        } else if (errorData.error) {
          toast.error(errorData.error);
        } else {
          // Show all validation errors
          const errors = Object.entries(errorData)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('\n');
          toast.error(errors || 'Failed to create employee');
        }
      } else {
        toast.error('Failed to create employee');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2><i className="fa-solid fa-user-plus"></i> Add New Employee</h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fa-solid fa-times"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Basic Information Section */}
          <div className="form-section">
            <div className="form-section-title">
              <i className="fa-solid fa-user"></i>
              Basic Information
            </div>
            <div className="form-grid-modal">
              <div className="form-group">
                <label>Employee ID <span className="required">*</span></label>
                <input
                  type="number"
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={handleChange}
                  placeholder="Enter employee ID"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Full Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                />
              </div>
              
              <div className="form-group full-width">
                <label>Email <span className="required">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="form-section">
            <div className="form-section-title">
              <i className="fa-solid fa-lock"></i>
              Security
            </div>
            <div className="form-grid-modal">
              <div className="form-group">
                <label>Password <span className="required">*</span></label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password (min 8 characters)"
                  required
                  minLength="8"
                />
              </div>
              
              <div className="form-group">
                <label>Confirm Password <span className="required">*</span></label>
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  required
                />
              </div>
            </div>
          </div>

          {/* Job Details Section */}
          <div className="form-section">
            <div className="form-section-title">
              <i className="fa-solid fa-briefcase"></i>
              Job Details
            </div>
            <div className="form-grid-modal">
              <div className="form-group">
                <label>Role <span className="required">*</span></label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="Employee">Employee</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Department <span className="required">*</span></label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g., Flight Operations"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Designation <span className="required">*</span></label>
                <input
                  type="text"
                  name="role_level"
                  value={formData.role_level}
                  onChange={handleChange}
                  placeholder="e.g., Senior Pilot"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Date of Joining <span className="required">*</span></label>
                <input
                  type="date"
                  name="date_of_joining"
                  value={formData.date_of_joining}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Manager ID</label>
                <input
                  type="number"
                  name="manager_id"
                  value={formData.manager_id}
                  onChange={handleChange}
                  placeholder="Leave blank if no manager"
                />
              </div>
              
              <div className="form-group">
                <label>Initial Salary</label>
                <input
                  type="number"
                  name="initial_salary"
                  value={formData.initial_salary}
                  onChange={handleChange}
                  placeholder="Enter salary amount"
                  step="0.01"
                />
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className={`btn btn-success ${loading ? 'btn-loading' : ''}`} disabled={loading}>
              <i className="fa-solid fa-check"></i>
              <span>{loading ? 'Creating...' : 'Create Employee'}</span>
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              <i className="fa-solid fa-times"></i>
              <span>Cancel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEmployeeModal;
    