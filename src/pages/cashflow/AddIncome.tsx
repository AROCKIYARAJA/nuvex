import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { addIncome, updateIncome } from "@/services/service-api";
import { INCOME_CATEGORIES } from "@/constants/app-constants";
import { NUM } from "@/constants/num-constants";
import { ROUTES } from "@/constants/route-constants";
import { cn } from "@/lib/utils";

export default function AddIncome() {
  const navigate = useNavigate();
  const location = useLocation();
  const editTx = (location.state as any)?.editTx as
    | {
        id: string;
        name: string;
        amount: number;
        category: string;
        notes?: string;
      }
    | undefined;
  const isEdit = !!editTx;

  const [name, setName] = useState(editTx?.name ?? "");
  const [amount, setAmount] = useState(editTx ? String(editTx.amount) : "");
  const [category, setCategory] = useState(editTx?.category ?? "");
  const [notes, setNotes] = useState(editTx?.notes ?? "");
  const [loading, setLoading] = useState(false);
  const [autoNavigation, setAutoNavigation] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editTx) {
      setName(editTx.name);
      setAmount(String(editTx.amount));
      setCategory(editTx.category);
      setNotes(editTx.notes ?? "");
    }
  }, [editTx?.id]);

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
      const payload = {
        name: name.trim(),
        amount: parseFloat(amount),
        category,
        notes: notes.trim(),
      };
      if (isEdit && editTx) {
        await updateIncome(editTx.id, payload);
        toast.success("Income updated!", {
          duration: NUM.TOAST_SUCCESS_DURATION,
        });
      } else {
        await addIncome(payload);
        toast.success("Income added successfully!", {
          duration: NUM.TOAST_SUCCESS_DURATION,
        });
        setTimeout(
          () =>
            toast.info("Money status updated", {
              duration: NUM.TOAST_DURATION,
            }),
          500,
        );
        setName("");
        setAmount("");
        setCategory("");
        setNotes("");
        setErrors({});
        if (autoNavigation === true) {
          setAutoNavigation(false);
          navigate(ROUTES.CASHFLOW_DASHBOARD);
        }
      }
    } catch {
      toast.error(isEdit ? "Failed to update income" : "Failed to add income", {
        duration: NUM.TOAST_ERROR_DURATION,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <PageHeader
        title={isEdit ? "Edit Income" : "Add Income"}
        subtitle={
          isEdit ? "Update your income details" : "Record your earnings"
        }
        action={
          <button
            onClick={() => navigate(ROUTES.CASHFLOW_DASHBOARD)}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <i className="bx bx-arrow-back" /> Back
          </button>
        }
      />
      <div className="flex gap-2 items-center my-2">
        <input
          type="checkbox"
          name="auto-navigation"
          id="auto-navigation"
          checked={autoNavigation}
          onChange={(e) => setAutoNavigation((v) => !v)}
        />
        <label
          className="block text-sm font-medium text-foreground mb-1.5"
          htmlFor="auto-navigation"
        >
          After the data entry redirect me to main page automatically
        </label>
      </div>
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
              <i className="bx bx-loader-alt bx-spin" />{" "}
              {isEdit ? "Saving..." : "Adding..."}
            </>
          ) : (
            <>
              <i className="bx bx-plus" />{" "}
              {isEdit ? "Save Changes" : "Add Income"}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
