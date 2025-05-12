
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import WalletCard from "@/components/WalletCard";
import DebtSummaryCard from "@/components/DebtSummaryCard";
import RecentTransactionsCard from "@/components/RecentTransactionsCard";
import BadgesCard from "@/components/BadgesCard";
import AddTransactionCard from "@/components/AddTransactionCard";
import { mockData, getMockWallet, getMockDebts, getMockTransactions } from "@/services/mockData";

const Dashboard = () => {
  const [wallet, setWallet] = useState(getMockWallet());
  const [debts, setDebts] = useState(getMockDebts());
  const [transactions, setTransactions] = useState(getMockTransactions());
  
  // Refresh data when needed (e.g., when a transaction is added)
  const refreshData = () => {
    setWallet(getMockWallet());
    setTransactions(getMockTransactions());
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Main cards - full width on mobile, variable on larger screens */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <WalletCard wallet={wallet} />
              <DebtSummaryCard debts={debts} />
            </div>
            
            <RecentTransactionsCard transactions={transactions} />
          </div>
          
          {/* Side cards */}
          <div className="col-span-1 space-y-6">
            <AddTransactionCard onTransactionAdded={refreshData} />
            <BadgesCard 
              earnedBadgeIds={mockData.user.badges} 
              allBadges={mockData.badges}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
