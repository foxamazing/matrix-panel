import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { cn } from "../../lib/utils";

interface StockInfo {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
}

const MOCK_STOCKS: StockInfo[] = [
    { symbol: "AAPL", name: "Apple Inc.", price: 185.92, change: 1.24, changePercent: 0.67 },
    { symbol: "NVDA", name: "NVIDIA Corp.", price: 822.79, change: 35.12, changePercent: 4.46 },
    { symbol: "TSLA", name: "Tesla, Inc.", price: 202.64, change: -4.32, changePercent: -2.09 },
    { symbol: "MSFT", name: "Microsoft", price: 415.50, change: 2.10, changePercent: 0.51 }
];

export default function StocksWidget({ className }: { className?: string }) {
    const [stocks, setStocks] = useState<StockInfo[]>(MOCK_STOCKS);
    const [loading, setLoading] = useState(false);

    const refresh = () => {
        setLoading(true);
        setTimeout(() => {
            setStocks(prev => prev.map(s => ({
                ...s,
                price: s.price + (Math.random() * 2 - 1),
                change: s.change + (Math.random() * 0.5 - 0.25),
                changePercent: s.changePercent + (Math.random() * 0.2 - 0.1)
            })));
            setLoading(false);
        }, 800);
    };

    useEffect(() => {
        const interval = setInterval(refresh, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={cn(
            "flex flex-col h-full w-full rounded-2xl overflow-hidden transition-all duration-300",
            "bg-white/10 backdrop-blur-md border border-white/20 shadow-xl",
            className
        )}>
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-white font-medium text-sm">股票行情</h3>
                </div>
                <button onClick={refresh} className={cn("p-1 hover:bg-white/10 rounded-lg text-white/40 transition-all", loading && "animate-spin opacity-40")}>
                    <RefreshCw className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                <div className="space-y-1">
                    {stocks.map((stock) => (
                        <div key={stock.symbol} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-all">
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-white leading-tight">{stock.symbol}</span>
                                <span className="text-[10px] text-white/40 truncate w-24">{stock.name}</span>
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <span className="text-sm font-mono text-white/90 font-medium">${stock.price.toFixed(2)}</span>
                                <div className={cn(
                                    "flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded",
                                    stock.change >= 0 ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10"
                                )}>
                                    {stock.change >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                                    <span>{Math.abs(stock.changePercent).toFixed(2)}%</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
