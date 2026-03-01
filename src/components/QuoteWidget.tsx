import React, { useState, useEffect, useCallback } from 'react';
import { Quote, RotateCw, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Hooks
import { useConfig } from '../providers/ConfigProvider';

interface QuoteData {
    hitokoto: string;
    from: string;
    from_who: string | null;
}

const QuoteWidget: React.FC = () => {
    const { config } = useConfig();
    const [quote, setQuote] = useState<QuoteData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const isPixelMode = config.isPixelMode;

    const fetchQuote = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const res = await fetch('https://v1.hitokoto.cn/?c=d&c=e&c=f&c=h&c=i');
            const data = await res.json();
            setQuote(data);
        } catch (error) {
            console.error('Failed to fetch quote:', error);
        } finally {
            setLoading(false);
            setTimeout(() => setIsRefreshing(false), 600);
        }
    }, []);

    useEffect(() => {
        fetchQuote();
    }, [fetchQuote]);

    const containerClass = `h-full w-full p-1 select-none flex flex-col ${isPixelMode ? 'font-pixel' : 'font-sans'}`;

    return (
        <div className={containerClass}>
            <div className="flex-1 rounded-2xl glass-panel p-2.5 flex flex-col shadow-2xl transition-all duration-500 relative overflow-hidden group">
                <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <Quote size={12} className="text-theme shrink-0 opacity-70" />
                        <span className="text-[10px] font-black text-adaptive opacity-40 tracking-widest uppercase">
                            一言
                        </span>
                    </div>
                    <button
                        onClick={fetchQuote}
                        disabled={isRefreshing}
                        className={`p-1 hover:bg-[var(--glass-bg-hover)] rounded-lg text-theme transition-all active:scale-90 ${isRefreshing ? 'animate-spin opacity-50' : ''}`}
                    >
                        <RotateCw size={11} />
                    </button>
                </div>

                <div className="flex-1 flex flex-col justify-center min-h-0">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center justify-center p-2"
                            >
                                <div className="w-1 h-1 rounded-full bg-theme animate-ping" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key={quote?.hitokoto}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="flex flex-col gap-2"
                            >
                                <p className="text-[11px] font-bold text-adaptive leading-relaxed tracking-tight text-center italic">
                                    “{quote?.hitokoto}”
                                </p>
                                <div className="flex flex-col items-center">
                                    <span className="text-[8px] font-black text-adaptive opacity-30 truncate max-w-full">
                                        —— {quote?.from_who || ''} 「{quote?.from}」
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 悬浮显示的微小外部链接图标 */}
                <div className="absolute bottom-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink size={8} className="text-adaptive opacity-20" />
                </div>
            </div>
        </div>
    );
};

export default QuoteWidget;
