// navigation/linking.js
import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';

const prefix = Linking.createURL('/');

export const linking = {
  prefixes: [prefix, 'mycarapp://', 'https://mycarapp.com'],
  
  config: {
    screens: {
      // Auth Stack
      Login: 'login',
      Registration: 'register',
      
      // Main App Stack
      MainTabs: {
        screens: {
          Home: {
            path: 'home',
            exact: true,
          },
          Info: {
            path: 'info',
            exact: true,
          },
          LLM: {
            path: 'assistant/:chatId?',
            parse: {
              chatId: (chatId) => chatId || null,
            },
          },
          Appointment: {
            path: 'appointment/:centerId?',
            parse: {
              centerId: (centerId) => centerId || null,
            },
          },
          Notifications: {
            path: 'notifications/:notificationId?',
            parse: {
              notificationId: (notificationId) => notificationId || null,
            },
          },
          Settings: 'settings',
          Profile: 'profile',
        },
      },
      
      // Modal Screens
      NotFound: '*',
    },
  },
  
  // Custom function to get the initial URL
  async getInitialURL() {
    // Check if app was opened from a deep link
    const url = await Linking.getInitialURL();
    if (url != null) {
      return url;
    }

    // Check if there is an initial notification
    const response = await Notifications.getLastNotificationResponseAsync();
    if (response?.notification?.request?.content?.data?.url) {
      return response.notification.request.content.data.url;
    }

    return null;
  },
  
  // Custom function to subscribe to incoming links
  subscribe(listener) {
    const onReceiveURL = ({ url }) => listener(url);

    // Listen to incoming links from deep linking
    const eventListenerSubscription = Linking.addEventListener('url', onReceiveURL);

    // Listen to notification responses
    const notificationSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const url = response.notification.request.content.data?.url;
      if (url) {
        listener(url);
      }
    });

    return () => {
      eventListenerSubscription.remove();
      notificationSubscription.remove();
    };
  },
};

// Helper function to create deep links
export const createDeepLink = (screen, params = {}) => {
  let path = screen;
  
  // Add parameters to path
  Object.keys(params).forEach(key => {
    path = path.replace(`:${key}`, params[key]);
  });
  
  return Linking.createURL(path);
};

