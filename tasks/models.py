from django.db import models
from django.conf import settings


class Task(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="tasks",
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    course = models.CharField(max_length=120, blank=True, default="")
    due_date = models.DateField()
    estimated_hours = models.DecimalField(
        max_digits=5, decimal_places=1, null=True, blank=True,
        help_text="Estimated hours to complete",
    )
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["completed", "due_date", "-created_at"]

    def __str__(self):
        return self.title
