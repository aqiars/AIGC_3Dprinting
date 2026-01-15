from django.db import models
import uuid

class GenerationTask(models.Model):
    STATUS_CHOICES = [
        ('PENDING', '排队中'),
        ('PROCESSING', 'AI处理中'),
        ('SUCCESS', '成功'),
        ('FAILED', '失败'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    original_image = models.ImageField(upload_to='uploads/')
    algorithm_type = models.CharField(max_length=20) # PATH_A 或 PATH_B
    style = models.CharField(max_length=50, blank=True, null=True) # 风格
    prompt = models.TextField(blank=True, null=True) # 提示词
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    result_file = models.FileField(upload_to='outputs/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)