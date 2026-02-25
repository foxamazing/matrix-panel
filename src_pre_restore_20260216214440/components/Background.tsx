import React, { useState, useEffect, useRef } from 'react';

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

const Background: React.FC<BackgroundProps> = ({ type, image, video, opacity, blur, isDarkMode, position, isMobile }) => {
  const hasContent = (type === 'image' && image) || (type === 'video' && video);
  
  const posX = position?.x ?? 0;
  const posY = position?.y ?? 0;
  const scale = position?.scale ?? 1;

  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [screenDimensions, setScreenDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setScreenDimensions({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (type === 'image' && image) {
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
      };
      img.src = image;
    }
  }, [image, type]);

  const calculateFitMode = () => {
    if (!imageDimensions || !hasContent || type !== 'image') return 'cover';

    const imageRatio = imageDimensions.width / imageDimensions.height;
    const screenRatio = screenDimensions.width / screenDimensions.height;

    if (isMobile) {
      return 'contain';
    }

    const ratioDiff = Math.abs(imageRatio - screenRatio);
    if (ratioDiff < 0.1) {
      return 'cover';
    } else if (imageRatio > screenRatio) {
      return 'cover';
    } else {
      return 'contain';
    }
  };

  const fitMode = calculateFitMode();

  const calculateBackgroundSize = () => {
    if (!imageDimensions || type !== 'image') return fitMode;

    const imageRatio = imageDimensions.width / imageDimensions.height;
    const screenRatio = screenDimensions.width / screenDimensions.height;

    if (fitMode === 'contain') {
      if (imageRatio > screenRatio) {
        return `auto ${screenDimensions.height}px`;
      } else {
        return `${screenDimensions.width}px auto`;
      }
    }

    return 'cover';
  };

  const backgroundSize = calculateBackgroundSize();

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {!hasContent && (
        <div className={`absolute inset-0 transition-colors duration-700 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-100'}`} />
      )}
      {hasContent && <div className="absolute inset-0 bg-slate-950" />}

      {!hasContent && (
        <div className="absolute inset-0 opacity-40">
          <div className={`absolute top-0 -left-4 w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-[100px] animate-blob ${isDarkMode ? 'bg-purple-900/50' : 'bg-purple-300'}`}></div>
          <div className={`absolute top-0 -right-4 w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000 ${isDarkMode ? 'bg-blue-900/50' : 'bg-blue-300'}`}></div>
          <div className={`absolute -bottom-8 left-20 w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000 ${isDarkMode ? 'bg-indigo-900/50' : 'bg-indigo-300'}`}></div>
        </div>
      )}

      {hasContent && (
        <div className="absolute inset-0 w-full h-full transition-all duration-500" style={{ opacity }}>
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
                 objectPosition: 'center center',
                 transform: `scale(${scale})`
              }}
            />
          ) : (
            <div
              className="absolute inset-0 bg-no-repeat bg-center transition-transform duration-500"
              style={{
                backgroundImage: `url(${image})`,
                backgroundSize: backgroundSize,
                backgroundPosition: 'center center',
                transform: `scale(${scale})`
              }}
            />
          )}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ backdropFilter: `blur(${blur}px)`, WebkitBackdropFilter: `blur(${blur}px)` }}
          />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

      <div 
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

export default Background;
