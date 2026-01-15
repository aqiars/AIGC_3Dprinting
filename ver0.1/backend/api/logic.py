import threading
import time
import os
import cv2
import numpy as np
from django.conf import settings
from .models import GenerationTask

class AIProcessor(threading.Thread):
    # 1. 修改初始化函数，接收更多参数
    def __init__(self, task_id, z_scale=50, smooth_level=5):
        self.task_id = task_id
        # 将前端传来的 1-100 的数值，转换为算法能用的系数
        self.z_scale = float(z_scale) / 1000.0  # 比如 50 -> 0.05
        self.smooth_level = int(smooth_level)
        # 确保模糊核是奇数 (OpenCV要求)
        if self.smooth_level % 2 == 0: self.smooth_level += 1
        if self.smooth_level < 1: self.smooth_level = 1
            
        super().__init__()

    def run(self):
        try:
            task = GenerationTask.objects.get(id=self.task_id)
            task.status = 'PROCESSING'
            task.save()
            
            input_path = task.original_image.path
            output_filename = f"model_{task.id}.obj"
            output_path = os.path.join(settings.MEDIA_ROOT, 'outputs', output_filename)
            os.makedirs(os.path.dirname(output_path), exist_ok=True)

            print(f">>> 开始生成: 高度系数={self.z_scale}, 平滑度={self.smooth_level}")

            if task.algorithm_type == 'PATH_A' or True:
                self.generate_heightmap_mesh(input_path, output_path)

            task.result_file.name = f"outputs/{output_filename}"
            task.status = 'SUCCESS'
            task.save()

        except Exception as e:
            print(f"Error: {e}")
            import traceback
            traceback.print_exc()
            task.status = 'FAILED'
            task.save()

    def generate_heightmap_mesh(self, input_path, output_path):
        img = cv2.imread(input_path, cv2.IMREAD_GRAYSCALE)
        
        # 提高分辨率
        max_size = 350 
        h, w = img.shape
        scale = max_size / max(h, w)
        new_w, new_h = int(w * scale), int(h * scale)
        img = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)

        # === 使用动态的平滑参数 ===
        if self.smooth_level > 1:
            img = cv2.GaussianBlur(img, (self.smooth_level, self.smooth_level), 0)

        # 智能反转
        if np.mean(img) > 127: img = 255 - img

        vertices = []
        
        print(f"生成网格... Z系数: {self.z_scale}")

        for y in range(new_h):
            for x in range(new_w):
                pixel_value = img[y][x]
                vx = (x - new_w / 2) * 1.0
                vy = ((new_h - y) - new_h / 2) * 1.0
                
                # === 使用动态的高度参数 ===
                vz = pixel_value * self.z_scale 
                
                vertices.append((vx, vy, vz))
        
        with open(output_path, 'w') as f:
            f.write(f"# Parametric Model\n")
            f.write(f"o Custom_3D_Model\n")
            for v in vertices:
                f.write(f"v {v[0]:.3f} {v[1]:.3f} {v[2]:.3f}\n")
            for y in range(new_h - 1):
                for x in range(new_w - 1):
                    p1 = y * new_w + x + 1
                    p2 = p1 + 1
                    p3 = (y + 1) * new_w + x + 1
                    p4 = p3 + 1
                    f.write(f"f {p1} {p3} {p4} {p2}\n")

# 2. 修改启动函数，接收参数
def start_ai_task(task_id, z_scale, smooth_level):
    processor = AIProcessor(task_id, z_scale, smooth_level)
    processor.start()