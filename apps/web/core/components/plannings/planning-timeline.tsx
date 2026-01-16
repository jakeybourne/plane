import { useState, useMemo } from "react";
import { useParams } from "react-router";
import useSWR, { mutate } from "swr";
import { startOfMonth, endOfMonth, addMonths, subMonths, format } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@plane/ui";
import {
  PlanningService,
  IPlanningIssue,
  IPlanningTimelineResponse,
  IStaffData,
  IProjectStaffData,
} from "@/services/planning.service";
import { TimelineHeader } from "./timeline-header";
import { TimelineRow } from "./timeline-row";
import { PlanningEmptyState } from "./empty-state";

interface PlanningTimelineProps {
  viewBy: "staff" | "project";
}

const planningService = new PlanningService();

export const PlanningTimeline: React.FC<PlanningTimelineProps> = ({ viewBy }) => {
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();

  // Date range state (default to current month)
  const [currentDate, setCurrentDate] = useState(new Date());
  const startDate = useMemo(() => startOfMonth(currentDate), [currentDate]);
  const endDate = useMemo(() => endOfMonth(currentDate), [currentDate]);

  // Fetch timeline data
  const { data, error, isLoading } = useSWR<IPlanningTimelineResponse, Error>(
    workspaceSlug
      ? `planning-${workspaceSlug}-${format(startDate, "yyyy-MM-dd")}-${format(endDate, "yyyy-MM-dd")}-${viewBy}`
      : null,
    workspaceSlug
      ? () =>
          planningService.getTimelineData(workspaceSlug, {
            start_date: format(startDate, "yyyy-MM-dd"),
            end_date: format(endDate, "yyyy-MM-dd"),
            view_by: viewBy,
          })
      : null
  );

  // Handle task click to open issue modal
  const handleTaskClick = (issue: IPlanningIssue) => {
    // TODO: Open issue detail modal
    console.log("Task clicked:", issue);
  };

  // Handle date change from drag-and-drop
  const handleDatesChange = (issueId: string, newStartDate: string, newTargetDate: string) => {
    if (!workspaceSlug) return;

    void (async () => {
      try {
        await planningService.updateIssueDates(workspaceSlug, issueId, {
          start_date: newStartDate,
          target_date: newTargetDate,
        });

        // Revalidate data
        await mutate(
          `planning-${workspaceSlug}-${format(startDate, "yyyy-MM-dd")}-${format(endDate, "yyyy-MM-dd")}-${viewBy}`
        );
      } catch (err) {
        console.error("Failed to update issue dates:", err);
      }
    })();
  };

  // Date navigation
  const goToPreviousMonth = () => {
    setCurrentDate((prev) => subMonths(prev, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate((prev) => addMonths(prev, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const hasData = data?.data && Array.isArray(data.data) && data.data.length > 0;

  return (
    <div className="h-full flex flex-col bg-layer-0">
      {/* Controls bar */}
      <div className="border-b border-border-primary bg-layer-0 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Date navigation */}
            <div className="flex items-center gap-2">
              <Button variant="neutral-primary" size="sm" onClick={goToPreviousMonth}>
                <ChevronLeft className="size-4" />
              </Button>
              <Button variant="neutral-primary" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="neutral-primary" size="sm" onClick={goToNextMonth}>
                <ChevronRight className="size-4" />
              </Button>
            </div>

            {/* Current month display */}
            <div className="flex items-center gap-2 text-base font-medium text-primary">
              <CalendarIcon className="size-4 text-placeholder" />
              <span>{format(currentDate, "MMMM yyyy")}</span>
            </div>
          </div>

          {/* Stats */}
          {hasData && (
            <div className="text-13 text-placeholder">
              {data.data.length} {viewBy === "staff" ? "team members" : "projects"}
            </div>
          )}
        </div>
      </div>

      {/* Timeline content */}
      <div className="flex-1 overflow-auto bg-layer-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full size-8 border-b-2 border-accent-primary" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-danger font-medium">Failed to load planning data</p>
              <p className="text-13 text-placeholder mt-1">Please try again later</p>
            </div>
          </div>
        ) : !hasData ? (
          <PlanningEmptyState />
        ) : (
          <div className="min-w-max">
            <TimelineHeader startDate={startDate} endDate={endDate} />
            <div>
              {(data.data as Array<IStaffData | IProjectStaffData>).map((item, index: number) => (
                <TimelineRow
                  key={index}
                  data={item}
                  viewBy={viewBy}
                  timelineStartDate={startDate}
                  timelineEndDate={endDate}
                  onTaskClick={handleTaskClick}
                  onDatesChange={handleDatesChange}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
