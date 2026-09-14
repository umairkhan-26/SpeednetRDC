/**
 * Every function under lib/api mimics the shape of a real REST call
 * (async, awaitable, network-shaped errors) even though it currently reads
 * local mock data. Swapping in a real backend later means changing the
 * function bodies here — nothing in components/hooks needs to change.
 */
export function simulateLatency<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
