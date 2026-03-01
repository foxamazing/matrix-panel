import React, { useMemo, useState } from "react";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

interface CalendarWidgetProps {
  className?: string;
}

export default function CalendarWidget({ className }: CalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState(dayjs());
  
  const daysInMonth = currentDate.daysInMonth();
  const startDay = currentDate.startOf("month").day(); // 0 (Sunday) - 6 (Saturday)
  
  // Generate days array
  const days = useMemo(() => {
    const d = [];
    // Previous month padding
    for (let i = 0; i < startDay; i++) {
      d.push({ day: null, key: `prev-${i}` });
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      d.push({ day: i, key: `curr-${i}` });
    }
    return d;
  }, [currentDate]);

  const nextMonth = () => setCurrentDate(currentDate.add(1, "month"));
  const prevMonth = () => setCurrentDate(currentDate.subtract(1, "month"));
  const isToday = (day: number) => {
    return dayjs().isSame(currentDate, "month") && dayjs().date() === day;
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className={cn("flex flex-col h-full w-full p-4 gap-2", className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg font-bold">
          {currentDate.format("MMMM YYYY")}
        </span>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="p-1 hover:bg-white/10 rounded">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={nextMonth} className="p-1 hover:bg-white/10 rounded">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 text-center text-xs opacity-50 mb-1">
        {weekDays.map(d => <span key={d}>{d}</span>)}
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-sm flex-1">
        {days.map(({ day, key }) => (
          <div 
            key={key} 
            className={cn(
              "flex items-center justify-center rounded aspect-square",
              day === null ? "invisible" : "hover:bg-white/5",
              day && isToday(day) ? "bg-primary text-primary-foreground font-bold bg-blue-500 rounded-full" : ""
            )}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}
