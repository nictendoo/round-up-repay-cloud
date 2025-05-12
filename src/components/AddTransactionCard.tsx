
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateRoundUp } from "@/utils/calculateRoundUp";
import { addMockTransaction } from "@/services/mockData";
import { useToast } from "@/components/ui/use-toast";

interface AddTransactionCardProps {
  onTransactionAdded: () => void;
}

const AddTransactionCard = ({ onTransactionAdded }: AddTransactionCardProps) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [roundUpPreview, setRoundUpPreview] = useState<number | null>(null);

  const updateRoundUpPreview = (value: string) => {
    if (value && !isNaN(parseFloat(value))) {
      try {
        const roundUp = calculateRoundUp(parseFloat(value));
        setRoundUpPreview(roundUp);
      } catch (error) {
        setRoundUpPreview(null);
      }
    } else {
      setRoundUpPreview(null);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    updateRoundUpPreview(value);
  };

  const handleSubmit = () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid transaction amount",
        variant: "destructive",
      });
      return;
    }

    if (!merchant.trim()) {
      toast({
        title: "Merchant name required",
        description: "Please enter a merchant name",
        variant: "destructive",
      });
      return;
    }

    // Add the transaction to our mock data
    const transaction = addMockTransaction(
      parseFloat(amount),
      merchant,
      "Shopping" // Default category
    );

    // Reset the form
    setAmount("");
    setMerchant("");
    setRoundUpPreview(null);

    // Notify parent component
    onTransactionAdded();

    // Show success toast
    toast({
      title: "Transaction added!",
      description: `$${transaction.roundUpAmount.toFixed(2)} was added to your round-up wallet.`,
      variant: "default",
    });
  };

  return (
    <div className="card-element p-6">
      <div className="flex items-center mb-4">
        <h3 className="text-lg font-semibold">Add Transaction</h3>
        <Plus className="h-5 w-5 text-purple ml-2" />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Transaction Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={amount}
            onChange={handleAmountChange}
          />
          {roundUpPreview !== null && (
            <p className="text-xs text-skyblue">
              Round-up amount: ${roundUpPreview.toFixed(2)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="merchant">Merchant</Label>
          <Input
            id="merchant"
            placeholder="Coffee Shop"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
          />
        </div>

        <Button
          className="w-full bg-primary-gradient hover:opacity-90 transition-opacity"
          onClick={handleSubmit}
        >
          Add Transaction
        </Button>
      </div>
    </div>
  );
};

export default AddTransactionCard;
