import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search,} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { formatCurrency, formatPercent } from './portolioCalculation';

interface Holding {
    symbol: string;
    sharesHeld: number;
    avgCostBasis: number;
    currentPrice: number;
    marketValue: number,
    unrealizedGainLoss: number;
    unrealizedGainLossPercent: number;
}

interface HoldingsTableProps {
  holdings: Holding[];
}

type SortField = keyof Holding;
type SortDirection = 'asc' | 'desc'

export function TableCard({ holdings }: HoldingsTableProps){
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('marketValue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const filteredAndSortedHoldings = useMemo(() => {
    const filtered = holdings.filter(
      (holding) =>
        holding.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      } else {
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        return sortDirection === 'asc' 
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      }
    });

    return filtered;
  }, [holdings, searchTerm, sortField, sortDirection]);

  const paginatedHoldings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedHoldings.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedHoldings, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedHoldings.length / itemsPerPage);

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      onClick={() => handleSort(field)}
      className="h-auto p-0 font-medium hover:bg-transparent"
    >
      <span className="flex items-center gap-1">
        {children}
        {sortField === field ? (
          sortDirection === 'asc' ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )
        ) : (
          <div className="w-3" />
        )}
      </span>
    </Button>
  );
  return (
    <Card className="shadow-[var(--shadow-card)]">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>Holdings</CardTitle>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search symbols..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortButton field="symbol">Symbol</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="sharesHeld">Shares</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="avgCostBasis">Avg Cost</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="currentPrice">Current Price</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="marketValue">Market Value</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="unrealizedGainLoss">Gain/Loss</SortButton>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedHoldings.map((holding) => (
                <TableRow key={holding.symbol}>
                  <TableCell className="font-medium">{holding.symbol}</TableCell>
                  <TableCell>{holding.sharesHeld.toFixed(2)}</TableCell>
                  <TableCell>{formatCurrency(holding.avgCostBasis)}</TableCell>
                  <TableCell>{formatCurrency(holding.currentPrice)}</TableCell>
                  <TableCell>{formatCurrency(holding.marketValue)}</TableCell>
                  <TableCell>
                    <div className={holding.unrealizedGainLoss >= 0 ? 'text-success' : 'text-loss'}>
                      {formatCurrency(holding.unrealizedGainLoss)}
                      <div className="text-xs">
                        {formatPercent(holding.unrealizedGainLossPercent)}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedHoldings.length)} of {filteredAndSortedHoldings.length} holdings
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
