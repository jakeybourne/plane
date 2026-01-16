import { useState } from "react";
import { Users, FolderKanban } from "lucide-react";
import { PageHead } from "@/components/core/page-title";
import { TabList } from "@plane/ui";
import { PlanningTimeline } from "@/components/plannings/planning-timeline";

type ViewType = "staff" | "project";

const VIEWS = [
  { key: "staff" as ViewType, label: "Staff View", icon: Users },
  { key: "project" as ViewType, label: "Project View", icon: FolderKanban },
];

export default function PlanningsPage() {
  const [activeView, setActiveView] = useState<ViewType>("staff");

  return (
    <>
      <PageHead title="Planning" />
      <div className="h-full w-full flex flex-col overflow-hidden">
        {/* View Toggle */}
        <div className="border-b border-border-primary bg-layer-0 px-6 py-3.5">
          <div className="w-fit">
            <TabList
              tabs={VIEWS}
              selectedTab={activeView}
              onTabChange={(key) => setActiveView(key as ViewType)}
              size="md"
              autoWrap={false}
            />
          </div>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 overflow-hidden bg-layer-0">
          <PlanningTimeline viewBy={activeView} />
        </div>
      </div>
    </>
  );
}
