export const formatRefreshRate = (rate) => `${rate}ms`;
export const formatGaugeSize = (size) => `${size}px`;
export const formatInterval = (interval) => `${interval}ms`;
export const formatFileSize = (size) => `${size}MB`;

export const getLanguageDisplay = (langCode) => {
  const languages = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French'
  };
  return languages[langCode] || langCode;
};

export const getVoiceDisplay = (voice) => {
  return voice.split('-').slice(-1)[0];
};

export const getThemeDisplay = (theme) => {
  return theme === 'dark' ? 'Dark' : 'Light';
};

export const getUnitsDisplay = (units) => {
  return units === 'imperial' ? 'Imperial' : 'Metric';
};