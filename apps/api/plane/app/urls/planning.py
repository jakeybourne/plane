from django.urls import path, include
from rest_framework import routers

from plane.app.views import PlanningViewSet

router = routers.DefaultRouter()

router.register(r"planning", PlanningViewSet, basename="planning")

urlpatterns = [
    path("workspaces/<str:slug>/", include(router.urls)),
]
