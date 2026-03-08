<template>
  <div class="order-container">
    <el-page-header content="提交定制订单" />

    <div class="order-content">
      <!-- 左侧：订单信息 -->
      <div class="order-form">
        <el-form :model="orderForm" :rules="orderRules" ref="orderFormRef" label-width="100px">
          <el-form-item label="产品名称" prop="productName">
            <el-input v-model="orderForm.productName" disabled value="个性化校园文创3D打印产品" />
          </el-form-item>

          <el-form-item label="尺寸规格" prop="size">
            <el-select v-model="orderForm.size" placeholder="请选择尺寸">
              <el-option label="小（5cm×5cm×5cm）" value="small" :key="1">小（5cm×5cm×5cm） - 99元</el-option>
              <el-option label="中（10cm×10cm×10cm）" value="medium" :key="2">中（10cm×10cm×10cm） - 159元</el-option>
              <el-option label="大（15cm×15cm×15cm）" value="large" :key="3">大（15cm×15cm×15cm） - 229元</el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="打印材质" prop="material">
            <el-select v-model="orderForm.material" placeholder="请选择材质">
              <el-option label="PLA（环保塑料，默认）" value="pla" :key="1">PLA（环保塑料） - 0元</el-option>
              <el-option label="树脂（高精度）" value="resin" :key="2">树脂（高精度） - 额外+50元</el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="联系人" prop="contact">
            <el-input v-model="orderForm.contact" placeholder="请输入姓名" />
          </el-form-item>

          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="orderForm.phone" placeholder="请输入手机号" />
          </el-form-item>

          <el-form-item label="收货地址" prop="address">
            <el-input v-model="orderForm.address" placeholder="请输入校园收货地址（如XX宿舍楼XX室）" />
          </el-form-item>

          <el-form-item label="备注信息">
            <el-input v-model="orderForm.remark" type="textarea" :rows="3" placeholder="可选：如特殊工艺要求、收货时间偏好等" />
          </el-form-item>
        </el-form>
      </div>

      <!-- 右侧：订单汇总 -->
      <div class="order-summary">
        <el-card>
          <h3>订单汇总</h3>
          <div class="summary-item">
            <span>基础价格</span>
            <span>{{ basePrice }}元</span>
          </div>
          <div class="summary-item" v-if="orderForm.material === 'resin'">
            <span>材质加价</span>
            <span>+50元</span>
          </div>
          <div class="summary-total">
            <span>实付款</span>
            <span>{{ totalPrice }}元</span>
          </div>
          <el-button type="primary" class="submit-btn" @click="submitOrder">提交订单</el-button>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { ElPageHeader, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElCard, ElButton, ElMessage } from 'element-plus';

const router = useRouter();
const orderFormRef = ref(null); // 表单引用

// 订单表单数据
const orderForm = ref({
  productName: '个性化校园文创3D打印产品',
  size: '',
  material: 'pla',
  contact: '',
  phone: '',
  address: '',
  remark: ''
});

// 表单校验规则
const orderRules = ref({
  size: [{ required: true, message: '请选择尺寸规格', trigger: 'change' }],
  contact: [{ required: true, message: '请输入联系人姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }, { pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误', trigger: 'blur' }],
  address: [{ required: true, message: '请输入收货地址', trigger: 'blur' }]
});

// 价格计算
const basePrice = computed(() => {
  switch (orderForm.value.size) {
    case 'small': return 99;
    case 'medium': return 159;
    case 'large': return 229;
    default: return 0;
  }
});

const totalPrice = computed(() => {
  return orderForm.value.material === 'resin' ? basePrice.value + 50 : basePrice.value;
});

// 提交订单
const submitOrder = async () => {
  // 表单校验
  await orderFormRef.value.validate();

  try {
    // 提交订单数据到后端
    const res = await axios.post('/api/order/submit', {
      ...orderForm.value,
      totalPrice: totalPrice.value
    });

    if (res.data.success) {
      ElMessage.success('订单提交成功！工作人员将尽快为您打印发货');
      // 跳转首页
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } else {
      ElMessage.error('订单提交失败，请重试');
    }
  } catch (error) {
    ElMessage.error('网络异常，请稍后再试');
    console.error('订单提交失败：', error);
  }
};
</script>

<style scoped>
.order-container {
  padding: 20px;
  min-height: 100vh;
  box-sizing: border-box;
}
.order-content {
  display: flex;
  gap: 30px;
  margin-top: 20px;
}
.order-form {
  flex: 1;
}
.order-summary {
  width: 350px;
}
.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}
.summary-total {
  display: flex;
  justify-content: space-between;
  padding: 15px 0;
  font-size: 18px;
  font-weight: bold;
  color: #1989fa;
}
.submit-btn {
  width: 100%;
  margin-top: 20px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .order-content {
    flex-direction: column;
  }
  .order-summary {
    width: 100%;
  }
}
</style>