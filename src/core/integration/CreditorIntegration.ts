/**
 * MicroRepay Creditor Integration
 * 
 * This module implements the integration with creditor APIs for debt balance
 * updates and payment processing.
 */

export interface CreditorConfig {
  id: string;
  type: 'bank' | 'credit_card' | 'loan_servicer' | 'generic';
  endpoint: string;
  version: string;
}

export interface CreditorLink {
  userId: string;
  creditorId: string;
  accountId: string;
  accessToken: string;
}

export interface BalanceResponse {
  currentBalance: number;
  interestRate: number;
  minimumPayment: number;
  dueDate: string;
}

export interface PaymentResponse {
  confirmationNumber: string;
  processedDate: string;
  status: string;
}

export interface PaymentRequest {
  amount: number;
  date: string;
  description: string;
}

export interface CreditorAdapter {
  getBalance(accessToken: string, accountId: string): Promise<BalanceResponse>;
  makePayment(accessToken: string, accountId: string, payment: PaymentRequest): Promise<PaymentResponse>;
}

export class BankAdapter implements CreditorAdapter {
  constructor(
    private readonly apiKey: string,
    private readonly endpoint: string,
    private readonly version: string
  ) {}

  async getBalance(accessToken: string, accountId: string): Promise<BalanceResponse> {
    console.log(`Getting balance for account ${accountId} from bank API`);
    
    return {
      currentBalance: 15000.50,
      interestRate: 0.0495,
      minimumPayment: 150.25,
      dueDate: "2025-05-15"
    };
  }

  async makePayment(accessToken: string, accountId: string, payment: PaymentRequest): Promise<PaymentResponse> {
    console.log(`Making payment of $${payment.amount} to account ${accountId}`);
    
    return {
      confirmationNumber: `BANK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      processedDate: new Date().toISOString(),
      status: "processed"
    };
  }
}

export class CreditCardAdapter implements CreditorAdapter {
  constructor(
    private readonly apiKey: string,
    private readonly endpoint: string,
    private readonly version: string
  ) {}

  async getBalance(accessToken: string, accountId: string): Promise<BalanceResponse> {
    console.log(`Getting balance for credit card ${accountId}`);
    
    return {
      currentBalance: 2500.75,
      interestRate: 0.1999,
      minimumPayment: 50.00,
      dueDate: "2025-05-20"
    };
  }

  async makePayment(accessToken: string, accountId: string, payment: PaymentRequest): Promise<PaymentResponse> {
    console.log(`Making payment of $${payment.amount} to credit card ${accountId}`);
    
    return {
      confirmationNumber: `CC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      processedDate: new Date().toISOString(),
      status: "processed"
    };
  }
}

export class LoanServicerAdapter implements CreditorAdapter {
  constructor(
    private readonly apiKey: string,
    private readonly endpoint: string,
    private readonly version: string
  ) {}

  async getBalance(accessToken: string, accountId: string): Promise<BalanceResponse> {
    console.log(`Getting balance for loan ${accountId}`);
    
    return {
      currentBalance: 35000.00,
      interestRate: 0.0399,
      minimumPayment: 350.00,
      dueDate: "2025-05-25"
    };
  }

  async makePayment(accessToken: string, accountId: string, payment: PaymentRequest): Promise<PaymentResponse> {
    console.log(`Making payment of $${payment.amount} to loan ${accountId}`);
    
    return {
      confirmationNumber: `LOAN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      processedDate: new Date().toISOString(),
      status: "processed"
    };
  }
}

export class GenericCreditorAdapter implements CreditorAdapter {
  constructor(
    private readonly apiKey: string,
    private readonly endpoint: string,
    private readonly version: string
  ) {}

  async getBalance(accessToken: string, accountId: string): Promise<BalanceResponse> {
    console.log(`Getting balance for generic creditor account ${accountId}`);
    
    return {
      currentBalance: 10000.00,
      interestRate: 0.0599,
      minimumPayment: 100.00,
      dueDate: "2025-05-30"
    };
  }

  async makePayment(accessToken: string, accountId: string, payment: PaymentRequest): Promise<PaymentResponse> {
    console.log(`Making payment of $${payment.amount} to generic creditor account ${accountId}`);
    
    return {
      confirmationNumber: `GEN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      processedDate: new Date().toISOString(),
      status: "processed"
    };
  }
}

export class CreditorIntegration {
  private readonly creditorAdapters: Record<string, CreditorAdapter>;
  private readonly retryConfig = {
    maxRetries: 3,
    initialDelay: 1000,
    backoffFactor: 2
  };

  constructor(
    private readonly apiKeys: Record<string, string>,
    private readonly config: { creditors: CreditorConfig[] }
  ) {
    this.creditorAdapters = this.initializeAdapters();
  }

