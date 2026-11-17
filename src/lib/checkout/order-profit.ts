import type { CheckoutOrder } from "./orders-repository";

/**
 * One order's revenue, cost and profit, on the same rules as the dashboard:
 * revenue is what the customer paid (incl. the 5% taxes & fees line, or the
 * card + shipping for a SIM card) once paid and not refunded.
 *
 * Costs only count once they were really incurred:
 *  - the Transatel plan, once it is on the SIM (eSIM delivered / included plan added);
 *  - for a SIM card, also the blank card and the postage, once it is shipped.
 * A cost we can't know (no SIM_CARD_COST_EUR, no postage typed, plan missing
 * from the grid) is flagged as unknown, never invented.
 */
export interface OrderProfit {
  revenue: number | null;
  /** Sum of the known costs so far; null when none has been incurred yet. */
  cost: number | null;
  /** Some cost that should already count is unknown (see the module comment). */
  costUnknown: boolean;
  /** The parts of a SIM card's cost (null = not incurred or unknown). */
  parts: { plan: number | null; card: number | null; postage: number | null } | null;
  profit: number | null;
  profitAfterStripeFee: number | null;
}

const round = (n: number) => Math.round(n * 100) / 100;

type ProfitInput = Pick<CheckoutOrder, "status" | "provisioningStatus" | "amountEur" | "planCostEur" | "stripeFeeEur"> &
  Partial<Pick<CheckoutOrder, "productType" | "shippingStatus" | "shippingCostEur">>;

/** @param cardCostEur what one blank SIM card costs us (SIM_CARD_COST_EUR), null when unknown. */
export function orderProfit(order: ProfitInput, cardCostEur: number | null = null): OrderProfit {
  if (order.status !== "completed") return { revenue: null, cost: null, costUnknown: false, parts: null, profit: null, profitAfterStripeFee: null };
  const planOnSim = order.provisioningStatus === "provisioned";

  let cost: number | null;
  let costUnknown: boolean;
  let parts: OrderProfit["parts"] = null;
  if (order.productType === "physical_sim") {
    const shipped = order.shippingStatus === "shipped" || order.shippingStatus === "delivered";
    const plan = planOnSim ? order.planCostEur : null;
    const card = shipped ? cardCostEur : null;
    const postage = shipped ? (order.shippingCostEur ?? null) : null;
    parts = { plan, card, postage };
    cost = planOnSim || shipped ? round((plan ?? 0) + (card ?? 0) + (postage ?? 0)) : null;
    costUnknown = (planOnSim && plan === null) || (shipped && (card === null || postage === null));
  } else {
    cost = planOnSim ? order.planCostEur : null;
    costUnknown = planOnSim && order.planCostEur === null;
  }

  const profit = round(order.amountEur - (cost ?? 0));
  return {
    revenue: order.amountEur,
    cost,
    costUnknown,
    parts,
    profit,
    profitAfterStripeFee: order.stripeFeeEur === null ? null : round(profit - order.stripeFeeEur),
  };
}
