export const getNotificationIcon = (type) => {
  switch (type) {
    case 'appointment':
      return { name: 'calendar', color: '#3B82F6' };
    case 'maintenance':
      return { name: 'build', color: '#F59E0B' };
    case 'alert':
    case 'error':
      return { name: 'alert-circle', color: '#EF4444' };
    case 'warning':
      return { name: 'warning', color: '#F59E0B' };
    case 'info':
      return { name: 'information-circle', color: '#10B981' };
    default:
      return { name: 'notifications', color: '#6B7280' };
  }
};