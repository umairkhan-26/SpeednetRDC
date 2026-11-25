export async function register() {
  // Node 17+ defaults DNS lookups to verbatim order, which on some hosts
  // resolves "localhost" to ::1 (IPv6) first. Force IPv4 first so a
  // DB_HOST of "localhost" behaves the traditional way. Only meaningful
  // in the Node.js runtime — dns is unavailable in the Edge runtime.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { setDefaultResultOrder } = await import("node:dns");
    setDefaultResultOrder("ipv4first");

    // Privacy: old SIM card delivery addresses are deleted on a timer. Only
    // scheduled here, so the server doesn't wait for the database to start.
    const { scheduleShippingAddressCleanup } = await import("@/lib/checkout/shipping-retention");
    scheduleShippingAddressCleanup();
  }
}
