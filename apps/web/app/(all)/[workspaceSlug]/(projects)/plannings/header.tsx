import { observer } from "mobx-react";
import { Breadcrumbs, Header } from "@plane/ui";
import { BreadcrumbLink } from "@/components/common/breadcrumb-link";
import { useParams } from "react-router";
import { GanttChartSquare } from "lucide-react";

export const PlanningsHeader = observer(() => {
  const { workspaceSlug } = useParams();

  return (
    <Header>
      <Header.LeftItem>
        <Breadcrumbs>
          <Breadcrumbs.Item
            component={
              <BreadcrumbLink
                label="Plannings"
                href={`/${workspaceSlug}/plannings`}
                icon={<GanttChartSquare className="h-4 w-4" />}
              />
            }
          />
        </Breadcrumbs>
      </Header.LeftItem>
    </Header>
  );
});
