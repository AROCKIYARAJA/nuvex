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
  units: number;
  percentage: number;
  investedAmount: number;
  returns: number;
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

export interface PFEntry {
  id: string;
  name: string;
  amount: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface NetworthEntry {
  id: string;
  date: string;
  metals: {
    gold: { grams: number; percentage: number; invested: number; returns: number; totalAmount: number };
    silver: { grams: number; percentage: number; invested: number; returns: number; totalAmount: number };
  };
  funds: Array<{
    fundId: string;
    name: string;
    units: number;
    percentage: number;
    invested: number;
    returns: number;
    totalAmount: number;
  }>;
  bankLiquidity: number;
  pfAmount: number;
  networth: number;
  growth: number;
  createdAt: string;
}

export interface TopSpendingItem {
  category: string;
  amount: number;
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
  return (payload?.data ?? payload) as T;
}

function normalize<T extends { _id?: string; id?: string }>(doc: T): T {
  if (doc && doc._id && !doc.id) {
    return { ...doc, id: doc._id } as T;
  }
  return doc;
}
function normalizeList<T extends { _id?: string; id?: string }>(list: T[]): T[] {
  return Array.isArray(list) ? list.map(normalize) : [];
}

// ============= User Profile =============
export async function getProfile(): Promise<UserProfile> {
  return normalize(await request<UserProfile>("/profile"));
}

export async function updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  return normalize(await request<UserProfile>("/profile", { method: "PUT", body: JSON.stringify(data) }));
}

// ============= Settings =============
export async function getSettings(): Promise<AppSettings> {
  return await request<AppSettings>("/settings");
}

export async function updateSettings(data: Partial<AppSettings>): Promise<AppSettings> {
  return await request<AppSettings>("/settings", { method: "PUT", body: JSON.stringify(data) });
}

// ============= Expenses =============
export async function getExpenses(): Promise<Expense[]> {
  return normalizeList(await request<Expense[]>("/expenses"));
}

export async function addExpense(data: Omit<Expense, "id" | "createdAt" | "updatedAt">): Promise<Expense> {
  return normalize(await request<Expense>("/expenses", { method: "POST", body: JSON.stringify(data) }));
}

export async function deleteExpense(id: string): Promise<void> {
  await request<void>(`/expenses/${id}`, { method: "DELETE" });
}

// ============= Incomes =============
export async function getIncomes(): Promise<Income[]> {
  return normalizeList(await request<Income[]>("/incomes"));
}

export async function addIncome(data: Omit<Income, "id" | "createdAt" | "updatedAt">): Promise<Income> {
  return normalize(await request<Income>("/incomes", { method: "POST", body: JSON.stringify(data) }));
}

export async function deleteIncome(id: string): Promise<void> {
  await request<void>(`/incomes/${id}`, { method: "DELETE" });
}

// ============= Metals (Bullion Vault) =============
export async function getMetals(): Promise<MetalEntry[]> {
  return normalizeList(await request<MetalEntry[]>("/metals"));
}

export async function addMetal(data: Omit<MetalEntry, "id" | "createdAt" | "updatedAt">): Promise<MetalEntry> {
  return normalize(await request<MetalEntry>("/metals", { method: "POST", body: JSON.stringify(data) }));
}

export async function deleteMetal(id: string): Promise<void> {
  await request<void>(`/metals/${id}`, { method: "DELETE" });
}

// ============= Asset Withdraw =============
export async function withdrawAsset(data: {
  name: string; quantity: number; pricePerGram: number;
  totalPrice: number; assetType: "gold" | "silver"; notes?: string;
}): Promise<AssetWithdrawal> {
  return normalize(await request<AssetWithdrawal>("/metals/withdraw", { method: "POST", body: JSON.stringify(data) }));
}

export async function getAssetWithdrawals(): Promise<AssetWithdrawal[]> {
  return normalizeList(await request<AssetWithdrawal[]>("/metals/withdrawals"));
}

// ============= Update Metal Assets =============
export async function updateMetalAssets(data: {
  assetType: "gold" | "silver";
  pricePerGram: number;
}): Promise<any> {
  return await request<any>("/metals/update-price", { method: "PUT", body: JSON.stringify(data) });
}

// ============= Mutual Funds =============
export async function getMutualFunds(): Promise<MutualFund[]> {
  return normalizeList(await request<MutualFund[]>("/mutual-funds"));
}

export async function addMutualFund(data: Omit<MutualFund, "id" | "createdAt" | "updatedAt">): Promise<MutualFund> {
  return normalize(await request<MutualFund>("/mutual-funds", { method: "POST", body: JSON.stringify(data) }));
}

export async function updateMutualFund(id: string, data: Partial<MutualFund>): Promise<MutualFund> {
  return normalize(await request<MutualFund>(`/mutual-funds/${id}`, { method: "PUT", body: JSON.stringify(data) }));
}

export async function deleteMutualFund(id: string): Promise<void> {
  await request<void>(`/mutual-funds/${id}`, { method: "DELETE" });
}

// ============= PF (Provident Fund) =============
export async function getPFEntries(): Promise<PFEntry[]> {
  return normalizeList(await request<PFEntry[]>("/pf"));
}

export async function addPFEntry(data: { name: string; amount: number; notes: string }): Promise<PFEntry> {
  return normalize(await request<PFEntry>("/pf", { method: "POST", body: JSON.stringify(data) }));
}

export async function getPFTotal(): Promise<{ totalAmount: number }> {
  return await request<{ totalAmount: number }>("/pf/total");
}

// ============= Aggregations =============
export async function getCashflowSummary() {
  return await request<{
    totalIncome: number; totalExpenses: number; netFlow: number;
    balance: number; expenseCount: number; incomeCount: number;
  }>("/dashboard/cashflow");
}

export async function getTopSpending(limit = 3): Promise<TopSpendingItem[]> {
  const data = await request<TopSpendingItem[]>(`/dashboard/top-spending?limit=${limit}`);
  return Array.isArray(data) ? data : [];
}

export async function getRecentTransactions(limit = 5): Promise<RecentTransaction[]> {
  const data = await request<any[]>(`/dashboard/recent-transactions?limit=${limit}`);
  return (Array.isArray(data) ? data : []).map((tx) => ({ ...tx, id: tx.id || tx._id }));
}

export async function getInvestmentSummary() {
  return await request<{
    totalInvested: number; totalValue: number; estimatedReturns: number;
    metalValue: number; fundsInvested: number; fundsValue: number;
    metalCount: number; fundCount: number;
  }>("/dashboard/investments");
}

// ============= Networth =============
export async function getNetworthEntries(): Promise<NetworthEntry[]> {
  return normalizeList(await request<NetworthEntry[]>("/networth"));
}

export async function addNetworthEntry(data: Omit<NetworthEntry, "id" | "createdAt">): Promise<NetworthEntry> {
  return normalize(await request<NetworthEntry>("/networth", { method: "POST", body: JSON.stringify(data) }));
}

export async function getNetworthSnapshot(): Promise<Omit<NetworthEntry, "id" | "createdAt">> {
  return await request<Omit<NetworthEntry, "id" | "createdAt">>("/networth/snapshot");
}

export async function deleteNetworthEntry(id: string): Promise<void> {
  await request<void>(`/networth/${id}`, { method: "DELETE" });
}

// ============= Dev Utility =============
export async function resetDB() {
  return await request<any>("/reset-all/delete-all");
}
