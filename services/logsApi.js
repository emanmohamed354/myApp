// services/logsApi.js
import api from './api';

export const logsApi = {
  // Get diagnostic logs
  getDiagnosticLogs: async () => {
    try {
      return await api.get('/api/log/diagnostic', {
        timeout: 10000,
      });
    } catch (error) {
      console.error('Error fetching diagnostic logs:', error);
      if (error.response?.status === 404 || error.response?.status === 401) {
        return [];
      }
      throw error;
    }
  },

  // Get event logs
  getEventLogs: async () => {
    try {
      return await api.get('/api/log/event', {
        timeout: 10000,
      });
    } catch (error) {
      console.error('Error fetching event logs:', error);
      if (error.response?.status === 404 || error.response?.status === 401) {
        return [];
      }
      throw error;
    }
  },

  // Clear diagnostic code
  clearDiagnosticCode: async (codeId) => {
    try {
      return await api.patch(`/api/log/diagnostic/${codeId}/clear`, {
        clearedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error clearing diagnostic code:', error);
      throw error;
    }
  }
};