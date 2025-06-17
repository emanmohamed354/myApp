export const AGGREGATION_INTERVAL = 60; // Aggregate every 60 data points (2 minutes)
export const MAX_RAW_POINTS = 180;      // Keep 6 minutes of raw data

export const processDataPoint = (newData, dataPoints, appStartTime) => {
  const timestamp = Date.now();
  const elapsedSeconds = Math.floor((timestamp - appStartTime) / 1000);
  
  // Add raw data point
  dataPoints.raw.push({
    timestamp,
    elapsed: elapsedSeconds,
    rpm: newData.ENGINE_RPM || 0,
    speed: newData.VEHICLE_SPEED || 0,
    temp: newData.ENGINE_COOLANT_TEMPERATURE || 0
  });
  
  // Aggregate if needed
  if (dataPoints.raw.length >= AGGREGATION_INTERVAL) {
    const toAggregate = dataPoints.raw.slice(0, AGGREGATION_INTERVAL);
    const aggregated = {
      timestamp: toAggregate[Math.floor(AGGREGATION_INTERVAL / 2)].timestamp,
      elapsed: toAggregate[Math.floor(AGGREGATION_INTERVAL / 2)].elapsed,
      rpm: toAggregate.reduce((sum, p) => sum + p.rpm, 0) / AGGREGATION_INTERVAL,
      speed: toAggregate.reduce((sum, p) => sum + p.speed, 0) / AGGREGATION_INTERVAL,
      temp: toAggregate.reduce((sum, p) => sum + p.temp, 0) / AGGREGATION_INTERVAL
    };
    
    dataPoints.aggregated.push(aggregated);
    dataPoints.raw = dataPoints.raw.slice(AGGREGATION_INTERVAL);
  }
  
  // Limit raw data points
  if (dataPoints.raw.length > MAX_RAW_POINTS) {
    dataPoints.raw = dataPoints.raw.slice(-MAX_RAW_POINTS);
  }
  
  return dataPoints;
};

export const getChartData = (dataPoints, appStartTime) => {
  const allPoints = [...dataPoints.aggregated, ...dataPoints.raw];
  if (allPoints.length === 0) return { labels: [], rpm: [], speed: [], temp: [] };
  
  const maxPoints = 8;
  const step = Math.max(1, Math.floor(allPoints.length / maxPoints));
  const selectedPoints = allPoints.filter((_, index) => index % step === 0).slice(-maxPoints);
  
  const elapsedTotal = (Date.now() - appStartTime) / 1000;
  
  const formatLabel = (elapsed) => {
    if (elapsedTotal < 120) {
      return `${Math.floor(elapsed)}s`;
    } else if (elapsedTotal < 3600) {
      const minutes = Math.floor(elapsed / 60);
      const seconds = Math.floor(elapsed % 60);
      return `${minutes}m${seconds > 0 && minutes < 10 ? `${seconds}s` : ''}`;
    } else {
      const hours = Math.floor(elapsed / 3600);
      const minutes = Math.floor((elapsed % 3600) / 60);
      return `${hours}h${minutes}m`;
    }
  };
  
  return {
    labels: selectedPoints.map(p => formatLabel(p.elapsed)),
    rpm: selectedPoints.map(p => p.rpm / 100),
    speed: selectedPoints.map(p => p.speed),
    temp: selectedPoints.map(p => p.temp)
  };
};