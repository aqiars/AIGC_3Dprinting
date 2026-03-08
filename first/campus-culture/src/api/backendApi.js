import axios from 'axios';

const request = axios.create({
  baseURL: 'http://localhost:3001/api/v1',
  timeout: 10000
});

// 测试接口
export const testBackend = () => request.get('/test');

// 图片上传接口
export const uploadImage = (fileList) => {
  const formData = new FormData();
  Array.from(fileList).forEach(file => formData.append('file', file));
  return request.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// AI建模接口
export const generate3DModel = (data) => request.post('/ai/generate-model', data);

// 打印参数接口（必须存在，解决404的核心）
export const getPrintParams = () => request.get('/print/params');

// 订单创建接口（确保导出语法正确）
export const createOrder = (data) => request.post('/order/create', data);

export default request;