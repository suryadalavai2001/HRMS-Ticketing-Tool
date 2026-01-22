import React, { useState } from 'react';
import employeeService from '../../api/employeeService';
import { toast } from 'react-toastify';

const ProfilePhotoUpload = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should not exceed 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('profile_photo', selectedFile);

    setUploading(true);
    try {
      await employeeService.uploadProfilePhoto(formData);
      toast.success('Profile photo updated successfully!');
      if (onUploadSuccess) {
        onUploadSuccess();
      }
      setSelectedFile(null);
      setPreview(null);
    } catch (error) {
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(null);
    if (preview) {
      URL.revokeObjectURL(preview);
    }
  };

  return (
    <div className="photo-upload-container">
      <div className="photo-preview">
        {preview ? (
          <img src={preview} alt="Preview" />
        ) : (
          <div className="photo-placeholder">
            <i className="fa-solid fa-camera"></i>
            <p>No photo selected</p>
          </div>
        )}
      </div>

      <div className="photo-upload-actions">
        <label htmlFor="photo-input" className="btn btn-secondary">
          <i className="fa-solid fa-folder-open"></i> Choose Photo
        </label>
        <input
          type="file"
          id="photo-input"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {selectedFile && (
          <>
            <button
              className="btn btn-success"
              onClick={handleUpload}
              disabled={uploading}
            >
              <i className="fa-solid fa-upload"></i>
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
            <button className="btn btn-danger" onClick={handleCancel}>
              <i className="fa-solid fa-times"></i> Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePhotoUpload;
