// utils/gamification.js
export class GamificationService {
  static achievements = {
    ECO_DRIVER: {
      id: 'eco_driver',
      name: 'Eco Driver',
      description: 'Maintain fuel efficiency above 80% for a week',
      icon: 'leaf',
      points: 100,
    },
    MAINTENANCE_MASTER: {
      id: 'maintenance_master',
      name: 'Maintenance Master',
      description: 'Complete 5 scheduled maintenances on time',
      icon: 'wrench',
      points: 200,
    },
    SAFE_DRIVER: {
      id: 'safe_driver',
      name: 'Safe Driver',
      description: 'No harsh braking or acceleration for 30 days',
      icon: 'shield-check',
      points: 150,
    },
    HEALTH_MONITOR: {
      id: 'health_monitor',
      name: 'Health Monitor',
      description: 'Check car health daily for a month',
      icon: 'heart-pulse',
      points: 100,
    },
  };
  
  static async checkAchievements(userData) {
    const newAchievements = [];
    
    // Check each achievement
    for (const [key, achievement] of Object.entries(this.achievements)) {
      if (!userData.achievements?.includes(achievement.id)) {
        const earned = await this.checkAchievement(achievement, userData);
        if (earned) {
          newAchievements.push(achievement);
        }
      }
    }
    
    return newAchievements;
  }
  
  static calculateLevel(points) {
    const levels = [
      { level: 1, minPoints: 0, title: 'Novice Driver' },
      { level: 2, minPoints: 100, title: 'Regular Driver' },
      { level: 3, minPoints: 300, title: 'Experienced Driver' },
      { level: 4, minPoints: 600, title: 'Expert Driver' },
      { level: 5, minPoints: 1000, title: 'Master Driver' },
    ];
    
    return levels.reverse().find(l => points >= l.minPoints);
  }
}