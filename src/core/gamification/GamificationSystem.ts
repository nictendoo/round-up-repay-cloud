/**
 * MicroRepay Gamification System
 * 
 * This module implements the gamification features for the MicroRepay system,
 * providing engagement mechanics and rewards for users.
 */

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Milestone {
  id: string;
  name: string;
  levels: number[];
  unit: string;
  pointValues: number[];
  currentLevel?: number;
  nextLevel?: number;
}

export interface UserStats {
  roundupCount: number;
  consecutiveDays: number;
  totalContribution: number;
  interestSaved: number;
  paidOffDebts: string[];
  daysActive: number;
  debtReductionPercentage: number;
}

export interface UserMilestone {
  id: string;
  currentLevel: number;
  nextLevel: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
}

export interface LeaderboardPosition {
  rank: number | null;
  totalUsers: number;
  percentile: number | null;
}

export class GamificationSystem {
  private readonly badges: Badge[];
  private readonly milestones: Milestone[];

  constructor(private readonly db: any) { // Replace with actual database interface
    this.badges = this.initializeBadges();
    this.milestones = this.initializeMilestones();
  }

  private initializeBadges(): Badge[] {
    return [
      {
        id: 'first_roundup',
        name: 'First Step',
        description: 'Complete your first round-up transaction',
        icon: 'first_step_icon.png',
        difficulty: 'easy'
      },
      {
        id: 'consistent_week',
        name: 'Consistency Counts',
        description: 'Round up transactions every day for a week',
        icon: 'consistency_icon.png',
        difficulty: 'medium'
      },
      {
        id: 'hundred_dollars',
        name: 'Benjamin Club',
        description: 'Contribute $100 in round-ups to your debt payment',
        icon: 'hundred_dollars_icon.png',
        difficulty: 'medium'
      },
      {
        id: 'interest_saved',
        name: 'Interest Buster',
        description: 'Save $500 in interest through early payments',
        icon: 'interest_saver_icon.png',
        difficulty: 'hard'
      },
      {
        id: 'debt_free',
        name: 'Freedom Fighter',
        description: 'Pay off a debt completely',
        icon: 'freedom_icon.png',
        difficulty: 'hard'
      }
    ];
  }

  private initializeMilestones(): Milestone[] {
    return [
      {
        id: 'total_contributions',
        name: 'Total Contributions',
        levels: [10, 50, 100, 500, 1000, 5000, 10000],
        unit: '$',
        pointValues: [10, 25, 50, 100, 250, 500, 1000]
      },
      {
        id: 'days_active',
        name: 'Days Active',
        levels: [1, 7, 30, 90, 180, 365],
        unit: 'days',
        pointValues: [5, 25, 75, 150, 300, 500]
      },
      {
        id: 'debt_reduction',
        name: 'Debt Reduction',
        levels: [1, 5, 10, 25, 50, 75, 100],
        unit: '%',
        pointValues: [10, 50, 100, 250, 500, 750, 1000]
      }
    ];
  }

  async checkAndAwardBadges(userId: string): Promise<Badge[]> {
    const userStats = await this.getUserStats(userId);
    const userBadges = await this.getUserBadges(userId);
    const newBadges: Badge[] = [];

    for (const badge of this.badges) {
      if (userBadges.includes(badge.id)) {
        continue;
      }

      let awarded = false;

      switch (badge.id) {
        case 'first_roundup':
          awarded = userStats.roundupCount > 0;
          break;

        case 'consistent_week':
          awarded = userStats.consecutiveDays >= 7;
          break;

        case 'hundred_dollars':
          awarded = userStats.totalContribution >= 100;
          break;

        case 'interest_saved':
          awarded = userStats.interestSaved >= 500;
          break;

        case 'debt_free':
          awarded = userStats.paidOffDebts.length > 0;
          break;
      }

      if (awarded) {
        await this.awardBadge(userId, badge.id);
        newBadges.push(badge);

        const points = this.calculatePointsForBadge(badge);
        await this.addPoints(userId, points, `Earned ${badge.name} badge`);
      }
    }

    return newBadges;
  }

  private calculatePointsForBadge(badge: Badge): number {
    switch (badge.difficulty) {
      case 'easy': return 10;
      case 'medium': return 25;
      case 'hard': return 50;
      default: return 5;
    }
  }

