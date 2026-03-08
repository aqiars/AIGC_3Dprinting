<template>
  <div class="app-container">
    <header>
      <h1>🏫 校园文创 3D 定制平台</h1>
      <p class="sub-title">马年新春版 | 前后端联调测试</p >
    </header>

    <main>
      <!-- 步骤 1: 图片上传 -->
      <section class="step-card">
        <h2>
          <span class="step-num">01</span> 上传设计图
        </h2>
        <div class="upload-area">
          <input
            type="file"
            class="file-input"
            @change="handleUpload"
            accept="image/jpeg,image/png"
            multiple
          >
          <button class="btn-primary">选择图片 (PNG/JPG)</button>
        </div>

        <!-- 上传结果展示 -->
        <div class="result-box" v-if="imageUrlList.length > 0">
          <p>✅ 上传成功，已选中第一张图进行建模：</p >
          <code>{{ selectedImageUrl }}</code>
        </div>
      </section>

      <!-- 步骤 2: AI 建模 -->
      <section class="step-card">
        <h2>
          <span class="step-num">02</span> 生成 3D 模型
        </h2>
        <button
          class="btn-primary"
          @click="handleGenerateModel"
          :disabled="!selectedImageUrl || isGenerating"
        >
          {{ isGenerating ? '生成中...' : '点击生成 3D 模型' }}
        </button>

        <!-- 建模结果展示 -->
        <div class="result-box" v-if="modelData">
          <p>✅ 模型生成成功！</p >
          <p><strong>模型ID：</strong>{{ modelData.modelId }}</p >
          <p><strong>模型类型：</strong>{{ modelData.modelType }}</p >
          <p><strong>预览链接：</strong><a :href="`http://localhost:3001${modelData.previewUrl}`" target="_blank">点击查看</a ></p >
        </div>
      </section>

      <!-- 步骤 3: 打印参数 -->
      <section class="step-card">
        <h2>
          <span class="step-num">03</span> 选择打印参数
        </h2>
        <div class="params-grid" v-if="Object.keys(printParams).length > 0">
          <div class="param-item" v-for="(options, key) in printParams" :key="key">
            <label>{{ formatKey(key) }}：</label>
            <select v-model="selectedPrintParams[key]">
              <option v-for="opt in options" :key="opt" :value="opt">
                {{ opt }}
              </option>
            </select>
          </div>
        </div>
        <p class="loading-tip" v-else>加载打印参数中...</p >
      </section>

      <!-- 步骤 4: 创建订单 -->
      <section class="step-card">
        <h2>
          <span class="step-num">04</span> 提交定制订单
        </h2>
        <div class="form-grid">
          <div class="form-item">
            <label>姓名：</label>
            <input
              type="text"
              v-model="orderInfo.userName"
              placeholder="请输入您的姓名"
            >
          </div>
          <div class="form-item">
            <label>手机号：</label>
            <input
              type="tel"
              v-model="orderInfo.phone"
              placeholder="请输入联系电话"
            >
          </div>
        </div>

        <button
          class="btn-success"
          @click="handleCreateOrder"
          :disabled="!modelData || !orderInfo.userName || !orderInfo.phone || isCreatingOrder"
        >
          {{ isCreatingOrder ? '提交中...' : '提交订单' }}
        </button>

        <!-- 订单结果展示 -->
        <div class="order-success" v-if="orderData">
          <h3>🎉 订单提交成功！</h3>
          <p><strong>订单编号：</strong>{{ orderData.orderNo }}</p >
          <p><strong>预计价格：</strong>¥{{ orderData.price }}</p >
          <p><strong>当前状态：</strong>{{ orderData.orderStatus === 'pending' ? '待打印' : orderData.orderStatus }}</p >
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
// 引入接口（确保 backendApi.js 路径正确）
import {
  testBackend,
  uploadImage,
  generate3DModel,
  getPrintParams,
  createOrder
} from './api/backendApi';

// ========================= 状态定义 =========================
// 图片相关
const imageUrlList = ref([]);
const selectedImageUrl = ref('');

// 模型相关
const modelData = ref(null);
const isGenerating = ref(false);

// 打印参数相关
const printParams = ref({});
const selectedPrintParams = ref({});

// 订单相关
const orderInfo = ref({ userName: '', phone: '' });
const orderData = ref(null);
const isCreatingOrder = ref(false);

