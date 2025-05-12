
/**
 * Calculates the rounded up amount from a transaction
 * @param transactionAmount The original transaction amount
 * @returns The rounded up amount
 */
export function calculateRoundUp(transactionAmount: number | string): number {
  // Validate input
  if (isNaN(parseFloat(transactionAmount.toString())) || parseFloat(transactionAmount.toString()) < 0) {
    throw new Error('INVALID_TRANSACTION_AMOUNT');
  }
  
  // Convert to number with 2 decimal places for financial precision
  const amount = parseFloat(parseFloat(transactionAmount.toString()).toFixed(2));
  const roundedAmount = Math.ceil(amount);
  let roundUpAmount = parseFloat((roundedAmount - amount).toFixed(2));
  
  // Handle exact dollar amounts
  if (roundUpAmount < 0.01) {
    roundUpAmount = 1.00;
  }
  
  return roundUpAmount;
}
