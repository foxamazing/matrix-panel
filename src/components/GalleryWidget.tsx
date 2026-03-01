import React, { useState, useCallback } from 'react';
import { Image as ImageIcon, RotateCw, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Hooks
import { useConfig } from '../providers/ConfigProvider';

const GalleryWidget: React.FC = () => {
    const { config } = useConfig();
    const [seed, setSeed] = useState(Date.now());
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // 使用 Picsum 获取随机图片，尺寸设为 400x400 以保证清晰度
    const imageUrl = `https://picsum.photos/seed/${seed}/400/400`;

    const refreshImage = useCallback(() => {
        setIsRefreshing(true);
        setIsLoaded(false);
        setSeed(Date.now());
        // 模拟刷新动画的时间，确保旋转图标转完
        setTimeout(() => setIsRefreshing(false), 800);
    }, []);

    const isPixelMode = config.isPixelMode;
    const containerClass = `h-full w-full p-1 select-none flex flex-col ${isPixelMode ? 'font-pixel' : 'font-sans'}`;

    return (
        <div className={containerClass}>
            <div className="flex-1 rounded-2xl glass-panel relative overflow-hidden group shadow-2xl transition-all duration-500">

                {/* Background Image Layer */}
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={seed}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.6 }}
                        className="absolute inset-0"
                    >
                        <img
                            src={imageUrl}
                            alt="Random"
                            className={`w-full h-full object-cover transition-all duration-700 ${isLoaded ? 'blur-0 scale-100' : 'blur-xl scale-110'}`}
                            onLoad={() => setIsLoaded(true)}
                        />
                        {/* Overlay Gradient for contrast */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
                    </motion.div>
                </AnimatePresence>

                {/* UI Overlay */}
                <div className="absolute inset-0 p-3 flex flex-col justify-between z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
                            <ImageIcon size={10} className="text-white" />
                            <span className="text-[9px] font-black text-white tracking-widest uppercase">图库</span>
                        </div>

                        <button
                            onClick={refreshImage}
                            disabled={isRefreshing}
                            className={`p-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-white border border-white/10 transition-all active:scale-90 ${isRefreshing ? 'animate-spin opacity-50' : ''}`}
                        >
                            <RotateCw size={12} />
                        </button>
                    </div>

                    <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-white/90 drop-shadow-md">随机灵感</span>
                            <span className="text-[8px] font-medium text-white/50">via Lorem Picsum</span>
                        </div>

                        <a
                            href={imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-white text-white/50"
                        >
                            <ExternalLink size={10} />
                        </a>
                    </div>
                </div>

                {/* Loading Indicator */}
                {!isLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-20">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default GalleryWidget;
