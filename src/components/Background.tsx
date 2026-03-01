import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '../providers/ThemeProvider';

interface BackgroundProps {
  type: 'image' | 'video';
  image: string | null;
  video: string | null;
  opacity: number;
  blur: number;
  isDarkMode: boolean;
  position?: { x: number; y: number; scale: number };
  isMobile?: boolean;
}

const Background: React.FC<BackgroundProps> = ({ type, image, video, opacity, blur, isDarkMode, position }) => {
  const { themeConfig } = useTheme();
  const { assets } = themeConfig;

  // 1. Safe Parameter Normalization
  const safeOpacity = Number.isFinite(opacity) ? Math.max(0.1, Math.min(1, opacity)) : 1;
  const safeBlur = Number.isFinite(blur) ? Math.max(0, blur) : 0;

  // Position logic (CSS transform based)
  let posX = position?.x ?? 0;
  let posY = position?.y ?? 0;
  const scale = position?.scale ?? 1.05;

  // Constraint logic for dragging bounds
  if (typeof window !== 'undefined' && scale > 1) {
    const maxX = (window.innerWidth * (scale - 1)) / (2 * scale);
    const maxY = (window.innerHeight * (scale - 1)) / (2 * scale);
    posX = Math.max(-maxX, Math.min(maxX, posX));
    posY = Math.max(-maxY, Math.min(maxY, posY));
  } else {
    posX = 0;
    posY = 0;
  }

  // 2. Resource Loading State Management
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Reset state when source changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [type, image, video]);

  // Image Preloading
  useEffect(() => {
    if (type === 'image' && image) {
      const img = new Image();
      img.src = image;
      img.onload = () => setIsLoaded(true);
      img.onerror = () => {
        console.error('Background image failed to load:', image);
        setHasError(true);
      };
    } else if (type === 'video' && video) {
      // Video handling is done via onCanPlay event
    } else {
      // No content
      setHasError(true);
    }
  }, [type, image, video]);

  const showCustom = !hasError && (isLoaded || type === 'video'); // Video shows when ready
  const showDefault = !showCustom;

  // Texture Overlay Logic
  const getOverlayStyle = () => {
    if (assets.pattern === 'dots') {
      return {
        backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        opacity: 0.1
      };
    }
    if (assets.pattern === 'grid') {
      return {
        backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        opacity: 0.05
      };
    }
    // Scanline handled by CSS class in index.css (cyberpunk)
    return {};
  };

  return (
    <div className="fixed inset-0 w-full h-full z-0 overflow-hidden transition-colors duration-500" style={{ backgroundColor: 'var(--background)' }}>

      {/* Layer 0: Deep Base */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${isDarkMode
        ? 'bg-gradient-to-br from-gray-900 via-black to-gray-900 opacity-100'
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100 opacity-100'}`}
      />

      {/* Layer 1: Default Animated Background */}
      <AnimatePresence>
        {showDefault && (
          <motion.div
            key="default-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-[var(--color-theme)] opacity-20 blur-[120px] animate-pulse-slow" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-[var(--color-theme-secondary)] opacity-10 blur-[100px]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layer 2: Custom Wallpaper */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${showCustom ? 'opacity-100' : 'opacity-0'}`}
        style={{ opacity: showCustom ? safeOpacity : 0 }}
      >
        {type === 'video' && video ? (
          <video
            key={video}
            src={video}
            autoPlay
            loop
            muted
            playsInline
            onCanPlay={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            className="w-full h-full object-cover"
            style={{
              transform: `scale(${scale}) translate(${posX}px, ${posY}px)`,
              transition: 'transform 0.1s linear'
            }}
          />
        ) : (
          image && (
            <div
              className="w-full h-full bg-cover bg-no-repeat bg-center"
              style={{
                backgroundImage: `url(${image})`,
                transform: `scale(${scale}) translate(${posX}px, ${posY}px)`,
                transition: 'transform 0.1s linear'
              }}
            />
          )
        )}
      </div>

      {/* Layer 3: Blur Effect */}
      {safeBlur > 0 && (
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-500"
          style={{ backdropFilter: `blur(${safeBlur}px)` }}
        />
      )}

      {/* Layer 4: Theme Texture Overlay (New) */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          opacity: assets.noiseOpacity,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          mixBlendMode: assets.overlayBlendMode as any
        }}
      />

      {/* Layer 5: Pattern Overlay (New) */}
      {assets.pattern !== 'none' && assets.pattern !== 'scanline' && (
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-500 mix-blend-overlay"
          style={getOverlayStyle()}
        />
      )}

      {/* Layer 6: Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-radial-vignette opacity-40" />

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Background;
