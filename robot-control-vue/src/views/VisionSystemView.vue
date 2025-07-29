<template>
  <div class="container">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="nav-section">
        <button class="btn btn-back" @click="goBack">← 返回主页</button>
        <h1 class="title">视觉系统控制中心</h1>
      </div>
      <div class="header-controls">
        <div class="header-buttons">
          <button class="btn btn-small header-action-btn" @click="showMotionDialog = true">运动检测</button>
          <button class="btn btn-small header-action-btn" @click="showTongueDialog = true">舌苔检测</button>
        </div>
      </div>
    </header>

    <main class="vision-main">
      <!-- 主要内容区域 - 全宽显示 -->
      <div class="vision-full-width-container">
        <!-- 摄像头和拍摄控制区域 -->
        <div class="vision-controls-section">
          <!-- 摄像头预览区域 -->
          <section class="camera-preview-section">
            <div class="camera-header">
              <h3>摄像头控制</h3>
              <div class="camera-status-indicator" :class="cameraStatusClass">
                <div class="status-dot"></div>
                <span>{{ cameraStatus }}</span>
              </div>
            </div>

            <div class="camera-preview-container">
              <div class="camera-preview-box">
                <div v-if="videoLoading" class="video-loading">
                  <div class="loading-spinner"></div>
                  <span>正在连接摄像头...</span>
                </div>
                <img
                  v-else
                  :src="getVideoFeed()"
                  class="camera-preview"
                  @error="handleVideoError"
                  @load="handleVideoLoad"
                />
                <canvas ref="canvasRef" style="display: none;"></canvas>
              </div>
            </div>
          </section>

          <!-- 拍摄控制区域 -->
          <section class="camera-controls-section">
            <div class="controls-header">
              <h3>拍摄控制</h3>
            </div>

            <!-- 拍照间隔和按钮在同一行 -->
            <div class="controls-row">
              <div class="interval-input-group">
                <label class="input-label">拍照间隔</label>
                <div class="input-with-unit">
                  <input
                    type="number"
                    v-model.number="photoInterval"
                    min="1"
                    max="60"
                    class="form-input"
                  />
                  <span class="input-unit">秒</span>
                </div>
              </div>

              <div class="buttons-group">
                <button class="btn btn-primary" @click="takePhoto">
                  <span class="btn-icon">📷</span>
                  立即拍照
                </button>
                <button
                  class="btn btn-success"
                  @click="startContinuousPhoto"
                  :disabled="isContinuousPhotoActive"
                >
                  {{ isContinuousPhotoActive ? '拍摄中...' : '启动连续拍摄' }}
                </button>
                <button
                  class="btn btn-danger"
                  @click="stopContinuousPhoto"
                  :disabled="!isContinuousPhotoActive"
                >
                  停止连续拍摄
                </button>
              </div>
            </div>

            <!-- 拍摄状态信息 -->
            <div class="timer-status" v-if="isContinuousPhotoActive">
              <div class="status-item">
                <span class="status-label">状态:</span>
                <span class="status-value active">运行中 (间隔: {{ photoInterval }}秒)</span>
              </div>
              <div class="status-item">
                <span class="status-label">已拍摄:</span>
                <span class="status-value">{{ continuousPhotoCount }}张</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- 已拍摄照片列表 -->
      <section class="photo-list-section">
        <div class="section-header">
          <h3>照片管理</h3>
          <div class="photo-count-badge">
            {{ photos.length }}张照片
          </div>
        </div>

        <div v-if="photos.length === 0" class="empty-state">
          <div class="empty-icon">📷</div>
          <p class="empty-text">暂无照片</p>
          <p class="empty-hint">点击"立即拍照"开始拍摄</p>
        </div>

        <div class="photo-grid" v-else>
          <div v-for="(photo, idx) in photos" :key="'photo-' + photo.filename + '-' + idx" class="photo-card">
            <div class="photo-preview">
              <img :src="photo.url" :alt="photo.filename" class="photo-image" />
              <div class="photo-overlay">
                <button class="overlay-btn" @click="previewPhoto(photo)" title="预览">
                  👁️
                </button>
                <button class="overlay-btn" @click="downloadPhoto(photo)" title="下载">
                  💾
                </button>
                <button class="overlay-btn delete" @click="deletePhoto(idx)" title="删除">
                  🗑️
                </button>
              </div>
            </div>
            <div class="photo-info">
              <div class="photo-name">{{ photo.filename }}</div>
              <div class="photo-details">
                <span class="photo-size">{{ formatFileSize(photo.size) }}</span>
                <span class="photo-date">{{ photo.date }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 弹窗组件 -->
      <MotionAnalysisDialog :visible="showMotionDialog" :videos="videos" @close="showMotionDialog=false" />
      <TongueAnalysisDialog :visible="showTongueDialog" :videos="videos" @close="showTongueDialog=false" />

      <!-- 预览弹窗 -->
      <div v-if="showPreview" class="preview-modal" @click="closePreview">
        <div class="preview-content" @click.stop>
          <button class="close-btn" @click="closePreview">&times;</button>
          <img :src="previewUrl" class="preview-media" />
        </div>
      </div>
    </main>
  </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRouter } from 'vue-router';
