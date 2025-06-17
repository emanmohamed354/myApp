// utils/predictiveMaintenance.js
export class PredictiveMaintenance {
  static analyzePatterns(historicalData) {
    const predictions = {
      oilChange: this.predictOilChange(historicalData),
      brakeService: this.predictBrakeService(historicalData),
      tireRotation: this.predictTireRotation(historicalData),
      engineService: this.predictEngineHealth(historicalData),
    };
    
    return predictions;
  }
  
  static predictOilChange(data) {
    // Analyze oil temperature, engine hours, etc.
    const avgOilTemp = this.calculateAverage(data, 'ENGINE_OIL_TEMP');
    const runTime = this.calculateTotal(data, 'RUN_TIME_SINCE_ENGINE_START');
    
    // Simple prediction logic
    const daysUntilService = Math.max(0, 90 - (runTime / 1440)); // 90 days typical
    
    return {
      daysRemaining: Math.round(daysUntilService),
      confidence: 0.85,
      recommendation: daysUntilService < 30 ? 'Schedule soon' : 'On track',
    };
  }
  
  static predictEngineHealth(data) {
    const factors = {
      temperature: this.analyzeTemperatureTrends(data),
      rpm: this.analyzeRPMPatterns(data),
      load: this.analyzeEngineLoad(data),
    };
    
    const healthScore = Object.values(factors).reduce((a, b) => a + b, 0) / 3;
    
    return {
      score: healthScore,
      factors,
      recommendations: this.generateRecommendations(factors),
    };
  }
  
  static generateRecommendations(factors) {
    const recommendations = [];
    
    if (factors.temperature < 80) {
      recommendations.push('Monitor coolant levels');
    }
    if (factors.rpm < 70) {
      recommendations.push('Aggressive driving detected - consider gentler acceleration');
    }
    if (factors.load < 75) {
      recommendations.push('High engine load patterns - check air filter');
    }
    
    return recommendations;
  }
}