// ========================= 初始化 =========================
onMounted(async () => {
  try {
    // 1. 测试后端连接
    await testBackend();
    console.log('✅ 后端连接成功 (5174 -> 3001)');

    // 2. 获取打印参数
    const res = await getPrintParams();
    printParams.value = res.data.data;

    // 3. 默认选中第一个参数
    Object.keys(printParams.value).forEach(key => {
      selectedPrintParams.value[key] = printParams.value[key][0];
    });

  } catch (err) {
    console.error('❌ 初始化失败:', err);
    alert('❌ 请确保后端服务已启动 (npm run dev)，并运行在 3001 端口！');
  }
});

// ========================= 方法定义 =========================

/**
 * 1. 处理图片上传
 * @param {Event} e - 事件对象
 */
const handleUpload = async (e) => {
  // 核心修复：将 FileList 转换为真正的数组
  const files = Array.from(e.target.files);
  if (files.length === 0) return;

  try {
    const res = await uploadImage(files);
    imageUrlList.value = res.data.data.map(item => item.fileUrl);
    selectedImageUrl.value = imageUrlList.value[0]; // 默认选第一张
    alert(`✅ 成功上传 ${files.length} 张图片！`);
  } catch (err) {
    const msg = err.response?.data?.msg || '上传失败，请检查图片格式';
    alert(`❌ ${msg}`);
    console.error(err);
  }
};

/**
 * 2. 生成 3D 模型
 */
const handleGenerateModel = async () => {
  isGenerating.value = true;
  try {
    const res = await generate3DModel({
      imageUrl: selectedImageUrl.value,
      modelType: 'vector' // 固定为矢量拉伸，也可以做成下拉框让用户选
    });
    modelData.value = res.data.data;
    alert('✅ 3D 模型生成成功！');
  } catch (err) {
    const msg = err.response?.data?.msg || '模型生成失败';
    alert(`❌ ${msg}`);
    console.error(err);
  } finally {
    isGenerating.value = false;
  }
};

/**
 * 3. 创建订单
 */
const handleCreateOrder = async () => {
  isCreatingOrder.value = true;
  try {
    const res = await createOrder({
      modelId: modelData.value.modelId,
      modelType: modelData.value.modelType,
      printParam: selectedPrintParams.value,
      userName: orderInfo.value.userName,
      phone: orderInfo.value.phone
    });
    orderData.value = res.data.data;
  } catch (err) {
    const msg = err.response?.data?.msg || '订单创建失败';
    alert(`❌ ${msg}`);
    console.error(err);
  } finally {
    isCreatingOrder.value = false;
  }
};

/**
 * 辅助函数：格式化参数名显示
 * @param {string} key - 原始键名
 * @returns {string} - 格式化后的名称
 */
const formatKey = (key) => {
  const map = {
    layerThickness: '层厚',
    printTemp: '打印温度',
    material: '耗材类型',
    fillRate: '填充率'
  };
  return map[key] || key;
};
</script>

<style scoped>
/* 全局样式 */
.app-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f7fa;
  min-height: 100vh;
}

header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eaecef;
}

h1 {
  color: #2d3748;
  margin-bottom: 8px;
}

.sub-title {
  color: #718096;
  font-size: 14px;
}

main {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

/* 步骤卡片 */
.step-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.step-card h2 {
  color: #2d3748;
  margin: 0 0 20px 0;
  font-size: 18px;
  display: flex;
  align-items: center;
}

.step-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background-color: #4299e1;
  color: white;
  border-radius: 50%;
  font-size: 14px;
  margin-right: 10px;
}

/* 上传区域 */
.upload-area {
  position: relative;
  margin-bottom: 15px;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 10;
}

/* 按钮样式 */
.btn-primary, .btn-success {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #4299e1;
  color: white;
}

.btn-success {
  background-color: #10b981;
  color: white;
  margin-top: 10px;
}

.btn-primary:disabled, .btn-success:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
  opacity: 0.7;
}

.btn-primary:hover:not(:disabled) {
  background-color: #3182ce;
}

.btn-success:hover:not(:disabled) {
  background-color: #059669;
}

/* 结果与表单样式 */
.result-box, .order-success {
  margin-top: 15px;
  padding: 15px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
}

.result-box {
  background-color: #e6fffa;
  border: 1px solid #b2f5ea;
  color: #234e52;
}

.order-success {
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
}

code {
  background-color: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  color: #e53e3e;
  word-break: break-all;
}

.params-grid, .form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.param-item, .form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label {
  font-size: 14px;
  color: #4a5568;
  font-weight: 500;
}

select, input {
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  color: #2d3748;
}

select:focus, input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.2);
}

.loading-tip {
  color: #718096;
  font-style: italic;
}
</style>