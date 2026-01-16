import { GanttChartSquare } from "lucide-react";

export const PlanningEmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20">
      <div className="flex items-center justify-center size-16 rounded-full bg-layer-2 mb-4">
        <GanttChartSquare className="size-8 text-placeholder" />
      </div>
      <h3 className="text-base font-medium text-primary mb-2">No tasks scheduled</h3>
      <p className="text-13 text-placeholder text-center max-w-md">
        There are no tasks with start and target dates in the selected date range. Try adjusting the date range or
        ensuring tasks have dates assigned.
      </p>
    </div>
  );
};
