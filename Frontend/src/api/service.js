import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (school_id, password) => {
    const response = await api.post('/auth/login', { school_id, password });
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  getUsers: async () => {
    const response = await api.get('/auth/users');
    return response.data;
  },
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  resetPassword: async (token, new_password) => {
    const response = await api.post('/auth/reset-password', { token, new_password });
    return response.data;
  }
};

export const studentService = {
  submitSymptoms: async (symptomData) => {
    const response = await api.post('/clinic/symptoms/submit', symptomData);
    return response.data;
  },
  getSymptomHistory: async () => {
    const response = await api.get('/clinic/symptoms/history');
    return response.data;
  },
  getFollowUps: async () => {
    const response = await api.get('/followups/');
    return response.data;
  },
  respondFollowUp: async (id, data) => {
    const response = await api.post(`/followups/${id}/respond`, data);
    return response.data;
  },
  getMedications: async () => {
    const response = await api.get('/medications/');
    return response.data;
  },
  triggerEmergency: async (data) => {
    const response = await api.post('/emergency/trigger', data);
    return response.data;
  },
  getActiveEmergencies: async () => {
    const response = await api.get('/emergency/active');
    return response.data;
  },
  updateEmergencyLocation: async (id, location) => {
    const response = await api.patch(`/emergency/${id}`, { location });
    return response.data;
  },
  getPersonalTrends: async () => {
    const response = await api.get('/clinic/symptoms/personal-trends');
    return response.data;
  }
};

export const chatService = {
  startSession: async (language = 'english') => {
    const response = await api.post('/chat/start', { language });
    return response.data;
  },
  sendMessage: async (message, sessionId, history = []) => {
    const response = await api.post('/chat/message', { message, session_id: sessionId, history });
    return response.data;
  },
  endSession: async (sessionId, history = []) => {
    const response = await api.post(`/chat/end?session_id=${sessionId}`, history);
    return response.data;
  },
  sendSystemMessage: async (message, history = []) => {
    const response = await api.post('/chat/system', { message, history });
    return response.data;
  }
};

export const staffService = {
  getDashboardStats: async () => {
    const response = await api.get('/staff/dashboard');
    return response.data;
  },
  getActiveEmergencies: async () => {
    const response = await api.get('/emergency/active');
    return response.data;
  },
  resolveEmergency: async (id, notes) => {
    const response = await api.post(`/emergency/${id}/resolve?notes=${encodeURIComponent(notes)}`);
    return response.data;
  },
  prescribeMedication: async (studentId, data) => {
    const response = await api.post(`/medications/create?student_id=${studentId}`, data);
    return response.data;
  },
  getHealth: async () => {
    const response = await api.get('/health/detail');
    return response.data;
  },
  getPerformance: async () => {
    const response = await api.get('/staff/performance');
    return response.data;
  },
  optimizeCache: async () => {
    const response = await api.post('/staff/optimize-cache');
    return response.data;
  }
};

export const documentService = {
  uploadDocument: async (documentType, file) => {
    const formData = new FormData();
    formData.append('document_type', documentType);
    formData.append('file', file);
    
    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  getDocuments: async () => {
    const response = await api.get('/documents/');
    return response.data;
  },
  deleteDocument: async (id) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  }
};

export const excuseSlipService = {
  createExcuseSlip: async (data) => {
    const response = await api.post('/excuse-slips/', data);
    return response.data;
  },
  getExcuseSlips: async () => {
    const response = await api.get('/excuse-slips/');
    return response.data;
  }
};

export const inventoryService = {
  getItems: async () => {
    const response = await api.get('/inventory/');
    return response.data;
  },
  createItem: async (data) => {
    const response = await api.post('/inventory/', data);
    return response.data;
  },
  updateItem: async (id, data) => {
    const response = await api.patch(`/inventory/${id}`, data);
    return response.data;
  },
  createTransaction: async (data) => {
    const response = await api.post('/inventory/transaction', data);
    return response.data;
  },
  getTransactions: async (itemId) => {
    const response = await api.get(`/inventory/transactions/${itemId}`);
    return response.data;
  }
};

export const wellnessService = {
  getHistory: async () => {
    const response = await api.get('/wellness/my');
    return response.data;
  },
  createCheckin: async (data) => {
    const response = await api.post('/wellness/', data);
    return response.data;
  }
};

export const notificationService = {
  getNotifications: async () => {
    const response = await api.get('/notifications/');
    return response.data;
  },
  markRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread/count');
    return response.data;
  },
  clearAll: async () => {
    const response = await api.delete('/notifications/clear-all');
    return response.data;
  }
};

export const knowledgeService = {
  searchArticles: async (query = '', category = '') => {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (category) params.append('category', category);
    const response = await api.get(`/knowledge/?${params.toString()}`);
    return response.data;
  },
  getArticle: async (id) => {
    const response = await api.get(`/knowledge/${id}`);
    return response.data;
  },
  createArticle: async (data) => {
    const response = await api.post('/knowledge/', data);
    return response.data;
  }
};

export const alertService = {
  getActiveAlerts: async () => {
    const response = await api.get('/alerts/');
    return response.data;
  },
  createAlert: async (data) => {
    const response = await api.post('/alerts/', data);
    return response.data;
  },
  deactivateAlert: async (id) => {
    const response = await api.patch(`/alerts/${id}/deactivate`);
    return response.data;
  }
};

export const profileService = {
  getProfile: async () => {
    const response = await api.get('/profile/');
    return response.data;
  },
  updateProfile: async (data) => {
    const response = await api.put('/profile/', data);
    return response.data;
  }
};

export const appointmentService = {
  getAppointments: async () => {
    const response = await api.get('/appointments/');
    return response.data;
  },
  createAppointment: async (data) => {
    const response = await api.post('/appointments/', data);
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.patch(`/appointments/${id}?status=${status}`);
    return response.data;
  }
};

export const messageService = {
  getMessages: async () => {
    const response = await api.get('/messages/');
    return response.data;
  },
  getConversationMessages: async (otherUserId) => {
    const response = await api.get(`/messages/${otherUserId}`);
    return response.data;
  },
  sendMessage: async (data) => {
    const response = await api.post('/messages/', data);
    return response.data;
  },
  markRead: async (id) => {
    const response = await api.patch(`/messages/${id}/read`);
    return response.data;
  }
};

export const reportService = {
  getHealthAudit: async () => {
    const response = await api.get('/reports/health-audit');
    return response.data;
  },
  exportPdf: async () => {
    const response = await api.get('/reports/export/pdf', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'health_audit_report.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
  exportXlsx: async () => {
    const response = await api.get('/reports/export/xlsx', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'health_audit_report.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
  exportReferralPdf: async (recordId) => {
    const response = await api.get(`/reports/referral/${recordId}/pdf`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `referral_${recordId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
  exportReferralXlsx: async (recordId) => {
    const response = await api.get(`/reports/referral/${recordId}/xlsx`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `referral_${recordId}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};

export const settingsService = {
  getSettings: async () => {
    const response = await api.get('/settings/');
    return response.data;
  },
  updateSettings: async (data) => {
    const response = await api.patch('/settings/', data);
    return response.data;
  },
  changePassword: async (data) => {
    const response = await api.post('/settings/password', data);
    return response.data;
  },
  getSystemSettings: async () => {
    const response = await api.get('/settings/system');
    return response.data;
  }
};

export const auditService = {
  getAuditLogs: async () => {
    const response = await api.get('/audit/');
    return response.data;
  }
};

export default api;
