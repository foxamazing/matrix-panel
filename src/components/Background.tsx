import React from 'react';

interface BackgroundProps {
  type: 'image' | 'video';
  image: string | null;
  video: string | null;
  opacity: number;
  blur: number;
  isDarkMode: boolean;
  position?: { x: number; y: number; scale: number };
  isMobile?: boolean; // To determine fit mode
}

const Background: React.FC<BackgroundProps> = ({ type, image, video, opacity, blur, isDarkMode, position, isMobile }) => {
  const hasContent = Boolean((type === 'image' && image && typeof image === 'string' && image.length > 1) || (type === 'video' && video && typeof video === 'string' && video.length > 1));

  const posX = position?.x ?? 0;
  const posY = position?.y ?? 0;
  const scale = position?.scale ?? 1;

  const fitMode = 'cover';

  return (
    <div className={`fixed inset-0 w-full h-full z-0 overflow-hidden animate-fade-in`}>
      {/* Base Layer - Always dark if content is present to prevent washing out, or dynamic if no content */}
      {!hasContent && (
        <div className={`absolute inset-0 transition-colors duration-700 bg-[var(--glass-bg-base)]`} />
      )}


      {/* Dynamic Fluid Aurora Blobs (Optimized for GPU) */}
      {!hasContent && (
        <div className="absolute inset-0 overflow-hidden isolate">
          {/* Main Glow - Theme Primary */}
          <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full mix-blend-screen filter blur-[60px] animate-fluid-aurora opacity-70"
            style={{ animationDuration: '25s', backgroundColor: 'var(--color-theme)', willChange: 'transform' }} />

          {/* Secondary Glow - Theme Secondary */}
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full mix-blend-soft-light filter blur-[60px] animate-fluid-aurora-reverse opacity-60"
            style={{ animationDuration: '35s', backgroundColor: 'var(--color-theme-secondary)', willChange: 'transform' }} />

          {/* Accent Glow - Soft Contrast */}
          <div className="absolute top-[20%] right-[15%] w-[40%] h-[50%] rounded-full mix-blend-screen filter blur-[80px] animate-fluid-aurora-slow opacity-50"
            style={{ animationDuration: '45s', backgroundColor: 'var(--color-theme-tertiary)', willChange: 'transform' }} />
        </div>
      )}

      {/* User Background Content - NO OPACITY OVERLAY */}
      {hasContent && (
        <div className="absolute inset-0 w-full h-full">
          {type === 'video' && video ? (
            <video
              src={video}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500"
              style={{
                objectFit: 'cover',
                objectPosition: `calc(50% + ${posX}px) calc(50% + ${posY}px)`,
                transform: `scale(${scale})`
              }}
            />
          ) : (
            <div
              className="absolute inset-0 bg-no-repeat transition-transform duration-500"
              style={{
                backgroundImage: `url(${image})`,
                backgroundSize: fitMode,
                backgroundPosition: `calc(50% + ${posX}px) calc(50% + ${posY}px)`,
                transform: `scale(${scale})`,
                willChange: 'transform'
              }}
            />
          )}
          {blur > 0 && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ backdropFilter: `blur(${blur}px)`, WebkitBackdropFilter: `blur(${blur}px)` }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Background;
