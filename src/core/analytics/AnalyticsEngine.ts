/**
 * MicroRepay Analytics Engine
 * 
 * This module implements the analytics capabilities for the MicroRepay system,
 * providing insights and metrics for both users and creditors.
 */

export interface PrivacySettings {
  dataRetention: string;
  anonymization: boolean;
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
  frequency: {
    daily: number;
    weekly: number;
    monthly: number;
    occasional: number;
  };
  consistency: number;
  growth: {
    trend: number;
    period: string;
  };
  earlyPayment: {
    early: number;
    onTime: number;
    late: number;
    averageDaysEarly: number;
  };
}

export interface CreditorInsights {
  metrics: CreditorMetrics;
  recommendations: string[];
  riskAssessment: {
    level: "low" | "medium" | "high";
    factors: string[];
  };
}

export class AnalyticsEngine {
  private readonly timeframes = {
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
    year: 365 * 24 * 60 * 60 * 1000
  };

  constructor(
    private readonly db: any,
    private readonly privacySettings: PrivacySettings
  ) {}

  async generateCreditorInsights(userId: string): Promise<CreditorInsights> {
    const paymentData = await this.getPaymentData(userId);
    const metrics = this.calculateCreditorMetrics(paymentData);
    const recommendations = this.generateRecommendations(metrics);
    const riskAssessment = this.assessRisk(metrics);

    return {
      metrics,
      recommendations,
      riskAssessment
    };
  }

  private async getPaymentData(userId: string): Promise<PaymentData[]> {
    // TODO: Implement actual database query
    return [];
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

  private groupByDate(paymentData: PaymentData[], timeframe: keyof typeof this.timeframes): Record<string, PaymentData[]> {
    const grouped: Record<string, PaymentData[]> = {};
    const timeframeMs = this.timeframes[timeframe];

    paymentData.forEach(payment => {
      const date = new Date(payment.date);
      const key = Math.floor(date.getTime() / timeframeMs).toString();
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(payment);
    });

    return grouped;
  }

  private groupByUser(paymentData: PaymentData[]): Record<string, PaymentData[]> {
    const grouped: Record<string, PaymentData[]> = {};

    paymentData.forEach(payment => {
      if (!grouped[payment.userId]) {
        grouped[payment.userId] = [];
      }
      grouped[payment.userId].push(payment);
    });

    return grouped;
  }

  private calculatePaymentFrequency(paymentsByUser: Record<string, PaymentData[]>): {
    daily: number;
    weekly: number;
    monthly: number;
    occasional: number;
  } {
    const frequencies = Object.values(paymentsByUser).map(payments => 
      this.calculateUserPaymentFrequency(payments)
    );

    return {
      daily: frequencies.filter(f => f === 'daily').length,
      weekly: frequencies.filter(f => f === 'weekly').length,
      monthly: frequencies.filter(f => f === 'monthly').length,
      occasional: frequencies.filter(f => f === 'occasional').length
    };
  }

  private calculateUserPaymentFrequency(payments: PaymentData[]): string {
    const count = payments.length;

    if (count >= 30) return 'daily';
    if (count >= 8) return 'weekly';
    if (count >= 2) return 'monthly';
    return 'occasional';
  }

  private calculateConsistencyRatio(paymentsByUser: Record<string, PaymentData[]>): number {
    const ratios = Object.values(paymentsByUser).map(payments => {
      const dates = payments.map(p => new Date(p.date).getTime()).sort((a, b) => a - b);
      if (dates.length < 2) return 0;

      const intervals = [];
      for (let i = 1; i < dates.length; i++) {
        intervals.push(dates[i] - dates[i - 1]);
      }

      const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
      const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
      const stdDev = Math.sqrt(variance);

      return 1 - (stdDev / avgInterval);
    });

    return parseFloat((ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length).toFixed(2));
  }

  private calculatePaymentTrend(paymentsByDay: Record<string, PaymentData[]>): {
    trend: number;
    period: string;
  } {
    const days = Object.keys(paymentsByDay).sort((a, b) => parseInt(a) - parseInt(b));
    if (days.length < 2) {
      return { trend: 0, period: 'insufficient data' };
    }

    const amounts = days.map(day => 
      paymentsByDay[day].reduce((sum, payment) => sum + payment.amount, 0)
    );

    const xMean = (days.length - 1) / 2;
    const yMean = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < days.length; i++) {
      const x = i - xMean;
      const y = amounts[i] - yMean;
      numerator += x * y;
      denominator += x * x;
    }

    const trend = denominator === 0 ? 0 : numerator / denominator;
    const period = this.determineTrendPeriod(trend);

    return {
      trend: parseFloat(trend.toFixed(2)),
      period
    };
  }

  private determineTrendPeriod(trend: number): string {
    if (trend > 0.1) return 'growing';
    if (trend < -0.1) return 'declining';
    return 'stable';
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

  private generateRecommendations(metrics: CreditorMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.earlyPayment.late > 20) {
      recommendations.push("Consider implementing automatic payment reminders");
    }

    if (metrics.consistency < 0.7) {
      recommendations.push("Offer incentives for consistent payment behavior");
    }

    if (metrics.growth.trend < 0) {
      recommendations.push("Review payment terms and conditions");
    }

    return recommendations;
  }

  private assessRisk(metrics: CreditorMetrics): {
    level: "low" | "medium" | "high";
    factors: string[];
  } {
    const factors: string[] = [];
    let riskScore = 0;

    if (metrics.earlyPayment.late > 30) {
      riskScore += 2;
      factors.push("High rate of late payments");
    }

    if (metrics.consistency < 0.5) {
      riskScore += 1;
      factors.push("Low payment consistency");
    }

    if (metrics.growth.trend < -0.2) {
      riskScore += 1;
      factors.push("Declining payment trend");
    }

    let level: "low" | "medium" | "high";
    if (riskScore >= 3) {
      level = "high";
    } else if (riskScore >= 1) {
      level = "medium";
    } else {
      level = "low";
    }

    return { level, factors };
  }
} 