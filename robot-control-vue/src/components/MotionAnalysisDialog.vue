<template>
  <div v-if="visible" class="dialog-mask">
    <div class="dialog-box large">
      <div class="dialog-header">
        <h2 class="dialog-title">运动检测分析 (带骨骼检测)</h2>
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
              请在摄像头前进行运动，系统将实时显示骨骼检测结果，并按设定间隔自动拍摄记录运动过程。
            </div>

            <div class="control-panel">
              <div class="timer-section">
                <span class="timer-label">拍照间隔:</span>
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

              <div class="action-buttons">
                <button
                  class="btn-action btn-start"
                  @click="startContinuousCapture"
                  :disabled="isContinuousCapture"
                >
                  启动拍摄
                </button>
                <button
                  class="btn-action btn-stop"
                  @click="stopContinuousCapture"
                  :disabled="!isContinuousCapture"
                >
                  停止拍摄
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="dialog-form">
          <div class="form-group">
            <label class="form-label">选择视频：</label>
            <select v-model="selectedVideoIdx" class="form-select">
              <option value="" disabled>请选择视频</option>
              <option v-for="(video, idx) in videos" :key="idx" :value="idx">{{ video.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">提示词：</label>
            <input v-model="prompt" placeholder="如：这段运动需要注意什么" class="form-input" />
          </div>
          <button class="btn-submit" @click="analyze" :disabled="selectedVideoIdx===null || !prompt">
            提交分析
          </button>
          <div v-if="result" class="analysis-result">
            <h4 class="result-title">分析建议：</h4>
            <div class="result-content">{{ result }}</div>
          </div>
          <div class="detection-results">
            <h4 class="result-title">检测结果：</h4>
            <textarea v-model="detectionOutput" class="detection-output" placeholder="检测结果将在这里显示..." readonly></textarea>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import {
  checkCameraStatus,
  getCameraInfo,
  getRawVideoFeed,
  getSkeletonVideoFeed,
  getPhotoList,
  downloadPhoto as apiDownloadPhoto,
  getPhotoContent,
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
const isContinuousCapture = ref(false);
let countdownTimer = null;
let continuousCaptureTimer = null;

// 暴露给模板使用的函数
const getVideoFeed = () => {
  const videoUrl = getRawVideoFeed();
  console.log('运动检测视频流URL:', videoUrl);
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
    // 检查摄像头状态
    const status = await checkCameraStatus();
    console.log('摄像头状态:', status);

    // 获取摄像头信息
    const info = await getCameraInfo();
    cameraInfo.value = info;
    console.log('摄像头信息:', info);

    // 设置摄像头状态
    cameraActive.value = true;
    cameraStatus.value = '摄像头已连接';
    videoLoading.value = true; // 开始加载视频流
  } catch (error) {
    console.error('初始化摄像头失败:', error);
    cameraStatus.value = '摄像头连接失败';
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

// 连续拍摄功能
function startContinuousCapture() {
  if (isContinuousCapture.value) return;

  isContinuousCapture.value = true;
  console.log('开始连续拍摄，间隔:', photoInterval.value, '秒');

  // 立即拍一张
  capturePhoto();

  // 设置定时器进行连续拍摄
  if (photoInterval.value > 0) {
    continuousCaptureTimer = setInterval(() => {
      if (isContinuousCapture.value) {
        capturePhoto();
      }
    }, photoInterval.value * 1000);
  }
}

function stopContinuousCapture() {
  isContinuousCapture.value = false;
  console.log('停止连续拍摄');

  if (continuousCaptureTimer) {
    clearInterval(continuousCaptureTimer);
    continuousCaptureTimer = null;
  }
}

function analyze() {
  // mock大模型返回
  result.value = `分析结果：针对"${prompt.value}"，建议保持正确姿势，注意安全。`;

  // 模拟检测结果输出
  detectionOutput.value = `运动检测开始...
检测到关键点：头部、肩膀、肘部、手腕、髋部、膝盖、脚踝
姿态评估：整体姿态良好
运动轨迹：流畅连贯
建议：继续保持当前动作标准`;
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
  font-weight: 700;
  background: linear-gradient(135deg, #00ccff, #0099ff, #ffffff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 1px;
  margin: 0;
}
.dialog-close {
  position: absolute;
  right: 20px;
  top: 20px;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #4da6ff;
  cursor: pointer;
  transition: color 0.3s ease;
}
.dialog-close:hover {
  color: #00ccff;
}
.dialog-content {
  padding: 0 32px 32px 32px;
}
.dialog-content.dialog-flex {
  display: flex;
  flex-direction: row;
  gap: 32px;
}
.dialog-preview {
  flex: 1.2;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  min-width: 320px;
  max-width: 520px;
  background: linear-gradient(135deg, rgba(0, 153, 255, 0.05), rgba(77, 166, 255, 0.05));
  border: 1px solid rgba(0, 153, 255, 0.2);
  border-radius: 12px;
  padding: 18px 12px;
  margin-right: 0;
}
.video-player {
  width: 100%;
  max-height: 340px;
  border-radius: 12px;
  background: #101c2c;
}
.video-name {
  margin-top: 10px;
  text-align: center;
  color: #4da6ff;
  font-weight: 500;
  font-size: 0.9rem;
}
.preview-placeholder {
  width: 100%;
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  font-size: 1.1rem;
  background: rgba(0, 153, 255, 0.05);
  border: 2px dashed rgba(0, 153, 255, 0.2);
  border-radius: 8px;
}
.dialog-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  min-width: 260px;
  max-width: 400px;
  gap: 20px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.form-label {
  color: #4da6ff;
  font-weight: 500;
  font-size: 0.9rem;
}
.form-select,
.form-input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(0, 153, 255, 0.3);
  background: rgba(26, 26, 26, 0.7);
  color: #ffffff;
  font-size: 0.9rem;
  transition: border-color 0.3s ease;
}
.form-select:focus,
.form-input:focus {
  outline: none;
  border-color: #0099ff;
  box-shadow: 0 0 10px rgba(0, 153, 255, 0.2);
}
.btn-submit {
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, rgba(0, 153, 255, 0.2), rgba(77, 166, 255, 0.3));
  color: #4da6ff;
  border: 1px solid rgba(0, 153, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 1px;
}
.btn-submit:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(0, 153, 255, 0.3), rgba(77, 166, 255, 0.4));
  border-color: rgba(0, 153, 255, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 153, 255, 0.3);
}
.btn-submit:disabled {
  background: rgba(100, 100, 100, 0.2);
  color: #666;
  cursor: not-allowed;
  border-color: rgba(100, 100, 100, 0.3);
}
.analysis-result,
.detection-results {
  border: 1px solid rgba(0, 153, 255, 0.2);
  border-radius: 8px;
  padding: 16px;
  background: rgba(0, 153, 255, 0.05);
}
.result-title {
  color: #4da6ff;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 12px 0;
}
.result-content {
  color: #e0e0e0;
  font-size: 0.9rem;
  line-height: 1.5;
  background: rgba(26, 26, 26, 0.5);
  border-radius: 6px;
  padding: 12px;
  border-left: 3px solid #0099ff;
}
.detection-output {
  width: 100%;
  height: 120px;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid rgba(0, 153, 255, 0.2);
  background: rgba(26, 26, 26, 0.7);
  color: #e0e0e0;
  font-size: 0.85rem;
  font-family: 'Courier New', monospace;
  resize: vertical;
  line-height: 1.4;
}
.detection-output:focus {
  outline: none;
  border-color: #0099ff;
  box-shadow: 0 0 10px rgba(0, 153, 255, 0.2);
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

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
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

.btn-start {
  background: rgba(0, 204, 102, 0.15);
  border-color: rgba(0, 204, 102, 0.4);
  color: #66cc99;
}

.btn-start:hover:not(:disabled) {
  background: rgba(0, 204, 102, 0.25);
  border-color: rgba(0, 204, 102, 0.6);
  color: #80d9b3;
}

.btn-stop {
  background: rgba(255, 68, 68, 0.15);
  border-color: rgba(255, 68, 68, 0.4);
  color: #ff9999;
}

.btn-stop:hover:not(:disabled) {
  background: rgba(255, 68, 68, 0.25);
  border-color: rgba(255, 68, 68, 0.6);
  color: #ffb3b3;
}

.btn-action:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: rgba(0, 0, 0, 0.1);
  border-color: rgba(255, 255, 255, 0.1);
  color: #666666;
}

.timer-info {
  margin-top: 8px;
}

.timer-status {
  color: #0099ff;
  font-size: 0.85rem;
  font-weight: 500;
}

.dialog-box.large {
  min-width: 900px;
  width: 85vw;
  max-width: 1200px;
  min-height: 500px;
}
@keyframes statusPulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 0 10px rgba(0, 153, 255, 0.6);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.2);
    box-shadow: 0 0 20px rgba(0, 153, 255, 0.8);
  }
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
}
</style> 