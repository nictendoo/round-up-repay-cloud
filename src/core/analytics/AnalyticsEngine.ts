/**
 * MicroRepay Analytics Engine
 * 
 * This module implements the analytics capabilities for the MicroRepay system,
 * providing insights and metrics for both users and creditors.
 */

export interface PrivacySettings {
  anonymizationLevel: 'low' | 'medium' | 'high';
  retentionPeriod: number; // days
}

export interface PaymentData {
  userId: string;
  amount: number;
  date: string;
  daysBeforeDue: number;
}

export interface CreditorMetrics {
  summary: {
    totalPayments: number;
    totalAmount: number;
    averagePayment: number;
    uniqueUsers: number;
  };
  frequency: Record<string, number>;
  consistency: {
    regular: number;
    irregular: number;
    totalUsers: number;
  };
  growth: {
    trend: 'increasing' | 'decreasing' | 'stable' | 'insufficient_data';
    slope: number;
    rSquared: number;
    firstDay: string;
    lastDay: string;
    periodDays: number;
  };
  earlyPayment: {
    early: number;
    onTime: number;
    late: number;
    averageDaysEarly: number;
  };
}

export interface CreditorInsights {
  creditorId: string;
  timeframe: string;
  dataRangeStart: string;
  dataRangeEnd: string;
  metrics: CreditorMetrics;
  insights: string[];
  generatedAt: string;
}

export class AnalyticsEngine {
  private readonly timeframes = {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    QUARTERLY: 'quarterly',
    YEARLY: 'yearly'
  } as const;

  constructor(
    private readonly db: any, // Replace with actual database interface
    private readonly privacySettings: PrivacySettings
  ) {}

  async generateCreditorInsights(
    creditorId: string,
    timeframe: string = this.timeframes.MONTHLY
  ): Promise<CreditorInsights> {
    const creditor = await this.getCreditorById(creditorId);
    if (!creditor) {
      throw new Error(`Creditor with ID ${creditorId} not found`);
    }

    const accounts = await this.getCreditorAccounts(creditorId);
    const paymentData = await this.getAnonymizedPaymentData(accounts, timeframe);
    const metrics = this.calculateCreditorMetrics(paymentData);
    const insights = this.generateInsightsFromMetrics(metrics);

    return {
      creditorId,
      timeframe,
      dataRangeStart: this.getTimeframeStart(timeframe),
      dataRangeEnd: new Date().toISOString(),
      metrics,
      insights,
      generatedAt: new Date().toISOString()
    };
  }

  private calculateCreditorMetrics(paymentData: PaymentData[]): CreditorMetrics {
    const paymentsByDay = this.groupByDate(paymentData, 'day');
    const paymentsByUser = this.groupByUser(paymentData);

    const totalPayments = paymentData.length;
    const totalAmount = paymentData.reduce((sum, payment) => sum + payment.amount, 0);
    const averagePayment = totalAmount / totalPayments || 0;

    return {
      summary: {
        totalPayments,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        averagePayment: parseFloat(averagePayment.toFixed(2)),
        uniqueUsers: Object.keys(paymentsByUser).length
      },
      frequency: this.calculatePaymentFrequency(paymentsByUser),
      consistency: this.calculateConsistencyRatio(paymentsByUser),
      growth: this.calculatePaymentTrend(paymentsByDay),
      earlyPayment: this.calculateEarlyPaymentRatio(paymentData)
    };
  }

  private calculatePaymentFrequency(paymentsByUser: Record<string, PaymentData[]>): Record<string, number> {
    const frequencies: Record<string, number> = {};

    Object.keys(paymentsByUser).forEach(userId => {
      const payments = paymentsByUser[userId];
      const frequency = this.calculateUserPaymentFrequency(payments);
      frequencies[frequency] = (frequencies[frequency] || 0) + 1;
    });

    const totalUsers = Object.keys(paymentsByUser).length;
    const frequencyDistribution: Record<string, number> = {};

    Object.keys(frequencies).forEach(freq => {
      frequencyDistribution[freq] = parseFloat(
        ((frequencies[freq] / totalUsers) * 100).toFixed(1)
      );
    });

    return frequencyDistribution;
  }

  private calculateUserPaymentFrequency(payments: PaymentData[]): string {
    const count = payments.length;

    if (count >= 30) return 'daily';
    if (count >= 8) return 'weekly';
    if (count >= 2) return 'monthly';
    return 'occasional';
  }

