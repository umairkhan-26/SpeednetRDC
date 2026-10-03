import type { CheckoutOrder } from "./orders-repository";

/**
 * One order's revenue, cost and profit, on the same rules as the dashboard:
 * revenue is what the customer paid (incl. the 5% taxes & fees line) once
 * paid and not refunded; cost counts only once the eSIM was delivered.
 */
export interface OrderProfit {
  revenue: number | null;
  /** null: no cost yet (not delivered) or unknown (plan missing from the grid, see costUnknown). */
  cost: number | null;
  costUnknown: boolean;
  profit: number | null;
  profitAfterStripeFee: number | null;
}

const round = (n: number) => Math.round(n * 100) / 100;

export function orderProfit(order: Pick<CheckoutOrder, "status" | "provisioningStatus" | "amountEur" | "planCostEur" | "stripeFeeEur">): OrderProfit {
  if (order.status !== "completed") return { revenue: null, cost: null, costUnknown: false, profit: null, profitAfterStripeFee: null };
  const delivered = order.provisioningStatus === "provisioned";
  const cost = delivered ? order.planCostEur : null;
  const profit = round(order.amountEur - (cost ?? 0));
  return {
    revenue: order.amountEur,
    cost,
    costUnknown: delivered && order.planCostEur === null,
    profit,
    profitAfterStripeFee: order.stripeFeeEur === null ? null : round(profit - order.stripeFeeEur),
  };
}
