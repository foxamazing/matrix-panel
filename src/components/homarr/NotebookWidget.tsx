import React, { useState, useEffect, useRef } from "react";
import { Edit2, Check, X, Trash2, List } from "lucide-react";
import { cn } from "../../lib/utils";

interface NotebookWidgetProps {
    className?: string;
    initialTitle?: string;
    initialContent?: string;
    id?: string;
}

export default function NotebookWidget({
    className,
    initialTitle = "笔记本",
    initialContent = "",
    id = "default-notebook"
}: NotebookWidgetProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(initialTitle);
    const [content, setContent] = useState(initialContent);
    const [tempContent, setTempContent] = useState(initialContent);
    const [tempTitle, setTempTitle] = useState(initialTitle);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Load from localStorage on mount
    useEffect(() => {
        const savedContent = localStorage.getItem(`notebook-content-${id}`);
        const savedTitle = localStorage.getItem(`notebook-title-${id}`);
        if (savedContent !== null) {
            setContent(savedContent);
            setTempContent(savedContent);
        }
        if (savedTitle !== null) {
            setTitle(savedTitle);
            setTempTitle(savedTitle);
        }
    }, [id]);

    const handleSave = () => {
        setContent(tempContent);
        setTitle(tempTitle);
        localStorage.setItem(`notebook-content-${id}`, tempContent);
        localStorage.setItem(`notebook-title-${id}`, tempTitle);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setTempContent(content);
        setTempTitle(title);
        setIsEditing(false);
    };

    const clearContent = () => {
        if (window.confirm("确定要清空所有内容吗？")) {
            setTempContent("");
        }
    };

    return (
        <div className={cn(
            "flex flex-col h-full w-full rounded-2xl overflow-hidden transition-all duration-300",
            "bg-white/10 backdrop-blur-md border border-white/20 shadow-xl",
            className
        )}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-2 overflow-hidden">
                    <List className="w-4 h-4 text-blue-400 shrink-0" />
                    {isEditing ? (
                        <input
                            type="text"
                            value={tempTitle}
                            onChange={(e) => setTempTitle(e.target.value)}
                            className="bg-transparent border-none focus:outline-none focus:ring-0 text-white font-medium w-full text-sm"
                            autoFocus
                        />
                    ) : (
                        <h3 className="text-white font-medium text-sm truncate">{title}</h3>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    {isEditing ? (
                        <>
                            <button
                                onClick={clearContent}
                                className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                title="清空"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleCancel}
                                className="p-1.5 hover:bg-white/10 text-white/60 rounded-lg transition-colors"
                                title="取消"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleSave}
                                className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all shadow-lg shadow-blue-500/20"
                                title="保存"
                            >
                                <Check className="w-4 h-4" />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-1.5 hover:bg-white/10 text-white/60 rounded-lg transition-colors"
                            title="开始编辑"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 relative overflow-hidden group">
                {isEditing ? (
                    <textarea
                        ref={textareaRef}
                        value={tempContent}
                        onChange={(e) => setTempContent(e.target.value)}
                        placeholder="在此输入笔记内容..."
                        className={cn(
                            "w-full h-full p-4 bg-transparent border-none focus:outline-none focus:ring-0 text-white/90 text-sm resize-none",
                            "scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
                        )}
                    />
                ) : (
                    <div className={cn(
                        "w-full h-full p-4 text-sm text-white/80 overflow-y-auto whitespace-pre-wrap leading-relaxed",
                        "scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent",
                        content === "" && "italic text-white/40 flex items-center justify-center"
                    )}>
                        {content || "点击右上角编辑图标开始记录..."}
                    </div>
                )}

                {/* Subtle decorative element */}
                <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-br from-transparent to-blue-500/5 pointer-events-none" />
            </div>
        </div>
    );
}
