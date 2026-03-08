from django.urls import path
from .views import GenerateModelView, TaskStatusView

urlpatterns = [
    path('generate/', GenerateModelView.as_view()),      # POST 提交
    path('tasks/<uuid:task_id>/', TaskStatusView.as_view()), # GET 查询
]