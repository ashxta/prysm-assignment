"use client";

import { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import Papa from "papaparse"
import { calculateHoldings, calculatePortfolioSummary, generatePortfolioHistory } from "@/components/portolioCalculation";
import { Summary } from "@/components/summary";
import { Charts } from "@/components/charts";
import { TableCard } from "@/components/table";

export default function Home() {

  const [portfolioData, setPortfolioData] = useState<ParsedCSVData | null>(null);

  interface Trade {
    symbol: string;
    shares: number;
    price: number;
    date: string;
  }

  interface Holding {
    symbol: string;
    sharesHeld: number;
    avgCostBasis: number;
    currentPrice: number;
    marketValue: number,
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

  interface PortfolioHistoryPoint {
    date: string;
    value: number;
  }
  interface ParsedCSVData {
    trades: Trade[];
    holdings: Holding[];
    summary: PortfolioSummary;
    portfolioHistory: PortfolioHistoryPoint[];
  }

  interface CSVRow {
    symbol?: string;
    shares?: string | number;
    price?: string | number;
    date?: string;
    [key: string]: unknown;
  }

  const validateTradeData = (data: CSVRow[]): Trade[] => {
    const trades: Trade[] = [];
    const errors: string[] = [];
    data.forEach((row, index) => {
      if (!row.symbol || !row.shares || !row.price || !row.date) {
        errors.push(`Row ${index + 1}: Missing required fields (symbol, shares, price, date)`);
        return;
      }
      const shares = parseFloat(String(row.shares));
      const price = parseFloat(String(row.price));
      if (isNaN(shares) || isNaN(price)) {
        errors.push(`Row ${index + 1}: Invalid number format for shares or price`);
        return;
      }
      trades.push({
        symbol: row.symbol.toUpperCase(),
        shares,
        price,
        date: row.date
      });
    });
    if (errors.length > 0) {
      throw new Error(errors.join('\n'));
    }
    return trades;
  };

  useEffect(() => {
    const savedData = localStorage.getItem('portfolioData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData) as ParsedCSVData;
        setPortfolioData(parsed);
      } catch (error) {
        console.error('Failed to load saved portfolio data:', error);
        localStorage.removeItem('portfolioData');
      }
    }
  }, []);

  useEffect(()=>{
    if(portfolioData){
      localStorage.setItem('portfolioData',JSON.stringify(portfolioData));
    }
  },[portfolioData])

  function FileUpload(e: React.ChangeEvent<HTMLInputElement>){
    e.preventDefault();
    if (e.target.files?.length) {
      File(e.target.files[0]);
    }
  }

  function Drop(e: React.DragEvent<HTMLDivElement>){
    e.preventDefault();
    if (e.dataTransfer.files.length) {
      File(e.dataTransfer.files[0]);
    }
  }

  function File(file: File){
    Papa.parse<CSVRow>(file,{
      header: true,
      skipEmptyLines: true,
      complete: (response)=>{
        const trades = validateTradeData(response.data);
        console.log(trades);
        const holdings = calculateHoldings(trades);
        const summary = calculatePortfolioSummary(holdings);
        const portfolioHistory = generatePortfolioHistory(trades);

        const parsedData: ParsedCSVData = {
          trades,
          holdings,
          summary,
          portfolioHistory,
        };
        setPortfolioData(parsedData);
        console.log(parsedData);
      }
    })
  }

  function handleReset(){
    setPortfolioData(null);
    localStorage.removeItem('portfolioData');
  }

  if (!portfolioData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-white to-[#80aaff]">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 text-black">Portfolio Tracker</h1>
            <p className="text-xl text-gray-600">
              Upload your CSV file to analyze your stock portfolio performance
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow p-8">
            <h2 className="text-2xl font-semibold mb-2 text-center text-black">
              Upload Your Portfolio CSV
            </h2>
            <div onDrop={Drop} onDragOver={(e) => e.preventDefault()} className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center mb-6 hover:border-gray-400 transition">
              <Upload className="mx-auto h-10 w-10 text-gray-400 mb-3" />
              <p className="text-gray-600">Drag and drop your CSV file here</p>
              <p className="text-gray-500 text-sm my-2">or</p>
              <label className="inline-block px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition cursor-pointer">
              Choose File
              <input type="file" accept=".csv" onChange={FileUpload} className="hidden" />
            </label>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-gradient-to-b from-white to-[#80aaff]">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-[var(--gradient-primary)] bg-clip-text text-transparent">
              Portfolio Tracker
            </h1>
            <button onClick={handleReset} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Upload New CSV
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <Summary summary={portfolioData.summary} />
        <Charts holdings={portfolioData.holdings} portfolioHistory={portfolioData.portfolioHistory}/>
        <TableCard holdings={portfolioData.holdings} />
      </main>

    </div>
  );
}
