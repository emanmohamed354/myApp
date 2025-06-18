// hooks/useNotifications.js
import { useNotificationState } from '../contexts/NotificationStateContext';

export const useNotifications = () => {
  // Simply return the global notification state
  return useNotificationState();
};