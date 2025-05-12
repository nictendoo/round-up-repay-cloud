
import { MockData, Badge, Debt, Transaction, User, RoundUpWallet } from '../types';
import { calculateRoundUp } from '../utils/calculateRoundUp';

// Generate mock badges
const mockBadges: Badge[] = [
  {
    id: 'first_roundup',
    name: 'First Step',
    description: 'Complete your first round-up transaction',
    icon: 'first_step_icon.png',
    difficulty: 'easy'
  },
  {
    id: 'streak_7',
    name: 'Lucky Streak',
    description: 'Complete a 7-day round-up streak',
    icon: 'lucky_streak_icon.png',
    difficulty: 'medium'
  },
  {
    id: 'streak_30',
    name: 'Habit Builder',
    description: 'Complete a 30-day round-up streak',
    icon: 'habit_builder_icon.png',
    difficulty: 'hard'
  },
  {
    id: 'micro_hero',
    name: 'Micro Hero',
    description: 'Complete 100 round-up transactions',
    icon: 'micro_hero_icon.png',
    difficulty: 'medium'
  },
  {
    id: 'debt_slayer',
    name: 'Debt Slayer',
    description: 'Pay off 25% of your starting debt',
    icon: 'debt_slayer_icon.png',
    difficulty: 'hard'
  },
  {
    id: 'interest_buster',
    name: 'Interest Buster',
    description: 'Save $500 in interest through early payments',
    icon: 'interest_saver_icon.png',
    difficulty: 'hard'
  },
  {
    id: 'community_champion',
    name: 'Community Champion',
    description: 'Successfully refer 3 friends',
    icon: 'community_champion_icon.png',
    difficulty: 'medium'
  },
  {
    id: 'custom_goal',
    name: 'Goal Getter',
    description: 'Achieve a custom goal you set',
    icon: 'goal_getter_icon.png',
    difficulty: 'medium'
  },
  {
    id: 'debt_free',
    name: 'Freedom Fighter',
    description: 'Pay off a debt completely',
    icon: 'freedom_icon.png',
    difficulty: 'hard'
  }
];

