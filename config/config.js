// config/config.js
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ENV = {
  dev: {
    apiUrl: 'http://192.168.100.14:3000', // Default, will be overridden
    remoteUrl: 'http://192.168.100.14:4000',
  },
  prod: {
    apiUrl: 'https://your-production-api.com',
    remoteUrl: 'https://your-remote-api.com',
  }
};

const getEnvVars = (env = Constants.manifest?.releaseChannel) => {
  if (__DEV__) {
    return ENV.dev;
  } else if (env === 'prod') {
    return ENV.prod;
  }
  return ENV.dev;
};

// Export as an object with all needed methods
export default {
  ...getEnvVars(),
  updateLocalIp: async (ip) => {
    await AsyncStorage.setItem('localIpAddress', ip);
  },
  getLocalApiUrl: async () => {
    const ip = await AsyncStorage.getItem('localIpAddress');
    console.log("ip, tnhtraneitsr", ip);
    return ip ? `http://${ip}:3000` : 'http://192.168.100.14:3000';
  },
  getRemoteApiUrl: async () => {
    const envVars = getEnvVars();
    return envVars.remoteUrl;
  }
};