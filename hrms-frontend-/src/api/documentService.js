import axiosInstance from './axiosConfig';

const documentService = {
  // Upload document
  uploadDocument: async (formData) => {
    const response = await axiosInstance.post('/documents/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get my documents
  getMyDocuments: async () => {
    const response = await axiosInstance.get('/documents/my/');
    return response.data;
  },

  // Get document detail
  getDocumentDetail: async (documentId) => {
    const response = await axiosInstance.get(`/documents/${documentId}/`);
    return response.data;
  },

  // Delete document
  deleteDocument: async (documentId) => {
    const response = await axiosInstance.delete(`/documents/delete/${documentId}/`);
    return response.data;
  },
};

export default documentService;
