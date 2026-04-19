import { API_BASE_URL } from "@/constants/app-constants";

// ============= Types =============
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Income {
  id: string;
  name: string;
  amount: number;
  category: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface MetalEntry {
  id: string;
  type: "gold" | "silver";
  quantity: number;
  buyingPrice: number;
  purchaseDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface MutualFund {
  id: string;
  name: string;
  sipAmount: number;
  investedAmount: number;
  currentValue: number;
  category: string;
  notes: string;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  currency: string;
  theme: string;
}

// ============= HTTP helper =============
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  let payload: any = null;
  try {
    payload = await res.json();
  } catch {
    /* no body */
  }

  if (!res.ok) {
    const message =
      payload?.message || payload?.error || `Request failed: ${res.status}`;
    throw new Error(message);
  }
  // Backend wraps responses as { success, data } — unwrap if present
  return (payload?.data ?? payload) as T;
}

// Normalize Mongo `_id` → `id`
function normalize<T extends { _id?: string; id?: string }>(doc: T): T {
  if (doc && doc._id && !doc.id) {
    return { ...doc, id: doc._id } as T;
  }
  return doc;
}
function normalizeList<T extends { _id?: string; id?: string }>(
  list: T[],
): T[] {
  return Array.isArray(list) ? list.map(normalize) : [];
}

// ============= User Profile =============
export async function getProfile(): Promise<UserProfile> {
  const data = await request<UserProfile>("/profile");
  return normalize(data);
}

export async function updateProfile(
  data: Partial<UserProfile>,
): Promise<UserProfile> {
  const updated = await request<UserProfile>("/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return normalize(updated);
}

// ============= Settings =============
export async function getSettings(): Promise<AppSettings> {
  return await request<AppSettings>("/settings");
}

export async function updateSettings(
  data: Partial<AppSettings>,
): Promise<AppSettings> {
  return await request<AppSettings>("/settings", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// ============= Expenses =============
export async function getExpenses(): Promise<Expense[]> {
  const data = await request<Expense[]>("/expenses");
  return normalizeList(data);
}

export async function addExpense(
  data: Omit<Expense, "id" | "createdAt" | "updatedAt">,
): Promise<Expense> {
  const created = await request<Expense>("/expenses", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return normalize(created);
}

export async function deleteExpense(id: string): Promise<void> {
  await request<void>(`/expenses/${id}`, { method: "DELETE" });
}

// ============= Incomes =============
export async function getIncomes(): Promise<Income[]> {
  const data = await request<Income[]>("/incomes");
  return normalizeList(data);
}

export async function addIncome(
  data: Omit<Income, "id" | "createdAt" | "updatedAt">,
): Promise<Income> {
  const created = await request<Income>("/incomes", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return normalize(created);
}

export async function deleteIncome(id: string): Promise<void> {
  await request<void>(`/incomes/${id}`, { method: "DELETE" });
}

// ============= Metals (Bullion Vault) =============
export async function getMetals(): Promise<MetalEntry[]> {
  const data = await request<MetalEntry[]>("/metals");
  return normalizeList(data);
}

export async function addMetal(
  data: Omit<MetalEntry, "id" | "createdAt" | "updatedAt">,
): Promise<MetalEntry> {
  const created = await request<MetalEntry>("/metals", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return normalize(created);
}

export async function deleteMetal(id: string): Promise<void> {
  await request<void>(`/metals/${id}`, { method: "DELETE" });
}

// ============= Asset Withdraw =============
export interface AssetWithdrawal {
  id: string;
  name: string;
  quantity: number;
  pricePerGram: number;
  totalPrice: number;
  assetType: "gold" | "silver";
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export async function withdrawAsset(data: {
  name: string;
  quantity: number;
  pricePerGram: number;
  totalPrice: number;
  assetType: "gold" | "silver";
  notes?: string;
}): Promise<AssetWithdrawal> {
  const created = await request<AssetWithdrawal>("/metals/withdraw", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return normalize(created);
}

export async function getAssetWithdrawals(): Promise<AssetWithdrawal[]> {
  const data = await request<AssetWithdrawal[]>("/metals/withdrawals");
  return normalizeList(data);
}

// ============= Mutual Funds =============
export async function getMutualFunds(): Promise<MutualFund[]> {
  const data = await request<MutualFund[]>("/mutual-funds");
  return normalizeList(data);
}

export async function addMutualFund(
  data: Omit<MutualFund, "id" | "createdAt" | "updatedAt">,
): Promise<MutualFund> {
  const created = await request<MutualFund>("/mutual-funds", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return normalize(created);
}

export async function updateMutualFund(
  id: string,
  data: Partial<MutualFund>,
): Promise<MutualFund> {
  const updated = await request<MutualFund>(`/mutual-funds/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return normalize(updated);
}

export async function deleteMutualFund(id: string): Promise<void> {
  await request<void>(`/mutual-funds/${id}`, { method: "DELETE" });
}

// ============= Aggregations =============
export async function getCashflowSummary() {
  return await request<{
    totalIncome: number;
    totalExpenses: number;
    netFlow: number;
    balance: number;
    expenseCount: number;
    incomeCount: number;
  }>("/dashboard/cashflow");
}

export interface TopSpendingItem {
  category: string;
  amount: number;
}

export async function getTopSpending(limit = 3): Promise<TopSpendingItem[]> {
  const data = await request<TopSpendingItem[]>(
    `/dashboard/top-spending?limit=${limit}`,
  );
  return Array.isArray(data) ? data : [];
}

export interface RecentTransaction {
  id: string;
  type: "income" | "expense";
  name: string;
  amount: number;
  category: string;
  notes?: string;
  createdAt: string;
}

export async function getRecentTransactions(
  limit = 5,
): Promise<RecentTransaction[]> {
  const data = await request<any[]>(
    `/dashboard/recent-transactions?limit=${limit}`,
  );
  return (Array.isArray(data) ? data : []).map((tx) => ({
    ...tx,
    id: tx.id || tx._id,
  }));
}

export async function getInvestmentSummary() {
  return await request<{
    totalInvested: number;
    totalValue: number;
    estimatedReturns: number;
    metalValue: number;
    fundsInvested: number;
    fundsValue: number;
    metalCount: number;
    fundCount: number;
  }>("/dashboard/investments");
}

// ============= Dev Utility =============
export async function resetDB() {
  return await request<any>("/reset-all/delete-all");
  // No-op on the client now — reset is handled by the backend seed script.
  // Run `npm run seed` in the backend to reset the database.
  // console.warn("resetDB is now a backend operation. Run `npm run seed` on the server.");
}
