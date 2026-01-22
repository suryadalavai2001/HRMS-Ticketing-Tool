import React, { useState, useEffect, useContext } from 'react';
import Sidebar from '../components/common/Sidebar';
import { AuthContext } from '../context/AuthContext';
import employeeService from '../api/employeeService';
import { toast } from 'react-toastify';
import { formatDate } from '../utils/helpers';

const ProfilePage = () => {
  const { user,refreshUser } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await employeeService.getMyProfile();
      setProfile(data);
      setFormData(data);
    } catch (error) {
      toast.error('Failed to load profile');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await employeeService.updateProfile(formData);
      toast.success('Profile updated successfully');
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await employeeService.changePassword(
        passwordData.old_password,
        passwordData.new_password,
        passwordData.confirm_password
      );
      toast.success('Password changed successfully');
      setShowPasswordForm(false);
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);

    try {
      await employeeService.uploadProfilePhoto(formData);
      toast.success('Profile photo updated');
      await fetchProfile();
      await refreshUser();
      window.location.reload();
    } catch (error) {
      toast.error('Failed to upload photo');
    }
  };

  if (!profile) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="content">
          <div className="loading">Loading profile...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="content">
        <div className="page-header">
          <h1><i className="fa-solid fa-user"></i> My Profile</h1>
        </div>

        <div className="profile-container">
          {/* Profile Photo Section */}
          <div className="card">
            <h2>Profile Photo</h2>
            <div className="profile-photo-section">
              <div className="profile-photo-large">
                    {profile.profile_photo ? (
                        <img src={profile.profile_photo} alt={profile.name} />
                    ) : (
                        <div className="initials-avatar-large">{profile.name?.split(' ').map(n => n[0]).join('').toUpperCase()}</div>
                    )}
                    </div>
              <div className="profile-photo-actions">
                <label htmlFor="photo-upload" className="btn btn-primary">
                  <i className="fa-solid fa-camera"></i> Change Photo
                </label>
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="card">
            <div className="card-header-flex">
              <h2>Personal Information</h2>
              {/* {!isEditing && (
                <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>
                  <i className="fa-solid fa-edit"></i> Edit
                </button>
              )} */}
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label>Employee ID</label>
                    <input
                      type="text"
                      value={formData.employee_id || ''}
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label>Department</label>
                    <input
                      type="text"
                      value={formData.department || ''}
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <input
                      type="text"
                      value={formData.role || ''}
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label>Designation</label>
                    <input
                      type="text"
                      value={formData.role_level || ''}
                      readOnly
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-success">
                    <i className="fa-solid fa-save"></i> Save Changes
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(profile);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="info-grid">
                <div className="info-item">
                  <label>Name:</label>
                  <span>{profile.name}</span>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <span>{profile.email}</span>
                </div>
                <div className="info-item">
                  <label>Employee ID:</label>
                  <span>{profile.employee_id}</span>
                </div>
                <div className="info-item">
                  <label>Department:</label>
                  <span>{profile.department}</span>
                </div>
                <div className="info-item">
                  <label>Role:</label>
                  <span>{profile.role}</span>
                </div>
                <div className="info-item">
                  <label>Designation:</label>
                  <span>{profile.role_level}</span>
                </div>
                <div className="info-item">
                  <label>Date of Joining:</label>
                  <span>{formatDate(profile.date_of_joining)}</span>
                </div>
                {profile.manager_name && (
                  <div className="info-item">
                    <label>Manager:</label>
                    <span>{profile.manager_name}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Change Password Section */}
          <div className="card">
            <div className="card-header-flex">
              <h2>Change Password</h2>
              {!showPasswordForm && (
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowPasswordForm(true)}
                >
                  <i className="fa-solid fa-key"></i> Change Password
                </button>
              )}
            </div>

            {showPasswordForm && (
              <form onSubmit={handlePasswordSubmit}>
                <div className="form-group">
                  <label>Old Password</label>
                  <input
                    type="password"
                    name="old_password"
                    value={passwordData.old_password}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    required
                    minLength={8}
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    name="confirm_password"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-success">
                    <i className="fa-solid fa-save"></i> Update Password
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
