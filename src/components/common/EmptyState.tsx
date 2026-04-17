export function EmptyState({
  icon = "bx-data",
  title = "No data yet",
  description = "Start by adding your first entry.",
  action,
}: {
  icon?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-4">
        <i className={`bx ${icon} text-3xl text-accent-foreground`} />
      </div>
      <h3 className="text-lg font-semibold font-display text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-4">{description}</p>
      {action}
    </div>
  );
}
