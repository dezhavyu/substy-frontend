export function Spinner({ label }: { label: string }): JSX.Element {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-card p-4">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}
