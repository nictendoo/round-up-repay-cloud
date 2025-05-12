
// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  preferences: UserPreferences;
  engagementScore: number;
  points: number;
  walletId: string;
  badges: string[];
  milestones: Milestone[];
}

export interface UserPreferences {
  roundUpThreshold: number;
  transferFrequency: "immediate" | "daily" | "weekly";
  defaultAllocationStrategy: "avalanche" | "snowball" | "custom";
}

// Transaction Types
export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  merchantName: string;
  amount: number;
  roundUpAmount: number;
  date: string;
  category: string;
  processed: boolean;
  transferredToWallet: boolean;
  transferredAt?: string;
}

// Wallet Types
export interface RoundUpWallet {
  id: string;
  userId: string;
  balance: number;
  transferThreshold: number;
  lastTransferredAt?: string;
  transferHistory: Transfer[];
}

export interface Transfer {
  id: string;
  amount: number;
  date: string;
  destinationIds: string[]; // Array of debt IDs
}

// Debt Types
export interface Debt {
  id: string;
  userId: string;
  creditorId: string;
  accountId: string;
  creditorName: string;
  accountType: "credit_card" | "student_loan" | "mortgage" | "personal_loan" | "other";
  currentBalance: number;
  originalBalance: number;
  interestRate: number;
  minimumPayment: number;
  dueDate: string;
  paymentHistory: Payment[];
  lastSyncedAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  debtId: string;
  amount: number;
  date: string;
  confirmationNumber?: string;
  sourceFunds: "round_up" | "direct" | "scheduled";
  status: "pending" | "completed" | "failed";
}

// Badge and Gamification Types
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface Milestone {
  id: string;
  name: string;
  currentLevel: number;
  nextLevel: number;
  progress: number;
  unit: string;
  pointValue: number;
}

// Error Types
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details: Record<string, any>;
  };
}

// Mock Data Types
export interface MockData {
  user: User;
  transactions: Transaction[];
  wallet: RoundUpWallet;
  debts: Debt[];
  badges: Badge[];
}
