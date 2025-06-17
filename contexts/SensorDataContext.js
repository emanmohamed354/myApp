// contexts/SensorDataContext.js
import React, { createContext, useContext, useState, useRef } from 'react';

const SensorDataContext = createContext();

export const useSensorData = () => {
  const context = useContext(SensorDataContext);
  if (!context) {
    throw new Error('useSensorData must be used within a SensorDataProvider');
  }
  return context;
};

export const SensorDataProvider = ({ children }) => {
  const [sensorData, setSensorData] = useState({});
  const [carHealth, setCarHealth] = useState(0);
  const [healthFactors, setHealthFactors] = useState({});
  
  // Persistent refs
  const appStartTime = useRef(Date.now());
  const dataPoints = useRef({
    raw: [],
    aggregated: []
  });

  const value = {
    sensorData,
    setSensorData,
    carHealth,
    setCarHealth,
    healthFactors,
    setHealthFactors,
    appStartTime,
    dataPoints,
  };

  return (
    <SensorDataContext.Provider value={value}>
      {children}
    </SensorDataContext.Provider>
  );
};