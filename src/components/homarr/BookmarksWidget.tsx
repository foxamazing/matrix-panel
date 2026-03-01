import React from "react";
import { Bookmark, ExternalLink, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

interface BookmarkItem {
    id: string;
    name: string;
    url: string;
    icon?: string;
}

interface BookmarksWidgetProps {
    className?: string;
    title?: string;
    bookmarks?: BookmarkItem[];
}

const MOCK_BOOKMARKS: BookmarkItem[] = [
    { id: "1", name: "GitHub", url: "https://github.com" },
    { id: "2", name: "Google", url: "https://google.com" },
    { id: "3", name: "Homarr Wiki", url: "https://homarr.dev" },
    { id: "4", name: "Docker Hub", url: "https://hub.docker.com" }
];

export default function BookmarksWidget({
    className,
    title = "书签收藏",
    bookmarks = MOCK_BOOKMARKS
}: BookmarksWidgetProps) {
    return (
        <div className={cn(
            "flex flex-col h-full w-full rounded-2xl overflow-hidden transition-all duration-300",
            "bg-white/10 backdrop-blur-md border border-white/20 shadow-xl",
            className
        )}>
            <div className="flex items-center gap-2 p-4 border-b border-white/10 bg-white/5">
                <Bookmark className="w-4 h-4 text-yellow-400" />
                <h3 className="text-white font-medium text-sm">{title}</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                <div className="grid grid-cols-1 gap-1">
                    {bookmarks.map((bookmark) => (
                        <a
                            key={bookmark.id}
                            href={bookmark.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 text-white/60 group-hover:text-white transition-colors">
                                    <ExternalLink className="w-4 h-4" />
                                </div>
                                <span className="text-sm text-white/80 group-hover:text-white transition-colors">{bookmark.name}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
