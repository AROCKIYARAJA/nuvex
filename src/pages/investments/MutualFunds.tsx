import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { StatCard } from "@/components/common/StatCard";
import { PageHeader } from "@/components/common/PageHeader";
import { Modal } from "@/components/common/Modal";
import { EmptyState } from "@/components/common/EmptyState";
import { SkeletonCard, SkeletonList } from "@/components/common/Skeletons";
import { getMutualFunds, updateMutualFund, deleteMutualFund, type MutualFund } from "@/services/service-api";
import { formatCurrency, getGrowthPercent, formatDate } from "@/utils/formatters";
import { SORT_OPTIONS } from "@/constants/app-constants";
import { NUM } from "@/constants/num-constants";
import { ROUTES } from "@/constants/route-constants";
import { cn } from "@/lib/utils";

export default function MutualFunds() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [funds, setFunds] = useState<MutualFund[]>([]);
  const [sort, setSort] = useState("desc");
  const [updateModal, setUpdateModal] = useState(false);
  const [selectedFund, setSelectedFund] = useState<MutualFund | null>(null);
  const [updateForm, setUpdateForm] = useState({ investedAmount: "", currentValue: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try { setFunds(await getMutualFunds()); }
    catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const sortedFunds = [...funds].sort((a, b) => {
    if (sort === "asc") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sort === "amount_high") return b.investedAmount - a.investedAmount;
    if (sort === "amount_low") return a.investedAmount - b.investedAmount;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const totalInvested = funds.reduce((s, f) => s + f.investedAmount, 0);
  const totalValue = funds.reduce((s, f) => s + f.currentValue, 0);
  const totalGrowth = getGrowthPercent(totalInvested, totalValue);

  const openUpdate = (fund: MutualFund) => {
    setSelectedFund(fund);
    setUpdateForm({ investedAmount: "", currentValue: "", notes: "" });
    setUpdateModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedFund) return;
    setSubmitting(true);
    try {
      const updates: Partial<MutualFund> = { lastUpdated: new Date().toISOString() };
      if (updateForm.investedAmount) updates.investedAmount = selectedFund.investedAmount + parseFloat(updateForm.investedAmount);
      if (updateForm.currentValue) updates.currentValue = parseFloat(updateForm.currentValue);
      if (updateForm.notes) updates.notes = updateForm.notes;
      await updateMutualFund(selectedFund.id, updates);
      toast.success("Fund updated!", { duration: NUM.TOAST_DURATION });
      setUpdateModal(false);
      loadData();
    } catch { toast.error("Failed to update"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this fund?")) return;
    try { await deleteMutualFund(id); toast.success("Fund deleted"); loadData(); }
    catch { toast.error("Failed to delete"); }
  };

  if (loading) return <div className="space-y-6"><PageHeader title="Mutual Funds" /><div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: NUM.SKELETON_COUNT }).map((_, i) => <SkeletonCard key={i} />)}</div><SkeletonList /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Mutual Funds" subtitle="Track your fund portfolio" action={
        <button onClick={() => navigate(ROUTES.INVESTMENTS_FUNDS_NEW)} className="gradient-primary text-primary-foreground text-sm font-medium px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5"><i className="bx bx-plus" /> New Fund</button>
      } />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Invested" value={formatCurrency(totalInvested)} icon="bx-coin-stack" variant="primary" />
        <StatCard title="Current Value" value={formatCurrency(totalValue)} icon="bx-line-chart" variant="success" />
        <StatCard title="Returns" value={formatCurrency(totalValue - totalInvested)} icon="bx-trending-up" variant={totalValue >= totalInvested ? "success" : "destructive"} trend={totalValue >= totalInvested ? "up" : "down"} trendValue={`${totalGrowth}%`} />
        <StatCard title="Active Funds" value={`${funds.length}`} icon="bx-bar-chart-alt-2" />
      </div>

      {/* Sort */}
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-foreground">Fund List</h3>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="text-sm bg-secondary text-secondary-foreground rounded-lg px-3 py-1.5 border border-border focus:outline-none focus:ring-1 focus:ring-ring">
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {sortedFunds.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedFunds.map((fund) => {
            const growth = getGrowthPercent(fund.investedAmount, fund.currentValue);
            return (
              <div key={fund.id} className="bg-card border border-border rounded-xl p-4 shadow-card hover:shadow-elevated transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">{fund.name}</h4>
                    <span className="text-xs text-muted-foreground">{fund.category}</span>
                  </div>
                  <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", growth >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
                    {growth >= 0 ? "+" : ""}{growth}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div><p className="text-xs text-muted-foreground">Invested</p><p className="text-sm font-semibold font-display text-foreground">{formatCurrency(fund.investedAmount)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Current</p><p className="text-sm font-semibold font-display text-foreground">{formatCurrency(fund.currentValue)}</p></div>
                </div>
                <p className="text-xs text-muted-foreground mb-3">SIP: {formatCurrency(fund.sipAmount)}/mo · Updated {formatDate(fund.lastUpdated)}</p>
                <div className="flex gap-2">
                  <button onClick={() => openUpdate(fund)} className="flex-1 text-xs font-medium py-2 rounded-lg bg-accent text-accent-foreground hover:bg-primary/20 transition-colors">Update</button>
                  <button onClick={() => handleDelete(fund.id)} className="text-xs font-medium py-2 px-3 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState icon="bx-bar-chart-alt-2" title="No funds yet" description="Add your first mutual fund" action={
          <button onClick={() => navigate(ROUTES.INVESTMENTS_FUNDS_NEW)} className="gradient-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg">Add Fund</button>
        } />
      )}

      {/* Update Modal */}
      <Modal open={updateModal} onClose={() => setUpdateModal(false)} title={`Update: ${selectedFund?.name || ""}`}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Additional Investment (₹)</label>
            <input type="number" value={updateForm.investedAmount} onChange={(e) => setUpdateForm({ ...updateForm, investedAmount: e.target.value })} placeholder="0.00"
              className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Latest Valuation (₹)</label>
            <input type="number" value={updateForm.currentValue} onChange={(e) => setUpdateForm({ ...updateForm, currentValue: e.target.value })} placeholder={selectedFund?.currentValue?.toString()}
              className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Note</label>
            <textarea value={updateForm.notes} onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })} placeholder="Optional" rows={2}
              className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>
          <button onClick={handleUpdate} disabled={submitting} className="w-full gradient-primary text-primary-foreground font-medium py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? <><i className="bx bx-loader-alt bx-spin" /> Updating...</> : <><i className="bx bx-check" /> Update Fund</>}
          </button>
        </div>
      </Modal>
    </div>
  );
}
