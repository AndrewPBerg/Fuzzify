import { cn } from "@/lib/utils";

interface StatusCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "success" | "warning" | "danger";
  className?: string;
}

export function StatusCard({
  title,
  value,
  description,
  icon,
  trend,
  variant = "default",
  className,
}: StatusCardProps) {
  return (
    <div className={cn(
      "glass-card p-6 rounded-xl flex flex-col gap-4 animate-scale-in",
      variant === "success" && "bg-emerald-50/30 border-emerald-200",
      variant === "warning" && "bg-amber-50/30 border-amber-200",
      variant === "danger" && "bg-rose-50/30 border-rose-200",
      className
    )}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <p className="text-2xl font-semibold mt-1">{value}</p>
          {trend && (
            <div className="flex items-center mt-1">
              <span className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-emerald-500" : "text-rose-500"
              )}>
                {trend.isPositive ? "+" : ""}{trend.value}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">vs last week</span>
            </div>
          )}
        </div>
        <div className={cn(
          "p-2 rounded-lg",
          variant === "default" && "bg-primary/10 text-primary",
          variant === "success" && "bg-emerald-100 text-emerald-700",
          variant === "warning" && "bg-amber-100 text-amber-700",
          variant === "danger" && "bg-rose-100 text-rose-700"
        )}>
          {icon}
        </div>
      </div>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
