# Tesa — Task Manager for Students

A multiuser to-do list web app built with Django and vanilla JavaScript, designed for CMU undergrads to track coursework and get daily reminders.

## Features

- **Per-user task lists** — register, log in, and manage your own tasks
- **Course + due-date tracking** — associate each task with a class and deadline
- **Visual urgency cues** — overdue tasks highlighted red, due-today tasks highlighted amber
- **Quick filters** — view All / Due Today / Upcoming / Overdue / Completed
- **Inline editing** — add, edit, toggle, and delete tasks without page reloads
- **Morning email reminders** — a management command emails users about tasks due today

## Quick Start

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run migrations
python manage.py migrate

# 3. Create a superuser (optional, for /admin)
python manage.py createsuperuser

# 4. Start the dev server
python manage.py runserver
```

Then open **http://127.0.0.1:8000/** and create an account.

## Daily Reminders

The `send_reminders` management command emails every user who has incomplete tasks due today.

```bash
python manage.py send_reminders
```

During development, emails print to the console (configured via `EMAIL_BACKEND`).

For production, switch to an SMTP backend in `tesa/settings.py` and schedule the command with cron:

```
0 7 * * * cd /path/to/tesaAPP && python manage.py send_reminders
```

## Project Structure

```
tesaAPP/
├── manage.py
├── requirements.txt
├── tesa/              # Django project settings & root URL config
├── tasks/             # Main app — models, views, forms, management commands
├── templates/         # HTML templates (base, auth, task list)
└── static/            # CSS & JavaScript
    ├── css/style.css
    └── js/app.js
```

## Merged PR Log

