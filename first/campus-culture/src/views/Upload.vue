<template>
  <div class="upload-container">
    <el-page-header content="上传校园景物照片" />

    <!-- 拍摄指引 -->
    <el-card class="guide-card">
      <h3>📸 拍摄要求</h3>
      <ul>
        <li>拍摄3-5张不同角度（正面、侧面、顶部）的校园景物（校徽、雕塑、建筑等）</li>
        <li>保证光线充足，避免遮挡，对焦清晰</li>
        <li>单张图片不超过5MB，支持JPG/PNG格式</li>
      </ul>
    </el-card>

    <!-- 图片上传组件 -->
    <el-upload
      class="upload-demo"
      action=""
      :auto-upload="false"
      :on-change="handleFileChange"
      :file-list="fileList"
      list-type="picture-card"
      :limit="5"
      accept="image/jpeg,image/png"
    >
      <i class="el-icon-plus"></i>
    </el-upload>

    <!-- 操作按钮 -->
    <div class="btn-group">
      <el-button type="primary" @click="submitUpload" :disabled="fileList.length < 3">
        提交生成3D模型
      </el-button>
      <el-button @click="router.back()">返回首页</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { ElPageHeader, ElCard, ElUpload, ElButton, ElMessage } from 'element-plus';

const router = useRouter();
const fileList = ref([]); // 已选择的图片列表
const loading = ref(false); // 加载状态

// 处理文件选择
const handleFileChange = (uploadFile, uploadFiles) => {
  fileList.value = uploadFiles;
};

// 提交图片给后端，触发AI生成模型
const submitUpload = async () => {
  loading.value = true;
  try {
    // 后续可补充接口请求逻辑
    ElMessage.success('图片提交成功，正在生成3D模型');
    router.push('/preview');
  } catch (error) {
    ElMessage.error('提交失败，请重试');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.upload-container {
  padding: 20px;
  min-height: 100vh;
  box-sizing: border-box;
}
.guide-card {
  margin-bottom: 20px;
}
.upload-demo {
  margin: 20px 0;
}
.btn-group {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}
</style>