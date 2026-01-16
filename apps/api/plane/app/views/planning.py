# Python imports
from datetime import datetime
from collections import defaultdict

# Django imports
from django.db.models import Prefetch, Q
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

# Module imports
from plane.app.permissions import WorkspaceEntityPermission
from plane.app.serializers import (
    PlanningIssueSerializer,
    PlanningTimelineSerializer,
)
from plane.db.models import Issue, WorkspaceMember, Project


class PlanningViewSet(viewsets.ViewSet):
    """
    ViewSet for planning/resource allocation features
    Provides timeline and capacity views of issues across workspace
    """
    permission_classes = [WorkspaceEntityPermission]

    def _validate_dates(self, start_date_str, end_date_str):
        """Validate and parse date parameters"""
        if not start_date_str or not end_date_str:
            return None, None, Response(
                {"error": "start_date and end_date are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
            end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()

            if start_date > end_date:
                return None, None, Response(
                    {"error": "start_date must be before or equal to end_date"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            return start_date, end_date, None
        except ValueError:
            return None, None, Response(
                {"error": "Invalid date format. Use YYYY-MM-DD"},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=["get"], url_path="timeline")
    def timeline(self, request, slug):
        """
        Get timeline data for planning view
        Query params:
        - start_date (required): YYYY-MM-DD
        - end_date (required): YYYY-MM-DD
        - view_by: 'staff' or 'project' (default: 'staff')
        - assignees: comma-separated user IDs
        - projects: comma-separated project IDs
        """
        # Parse and validate dates
        start_date_str = request.query_params.get("start_date")
        end_date_str = request.query_params.get("end_date")
        start_date, end_date, error_response = self._validate_dates(start_date_str, end_date_str)

        if error_response:
            return error_response

        # Get filter parameters
        view_by = request.query_params.get("view_by", "staff")
        assignees = request.query_params.get("assignees", "").split(",") if request.query_params.get("assignees") else []
        assignees = [a.strip() for a in assignees if a.strip()]
        projects = request.query_params.get("projects", "").split(",") if request.query_params.get("projects") else []
        projects = [p.strip() for p in projects if p.strip()]

        # Build base queryset
        queryset = Issue.issue_objects.filter(
            workspace__slug=slug,
            start_date__isnull=False,
            target_date__isnull=False,
        ).filter(
            Q(start_date__lte=end_date) & Q(target_date__gte=start_date)
        ).select_related(
            "state",
            "project"
        ).prefetch_related(
            "assignees",
        )

        # Apply filters
        if assignees:
            queryset = queryset.filter(assignees__id__in=assignees)

        if projects:
            queryset = queryset.filter(project_id__in=projects)

        # Serialize issues
        issues_data = PlanningIssueSerializer(queryset, many=True).data

        # Group data based on view_by parameter
        if view_by == "staff":
            grouped_data = self._group_by_staff(issues_data, slug)
        elif view_by == "project":
            grouped_data = self._group_by_project(issues_data)
        else:
            return Response(
                {"error": "view_by must be 'staff' or 'project'"},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response({
            "view_by": view_by,
            "start_date": start_date,
            "end_date": end_date,
            "data": grouped_data,
        })

    def _group_by_staff(self, issues_data, workspace_slug):
        """Group issues by staff members"""
        # Create a mapping of user_id -> user issues
        user_issues = defaultdict(lambda: {"user": None, "projects": defaultdict(list)})

        for issue in issues_data:
            assignee_ids = issue.get("assignee_ids", [])
            project = issue.get("project", {})
            project_id = issue.get("project_id")

            for assignee in issue.get("assignees", []):
                user_id = str(assignee["id"])

                # Set user info if not already set
                if user_issues[user_id]["user"] is None:
                    user_issues[user_id]["user"] = assignee

                # Add issue to this user's project
                user_issues[user_id]["projects"][project_id].append(issue)

        # Convert to list format
        result = []
        for user_id, data in user_issues.items():
            projects = []
            for project_id, project_issues in data["projects"].items():
                if project_issues:
                    projects.append({
                        "project": project_issues[0].get("project"),
                        "issues": project_issues
                    })

            result.append({
                "user": data["user"],
                "projects": projects,
                "total_issues": sum(len(p["issues"]) for p in projects)
            })

        # Sort by user name
        result.sort(key=lambda x: x["user"]["display_name"] if x["user"] else "")

        return result

    def _group_by_project(self, issues_data):
        """Group issues by projects"""
        # Create a mapping of project_id -> project issues grouped by user
        project_data = defaultdict(lambda: {"project": None, "users": defaultdict(list)})

        for issue in issues_data:
            project_id = issue.get("project_id")
            project = issue.get("project")

            # Set project info if not already set
            if project_data[project_id]["project"] is None:
                project_data[project_id]["project"] = project

            # Add issue to each assignee under this project
            for assignee in issue.get("assignees", []):
                user_id = str(assignee["id"])
                project_data[project_id]["users"][user_id].append({
                    "user": assignee,
                    "issue": issue
                })

        # Convert to list format
        result = []
        for project_id, data in project_data.items():
            users = []
            for user_id, user_issues in data["users"].items():
                if user_issues:
                    users.append({
                        "user": user_issues[0]["user"],
                        "issues": [ui["issue"] for ui in user_issues]
                    })

            result.append({
                "project": data["project"],
                "users": users,
                "total_issues": sum(len(u["issues"]) for u in users)
            })

        # Sort by project name
        result.sort(key=lambda x: x["project"]["name"] if x["project"] else "")

        return result

    @action(detail=False, methods=["get"], url_path="capacity")
    def capacity(self, request, slug):
        """
        Get capacity/workload metrics for team members
        Query params:
        - start_date (required): YYYY-MM-DD
        - end_date (required): YYYY-MM-DD
        """
        # Parse and validate dates
        start_date_str = request.query_params.get("start_date")
        end_date_str = request.query_params.get("end_date")
        start_date, end_date, error_response = self._validate_dates(start_date_str, end_date_str)

        if error_response:
            return error_response

        # Get all workspace members
        members = WorkspaceMember.objects.filter(
            workspace__slug=slug,
            is_active=True
        ).select_related("member")

        # Get issues in date range
        issues = Issue.issue_objects.filter(
            workspace__slug=slug,
            start_date__isnull=False,
            target_date__isnull=False,
            start_date__lte=end_date,
            target_date__gte=start_date,
        ).prefetch_related("assignees")

        # Calculate capacity metrics
        capacity_data = []
        for member in members:
            user_issues = [
                issue for issue in issues
                if member.member in issue.assignees.all()
            ]

            capacity_data.append({
                "user_id": str(member.member.id),
                "display_name": member.member.display_name,
                "email": member.member.email,
                "avatar": member.member.avatar,
                "total_issues": len(user_issues),
                "urgent_issues": len([i for i in user_issues if i.priority == "urgent"]),
                "high_issues": len([i for i in user_issues if i.priority == "high"]),
            })

        return Response({
            "start_date": start_date,
            "end_date": end_date,
            "capacity": capacity_data
        })

    @action(detail=False, methods=["patch"], url_path="issues/(?P<issue_id>[^/.]+)/dates")
    def update_dates(self, request, slug, issue_id):
        """
        Update issue dates (for drag-and-drop rescheduling)
        Body:
        - start_date: YYYY-MM-DD
        - target_date: YYYY-MM-DD
        """
        try:
            issue = Issue.issue_objects.get(
                id=issue_id,
                workspace__slug=slug
            )
        except Issue.DoesNotExist:
            return Response(
                {"error": "Issue not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Update dates
        start_date = request.data.get("start_date")
        target_date = request.data.get("target_date")

        if start_date:
            issue.start_date = start_date
        if target_date:
            issue.target_date = target_date

        issue.save(update_fields=["start_date", "target_date", "updated_at"])

        return Response(PlanningIssueSerializer(issue).data)

    @action(detail=False, methods=["patch"], url_path="issues/(?P<issue_id>[^/.]+)/reassign")
    def reassign(self, request, slug, issue_id):
        """
        Reassign issue to different user(s)
        Body:
        - assignee_ids: list of user IDs
        """
        try:
            issue = Issue.issue_objects.get(
                id=issue_id,
                workspace__slug=slug
            )
        except Issue.DoesNotExist:
            return Response(
                {"error": "Issue not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        assignee_ids = request.data.get("assignee_ids", [])

        # Clear existing assignees and add new ones
        issue.assignees.clear()
        if assignee_ids:
            issue.assignees.add(*assignee_ids)

        return Response(PlanningIssueSerializer(issue).data)
