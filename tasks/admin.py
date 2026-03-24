from django.contrib import admin

from .models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "course", "due_date", "completed")
    list_filter = ("completed", "due_date", "course")
    search_fields = ("title", "description", "course")
