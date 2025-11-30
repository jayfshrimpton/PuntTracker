import { cn } from '@/lib/utils';

interface BetTypeStats {
    type: string;
    count: number;
    strikeRate: number;
    roi: number;
    profit: number;
}

interface BetTypeBreakdownProps {
    data: BetTypeStats[];
    className?: string;
}

export function BetTypeBreakdown({ data, className }: BetTypeBreakdownProps) {
    const maxProfit = Math.max(...data.map(d => Math.abs(d.profit)));

    return (
        <div className={cn("space-y-4", className)}>
            <h3 className="text-sm font-medium text-muted-foreground">Performance by Bet Type</h3>
            <div className="space-y-3">
                {data.map((item) => (
                    <div key={item.type} className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium">{item.type}</span>
                            <span className={cn(
                                "font-bold",
                                item.profit >= 0 ? "text-green-500" : "text-red-500"
                            )}>
                                {item.profit >= 0 ? '+' : ''}{item.profit.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{item.count} bets</span>
                            <span>•</span>
                            <span>{item.strikeRate}% SR</span>
                            <span>•</span>
                            <span>{item.roi}% ROI</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden flex">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-500",
                                    item.profit >= 0 ? "bg-green-500" : "bg-red-500"
                                )}
                                style={{
                                    width: `${(Math.abs(item.profit) / maxProfit) * 100}%`,
                                    opacity: 0.8
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
