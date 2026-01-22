import React, { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import documentService from '../api/documentService';
import { toast } from 'react-toastify';
import { formatDate } from '../utils/helpers';
import { DOCUMENT_TYPES } from '../utils/constants';

const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const data = await documentService.getMyDocuments();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile || !documentType) {
      toast.error('Please select a file and document type');
      return;
    }

    const formData = new FormData();
    formData.append('document', selectedFile);
    formData.append('document_type', documentType);

    setUploading(true);
    try {
      await documentService.uploadDocument(formData);
      toast.success('Document uploaded successfully!');
      setShowUploadForm(false);
      setSelectedFile(null);
      setDocumentType('');
      fetchDocuments();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleView = (document) => {
    window.open(document.file_url, '_blank');
  };

  const handleDownload = async (document) => {
    try {
      const link = document.createElement('a');
      link.href = document.file_url;
      link.download = document.filename;
      link.click();
    } catch (error) {
      toast.error('Failed to download document');
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await documentService.deleteDocument(documentId);
      toast.success('Document deleted successfully!');
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(2) + ' MB';
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="content">
          <div className="loading">Loading documents...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="content">
        <div className="page-header">
          <h1><i className="fa-solid fa-folder-open"></i> My Documents</h1>
          <button className="btn btn-success" onClick={() => setShowUploadForm(!showUploadForm)}>
            <i className="fa-solid fa-upload"></i> Upload Document
          </button>
        </div>

        {/* Upload Form */}
        {showUploadForm && (
          <div className="card">
            <h2><i className="fa-solid fa-file-upload"></i> Upload New Document</h2>
            
            <form onSubmit={handleUpload}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Document Type <span className="required">*</span></label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    required
                  >
                    <option value="">Select Document Type</option>
                    <option value={DOCUMENT_TYPES.ID_PROOF}>ID Proof</option>
                    <option value={DOCUMENT_TYPES.OFFER_LETTER}>Offer Letter</option>
                    <option value={DOCUMENT_TYPES.RESUME}>Resume</option>
                    <option value={DOCUMENT_TYPES.CERTIFICATE}>Certificate</option>
                    <option value={DOCUMENT_TYPES.PAYSLIP}>Payslip</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Select File <span className="required">*</span></label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    required
                  />
                  {selectedFile && (
                    <p className="file-info">Selected: {selectedFile.name}</p>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-success" disabled={uploading}>
                  <i className="fa-solid fa-upload"></i> 
                  {uploading ? 'Uploading...' : 'Upload Document'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowUploadForm(false);
                    setSelectedFile(null);
                    setDocumentType('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Documents List */}
        <div className="card">
          <h2><i className="fa-solid fa-file-alt"></i> My Documents</h2>
          
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Document Type</th>
                  <th>File Size</th>
                  <th>Upload Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.length > 0 ? (
                  documents.map((doc) => (
                    <tr key={doc.document_id}>
                      <td>
                        <i className="fa-solid fa-file-pdf"></i> {doc.filename}
                      </td>
                      <td>{doc.document_type}</td>
                      <td>{formatFileSize(doc.file_size)}</td>
                      <td>{formatDate(doc.uploaded_at)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleView(doc)}
                            title="View"
                          >
                            <i className="fa-solid fa-eye"></i>
                          </button>
                          {/* <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleDownload(doc)}
                            title="Download"
                          >
                            <i className="fa-solid fa-download"></i>
                          </button> */}
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(doc.document_id)}
                            title="Delete"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">
                      No documents uploaded yet. Click "Upload Document" to add your first document.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DocumentsPage;
