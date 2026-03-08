<template>
  <div class="home-container">
    <!-- 校园文创风格头部 -->
    <header class="home-header">
      <h1>北邮校园文创 · 个性化定制平台</h1>
      <p>{{ 'AI 3D打印，把校园记忆变成专属实物' }}</p >
    </header>

    <!-- 核心功能入口 -->
    <main class="home-main">
      <el-card class="custom-card" @click="goToUpload">
        <el-icon class="card-icon"><CameraFilled /></el-icon>
        <h3>上传校园景物</h3>
        <p>拍摄3-5张不同角度照片，生成专属3D模型</p >
      </el-card>

      <el-card class="custom-card" @click="goToPreview" v-if="hasModel">
        <el-icon class="card-icon"><Box /></el-icon>
        <h3>预览3D模型</h3>
        <p>缩放、旋转查看，确认定制效果</p >
      </el-card>

      <el-card class="custom-card" @click="goToOrder" v-if="hasModel">
        <el-icon class="card-icon"><ShoppingCart /></el-icon>
        <h3>提交定制订单</h3>
        <p>选择尺寸、材质，一键下单等待收货</p >
      </el-card>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { CameraFilled, Box, ShoppingCart } from '@element-plus/icons-vue';
import { ElCard, ElIcon } from 'element-plus';

const router = useRouter();
const hasModel = ref(false);

// 跳转上传页
const goToUpload = () => router.push('/upload');
// 跳转预览页
const goToPreview = () => router.push('/preview');
// 跳转订单页
const goToOrder = () => router.push('/order');
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background-color: #f5fafe;
  padding: 20px;
}
.home-header {
  text-align: center;
  margin-bottom: 40px;
  color: #1989fa;
}
.home-main {
  display: flex;
  gap: 30px;
  justify-content: center;
  flex-wrap: wrap;
}
.custom-card {
  width: 300px;
  height: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}
.custom-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}
.card-icon {
  font-size: 48px;
  color: #1989fa;
  margin-bottom: 15px;
}
</style>