import MotionAnalysisDialog from '../components/MotionAnalysisDialog.vue';
import TongueAnalysisDialog from '../components/TongueAnalysisDialog.vue';
import { 
  getRawVideoFeed,
  getPhotoList,
  deletePhoto as apiDeletePhoto,
  takePhoto as apiTakePhoto,
  startContinuousPhoto as apiStartContinuousPhoto,
  stopContinuousPhoto as apiStopContinuousPhoto,
  checkCameraStatus
} from '../api';

// 路由
const router = useRouter();

// 暴露给模板使用的函数
const getVideoFeed = () => {
  const videoUrl = getRawVideoFeed();
  console.log('视频流URL:', videoUrl);
  return videoUrl;
};

// DOM引用
const canvasRef = ref(null);

// 摄像头相关
const cameraActive = ref(false);
const cameraStatus = ref('摄像头未连接');
const cameraInfo = ref(null);
const videoLoading = ref(true);

// 拍照相关
const photos = ref([]); // {filename, size, size_kb, date, url, download_url}
const photoInterval = ref(5);
const isContinuousPhotoActive = ref(false);
const continuousPhotoCount = ref(0);

// 预览相关
const showPreview = ref(false);
const previewUrl = ref('');

// 弹窗相关
const showMotionDialog = ref(false);
const showTongueDialog = ref(false);

// 视频数据 - 用于弹窗组件
const videos = ref([
  { name: '运动视频1', url: '/api/video/motion1.mp4' },
  { name: '运动视频2', url: '/api/video/motion2.mp4' },
  { name: '舌苔视频1', url: '/api/video/tongue1.mp4' },
  { name: '舌苔视频2', url: '/api/video/tongue2.mp4' }
]);

// 计算属性
const cameraStatusClass = computed(() => {
  if (cameraStatus.value.includes('已连接') || cameraStatus.value.includes('正常')) {
    return 'online';
  } else if (cameraStatus.value.includes('连接中') || cameraStatus.value.includes('加载')) {
    return 'connecting';
  } else {
    return 'offline';
  }
});

// 方法
const goBack = () => {
  router.push('/');
};



// 生命周期
onMounted(() => {
  window.addEventListener('open-motion-dialog', () => showMotionDialog.value = true);
  window.addEventListener('open-tongue-dialog', () => showTongueDialog.value = true);
  initializeCamera();
  loadPhotoList();
});

onBeforeUnmount(() => {
  // 如果连续拍照还在运行，尝试停止它
  if (isContinuousPhotoActive.value) {
    stopContinuousPhoto();
  }
  
  // 清理定时器
  if (photoCountTimer) {
    clearInterval(photoCountTimer);
    photoCountTimer = null;
  }
  
  window.removeEventListener('open-motion-dialog', () => showMotionDialog.value = true);
  window.removeEventListener('open-tongue-dialog', () => showTongueDialog.value = true);
});

// 摄像头控制
async function initializeCamera() {
  try {
    console.log('开始初始化摄像头...');
    videoLoading.value = true;
    
    // 调用API检查摄像头状态
    const cameraStatusResult = await checkCameraStatus();
    console.log('摄像头状态API响应:', cameraStatusResult);
    
    if (cameraStatusResult && cameraStatusResult.success) {
      cameraActive.value = true;
      cameraStatus.value = cameraStatusResult.message || '摄像头已连接';
      cameraInfo.value = cameraStatusResult;
      console.log('摄像头初始化成功:', cameraStatusResult);
    } else {
      cameraActive.value = false;
      cameraStatus.value = '摄像头连接失败';
      console.error('摄像头状态检查失败:', cameraStatusResult);
    }
    
    // 延迟一下再隐藏加载状态，给视频流一些时间加载
    setTimeout(() => {
      if (videoLoading.value) {
        videoLoading.value = false;
      }
    }, 2000);
  } catch (error) {
    console.error('初始化摄像头失败:', error);
    cameraStatus.value = '摄像头连接失败';
    cameraActive.value = false;
    videoLoading.value = false;
  }
}

