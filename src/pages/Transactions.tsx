
import { useState } from "react";
import { CreditCard, Filter, ArrowDown, ArrowUp } from "lucide-react";
import Layout from "@/components/Layout";
import { getMockTransactions } from "@/services/mockData";
import { Transaction } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(getMockTransactions());
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Filter transactions based on search term
  const filteredTransactions = transactions.filter(transaction => 
    transaction.merchantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort transactions based on sort order
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });
  
  // Calculate total round-up amount
  const totalRoundUp = transactions.reduce(
    (sum, transaction) => sum + transaction.roundUpAmount,
    0
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold mb-4 md:mb-0">Transactions</h1>
          
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative">
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full md:w-64"
              />
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
              className="md:ml-2"
            >
              {sortOrder === "desc" ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="col-span-1 card-element p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Transactions</h3>
            <p className="text-2xl font-bold">{transactions.length}</p>
          </div>
          <div className="col-span-1 card-element p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Round-up Amount</h3>
            <p className="text-2xl font-bold text-skyblue">${totalRoundUp.toFixed(2)}</p>
          </div>
          <div className="col-span-1 card-element p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Time Period</h3>
            <Select defaultValue="last30">
              <SelectTrigger>
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last7">Last 7 days</SelectItem>
                <SelectItem value="last30">Last 30 days</SelectItem>
                <SelectItem value="last90">Last 90 days</SelectItem>
                <SelectItem value="year">This year</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="card-element overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left p-4 font-medium text-gray-500">Merchant</th>
                  <th className="text-left p-4 font-medium text-gray-500">Date</th>
                  <th className="text-left p-4 font-medium text-gray-500">Category</th>
                  <th className="text-right p-4 font-medium text-gray-500">Amount</th>
                  <th className="text-right p-4 font-medium text-gray-500">Round-up</th>
                  <th className="text-center p-4 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                          <span className="text-xs">{transaction.merchantName.substring(0, 2)}</span>
                        </div>
                        <span className="font-medium">{transaction.merchantName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-gray-600">{transaction.category}</td>
                    <td className="p-4 text-right font-medium">
                      ${transaction.amount.toFixed(2)}
                    </td>
                    <td className="p-4 text-right font-medium text-skyblue">
                      ${transaction.roundUpAmount.toFixed(2)}
                    </td>
                    <td className="p-4 text-center">
                      {transaction.transferredToWallet ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Transferred
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {sortedTransactions.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-gray-500">No transactions found</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Transactions;
