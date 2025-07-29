<template>
  <div v-if="visible" class="dialog-mask">
    <div class="dialog-box large">
      <div class="dialog-header">
        <h2 class="dialog-title">舌苔检测分析</h2>
        <button class="dialog-close" @click="$emit('close')">×</button>
      </div>
      <div class="dialog-content dialog-flex">
        <!-- 视频流预览区域 -->
        <div class="dialog-preview">
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
          </div>
          

          <!-- 视频下方的控制区域 -->
          <div class="video-controls">
            <div class="instruction-text">
              请在自然光下伸出舌头，保持3秒进行拍摄。建议设置倒计时以便调整姿势。
            </div>

            <div class="control-panel">
              <div class="timer-section">
                <span class="timer-label">倒计时:</span>
                <input
                  type="number"
                  v-model.number="photoInterval"
                  min="0"
                  max="60"
                  class="timer-input"
                />
                <span class="timer-unit">秒</span>
                <button class="btn-action btn-photo" @click="takePhoto" :disabled="isTimerPhotoActive">
                  {{ isTimerPhotoActive ? `倒计时 ${timerCountdown}秒` : '立即拍照' }}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="dialog-form">
          <div class="form-group">
            <label class="form-label">选择照片：</label>
            <select v-model="selectedVideoIdx" class="form-select">
              <option value="" disabled>请选择舌苔照片</option>
              <option v-for="(video, idx) in videos" :key="idx" :value="idx">{{ video.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">提示词：</label>
            <input v-model="prompt" placeholder="如：请分析舌苔健康状况" class="form-input" />
          </div>
          <button class="btn-submit" @click="analyze" :disabled="selectedVideoIdx===null || !prompt">
            提交检测
          </button>
          <div v-if="result" class="analysis-result">
            <h4 class="result-title">检测结果：</h4>
            <div class="result-content">{{ result }}</div>
          </div>
          <div class="detection-results">
            <h4 class="result-title">检测结果：</h4>
            <textarea v-model="detectionOutput" class="detection-output" placeholder="舌苔检测开始...
检测到舌苔颜色：淡红色
舌苔厚度：适中
舌苔分布：均匀
舌苔质地：正常
建议：继续保持良好的口腔卫生习惯" readonly></textarea>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { 
  getRawVideoFeed,
  getPhotoList,
  deletePhoto as apiDeletePhoto,
  takePhoto as apiTakePhoto
} from '../api';

const props = defineProps({
  visible: Boolean,
  videos: Array
});
const emit = defineEmits(['close']);
const selectedVideoIdx = ref(null);
const prompt = ref('');
const result = ref('');
const detectionOutput = ref('');

// 摄像头相关
const cameraActive = ref(false);
const cameraStatus = ref('摄像头未连接');
const cameraInfo = ref(null);
const videoLoading = ref(true);

// 拍照相关
const photoInterval = ref(5);
const isTimerPhotoActive = ref(false);
const timerCountdown = ref(0);
const timerPhotoCount = ref(0);
let countdownTimer = null;

// 暴露给模板使用的函数
const getVideoFeed = () => {
  const videoUrl = getRawVideoFeed();
  console.log('舌苔检测视频流URL:', videoUrl);
  return videoUrl;
};

watch(() => props.visible, v => {
  if (!v) {
    selectedVideoIdx.value = null;
    prompt.value = '';
    result.value = '';
    detectionOutput.value = '';
  }
});

// 生命周期
onMounted(() => {
  initializeCamera();
});

onBeforeUnmount(() => {
  stopTimerPhoto();
});

// 摄像头控制
async function initializeCamera() {
  try {
    console.log('开始初始化摄像头...');
    videoLoading.value = true;
    
    // 设置摄像头状态
    cameraActive.value = true;
    cameraStatus.value = '摄像头已连接';
    
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
  cameraStatus.value = '视频流连接失败';
  videoLoading.value = false;
}

// 视频流加载成功处理
function handleVideoLoad() {
  console.log('视频流加载成功');
  videoLoading.value = false;
}

// 拍照功能
async function takePhoto() {
  if (photoInterval.value > 0) {
    startTimerPhoto();
  } else {
    await capturePhoto();
  }
}

function startTimerPhoto() {
  isTimerPhotoActive.value = true;
  timerCountdown.value = photoInterval.value;
  
  countdownTimer = setInterval(() => {
    timerCountdown.value--;
    if (timerCountdown.value <= 0) {
      clearInterval(countdownTimer);
      capturePhoto();
      isTimerPhotoActive.value = false;
    }
  }, 1000);
}

async function capturePhoto() {
  try {
    console.log('开始拍照...');
    const response = await apiTakePhoto();
    console.log('拍照成功:', response);
    timerPhotoCount.value++;
  } catch (error) {
    console.error('拍照失败:', error);
  }
}

function stopTimerPhoto() {
  isTimerPhotoActive.value = false;
  timerCountdown.value = 0;
  timerPhotoCount.value = 0;

  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
}

function analyze() {
  // mock大模型返回
  result.value = `检测结果：针对"${prompt.value}"，舌苔健康状况良好。`;
  
  // 模拟检测结果输出
  detectionOutput.value = `舌苔检测开始...
检测到舌苔颜色：淡红色
舌苔厚度：适中
舌苔分布：均匀
舌苔质地：正常
建议：继续保持良好的口腔卫生习惯`;
}
</script>
<style scoped>
/* ...原样拷贝... */
.dialog-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dialog-box {
  background: linear-gradient(135deg,
      rgba(26, 26, 26, 0.95) 0%,
      rgba(45, 45, 45, 0.9) 50%,
      rgba(26, 26, 26, 0.95) 100%);
  border: 1px solid rgba(0, 153, 255, 0.3);
  border-radius: 16px;
  min-width: 400px;
  padding: 0;
  position: relative;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 40px rgba(0, 153, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  color: #ffffff;
}
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px 0 32px;
  border-bottom: 1px solid rgba(0, 153, 255, 0.2);
  margin-bottom: 24px;
}
.dialog-title {
  font-size: 1.5rem;
  font-weight: 600;
  background: linear-gradient(135deg, #4da6ff, #ffffff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}
.dialog-close {
  background: none;
  border: none;
  color: #888;
  font-size: 1.8rem;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}
.dialog-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}
.dialog-content {
  padding: 0 32px 32px 32px;
}
.dialog-flex {
  display: flex;
  gap: 24px;
}
.dialog-preview {
  flex: 1;
  max-width: 50%;
}
.dialog-form {
  flex: 1;
  max-width: 50%;
}

/* 摄像头预览样式 */
.camera-preview-box {
  position: relative;
  width: 100%;
  height: 320px;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(26, 26, 26, 0.8);
  border: 1px solid rgba(0, 153, 255, 0.2);
  margin-bottom: 16px;
}

.camera-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}

.video-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #e0e0e0;
  font-size: 0.9rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 153, 255, 0.2);
  border-top: 3px solid #0099ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 拍照控件样式 */
.capture-module {
  background: rgba(26, 26, 26, 0.6);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(0, 153, 255, 0.1);
}

.detection-instruction {
  margin-bottom: 12px;
}

.detection-instruction p {
  color: #b0b0b0;
  font-size: 0.85rem;
  line-height: 1.4;
  margin: 0;
}

.divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 153, 255, 0.3), transparent);
  margin: 12px 0;
}

