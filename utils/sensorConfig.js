export const sensorConfig = {
  // Critical sensors for top indicators
  critical: {
    ENGINE_RPM: {
      name: 'RPM',
      unit: 'rpm',
      max: 8000,
      ranges: [
        { max: 1000, color: '#10B981' }, // green
        { max: 3500, color: '#3B82F6' }, // blue
        { max: 5500, color: '#F59E0B' }, // yellow
        { max: 8000, color: '#EF4444' }, // red
      ]
    },
    VEHICLE_SPEED: {
      name: 'Speed',
      unit: 'km/h',
      max: 240,
      ranges: [
        { max: 60, color: '#10B981' },
        { max: 100, color: '#3B82F6' },
        { max: 140, color: '#F59E0B' },
        { max: 240, color: '#EF4444' },
      ]
    },
    ENGINE_COOLANT_TEMPERATURE: {
      name: 'Coolant',
      unit: '°C',
      max: 150,
      ranges: [
        { max: 60, color: '#3B82F6' }, // blue (cold)
        { max: 95, color: '#10B981' }, // green (normal)
        { max: 110, color: '#F59E0B' }, // yellow (warm)
        { max: 150, color: '#EF4444' }, // red (hot)
      ]
    },
    ENGINE_LOAD: {
      name: 'Load',
      unit: '%',
      max: 100,
      ranges: [
        { max: 30, color: '#10B981' },
        { max: 60, color: '#3B82F6' },
        { max: 80, color: '#F59E0B' },
        { max: 100, color: '#EF4444' },
      ]
    }
  },
  // Secondary sensors for grid blocks - with API key names
  secondary: [
    { apiKey: 'INTAKE_AIR_TEMPERATURE', name: 'Intake Air Temp', unit: '°C', icon: 'thermometer-half' },
    { apiKey: 'FUEL_PRESSURE', name: 'Fuel Pressure', unit: 'kPa', icon: 'gas-pump' },
    { apiKey: 'THROTTLE_POSITION', name: 'Throttle Position', unit: '%', icon: 'tachometer-alt' },
    { apiKey: 'FUEL_TANK_LEVEL_INPUT', name: 'Fuel Level', unit: '%', icon: 'battery-three-quarters' },
    { apiKey: 'INTAKE_MANIFOLD_PRESSURE', name: 'Intake Pressure', unit: 'kPa', icon: 'compress' },
    { apiKey: 'BAROMETRIC_PRESSURE', name: 'Barometric', unit: 'kPa', icon: 'cloud' },
    { apiKey: 'ENGINE_OIL_TEMP', name: 'Oil Temp', unit: '°C', icon: 'oil-can' },
    { apiKey: 'AMBIENT_AIR_TEMPERATURE', name: 'Ambient Temp', unit: '°C', icon: 'sun' },
    { apiKey: 'CONTROL_MODULE_VOLTAGE', name: 'Voltage', unit: 'V', icon: 'bolt' },
    { apiKey: 'TIMING_ADVANCE', name: 'Timing Advance', unit: '°', icon: 'clock' },
    { apiKey: 'MAF_AIR_FLOW_RATE', name: 'MAF Rate', unit: 'g/s', icon: 'wind' },
    { apiKey: 'RUN_TIME_SINCE_ENGINE_START', name: 'Run Time', unit: 'min', icon: 'hourglass-half' },
  ]
};