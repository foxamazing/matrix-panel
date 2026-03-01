import React from "react";
import { cn } from "../../../lib/utils";

interface MaskedImageProps {
    src: string;
    alt?: string;
    className?: string;
    maskOpacity?: number;
}

export default function MaskedImage({ src, alt, className, maskOpacity = 0.5 }: MaskedImageProps) {
    return (
        <div className={cn("relative overflow-hidden group", className)}>
            <img
                src={src}
                alt={alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {/* Dynamic Glass Mask */}
            <div
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500"
            />
            {/* Inner Border Reflection */}
            <div className="absolute inset-0 border border-white/5 rounded-[inherit] pointer-events-none" />
        </div>
    );
}
