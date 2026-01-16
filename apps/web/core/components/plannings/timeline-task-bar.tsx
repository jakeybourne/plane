import { useMemo } from "react";
import { differenceInDays, format } from "date-fns";
import { cn } from "@plane/utils";
import { IPlanningIssue } from "@/services/planning.service";
import { Tooltip } from "@plane/ui";

interface TimelineTaskBarProps {
  issue: IPlanningIssue;
  timelineStartDate: Date;
  onTaskClick?: (issue: IPlanningIssue) => void;
}

const PRIORITY_COLORS = {
  urgent: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-yellow-500",
  low: "bg-blue-500",
  none: "bg-gray-500",
};

const DAY_WIDTH = 96; // 24rem = 96px (w-24)

export const TimelineTaskBar: React.FC<TimelineTaskBarProps> = ({ issue, timelineStartDate, onTaskClick }) => {
  const { leftOffset, width } = useMemo(() => {
    if (!issue.start_date || !issue.target_date) {
      return { leftOffset: 0, width: 0 };
    }

    const issueStart = new Date(issue.start_date);
    const issueEnd = new Date(issue.target_date);

    // Calculate offset from timeline start
    const daysFromStart = Math.max(0, differenceInDays(issueStart, timelineStartDate));
    const leftOffset = daysFromStart * DAY_WIDTH;

    // Calculate width based on duration
    const duration = differenceInDays(issueEnd, issueStart) + 1;
    const width = Math.max(DAY_WIDTH * duration, DAY_WIDTH / 2);

    return { leftOffset, width };
  }, [issue.start_date, issue.target_date, timelineStartDate]);

  if (!issue.start_date || !issue.target_date) {
    return null;
  }

  const priorityColor = PRIORITY_COLORS[issue.priority || "none"];

  const handleClick = () => {
    if (onTaskClick) {
      onTaskClick(issue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  const tooltipContent = (
    <div className="text-xs space-y-1">
      <div className="font-semibold">{issue.name}</div>
      <div className="text-gray-400">{issue.project?.name}</div>
      <div className="flex items-center gap-2 text-gray-400">
        <span>{format(new Date(issue.start_date), "MMM d")}</span>
        <span>→</span>
        <span>{format(new Date(issue.target_date), "MMM d")}</span>
      </div>
      {issue.priority && issue.priority !== "none" && <div className="capitalize">Priority: {issue.priority}</div>}
    </div>
  );

  return (
    <Tooltip tooltipContent={tooltipContent} position="top">
      <div
        role="button"
        tabIndex={0}
        className={cn(
          "absolute h-8 rounded cursor-pointer transition-all",
          "hover:ring-2 hover:ring-blue-500 hover:z-10",
          priorityColor
        )}
        style={{
          left: `${leftOffset}px`,
          width: `${width}px`,
          top: "4px",
        }}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <div className="h-full flex items-center px-2 text-white text-xs font-medium truncate">{issue.name}</div>
      </div>
    </Tooltip>
  );
};
