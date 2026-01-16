import { Outlet } from "react-router";
import { AppHeader } from "@/components/core/app-header";
import { ContentWrapper } from "@/components/core/content-wrapper";
import { PlanningsHeader } from "./header";

export default function PlanningsLayout() {
  return (
    <>
      <AppHeader header={<PlanningsHeader />} />
      <ContentWrapper>
        <Outlet />
      </ContentWrapper>
    </>
  );
}
