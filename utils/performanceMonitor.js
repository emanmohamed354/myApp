// utils/performanceMonitor.js
export class PerformanceMonitor {
  static screenLoadTimes = {};
  
  static startScreenLoad(screenName) {
    this.screenLoadTimes[screenName] = {
      start: Date.now(),
    };
  }
  
  static endScreenLoad(screenName) {
    if (this.screenLoadTimes[screenName]) {
      const duration = Date.now() - this.screenLoadTimes[screenName].start;
      console.log(`Screen ${screenName} loaded in ${duration}ms`);
      
      // Send to analytics
      if (duration > 1000) {
        console.warn(`Slow screen load: ${screenName} took ${duration}ms`);
      }
    }
  }
}