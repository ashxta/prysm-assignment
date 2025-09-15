import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from './portolioCalculation';

interface Holding {
    symbol: string;
    sharesHeld: number;
    avgCostBasis: number;
    currentPrice: number;
    marketValue: number,
    unrealizedGainLoss: number;
    unrealizedGainLossPercent: number;
}

export interface PortfolioHistoryPoint {
  date: string;
  value: number;
}

interface ChartProps{
    holdings: Holding[];
    portfolioHistory: PortfolioHistoryPoint[];
}

interface PieChartData {
    name: string;
    value: number;
    color: string;
}

interface LineChartData {
    date: string;
    value: number;
}

interface TooltipData {
    name: string;
    value: number;
}

interface TooltipProps {
    active?: boolean;
    payload?: Array<{ value: number; payload?: TooltipData }>;
    label?: string;
}

const CHART_COLORS = [
  'hsl(262.1 83.3% 57.8%)', 
  'hsl(142.1 76.2% 36.3%)',
  'hsl(32.6 75.8% 59%)', 
  'hsl(0 84.2% 60.2%)', 
  'hsl(220 8.9% 46.1%)',
  'hsl(262.1 83.3% 67.8%)', 
  'hsl(142.1 76.2% 46.3%)',
  'hsl(32.6 85% 69%)', 
];

export function Charts({holdings,portfolioHistory}: ChartProps){
    const pieChartData: PieChartData[] = holdings.map((holding, index)=>({
        name: holding.symbol,
        value: holding.marketValue,
        color: CHART_COLORS[index % CHART_COLORS.length],
    }));

    const lineChartData: LineChartData[] = portfolioHistory.map(point=>({
        date: new Date(point.date).toLocaleDateString('en-US',{ month:'short',day:'numeric'}),
        value: point.value,
    }));

    const LineChartTooltip = ({active, payload, label}: TooltipProps)=>{
        if (active && payload && payload.length) {
            return (
                <div className="bg-card border rounded-lg p-3 shadow-lg">
                    <p className="font-medium">{`${label}`}</p>
                    <p className="text-primary">
                        {`Value: ${formatCurrency(payload[0].value)}`}
                    </p>
                </div>
            );
        }
        return null;
    };

    const PieChartTooltip = ({active, payload }: TooltipProps) => {
        if (active && payload && payload.length && payload[0].payload) {
            const data = payload[0].payload;
            return (
                <div className="bg-card border rounded-lg p-3 shadow-lg">
                    <p className="font-medium">{data.name}</p>
                    <p className="text-primary">
                        {`Value: ${formatCurrency(data.value)}`}
                    </p>
                </div>
            );
        }
        return null;
    };

const renderCustomLabel = ({ name, value }: { name?: string; value?: number }) => {
  if (!name || value === undefined) {
    return '';
  }
  const total = pieChartData.reduce((sum,item)=>sum+item.value,0);
  const percent = ((value / total) * 100).toFixed(1);
  return `${name} ${percent}%`;
};

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Portfolio Allocation</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieChartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={renderCustomLabel}
                                outerRadius={80}
                                dataKey="value"
                            >
                                {pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={PieChartTooltip} />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Portfolio Value Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={lineChartData}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis 
                                dataKey="date" 
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                            />
                            <YAxis 
                                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                            />
                            <Tooltip content={LineChartTooltip} />
                            <Line 
                                type="monotone" 
                                dataKey="value" 
                                stroke="black" 
                                strokeWidth={2}
                                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}
