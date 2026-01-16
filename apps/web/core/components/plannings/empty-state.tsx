import { GanttChartSquare } from "lucide-react";

export const PlanningEmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-zinc-800 mb-4">
        <GanttChartSquare className="h-8 w-8 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No tasks scheduled</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
        There are no tasks with start and target dates in the selected date range. Try adjusting the date range or
        ensuring tasks have dates assigned.
      </p>
    </div>
  );
};
