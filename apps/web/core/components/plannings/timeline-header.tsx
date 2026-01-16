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
    <div className="sticky top-0 z-10 bg-layer-0 border-b border-border-primary">
      <div className="flex">
        {/* Left column spacer (for staff/project names) */}
        <div className="w-64 flex-shrink-0 border-r border-border-primary px-4 py-3 font-medium text-primary">
          Resource
        </div>

        {/* Date columns */}
        <div className="flex flex-1 overflow-x-auto">
          {days.map((day) => {
            const isWeekendDay = isWeekend(day);
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "flex-shrink-0 w-24 border-r border-border-primary p-2 text-center",
                  isWeekendDay && "bg-layer-2"
                )}
              >
                <div className="text-11 font-medium text-primary">{format(day, "EEE")}</div>
                <div className="text-13 text-placeholder">{format(day, "MMM d")}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
