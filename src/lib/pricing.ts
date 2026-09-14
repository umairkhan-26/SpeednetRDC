const TAX_RATE = 0.05;

export interface OrderTotals {
  subtotal: number;
  taxesAndFees: number;
  total: number;
}

export function calculateOrderTotals(planPrice: number): OrderTotals {
  const taxesAndFees = Math.round(planPrice * TAX_RATE * 100) / 100;
  return {
    subtotal: planPrice,
    taxesAndFees,
    total: Math.round((planPrice + taxesAndFees) * 100) / 100,
  };
}