// 视频流错误处理
function handleVideoError() {
  console.error('视频流加载失败');
  // 只有在API检查失败时才更新状态
  if (!cameraActive.value) {
    cameraStatus.value = '视频流连接失败';
    videoLoading.value = false;
  }
}

// 视频流加载成功处理
function handleVideoLoad() {
  console.log('视频流加载成功');
  // 只有在API检查成功时才更新状态
  if (cameraActive.value) {
    videoLoading.value = false;
  }
}

// 加载照片列表
async function loadPhotoList() {
  try {
    const result = await getPhotoList();
    photos.value = result.photos ? [...result.photos] : [];
    console.log('照片列表:', result);
    console.log('照片总数:', result.count);
    console.log('更新后的照片数组长度:', photos.value.length);
  } catch (error) {
    console.error('加载照片列表失败:', error);
    photos.value = [];
  }
}



// 手动拍照功能
async function takePhoto() {
  if (!cameraActive.value) {
    alert('请先连接摄像头');
    return;
  }

  try {
    console.log('开始拍照...');
    console.log('调用API: POST /photos/photo');
    
    const result = await apiTakePhoto();
    console.log('拍照API响应:', result);
    
    if (result && result.success) {
      console.log('拍照成功:', result.filename);
      alert(`拍照成功！文件名: ${result.filename}`);
      
      // 拍照成功后刷新照片列表
      await loadPhotoList();
    } else {
      const errorMsg = result?.message || '拍照失败，未知错误';
      console.error('拍照失败:', errorMsg);
      alert(`拍照失败: ${errorMsg}`);
    }
  } catch (error) {
    console.error('拍照API调用失败:', error);
    console.error('错误详情:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText
    });
    
    let errorMessage = '拍照失败，请重试';
    if (error.response?.status === 404) {
      errorMessage = '拍照接口不存在，请检查后端服务';
    } else if (error.response?.status === 500) {
      errorMessage = '服务器内部错误，请稍后重试';
    } else if (error.code === 'NETWORK_ERROR') {
      errorMessage = '网络连接失败，请检查网络';
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    alert(errorMessage);
  }
}

// 连续拍照功能
let photoCountTimer = null;

async function startContinuousPhoto() {
  if (!cameraActive.value) {
    alert('请先连接摄像头');
    return;
  }

  try {
    console.log('开始连续拍照...');
    console.log('调用API: POST /photos/continuous');
    
    const result = await apiStartContinuousPhoto(photoInterval.value);
    console.log('连续拍照API响应:', result);
    
    if (result && result.success) {
      console.log('连续拍照启动成功:', result.message);
      isContinuousPhotoActive.value = true;
      continuousPhotoCount.value = 0;
      
      // 立即刷新一次照片列表
      await loadPhotoList();
      
      // 启动定时器，定期刷新照片列表来更新计数和显示
      photoCountTimer = setInterval(async () => {
        try {
          console.log('连续拍照定时器触发，正在获取最新照片列表...');
          const photoListResult = await getPhotoList();
          console.log('获取到的照片列表结果:', photoListResult);
          
          if (photoListResult && photoListResult.photos) {
            const oldCount = photos.value.length;
            const newCount = photoListResult.photos.length;
            
            // 强制更新照片列表显示
            photos.value = [...photoListResult.photos];
            // 更新计数
            continuousPhotoCount.value = photoListResult.photos.length;
            
            console.log(`连续拍照期间更新照片列表 - 旧数量: ${oldCount}, 新数量: ${newCount}`);
            console.log('当前照片列表内容:', photos.value);
            
            // 如果有新照片，显示提示
            if (newCount > oldCount) {
              console.log(`发现 ${newCount - oldCount} 张新照片`);
              // 显示新增的照片信息
              const newPhotos = photoListResult.photos.slice(oldCount);
              console.log('新增的照片:', newPhotos);
            }
          } else {
            console.log('照片列表结果为空或格式不正确:', photoListResult);
          }
        } catch (error) {
          console.error('更新照片列表失败:', error);
        }
      }, 1000); // 每1秒更新一次，提高响应速度
      
      alert(`连续拍照已启动！间隔: ${photoInterval.value}秒`);
    } else {
      const errorMsg = result?.message || '启动连续拍照失败，未知错误';
      console.error('启动连续拍照失败:', errorMsg);
      alert(`启动连续拍照失败: ${errorMsg}`);
    }
  } catch (error) {
    console.error('启动连续拍照API调用失败:', error);
    console.error('错误详情:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText
    });
    
    let errorMessage = '启动连续拍照失败，请重试';
    if (error.response?.status === 404) {
      errorMessage = '连续拍照接口不存在，请检查后端服务';
    } else if (error.response?.status === 500) {
      errorMessage = '服务器内部错误，请稍后重试';
    } else if (error.code === 'NETWORK_ERROR') {
      errorMessage = '网络连接失败，请检查网络';
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    alert(errorMessage);
  }
}

