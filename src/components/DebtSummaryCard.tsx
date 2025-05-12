
import { CircleDollarSign } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Debt } from "@/types";

interface DebtSummaryCardProps {
  debts: Debt[];
}

const DebtSummaryCard = ({ debts }: DebtSummaryCardProps) => {
  // Calculate total current debt and original debt
  const totalCurrentDebt = debts.reduce((sum, debt) => sum + debt.currentBalance, 0);
  const totalOriginalDebt = debts.reduce((sum, debt) => sum + debt.originalBalance, 0);
  
  // Calculate progress (how much has been paid off)
  const paidOffAmount = totalOriginalDebt - totalCurrentDebt;
  const progress = (paidOffAmount / totalOriginalDebt) * 100;
  
  // Calculate average interest rate (weighted by current balance)
  const totalWeightedInterest = debts.reduce(
    (sum, debt) => sum + debt.interestRate * debt.currentBalance, 
    0
  );
  const averageInterestRate = totalWeightedInterest / totalCurrentDebt;

  return (
    <div className="card-element p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Debt Summary</h3>
        <CircleDollarSign className="h-5 w-5 text-purple" />
      </div>
      
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500">Current Total</p>
          <p className="text-3xl font-bold text-navy">
            ${totalCurrentDebt.toFixed(2)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Original Total</p>
          <p className="text-lg font-medium">
            ${totalOriginalDebt.toFixed(2)}
          </p>
        </div>
      </div>
      
      <p className="text-sm font-medium mb-1">
        Payoff Progress: {progress.toFixed(1)}%
      </p>
      <Progress value={progress} className="h-2 mb-4" />
      
      <div className="flex justify-between text-sm">
        <p className="text-gray-500">
          Debts: <span className="font-medium text-navy">{debts.length}</span>
        </p>
        <p className="text-gray-500">
          Avg Interest: <span className="font-medium text-coral">{(averageInterestRate * 100).toFixed(2)}%</span>
        </p>
      </div>
    </div>
  );
};

export default DebtSummaryCard;
