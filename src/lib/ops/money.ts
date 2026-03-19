export function formatOpsMoneyDisplay(amountCents: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(amountCents / 100);
}
