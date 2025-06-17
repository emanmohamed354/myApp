// config/environments.js
const ENV = {
  dev: {
    apiUrl: 'http://192.168.1.5:4000',
    wsUrl: 'ws://192.168.1.5:4000',
    environment: 'development',
    enableDebugTools: true,
    mockData: false,
  },
  staging: {
    apiUrl: 'https://staging-api.mycarapp.com',
    wsUrl: 'wss://staging-api.mycarapp.com',
    environment: 'staging',
    enableDebugTools: true,
    mockData: false,
  },
  production: {
    apiUrl: 'https://api.mycarapp.com',
    wsUrl: 'wss://api.mycarapp.com',
    environment: 'production',
    enableDebugTools: false,
    mockData: false,
  },
};

const getEnvironment = () => {
  if (__DEV__) return ENV.dev;
  if (process.env.EXPO_PUBLIC_ENV === 'staging') return ENV.staging;
  return ENV.production;
};

export default getEnvironment();