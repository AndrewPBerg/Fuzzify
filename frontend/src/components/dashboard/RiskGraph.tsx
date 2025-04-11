import { cn } from "@/lib/utils";

interface RiskCounts {
  high: number;
  medium: number;
  low: number;
  unknown: number;
}

interface RiskGraphProps {
  riskCounts: RiskCounts;
  className?: string;
  showLabels?: boolean;
}

export function RiskGraph({ riskCounts, className, showLabels = true }: RiskGraphProps) {
  const total = riskCounts.high + riskCounts.medium + riskCounts.low + riskCounts.unknown || 1; // Avoid division by zero
  
  // Calculate percentages
  const highPercent = (riskCounts.high / total) * 100;
  const mediumPercent = (riskCounts.medium / total) * 100;
  const lowPercent = (riskCounts.low / total) * 100;
  const unknownPercent = (riskCounts.unknown / total) * 100;
  
  return (
    <div className={cn("w-full flex flex-col space-y-1", className)}>
      <div className="w-full h-6 flex rounded-md overflow-hidden">
        {/* High risk - red */}
        {highPercent > 0 && (
          <div 
            className="bg-red-500 h-full flex items-center justify-center text-[10px] text-white font-medium"
            style={{ width: `${highPercent}%` }}
          >
            {highPercent > 8 && showLabels ? riskCounts.high : ""}
          </div>
        )}
        
        {/* Medium risk - orange */}
        {mediumPercent > 0 && (
          <div 
            className="bg-orange-400 h-full flex items-center justify-center text-[10px] text-white font-medium"
            style={{ width: `${mediumPercent}%` }}
          >
            {mediumPercent > 8 && showLabels ? riskCounts.medium : ""}
          </div>
        )}
        
        {/* Low risk - green */}
        {lowPercent > 0 && (
          <div 
            className="bg-green-500 h-full flex items-center justify-center text-[10px] text-white font-medium"
            style={{ width: `${lowPercent}%` }}
          >
            {lowPercent > 8 && showLabels ? riskCounts.low : ""}
          </div>
        )}
        
        {/* Unknown risk - blue */}
        {unknownPercent > 0 && (
          <div 
            className="bg-blue-500 h-full flex items-center justify-center text-[10px] text-white font-medium"
            style={{ width: `${unknownPercent}%` }}
          >
            {unknownPercent > 8 && showLabels ? riskCounts.unknown : ""}
          </div>
        )}
      </div>
      
      {/* Legend */}
      {showLabels && (
        <div className="flex items-center justify-between text-xs text-muted-foreground w-full pt-1">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
            <span>High: {riskCounts.high}</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-orange-400 rounded-full mr-1"></div>
            <span>Medium: {riskCounts.medium}</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
            <span>Low: {riskCounts.low}</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
            <span>Unknown: {riskCounts.unknown}</span>
          </div>
        </div>
      )}
    </div>
  );
} 