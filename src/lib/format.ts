export function formatPrice(amount: number) {
  return `€${amount.toFixed(2)}`;
}

export function formatData(gb: number | "unlimited") {
  if (gb === "unlimited") return "Unlimited";
  return gb < 1 ? `${Math.round(gb * 1000)}MB` : `${gb}GB`;
}

export function formatValidity(days: number) {
  return `${days} ${days === 1 ? "Day" : "Days"}`;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
