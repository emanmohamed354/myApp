// config/config.js
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ENV = {
  dev: {
    apiUrl: 'http://192.168.100.14:3000', // Default, will be overridden
    remoteUrl: 'https://9dd7dq9r-4000.euw.devtunnels.ms',
  },
  prod: {
    apiUrl: 'https://9dd7dq9r-4000.euw.devtunnels.ms',
    remoteUrl: 'https://9dd7dq9r-4000.euw.devtunnels.ms',
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