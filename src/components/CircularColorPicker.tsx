import React, { useState, useEffect, useRef } from 'react';
import Wheel from '@uiw/react-color-wheel';
import ShadeSlider from '@uiw/react-color-shade-slider';
import { hsvaToHex, hexToHsva } from '@uiw/color-convert';
import { Pipette } from 'lucide-react';

interface CircularColorPickerProps {
    color: string;
    onChange: (color: string) => void;
}

const CircularColorPicker: React.FC<CircularColorPickerProps> = ({ color, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [hsva, setHsva] = useState(hexToHsva(color || '#71717A'));
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setHsva(hexToHsva(color || '#71717A'));
    }, [color]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleColorChange = (newHsva: any) => {
        const updated = { ...hsva, ...newHsva, a: 1 };
        setHsva(updated);
        onChange(hsvaToHex(updated));
    };

    const handleEyeDropper = async () => {
        if (!('EyeDropper' in window)) return;
        try {
            // @ts-ignore
            const eyeDropper = new window.EyeDropper();
            const result = await eyeDropper.open();
            if (result && result.sRGBHex) {
                onChange(result.sRGBHex);
                setHsva(hexToHsva(result.sRGBHex));
            }
        } catch (e) {
            // User canceled
        }
    };

    const r = Math.round((hsva.h / 360) * 255); // simplified for display

    return (
        <div className="relative inline-block" ref={containerRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`relative w-11 h-11 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 border-[3px] group focus:outline-none ${isOpen ? 'border-transparent scale-110 z-10' : 'border-transparent hover:scale-105'}`}
                style={{ boxShadow: isOpen ? `0 0 20px 2px ${color}60` : '0 4px 10px rgba(0,0,0,0.1)' }}
                title="自定义颜色"
            >
                <div
                    className="absolute inset-0 rounded-full"
                    style={{ background: 'conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)' }}
                />
                <div className={`absolute inset-0 rounded-full border-[3px] border-white/40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
                {isOpen && <div className="relative w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white shadow-sm" />}
            </button>

            {/* Popover */}
            {isOpen && (
                <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 p-4 rounded-3xl border border-[var(--glass-border)] bg-[var(--glass-bg-base)] backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] animate-scale-in">
                    <div className="flex flex-col items-center gap-4 w-[200px]">
                        {/* Wheel */}
                        <div className="relative flex justify-center w-full">
                            <Wheel
                                color={hsva}
                                onChange={(color) => handleColorChange(color.hsva)}
                                width={180}
                                height={180}
                            />
                        </div>

                        {/* Shade Slider */}
                        <div className="w-full px-1">
                            <ShadeSlider
                                hsva={hsva}
                                style={{ width: '100%', height: 16, borderRadius: 8 }}
                                onChange={(newShade) => handleColorChange({ v: newShade.v })}
                            />
                        </div>

                        {/* Tools */}
                        <div className="flex items-center w-full gap-2 mt-2">
                            {'EyeDropper' in window && (
                                <button
                                    type="button"
                                    onClick={handleEyeDropper}
                                    className="p-2 rounded-xl bg-[var(--glass-bg-hover)] hover:bg-theme/20 text-[var(--text-secondary)] hover:text-theme transition-colors border border-[var(--glass-border)] focus:outline-none"
                                    title="吸管工具"
                                >
                                    <Pipette className="w-4 h-4" />
                                </button>
                            )}

                            <div className="flex-1 flex items-center bg-[var(--glass-bg-hover)] border border-[var(--glass-border)] rounded-xl px-3 py-1.5 h-[34px]">
                                <span className="text-[12px] font-bold text-[var(--text-muted)] mr-2 select-none">HEX</span>
                                <input
                                    type="text"
                                    value={color.toUpperCase()}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        onChange(val);
                                        if (/^#[0-9A-F]{6}$/i.test(val)) {
                                            setHsva(hexToHsva(val));
                                        }
                                    }}
                                    className="w-full bg-transparent outline-none text-[12px] font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider"
                                    spellCheck={false}
                                />
                            </div>
                        </div>

                        <div className="w-full border-t border-[var(--glass-border)] pt-3 flex items-center justify-between">
                            <div className="flex-1 text-center">
                                <span className="block text-[10px] font-black text-[var(--text-muted)] uppercase mb-0.5">H</span>
                                <span className="text-[12px] font-mono text-[var(--text-primary)]">{Math.round(hsva.h)}</span>
                            </div>
                            <div className="flex-1 text-center border-l border-[var(--glass-border)]">
                                <span className="block text-[10px] font-black text-[var(--text-muted)] uppercase mb-0.5">S</span>
                                <span className="text-[12px] font-mono text-[var(--text-primary)]">{Math.round(hsva.s)}</span>
                            </div>
                            <div className="flex-1 text-center border-l border-[var(--glass-border)]">
                                <span className="block text-[10px] font-black text-[var(--text-muted)] uppercase mb-0.5">V</span>
                                <span className="text-[12px] font-mono text-[var(--text-primary)]">{Math.round(hsva.v)}</span>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default CircularColorPicker;
