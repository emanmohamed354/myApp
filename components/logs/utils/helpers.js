export const getSeverityColor = (severity) => {
  switch (severity) {
    case 'critical': return '#EF4444';
    case 'warning': return '#F59E0B';
    case 'info': return '#3B82F6';
    default: return '#6B7280';
  }
};

export const getSeverityIcon = (severity) => {
  switch (severity) {
    case 'critical': return 'alert-octagon';
    case 'warning': return 'alert-triangle';
    case 'info': return 'information';
    default: return 'help-circle';
  }
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'active': return '#EF4444';
    case 'pending': return '#F59E0B';
    case 'cleared': return '#10B981';
    default: return '#6B7280';
  }
};

export const getSensorIcon = (sensor) => {
  if (sensor.includes('TEMPERATURE')) return 'thermometer';
  if (sensor.includes('PRESSURE')) return 'gauge';
  if (sensor.includes('SPEED')) return 'speedometer';
  if (sensor.includes('RPM')) return 'engine';
  if (sensor.includes('FUEL')) return 'gas-station';
  if (sensor.includes('VOLTAGE')) return 'flash';
  if (sensor.includes('LOAD')) return 'weight';
  if (sensor.includes('AIR')) return 'air-filter';
  return 'car-info';
};

export const getEventIcon = (event) => {
  if (event.toLowerCase().includes('start')) return { name: 'play-circle', color: '#10B981' };
  if (event.toLowerCase().includes('stop')) return { name: 'stop-circle', color: '#EF4444' };
  if (event.toLowerCase().includes('connect')) return { name: 'bluetooth-connect', color: '#3B82F6' };
  if (event.toLowerCase().includes('disconnect')) return { name: 'bluetooth-off', color: '#F59E0B' };
  if (event.toLowerCase().includes('error')) return { name: 'alert-circle', color: '#EF4444' };
  return { name: 'information', color: '#6B7280' };
};