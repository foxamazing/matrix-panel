import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Landmark, ArrowRightLeft, RotateCw, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Hooks
import { useConfig } from '../providers/ConfigProvider';

// 全球主要币种中文字典
const CURRENCY_NAME_MAP: Record<string, string> = {
    CNY: '人民币', USD: '美元', EUR: '欧元', JPY: '日元', HKD: '港元',
    GBP: '英镑', AUD: '澳元', CAD: '加元', CHF: '瑞士法郎', SGD: '新加坡元',
    TWD: '新台币', KRW: '韩元', THB: '泰铢', MOP: '澳门元', MYR: '林吉特',
    IDR: '印尼盾', PHP: '比索', VND: '越南盾', NZD: '新西兰元', RUB: '卢布',
    BRL: '雷亚尔', INR: '卢比', ZAR: '兰特', TRY: '里拉', AED: '迪拉姆',
    MXN: '墨西哥比索', SAR: '沙特里亚尔', KWD: '科威特第纳尔',
    BHD: '巴林第纳尔', OMR: '阿曼里亚尔', JOD: '约旦第纳尔',
    SEK: '瑞典克朗', NOK: '挪威克朗', DKK: '丹麦克朗', PLZ: '波兰兹罗提',
    HUF: '匈牙利福林', CZK: '捷克克朗', ILS: '谢克尔', CLP: '智利比索',
    EGP: '埃及镑',
};

const CACHE_KEY = 'exchange_rates_cache';
const CACHE_TIME = 60 * 60 * 1000; // 1 小时

interface Rates {
    [key: string]: number;
}

const ExchangeRateWidget: React.FC = () => {
    const { config } = useConfig();
    const [rates, setRates] = useState<Rates | null>(null);
    const [amount, setAmount] = useState<number>(1);
    const [from, setFrom] = useState('USD');
    const [to, setTo] = useState('CNY');
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState<'from' | 'to' | null>(null);

    const isPixelMode = config.isPixelMode;
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchRates = useCallback(async (force = false) => {
        setIsRefreshing(true);
        if (!force) {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const { data, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < CACHE_TIME) {
                    setRates(data);
                    setLoading(false);
                    setIsRefreshing(false);
                    return;
                }
            }
        }

        try {
            const res = await fetch('https://open.er-api.com/v6/latest/CNY');
            const json = await res.json();
            if (json && json.rates) {
                setRates(json.rates);
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    data: json.rates,
                    timestamp: Date.now()
                }));
            }
        } catch (error) {
            console.error('Failed to fetch exchange rates:', error);
        } finally {
            setLoading(false);
            setTimeout(() => setIsRefreshing(false), 600);
        }
    }, []);

    useEffect(() => {
        fetchRates();
    }, [fetchRates]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const result = useMemo(() => {
        if (!rates || !rates[from] || !rates[to]) return 0;
        return (amount / rates[from]) * rates[to];
    }, [amount, from, to, rates]);

    const sortedCurrencies = useMemo(() => {
        if (!rates) return [];
        return Object.keys(rates).sort((a, b) => {
            if (a === 'CNY') return -1;
            if (b === 'CNY') return 1;
            if (a === 'USD') return -1;
            if (b === 'USD') return 1;
            const nameA = CURRENCY_NAME_MAP[a] || a;
            const nameB = CURRENCY_NAME_MAP[b] || b;
            return nameA.localeCompare(nameB, 'zh-CN');
        });
    }, [rates]);

    const containerClass = `h-full w-full p-1 select-none flex flex-col ${isPixelMode ? 'font-pixel' : 'font-sans'}`;

    const CustomSelect = ({ value, onChange, type }: { value: string, onChange: (val: string) => void, type: 'from' | 'to' }) => (
        <div className="flex-1 relative">
            <button
                onClick={() => setDropdownOpen(dropdownOpen === type ? null : type)}
                className="w-full bg-black/20 hover:bg-black/40 text-[9px] font-bold text-adaptive rounded-lg p-1 border border-white/5 flex items-center justify-between transition-all"
            >
                <span className="truncate">{CURRENCY_NAME_MAP[value] || value}</span>
                <ChevronDown size={8} className={`opacity-40 transition-transform ${dropdownOpen === type ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {dropdownOpen === type && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 3 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute left-0 right-0 z-50 glass-panel border border-white/10 rounded-xl max-h-[140px] overflow-y-auto scrollbar-none shadow-2xl"
                    >
                        <div className="p-1">
                            {sortedCurrencies.map(code => (
                                <button
                                    key={code}
                                    onClick={() => {
                                        onChange(code);
                                        setDropdownOpen(null);
                                    }}
                                    className={`w-full text-left p-1.5 rounded-lg text-[9px] font-bold transition-all ${value === code ? 'bg-theme text-white' : 'text-adaptive hover:bg-white/10'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{CURRENCY_NAME_MAP[code] || code}</span>
                                        <span className="opacity-30 text-[7px]">{code}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    return (
        <div className={containerClass} ref={dropdownRef}>
            <div className="h-full w-full rounded-2xl glass-panel p-3 flex flex-col shadow-2xl transition-all duration-500 relative overflow-hidden group">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <Landmark size={11} className="text-theme shrink-0 opacity-70" />
                        <span className="text-[9px] font-black text-adaptive opacity-40 tracking-widest uppercase truncate">
                            汇率换算
                        </span>
                    </div>
                    <button
                        onClick={() => fetchRates(true)}
                        disabled={isRefreshing}
                        className={`p-1 hover:bg-[var(--glass-bg-hover)] rounded-lg text-theme transition-all active:scale-90 ${isRefreshing ? 'animate-spin opacity-50' : ''}`}
                    >
                        <RotateCw size={10} />
                    </button>
                </div>

                <div className="flex-1 flex flex-col justify-center space-y-3">
                    <div className="relative">
                        <input
                            type="number"
                            value={amount || ''}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="w-full bg-white/5 border border-white/5 focus:border-theme/30 focus:ring-1 focus:ring-theme/10 rounded-lg py-1.5 px-3 text-[13px] font-black text-adaptive outline-none transition-all placeholder:opacity-20 translate-z-0"
                            placeholder="金额..."
                        />
                    </div>

                    <div className="flex items-center gap-1.5">
                        <CustomSelect value={from} onChange={setFrom} type="from" />
                        <ArrowRightLeft size={10} className="opacity-20 shrink-0" />
                        <CustomSelect value={to} onChange={setTo} type="to" />
                    </div>

                    <div className="text-center pt-2">
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div key="loading" className="flex justify-center p-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-theme animate-ping" />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key={`${from}-${to}-${amount}`}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center"
                                >
                                    <div className="text-[18px] font-black text-theme tracking-tighter truncate max-w-full drop-shadow-sm">
                                        {result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                    <div className="text-[9px] font-bold text-adaptive opacity-30 uppercase tracking-widest mt-0.5">
                                        {CURRENCY_NAME_MAP[to] || to}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="mt-1 flex justify-between items-end shrink-0 pt-0.5 border-t border-white/5">
                    <span className="text-[5px] font-bold text-adaptive opacity-10 tracking-tight">
                        更新: {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[5px] font-bold text-adaptive opacity-10 tracking-tight uppercase">
                        {from} / {to}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ExchangeRateWidget;
