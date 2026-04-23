import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { SkeletonCard } from "@/components/common/Skeletons";
import { EmptyState } from "@/components/common/EmptyState";
import {
  getNetworthEntries,
  addNetworthEntry,
  getNetworthSnapshot,
  type NetworthEntry,
} from "@/services/service-api";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { NUM } from "@/constants/num-constants";
import { cn } from "@/lib/utils";

export default function OverallNetworth() {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<NetworthEntry[]>([]);
  const [adding, setAdding] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      setEntries(await getNetworthEntries());
    } catch {
      toast.error("Failed to load networth data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddToday = async () => {
    setAdding(true);
    try {
      const snapshot = await getNetworthSnapshot();
      await addNetworthEntry(snapshot);
      toast.success("Today's networth status added!", {
        duration: NUM.TOAST_SUCCESS_DURATION,
      });
      loadData();
    } catch (e: any) {
      toast.error(e?.message || "Failed to add today's status");
    } finally {
      setAdding(false);
    }
  };

  const allFundNames = Array.from(
    new Set(entries.flatMap((e) => e.funds?.map((f) => f.name) || [])),
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Overall Networth" subtitle="Loading..." />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: NUM.SKELETON_COUNT }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Overall Networth"
        subtitle="Track your complete financial position"
        action={
          <button
            onClick={handleAddToday}
            disabled={adding}
            className="gradient-primary text-primary-foreground text-sm font-medium px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5 disabled:opacity-50"
          >
            {adding ? (
              <>
                <i className="bx bx-loader-alt bx-spin" /> Adding...
              </>
            ) : (
              <>
                <i className="bx bx-plus" /> Add Today Status
              </>
            )}
          </button>
        }
      />

      {entries.length > 0 ? (
        <div className="bg-card border border-border rounded-xl shadow-card overflow-x-auto">
          <table className="w-full text-sm min-w-[1300px]">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th
                  rowSpan={3}
                  className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider sticky left-0 bg-secondary/50 z-10 min-w-[140px]"
                >
                  Date & Time
                </th>
                <th
                  colSpan={10}
                  className="px-3 py-2 text-center text-xs font-semibold text-warning uppercase tracking-wider border-l border-border"
                >
                  Metals
                </th>
                {allFundNames.length > 0 && (
                  <th
                    colSpan={allFundNames.length * 5}
                    className="px-3 py-2 text-center text-xs font-semibold text-primary uppercase tracking-wider border-l border-border"
                  >
                    Funds
                  </th>
                )}
                <th
                  rowSpan={3}
                  className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider border-l border-border min-w-[100px]"
                >
                  Bank Liquidity
                </th>
                <th
                  rowSpan={3}
                  className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider border-l border-border min-w-[100px]"
                >
                  PF Amount
                </th>
                <th
                  rowSpan={3}
                  className="px-3 py-2 text-center text-xs font-semibold text-success uppercase tracking-wider border-l border-border min-w-[120px]"
                >
                  Networth
                </th>
                <th
                  rowSpan={3}
                  className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider border-l border-border min-w-[100px]"
                >
                  Growth
                </th>
              </tr>
              <tr className="border-b border-border bg-secondary/30">
                <th
                  colSpan={5}
                  className="px-3 py-1.5 text-center text-xs font-medium text-warning/80 border-l border-border"
                >
                  Gold
                </th>
                <th
                  colSpan={5}
                  className="px-3 py-1.5 text-center text-xs font-medium text-muted-foreground border-l border-border"
                >
                  Silver
                </th>
                {allFundNames.map((name) => (
                  <th
                    key={name}
                    colSpan={5}
                    className="px-3 py-1.5 text-center text-xs font-medium text-primary/80 border-l border-border truncate max-w-[150px]"
                  >
                    {name}
                  </th>
                ))}
              </tr>
              <tr className="border-b border-border bg-secondary/20">
                {["Grams", "%", "Invested", "Returns", "Total"].map((h) => (
                  <th
                    key={`gold-${h}`}
                    className="px-2 py-1 text-center text-[10px] font-medium text-muted-foreground border-l border-border whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
                {["Grams", "%", "Invested", "Returns", "Total"].map((h) => (
                  <th
                    key={`silver-${h}`}
                    className="px-2 py-1 text-center text-[10px] font-medium text-muted-foreground border-l border-border whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
                {allFundNames.map((name) =>
                  ["Units", "%", "Invested", "Returns", "Total"].map((h) => (
                    <th
                      key={`${name}-${h}`}
                      className="px-2 py-1 text-center text-[10px] font-medium text-muted-foreground border-l border-border whitespace-nowrap"
                    >
                      {h}
                    </th>
                  )),
                )}
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => (
                <tr
                  key={entry.id}
                  className={cn(
                    "border-b border-border hover:bg-secondary/30 transition-colors",
                    idx === 0 && "bg-primary/5",
                  )}
                >
                  <td className="px-3 py-2.5 text-xs font-medium text-foreground sticky left-0 bg-card z-10">
                    {formatDate(entry.date || entry.createdAt)}
                  </td>
                  <td className="px-2 py-2 text-center text-xs border-l border-border">
                    {entry.metals?.gold?.grams ?? 0}g
                  </td>
                  <td className="px-2 py-2 text-center text-xs border-l border-border">
                    {entry.metals?.gold?.percentage ?? 0}%
                  </td>
                  <td className="px-2 py-2 text-center text-xs border-l border-border">
                    {formatCurrency(entry.metals?.gold?.invested ?? 0)}
                  </td>
                  <td className="px-2 py-2 text-center text-xs border-l border-border">
                    {formatCurrency(entry.metals?.gold?.returns ?? 0)}
                  </td>
                  <td className="px-2 py-2 text-center text-xs font-semibold border-l border-border">
                    {formatCurrency(entry.metals?.gold?.totalAmount ?? 0)}
                  </td>
                  <td className="px-2 py-2 text-center text-xs border-l border-border">
                    {entry.metals?.silver?.grams ?? 0}g
                  </td>
                  <td className="px-2 py-2 text-center text-xs border-l border-border">
                    {entry.metals?.silver?.percentage ?? 0}%
                  </td>
                  <td className="px-2 py-2 text-center text-xs border-l border-border">
                    {formatCurrency(entry.metals?.silver?.invested ?? 0)}
                  </td>
                  <td className="px-2 py-2 text-center text-xs border-l border-border">
                    {formatCurrency(entry.metals?.silver?.returns ?? 0)}
                  </td>
                  <td className="px-2 py-2 text-center text-xs font-semibold border-l border-border">
                    {formatCurrency(entry.metals?.silver?.totalAmount ?? 0)}
                  </td>
                  {allFundNames.map((fundName) => {
                    const fund = entry.funds?.find((f) => f.name === fundName);
                    return (
                      <React.Fragment key={fundName}>
                        <td className="px-2 py-2 text-center text-xs border-l border-border">
                          {fund?.units ?? "-"}
                        </td>
                        <td className="px-2 py-2 text-center text-xs border-l border-border">
                          {fund ? `${fund.percentage}%` : "-"}
                        </td>
                        <td className="px-2 py-2 text-center text-xs border-l border-border">
                          {fund ? formatCurrency(fund.invested) : "-"}
                        </td>
                        <td className="px-2 py-2 text-center text-xs border-l border-border">
                          {fund ? formatCurrency(fund.returns) : "-"}
                        </td>
                        <td className="px-2 py-2 text-center text-xs font-semibold border-l border-border">
                          {fund ? formatCurrency(fund.totalAmount) : "-"}
                        </td>
                      </React.Fragment>
                    );
                  })}
                  <td className="px-2 py-2 text-center text-xs border-l border-border">
                    {formatCurrency(entry.bankLiquidity ?? 0)}
                  </td>
                  <td className="px-2 py-2 text-center text-xs border-l border-border">
                    {formatCurrency(entry.pfAmount ?? 0)}
                  </td>
                  <td className="px-2 py-2 text-center text-xs font-bold text-success border-l border-border">
                    {formatCurrency(entry.networth ?? 0)}
                  </td>
                  <td
                    className={cn(
                      "px-2 py-2 text-center text-xs font-semibold border-l border-border",
                      (entry.growth ?? 0) >= 0
                        ? "text-success"
                        : "text-destructive",
                    )}
                  >
                    {(entry.growth ?? 0) >= 0 ? "+" : ""}
                    {formatCurrency(entry.growth ?? 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon="bx-line-chart-down"
          title="No networth records yet"
          description="Click 'Add Today Status' to capture your first snapshot"
        />
      )}
    </div>
  );
}
