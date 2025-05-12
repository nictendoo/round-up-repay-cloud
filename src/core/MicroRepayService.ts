/**
 * MicroRepay Core Service
 * 
 * This module integrates all core components of the MicroRepay system:
 * - Security Framework
 * - Analytics Engine
 * - Gamification System
 * - Creditor Integration
 * - Optimization Engine
 */

import { SecurityFrameworkImpl, SecurityFramework } from './security/SecurityFramework';
import { AnalyticsEngine } from './analytics/AnalyticsEngine';
import { GamificationSystem } from './gamification/GamificationSystem';
import { CreditorIntegration } from './integration/CreditorIntegration';
import { OptimizationEngine, DebtAccount, PaymentSchedule } from './optimization/OptimizationEngine';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  preferences: {
    optimizationStrategy: string;
    privacySettings: {
      anonymizationLevel: 'low' | 'medium' | 'high';
      retentionPeriod: number;
    };
  };
}

export interface RoundupTransaction {
  id: string;
  userId: string;
  amount: number;
  date: string;
  status: 'pending' | 'processed' | 'failed';
}

export class MicroRepayService {
  private securityFramework: SecurityFrameworkImpl;
  private analyticsEngine: AnalyticsEngine;
  private gamificationSystem: GamificationSystem;
  private creditorIntegration: CreditorIntegration;
  private optimizationEngine: OptimizationEngine;

  constructor(
    securityConfig: SecurityFramework,
    apiKeys: Record<string, string>,
    creditorConfig: { creditors: any[] },
    db: any // Database interface
  ) {
    this.securityFramework = new SecurityFrameworkImpl(securityConfig);
    this.analyticsEngine = new AnalyticsEngine(db, {
      anonymizationLevel: 'medium',
      retentionPeriod: 90
    });
    this.gamificationSystem = new GamificationSystem(db);
    this.creditorIntegration = new CreditorIntegration(apiKeys, creditorConfig);
    this.optimizationEngine = new OptimizationEngine();
  }

  async processRoundup(
    userId: string,
    amount: number
  ): Promise<{
    success: boolean;
    transactionId: string;
    paymentSchedule: PaymentSchedule[];
    projectedSavings: {
      totalInterestSaved: number;
      monthsToPayoff: number;
      totalPayments: number;
    };
  }> {
    try {
      // 1. Get user profile and preferences
      const userProfile = await this.getUserProfile(userId);
      
      // 2. Get current debt balances
      const debtBalances = await this.creditorIntegration.getDebtBalances(userId);
      
      // 3. Convert balances to debt accounts format
      const debtAccounts: DebtAccount[] = Object.entries(debtBalances).map(
        ([creditorId, data]: [string, any]) => ({
          id: `${creditorId}-${data.accountId}`,
          creditorId,
          accountId: data.accountId,
          currentBalance: data.balance,
          interestRate: data.interestRate,
          minimumPayment: data.minimumPayment,
          dueDate: data.dueDate
        })
      );

      // 4. Optimize payment schedule
      const paymentSchedule = this.optimizationEngine.optimizePayments(
        userProfile.preferences.optimizationStrategy,
        debtAccounts,
        amount,
        new Date().toISOString()
      );

      // 5. Calculate projected savings
      const projectedSavings = this.optimizationEngine.calculateProjectedSavings(
        debtAccounts,
        paymentSchedule
      );

      // 6. Create roundup transaction
      const transaction: RoundupTransaction = {
        id: `TRX-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        userId,
        amount,
        date: new Date().toISOString(),
        status: 'pending'
      };

      // 7. Process payments
      for (const payment of paymentSchedule) {
        const creditorId = debtAccounts.find(
          account => account.accountId === payment.accountId
        )?.creditorId;

        if (creditorId) {
          await this.creditorIntegration.makePayment(
            userId,
            creditorId,
            payment.accountId,
            payment.amount
          );
        }
      }

      // 8. Update transaction status
      transaction.status = 'processed';

      // 9. Update analytics
      await this.analyticsEngine.generateCreditorInsights(userId);

      // 10. Update gamification
      // Use the first debt account's ID as the debtId for gamification
      const primaryDebtId = debtAccounts[0]?.id || 'unknown';
      await this.gamificationSystem.processCompletedPayment(userId, amount, primaryDebtId);

      return {
        success: true,
        transactionId: transaction.id,
        paymentSchedule,
        projectedSavings
      };
    } catch (error) {
      console.error('Error processing roundup:', error);
      throw new Error(`Failed to process roundup: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile> {
    // Mock implementation - replace with actual database call
    return {
      id: userId,
      name: 'John Doe',
      email: 'john@example.com',
      preferences: {
        optimizationStrategy: 'hybrid',
        privacySettings: {
          anonymizationLevel: 'medium',
          retentionPeriod: 90
        }
      }
    };
  }

  async getAvailableStrategies() {
    return this.optimizationEngine.getAvailableStrategies();
  }

  async getCreditorInsights(userId: string) {
    return this.analyticsEngine.generateCreditorInsights(userId);
  }

  async getUserStats(userId: string) {
    return this.gamificationSystem.getUserStats(userId);
  }

  async getLeaderboard() {
    return this.gamificationSystem.getLeaderboard();
  }
} 