import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
import { formatCurrency, formatPercent } from './portolioCalculation';

interface Holding {
    symbol: string;
    sharesHeld: number;
    avgCostBasis: number;
    currentPrice: number;
    marketValue: number;
    unrealizedGainLoss: number;
    unrealizedGainLossPercent: number;
}

interface PortfolioSummary {
    totalValue: number;
    totalGainLoss: number;
    totalGainLossPercent: number;
    topPerformer: Holding | null;
    worstPerformer: Holding | null;
    uniqueSymbols: number;
}

interface SummaryProps {
    summary: PortfolioSummary;
}

export function Summary({ summary }: SummaryProps) {
    const isPositive = summary.totalGainLoss >= 0;
    
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(summary.totalValue)}</div>
                    <p className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercent(summary.totalGainLossPercent)} all time
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
                    {isPositive ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(summary.totalGainLoss)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {formatPercent(summary.totalGainLossPercent)}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Best Performer</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    {summary.topPerformer ? (
                        <>
                            <div className="text-2xl font-bold">{summary.topPerformer.symbol}</div>
                            <p className="text-xs text-green-600">
                                {formatPercent(summary.topPerformer.unrealizedGainLossPercent)}
                            </p>
                        </>
                    ) : (
                        <div className="text-2xl font-bold text-muted-foreground">-</div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Worst Performer</CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                    {summary.worstPerformer ? (
                        <>
                            <div className="text-2xl font-bold">{summary.worstPerformer.symbol}</div>
                            <p className="text-xs text-red-600">
                                {formatPercent(summary.worstPerformer.unrealizedGainLossPercent)}
                            </p>
                        </>
                    ) : (
                        <div className="text-2xl font-bold text-muted-foreground">-</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}