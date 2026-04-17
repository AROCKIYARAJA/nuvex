import { NUM } from "@/constants/num-constants";

export function SkeletonCard() {
  return (
    <div className="rounded-lg bg-card border border-border p-4 animate-pulse-soft">
      <div className="h-3 w-1/3 bg-muted rounded mb-3" />
      <div className="h-6 w-2/3 bg-muted rounded mb-2" />
      <div className="h-3 w-1/2 bg-muted rounded" />
    </div>
  );
}

export function SkeletonList({ count = NUM.SKELETON_COUNT }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border animate-pulse-soft">
          <div className="w-10 h-10 rounded-full bg-muted" />
          <div className="flex-1">
            <div className="h-3 w-1/3 bg-muted rounded mb-2" />
            <div className="h-2 w-1/4 bg-muted rounded" />
          </div>
          <div className="h-4 w-16 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}
