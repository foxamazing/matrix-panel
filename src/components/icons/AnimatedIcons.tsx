import React from 'react';

export const AnimatedLayoutIcon = ({ className = '' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <style>{`
      .group:hover .rect-1 { animation: layout-bounce 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) infinite; animation-delay: 0s; transform-origin: center; transform-box: fill-box;}
      .group:hover .rect-2 { animation: layout-bounce 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) infinite; animation-delay: 0.1s; transform-origin: center; transform-box: fill-box;}
      .group:hover .rect-3 { animation: layout-bounce 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) infinite; animation-delay: 0.2s; transform-origin: center; transform-box: fill-box;}
      .group:hover .rect-4 { animation: layout-bounce 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) infinite; animation-delay: 0.3s; transform-origin: center; transform-box: fill-box;}
      @keyframes layout-bounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(0.6) rotate(10deg); border-radius: 4px; rx: 4; }
      }
    `}</style>
        <rect className="rect-1" x="3" y="3" width="7" height="9" rx="1" />
        <rect className="rect-2" x="14" y="3" width="7" height="5" rx="1" />
        <rect className="rect-3" x="14" y="12" width="7" height="9" rx="1" />
        <rect className="rect-4" x="3" y="16" width="7" height="5" rx="1" />
    </svg>
);

export const AnimatedSettingsIcon = ({ className = '' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <style>{`
      .group:hover .gear-outer { animation: gear-spin 3s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite; transform-origin: center; transform-box: fill-box;}
      .group:hover .gear-inner { animation: gear-pulse 1.5s ease-in-out infinite alternate; transform-origin: center; transform-box: fill-box; }
      @keyframes gear-spin { 
        0% { transform: rotate(0deg); } 
        50% { transform: rotate(180deg) scale(1.1); stroke-width: 1.5; }
        100% { transform: rotate(360deg); }
      }
      @keyframes gear-pulse { 
        0% { transform: scale(1); fill: transparent; } 
        100% { transform: scale(1.5); fill: currentColor; } 
      }
    `}</style>
        <path className="gear-outer" d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle className="gear-inner" cx="12" cy="12" r="3" />
    </svg>
);

export const AnimatedLanguagesIcon = ({ className = '' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <style>{`
      .group:hover .lang-a { animation: lang-jump 1.5s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
      .group:hover .lang-wen { animation: lang-jump-delayed 1.5s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
      @keyframes lang-jump {
        0%, 100% { transform: translateY(0) scale(1) rotate(0); }
        25% { transform: translateY(-3px) scale(1.1) rotate(-5deg); color: #3b82f6; stroke-width: 2.5; }
        50% { transform: translateY(0) scale(1) rotate(0); }
      }
      @keyframes lang-jump-delayed {
        0%, 50%, 100% { transform: translateY(0) scale(1) rotate(0); }
        75% { transform: translateY(-3px) scale(1.1) rotate(5deg); color: #10b981; stroke-width: 2.5; }
      }
    `}</style>
        <g className="lang-a">
            <path d="m5 8 6 6" />
            <path d="m4 14 6-6 2-3" />
            <path d="M2 5h12" />
            <path d="M7 2h1" />
        </g>
        <g className="lang-wen">
            <path d="m22 22-5-10-5 10" />
            <path d="M14 18h6" />
        </g>
    </svg>
);

export const AnimatedLockIcon = ({ className = '' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <style>{`
      .group:hover .lock-shackle { animation: shackle-clack 1s cubic-bezier(0.36, 0, 0.66, -0.56) infinite; transform-origin: bottom center; transform-box: fill-box;}
      .group:hover .lock-body { animation: lock-body-pulse 1s infinite alternate; transform-origin: center; transform-box: fill-box;}
      .group:hover .lock-keyhole { animation: keyhole-spin 2s linear infinite; transform-origin: center; transform-box: fill-box;}
      @keyframes shackle-clack { 
        0%, 100% { transform: translateY(0); } 
        50% { transform: translateY(-3px); } 
      }
      @keyframes lock-body-pulse {
        0% { transform: scale(1); }
        100% { transform: scale(1.05) translateY(-1px); fill: rgba(255,255,255,0.1); }
      }
      @keyframes keyhole-spin {
        100% { transform: rotate(360deg); }
      }
    `}</style>
        <rect className="lock-body" x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path className="lock-shackle" d="M7 11V7a5 5 0 0 1 10 0v4" />
        <circle className="lock-keyhole" cx="12" cy="16" r="1.5" />
    </svg>
);

export const AnimatedUnlockIcon = ({ className = '' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <style>{`
      .group:hover .unlock-shackle { animation: shackle-jump-swing 1.5s ease-in-out infinite; transform-origin: 17px 11px; }
      .group:hover .unlock-body { animation: body-glow-bounce 1.5s ease-in-out infinite; transform-origin: center; transform-box: fill-box;}
      @keyframes shackle-jump-swing { 
        0%, 100% { transform: rotate(0deg) translateY(0); } 
        50% { transform: rotate(30deg) translateY(-4px); stroke: #4ade80; } 
      }
      @keyframes body-glow-bounce { 
        0%, 100% { transform: scale(1); stroke-width: 2; } 
        50% { transform: scale(1.05); stroke-width: 1.5; filter: drop-shadow(0 0 4px rgba(74,222,128,0.5)); stroke: #22c55e; fill: rgba(34,197,94,0.1); } 
      }
    `}</style>
        <rect className="unlock-body" x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path className="unlock-shackle" d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
);

export const AnimatedSunIcon = ({ className = '' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <style>{`
      .group:hover .sun-core { animation: sun-pulse 2s infinite alternate; transform-origin: center; transform-box: fill-box;}
      .group:hover .sun-rays { animation: sun-spin 4s linear infinite; transform-origin: center; transform-box: fill-box;}
      @keyframes sun-pulse {
        0% { transform: scale(1); fill: transparent; }
        100% { transform: scale(1.1); fill: currentColor; }
      }
      @keyframes sun-spin {
        100% { transform: rotate(360deg); }
      }
    `}</style>
        <circle className="sun-core" cx="12" cy="12" r="4" />
        <g className="sun-rays">
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
        </g>
    </svg>
);

export const AnimatedMoonIcon = ({ className = '' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <style>{`
      .group:hover .moon-body { animation: moon-rock 2s ease-in-out infinite alternate; transform-origin: center; transform-box: fill-box;}
      @keyframes moon-rock {
        0% { transform: rotate(-10deg) scale(1); }
        50% { transform: rotate(10deg) scale(1.05); }
        100% { transform: rotate(-5deg) scale(1); fill: currentColor; }
      }
    `}</style>
        <path className="moon-body" d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
);
