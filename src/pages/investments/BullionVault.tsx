import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { StatCard } from "@/components/common/StatCard";
import { PageHeader } from "@/components/common/PageHeader";
import { Modal } from "@/components/common/Modal";
import { EmptyState } from "@/components/common/EmptyState";
import { SkeletonCard } from "@/components/common/Skeletons";
import { getMetals, addMetal, deleteMetal, type MetalEntry } from "@/services/service-api";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { METAL_TYPES } from "@/constants/app-constants";
import { NUM } from "@/constants/num-constants";
import { cn } from "@/lib/utils";

export default function BullionVault() {
  const [loading, setLoading] = useState(true);
  const [metals, setMetals] = useState<MetalEntry[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [metalType, setMetalType] = useState<"gold" | "silver">("gold");
  const [form, setForm] = useState({ quantity: "", buyingPrice: "", purchaseDate: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try { setMetals(await getMetals()); }
    catch { toast.error("Failed to load data"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const goldEntries = metals.filter((m) => m.type === "gold");
  const silverEntries = metals.filter((m) => m.type === "silver");
  const totalGoldQty = goldEntries.reduce((s, m) => s + m.quantity, 0);
  const totalGoldVal = goldEntries.reduce((s, m) => s + m.quantity * m.buyingPrice, 0);
  const totalSilverQty = silverEntries.reduce((s, m) => s + m.quantity, 0);
  const totalSilverVal = silverEntries.reduce((s, m) => s + m.quantity * m.buyingPrice, 0);

  const openModal = (type: "gold" | "silver") => {
    setMetalType(type);
    setForm({ quantity: "", buyingPrice: "", purchaseDate: "", notes: "" });
    setModalOpen(true);
  };

  const handleAdd = async () => {
    const qty = parseFloat(form.quantity);
    const price = parseFloat(form.buyingPrice);
    if (!qty || qty < NUM.MIN_AMOUNT) { toast.error("Enter valid quantity"); return; }
    if (!price || price < NUM.MIN_AMOUNT) { toast.error("Enter valid price"); return; }
    if (!form.purchaseDate) { toast.error("Enter purchase date"); return; }
    setSubmitting(true);
    try {
      await addMetal({ type: metalType, quantity: qty, buyingPrice: price, purchaseDate: form.purchaseDate, notes: form.notes });
      toast.success(`${metalType === "gold" ? "Gold" : "Silver"} added!`, { duration: NUM.TOAST_DURATION });
      setModalOpen(false);
      loadData();
    } catch { toast.error("Failed to add"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    try { await deleteMetal(id); toast.success("Deleted"); loadData(); }
    catch { toast.error("Failed to delete"); }
  };

  if (loading) return <div className="space-y-6"><PageHeader title="Bullion Vault" /><div className="grid grid-cols-2 gap-4">{Array.from({ length: NUM.SKELETON_COUNT }).map((_, i) => <SkeletonCard key={i} />)}</div></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Bullion Vault" subtitle="Gold & Silver Holdings" action={
        <div className="flex gap-2">
          <button onClick={() => openModal("gold")} className="bg-warning text-warning-foreground text-sm font-medium px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5"><i className="bx bx-plus" /> Gold</button>
          <button onClick={() => openModal("silver")} className="bg-secondary text-secondary-foreground text-sm font-medium px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5 border border-border"><i className="bx bx-plus" /> Silver</button>
        </div>
      } />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Gold Quantity" value={`${totalGoldQty}g`} icon="bx-coin" variant="warning" subtitle={formatCurrency(totalGoldVal)} />
        <StatCard title="Gold Value" value={formatCurrency(totalGoldVal)} icon="bx-rupee" variant="warning" />
        <StatCard title="Silver Quantity" value={`${totalSilverQty}g`} icon="bx-coin" subtitle={formatCurrency(totalSilverVal)} />
        <StatCard title="Silver Value" value={formatCurrency(totalSilverVal)} icon="bx-rupee" />
      </div>

      {/* Entries */}
      {metals.length > 0 ? (
        <div className="bg-card border border-border rounded-xl shadow-card divide-y divide-border">
          {metals.map((m) => (
            <div key={m.id} className="flex items-center gap-3 p-4 hover:bg-secondary/50 transition-colors">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-lg", m.type === "gold" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground")}>
                <i className="bx bx-coin" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground capitalize">{m.type} — {m.quantity}g</p>
                <p className="text-xs text-muted-foreground">₹{m.buyingPrice}/g · {formatDate(m.purchaseDate)}</p>
              </div>
              <span className="text-sm font-semibold font-display text-foreground">{formatCurrency(m.quantity * m.buyingPrice)}</span>
              <button onClick={() => handleDelete(m.id)} className="w-8 h-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
                <i className="bx bx-trash text-lg" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon="bx-coin" title="No holdings yet" description="Add your first gold or silver purchase" />
      )}

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`Add ${metalType === "gold" ? "Gold" : "Silver"}`}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Quantity (grams) *</label>
            <input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="0.00" step="0.01"
              className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Buying Price (₹/gram) *</label>
            <input type="number" value={form.buyingPrice} onChange={(e) => setForm({ ...form, buyingPrice: e.target.value })} placeholder="0.00" step="0.01"
              className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Purchase Date *</label>
            <input type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes" rows={2}
              className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>
          <button onClick={handleAdd} disabled={submitting} className="w-full gradient-primary text-primary-foreground font-medium py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? <><i className="bx bx-loader-alt bx-spin" /> Adding...</> : <><i className="bx bx-check" /> Add {metalType === "gold" ? "Gold" : "Silver"}</>}
          </button>
        </div>
      </Modal>
    </div>
  );
}
