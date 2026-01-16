import { useMemo } from "react";
import { format, eachDayOfInterval, isWeekend } from "date-fns";
import { cn } from "@plane/utils";

interface TimelineHeaderProps {
  startDate: Date;
  endDate: Date;
}

export const TimelineHeader: React.FC<TimelineHeaderProps> = ({ startDate, endDate }) => {
  const days = useMemo(() => {
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [startDate, endDate]);

  return (
    <div className="sticky top-0 z-10 bg-white dark:bg-zinc-900 border-b dark:border-zinc-800">
      <div className="flex">
        {/* Left column spacer (for staff/project names) */}
        <div className="w-64 flex-shrink-0 border-r dark:border-zinc-800 p-4 font-semibold">Resource</div>

        {/* Date columns */}
        <div className="flex flex-1 overflow-x-auto">
          {days.map((day) => {
            const isWeekendDay = isWeekend(day);
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "flex-shrink-0 w-24 border-r dark:border-zinc-800 p-2 text-center",
                  isWeekendDay && "bg-gray-50 dark:bg-zinc-800/50"
                )}
              >
                <div className="text-xs font-semibold text-gray-900 dark:text-gray-100">{format(day, "EEE")}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{format(day, "MMM d")}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
