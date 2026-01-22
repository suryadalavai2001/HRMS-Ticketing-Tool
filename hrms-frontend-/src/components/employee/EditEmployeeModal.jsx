import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import employeeService from '../../api/employeeService';

const EditEmployeeModal = ({ employee, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    role_level: '',
    manager_id: '',
    is_active: true
  });
  
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        email: employee.email || '',
        role: employee.role || '',
        department: employee.department || '',
        role_level: employee.role_level || '',
        manager_id: employee.manager_id || '',
        is_active: employee.is_active !== undefined ? employee.is_active : true
      });
    }
  }, [employee]);
  
  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      await employeeService.updateEmployee(employee.employee_id, formData);
      toast.success('Employee updated successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update employee');
    } finally {
      setLoading(false);
    }
  };
  
  if (!employee) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2><i className="fa-solid fa-user-edit"></i> Edit Employee Details</h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fa-solid fa-times"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="employee-info-badge">
            <strong>Employee ID:</strong> {employee.employee_id}
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name <span className="required">*</span></label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Email <span className="required">*</span></label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
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
            
            <div className="form-group full-width">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                />
                <span>Active Employee</span>
              </label>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn btn-success" disabled={loading}>
              <i className="fa-solid fa-save"></i>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              <i className="fa-solid fa-times"></i>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEmployeeModal;