  async checkAndUpdateMilestones(userId: string): Promise<Milestone[]> {
    const userStats = await this.getUserStats(userId);
    const userMilestones = await this.getUserMilestones(userId);
    const updatedMilestones: Milestone[] = [];

    for (const milestone of this.milestones) {
      const userMilestone = userMilestones.find(um => um.id === milestone.id) || {
        id: milestone.id,
        currentLevel: 0,
        nextLevel: 0
      };

      let currentValue: number;
      switch (milestone.id) {
        case 'total_contributions':
          currentValue = userStats.totalContribution;
          break;

        case 'days_active':
          currentValue = userStats.daysActive;
          break;

        case 'debt_reduction':
          currentValue = userStats.debtReductionPercentage;
          break;

        default:
          continue;
      }

      let nextLevelIndex = milestone.levels.findIndex(level => currentValue < level);
      if (nextLevelIndex === -1) {
        nextLevelIndex = milestone.levels.length;
      }

      const currentLevelIndex = nextLevelIndex - 1;
      const currentLevel = currentLevelIndex >= 0 ? milestone.levels[currentLevelIndex] : 0;
      const nextLevel = nextLevelIndex < milestone.levels.length ? milestone.levels[nextLevelIndex] : null;

      if (currentLevelIndex > userMilestone.currentLevel) {
        for (let i = userMilestone.currentLevel + 1; i <= currentLevelIndex; i++) {
          const points = milestone.pointValues[i];
          await this.addPoints(userId, points, `Reached ${milestone.name} level ${milestone.levels[i]} ${milestone.unit}`);
        }

        await this.updateUserMilestone(userId, milestone.id, currentLevelIndex, nextLevelIndex);

        updatedMilestones.push({
          ...milestone,
          currentLevel,
          nextLevel: nextLevel || 0
        });
      }
    }

    return updatedMilestones;
  }

  async addPoints(userId: string, points: number, reason: string): Promise<{ userId: string; pointsAdded: number; reason: string }> {
    console.log(`Adding ${points} points to user ${userId} for: ${reason}`);
    return { userId, pointsAdded: points, reason };
  }

  async awardBadge(userId: string, badgeId: string): Promise<{ userId: string; badgeId: string; awardedAt: string }> {
    console.log(`Awarding badge ${badgeId} to user ${userId}`);
    return { userId, badgeId, awardedAt: new Date().toISOString() };
  }

  async updateUserMilestone(
    userId: string,
    milestoneId: string,
    currentLevel: number,
    nextLevel: number
  ): Promise<{ userId: string; milestoneId: string; currentLevel: number; nextLevel: number; updatedAt: string }> {
    console.log(`Updating milestone ${milestoneId} for user ${userId}: current=${currentLevel}, next=${nextLevel}`);
    return { userId, milestoneId, currentLevel, nextLevel, updatedAt: new Date().toISOString() };
  }

  async getUserStats(userId: string): Promise<UserStats> {
    return {
      roundupCount: 45,
      consecutiveDays: 8,
      totalContribution: 120.75,
      interestSaved: 42.30,
      paidOffDebts: [],
      daysActive: 14,
      debtReductionPercentage: 3.5
    };
  }

  async getUserBadges(userId: string): Promise<string[]> {
    return ['first_roundup'];
  }

  async getUserMilestones(userId: string): Promise<UserMilestone[]> {
    return [
      { id: 'total_contributions', currentLevel: 1, nextLevel: 2 },
      { id: 'days_active', currentLevel: 1, nextLevel: 2 },
      { id: 'debt_reduction', currentLevel: 0, nextLevel: 0 }
    ];
  }

  async getLeaderboardPosition(userId: string): Promise<LeaderboardPosition> {
    const topUsers = await this.getLeaderboard();
    const userIndex = topUsers.findIndex(user => user.id === userId);

    return {
      rank: userIndex !== -1 ? userIndex + 1 : null,
      totalUsers: await this.getTotalUserCount(),
      percentile: userIndex !== -1 ? 
        Math.round((1 - userIndex / await this.getTotalUserCount()) * 100) : null
    };
  }

  async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    return [
      { id: 'user456', name: 'Jane', points: 1250 },
      { id: 'user789', name: 'John', points: 980 },
      { id: 'user123', name: 'Sarah', points: 875 }
    ].slice(0, limit);
  }

  async getTotalUserCount(): Promise<number> {
    return 1242;
  }

  async processCompletedPayment(
    userId: string,
    amount: number,
    debtId: string
  ): Promise<{ newBadges: Badge[]; updatedMilestones: Milestone[] }> {
    const newBadges = await this.checkAndAwardBadges(userId);
    const updatedMilestones = await this.checkAndUpdateMilestones(userId);

    return {
      newBadges,
      updatedMilestones
    };
  }
} 