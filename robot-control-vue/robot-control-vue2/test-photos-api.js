// 测试照片列表API调用
import { getPhotoList } from './src/api/index.js';

async function testPhotoListAPI() {
  console.log('开始测试照片列表API...');
  
  try {
    // 测试获取所有照片
    console.log('1. 获取所有照片信息...');
    const allPhotos = await getPhotoList();
    console.log('API响应:', allPhotos);
    console.log('照片总数:', allPhotos.count);
    console.log('照片列表:', allPhotos.photos);
    
    // 测试获取特定字段
    console.log('\n2. 获取特定字段...');
    const basicInfo = await getPhotoList('filename,size,date');
    console.log('基本信息:', basicInfo);
    
    // 测试空字段
    console.log('\n3. 测试空字段...');
    const emptyFields = await getPhotoList('');
    console.log('空字段结果:', emptyFields);
    
  } catch (error) {
    console.error('API调用失败:', error);
    console.error('错误详情:', error.response?.data || error.message);
  }
}

// 运行测试
testPhotoListAPI(); 