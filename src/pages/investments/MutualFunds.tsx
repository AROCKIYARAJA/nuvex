import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { StatCard } from "@/components/common/StatCard";
import { PageHeader } from "@/components/common/PageHeader";
import { Modal } from "@/components/common/Modal";
import { EmptyState } from "@/components/common/EmptyState";
import { SkeletonCard, SkeletonList } from "@/components/common/Skeletons";
import { getMutualFunds, addMutualFund, updateMutualFund, deleteMutualFund, type MutualFund } from "@/services/service-api";
import { formatCurrency, getGrowthPercent } from "@/utils/formatters";
import { NUM } from "@/constants/num-constants";
import { cn } from "@/lib/utils";

type FundForm = {
  name: string; units: string; percentage: string; invested: string; returns: string; total: string; notes: string;
};
type FundErrors = Partial<Record<keyof FundForm, string>>;

const EMPTY_FORM: FundForm = { name: "", units: "", percentage: "", invested: "", returns: "", total: "", notes: "" };

export default function MutualFunds() {
  const [loading, setLoading] = useState(true);
  const [funds, setFunds] = useState<MutualFund[]>([]);

  // Add modal
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<FundForm>(EMPTY_FORM);
  const [addErrors, setAddErrors] = useState<FundErrors>({});
  const [addSubmitting, setAddSubmitting] = useState(false);

  // Update modal
  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState<FundForm>(EMPTY_FORM);
  const [updateErrors, setUpdateErrors] = useState<FundErrors>({});
  const [updateSubmitting, setUpdateSubmitting] = useState(false);
  const [selectedFund, setSelectedFund] = useState<MutualFund | null>(null);

  // Delete confirm
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteFund, setDeleteFund] = useState<MutualFund | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try { setFunds(await getMutualFunds()); }
    catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const totalInvested = funds.reduce((s, f) => s + (f.investedAmount || 0), 0);
  const totalValue = funds.reduce((s, f) => s + (f.currentValue || 0), 0);
  const totalReturns = totalValue - totalInvested;
  const totalGrowth = getGrowthPercent(totalInvested, totalValue);

  // Validate form
  const validateForm = (form: FundForm, isUpdate = false): FundErrors => {
    const errs: FundErrors = {};
    if (!isUpdate && !form.name.trim()) errs.name = "Fund name is required";
    if (!form.units || isNaN(parseFloat(form.units)) || parseFloat(form.units) <= 0) errs.units = "Enter valid units";
    if (!form.percentage || isNaN(parseFloat(form.percentage))) errs.percentage = "Enter valid percentage";
    if (!form.invested || isNaN(parseFloat(form.invested)) || parseFloat(form.invested) < 0) errs.invested = "Enter valid invested amount";
    if (!form.returns || isNaN(parseFloat(form.returns))) errs.returns = "Enter valid returns";
    if (!form.total || isNaN(parseFloat(form.total)) || parseFloat(form.total) < 0) errs.total = "Enter valid total";
    return errs;
  };

  // Auto-calculate returns & total in update form
  const handleUpdateFormChange = (field: keyof FundForm, value: string) => {
    const next = { ...updateForm, [field]: value };
    // Auto-calc returns from invested + percentage
    if (field === "invested" || field === "percentage") {
      const inv = parseFloat(field === "invested" ? value : next.invested) || 0;
      const pct = parseFloat(field === "percentage" ? value : next.percentage) || 0;
      const ret = (inv * pct) / 100;
      next.returns = ret.toFixed(NUM.DECIMAL_PLACES);
      next.total = (inv + ret).toFixed(NUM.DECIMAL_PLACES);
    }
    if (field === "returns") {
      const inv = parseFloat(next.invested) || 0;
      next.total = (inv + (parseFloat(value) || 0)).toFixed(NUM.DECIMAL_PLACES);
    }
    setUpdateForm(next);
  };

  // Add fund
  const handleAdd = async () => {
    const errs = validateForm(addForm);
    setAddErrors(errs);
    if (Object.keys(errs).length > 0) { toast.error("Please fix the highlighted fields"); return; }
    setAddSubmitting(true);
    try {
      await addMutualFund({
        name: addForm.name.trim(),
        sipAmount: 0,
        units: parseFloat(addForm.units),
        percentage: parseFloat(addForm.percentage),
        investedAmount: parseFloat(addForm.invested),
        returns: parseFloat(addForm.returns),
        currentValue: parseFloat(addForm.total),
        category: "General",
        notes: addForm.notes.trim(),
        lastUpdated: new Date().toISOString(),
      });
      toast.success("Fund added!", { duration: NUM.TOAST_DURATION });
      setAddOpen(false);
      setAddForm(EMPTY_FORM);
      setAddErrors({});
      loadData();
    } catch { toast.error("Failed to add fund"); }
    finally { setAddSubmitting(false); }
  };

  // Open update
  const openUpdate = (fund: MutualFund) => {
    setSelectedFund(fund);
    setUpdateForm({
      name: fund.name,
      units: String(fund.units || 0),
      percentage: String(fund.percentage || 0),
      invested: String(fund.investedAmount || 0),
      returns: String(fund.returns || 0),
      total: String(fund.currentValue || 0),
      notes: fund.notes || "",
    });
    setUpdateErrors({});
    setUpdateOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedFund) return;
    const errs = validateForm(updateForm, true);
    setUpdateErrors(errs);
    if (Object.keys(errs).length > 0) { toast.error("Please fix the highlighted fields"); return; }
    setUpdateSubmitting(true);
    try {
      await updateMutualFund(selectedFund.id, {
        units: parseFloat(updateForm.units),
        percentage: parseFloat(updateForm.percentage),
        investedAmount: parseFloat(updateForm.invested),
        returns: parseFloat(updateForm.returns),
        currentValue: parseFloat(updateForm.total),
        notes: updateForm.notes.trim(),
        lastUpdated: new Date().toISOString(),
      });
      toast.success("Fund updated!", { duration: NUM.TOAST_DURATION });
      setUpdateOpen(false);
      loadData();
    } catch { toast.error("Failed to update"); }
    finally { setUpdateSubmitting(false); }
  };

  // Delete
  const openDelete = (fund: MutualFund) => { setDeleteFund(fund); setDeleteOpen(true); };
  const handleDelete = async () => {
    if (!deleteFund) return;
    setDeleting(true);
    try {
      await deleteMutualFund(deleteFund.id);
      toast.success("Fund deleted");
      setDeleteOpen(false);
      loadData();
    } catch { toast.error("Failed to delete"); }
    finally { setDeleting(false); }
  };

  const inputBase = "w-full px-3 py-2.5 rounded-lg bg-secondary border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors";
  const inputCls = (hasError?: boolean) => cn(inputBase, hasError ? "border-destructive focus:ring-destructive" : "border-border");

  if (loading) return <div className="space-y-6"><PageHeader title="Mutual Funds" /><div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: NUM.SKELETON_COUNT }).map((_, i) => <SkeletonCard key={i} />)}</div><SkeletonList /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <PageHeader
        title="Mutual Funds"
        subtitle="Track your fund portfolio"
        action={
          <button onClick={() => { setAddForm(EMPTY_FORM); setAddErrors({}); setAddOpen(true); }}
            className="gradient-primary text-primary-foreground text-sm font-medium px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5">
            <i className="bx bx-plus-circle" /> New Fund
          </button>
        }
      />

      {/* Mini Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Current Portfolio Value" value={formatCurrency(totalValue)} icon="bx-line-chart" variant="success" />
        <StatCard title="Invested Value" value={formatCurrency(totalInvested)} icon="bx-coin-stack" variant="primary" />
        <StatCard title="Returns" value={formatCurrency(totalReturns)} icon="bx-trending-up" variant={totalReturns >= 0 ? "success" : "destructive"} trend={totalReturns >= 0 ? "up" : "down"} trendValue={`${totalGrowth}%`} />
        <StatCard title="Active Funds" value={`${funds.length}`} icon="bx-bar-chart-alt-2" />
      </div>

      {/* Fund Cards */}
      {funds.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {funds.map((fund) => {
            const returnAmt = (fund.currentValue || 0) - (fund.investedAmount || 0);
            const returnPct = getGrowthPercent(fund.investedAmount || 0, fund.currentValue || 0);
            return (
              <div key={fund.id} className="bg-card border border-border rounded-xl p-4 shadow-card hover:shadow-elevated transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-foreground text-sm">{fund.name}</h4>
                  <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", returnPct >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
                    {returnPct >= 0 ? "+" : ""}{returnPct}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div><p className="text-xs text-muted-foreground">Current Value</p><p className="text-sm font-semibold font-display text-foreground">{formatCurrency(fund.currentValue || 0)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Invested</p><p className="text-sm font-semibold font-display text-foreground">{formatCurrency(fund.investedAmount || 0)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Returns</p><p className={cn("text-sm font-semibold font-display", returnAmt >= 0 ? "text-success" : "text-destructive")}>{formatCurrency(returnAmt)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Units</p><p className="text-sm font-semibold font-display text-foreground">{fund.units || 0}</p></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openUpdate(fund)} className="flex-1 text-xs font-medium py-2 rounded-lg bg-accent text-accent-foreground hover:bg-primary/20 transition-colors flex items-center justify-center gap-1">
                    <i className="bx bx-edit-alt" /> Update
                  </button>
                  <button onClick={() => openDelete(fund)} className="text-xs font-medium py-2 px-3 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors flex items-center justify-center gap-1">
                    <i className="bx bx-trash" /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState icon="bx-bar-chart-alt-2" title="No funds yet" description="Add your first mutual fund"
          action={<button onClick={() => setAddOpen(true)} className="gradient-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg">Add Fund</button>} />
      )}

      {/* Add Fund Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Fund">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Fund Name *</label>
            <input type="text" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} placeholder="e.g. Axis Bluechip" className={inputCls(!!addErrors.name)} />
            {addErrors.name && <p className="mt-1 text-xs text-destructive">{addErrors.name}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Units *</label>
              <input type="number" value={addForm.units} onChange={(e) => setAddForm({ ...addForm, units: e.target.value })} placeholder="0" step="0.01" className={inputCls(!!addErrors.units)} />
              {addErrors.units && <p className="mt-1 text-xs text-destructive">{addErrors.units}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Percentage *</label>
              <input type="number" value={addForm.percentage} onChange={(e) => setAddForm({ ...addForm, percentage: e.target.value })} placeholder="0" step="0.01" className={inputCls(!!addErrors.percentage)} />
              {addErrors.percentage && <p className="mt-1 text-xs text-destructive">{addErrors.percentage}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Invested (₹) *</label>
              <input type="number" value={addForm.invested} onChange={(e) => setAddForm({ ...addForm, invested: e.target.value })} placeholder="0" step="0.01" className={inputCls(!!addErrors.invested)} />
              {addErrors.invested && <p className="mt-1 text-xs text-destructive">{addErrors.invested}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Returns (₹) *</label>
              <input type="number" value={addForm.returns} onChange={(e) => setAddForm({ ...addForm, returns: e.target.value })} placeholder="0" step="0.01" className={inputCls(!!addErrors.returns)} />
              {addErrors.returns && <p className="mt-1 text-xs text-destructive">{addErrors.returns}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Total (₹) *</label>
            <input type="number" value={addForm.total} onChange={(e) => setAddForm({ ...addForm, total: e.target.value })} placeholder="0" step="0.01" className={inputCls(!!addErrors.total)} />
            {addErrors.total && <p className="mt-1 text-xs text-destructive">{addErrors.total}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Notes</label>
            <textarea value={addForm.notes} onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })} placeholder="Optional" rows={2} className={cn(inputCls(), "resize-none")} />
          </div>
          <button onClick={handleAdd} disabled={addSubmitting}
            className="w-full gradient-primary text-primary-foreground font-medium py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
            {addSubmitting ? <><i className="bx bx-loader-alt bx-spin" /> Adding...</> : <><i className="bx bx-plus" /> Add Fund</>}
          </button>
        </div>
      </Modal>

      {/* Update Fund Modal */}
      <Modal open={updateOpen} onClose={() => setUpdateOpen(false)} title={`Update: ${selectedFund?.name || ""}`}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Units *</label>
              <input type="number" value={updateForm.units} onChange={(e) => handleUpdateFormChange("units", e.target.value)} placeholder="0" step="0.01" className={inputCls(!!updateErrors.units)} />
              {updateErrors.units && <p className="mt-1 text-xs text-destructive">{updateErrors.units}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Percentage *</label>
              <input type="number" value={updateForm.percentage} onChange={(e) => handleUpdateFormChange("percentage", e.target.value)} placeholder="0" step="0.01" className={inputCls(!!updateErrors.percentage)} />
              {updateErrors.percentage && <p className="mt-1 text-xs text-destructive">{updateErrors.percentage}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Invested (₹) *</label>
            <input type="number" value={updateForm.invested} onChange={(e) => handleUpdateFormChange("invested", e.target.value)} placeholder="0" step="0.01" className={inputCls(!!updateErrors.invested)} />
            {updateErrors.invested && <p className="mt-1 text-xs text-destructive">{updateErrors.invested}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Returns (₹) * <span className="text-xs text-muted-foreground">(auto-calculated from invested × percentage)</span></label>
            <input type="number" value={updateForm.returns} onChange={(e) => handleUpdateFormChange("returns", e.target.value)} placeholder="0" step="0.01" className={inputCls(!!updateErrors.returns)} />
            {updateErrors.returns && <p className="mt-1 text-xs text-destructive">{updateErrors.returns}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Total (₹) * <span className="text-xs text-muted-foreground">(auto-calculated: invested + returns)</span></label>
            <input type="number" value={updateForm.total} onChange={(e) => handleUpdateFormChange("total", e.target.value)} placeholder="0" step="0.01" className={inputCls(!!updateErrors.total)} />
            {updateErrors.total && <p className="mt-1 text-xs text-destructive">{updateErrors.total}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Notes</label>
            <textarea value={updateForm.notes} onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })} placeholder="Optional" rows={2} className={cn(inputCls(), "resize-none")} />
          </div>
          <button onClick={handleUpdate} disabled={updateSubmitting}
            className="w-full gradient-primary text-primary-foreground font-medium py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
            {updateSubmitting ? <><i className="bx bx-loader-alt bx-spin" /> Updating...</> : <><i className="bx bx-check" /> Update Fund</>}
          </button>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Fund">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <span className="font-semibold text-foreground">{deleteFund?.name}</span>? This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <button onClick={() => setDeleteOpen(false)} disabled={deleting} className="flex-1 bg-secondary text-secondary-foreground font-medium py-3 rounded-xl border border-border hover:bg-muted transition-colors disabled:opacity-50">Cancel</button>
            <button onClick={handleDelete} disabled={deleting} className="flex-1 bg-destructive text-destructive-foreground font-medium py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
              {deleting ? <><i className="bx bx-loader-alt bx-spin" /> Deleting...</> : <><i className="bx bx-trash" /> Delete</>}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}