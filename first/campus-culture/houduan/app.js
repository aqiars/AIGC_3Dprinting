// 引入核心依赖
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

// 引入数据库连接和模型
const sequelize = require('./config/db');
const Order = require('./models/Order');

// 初始化 Express 实例
const app = express();
const PORT = process.env.PORT || 3001;

// 全局中间件
app.use(cors()); // 解决跨域
app.use(express.json()); // 解析 JSON 请求体
app.use(express.urlencoded({ extended: true })); // 解析表单数据

// 统一返回格式中间件
app.use((req, res, next) => {
  res.sendResult = (data = null, code = 200, msg = '操作成功') => {
    res.json({ code, msg, data });
  };
  next();
});

// ==================== 图片上传配置 ====================
const uploadImageDir = path.join(__dirname, 'uploads/images');
fs.ensureDirSync(uploadImageDir);

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadImageDir);
  },
  filename: (req, file, cb) => {
    const uniqueFileName = `${Date.now()}-${encodeURIComponent(file.originalname)}`;
    cb(null, uniqueFileName);
  }
});

const imageFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('仅支持JPG、PNG格式的图片，且文件大小不超过5M！'), false);
  }
};

const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5M
});

// 静态资源托管（让前端能访问上传的图片）
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 同步模型到数据库（开发环境使用）
sequelize.sync({ force: false }).then(() => {
  console.log('✅ 数据库表同步完成');
});

// ==================== 接口定义 ====================

// 1. 测试接口
app.get('/api/v1/test', (req, res) => {
  res.sendResult({ tip: '后端服务启动成功，可正常对接前端' });
});

// 2. 图片上传接口
app.post('/api/v1/upload/image', uploadImage.array('file', 9), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.sendResult(null, 400, '请选择要上传的图片！');
    }
    const imageList = req.files.map(file => ({
      fileName: file.originalname,
      fileUrl: `/uploads/images/${file.filename}`,
      fileSize: (file.size / 1024).toFixed(2) + 'KB'
    }));
    res.sendResult(imageList, 200, '图片上传成功！');
  } catch (err) {
    res.sendResult(null, 500, err.message || '图片上传失败！');
  }
});

// 3. AI 3D模型生成接口（模拟版）
app.post('/api/v1/ai/generate-model', (req, res) => {
  try {
    const { imageUrl, modelType } = req.body;
    if (!imageUrl || !modelType) {
      return res.sendResult(null, 400, '图片链接和建模类型不能为空！');
    }
    const modelData = {
      modelId: Date.now(),
      imageUrl: imageUrl,
      modelType: modelType,
      modelUrl: `/uploads/models/${Date.now()}-model.stl`,
      previewUrl: `/uploads/previews/${Date.now()}-preview.png`,
      createTime: new Date().toLocaleString()
    };
    res.sendResult(modelData, 200, '3D模型生成成功！');
  } catch (err) {
    res.sendResult(null, 500, err.message || '3D模型生成失败！');
  }
});

// 4. 3D打印参数查询接口
app.get('/api/v1/print/params', (req, res) => {
  try {
    const printParams = {
      layerThickness: ['0.1mm', '0.2mm', '0.3mm'],
      printTemp: ['190℃', '200℃', '210℃'],
      material: ['PLA', 'ABS', 'PETG'],
      fillRate: ['20%', '50%', '80%']
    };
    res.sendResult(printParams, 200, '打印参数查询成功！');
  } catch (err) {
    res.sendResult(null, 500, err.message || '打印参数查询失败！');
  }
});

// 5. 订单创建接口（真实写入MySQL）
app.post('/api/v1/order/create', async (req, res) => {
  try {
    const { modelId, modelType, printParam, userName, phone } = req.body;

    if (!modelId || !printParam || !userName || !phone) {
      return res.sendResult(null, 400, '模型ID、打印参数、姓名、手机号不能为空！');
    }

    const orderNo = `XY${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    // 写入MySQL数据库
    const order = await Order.create({
      orderNo,
      modelId,
      modelType: modelType || 'vector',
      printParam,
      userName,
      phone,
      price: Math.floor(Math.random() * 50 + 20)
    });

    res.sendResult(order, 200, '订单创建成功（已存入数据库）');

  } catch (err) {
    res.sendResult(null, 500, '订单创建失败：' + err.message);
  }
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error('全局错误：', err);
  res.sendResult(null, 500, err.message || '服务器内部错误');
});

// 启动服务
app.listen(PORT, () => {
  console.log(`✅ 后端服务成功启动，运行在：http://localhost:${PORT}`);
});