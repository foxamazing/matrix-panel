import React, { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { cn } from "../../lib/utils"; // Assuming you have a utils file or I'll inline it

dayjs.extend(advancedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

// Inline utility if cn doesn't exist, or just use template literals
const classNames = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(" ");

export interface ClockWidgetOptions {
  showSeconds?: boolean;
  is24HourFormat?: boolean;
  dateFormat?: string;
  customTimeFormat?: string;
  customDateFormat?: string;
  useCustomTimezone?: boolean;
  timezone?: string;
  customTitleToggle?: boolean;
  customTitle?: string;
  showDate?: boolean;
}

interface ClockWidgetProps {
  options?: ClockWidgetOptions;
  width?: number; // width in pixels, used for responsive sizing in Homarr
  className?: string;
}

export default function ClockWidget({ options = {}, width = 200, className }: ClockWidgetProps) {
  // Default options
  const {
    showSeconds = false,
    is24HourFormat = true,
    dateFormat = "dddd, MMMM D",
    customTimeFormat,
    customDateFormat,
    useCustomTimezone = false,
    timezone: customTimezone,
    customTitleToggle = false,
    customTitle,
    showDate = true,
  } = options;

  const secondsFormat = showSeconds ? ":ss" : "";
  const timeFormat = is24HourFormat ? `HH:mm${secondsFormat}` : `hh:mm${secondsFormat} A`;
  
  const resolvedTimezone = useCustomTimezone && customTimezone 
    ? customTimezone 
    : Intl.DateTimeFormat().resolvedOptions().timeZone;
    
  const time = useCurrentTime({ showSeconds });

  // Simulate Homarr's sizing logic based on container width
  // width < 128 ? "xs" : width < 196 ? "sm" : "md";
  const sizeClass = width < 128 ? "text-xl" : width < 196 ? "text-3xl" : "text-5xl";
  const dateSizeClass = width < 128 ? "text-xs" : "text-sm";

  return (
    <div className={classNames("flex flex-col items-center justify-center h-full w-full gap-1", className)}>
      {customTitleToggle && customTitle && (
        <span className={classNames("text-center font-medium opacity-80", dateSizeClass)}>
          {customTitle}
        </span>
      )}
      
      <h2 className={classNames("font-bold leading-none tabular-nums", sizeClass)}>
        {customTimeFormat
          ? dayjs(time).tz(resolvedTimezone).format(customTimeFormat)
          : dayjs(time).tz(resolvedTimezone).format(timeFormat)}
      </h2>
      
      {showDate && (
        <span className={classNames("opacity-70 text-center line-clamp-1", dateSizeClass)}>
          {customDateFormat
            ? dayjs(time).tz(resolvedTimezone).format(customDateFormat)
            : dayjs(time).tz(resolvedTimezone).format(dateFormat)}
        </span>
      )}
    </div>
  );
}

interface UseCurrentTimeProps {
  showSeconds: boolean;
}

const useCurrentTime = ({ showSeconds }: UseCurrentTimeProps) => {
  const [time, setTime] = useState(new Date());
  const timeoutRef = useRef<NodeJS.Timeout>(null);
  const intervalRef = useRef<NodeJS.Timeout>(null);
  const intervalMultiplier = useMemo(() => (showSeconds ? 1 : 60), [showSeconds]);

  useEffect(() => {
    setTime(new Date());
    timeoutRef.current = setTimeout(
      () => {
        setTime(new Date());

        intervalRef.current = setInterval(() => {
          setTime(new Date());
        }, intervalMultiplier * 1000);
      },
      intervalMultiplier * 1000 - (1000 * (showSeconds ? 0 : dayjs().second()) + dayjs().millisecond()),
    );

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [intervalMultiplier, showSeconds]);

  return time;
};
