// helpers
import { API_BASE_URL } from "@plane/constants";
// services
import { APIService } from "@/services/api.service";

// Types for planning
export interface IProjectLogoProps {
  in_use?: string;
  emoji?: {
    value?: string;
  };
  icon?: {
    name?: string;
    color?: string;
  };
}

export interface IPlanningIssue {
  id: string;
  name: string;
  sequence_id: number;
  project_id: string;
  project?: {
    id: string;
    name: string;
    identifier: string;
    logo_props?: IProjectLogoProps;
  };
  start_date: string | null;
  target_date: string | null;
  priority: "urgent" | "high" | "medium" | "low" | "none";
  state_id: string;
  state_group: string;
  estimate_point: string | null;
  assignee_ids: string[];
  assignees?: IUserLite[];
  created_at?: string;
  updated_at?: string;
}

export interface IUserLite {
  id: string;
  email: string;
  display_name: string;
  first_name: string;
  last_name: string;
  avatar?: string;
}

export interface IProjectData {
  project: {
    id: string;
    name: string;
    identifier: string;
    logo_props?: IProjectLogoProps;
  };
  issues: IPlanningIssue[];
}

export interface IUserData {
  user: IUserLite;
  issues: IPlanningIssue[];
}

export interface IStaffData {
  user: IUserLite;
  projects: IProjectData[];
  total_issues: number;
}

export interface IProjectStaffData {
  project: {
    id: string;
    name: string;
    identifier: string;
    logo_props?: IProjectLogoProps;
  };
  users: IUserData[];
  total_issues: number;
}

export interface IPlanningTimelineResponse {
  view_by: "staff" | "project";
  start_date: string;
  end_date: string;
  data: IStaffData[] | IProjectStaffData[];
}

export interface ICapacityUser {
  user_id: string;
  display_name: string;
  email: string;
  avatar?: string;
  total_issues: number;
  urgent_issues: number;
  high_issues: number;
}

export interface ICapacityResponse {
  start_date: string;
  end_date: string;
  capacity: ICapacityUser[];
}

export interface IPlanningFilters {
  start_date: string;
  end_date: string;
  view_by?: "staff" | "project";
  assignees?: string[];
  projects?: string[];
}

export class PlanningService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  /**
   * Get timeline data for planning view
   */
  async getTimelineData(workspaceSlug: string, filters: IPlanningFilters): Promise<IPlanningTimelineResponse> {
    const params = new URLSearchParams();
    params.append("start_date", filters.start_date);
    params.append("end_date", filters.end_date);

    if (filters.view_by) {
      params.append("view_by", filters.view_by);
    }

    if (filters.assignees && filters.assignees.length > 0) {
      params.append("assignees", filters.assignees.join(","));
    }

    if (filters.projects && filters.projects.length > 0) {
      params.append("projects", filters.projects.join(","));
    }

    return this.get(`/api/workspaces/${workspaceSlug}/planning/timeline/?${params.toString()}`)
      .then((res) => res?.data as IPlanningTimelineResponse)
      .catch((err: { response?: { data?: unknown } }) => {
        throw new Error(typeof err?.response?.data === "string" ? err.response.data : "Failed to fetch timeline data");
      });
  }

  /**
   * Get capacity/workload metrics
   */
  async getCapacityData(workspaceSlug: string, startDate: string, endDate: string): Promise<ICapacityResponse> {
    return this.get(`/api/workspaces/${workspaceSlug}/planning/capacity/?start_date=${startDate}&end_date=${endDate}`)
      .then((res) => res?.data as ICapacityResponse)
      .catch((err: { response?: { data?: unknown } }) => {
        throw new Error(typeof err?.response?.data === "string" ? err.response.data : "Failed to fetch capacity data");
      });
  }

  /**
   * Update issue dates (for drag-and-drop)
   */
  async updateIssueDates(
    workspaceSlug: string,
    issueId: string,
    payload: {
      start_date?: string;
      target_date?: string;
    }
  ): Promise<IPlanningIssue> {
    return this.patch(`/api/workspaces/${workspaceSlug}/planning/issues/${issueId}/dates/`, payload)
      .then((res) => res?.data as IPlanningIssue)
      .catch((err: { response?: { data?: unknown } }) => {
        throw new Error(typeof err?.response?.data === "string" ? err.response.data : "Failed to update issue dates");
      });
  }

  /**
   * Reassign issue to different user(s)
   */
  async reassignIssue(workspaceSlug: string, issueId: string, assigneeIds: string[]): Promise<IPlanningIssue> {
    return this.patch(`/api/workspaces/${workspaceSlug}/planning/issues/${issueId}/reassign/`, {
      assignee_ids: assigneeIds,
    })
      .then((res) => res?.data as IPlanningIssue)
      .catch((err: { response?: { data?: unknown } }) => {
        throw new Error(typeof err?.response?.data === "string" ? err.response.data : "Failed to reassign issue");
      });
  }
}
