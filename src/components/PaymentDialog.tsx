import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Debt } from "@/types";
import { MicroRepayService } from "@/core/MicroRepayService";

interface PaymentDialogProps {
  debt: Debt;
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: () => void;
}

const PaymentDialog = ({ debt, isOpen, onClose, onPaymentComplete }: PaymentDialogProps) => {
  const [amount, setAmount] = useState<string>(debt.minimumPayment.toString());
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value);
    }
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const microRepayService = new MicroRepayService();
      const result = await microRepayService.processRoundup(
        "user123", // TODO: Replace with actual user ID
        parseFloat(amount)
      );

      if (result.success) {
        toast({
          title: "Payment Successful",
          description: `Payment of $${amount} has been processed. Confirmation: ${result.transactionId}`,
        });
        onPaymentComplete();
        onClose();
      } else {
        throw new Error("Payment failed");
      }
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "An error occurred while processing your payment.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Make Payment</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <Input
              id="amount"
              type="text"
              value={amount}
              onChange={handleAmountChange}
              className="col-span-3"
              placeholder="0.00"
            />
          </div>
          <div className="text-sm text-gray-500">
            <p>Minimum Payment: ${debt.minimumPayment.toFixed(2)}</p>
            <p>Current Balance: ${debt.currentBalance.toFixed(2)}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isProcessing}
            className="bg-primary-gradient hover:opacity-90"
          >
            {isProcessing ? "Processing..." : "Make Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog; 