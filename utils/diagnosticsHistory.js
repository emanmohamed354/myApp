// utils/diagnosticsHistory.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export class DiagnosticsHistory {
  static HISTORY_KEY = '@diagnostics_history';
  static MAX_RECORDS = 1000;

  static async saveSnapshot(sensorData, carHealth) {
    try {
      const snapshot = {
        id: `${Date.now()}_${Math.random()}`,
        timestamp: new Date().toISOString(),
        sensorData: { ...sensorData },
        carHealth,
        issues: this.detectIssues(sensorData),
      };

      const history = await this.getHistory();
      history.unshift(snapshot);

      // Keep only recent records
      if (history.length > this.MAX_RECORDS) {
        history.pop();
      }

      await AsyncStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
      return snapshot;
    } catch (error) {
      console.error('Error saving diagnostics snapshot:', error);
    }
  }

  static detectIssues(sensorData) {
    const issues = [];

    // Check engine temperature
    if (sensorData.ENGINE_COOLANT_TEMPERATURE > 105) {
      issues.push({
        type: 'warning',
        sensor: 'ENGINE_COOLANT_TEMPERATURE',
        message: 'Engine running hot',
        value: sensorData.ENGINE_COOLANT_TEMPERATURE,
      });
    }

    // Check RPM
    if (sensorData.ENGINE_RPM > 6000) {
      issues.push({
        type: 'warning',
        sensor: 'ENGINE_RPM',
        message: 'High RPM detected',
        value: sensorData.ENGINE_RPM,
      });
    }

    // Check battery voltage
    if (sensorData.CONTROL_MODULE_VOLTAGE < 12.0) {
      issues.push({
        type: 'alert',
        sensor: 'CONTROL_MODULE_VOLTAGE',
        message: 'Low battery voltage',
        value: sensorData.CONTROL_MODULE_VOLTAGE,
      });
    }

    return issues;
  }

  static async getHistory(limit = 100) {
    try {
      const history = await AsyncStorage.getItem(this.HISTORY_KEY);
      const parsed = history ? JSON.parse(history) : [];
      return parsed.slice(0, limit);
    } catch (error) {
      console.error('Error getting diagnostics history:', error);
      return [];
    }
  }

  static async getHistoryByDateRange(startDate, endDate) {
    const history = await this.getHistory(this.MAX_RECORDS);
    return history.filter(record => {
      const recordDate = new Date(record.timestamp);
      return recordDate >= startDate && recordDate <= endDate;
    });
  }

  static async generateReport(startDate, endDate) {
    const records = await this.getHistoryByDateRange(startDate, endDate);
    
    const report = {
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      totalRecords: records.length,
      averageHealth: records.reduce((sum, r) => sum + r.carHealth, 0) / records.length,
      issues: {},
      trends: {},
    };

    // Analyze issues
    records.forEach(record => {
      record.issues.forEach(issue => {
        if (!report.issues[issue.sensor]) {
          report.issues[issue.sensor] = {
            count: 0,
            messages: new Set(),
            values: [],
          };
        }
        report.issues[issue.sensor].count++;
        report.issues[issue.sensor].messages.add(issue.message);
        report.issues[issue.sensor].values.push(issue.value);
      });
    });

    // Convert sets to arrays
    Object.keys(report.issues).forEach(sensor => {
      report.issues[sensor].messages = Array.from(report.issues[sensor].messages);
      report.issues[sensor].avgValue = 
        report.issues[sensor].values.reduce((a, b) => a + b, 0) / 
        report.issues[sensor].values.length;
    });

    // Calculate trends
    const sensors = ['ENGINE_RPM', 'VEHICLE_SPEED', 'ENGINE_COOLANT_TEMPERATURE'];
    sensors.forEach(sensor => {
      const values = records.map(r => r.sensorData[sensor]).filter(v => v !== undefined);
      if (values.length > 0) {
        report.trends[sensor] = {
          min: Math.min(...values),
          max: Math.max(...values),
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          trend: this.calculateTrend(values),
        };
      }
    });

    return report;
  }

  static calculateTrend(values) {
    if (values.length < 2) return 'stable';
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (change > 10) return 'increasing';
    if (change < -10) return 'decreasing';
    return 'stable';
  }

  static async clearHistory() {
    await AsyncStorage.removeItem(this.HISTORY_KEY);
  }
}
        