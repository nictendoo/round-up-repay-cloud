/**
 * MicroRepay Optimization Engine
 * 
 * This module implements the optimization logic for payment scheduling
 * and debt reduction strategies.
 */

export interface DebtAccount {
  id: string;
  creditorId: string;
  accountId: string;
  currentBalance: number;
  interestRate: number;
  minimumPayment: number;
  dueDate: string;
}

export interface PaymentSchedule {
  accountId: string;
  amount: number;
  date: string;
  priority: number;
}

export interface OptimizationStrategy {
  name: string;
  description: string;
  calculatePayments(
    accounts: DebtAccount[],
    availableFunds: number,
    startDate: string
  ): PaymentSchedule[];
}

export class AvalancheStrategy implements OptimizationStrategy {
  name = 'Debt Avalanche';
  description = 'Prioritizes debts with highest interest rates to minimize total interest paid';

  calculatePayments(
    accounts: DebtAccount[],
    availableFunds: number,
    startDate: string
  ): PaymentSchedule[] {
    const sortedAccounts = [...accounts].sort((a, b) => b.interestRate - a.interestRate);
    return this.generateSchedule(sortedAccounts, availableFunds, startDate);
  }

  private generateSchedule(
    accounts: DebtAccount[],
    availableFunds: number,
    startDate: string
  ): PaymentSchedule[] {
    const schedule: PaymentSchedule[] = [];
    let remainingFunds = availableFunds;

    for (const account of accounts) {
      if (remainingFunds <= 0) break;

      const paymentAmount = Math.min(
        remainingFunds,
        account.currentBalance
      );

      if (paymentAmount > 0) {
        schedule.push({
          accountId: account.accountId,
          amount: paymentAmount,
          date: startDate,
          priority: schedule.length + 1
        });

        remainingFunds -= paymentAmount;
      }
    }

    return schedule;
  }
}

export class SnowballStrategy implements OptimizationStrategy {
  name = 'Debt Snowball';
  description = 'Prioritizes smallest debts first to build momentum';

  calculatePayments(
    accounts: DebtAccount[],
    availableFunds: number,
    startDate: string
  ): PaymentSchedule[] {
    const sortedAccounts = [...accounts].sort((a, b) => a.currentBalance - b.currentBalance);
    return this.generateSchedule(sortedAccounts, availableFunds, startDate);
  }

  private generateSchedule(
    accounts: DebtAccount[],
    availableFunds: number,
    startDate: string
  ): PaymentSchedule[] {
    const schedule: PaymentSchedule[] = [];
    let remainingFunds = availableFunds;

    for (const account of accounts) {
      if (remainingFunds <= 0) break;

      const paymentAmount = Math.min(
        remainingFunds,
        account.currentBalance
      );

      if (paymentAmount > 0) {
        schedule.push({
          accountId: account.accountId,
          amount: paymentAmount,
          date: startDate,
          priority: schedule.length + 1
        });

        remainingFunds -= paymentAmount;
      }
    }

    return schedule;
  }
}

export class HybridStrategy implements OptimizationStrategy {
  name = 'Hybrid Strategy';
  description = 'Combines avalanche and snowball approaches based on debt characteristics';

