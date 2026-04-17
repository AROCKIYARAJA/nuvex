import { CURRENCIES } from "@/constants/app-constants";
import { NUM } from "@/constants/num-constants";

export function formatCurrency(amount: number, currencyCode = "INR"): string {
  const currency = CURRENCIES.find((c) => c.code === currencyCode);
  const symbol = currency?.symbol ?? "₹";
  const formatted = Math.abs(amount).toLocaleString("en-IN", {
    minimumFractionDigits: NUM.DECIMAL_PLACES,
    maximumFractionDigits: NUM.DECIMAL_PLACES,
  });
  return amount < 0 ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
}

export function formatCompact(amount: number): string {
  if (Math.abs(amount) >= 10000000) return `${(amount / 10000000).toFixed(1)}Cr`;
  if (Math.abs(amount) >= 100000) return `${(amount / 100000).toFixed(1)}L`;
  if (Math.abs(amount) >= 1000) return `${(amount / 1000).toFixed(1)}K`;
  return amount.toFixed(NUM.DECIMAL_PLACES);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatRelativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

export function getGrowthPercent(invested: number, current: number): number {
  if (invested === 0) return 0;
  return Number((((current - invested) / invested) * 100).toFixed(NUM.DECIMAL_PLACES));
}

export function getCategoryLabel(categories: readonly { id: string; label: string }[], id: string): string {
  return categories.find((c) => c.id === id)?.label ?? id;
}

export function getCategoryIcon(categories: readonly { id: string; icon: string }[], id: string): string {
  return categories.find((c) => c.id === id)?.icon ?? "bx-category";
}