  private initializeAdapters(): Record<string, CreditorAdapter> {
    const adapters: Record<string, CreditorAdapter> = {};

    for (const creditor of this.config.creditors) {
      switch (creditor.type) {
        case 'bank':
          adapters[creditor.id] = new BankAdapter(
            this.apiKeys[creditor.id],
            creditor.endpoint,
            creditor.version
          );
          break;

        case 'credit_card':
          adapters[creditor.id] = new CreditCardAdapter(
            this.apiKeys[creditor.id],
            creditor.endpoint,
            creditor.version
          );
          break;

        case 'loan_servicer':
          adapters[creditor.id] = new LoanServicerAdapter(
            this.apiKeys[creditor.id],
            creditor.endpoint,
            creditor.version
          );
          break;

        default:
          adapters[creditor.id] = new GenericCreditorAdapter(
            this.apiKeys[creditor.id],
            creditor.endpoint,
            creditor.version
          );
      }
    }

    return adapters;
  }

  async getDebtBalances(userId: string): Promise<Record<string, any>> {
    const userCreditors = await this.getUserCreditors(userId);
    const balances: Record<string, any> = {};

    const promises = userCreditors.map(async (creditorLink) => {
      const { creditorId, accountId, accessToken } = creditorLink;
      const adapter = this.creditorAdapters[creditorId];

      if (!adapter) {
        console.error(`No adapter found for creditor ID: ${creditorId}`);
        return;
      }

      try {
        const balance = await this.executeWithRetry(() => 
          adapter.getBalance(accessToken, accountId)
        );

        balances[creditorId] = {
          accountId,
          balance: balance.currentBalance,
          interestRate: balance.interestRate,
          minimumPayment: balance.minimumPayment,
          dueDate: balance.dueDate,
          lastUpdated: new Date().toISOString()
        };
      } catch (error) {
        console.error(`Failed to get balance for creditor ${creditorId}:`, error);
        balances[creditorId] = {
          accountId,
          error: error instanceof Error ? error.message : 'Unknown error',
          lastUpdated: new Date().toISOString()
        };
      }
    });

    await Promise.allSettled(promises);
    return balances;
  }

  async makePayment(
    userId: string,
    creditorId: string,
    accountId: string,
    amount: number
  ): Promise<{
    success: boolean;
    confirmationNumber: string;
    processedDate: string;
    creditorId: string;
    accountId: string;
    amount: number;
  }> {
    const userCreditors = await this.getUserCreditors(userId);
    const creditorLink = userCreditors.find(
      link => link.creditorId === creditorId && link.accountId === accountId
    );

    if (!creditorLink) {
      throw new Error(`User ${userId} does not have access to account ${accountId} with creditor ${creditorId}`);
    }

    const adapter = this.creditorAdapters[creditorId];
    if (!adapter) {
      throw new Error(`No adapter found for creditor ID: ${creditorId}`);
    }

    const payment: PaymentRequest = {
      amount,
      date: new Date().toISOString(),
      description: 'MicroRepay automated payment'
    };

    try {
      const result = await this.executeWithRetry(() => 
        adapter.makePayment(creditorLink.accessToken, accountId, payment)
      );

      await this.logPayment(userId, creditorId, accountId, amount, result.confirmationNumber);

      return {
        success: true,
        confirmationNumber: result.confirmationNumber,
        processedDate: result.processedDate,
        creditorId,
        accountId,
        amount
      };
    } catch (error) {
      await this.logPaymentFailure(
        userId,
        creditorId,
        accountId,
        amount,
        error instanceof Error ? error.message : 'Unknown error'
      );

      throw new Error(`Payment to creditor ${creditorId} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async getUserCreditors(userId: string): Promise<CreditorLink[]> {
    return [
      {
        userId,
        creditorId: 'creditor1',
        accountId: 'acc123456',
        accessToken: 'token123'
      },
      {
        userId,
        creditorId: 'creditor2',
        accountId: 'acc789012',
        accessToken: 'token456'
      }
    ];
  }

  private async logPayment(
    userId: string,
    creditorId: string,
    accountId: string,
    amount: number,
    confirmationNumber: string
  ): Promise<void> {
    console.log(`Payment logged: ${userId} paid $${amount} to ${creditorId} (${accountId}), confirmation: ${confirmationNumber}`);
  }

  private async logPaymentFailure(
    userId: string,
    creditorId: string,
    accountId: string,
    amount: number,
    errorMessage: string
  ): Promise<void> {
    console.error(`Payment failed: ${userId} attempted to pay $${amount} to ${creditorId} (${accountId}), error: ${errorMessage}`);
  }

  private async executeWithRetry<T>(fn: () => Promise<T>, retryCount = 0): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retryCount >= this.retryConfig.maxRetries) {
        throw error;
      }

      const delay = this.retryConfig.initialDelay * 
        Math.pow(this.retryConfig.backoffFactor, retryCount);

      console.log(`Retrying after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));

      return this.executeWithRetry(fn, retryCount + 1);
    }
  }
} 