  calculatePayments(
    accounts: DebtAccount[],
    availableFunds: number,
    startDate: string
  ): PaymentSchedule[] {
    // Split accounts into high-interest and low-balance groups
    const highInterestThreshold = 0.15; // 15% APR
    const lowBalanceThreshold = 1000; // $1,000

    const highInterestAccounts = accounts.filter(
      account => account.interestRate >= highInterestThreshold
    ).sort((a, b) => b.interestRate - a.interestRate);

    const lowBalanceAccounts = accounts.filter(
      account => account.currentBalance <= lowBalanceThreshold
    ).sort((a, b) => a.currentBalance - b.currentBalance);

    // Allocate 70% of funds to high-interest debts
    const highInterestFunds = availableFunds * 0.7;
    const lowBalanceFunds = availableFunds * 0.3;

    const schedule: PaymentSchedule[] = [];

    // Process high-interest accounts first
    let remainingHighInterestFunds = highInterestFunds;
    for (const account of highInterestAccounts) {
      if (remainingHighInterestFunds <= 0) break;

      const paymentAmount = Math.min(
        remainingHighInterestFunds,
        account.currentBalance
      );

      if (paymentAmount > 0) {
        schedule.push({
          accountId: account.accountId,
          amount: paymentAmount,
          date: startDate,
          priority: schedule.length + 1
        });

        remainingHighInterestFunds -= paymentAmount;
      }
    }

    // Process low-balance accounts
    let remainingLowBalanceFunds = lowBalanceFunds;
    for (const account of lowBalanceAccounts) {
      if (remainingLowBalanceFunds <= 0) break;

      const paymentAmount = Math.min(
        remainingLowBalanceFunds,
        account.currentBalance
      );

      if (paymentAmount > 0) {
        schedule.push({
          accountId: account.accountId,
          amount: paymentAmount,
          date: startDate,
          priority: schedule.length + 1
        });

        remainingLowBalanceFunds -= paymentAmount;
      }
    }

    return schedule;
  }
}

export class OptimizationEngine {
  private strategies: Map<string, OptimizationStrategy>;

  constructor() {
    this.strategies = new Map([
      ['avalanche', new AvalancheStrategy()],
      ['snowball', new SnowballStrategy()],
      ['hybrid', new HybridStrategy()]
    ]);
  }

  getAvailableStrategies(): OptimizationStrategy[] {
    return Array.from(this.strategies.values());
  }

  optimizePayments(
    strategyName: string,
    accounts: DebtAccount[],
    availableFunds: number,
    startDate: string = new Date().toISOString()
  ): PaymentSchedule[] {
    const strategy = this.strategies.get(strategyName.toLowerCase());
    
    if (!strategy) {
      throw new Error(`Unknown optimization strategy: ${strategyName}`);
    }

    return strategy.calculatePayments(accounts, availableFunds, startDate);
  }

  calculateProjectedSavings(
    accounts: DebtAccount[],
    paymentSchedule: PaymentSchedule[]
  ): {
    totalInterestSaved: number;
    monthsToPayoff: number;
    totalPayments: number;
  } {
    let totalInterestSaved = 0;
    let monthsToPayoff = 0;
    let totalPayments = 0;

    // Create a copy of accounts to simulate payments
    const simulatedAccounts = accounts.map(account => ({
      ...account,
      remainingBalance: account.currentBalance
    }));

    // Simulate payments month by month
    while (simulatedAccounts.some(account => account.remainingBalance > 0)) {
      monthsToPayoff++;
      
      // Apply monthly interest
      for (const account of simulatedAccounts) {
        if (account.remainingBalance > 0) {
          const monthlyInterest = account.remainingBalance * (account.interestRate / 12);
          account.remainingBalance += monthlyInterest;
        }
      }

      // Apply scheduled payments
      for (const payment of paymentSchedule) {
        const account = simulatedAccounts.find(acc => acc.accountId === payment.accountId);
        if (account && account.remainingBalance > 0) {
          const paymentAmount = Math.min(payment.amount, account.remainingBalance);
          account.remainingBalance -= paymentAmount;
          totalPayments += paymentAmount;
        }
      }
    }

    // Calculate interest saved compared to minimum payments
    const originalTotal = accounts.reduce((sum, account) => {
      const monthlyPayment = account.minimumPayment;
      const monthlyInterest = account.currentBalance * (account.interestRate / 12);
      const monthsToPayoff = Math.ceil(
        account.currentBalance / (monthlyPayment - monthlyInterest)
      );
      return sum + (monthlyPayment * monthsToPayoff);
    }, 0);

    totalInterestSaved = originalTotal - totalPayments;

    return {
      totalInterestSaved,
      monthsToPayoff,
      totalPayments
    };
  }
} 