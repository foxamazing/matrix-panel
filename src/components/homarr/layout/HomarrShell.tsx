import React, { useState } from "react";
import { cn } from "../../../lib/utils";
import HomarrHeader from "./HomarrHeader";
import HomarrSidebar from "./HomarrSidebar";

interface HomarrShellProps {
    children: React.ReactNode;
    className?: string;
}

export default function HomarrShell({ children, className }: HomarrShellProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className={cn("min-h-screen bg-[#0a0b0d] flex flex-col", className)}>
            {/* Global Background Particles/Gradients */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[150px] rounded-full" />
            </div>

            <HomarrHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex flex-1 relative">
                <HomarrSidebar isOpen={isSidebarOpen} />

                <main className={cn(
                    "flex-1 transition-all duration-300 min-h-[calc(100vh-64px)]",
                    "lg:ml-64 p-6 overflow-x-hidden relative"
                )}>
                    {children}
                </main>
            </div>

            {/* Side Overlay for Mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}
