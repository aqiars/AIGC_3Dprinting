from rest_framework.views import APIView
from rest_framework.response import Response
from .models import GenerationTask
from .logic import start_ai_task

# 1. 提交任务接口
# 在 api/views.py 中

class GenerateModelView(APIView):
    def post(self, request):
        image = request.FILES.get('image')
        algo = request.data.get('algorithm', 'PATH_B')
        style = request.data.get('style', '')
        prompt = request.data.get('prompt', '')

        # === 新增：获取参数 ===
        # 获取前端传来的数值，如果没有传则使用默认值
        z_scale = request.data.get('z_scale', 50)     # 默认 50
        smoothness = request.data.get('smoothness', 5) # 默认 5

        task = GenerationTask.objects.create(
            original_image=image,
            algorithm_type=algo,
            style=style,
            prompt=prompt
        )

        # === 修改：把参数传给后台任务 ===
        start_ai_task(task.id, z_scale, smoothness)

        return Response({
            "task_id": task.id,
            "status": "PENDING",
            "message": "任务已接收"
        })

# 2. 查询状态接口
class TaskStatusView(APIView):
    def get(self, request, task_id):
        try:
            task = GenerationTask.objects.get(id=task_id)
            data = {
                "task_id": task.id,
                "status": task.status,
            }
            if task.status == 'SUCCESS' and task.result_file:
                # 返回完整的下载链接
                data["model_url"] = request.build_absolute_uri(task.result_file.url)
            
            return Response(data)
        except GenerationTask.DoesNotExist:
            return Response({"error": "Task not found"}, status=404)