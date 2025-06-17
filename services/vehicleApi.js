// services/vehicleApi.js
import api from './api';

export const vehicleApi = {
  getProfile: async () => {
    return await api.get('/api/obd/profile');
  },
  
  getLiveData: async () => {
    return await api.get('/api/obd/live');
  },
  
  getHistory: async (startDate, endDate) => {
    return await api.get('/api/obd/history', {
      params: { startDate, endDate }
    });
  },
};