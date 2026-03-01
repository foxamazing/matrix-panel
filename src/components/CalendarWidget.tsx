import React, { useMemo, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Hooks
import { useConfig } from '../providers/ConfigProvider';
import { useTheme } from '../providers/ThemeProvider';

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

const CalendarWidget: React.FC = () => {
  const { config } = useConfig();
  const { themeColor } = useTheme();
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(today);

  const isPixelMode = config.isPixelMode;

  const monthCells = useMemo(() => {
    const first = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const firstWeekday = (first.getDay() + 6) % 7;
    const cells: Array<{ date: Date; current: boolean }> = [];
    const prevMonthLast = new Date(viewDate.getFullYear(), viewDate.getMonth(), 0).getDate();
    for (let i = firstWeekday; i > 0; i--) {
      cells.push({ date: new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, prevMonthLast - i + 1), current: false });
    }
    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: new Date(viewDate.getFullYear(), viewDate.getMonth(), d), current: true });
    }
    // Keep a stable 6-row calendar (42 cells) so card height is consistent across months.
    const remain = 42 - cells.length;
    for (let d = 1; d <= remain; d++) {
      cells.push({ date: new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, d), current: false });
    }
    return cells;
  }, [viewDate]);

  const changeMonth = (offset: number) => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));

  const containerClass = `h-full w-full p-1 select-none flex flex-col ${isPixelMode ? 'font-pixel' : 'font-sans'}`;

  return (
    <div className={containerClass}>
      <div className="flex-1 rounded-2xl glass-panel p-2 flex flex-col shadow-2xl transition-all duration-500">
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <CalendarDays size={12} className="text-theme shrink-0" />
            <span className="text-[11px] font-black text-adaptive tracking-tight truncate">
              {viewDate.getFullYear()}·{viewDate.getMonth() + 1}
            </span>
          </div>
          <div className="flex gap-0.5 shrink-0">
            <button
              onClick={() => changeMonth(-1)}
              className="p-1 hover:bg-[var(--glass-bg-hover)] rounded-lg text-theme transition-all active:scale-90"
            >
              <ChevronLeft size={11} />
            </button>
            <button
              onClick={() => changeMonth(1)}
              className="p-1 hover:bg-[var(--glass-bg-hover)] rounded-lg text-theme transition-all active:scale-90"
            >
              <ChevronRight size={11} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-0.5 mb-1.5 text-[8px] font-bold text-adaptive opacity-30 uppercase text-center">
          {WEEKDAYS.map(d => <div key={d}>{d}</div>)}
        </div>

        <div className="grid grid-cols-7 grid-rows-6 gap-0.5 flex-1 min-h-0">
          {monthCells.map((cell, i) => {
            const isToday = cell.date.toDateString() === today.toDateString();
            const isSelected = cell.date.toDateString() === selected.toDateString();

            return (
              <button
                key={i}
                onClick={() => setSelected(cell.date)}
                className={`
                  h-full min-h-0 flex items-center justify-center rounded-lg text-[10px] font-bold transition-all relative
                  ${isSelected ? 'text-white bg-theme shadow-lg shadow-theme/30 scale-105 z-10' :
                    isToday ? 'text-theme bg-theme/10 ring-1 ring-theme/30' :
                      cell.current ? 'text-adaptive opacity-80 hover:bg-[var(--glass-bg-hover)]' :
                        'text-adaptive opacity-10'
                  }
                `}
              >
                {cell.date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarWidget;
