import { useState } from "react";
import { PageHead } from "@/components/core/page-title";
import { PlanningTimeline } from "@/components/plannings/planning-timeline";

type ViewType = "staff" | "project";

const VIEWS: { key: ViewType; label: string; description: string }[] = [
  { key: "staff", label: "Staff View", description: "Group by team members" },
  { key: "project", label: "Project View", description: "Group by projects" },
];

export default function PlanningsPage() {
  const [activeView, setActiveView] = useState<ViewType>("staff");

  return (
    <>
      <PageHead title="Planning" />
      <div className="h-full w-full flex flex-col overflow-hidden">
        {/* View Toggle */}
        <div className="border-b bg-white dark:bg-zinc-900 dark:border-zinc-800 px-8">
          <nav className="flex gap-6" aria-label="View Toggle">
            {VIEWS.map((view) => (
              <button
                key={view.key}
                onClick={() => setActiveView(view.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeView === view.key
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <div className="flex flex-col items-start">
                  <span>{view.label}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-normal">{view.description}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 overflow-hidden">
          <PlanningTimeline viewBy={activeView} />
        </div>
      </div>
    </>
  );
}
