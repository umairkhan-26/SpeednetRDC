import { mockOrders } from "@/data/orders";
import { simulateLatency } from "./client";

export async function fetchOrders() {
  return simulateLatency(mockOrders);
}