.photo-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.timer-label {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #e0e0e0;
  font-size: 0.9rem;
  white-space: nowrap;
}

.timer-input {
  width: 60px;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid rgba(0, 153, 255, 0.3);
  background: rgba(26, 26, 26, 0.8);
  color: #ffffff;
  font-size: 0.85rem;
  text-align: center;
}

.timer-input:focus {
  outline: none;
  border-color: #0099ff;
  box-shadow: 0 0 8px rgba(0, 153, 255, 0.2);
}

.btn-primary {
  padding: 8px 16px;
  background: linear-gradient(135deg, #0099ff, #007acc);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #007acc, #005999);
  box-shadow: 0 4px 12px rgba(0, 153, 255, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.timer-info {
  margin-top: 8px;
}

.timer-status {
  color: #0099ff;
  font-size: 0.85rem;
  font-weight: 500;
}

/* 表单样式 */
.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  margin-bottom: 6px;
  color: #e0e0e0;
  font-size: 0.9rem;
  font-weight: 500;
}

.form-select,
.form-input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(0, 153, 255, 0.3);
  background: rgba(26, 26, 26, 0.8);
  color: #ffffff;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.form-select:focus,
.form-input:focus {
  outline: none;
  border-color: #0099ff;
  box-shadow: 0 0 10px rgba(0, 153, 255, 0.2);
}

.btn-submit {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #0099ff, #007acc);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 16px;
}

.btn-submit:hover:not(:disabled) {
  background: linear-gradient(135deg, #007acc, #005999);
  box-shadow: 0 4px 12px rgba(0, 153, 255, 0.3);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.analysis-result {
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(0, 153, 255, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(0, 153, 255, 0.2);
}

.result-title {
  margin: 0 0 8px 0;
  color: #0099ff;
  font-size: 0.9rem;
  font-weight: 600;
}

.result-content {
  color: #e0e0e0;
  font-size: 0.85rem;
  line-height: 1.4;
}

.detection-results {
  margin-bottom: 16px;
}

.detection-output {
  width: 100%;
  height: 200px;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid rgba(0, 153, 255, 0.2);
  background: rgba(26, 26, 26, 0.7);
  color: #e0e0e0;
  font-size: 0.85rem;
  font-family: 'Courier New', monospace;
  resize: vertical;
  line-height: 1.4;
  font-weight: 500;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
}

.detection-output:focus {
  outline: none;
  border-color: #0099ff;
  box-shadow: 0 0 10px rgba(0, 153, 255, 0.2);
}

/* 视频控制区域样式 */
.video-controls {
  margin-top: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  border: 1px solid rgba(0, 153, 255, 0.15);
}

.instruction-text {
  color: #b0b0b0;
  font-size: 0.85rem;
  text-align: center;
  margin-bottom: 12px;
  line-height: 1.3;
}

.control-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.timer-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
}

.timer-label {
  color: #888888;
  font-size: 0.8rem;
  font-weight: normal;
}

.timer-input {
  width: 40px;
  padding: 3px 6px;
  border-radius: 3px;
  border: 1px solid rgba(0, 153, 255, 0.2);
  background: rgba(20, 20, 20, 0.6);
  color: #ffffff;
  font-size: 0.8rem;
  text-align: center;
}

.timer-input:focus {
  outline: none;
  border-color: rgba(0, 153, 255, 0.4);
  box-shadow: 0 0 4px rgba(0, 153, 255, 0.1);
}

.timer-unit {
  color: #888888;
  font-size: 0.8rem;
}

.btn-action {
  padding: 6px 12px;
  border: 1px solid rgba(0, 153, 255, 0.3);
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: normal;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 70px;
  background: rgba(0, 153, 255, 0.1);
  color: #4da6ff;
}

.btn-photo {
  background: rgba(0, 153, 255, 0.15);
  border-color: rgba(0, 153, 255, 0.4);
  color: #66b3ff;
}

.btn-photo:hover:not(:disabled) {
  background: rgba(0, 153, 255, 0.25);
  border-color: rgba(0, 153, 255, 0.6);
  color: #80ccff;
}

.btn-action:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: rgba(0, 0, 0, 0.1);
  border-color: rgba(255, 255, 255, 0.1);
  color: #666666;
}

.dialog-box.large {
  min-width: 900px;
  width: 85vw;
  max-width: 1200px;
  min-height: 500px;
}

@media (max-width: 1024px) {
  .dialog-box.large {
    min-width: 700px;
    width: 90vw;
  }
  .dialog-content.dialog-flex {
    flex-direction: column;
    gap: 20px;
  }
  .dialog-preview,
  .dialog-form {
    max-width: none;
  }
}

@media (max-width: 768px) {
  .dialog-box.large {
    min-width: 300px;
    width: 95vw;
    min-height: auto;
  }
  .dialog-header {
    padding: 15px 20px 0 20px;
  }
  .dialog-content {
    padding: 0 20px 20px 20px;
  }
  .dialog-title {
    font-size: 1.2rem;
  }

  .camera-preview {
    height: 240px;
  }

  .video-loading {
    height: 240px;
  }
}
</style>
