"""
Send morning reminder emails to users with tasks due today.

Usage:
    python manage.py send_reminders

In production, schedule this with cron (e.g. every day at 7 AM):
    0 7 * * * cd /path/to/project && python manage.py send_reminders
"""

from datetime import date

from django.conf import settings
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Email each user a summary of tasks due today."

    def handle(self, *args, **options):
        today = date.today()
        users_notified = 0

        for user in User.objects.filter(is_active=True).exclude(email=""):
            task_list = list(user.tasks.filter(due_date=today, completed=False))
            if not task_list:
                continue

            count = len(task_list)
            task_lines = [f"  - {t.title}" + (f" ({t.course})" if t.course else "") for t in task_list]
            body = (
                f"Good morning, {user.username}!\n\n"
                f"You have {count} task(s) due today:\n\n"
                + "\n".join(task_lines)
                + "\n\nLog in to Tesa to check them off. Have a great day!"
            )

            send_mail(
                subject=f"Tesa: You have {count} task(s) due today",
                message=body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
            )
            users_notified += 1
            self.stdout.write(self.style.SUCCESS(f"  Sent reminder to {user.email}"))

        self.stdout.write(
            self.style.SUCCESS(f"Done — notified {users_notified} user(s) for {today}.")
        )
