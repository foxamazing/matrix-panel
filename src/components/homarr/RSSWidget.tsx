import React, { useState, useEffect } from "react";
import { Rss, ExternalLink, RefreshCw, Clock } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { cn } from "../../lib/utils";

dayjs.extend(relativeTime);

interface RSSItem {
    id: string;
    title: string;
    link: string;
    pubDate: string;
    description?: string;
    source?: string;
}

interface RSSWidgetProps {
    className?: string;
    feedUrls?: string[];
    refreshInterval?: number; // minutes
}

const MOCK_FEEDS: RSSItem[] = [
    {
        id: "1",
        title: "探索未来：SpaceX 成功发射最新型号星舰",
        link: "https://example.com/spacex",
        pubDate: new Date().toISOString(),
        description: "在今天的试飞中，SpaceX 的最新型号星舰展示了惊人的稳定性和可重复使用能力。",
        source: "科技日报"
    },
    {
        id: "2",
        title: "全球经济展望：2026年增长预期上调",
        link: "https://example.com/economy",
        pubDate: dayjs().subtract(2, "hour").toISOString(),
        description: "国际货币基金组织发布最新报告，预计全球经济将在今年下半年迎来强劲复苏。",
        source: "财经时报"
    },
    {
        id: "3",
        title: "人工智能新突破：多模态大模型实现准人类级别逻辑推理",
        link: "https://example.com/ai-news",
        pubDate: dayjs().subtract(5, "hour").toISOString(),
        description: "研究人员宣布，新一代大模型在数学证明和逻辑竞赛中表现出了极高的准确度率。",
        source: "AI 观察"
    },
    {
        id: "4",
        title: "环保新篇章：新型固态电池技术进入量产阶段",
        link: "https://example.com/energy",
        pubDate: dayjs().subtract(1, "day").toISOString(),
        description: "这种新型电池比传统锂电池能量密度提高一倍，且更加安全和环保。",
        source: "绿色科技"
    }
];

export default function RSSWidget({
    className,
    feedUrls = [],
    refreshInterval = 30
}: RSSWidgetProps) {
    const [items, setItems] = useState<RSSItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const fetchFeeds = async () => {
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        setItems(MOCK_FEEDS);
        setLastUpdated(new Date());
        setLoading(false);
    };

    useEffect(() => {
        fetchFeeds();

        if (refreshInterval > 0) {
            const interval = setInterval(fetchFeeds, refreshInterval * 60 * 1000);
            return () => clearInterval(interval);
        }
    }, [refreshInterval]);

    return (
        <div className={cn(
            "flex flex-col h-full w-full rounded-2xl overflow-hidden transition-all duration-300",
            "bg-white/10 backdrop-blur-md border border-white/20 shadow-xl",
            className
        )}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-orange-500/20 rounded-lg">
                        <Rss className="w-4 h-4 text-orange-400" />
                    </div>
                    <h3 className="text-white font-medium text-sm">RSS 订阅</h3>
                </div>

                <button
                    onClick={fetchFeeds}
                    disabled={loading}
                    className={cn(
                        "p-1.5 hover:bg-white/10 text-white/60 rounded-lg transition-all",
                        loading && "animate-spin opacity-40 pointer-events-none"
                    )}
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                {loading && items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center gap-2 opacity-40">
                        <RefreshCw className="w-8 h-8 animate-spin" />
                        <span className="text-xs text-white">正在获取资讯...</span>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {items.map((item) => (
                            <a
                                key={item.id}
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex flex-col gap-1.5 p-4 hover:bg-white/5 transition-colors relative"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <h4 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
                                        {item.title}
                                    </h4>
                                    <ExternalLink className="w-3.5 h-3.5 text-white/20 group-hover:text-white/40 shrink-0 mt-0.5" />
                                </div>

                                {item.description && (
                                    <p className="text-xs text-white/50 line-clamp-2 leading-normal">
                                        {item.description}
                                    </p>
                                )}

                                <div className="flex items-center gap-3 text-[10px] text-white/40">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {dayjs(item.pubDate).fromNow()}
                                    </span>
                                    {item.source && (
                                        <span className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10">
                                            {item.source}
                                        </span>
                                    )}
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-black/20 border-t border-white/5 flex justify-between items-center">
                <span className="text-[10px] text-white/30 italic">
                    上次更新: {dayjs(lastUpdated).format("HH:mm:ss")}
                </span>
                <div className="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
            </div>
        </div>
    );
}
