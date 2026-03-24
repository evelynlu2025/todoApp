from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

from .models import Task


class TaskForm(forms.ModelForm):
    class Meta:
        model = Task
        fields = ["title", "description", "course", "due_date"]
        widgets = {
            "title": forms.TextInput(attrs={"placeholder": "e.g. Finish homework 3"}),
            "description": forms.Textarea(
                attrs={"rows": 3, "placeholder": "Optional details..."}
            ),
            "course": forms.TextInput(attrs={"placeholder": "e.g. 15-112"}),
            "due_date": forms.DateInput(
                attrs={"type": "date"},
                format="%Y-%m-%d",
            ),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["due_date"].input_formats = ["%Y-%m-%d"]


class RegisterForm(UserCreationForm):
    email = forms.EmailField(required=True)

    class Meta:
        model = User
        fields = ["username", "email", "password1", "password2"]
