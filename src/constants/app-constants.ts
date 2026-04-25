import { useEffect } from "react";

export const APP_NAME = "Nuvex";
export const APP_TAGLINE = "Smart finance, simplified.";

export const THEMES = {
  DARK: "dark",
  LIGHT: "light",
  SYSTEM: "system",
} as const;

export type ThemeType = (typeof THEMES)[keyof typeof THEMES];

export const CURRENCIES = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
] as const;

export const EXPENSE_CATEGORIES = [
  { id: "food", label: "Food", icon: "bx-bowl-rice" },
  { id: "vegetables", label: "Vegetables & Fruits", icon: "bx-leaf" },
  { id: "haircut", label: "Haircut", icon: "bx-cut" },
  { id: "orders", label: "Orders", icon: "bx-package" },
  { id: "gym", label: "Gym", icon: "bx-dumbbell" },
  { id: "fun", label: "Fun", icon: "bx-party" },
  { id: "ott", label: "OTT & Subscription", icon: "bx-tv" },
  { id: "travel", label: "Travel", icon: "bx-trip" },
  { id: "recharge", label: "Recharge", icon: "bx-mobile" },
  { id: "medical", label: "Medical", icon: "bx-plus-medical" },
  { id: "shopping", label: "Shopping", icon: "bx-shopping-bag" },
  { id: "bills", label: "Bills", icon: "bx-receipt" },
  { id: "fuel", label: "Fuel", icon: "bx-gas-pump" },
  { id: "study", label: "Study", icon: "bx-book" },
  { id: "lend", label: "Lend", icon: "bx-hand" },
  { id: "rent", label: "Rent", icon: "bx-home" },
  { id: "emi", label: "EMI", icon: "bx-credit-card" },
  { id: "gifts", label: "Gifts", icon: "bx-gift" },
  { id: "family", label: "Family", icon: "bx-group" },
  { id: "pets", label: "Pets", icon: "bx-dog" },
  { id: "maintenance", label: "Maintenance", icon: "bx-wrench" },
  { id: "insurance", label: "Insurance", icon: "bx-shield" },
  { id: "charity", label: "Charity", icon: "bx-heart" },
  { id: "personal_care", label: "Personal Care", icon: "bx-spa" },
  { id: "electronics", label: "Electronics", icon: "bx-chip" },
  { id: "others", label: "Others", icon: "bx-dots-horizontal-rounded" },
] as const;

export const INCOME_CATEGORIES = [
  { id: "salary", label: "Salary", icon: "bx-wallet" },
  { id: "freelance", label: "Freelance", icon: "bx-laptop" },
  { id: "business", label: "Business", icon: "bx-briefcase" },
  { id: "refund", label: "Refund", icon: "bx-undo" },
  { id: "gift_received", label: "Gift Received", icon: "bx-gift" },
  { id: "interest", label: "Interest", icon: "bx-line-chart" },
  { id: "dividend", label: "Dividend", icon: "bx-trending-up" },
  { id: "rental_income", label: "Rental Income", icon: "bx-building-house" },
  { id: "bonus", label: "Bonus", icon: "bx-star" },
  { id: "other", label: "Other Income", icon: "bx-dots-horizontal-rounded" },
] as const;

export const FUND_CATEGORIES = [
  "Large Cap",
  "Mid Cap",
  "Small Cap",
  "Flexi Cap",
  "ELSS",
  "Debt",
  "Hybrid",
  "Index Fund",
  "Sectoral",
  "International",
] as const;

export const METAL_TYPES = {
  GOLD: "gold",
  SILVER: "silver",
} as const;

export const SORT_OPTIONS = [
  { value: "desc", label: "Latest First" },
  { value: "asc", label: "Oldest First" },
  { value: "amount_high", label: "Amount: High to Low" },
  { value: "amount_low", label: "Amount: Low to High" },
] as const;

export const HEALTH_STATUSES = {
  GREAT: { label: "Great Control", color: "success" },
  STABLE: { label: "Stable", color: "primary" },
  WARNING: { label: "Overspending", color: "warning" },
  CRITICAL: { label: "Critical", color: "destructive" },
} as const;

export const CHART_PERIODS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
] as const;

export const DB_KEY = "nuvex_db";
