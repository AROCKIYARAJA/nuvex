import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { StatCard } from "@/components/common/StatCard";
import { PageHeader } from "@/components/common/PageHeader";
import { Modal } from "@/components/common/Modal";
import { SkeletonCard } from "@/components/common/Skeletons";
import {
  getInvestmentSummary,
  addPFEntry,
  getPFTotal,
} from "@/services/service-api";
import { formatCurrency, getGrowthPercent } from "@/utils/formatters";
import { CHART_PERIODS } from "@/constants/app-constants";
import { NUM } from "@/constants/num-constants";
import { ROUTES } from "@/constants/route-constants";
import { Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from "chart.js";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  ChartTooltip,
  Legend,
  Filler,
);

export default function InvestmentDashboard() {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [currency, setCurrency] = useState("INR");
  const [chartPeriod, setChartPeriod] = useState("monthly");
  const [pfTotal, setPfTotal] = useState(0);

  // PF modal state
  const [pfOpen, setPfOpen] = useState(false);
  const [pfForm, setPfForm] = useState({ name: "", amount: "", notes: "" });
  const [pfSubmitting, setPfSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, pf] = await Promise.all([
        getInvestmentSummary(),
        getPFTotal().catch(() => ({ totalAmount: 0 })),
      ]);
      setSummary(s);
      setPfTotal(pf.totalAmount || 0);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddPF = async () => {
    const amt = parseFloat(pfForm.amount);
    if (!pfForm.name.trim()) {
      toast.error("Enter a name");
      return;
    }
    if (!amt || amt < NUM.MIN_AMOUNT) {
      toast.error("Enter a valid amount");
      return;
    }
    setPfSubmitting(true);
    try {
      await addPFEntry({
        name: pfForm.name.trim(),
        amount: amt,
        notes: pfForm.notes.trim(),
      });
      toast.success("PF amount added!", { duration: NUM.TOAST_DURATION });
      setPfOpen(false);
      setPfForm({ name: "", amount: "", notes: "" });
      loadData();
    } catch {
      toast.error("Failed to add PF");
    } finally {
      setPfSubmitting(false);
    }
  };

  const growth = summary
    ? getGrowthPercent(summary.totalInvested, summary.totalValue)
    : 0;

  const allocationData = {
    labels: ["Metals", "Mutual Funds"],
    datasets: [
      {
        data: [summary?.metalValue || 0, summary?.fundsValue || 0],
        backgroundColor: ["hsl(38, 92%, 50%)", "hsl(211, 100%, 50%)"],
        borderWidth: 0,
      },
    ],
  };

  const trendData = {
    labels: ["Jan", "Feb", "Mar", "Apr"],
    datasets: [
      {
        label: "Portfolio Value",
        data: [
          summary?.totalValue * 0.85 || 0,
          summary?.totalValue * 0.9 || 0,
          summary?.totalValue * 0.95 || 0,
          summary?.totalValue || 0,
        ],
        borderColor: "hsl(211, 100%, 50%)",
        backgroundColor: "hsla(211, 100%, 50%, 0.1)",
        tension: NUM.CHART_TENSION,
        fill: true,
        borderWidth: NUM.CHART_BORDER_WIDTH,
      },
    ],
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Investments" subtitle="Loading..." />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Investments"
        subtitle="Track your portfolio performance"
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => navigate(ROUTES.INVESTMENTS_METALS)}
              className="bg-warning text-warning-foreground text-sm font-medium px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5"
            >
              <i className="bx bx-coin" /> Bullion
            </button>
            <button
              onClick={() => navigate(ROUTES.INVESTMENTS_FUNDS)}
              className="gradient-primary text-primary-foreground text-sm font-medium px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5"
            >
              <i className="bx bx-bar-chart-alt-2" /> Funds
            </button>
            <button
              onClick={() => setPfOpen(true)}
              className="bg-muted-foreground text-background text-sm font-medium px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5"
            >
              <i className="bx bx-shield-quarter" /> Add PF
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Invested"
          value={formatCurrency(summary?.totalInvested || 0, currency)}
          icon="bx-coin-stack"
          variant="primary"
        />
        <StatCard
          title="Current Value"
          value={formatCurrency(summary?.totalValue || 0, currency)}
          icon="bx-line-chart"
          variant="success"
        />
        <StatCard
          title="Est. Returns"
          value={formatCurrency(summary?.estimatedReturns || 0, currency)}
          icon="bx-trending-up"
          variant={summary?.estimatedReturns >= 0 ? "success" : "destructive"}
          trend={summary?.estimatedReturns >= 0 ? "up" : "down"}
          trendValue={`${growth}%`}
        />
        <StatCard
          title="Assets"
          value={`${summary?.metalCount + summary?.fundCount}`}
          icon="bx-category"
          subtitle={`${summary?.metalCount} metals · ${summary?.fundCount} funds`}
        />
        <StatCard
          title="PF Amount"
          value={formatCurrency(pfTotal, currency)}
          icon="bx-shield-quarter"
          variant="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-4 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-foreground">
              Portfolio Growth
            </h3>
            <div className="flex gap-1 bg-secondary rounded-lg p-0.5">
              {CHART_PERIODS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setChartPeriod(p.value)}
                  className={cn(
                    "text-xs px-3 py-1 rounded-md transition-colors",
                    chartPeriod === p.value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64">
            <Line
              data={trendData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: {
                      color: resolvedTheme === "dark" ? "#64748b" : "#94a3b8",
                    },
                  },
                  y: {
                    grid: {
                      color:
                        resolvedTheme === "dark"
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(0,0,0,0.05)",
                    },
                    ticks: {
                      color: resolvedTheme === "dark" ? "#64748b" : "#94a3b8",
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-card">
          <h3 className="font-display font-semibold text-foreground mb-4">
            Allocation
          </h3>
          <div className="h-48 flex items-center justify-center">
            <Doughnut
              data={allocationData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: {
                      color: resolvedTheme === "dark" ? "#94a3b8" : "#64748b",
                      padding: 16,
                    },
                  },
                },
                cutout: "65%",
              }}
            />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 shadow-card">
        <h3 className="font-display font-semibold text-foreground mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Add Gold",
              icon: "bx-coin",
              path: ROUTES.INVESTMENTS_METALS,
              color: "bg-warning/10 text-warning",
            },
            {
              label: "Add Fund",
              icon: "bx-plus-circle",
              path: ROUTES.INVESTMENTS_FUNDS_NEW,
              color: "bg-primary/10 text-primary",
            },
            {
              label: "View Metals",
              icon: "bx-bar-chart",
              path: ROUTES.INVESTMENTS_METALS,
              color: "bg-accent text-accent-foreground",
            },
            {
              label: "View Funds",
              icon: "bx-list-ul",
              path: ROUTES.INVESTMENTS_FUNDS,
              color: "bg-success/10 text-success",
            },
          ].map((a) => (
            <button
              key={a.label}
              onClick={() => navigate(a.path)}
              className={cn(
                "flex items-center gap-2 p-3 rounded-xl border border-border hover:shadow-card transition-all text-sm font-medium",
                a.color,
              )}
            >
              <i className={`bx ${a.icon} text-lg`} /> {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* PF Modal */}
      <Modal
        open={pfOpen}
        onClose={() => setPfOpen(false)}
        title="Add PF Amount"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Name *
            </label>
            <input
              type="text"
              value={pfForm.name}
              onChange={(e) => setPfForm({ ...pfForm, name: e.target.value })}
              placeholder="e.g. April PF"
              className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Amount (₹) *
            </label>
            <input
              type="number"
              value={pfForm.amount}
              onChange={(e) => setPfForm({ ...pfForm, amount: e.target.value })}
              placeholder="0.00"
              step="0.01"
              className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Notes
            </label>
            <textarea
              value={pfForm.notes}
              onChange={(e) => setPfForm({ ...pfForm, notes: e.target.value })}
              placeholder="Optional notes"
              rows={2}
              className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground resize-none"
            />
          </div>
          <button
            onClick={handleAddPF}
            disabled={pfSubmitting}
            className="w-full bg-muted-foreground text-background font-medium py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {pfSubmitting ? (
              <>
                <i className="bx bx-loader-alt bx-spin" /> Adding...
              </>
            ) : (
              <>
                <i className="bx bx-shield-quarter" /> Add PF Amount
              </>
            )}
          </button>
        </div>
      </Modal>
    </div>
  );
}
