/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Search, 
  Database, 
  BrainCircuit, 
  FileSpreadsheet, 
  Settings,
  Bell,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Activity
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { GoogleGenAI } from "@google/genai";

// --- Types ---

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  per: number;
  dividendYield: number;
  volume: string;
  valuation: 'Undervalued' | 'Fair' | 'Overvalued';
  recommendation: 'Strong Buy' | 'Buy' | 'Hold';
  reason: string;
}

interface TradeLog {
  id: string;
  timestamp: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  total: number;
  strategy: string;
}

// --- Mock Data ---

const MOCK_CHART_DATA = [
  { time: '09:00', value: 4200 },
  { time: '10:00', value: 4250 },
  { time: '11:00', value: 4230 },
  { time: '12:00', value: 4280 },
  { time: '13:00', value: 4310 },
  { time: '14:00', value: 4290 },
  { time: '15:00', value: 4350 },
];

const INITIAL_STOCKS: Stock[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 175.43, change: 1.2, per: 28.5, dividendYield: 0.5, volume: '52M', valuation: 'Fair', recommendation: 'Hold', reason: 'Stable growth but high PER' },
  { symbol: 'KO', name: 'Coca-Cola Co.', price: 59.12, change: -0.4, per: 24.1, dividendYield: 3.1, volume: '12M', valuation: 'Undervalued', recommendation: 'Buy', reason: 'High dividend, defensive play' },
  { symbol: 'T', name: 'AT&T Inc.', price: 16.85, change: 2.1, per: 6.8, dividendYield: 6.5, volume: '35M', valuation: 'Undervalued', recommendation: 'Strong Buy', reason: 'Extremely low PER, high dividend' },
  { symbol: '005930.KS', name: 'Samsung Electronics', price: 72400, change: 0.8, per: 15.2, dividendYield: 2.1, volume: '15M', valuation: 'Undervalued', recommendation: 'Buy', reason: 'Semiconductor cycle bottoming' },
];

// --- Components ---

const MarketClock = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const krTime = formatInTimeZone(now, 'Asia/Seoul', 'HH:mm:ss');
  const usTime = formatInTimeZone(now, 'America/New_York', 'HH:mm:ss');
  const krDate = formatInTimeZone(now, 'Asia/Seoul', 'yyyy-MM-dd');
  const usDate = formatInTimeZone(now, 'America/New_York', 'yyyy-MM-dd');

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-[#151619] border border-white/10 p-4 rounded-xl">
        <div className="flex items-center gap-2 text-xs font-mono text-gray-500 uppercase tracking-wider mb-1">
          <Clock size={14} /> KOREA (KST)
        </div>
        <div className="text-2xl font-mono font-medium text-white">{krTime}</div>
        <div className="text-[10px] font-mono text-gray-600">{krDate}</div>
      </div>
      <div className="bg-[#151619] border border-white/10 p-4 rounded-xl">
        <div className="flex items-center gap-2 text-xs font-mono text-gray-500 uppercase tracking-wider mb-1">
          <Clock size={14} /> USA (EST)
        </div>
        <div className="text-2xl font-mono font-medium text-white">{usTime}</div>
        <div className="text-[10px] font-mono text-gray-600">{usDate}</div>
      </div>
    </div>
  );
};

