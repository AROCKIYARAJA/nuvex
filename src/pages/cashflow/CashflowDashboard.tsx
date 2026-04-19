import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { StatCard } from "@/components/common/StatCard";
import { PageHeader } from "@/components/common/PageHeader";
import { SkeletonCard, SkeletonList } from "@/components/common/Skeletons";
import { EmptyState } from "@/components/common/EmptyState";
import {
  getCashflowSummary,
  getExpenses,
  getIncomes,
  getRecentTransactions,
  getTopSpending,
  RecentTransaction,
  TopSpendingItem,
  type Expense,
  type Income,
} from "@/services/service-api";
import {
  formatCurrency,
  formatRelativeDate,
  getCategoryLabel,
  getCategoryIcon,
} from "@/utils/formatters";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  CURRENCIES,
  CHART_PERIODS,
  HEALTH_STATUSES,
} from "@/constants/app-constants";
import { NUM } from "@/constants/num-constants";
import { ROUTES } from "@/constants/route-constants";
import { Line, Doughnut } from "react-chartjs-2";
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
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";

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

export default function CashflowDashboard() {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [topSpending, setTopSpending] = useState<TopSpendingItem[]>([]);
  const [recent, setRecent] = useState<RecentTransaction[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [currency, setCurrency] = useState("INR");
  const [chartPeriod, setChartPeriod] = useState("monthly");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, e, i, top, rec] = await Promise.all([
        getCashflowSummary(),
        getExpenses(),
        getIncomes(),
        getTopSpending(NUM.TOP_CATEGORIES_COUNT).catch(
          () => [] as TopSpendingItem[],
        ),
        getRecentTransactions(NUM.RECENT_ITEMS_COUNT).catch(
          () => [] as RecentTransaction[],
        ),
      ]);
      setSummary(s);
      setExpenses(e);
      setIncomes(i);
      setTopSpending(top);
      setRecent(rec);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getHealthStatus = () => {
    if (!summary) return HEALTH_STATUSES.STABLE;
    const ratio = summary.totalExpenses / (summary.totalIncome || 1);
    if (ratio > 0.9) return HEALTH_STATUSES.CRITICAL;
    if (ratio > 0.7) return HEALTH_STATUSES.WARNING;
    if (ratio < 0.4) return HEALTH_STATUSES.GREAT;
    return HEALTH_STATUSES.STABLE;
  };

  const getTopCategories = () => {
    if (topSpending && topSpending.length > 0) return topSpending;
    const catMap: Record<string, number> = {};
    expenses.forEach((e) => {
      catMap[e.category] = (catMap[e.category] || 0) + e.amount;
    });
    return Object.entries(catMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, NUM.TOP_CATEGORIES_COUNT)
      .map(([cat, amount]) => ({ category: cat, amount }));
  };

  const recentTransactions =
    recent && recent.length > 0
      ? recent
      : [
          ...expenses.map((e) => ({ ...e, type: "expense" as const })),
          ...incomes.map((i) => ({ ...i, type: "income" as const })),
        ]
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
          .slice(0, NUM.RECENT_ITEMS_COUNT);

  const health = getHealthStatus();
  const topCats = getTopCategories();

  const chartData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Income",
        data: [
          summary?.totalIncome * 0.25 || 0,
          summary?.totalIncome * 0.5 || 0,
          summary?.totalIncome * 0.75 || 0,
          summary?.totalIncome || 0,
        ],
        borderColor: "hsl(142, 71%, 45%)",
        backgroundColor: "hsla(142, 71%, 45%, 0.1)",
        tension: NUM.CHART_TENSION,
        fill: true,
        borderWidth: NUM.CHART_BORDER_WIDTH,
        pointRadius: NUM.CHART_POINT_RADIUS,
      },
      {
        label: "Expenses",
        data: [
          summary?.totalExpenses * 0.2 || 0,
          summary?.totalExpenses * 0.45 || 0,
          summary?.totalExpenses * 0.7 || 0,
          summary?.totalExpenses || 0,
        ],
        borderColor: "hsl(0, 72%, 51%)",
        backgroundColor: "hsla(0, 72%, 51%, 0.1)",
        tension: NUM.CHART_TENSION,
        fill: true,
        borderWidth: NUM.CHART_BORDER_WIDTH,
        pointRadius: NUM.CHART_POINT_RADIUS,
      },
    ],
  };

  const doughnutData = {
    labels: topCats.map((c) =>
      getCategoryLabel(EXPENSE_CATEGORIES, c.category),
    ),
    datasets: [
      {
        data: topCats.map((c) => c.amount),
        backgroundColor: [
          "hsl(211, 100%, 50%)",
          "hsl(142, 71%, 45%)",
          "hsl(38, 92%, 50%)",
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: {
          color: resolvedTheme === "dark" ? "#94a3b8" : "#64748b",
          font: { size: 12 },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: resolvedTheme === "dark" ? "#64748b" : "#94a3b8" },
      },
      y: {
        grid: {
          color:
            resolvedTheme === "dark"
              ? "rgba(255,255,255,0.05)"
              : "rgba(0,0,0,0.05)",
        },
        ticks: { color: resolvedTheme === "dark" ? "#64748b" : "#94a3b8" },
      },
    },
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Cashflow Dashboard" subtitle="Loading..." />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: NUM.SKELETON_COUNT }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <SkeletonList />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Cashflow"
        subtitle="Track your income, expenses, and financial health"
        action={
          <div className="flex items-center gap-2">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="text-sm bg-secondary text-secondary-foreground rounded-lg px-3 py-1.5 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>
            <button
              onClick={() => navigate(ROUTES.CASHFLOW_ADD_EXPENSE)}
              className="gradient-primary text-primary-foreground text-sm font-medium px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5"
            >
              <i className="bx bx-plus" />
              <span className="">Expense</span>
            </button>
            <button
              onClick={() => navigate(ROUTES.CASHFLOW_ADD_INCOME)}
              className="bg-success text-success-foreground text-sm font-medium px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5"
            >
              <i className="bx bx-plus" />
              <span className="">Income</span>
            </button>
          </div>
        }
      />

      {/* Health Badge */}
      <div
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border",
          health.color === "success" &&
            "bg-success/10 text-success border-success/20",
          health.color === "primary" &&
            "bg-primary/10 text-primary border-primary/20",
          health.color === "warning" &&
            "bg-warning/10 text-warning border-warning/20",
          health.color === "destructive" &&
            "bg-destructive/10 text-destructive border-destructive/20",
        )}
      >
        <i className="bx bx-pulse" />
        Month Health: {health.label}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Balance"
          value={formatCurrency(summary?.balance || 0, currency)}
          icon="bx-wallet"
          variant="primary"
        />
        <StatCard
          title="Total Income"
          value={formatCurrency(summary?.totalIncome || 0, currency)}
          icon="bx-trending-up"
          variant="success"
          trend="up"
          trendValue={`${summary?.incomeCount} entries`}
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(summary?.totalExpenses || 0, currency)}
          icon="bx-trending-down"
          variant="destructive"
          trend="down"
          trendValue={`${summary?.expenseCount} entries`}
        />
        <StatCard
          title="Net Flow"
          value={formatCurrency(summary?.netFlow || 0, currency)}
          icon="bx-transfer"
          variant={(summary?.netFlow || 0) >= 0 ? "success" : "warning"}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-4 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-foreground">
              Cash Flow Trend
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
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-card">
          <h3 className="font-display font-semibold text-foreground mb-4">
            Top Spending
          </h3>
          {topCats.length > 0 ? (
            <>
              <div className="h-40 flex items-center justify-center">
                <Doughnut
                  data={doughnutData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    cutout: "65%",
                  }}
                />
              </div>
              <div className="mt-4 space-y-2">
                {topCats.map((c, i) => (
                  <div
                    key={c.category}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          backgroundColor: [
                            "hsl(211,100%,50%)",
                            "hsl(142,71%,45%)",
                            "hsl(38,92%,50%)",
                          ][i],
                        }}
                      />
                      <span className="text-foreground">
                        {getCategoryLabel(EXPENSE_CATEGORIES, c.category)}
                      </span>
                    </div>
                    <span className="text-muted-foreground font-medium">
                      {formatCurrency(c.amount, currency)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
              No spending data
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-card border border-border rounded-xl shadow-card">
        <div className="p-4 border-b border-border">
          <h3 className="font-display font-semibold text-foreground">
            Recent Transactions
          </h3>
        </div>
        {recentTransactions.length > 0 ? (
          <div className="divide-y divide-border">
            {recentTransactions.map((tx) => {
              const cats =
                tx.type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
              return (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 p-4 hover:bg-secondary/50 transition-colors"
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-lg",
                      tx.type === "expense"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-success/10 text-success",
                    )}
                  >
                    <i className={`bx ${getCategoryIcon(cats, tx.category)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {tx.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getCategoryLabel(cats, tx.category)} ·{" "}
                      {formatRelativeDate(tx.createdAt)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-sm font-semibold font-display",
                      tx.type === "expense"
                        ? "text-destructive"
                        : "text-success",
                    )}
                  >
                    {tx.type === "expense" ? "-" : "+"}
                    {formatCurrency(tx.amount, currency)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon="bx-transfer"
            title="No transactions"
            description="Add your first income or expense to get started."
          />
        )}
      </div>
    </div>
  );
}
