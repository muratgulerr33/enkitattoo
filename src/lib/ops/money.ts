export function formatOpsMoneyDisplay(amountCents: number): string {
  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(amountCents / 100);

  return `${formatted} TL`;
}
