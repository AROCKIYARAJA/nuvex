import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { addIncome } from "@/services/service-api";
import { INCOME_CATEGORIES } from "@/constants/app-constants";
import { NUM } from "@/constants/num-constants";
import { ROUTES } from "@/constants/route-constants";
import { cn } from "@/lib/utils";

export default function AddIncome() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Name is required";
    if (name.length > NUM.MAX_NAME_LENGTH)
      errs.name = `Max ${NUM.MAX_NAME_LENGTH} characters`;
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt < NUM.MIN_AMOUNT)
      errs.amount = `Enter a valid amount (min ${NUM.MIN_AMOUNT})`;
    if (amt > NUM.MAX_AMOUNT) errs.amount = `Max amount is ${NUM.MAX_AMOUNT}`;
    if (!category) errs.category = "Select a category";
    if (notes.length > NUM.MAX_NOTES_LENGTH)
      errs.notes = `Max ${NUM.MAX_NOTES_LENGTH} characters`;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await addIncome({
        name: name.trim(),
        amount: parseFloat(amount),
        category,
        notes: notes.trim(),
      });
      toast.success("Income added successfully!", {
        duration: NUM.TOAST_SUCCESS_DURATION,
      });
      setTimeout(
        () =>
          toast.info("Money status updated", { duration: NUM.TOAST_DURATION }),
        500,
      );
      setName("");
      setAmount("");
      setCategory("");
      setNotes("");
      setErrors({});
    } catch {
      toast.error("Failed to add income", {
        duration: NUM.TOAST_ERROR_DURATION,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <PageHeader
        title="Add Income"
        subtitle="Record your earnings"
        action={
          <button
            onClick={() => navigate(ROUTES.CASHFLOW_DASHBOARD)}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <i className="bx bx-arrow-back" /> Back
          </button>
        }
      />
      <form
        onSubmit={handleSubmit}
        className="bg-card border border-border rounded-xl shadow-card p-5 space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Income Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Salary"
            className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
          {errors.name && (
            <p className="text-xs text-destructive mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Amount (₹) *
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min={NUM.MIN_AMOUNT}
            className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
          {errors.amount && (
            <p className="text-xs text-destructive mt-1">{errors.amount}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Category *
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {INCOME_CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all",
                  category === cat.id
                    ? "border-primary bg-accent text-primary shadow-card"
                    : "border-border bg-secondary text-muted-foreground hover:border-primary/30 hover:text-foreground",
                )}
              >
                <i className={`bx ${cat.icon} text-xl`} />
                <span className="text-center leading-tight">{cat.label}</span>
              </button>
            ))}
          </div>
          {errors.category && (
            <p className="text-xs text-destructive mt-1">{errors.category}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add details..."
            rows={3}
            className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {notes.length}/{NUM.MAX_NOTES_LENGTH}
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-success text-success-foreground font-medium py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <i className="bx bx-loader-alt bx-spin" /> Adding...
            </>
          ) : (
            <>
              <i className="bx bx-plus" /> Add Income
            </>
          )}
        </button>
      </form>
    </div>
  );
}
