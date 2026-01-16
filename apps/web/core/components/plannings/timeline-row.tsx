import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@plane/utils";
import { Avatar } from "@plane/ui";
import { IStaffData, IProjectStaffData, IPlanningIssue } from "@/services/planning.service";
import { TimelineTaskBar } from "./timeline-task-bar";
import { eachDayOfInterval, isWeekend } from "date-fns";

interface TimelineRowProps {
  data: IStaffData | IProjectStaffData;
  viewBy: "staff" | "project";
  timelineStartDate: Date;
  timelineEndDate: Date;
  onTaskClick?: (issue: IPlanningIssue) => void;
  onDatesChange?: (issueId: string, newStartDate: string, newTargetDate: string) => void;
}

export const TimelineRow: React.FC<TimelineRowProps> = ({
  data,
  viewBy,
  timelineStartDate,
  timelineEndDate,
  onTaskClick,
  onDatesChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const days = eachDayOfInterval({ start: timelineStartDate, end: timelineEndDate });

  if (viewBy === "staff") {
    const staffData = data as IStaffData;

    return (
      <div className="border-b border-border-primary">
        {/* Staff header row */}
        <div className="flex hover:bg-layer-transparent-hover">
          {/* Staff name column */}
          <div className="w-64 flex-shrink-0 border-r border-border-primary px-4 py-3">
            <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-2 w-full text-left">
              {isExpanded ? (
                <ChevronDown className="size-4 flex-shrink-0 text-placeholder" />
              ) : (
                <ChevronRight className="size-4 flex-shrink-0 text-placeholder" />
              )}
              <Avatar name={staffData.user.display_name} src={staffData.user.avatar} size="sm" showTooltip={false} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-13 text-primary truncate">{staffData.user.display_name}</div>
                <div className="text-11 text-placeholder">
                  {staffData.total_issues} {staffData.total_issues === 1 ? "task" : "tasks"}
                </div>
              </div>
            </button>
          </div>

          {/* Timeline cells */}
          <div className="flex flex-1 overflow-x-auto">
            {days.map((day) => (
              <div
                key={day.toISOString()}
                className={cn("flex-shrink-0 w-24 h-12 border-r border-border-primary", isWeekend(day) && "bg-layer-2")}
              />
            ))}
          </div>
        </div>

        {/* Project rows */}
        {isExpanded &&
          staffData.projects.map((projectData, idx) => (
            <div key={idx} className="flex hover:bg-layer-transparent-hover">
              {/* Project name column */}
              <div className="w-64 flex-shrink-0 border-r border-border-primary px-4 py-3 pl-12">
                <div className="flex items-center gap-2">
                  <div className="text-11 font-mono text-placeholder">{projectData.project?.identifier}</div>
                  <div className="text-13 text-primary truncate">{projectData.project?.name}</div>
                </div>
              </div>

              {/* Timeline with task bars */}
              <div className="flex flex-1 overflow-x-auto relative min-h-[3rem]">
                {/* Grid cells */}
                {days.map((day) => (
                  <div
                    key={day.toISOString()}
                    className={cn("flex-shrink-0 w-24 border-r border-border-primary", isWeekend(day) && "bg-layer-2")}
                  />
                ))}

                {/* Task bars */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="relative h-full pointer-events-auto">
                    {projectData.issues.map((issue) => (
                      <TimelineTaskBar
                        key={issue.id}
                        issue={issue}
                        timelineStartDate={timelineStartDate}
                        timelineEndDate={timelineEndDate}
                        onTaskClick={onTaskClick}
                        onDatesChange={onDatesChange}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    );
  } else {
    // Project view
    const projectData = data as IProjectStaffData;

    return (
      <div className="border-b border-border-primary">
        {/* Project header row */}
        <div className="flex hover:bg-layer-transparent-hover">
          {/* Project name column */}
          <div className="w-64 flex-shrink-0 border-r border-border-primary px-4 py-3">
            <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-2 w-full text-left">
              {isExpanded ? (
                <ChevronDown className="size-4 flex-shrink-0 text-placeholder" />
              ) : (
                <ChevronRight className="size-4 flex-shrink-0 text-placeholder" />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-13 text-primary truncate">{projectData.project?.name}</div>
                <div className="text-11 text-placeholder">
                  {projectData.total_issues} {projectData.total_issues === 1 ? "task" : "tasks"}
                </div>
              </div>
            </button>
          </div>

          {/* Timeline cells */}
          <div className="flex flex-1 overflow-x-auto">
            {days.map((day) => (
              <div
                key={day.toISOString()}
                className={cn("flex-shrink-0 w-24 h-12 border-r border-border-primary", isWeekend(day) && "bg-layer-2")}
              />
            ))}
          </div>
        </div>

        {/* User rows */}
        {isExpanded &&
          projectData.users.map((userData, idx) => (
            <div key={idx} className="flex hover:bg-layer-transparent-hover">
              {/* User name column */}
              <div className="w-64 flex-shrink-0 border-r border-border-primary px-4 py-3 pl-12">
                <div className="flex items-center gap-2">
                  <Avatar name={userData.user.display_name} src={userData.user.avatar} size="sm" showTooltip={false} />
                  <div className="text-13 text-primary truncate">{userData.user.display_name}</div>
                </div>
              </div>

              {/* Timeline with task bars */}
              <div className="flex flex-1 overflow-x-auto relative min-h-[3rem]">
                {/* Grid cells */}
                {days.map((day) => (
                  <div
                    key={day.toISOString()}
                    className={cn("flex-shrink-0 w-24 border-r border-border-primary", isWeekend(day) && "bg-layer-2")}
                  />
                ))}

                {/* Task bars */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="relative h-full pointer-events-auto">
                    {userData.issues.map((issue) => (
                      <TimelineTaskBar
                        key={issue.id}
                        issue={issue}
                        timelineStartDate={timelineStartDate}
                        timelineEndDate={timelineEndDate}
                        onTaskClick={onTaskClick}
                        onDatesChange={onDatesChange}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    );
  }
};
