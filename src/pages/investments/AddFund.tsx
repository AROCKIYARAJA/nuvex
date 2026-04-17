import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { addMutualFund } from "@/services/service-api";
import { FUND_CATEGORIES } from "@/constants/app-constants";
import { NUM } from "@/constants/num-constants";
import { ROUTES } from "@/constants/route-constants";
import { cn } from "@/lib/utils";

export default function AddFund() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [sipAmount, setSipAmount] = useState("");
  const [investedAmount, setInvestedAmount] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Fund name is required";
    const sip = parseFloat(sipAmount);
    if (!sipAmount || isNaN(sip) || sip < NUM.MIN_AMOUNT) errs.sipAmount = "Enter valid SIP amount";
    if (!category) errs.category = "Select a category";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const invested = parseFloat(investedAmount) || 0;
      await addMutualFund({
        name: name.trim(),
        sipAmount: parseFloat(sipAmount),
        investedAmount: invested,
        currentValue: invested,
        category,
        notes: notes.trim(),
        lastUpdated: new Date().toISOString(),
      });
      toast.success("Fund added!", { duration: NUM.TOAST_SUCCESS_DURATION });
      setName(""); setSipAmount(""); setInvestedAmount(""); setCategory(""); setNotes("");
      setErrors({});
    } catch { toast.error("Failed to add fund"); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <PageHeader title="New Fund" subtitle="Add a mutual fund to track" action={
        <button onClick={() => navigate(ROUTES.INVESTMENTS_FUNDS)} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"><i className="bx bx-arrow-back" /> Back</button>
      } />
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl shadow-card p-5 space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Fund Name *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Axis Bluechip Fund"
            className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground" />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">SIP Amount (₹) *</label>
            <input type="number" value={sipAmount} onChange={(e) => setSipAmount(e.target.value)} placeholder="0.00" step="0.01"
              className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            {errors.sipAmount && <p className="text-xs text-destructive mt-1">{errors.sipAmount}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Initial Investment (₹)</label>
            <input type="number" value={investedAmount} onChange={(e) => setInvestedAmount(e.target.value)} placeholder="0.00" step="0.01"
              className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Category *</label>
          <div className="flex flex-wrap gap-2">
            {FUND_CATEGORIES.map((cat) => (
              <button type="button" key={cat} onClick={() => setCategory(cat)}
                className={cn("px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                  category === cat ? "border-primary bg-accent text-primary" : "border-border bg-secondary text-muted-foreground hover:border-primary/30"
                )}>
                {cat}
              </button>
            ))}
          </div>
          {errors.category && <p className="text-xs text-destructive mt-1">{errors.category}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" rows={2}
            className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground resize-none" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full gradient-primary text-primary-foreground font-medium py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <><i className="bx bx-loader-alt bx-spin" /> Adding...</> : <><i className="bx bx-plus" /> Add Fund</>}
        </button>
      </form>
    </div>
  );
}
