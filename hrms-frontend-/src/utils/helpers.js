export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatTime = (timeString) => {
  if (!timeString) return '';
  return timeString.substring(0, 5); // HH:MM
};

export const formatCurrency = (amount) => {
  if (!amount) return '₹0';
  return `₹${parseFloat(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const getStatusColor = (status) => {
  const statusColors = {
    Present: '#28a745',
    Late: '#ffc107',
    Absent: '#dc3545',
    'On Leave': '#17a2b8',
    Pending: '#ffc107',
    Approved: '#28a745',
    Rejected: '#dc3545',
  };
  return statusColors[status] || '#6c757d';
};

export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