async function stopContinuousPhoto() {
  try {
    console.log('停止连续拍照...');
    console.log('调用API: DELETE /photos/continuous');
    
    const result = await apiStopContinuousPhoto();
    console.log('停止连续拍照API响应:', result);
    
    if (result && result.success) {
      console.log('连续拍照停止成功:', result.message);
      isContinuousPhotoActive.value = false;
      
      // 清理定时器
      if (photoCountTimer) {
        clearInterval(photoCountTimer);
        photoCountTimer = null;
      }
      
      alert('连续拍照已停止');
      
      // 停止后刷新照片列表
      await loadPhotoList();
    } else {
      const errorMsg = result?.message || '停止连续拍照失败，未知错误';
      console.error('停止连续拍照失败:', errorMsg);
      alert(`停止连续拍照失败: ${errorMsg}`);
    }
  } catch (error) {
    console.error('停止连续拍照API调用失败:', error);
    console.error('错误详情:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText
    });
    
    let errorMessage = '停止连续拍照失败，请重试';
    if (error.response?.status === 404) {
      errorMessage = '连续拍照接口不存在，请检查后端服务';
    } else if (error.response?.status === 500) {
      errorMessage = '服务器内部错误，请稍后重试';
    } else if (error.code === 'NETWORK_ERROR') {
      errorMessage = '网络连接失败，请检查网络';
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    alert(errorMessage);
  }
}

// 预览功能
async function previewPhoto(photo) {
  try {
    // 直接使用照片的URL，避免额外的API调用
    previewUrl.value = photo.url;
    showPreview.value = true;
    console.log('预览照片:', photo.filename);
  } catch (error) {
    console.error('预览照片失败:', error);
    alert('预览失败，请重试');
  }
}

function closePreview() {
  showPreview.value = false;
  previewUrl.value = '';
}

// 下载功能
async function downloadPhoto(photo) {
  try {
    // 直接使用照片的下载URL，避免额外的API调用
    const a = document.createElement('a');
    a.href = photo.download_url || photo.url;
    a.download = photo.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    console.log('下载照片:', photo.filename);
  } catch (error) {
    console.error('下载照片失败:', error);
    alert('下载失败，请重试');
  }
}

// 删除功能
async function deletePhoto(idx) {
  const photo = photos.value[idx];
  if (confirm(`确定要删除照片 "${photo.filename}" 吗？`)) {
    try {
      const result = await apiDeletePhoto(photo.filename);
      console.log('删除结果:', result);
      
      if (result.success) {
        console.log('删除成功:', result.message);
        // 从列表中移除
        photos.value.splice(idx, 1);
      } else {
        console.error('删除失败:', result.message);
        alert(`删除失败: ${result.message}`);
      }
    } catch (error) {
      console.error('删除照片失败:', error);
      alert('删除失败，请重试');
    }
  }
}

// 工具函数
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
</script>
<style scoped>
@import '../assets/vision-system.css';

/* 组件特定样式覆盖 - 使用听觉系统的渐变标题样式 */
.title {
  background: linear-gradient(135deg, #4da6ff, #ffffff) !important;
  background-clip: text !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  font-weight: 700 !important;
  letter-spacing: 1px !important;
  font-family: 'Orbitron', 'Microsoft YaHei', sans-serif !important;
}
</style>