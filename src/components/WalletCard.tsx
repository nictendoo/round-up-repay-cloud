
import { Progress } from "@/components/ui/progress";
import { RoundUpWallet } from "@/types";

interface WalletCardProps {
  wallet: RoundUpWallet;
}

const WalletCard = ({ wallet }: WalletCardProps) => {
  const progress = (wallet.balance / wallet.transferThreshold) * 100;

  return (
    <div className="card-element p-6">
      <h3 className="text-lg font-semibold mb-1">Round-Up Wallet</h3>
      <p className="text-sm text-gray-500 mb-4">
        Accumulating round-ups until threshold
      </p>
      
      <div className="flex items-end justify-between mb-2">
        <div>
          <p className="text-sm text-gray-500">Current Balance</p>
          <p className="text-3xl font-bold text-navy">${wallet.balance.toFixed(2)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Transfer Threshold</p>
          <p className="text-lg font-medium">${wallet.transferThreshold.toFixed(2)}</p>
        </div>
      </div>
      
      <Progress value={progress} className="h-2 mb-2" />
      
      <p className="text-sm text-gray-500">
        {progress < 100
          ? `$${(wallet.transferThreshold - wallet.balance).toFixed(2)} more until transfer`
          : "Ready for transfer!"}
      </p>
      
      {wallet.lastTransferredAt && (
        <p className="text-xs text-gray-400 mt-4">
          Last transfer: {new Date(wallet.lastTransferredAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
};

export default WalletCard;
