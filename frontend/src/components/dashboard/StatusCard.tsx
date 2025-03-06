
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
  className?: string;
}

export function StatusCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
}: StatusCardProps) {
  return (
    <div className={cn(
      "glass-card p-6 rounded-xl flex flex-col gap-4 animate-scale-in",
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
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
