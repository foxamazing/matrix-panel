import React from "react";
import { cn } from "../../lib/utils";
import { Browser, ShieldAlert } from "lucide-react";

export interface IFrameWidgetOptions {
  embedUrl?: string;
  allowScrolling?: boolean;
  allowFullScreen?: boolean;
  allowCamera?: boolean;
  allowMicrophone?: boolean;
  allowGeolocation?: boolean;
}

interface IFrameWidgetProps {
  options?: IFrameWidgetOptions;
  isEditMode?: boolean;
  className?: string;
}

export default function IFrameWidget({ options = {}, isEditMode, className }: IFrameWidgetProps) {
  const {
    embedUrl = "",
    allowScrolling = true,
    allowFullScreen = true,
  } = options;

  if (!embedUrl || embedUrl.trim() === "") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 opacity-50">
        <Browser className="w-8 h-8" />
        <span className="text-sm">No URL provided</span>
      </div>
    );
  }

  const isSupportedProtocol = (url: string) => {
    return url.startsWith("http://") || url.startsWith("https://");
  };

  if (!isSupportedProtocol(embedUrl)) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-amber-500/80">
        <ShieldAlert className="w-8 h-8" />
        <span className="text-sm text-center px-4">Unsupported protocol. Only HTTP/HTTPS allowed.</span>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full h-full overflow-hidden rounded-md bg-black/5", className)}>
      <iframe
        src={embedUrl}
        title="Widget IFrame"
        className="w-full h-full border-none"
        scrolling={allowScrolling ? "yes" : "no"}
        allowFullScreen={allowFullScreen}
        style={isEditMode ? { pointerEvents: "none", userSelect: "none" } : undefined}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation-by-user-activation"
      />
      {isEditMode && (
        <div className="absolute inset-0 bg-transparent z-10" title="Edit mode active" />
      )}
    </div>
  );
}