  private calculateConsistencyRatio(paymentsByUser: Record<string, PaymentData[]): {
    regular: number;
    irregular: number;
    totalUsers: number;
  } {
    let regularUsers = 0;
    let irregularUsers = 0;

    Object.keys(paymentsByUser).forEach(userId => {
      const payments = paymentsByUser[userId];

      if (payments.length < 3) {
        irregularUsers++;
        return;
      }

      const isRegular = this.isPaymentPatternRegular(payments);
      if (isRegular) {
        regularUsers++;
      } else {
        irregularUsers++;
      }
    });

    const totalUsers = regularUsers + irregularUsers;

    return {
      regular: parseFloat(((regularUsers / totalUsers) * 100).toFixed(1)),
      irregular: parseFloat(((irregularUsers / totalUsers) * 100).toFixed(1)),
      totalUsers
    };
  }

  private isPaymentPatternRegular(payments: PaymentData[]): boolean {
    const sortedPayments = [...payments].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const intervals: number[] = [];
    for (let i = 1; i < sortedPayments.length; i++) {
      const current = new Date(sortedPayments[i].date);
      const previous = new Date(sortedPayments[i-1].date);
      const interval = Math.floor((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));
      intervals.push(interval);
    }

    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => {
      return sum + Math.pow(interval - avgInterval, 2);
    }, 0) / intervals.length;
    const stdDev = Math.sqrt(variance);

