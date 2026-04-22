import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { StatCard } from "@/components/common/StatCard";
import { PageHeader } from "@/components/common/PageHeader";
import { Modal } from "@/components/common/Modal";
import { EmptyState } from "@/components/common/EmptyState";
import { SkeletonCard } from "@/components/common/Skeletons";
import {
  getMetals,
  addMetal,
  deleteMetal,
  withdrawAsset,
  updateMetalAssets,
  type MetalEntry,
} from "@/services/service-api";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { NUM } from "@/constants/num-constants";
import { cn } from "@/lib/utils";

type WithdrawForm = {
  name: string;
  quantity: string;
  pricePerGram: string;
  assetType: "gold" | "silver";
  notes: string;
};
type WithdrawErrors = Partial<Record<keyof WithdrawForm, string>>;
const EMPTY_WITHDRAW: WithdrawForm = {
  name: "",
  quantity: "",
  pricePerGram: "",
  assetType: "gold",
  notes: "",
};

export default function BullionVault() {
  const [loading, setLoading] = useState(true);
  const [metals, setMetals] = useState<MetalEntry[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [metalType, setMetalType] = useState<"gold" | "silver">("gold");
  const [form, setForm] = useState({
    quantity: "",
    buyingPrice: "",
    purchaseDate: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawForm, setWithdrawForm] =
    useState<WithdrawForm>(EMPTY_WITHDRAW);
  const [withdrawErrors, setWithdrawErrors] = useState<WithdrawErrors>({});
  const [withdrawing, setWithdrawing] = useState(false);

  // Update Assets modal
  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateAssetType, setUpdateAssetType] = useState<"gold" | "silver">(
    "gold",
  );
  const [updatePrice, setUpdatePrice] = useState("");
  const [updating, setUpdating] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      setMetals(await getMetals());
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const goldEntries = metals.filter((m) => m.type === "gold");
  const silverEntries = metals.filter((m) => m.type === "silver");
  const totalGoldQty = goldEntries.reduce((s, m) => s + m.quantity, 0);
  const totalGoldVal = goldEntries.reduce(
    (s, m) => s + m.quantity * m.buyingPrice,
    0,
  );
  const totalSilverQty = silverEntries.reduce((s, m) => s + m.quantity, 0);
  const totalSilverVal = silverEntries.reduce(
    (s, m) => s + m.quantity * m.buyingPrice,
    0,
  );

  const openModal = (type: "gold" | "silver") => {
    setMetalType(type);
    setForm({ quantity: "", buyingPrice: "", purchaseDate: "", notes: "" });
    setModalOpen(true);
  };

  const handleAdd = async () => {
    const qty = parseFloat(form.quantity);
    const price = parseFloat(form.buyingPrice);
    if (!qty || qty < NUM.MIN_AMOUNT) {
      toast.error("Enter valid quantity");
      return;
    }
    if (!price || price < NUM.MIN_AMOUNT) {
      toast.error("Enter valid price");
      return;
    }
    if (!form.purchaseDate) {
      toast.error("Enter purchase date");
      return;
    }
    setSubmitting(true);
    try {
      await addMetal({
        type: metalType,
        quantity: qty,
        buyingPrice: price,
        purchaseDate: form.purchaseDate,
        notes: form.notes,
      });
      toast.success(`${metalType === "gold" ? "Gold" : "Silver"} added!`, {
        duration: NUM.TOAST_DURATION,
      });
      setModalOpen(false);
      loadData();
    } catch {
      toast.error("Failed to add");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    try {
      await deleteMetal(id);
      toast.success("Deleted");
      loadData();
    } catch {
      toast.error("Failed to delete");
    }
  };

  // Withdraw
  const withdrawTotal = useMemo(() => {
    const q = parseFloat(withdrawForm.quantity);
    const p = parseFloat(withdrawForm.pricePerGram);
    if (!q || !p || q <= 0 || p <= 0) return 0;
    return +(q * p).toFixed(NUM.DECIMAL_PLACES);
  }, [withdrawForm.quantity, withdrawForm.pricePerGram]);

  const openWithdraw = () => {
    setWithdrawForm(EMPTY_WITHDRAW);
    setWithdrawErrors({});
    setWithdrawOpen(true);
  };
  const closeWithdraw = () => {
    setWithdrawForm(EMPTY_WITHDRAW);
    setWithdrawErrors({});
    setWithdrawOpen(false);
  };

  const validateWithdraw = (): boolean => {
    const errs: WithdrawErrors = {};
    if (!withdrawForm.name.trim()) errs.name = "Name is required";
    else if (withdrawForm.name.length > NUM.MAX_NAME_LENGTH)
      errs.name = `Max ${NUM.MAX_NAME_LENGTH} characters`;
    const qty = parseFloat(withdrawForm.quantity);
    if (!withdrawForm.quantity) errs.quantity = "Quantity is required";
    else if (isNaN(qty) || qty < NUM.MIN_AMOUNT)
      errs.quantity = "Enter a valid quantity";
    const ppg = parseFloat(withdrawForm.pricePerGram);
    if (!withdrawForm.pricePerGram)
      errs.pricePerGram = "Price per gram is required";
    else if (isNaN(ppg) || ppg < NUM.MIN_AMOUNT)
      errs.pricePerGram = "Enter a valid price";
    if (!errs.quantity) {
      const available =
        withdrawForm.assetType === "gold" ? totalGoldQty : totalSilverQty;
      if (qty > available)
        errs.quantity = `Only ${available}g of ${withdrawForm.assetType} available`;
    }
    if (withdrawForm.notes && withdrawForm.notes.length > NUM.MAX_NOTES_LENGTH)
      errs.notes = `Max ${NUM.MAX_NOTES_LENGTH} characters`;
    setWithdrawErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleWithdraw = async () => {
    if (!validateWithdraw()) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    setWithdrawing(true);
    try {
      await withdrawAsset({
        name: withdrawForm.name.trim(),
        quantity: parseFloat(withdrawForm.quantity),
        pricePerGram: parseFloat(withdrawForm.pricePerGram),
        totalPrice: withdrawTotal,
        assetType: withdrawForm.assetType,
        notes: withdrawForm.notes.trim(),
      });
      toast.success(
        `${withdrawForm.assetType === "gold" ? "Gold" : "Silver"} withdrawn!`,
        { duration: NUM.TOAST_DURATION },
      );
      closeWithdraw();
      loadData();
    } catch (e: any) {
      toast.error(e?.message || "Failed to withdraw");
    } finally {
      setWithdrawing(false);
    }
  };

  // Update Assets
  const openUpdateAssets = () => {
    setUpdateAssetType("gold");
    setUpdatePrice("");
    setUpdateOpen(true);
  };
  const availableGrams =
    updateAssetType === "gold" ? totalGoldQty : totalSilverQty;

  const handleUpdateAssets = async () => {
    const price = parseFloat(updatePrice);
    if (!price || price < NUM.MIN_AMOUNT) {
      toast.error("Enter a valid price per gram");
      return;
    }
    setUpdating(true);
    try {
      await updateMetalAssets({
        assetType: updateAssetType,
        pricePerGram: price,
      });
      toast.success("Assets updated!", { duration: NUM.TOAST_DURATION });
      setUpdateOpen(false);
      loadData();
    } catch (e: any) {
      toast.error(e?.message || "Failed to update");
    } finally {
      setUpdating(false);
    }
  };

  const inputBase =
    "w-full px-3 py-2.5 rounded-lg bg-secondary border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors";
  const inputCls = (hasError?: boolean) =>
    cn(
      inputBase,
      hasError ? "border-destructive focus:ring-destructive" : "border-border",
    );

  if (loading)
    return (
      <div className="space-y-6">
        <PageHeader title="Bullion Vault" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: NUM.SKELETON_COUNT }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Bullion Vault"
        subtitle="Gold & Silver Holdings"
        action={
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => openModal("gold")}
              className="bg-warning text-warning-foreground text-sm font-medium px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5"
            >
              <i className="bx bx-plus" /> Gold
            </button>
            <button
              onClick={() => openModal("silver")}
              className="bg-secondary text-secondary-foreground text-sm font-medium px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5 border border-border"
            >
              <i className="bx bx-plus" /> Silver
            </button>
            <button
              onClick={openWithdraw}
              className="bg-destructive text-destructive-foreground text-sm font-medium px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5"
            >
              <i className="bx bx-minus-circle" /> Asset Withdraw
            </button>
            <button
              onClick={openUpdateAssets}
              className="bg-muted-foreground text-background text-sm font-medium px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5"
            >
              <i className="bx bx-refresh" /> Update Assets
            </button>
          </div>
        }
      />
      <div className="grid grid-cols-1">
        <StatCard
          title="Gold + Silver Total Amount"
          value={formatCurrency(totalGoldVal + totalSilverVal)}
          icon="bx-coin"
          variant="warning"
          subtitle={""}
        />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Gold Quantity"
          value={`${totalGoldQty}g`}
          icon="bx-coin"
          variant="warning"
          subtitle={formatCurrency(totalGoldVal)}
        />
        <StatCard
          title="Gold Value"
          value={formatCurrency(totalGoldVal)}
          icon="bx-rupee"
          variant="warning"
        />
        <StatCard
          title="Silver Quantity"
          value={`${totalSilverQty}g`}
          icon="bx-coin"
          subtitle={formatCurrency(totalSilverVal)}
        />
        <StatCard
          title="Silver Value"
          value={formatCurrency(totalSilverVal)}
          icon="bx-rupee"
        />
      </div>

      {metals.length > 0 ? (
        <div className="bg-card border border-border rounded-xl shadow-card divide-y divide-border">
          {metals.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-3 p-4 hover:bg-secondary/50 transition-colors"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center text-lg",
                  m.type === "gold"
                    ? "bg-warning/10 text-warning"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <i className="bx bx-coin" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground capitalize">
                  {m.type} — {m.quantity}g
                </p>
                <p className="text-xs text-muted-foreground">
                  ₹{m.buyingPrice}/g · {formatDate(m.purchaseDate)}
                </p>
              </div>
              <span className="text-sm font-semibold font-display text-foreground">
                {formatCurrency(m.quantity * m.buyingPrice)}
              </span>
              <button
                onClick={() => handleDelete(m.id)}
                className="w-8 h-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
              >
                <i className="bx bx-trash text-lg" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="bx-coin"
          title="No holdings yet"
          description="Add your first gold or silver purchase"
        />
      )}

      {/* Add Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Add ${metalType === "gold" ? "Gold" : "Silver"}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Quantity (grams) *
            </label>
            <input
              type="number"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              placeholder="0.00"
              step="0.01"
              className={inputCls()}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Buying Price (₹/gram) *
            </label>
            <input
              type="number"
              value={form.buyingPrice}
              onChange={(e) =>
                setForm({ ...form, buyingPrice: e.target.value })
              }
              placeholder="0.00"
              step="0.01"
              className={inputCls()}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Purchase Date *
            </label>
            <input
              type="date"
              value={form.purchaseDate}
              onChange={(e) =>
                setForm({ ...form, purchaseDate: e.target.value })
              }
              className={inputCls()}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Optional notes"
              rows={2}
              className={cn(inputCls(), "resize-none")}
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={submitting}
            className="w-full gradient-primary text-primary-foreground font-medium py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <i className="bx bx-loader-alt bx-spin" /> Adding...
              </>
            ) : (
              <>
                <i className="bx bx-check" /> Add{" "}
                {metalType === "gold" ? "Gold" : "Silver"}
              </>
            )}
          </button>
        </div>
      </Modal>

      {/* Withdraw Modal */}
      <Modal open={withdrawOpen} onClose={closeWithdraw} title="Withdraw Asset">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Name *
            </label>
            <input
              type="text"
              value={withdrawForm.name}
              onChange={(e) =>
                setWithdrawForm({ ...withdrawForm, name: e.target.value })
              }
              placeholder="e.g. Wedding ring sale"
              maxLength={NUM.MAX_NAME_LENGTH}
              className={inputCls(!!withdrawErrors.name)}
            />
            {withdrawErrors.name && (
              <p className="mt-1 text-xs text-destructive">
                {withdrawErrors.name}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Quantity (g) *
              </label>
              <input
                type="number"
                value={withdrawForm.quantity}
                onChange={(e) =>
                  setWithdrawForm({ ...withdrawForm, quantity: e.target.value })
                }
                placeholder="0.00"
                step="0.01"
                min="0"
                className={inputCls(!!withdrawErrors.quantity)}
              />
              {withdrawErrors.quantity && (
                <p className="mt-1 text-xs text-destructive">
                  {withdrawErrors.quantity}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Per Gram Price *
              </label>
              <input
                type="number"
                value={withdrawForm.pricePerGram}
                onChange={(e) =>
                  setWithdrawForm({
                    ...withdrawForm,
                    pricePerGram: e.target.value,
                  })
                }
                placeholder="0.00"
                step="0.01"
                min="0"
                className={inputCls(!!withdrawErrors.pricePerGram)}
              />
              {withdrawErrors.pricePerGram && (
                <p className="mt-1 text-xs text-destructive">
                  {withdrawErrors.pricePerGram}
                </p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Total Price (auto)
            </label>
            <input
              type="number"
              value={withdrawTotal || ""}
              disabled
              readOnly
              placeholder="0.00"
              className={cn(
                inputBase,
                "border-border opacity-70 cursor-not-allowed",
              )}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Asset Type *
            </label>
            <select
              value={withdrawForm.assetType}
              onChange={(e) =>
                setWithdrawForm({
                  ...withdrawForm,
                  assetType: e.target.value as "gold" | "silver",
                })
              }
              className={inputCls(!!withdrawErrors.assetType)}
            >
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Notes
            </label>
            <textarea
              value={withdrawForm.notes}
              onChange={(e) =>
                setWithdrawForm({ ...withdrawForm, notes: e.target.value })
              }
              placeholder="Optional notes"
              rows={2}
              maxLength={NUM.MAX_NOTES_LENGTH}
              className={cn(inputCls(!!withdrawErrors.notes), "resize-none")}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={closeWithdraw}
              disabled={withdrawing}
              className="flex-1 bg-secondary text-secondary-foreground font-medium py-3 rounded-xl border border-border hover:bg-muted transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleWithdraw}
              disabled={withdrawing}
              className="flex-1 bg-destructive text-destructive-foreground font-medium py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {withdrawing ? (
                <>
                  <i className="bx bx-loader-alt bx-spin" /> Processing...
                </>
              ) : (
                <>
                  <i className="bx bx-minus-circle" /> Asset Withdraw
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Update Assets Modal */}
      <Modal
        open={updateOpen}
        onClose={() => setUpdateOpen(false)}
        title="Update Assets Info"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Asset Type
            </label>
            <select
              value={updateAssetType}
              onChange={(e) =>
                setUpdateAssetType(e.target.value as "gold" | "silver")
              }
              className={inputCls()}
            >
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Available Grams
            </label>
            <input
              type="number"
              value={availableGrams}
              disabled
              className={cn(
                inputBase,
                "border-border opacity-70 cursor-not-allowed",
              )}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Price Per Gram (₹) *
            </label>
            <input
              type="number"
              value={updatePrice}
              onChange={(e) => setUpdatePrice(e.target.value)}
              placeholder="0.00"
              step="0.01"
              className={inputCls()}
            />
          </div>
          <button
            onClick={handleUpdateAssets}
            disabled={updating}
            className="w-full bg-muted-foreground text-background font-medium py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {updating ? (
              <>
                <i className="bx bx-loader-alt bx-spin" /> Updating...
              </>
            ) : (
              <>
                <i className="bx bx-refresh" /> Update Assets Info
              </>
            )}
          </button>
        </div>
      </Modal>
    </div>
  );
}
