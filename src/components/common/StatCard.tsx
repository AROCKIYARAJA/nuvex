import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  variant?: "default" | "primary" | "success" | "warning" | "destructive";
  className?: string;
}

const variantStyles = {
  default: "bg-card border-border",
  primary: "bg-accent border-primary/20",
  success: "bg-success/10 border-success/20",
  warning: "bg-warning/10 border-warning/20",
  destructive: "bg-destructive/10 border-destructive/20",
};

const iconBgStyles = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary/15 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/15 text-destructive",
};

export function StatCard({ title, value, subtitle, icon, trend, trendValue, variant = "default", className }: StatCardProps) {
  return (
    <div className={cn("rounded-xl border p-4 shadow-card transition-all hover:shadow-elevated animate-fade-in", variantStyles[variant], className)}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</span>
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", iconBgStyles[variant])}>
          <i className={`bx ${icon} text-lg`} />
        </div>
      </div>
      <p className="text-2xl font-bold font-display text-foreground leading-none mb-1">{value}</p>
      <div className="flex items-center gap-2">
        {trend && trendValue && (
          <span className={cn("text-xs font-medium flex items-center gap-0.5", trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground")}>
            <i className={`bx ${trend === "up" ? "bx-trending-up" : trend === "down" ? "bx-trending-down" : "bx-minus"} text-sm`} />
            {trendValue}
          </span>
        )}
        {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
      </div>
    </div>
  );
}
