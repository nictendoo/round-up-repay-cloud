
import { useState } from "react";
import { CircleDollarSign, TrendingDown, Plus } from "lucide-react";
import Layout from "@/components/Layout";
import { getMockDebts } from "@/services/mockData";
import { Debt } from "@/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const Debts = () => {
  const [debts, setDebts] = useState<Debt[]>(getMockDebts());
  
  // Calculate total debt and paid-off amounts
  const totalCurrentDebt = debts.reduce((sum, debt) => sum + debt.currentBalance, 0);
  const totalOriginalDebt = debts.reduce((sum, debt) => sum + debt.originalBalance, 0);
  const totalPaidOff = totalOriginalDebt - totalCurrentDebt;
  const percentPaidOff = (totalPaidOff / totalOriginalDebt) * 100;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold">Your Debts</h1>
          <Button className="bg-primary-gradient hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" />
            Add New Debt
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="col-span-1 card-element p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Current Balance</h3>
            <p className="text-2xl font-bold">${totalCurrentDebt.toFixed(2)}</p>
          </div>
          <div className="col-span-1 card-element p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Paid Off</h3>
            <p className="text-2xl font-bold text-skyblue">${totalPaidOff.toFixed(2)}</p>
          </div>
          <div className="col-span-1 card-element p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Payoff Progress</h3>
            <p className="text-2xl font-bold">{percentPaidOff.toFixed(1)}%</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {debts.map((debt) => {
            // Calculate progress percentage
            const progress = ((debt.originalBalance - debt.currentBalance) / debt.originalBalance) * 100;
            
            // Calculate days until due date
            const dueDate = new Date(debt.dueDate);
            const today = new Date();
            const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <div key={debt.id} className="card-element">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold">{debt.creditorName}</h3>
                      <p className="text-sm text-gray-500 capitalize">{debt.accountType.replace('_', ' ')}</p>
                    </div>
                    <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                      {(debt.interestRate * 100).toFixed(2)}% APR
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Current Balance</p>
                      <p className="text-2xl font-bold">${debt.currentBalance.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Original Balance</p>
                      <p className="text-lg font-medium">${debt.originalBalance.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Minimum Payment</p>
                      <p className="text-lg font-medium">${debt.minimumPayment.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex justify-between mb-2">
                      <p className="text-sm font-medium">Payoff Progress</p>
                      <p className="text-sm font-medium">{progress.toFixed(1)}%</p>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">
                        Due in <span className="font-medium">{daysUntilDue}</span> days
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <Button size="sm" variant="outline">
                        Payment History
                      </Button>
                      <Button size="sm" className="bg-primary-gradient hover:opacity-90">
                        Make Payment
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {debts.length === 0 && (
          <div className="card-element p-12 text-center">
            <CircleDollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No Debts Added Yet</h3>
            <p className="text-gray-500 mb-6">
              Start tracking your debts to take advantage of MicroRepay's smart payment allocation.
            </p>
            <Button className="bg-primary-gradient hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Debt
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Debts;
