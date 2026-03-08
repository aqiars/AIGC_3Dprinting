<template>
  <div class="preview-container">
    <el-page-header content="3D模型预览" />

    <!-- 3D模型展示容器 -->
    <div class="model-container" ref="modelRef"></div>

    <!-- 模型操作按钮 -->
    <div class="control-btn-group">
      <el-button icon="el-icon-refresh" @click="resetModel">重置视角</el-button>
      <el-button icon="el-icon-zoom-in" @click="zoomIn">放大</el-button>
      <el-button icon="el-icon-zoom-out" @click="zoomOut">缩小</el-button>
      <el-button icon="el-icon-refresh-right" @click="autoRotate">自动旋转</el-button>
    </div>

    <!-- 底部操作 -->
    <div class="bottom-btn-group">
      <el-button @click="router.back()">返回上传页</el-button>
      <el-button type="primary" @click="goToOrder">确认效果，去下单</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ElPageHeader, ElButton, ElMessage } from 'element-plus';

const router = useRouter();
const modelRef = ref(null); // 3D容器引用
let scene, camera, renderer, controls, model, autoRotateInterval;

// 初始化3D场景
const initScene = () => {
  // 1. 创建场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf5fafe);

  // 2. 创建相机
  camera = new THREE.PerspectiveCamera(75, modelRef.value.clientWidth / modelRef.value.clientHeight, 0.1, 1000);
  camera.position.z = 5;

  // 3. 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(modelRef.value.clientWidth, modelRef.value.clientHeight);
  modelRef.value.appendChild(renderer.domElement);

  // 4. 添加控制器（支持拖拽、缩放）
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // 平滑阻尼效果

  // 5. 添加灯光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  // 6. 加载测试模型（实际项目替换为后端返回的GLB/OBJ模型）
  loadTestModel();
};

// 加载测试模型（模拟后端返回）
const loadTestModel = () => {
  // 用简单立方体模拟（实际替换为模型加载器）
  const geometry = new THREE.BoxGeometry(2, 2, 2);
  const material = new THREE.MeshLambertMaterial({ color: 0x1989fa });
  model = new THREE.Mesh(geometry, material);
  scene.add(model);
};

// 模型操作方法
const resetModel = () => {
  camera.position.z = 5;
  controls.reset();
};

const zoomIn = () => {
  camera.position.z = Math.max(2, camera.position.z - 1);
};

const zoomOut = () => {
  camera.position.z = Math.min(10, camera.position.z + 1);
};

const autoRotate = () => {
  if (autoRotateInterval) {
    clearInterval(autoRotateInterval);
    autoRotateInterval = null;
    ElMessage.success('已停止自动旋转');
  } else {
    autoRotateInterval = setInterval(() => {
      model.rotation.y += 0.01;
    }, 30);
    ElMessage.success('已开启自动旋转');
  }
};

// 窗口大小适配
const handleResize = () => {
  camera.aspect = modelRef.value.clientWidth / modelRef.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(modelRef.value.clientWidth, modelRef.value.clientHeight);
};

// 生命周期钩子
onMounted(() => {
  initScene();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (autoRotateInterval) clearInterval(autoRotateInterval);
  renderer.dispose();
});

// 渲染循环
const animate = () => {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
};
animate();

// 跳转下单页
const goToOrder = () => {
  router.push('/order');
};
</script>

<style scoped>
.preview-container {
  padding: 20px;
  min-height: 100vh;
  box-sizing: border-box;
}
.model-container {
  width: 100%;
  height: 60vh;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin: 20px 0;
}
.control-btn-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.bottom-btn-group {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
</style>