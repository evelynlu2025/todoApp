import json
from datetime import date

from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_POST

from .forms import RegisterForm, TaskForm
from .models import Task


def _serialize_task(task):
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "course": task.course,
        "due_date": task.due_date.isoformat(),
        "estimated_hours": float(task.estimated_hours) if task.estimated_hours is not None else None,
        "completed": task.completed,
    }


def register_view(request):
    if request.user.is_authenticated:
        return redirect("task_list")
    if request.method == "POST":
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect("task_list")
    else:
        form = RegisterForm()
    return render(request, "registration/register.html", {"form": form})


@login_required
def task_list(request):
    tasks = request.user.tasks.all()
    today = date.today()
    return render(
        request,
        "tasks/task_list.html",
        {"tasks": tasks, "today": today},
    )


@login_required
@require_POST
def task_create(request):
    form = TaskForm(request.POST)
    if form.is_valid():
        task = form.save(commit=False)
        task.user = request.user
        task.save()
        return JsonResponse(_serialize_task(task), status=201)
    return JsonResponse({"errors": form.errors}, status=400)


@login_required
@require_POST
def task_toggle(request, pk):
    task = get_object_or_404(Task, pk=pk, user=request.user)
    task.completed = not task.completed
    task.save()
    return JsonResponse({"id": task.id, "completed": task.completed})


@login_required
@require_POST
def task_update(request, pk):
    task = get_object_or_404(Task, pk=pk, user=request.user)
    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({"errors": {"__all__": ["Invalid JSON body."]}}, status=400)
    form = TaskForm(data, instance=task)
    if form.is_valid():
        form.save()
        return JsonResponse(_serialize_task(task))
    return JsonResponse({"errors": form.errors}, status=400)


@login_required
@require_POST
def task_delete(request, pk):
    task = get_object_or_404(Task, pk=pk, user=request.user)
    task.delete()
    return JsonResponse({"deleted": True})
