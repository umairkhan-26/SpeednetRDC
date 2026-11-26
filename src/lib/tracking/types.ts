/** What a checkout or purchase event says about the order. No personal data. */
export interface TrackedItem {
  contentId: string;
  contentName?: string;
  value: number;
  currency: string;
}

export interface TrackedPurchase extends TrackedItem {
  /** The order number ("ORD-12"): lets each tool count an order only once. */
  transactionId: string;
}