    return stdDev < (avgInterval / 2);
  }

  private calculatePaymentTrend(paymentsByDay: Record<string, PaymentData[]>): {
    trend: 'increasing' | 'decreasing' | 'stable' | 'insufficient_data';
    slope: number;
    rSquared: number;
    firstDay: string;
    lastDay: string;
    periodDays: number;
  } {
    const daysList = Object.keys(paymentsByDay).sort();

    if (daysList.length < 2) {
      return { trend: 'insufficient_data', slope: 0, rSquared: 0, firstDay: '', lastDay: '', periodDays: 0 };
    }

    const dailyTotals = daysList.map(day => ({
      date: day,
      total: paymentsByDay[day].reduce((sum, payment) => sum + payment.amount, 0)
    }));

    const regression = this.linearRegression(
      dailyTotals.map((_, index) => index),
      dailyTotals.map(day => day.total)
    );

    let trend: 'increasing' | 'decreasing' | 'stable';
    if (regression.slope > 0.05) {
      trend = 'increasing';
    } else if (regression.slope < -0.05) {
      trend = 'decreasing';
    } else {
      trend = 'stable';
    }

    return {
      trend,
      slope: parseFloat(regression.slope.toFixed(3)),
      rSquared: parseFloat(regression.rSquared.toFixed(3)),
      firstDay: daysList[0],
      lastDay: daysList[daysList.length - 1],
      periodDays: daysList.length
    };
  }

  private linearRegression(x: number[], y: number[]): { slope: number; intercept: number; rSquared: number } {
    const n = x.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;
    let sumYY = 0;

    for (let i = 0; i < n; i++) {
      sumX += x[i];
      sumY += y[i];
      sumXY += x[i] * y[i];
      sumXX += x[i] * x[i];
      sumYY += y[i] * y[i];
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const xMean = sumX / n;
    const yMean = sumY / n;
    let totalVariation = 0;
    let explainedVariation = 0;

    for (let i = 0; i < n; i++) {
      totalVariation += Math.pow(y[i] - yMean, 2);
      explainedVariation += Math.pow((slope * x[i] + intercept) - yMean, 2);
    }

    const rSquared = explainedVariation / totalVariation;

    return { slope, intercept, rSquared };
  }

  private calculateEarlyPaymentRatio(paymentData: PaymentData[]): {
    early: number;
    onTime: number;
    late: number;
    averageDaysEarly: number;
  } {
    const earlyPayments = paymentData.filter(payment => payment.daysBeforeDue > 0);
    const onTimePayments = paymentData.filter(
      payment => payment.daysBeforeDue === 0 || payment.daysBeforeDue === -1
    );
    const latePayments = paymentData.filter(payment => payment.daysBeforeDue < -1);

    const total = paymentData.length;

    return {
      early: parseFloat(((earlyPayments.length / total) * 100).toFixed(1)),
      onTime: parseFloat(((onTimePayments.length / total) * 100).toFixed(1)),
      late: parseFloat(((latePayments.length / total) * 100).toFixed(1)),
      averageDaysEarly: parseFloat(
        (earlyPayments.reduce((sum, p) => sum + p.daysBeforeDue, 0) / 
        (earlyPayments.length || 1)).toFixed(1)
      )
    };
  }

  private generateInsightsFromMetrics(metrics: CreditorMetrics): string[] {
    const insights: string[] = [];

    if (metrics.frequency.daily > 30) {
      insights.push("A significant portion of your users (over 30%) make daily contributions via roundups, indicating strong engagement.");
    }

    if (metrics.consistency.regular > 70) {
      insights.push("Most users demonstrate consistent payment patterns, suggesting the roundup approach encourages regular debt reduction.");
    } else if (metrics.consistency.regular < 40) {
      insights.push("Many users show irregular payment patterns. Consider implementing engagement strategies to increase consistency.");
    }

    if (metrics.growth.trend === 'increasing') {
      insights.push(`Payment amounts are trending upward over the last ${metrics.growth.periodDays} days, indicating growing user confidence in your debt products.`);
    } else if (metrics.growth.trend === 'decreasing') {
      insights.push(`Payment amounts have been decreasing over the last ${metrics.growth.periodDays} days. This may warrant further investigation into user satisfaction.`);
    }

    if (metrics.earlyPayment.early > 50) {
      insights.push(`Over half of payments are made before due dates, with users paying an average of ${metrics.earlyPayment.averageDaysEarly} days early, reducing interest costs.`);
    }

    insights.push(`Users made an average payment of $${metrics.summary.averagePayment} through the MicroRepay system, with ${metrics.summary.totalPayments} total payments processed.`);

    return insights;
  }

  private groupByDate(payments: PaymentData[], granularity: 'day' | 'week' | 'month' = 'day'): Record<string, PaymentData[]> {
    const grouped: Record<string, PaymentData[]> = {};

    payments.forEach(payment => {
      const date = new Date(payment.date);
      let key: string;

      switch (granularity) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const januaryFirst = new Date(date.getFullYear(), 0, 1);
          const weekNumber = Math.ceil(
            ((date.getTime() - januaryFirst.getTime()) / 86400000 + januaryFirst.getDay()) / 7
          );
          key = `${date.getFullYear()}-W${weekNumber}`;
          break;
        case 'month':
          key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }

      grouped[key].push(payment);
    });

    return grouped;
  }

  private groupByUser(payments: PaymentData[]): Record<string, PaymentData[]> {
    const grouped: Record<string, PaymentData[]> = {};

    payments.forEach(payment => {
      if (!grouped[payment.userId]) {
        grouped[payment.userId] = [];
      }

      grouped[payment.userId].push(payment);
    });

    return grouped;
  }

  private anonymizeUserData(userData: any): any {
    const anonymized = { ...userData };

    delete anonymized.name;
    delete anonymized.email;
    delete anonymized.phoneNumber;
    delete anonymized.address;
    delete anonymized.socialSecurityNumber;

    anonymized.userId = this.generatePseudonym(userData.userId);

    return anonymized;
  }

  private generatePseudonym(userId: string): string {
    return `user_${this.hashCode(userId).toString(16)}`;
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private async getAnonymizedPaymentData(accounts: string[], timeframe: string): Promise<PaymentData[]> {
    // In a real implementation, this would fetch from a database
    // For this example, return mock data
    return [
      {
        userId: this.generatePseudonym("user123"),
        amount: 25.75,
        date: "2025-05-01T14:23:45Z",
        daysBeforeDue: 5
      },
      {
        userId: this.generatePseudonym("user456"),
        amount: 10.50,
        date: "2025-05-02T09:12:30Z",
        daysBeforeDue: 2
      },
      {
        userId: this.generatePseudonym("user789"),
        amount: 15.25,
        date: "2025-05-03T16:45:20Z",
        daysBeforeDue: -2
      }
    ];
  }

  private getTimeframeStart(timeframe: string): string {
    const now = new Date();
    const start = new Date(now);

    switch (timeframe) {
      case this.timeframes.DAILY:
        start.setDate(now.getDate() - 1);
        break;
      case this.timeframes.WEEKLY:
        start.setDate(now.getDate() - 7);
        break;
      case this.timeframes.MONTHLY:
        start.setMonth(now.getMonth() - 1);
        break;
      case this.timeframes.QUARTERLY:
        start.setMonth(now.getMonth() - 3);
        break;
      case this.timeframes.YEARLY:
        start.setFullYear(now.getFullYear() - 1);
        break;
      default:
        start.setMonth(now.getMonth() - 1);
    }

    return start.toISOString();
  }

  private async getCreditorById(creditorId: string): Promise<any> {
    return { id: creditorId, name: "Example Bank" };
  }

  private async getCreditorAccounts(creditorId: string): Promise<string[]> {
    return ["acc123", "acc456", "acc789"];
  }
} 