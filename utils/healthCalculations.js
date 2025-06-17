export const calculateCarHealth = (data) => {
  const factors = {
    'Engine Temp': 0,
    'RPM Range': 0,
    'Engine Load': 0,
    'Fuel System': 0,
    'Battery': 0
  };
  
  // Temperature health (0-100)
  const temp = data.ENGINE_COOLANT_TEMPERATURE || 0;
  if (temp > 0) {
    if (temp >= 80 && temp <= 95) factors['Engine Temp'] = 100;
    else if (temp < 80) factors['Engine Temp'] = Math.max(20, (temp / 80) * 100);
    else if (temp > 95 && temp <= 105) factors['Engine Temp'] = 100 - ((temp - 95) * 5);
    else if (temp > 105) factors['Engine Temp'] = 50 - ((temp - 105) * 2);
    else factors['Engine Temp'] = 50;
  } else {
    factors['Engine Temp'] = 50;
  }
  
  // RPM health
  const rpm = data.ENGINE_RPM || 0;
  const speed = data.VEHICLE_SPEED || 0;

  if (speed > 0) {
    if (speed <= 20) {
      if (rpm >= 1200 && rpm <= 2000) factors['RPM Range'] = 100;
      else if (rpm >= 1000 && rpm <= 2500) factors['RPM Range'] = 85;
      else if (rpm >= 800 && rpm <= 3000) factors['RPM Range'] = 70;
      else if (rpm <= 3500) factors['RPM Range'] = 55;
      else factors['RPM Range'] = 40;
    } else if (speed <= 50) {
      if (rpm >= 1500 && rpm <= 2500) factors['RPM Range'] = 100;
      else if (rpm >= 1200 && rpm <= 3000) factors['RPM Range'] = 85;
      else if (rpm >= 1000 && rpm <= 3500) factors['RPM Range'] = 70;
      else if (rpm <= 4000) factors['RPM Range'] = 55;
      else factors['RPM Range'] = 40;
    } else if (speed <= 80) {
      if (rpm >= 1800 && rpm <= 2800) factors['RPM Range'] = 100;
      else if (rpm >= 1500 && rpm <= 3200) factors['RPM Range'] = 85;
      else if (rpm >= 1200 && rpm <= 3800) factors['RPM Range'] = 70;
      else if (rpm <= 4500) factors['RPM Range'] = 55;
      else factors['RPM Range'] = 40;
    } else {
      if (rpm >= 2000 && rpm <= 3000) factors['RPM Range'] = 100;
      else if (rpm >= 1800 && rpm <= 3500) factors['RPM Range'] = 85;
      else if (rpm >= 1500 && rpm <= 4000) factors['RPM Range'] = 70;
      else if (rpm <= 4500) factors['RPM Range'] = 55;
      else factors['RPM Range'] = 40;
    }
  } else {
    if (rpm >= 700 && rpm <= 800) factors['RPM Range'] = 100;
    else if (rpm >= 650 && rpm <= 850) factors['RPM Range'] = 90;
    else if (rpm >= 600 && rpm <= 900) factors['RPM Range'] = 80;
    else if (rpm >= 550 && rpm <= 1000) factors['RPM Range'] = 65;
    else if (rpm >= 500 && rpm <= 1200) factors['RPM Range'] = 50;
    else factors['RPM Range'] = 35;
  }

  // Load health
  const load = data.CALCULATED_ENGINE_LOAD || 0;
  if (speed > 100) {
    if (load >= 20 && load <= 45) factors['Engine Load'] = 100;
    else if (load >= 15 && load <= 55) factors['Engine Load'] = 85;
    else if (load >= 10 && load <= 65) factors['Engine Load'] = 70;
    else if (load <= 75) factors['Engine Load'] = 55;
    else factors['Engine Load'] = 40;
  } else if (speed > 50) {
    if (load >= 15 && load <= 40) factors['Engine Load'] = 100;
    else if (load >= 10 && load <= 50) factors['Engine Load'] = 85;
    else if (load >= 5 && load <= 60) factors['Engine Load'] = 70;
    else if (load <= 70) factors['Engine Load'] = 55;
    else factors['Engine Load'] = 40;
  } else if (speed > 0) {
    if (load >= 10 && load <= 35) factors['Engine Load'] = 100;
    else if (load >= 5 && load <= 45) factors['Engine Load'] = 85;
    else if (load <= 55) factors['Engine Load'] = 70;
    else if (load <= 65) factors['Engine Load'] = 55;
    else factors['Engine Load'] = 40;
  } else {
    if (load >= 3 && load <= 15) factors['Engine Load'] = 100;
    else if (load >= 2 && load <= 20) factors['Engine Load'] = 85;
    else if (load >= 1 && load <= 25) factors['Engine Load'] = 70;
    else if (load <= 35) factors['Engine Load'] = 55;
    else factors['Engine Load'] = 40;
  }
  
  // Voltage health
  const voltage = data.BATTERY_VOLTAGE || 0;
  if (voltage > 0) {
    if (voltage >= 12.6 && voltage <= 14.5) factors['Battery'] = 100;
    else if (voltage >= 12.2 && voltage < 12.6) factors['Battery'] = 80;
    else if (voltage >= 11.8 && voltage < 12.2) factors['Battery'] = 60;
    else factors['Battery'] = 40;
  } else {
    factors['Battery'] = 75;
  }
  
  // Fuel system
  const fuelPressure = data.FUEL_PRESSURE || 0;
  if (fuelPressure > 0) {
    factors['Fuel System'] = 85;
  } else {
    factors['Fuel System'] = 80;
  }
  
  // Calculate overall health with weighted average
  const weights = {
    'Engine Temp': 0.25,
    'RPM Range': 0.2,
    'Engine Load': 0.25,
    'Fuel System': 0.15,
    'Battery': 0.15
  };
  
  const health = Object.entries(factors).reduce((acc, [key, value]) => {
    return acc + (value * weights[key]);
  }, 0);
  
  return {
    health: Math.round(health),
    factors
  };
};