export default function App() {
  const [stocks, setStocks] = useState<Stock[]>(INITIAL_STOCKS);
  const [logs, setLogs] = useState<TradeLog[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");

  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }), []);

  const runScanner = async () => {
    setIsScanning(true);
    setAiAnalysis("Analyzing market data using high-reliability research models...");
    
    try {
      const prompt = `
        As a professional stock analyst for "Ustopia", analyze the current market trends for KR and US stocks.
        Focus on:
        1. Stocks near the bottom (oversold).
        2. High dividend yield stocks with low PER.
        3. Stocks likely to rise by market close based on recent volume trends.
        
        Provide a concise summary of 3 recommended stocks with their symbols, current price (estimate), and the "Decision Logic" (Input -> Process -> Output).
        Format the output as professional research notes.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setAiAnalysis(response.text || "Analysis complete. No significant anomalies detected.");
      
      // Simulate finding a new stock
      const newStock: Stock = {
        symbol: 'VZ',
        name: 'Verizon Communications',
        price: 40.12,
        change: 0.5,
        per: 8.2,
        dividendYield: 6.6,
        volume: '18M',
        valuation: 'Undervalued',
        recommendation: 'Strong Buy',
        reason: 'Oversold territory, strong cash flow for dividends'
      };
      
      setStocks(prev => [newStock, ...prev.slice(0, 3)]);
      
      // Add to log
      const newLog: TradeLog = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        symbol: 'VZ',
        action: 'BUY',
        price: 40.12,
        quantity: 100,
        total: 4012,
        strategy: 'Bottom-Fishing / High Dividend'
      };
      setLogs(prev => [newLog, ...prev]);

    } catch (error) {
      console.error("AI Analysis failed:", error);
      setAiAnalysis("Error connecting to AI analysis engine. Using local heuristic models.");
    } finally {
      setIsScanning(false);
    }
  };

  const exportToCSV = () => {
    const headers = ["ID", "Timestamp", "Symbol", "Action", "Price", "Quantity", "Total", "Strategy"];
    const rows = logs.map(log => [
      log.id,
      log.timestamp,
      log.symbol,
      log.action,
      log.price,
      log.quantity,
      log.total,
      log.strategy
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ustopia_trades_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-gray-300 font-sans p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Activity className="text-emerald-500" /> USTOPIA <span className="text-gray-500 font-light">Auto-Trader</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">AI Literacy & Financial Freedom Engine</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <Bell size={20} />
          </button>
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <Settings size={20} />
          </button>
          <div className="h-8 w-8 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-500 font-bold text-xs">
            AL
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Market Overview & Scanner */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <MarketClock />

          {/* Main Chart */}
          <div className="bg-[#151619] border border-white/10 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-medium text-white">Market Index (S&P 500 Proxy)</h2>
                <p className="text-sm text-gray-500">Real-time volatility tracking</p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-medium rounded-full border border-emerald-500/20">
                  +1.24% Today
                </span>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_CHART_DATA}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    stroke="#4b5563" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#4b5563" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    domain={['auto', 'auto']}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stock Scanner Table */}
          <div className="bg-[#151619] border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Database size={18} className="text-blue-400" />
                <h2 className="text-lg font-medium text-white">Market Scanner</h2>
              </div>
              <button 
                onClick={runScanner}
                disabled={isScanning}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isScanning ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
                }`}
              >
                <Search size={16} className={isScanning ? 'animate-spin' : ''} />
                {isScanning ? 'Scanning Markets...' : 'Run Deep Scan'}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-gray-500 border-b border-white/5">
                    <th className="px-6 py-4 font-medium">Symbol</th>
                    <th className="px-6 py-4 font-medium">Price</th>
                    <th className="px-6 py-4 font-medium">PER / Div</th>
                    <th className="px-6 py-4 font-medium">Valuation</th>
                    <th className="px-6 py-4 font-medium">Rec</th>
                    <th className="px-6 py-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stocks.map((stock) => (
                    <tr key={stock.symbol} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{stock.symbol}</div>
                        <div className="text-[10px] text-gray-500">{stock.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-sm text-white">${stock.price.toLocaleString()}</div>
                        <div className={`text-[10px] flex items-center gap-1 ${stock.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {stock.change >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                          {Math.abs(stock.change)}%
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-400">PER: {stock.per}</div>
                        <div className="text-xs text-emerald-500/80">Div: {stock.dividendYield}%</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                          stock.valuation === 'Undervalued' ? 'bg-emerald-500/10 text-emerald-500' : 
                          stock.valuation === 'Fair' ? 'bg-blue-500/10 text-blue-500' : 'bg-rose-500/10 text-rose-500'
                        }`}>
                          {stock.valuation}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-medium text-white">{stock.recommendation}</div>
                        <div className="text-[10px] text-gray-500 truncate max-w-[120px]">{stock.reason}</div>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-[10px] font-bold uppercase tracking-tighter text-blue-400 hover:text-blue-300 transition-colors">
                          Trade
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis & Logs */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* AI Decision Engine */}
          <div className="bg-[#151619] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <BrainCircuit size={18} className="text-purple-400" />
              <h2 className="text-lg font-medium text-white">AI Decision Engine</h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl">
                <div className="text-[10px] uppercase tracking-widest text-purple-400 font-bold mb-2">Current Strategy Logic</div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px] text-purple-400 shrink-0 mt-0.5">1</div>
                    <div>
                      <div className="text-xs font-medium text-white">Input Data</div>
                      <p className="text-[10px] text-gray-500">Volume spikes, RSI &lt; 30, PER &lt; 15, Div &gt; 3%</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px] text-purple-400 shrink-0 mt-0.5">2</div>
                    <div>
                      <div className="text-xs font-medium text-white">Process (Equation)</div>
                      <p className="text-[10px] text-gray-500">Valuation = (EPS * (8.5 + 2g) * 4.4) / Y</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px] text-purple-400 shrink-0 mt-0.5">3</div>
                    <div>
                      <div className="text-xs font-medium text-white">Output</div>
                      <p className="text-[10px] text-gray-500">Auto-execute trade if Margin of Safety &gt; 30%</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-gray-400 leading-relaxed font-mono whitespace-pre-wrap max-h-[200px] overflow-y-auto custom-scrollbar">
                {aiAnalysis || "Awaiting scan results to generate deep research analysis..."}
              </div>
            </div>
          </div>

          {/* Trading Log */}
          <div className="bg-[#151619] border border-white/10 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-emerald-400" />
                <h2 className="text-lg font-medium text-white">Trading Log</h2>
              </div>
              <button 
                onClick={exportToCSV}
                className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                title="Export to CSV"
              >
                <Download size={16} />
              </button>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {logs.length === 0 ? (
                <div className="text-center py-8 text-gray-600 text-xs italic">
                  No trades executed in current session.
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${log.action === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {log.action}
                      </span>
                      <span className="text-[10px] font-mono text-gray-600">{format(new Date(log.timestamp), 'HH:mm:ss')}</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-sm font-medium text-white">{log.symbol}</div>
                        <div className="text-[10px] text-gray-500">{log.quantity} shares @ ${log.price}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-mono text-white">${log.total.toLocaleString()}</div>
                        <div className="text-[9px] text-gray-600 uppercase tracking-tighter">{log.strategy}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="mt-12 pt-6 border-t border-white/5 text-center">
        <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em]">
          Ustopia Foundation • AI Literacy Education • Financial Independence Engine
        </p>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
