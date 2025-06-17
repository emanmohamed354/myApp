// Constants/mockNotifications.js
export const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'maintenance',
    title: 'Oil Change Reminder',
    message: 'Your vehicle is due for an oil change. Last service was 3 months ago.',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
  },
  {
    id: '2',
    type: 'appointment',
    title: 'Upcoming Service Appointment',
    message: 'You have a service appointment scheduled for tomorrow at 10:00 AM.',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: '3',
    type: 'alert',
    title: 'Low Tire Pressure',
    message: 'Your front left tire pressure is below recommended levels.',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: '4',
    type: 'info',
    title: 'New Feature Available',
    message: 'Check out our new AI-powered diagnostic assistant in the AI tab.',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
  },
];