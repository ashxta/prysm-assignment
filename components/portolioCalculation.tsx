interface Trade {
    symbol: string;
    shares: number;
    price: number;
    date: string;
}

export interface Holding {
  symbol: string;
  sharesHeld: number;
  avgCostBasis: number;
  currentPrice: number;
  marketValue: number,
  unrealizedGainLoss: number;
  unrealizedGainLossPercent: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  topPerformer: Holding | null;
  worstPerformer: Holding | null;
  uniqueSymbols: number;
}

export interface PortfolioHistoryPoint {
  date: string;
  value: number;
}

const MOCK_PRICES: Record<string, number> = {
  AAPL: 175.50,
  TSLA: 230.20,
  GOOGL: 142.80,
  MSFT: 378.90,
  AMZN: 144.30,
  NVDA: 495.20,
  META: 501.80,
  NFLX: 425.60,
  TQQQ: 65.40,
  SPY: 458.20,
};

export function getCurrentPrice(symbol: string): number {
  return MOCK_PRICES[symbol] || Math.random() * 100 + 50;
}

export function calculateHoldings(trades: Trade[]): Holding[]{
  const holdingsMap = new Map<string, { totalShares: number; totalCost: number; trades: Trade[] }>();

  trades.forEach(trade => {
    const existing = holdingsMap.get(trade.symbol);
    if (existing) {
      existing.totalShares += trade.shares;
      existing.totalCost += trade.shares * trade.price;
      existing.trades.push(trade);
    } else {
      holdingsMap.set(trade.symbol, {
        totalShares: trade.shares,
        totalCost: trade.shares * trade.price,
        trades: [trade]
      });
    }
  });

  return Array.from(holdingsMap.entries())
    .filter(([, data]) => data.totalShares > 0) // Only show positions with shares > 0
    .map(([symbol, data]) => {
      const avgCostBasis = data.totalCost / data.totalShares;
      const currentPrice = getCurrentPrice(symbol);
      const marketValue = data.totalShares * currentPrice;
      const unrealizedGainLoss = marketValue - (data.totalShares * avgCostBasis);
      const unrealizedGainLossPercent = (unrealizedGainLoss / (data.totalShares * avgCostBasis)) * 100;

      return {
        symbol,
        sharesHeld: data.totalShares,
        avgCostBasis,
        currentPrice,
        marketValue,
        unrealizedGainLoss,
        unrealizedGainLossPercent
      };
    });
}

export function calculatePortfolioSummary(holdings: Holding[]): PortfolioSummary {
  const totalValue = holdings.reduce((sum, holding) => sum + holding.marketValue, 0);
  const totalGainLoss = holdings.reduce((sum, holding) => sum + holding.unrealizedGainLoss, 0);
  const totalCost = totalValue - totalGainLoss;
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

  let topPerformer = holdings[0] || null;
  let worstPerformer = holdings[0] || null;

  holdings.forEach(holding => {
    if (holding.unrealizedGainLossPercent > (topPerformer?.unrealizedGainLossPercent || -Infinity)) {
      topPerformer = holding;
    }
    if (holding.unrealizedGainLossPercent < (worstPerformer?.unrealizedGainLossPercent || Infinity)) {
      worstPerformer = holding;
    }
  });

  return {
    totalValue,
    totalGainLoss,
    totalGainLossPercent,
    topPerformer,
    worstPerformer,
    uniqueSymbols: holdings.length
  };
}

export function generatePortfolioHistory(trades: Trade[]): PortfolioHistoryPoint[] {
  const sortedTrades = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const history: PortfolioHistoryPoint[] = [];
  const holdingsMap = new Map<string, { shares: number; totalCost: number }>();

  sortedTrades.forEach(trade => {
    const existing = holdingsMap.get(trade.symbol);
    if (existing) {
      existing.shares += trade.shares;
      existing.totalCost += trade.shares * trade.price;
    } else {
      holdingsMap.set(trade.symbol, {
        shares: trade.shares,
        totalCost: trade.shares * trade.price
      });
    }

    // Calculate portfolio value at this point in time
    let totalValue = 0;
    holdingsMap.forEach((data, symbol) => {
      if (data.shares > 0) {
        totalValue += data.shares * getCurrentPrice(symbol);
      }
    });

    history.push({
      date: trade.date,
      value: totalValue
    });
  });

  return history;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(percent: number): string {
  return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
}
