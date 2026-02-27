import { cn } from "@/shared/lib/cn";

interface AlertProps {
  title: string;
  description?: string;
  variant?: "default" | "error";
  className?: string;
}

export function Alert({ title, description, variant = "default", className }: AlertProps): JSX.Element {
  return (
    <div
      className={cn(
        "rounded-md border px-4 py-3",
        variant === "error"
          ? "border-destructive/40 bg-destructive/10 text-destructive"
          : "border-border bg-muted/50 text-foreground",
        className
      )}
    >
      <p className="text-sm font-medium">{title}</p>
      {description ? <p className="mt-1 text-xs opacity-90">{description}</p> : null}
    </div>
  );
}
