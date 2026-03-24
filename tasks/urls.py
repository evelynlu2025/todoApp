from django.urls import path

from . import views

urlpatterns = [
    path("", views.task_list, name="task_list"),
    path("api/tasks/", views.task_create, name="task_create"),
    path("api/tasks/<int:pk>/toggle/", views.task_toggle, name="task_toggle"),
    path("api/tasks/<int:pk>/", views.task_update, name="task_update"),
    path("api/tasks/<int:pk>/delete/", views.task_delete, name="task_delete"),
]