// Generate mock transactions
const generateMockTransactions = (): Transaction[] => {
  const merchants = [
    'Coffee Shop', 'Grocery Store', 'Gas Station', 'Restaurant',
    'Online Shopping', 'Pharmacy', 'Movie Theater', 'Clothing Store'
  ];
  
  const categories = [
    'Food & Drink', 'Groceries', 'Transportation', 'Entertainment',
    'Shopping', 'Health', 'Bills & Utilities', 'Travel'
  ];
  
  const transactions: Transaction[] = [];
  
  // Generate 20 mock transactions
  for (let i = 0; i < 20; i++) {
    const amount = parseFloat((Math.random() * 100 + 1).toFixed(2));
    const merchantIndex = Math.floor(Math.random() * merchants.length);
    const categoryIndex = Math.floor(Math.random() * categories.length);
    
    // Generate date within the last 30 days
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    const transaction: Transaction = {
      id: `tx-${i.toString().padStart(3, '0')}`,
      userId: 'user-001',
      accountId: 'account-001',
      merchantName: merchants[merchantIndex],
      amount,
      roundUpAmount: calculateRoundUp(amount),
      date: date.toISOString(),
      category: categories[categoryIndex],
      processed: Math.random() > 0.2, // 80% processed
      transferredToWallet: Math.random() > 0.3, // 70% transferred
    };
    
    if (transaction.transferredToWallet) {
      transaction.transferredAt = new Date(date.getTime() + 1000 * 60 * 10).toISOString(); // 10 minutes later
    }
    
    transactions.push(transaction);
  }
  
  // Sort by date descending (newest first)
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Generate mock debts
const generateMockDebts = (): Debt[] => {
  const debts: Debt[] = [
    {
      id: 'debt-001',
      userId: 'user-001',
      creditorId: 'creditor-001',
      accountId: 'cc-account-001',
      creditorName: 'Major Bank Credit Card',
      accountType: 'credit_card',
      currentBalance: 4235.76,
      originalBalance: 5000.00,
      interestRate: 0.1799, // 17.99%
      minimumPayment: 85.00,
      dueDate: '2025-05-25',
      paymentHistory: [
        {
          id: 'payment-001',
          userId: 'user-001',
          debtId: 'debt-001',
          amount: 125.00,
          date: '2025-04-15T10:30:00Z',
          confirmationNumber: 'PMT-12345',
          sourceFunds: 'round_up',
          status: 'completed'
        },
        {
          id: 'payment-002',
          userId: 'user-001',
          debtId: 'debt-001',
          amount: 85.00,
          date: '2025-03-18T14:20:00Z',
          confirmationNumber: 'PMT-12245',
          sourceFunds: 'direct',
          status: 'completed'
        }
      ],
      lastSyncedAt: new Date().toISOString()
    },
    {
      id: 'debt-002',
      userId: 'user-001',
      creditorId: 'creditor-002',
      accountId: 'loan-account-001',
      creditorName: 'Student Loan Provider',
      accountType: 'student_loan',
      currentBalance: 15250.45,
      originalBalance: 25000.00,
      interestRate: 0.0450, // 4.5%
      minimumPayment: 180.00,
      dueDate: '2025-05-15',
      paymentHistory: [
        {
          id: 'payment-003',
          userId: 'user-001',
          debtId: 'debt-002',
          amount: 230.00,
          date: '2025-04-10T09:45:00Z',
          confirmationNumber: 'PMT-54321',
          sourceFunds: 'scheduled',
          status: 'completed'
        }
      ],
      lastSyncedAt: new Date().toISOString()
    },
    {
      id: 'debt-003',
      userId: 'user-001',
      creditorId: 'creditor-003',
      accountId: 'loan-account-002',
      creditorName: 'Auto Loan',
      accountType: 'personal_loan',
      currentBalance: 8750.32,
      originalBalance: 15000.00,
      interestRate: 0.0399, // 3.99%
      minimumPayment: 275.00,
      dueDate: '2025-05-20',
      paymentHistory: [
        {
          id: 'payment-004',
          userId: 'user-001',
          debtId: 'debt-003',
          amount: 350.00,
          date: '2025-04-18T11:15:00Z',
          confirmationNumber: 'PMT-98765',
          sourceFunds: 'direct',
          status: 'completed'
        }
      ],
      lastSyncedAt: new Date().toISOString()
    }
  ];
  
  return debts;
};

// Generate mock user
const generateMockUser = (): User => {
  return {
    id: 'user-001',
    email: 'user@example.com',
    name: 'Alex Johnson',
    createdAt: '2025-01-15T08:30:00Z',
    preferences: {
      roundUpThreshold: 5.00,
      transferFrequency: 'weekly',
      defaultAllocationStrategy: 'avalanche'
    },
    engagementScore: 0.75,
    points: 245,
    walletId: 'wallet-001',
    badges: ['first_roundup', 'streak_7'],
    milestones: [
      {
        id: 'total_contributions',
        name: 'Total Contributions',
        currentLevel: 50,
        nextLevel: 100,
        progress: 0.65,
        unit: '$',
        pointValue: 50
      },
      {
        id: 'days_active',
        name: 'Days Active',
        currentLevel: 7,
        nextLevel: 30,
        progress: 0.4,
        unit: 'days',
        pointValue: 75
      }
    ]
  };
};

// Generate mock wallet
const generateMockWallet = (): RoundUpWallet => {
  return {
    id: 'wallet-001',
    userId: 'user-001',
    balance: 28.75,
    transferThreshold: 25.00,
    lastTransferredAt: '2025-05-05T14:30:00Z',
    transferHistory: [
      {
        id: 'transfer-001',
        amount: 27.50,
        date: '2025-05-05T14:30:00Z',
        destinationIds: ['debt-001', 'debt-002']
      },
      {
        id: 'transfer-002',
        amount: 32.15,
        date: '2025-04-28T10:15:00Z',
        destinationIds: ['debt-001', 'debt-003']
      }
    ]
  };
};

// Create and export the mock data
export const mockData: MockData = {
  user: generateMockUser(),
  transactions: generateMockTransactions(),
  wallet: generateMockWallet(),
  debts: generateMockDebts(),
  badges: mockBadges
};

// Service functions
export const getMockUser = (): User => mockData.user;
export const getMockTransactions = (): Transaction[] => mockData.transactions;
export const getMockWallet = (): RoundUpWallet => mockData.wallet;
export const getMockDebts = (): Debt[] => mockData.debts;
export const getMockBadges = (): Badge[] => mockData.badges;

// Add a new mock transaction
export const addMockTransaction = (amount: number, merchantName: string, category: string): Transaction => {
  const roundUpAmount = calculateRoundUp(amount);
  
  const newTransaction: Transaction = {
    id: `tx-${mockData.transactions.length.toString().padStart(3, '0')}`,
    userId: 'user-001',
    accountId: 'account-001',
    merchantName,
    amount,
    roundUpAmount,
    date: new Date().toISOString(),
    category,
    processed: true,
    transferredToWallet: false
  };
  
  // Add to beginning of array (newest first)
  mockData.transactions.unshift(newTransaction);
  
  // Update wallet balance
  mockData.wallet.balance += roundUpAmount;
  
  return newTransaction;
};
