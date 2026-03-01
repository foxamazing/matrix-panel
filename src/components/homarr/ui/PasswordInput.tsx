import React, { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { cn } from "../../../lib/utils";

interface PasswordInputProps {
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
}

export default function PasswordInput({ placeholder = "••••••••", value, onChange, className }: PasswordInputProps) {
    const [show, setShow] = useState(false);

    return (
        <div className={cn("relative group", className)}>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-400 transition-colors">
                <Lock className="w-full h-full" />
            </div>
            <input
                type={show ? "text" : "password"}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 pr-12 text-white font-bold focus:outline-none focus:border-blue-500/40 focus:bg-white/[0.08] transition-all placeholder:text-white/5"
            />
            <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-white/5 text-white/20 hover:text-white transition-all shadow-xl"
            >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
        </div>
    );
}
