
import { CreditCard } from "lucide-react";
import { Transaction } from "@/types";
import { Button } from "@/components/ui/button";

interface RecentTransactionsCardProps {
  transactions: Transaction[];
}

const RecentTransactionsCard = ({ transactions }: RecentTransactionsCardProps) => {
  // Show only the 5 most recent transactions
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="card-element p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Recent Transactions</h3>
        <CreditCard className="h-5 w-5 text-skyblue" />
      </div>
      
      <div className="space-y-4 mb-4">
        {recentTransactions.map((transaction) => (
          <div 
            key={transaction.id} 
            className="flex items-center justify-between pb-3 border-b border-gray-100 last:border-0"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-xs font-medium">{transaction.merchantName.substring(0, 2)}</span>
              </div>
              <div>
                <p className="font-medium text-sm">{transaction.merchantName}</p>
                <p className="text-xs text-gray-500">
                  {new Date(transaction.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">${transaction.amount.toFixed(2)}</p>
              <p className="text-xs text-skyblue">
                +${transaction.roundUpAmount.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <Button variant="outline" className="w-full" size="sm">
        View All Transactions
      </Button>
    </div>
  );
};

export default RecentTransactionsCard;
