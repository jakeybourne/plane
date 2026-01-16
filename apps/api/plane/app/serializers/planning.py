# Third party imports
from rest_framework import serializers

# Module imports
from .base import BaseSerializer
from .user import UserLiteSerializer
from .project import ProjectLiteSerializer
from plane.db.models import Issue


class PlanningIssueSerializer(serializers.ModelSerializer):
    """Optimized serializer for planning timeline view"""
    assignee_ids = serializers.SerializerMethodField()
    assignees = UserLiteSerializer(many=True, read_only=True)
    project = ProjectLiteSerializer(read_only=True)
    state_group = serializers.CharField(source='state.group', read_only=True)

    class Meta:
        model = Issue
        fields = [
            "id",
            "name",
            "sequence_id",
            "project_id",
            "project",
            "start_date",
            "target_date",
            "priority",
            "state_id",
            "state_group",
            "estimate_point",
            "assignee_ids",
            "assignees",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_assignee_ids(self, obj):
        """Get list of assignee IDs"""
        return [str(assignee.id) for assignee in obj.assignees.all()]


class PlanningTimelineSerializer(serializers.Serializer):
    """Serializer for grouped timeline data"""
    view_by = serializers.CharField()
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    data = serializers.JSONField()
