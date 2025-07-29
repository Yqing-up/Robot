<template>
  <div class="container">
    <div class="main-title">机器人控制中心</div>
    <div class="health-report-btn" @click="goHealthReport">健康报告</div>
    <!-- header 已移除 -->
    <main class="main-content">
      <div class="robot-section">
        <div class="side-panel left-panel">
          <!-- 左侧三个系统 -->
        <div class="control-panel brain-panel" data-part="brain" @click="goBrainSystem">
          <div class="panel-header">
            <h3>大脑系统</h3>
            <div class="connection-status online"></div>
          </div>
          <div class="panel-description">
            <p class="system-intro">智能决策中心，负责处理信息和控制逻辑运算</p>
              <div class="panel-action">
                <span class="action-hint">点击进入大脑系统 →</span>
              </div>
            </div>
          </div>
          <div class="control-panel eyes-panel" data-part="eyes" @click="goVisionSystem">
          <div class="panel-header">
            <h3>视觉系统</h3>
            <div class="connection-status online"></div>
          </div>
          <div class="panel-description">
            <p class="system-intro">高清图像采集，实现环境感知和目标识别</p>
            <div class="panel-action">
                <span class="action-hint">点击进入视觉系统 →</span>
          </div>
            </div>
          </div>
          <div class="control-panel arms-panel" data-part="arms" @click="goArmSystem">
          <div class="panel-header">
            <h3>手臂系统</h3>
            <div class="connection-status online"></div>
          </div>
          <div class="panel-description">
            <p class="system-intro">精密动作执行，提供灵活操作和力量控制</p>
            <div class="panel-action">
              <span class="action-hint">点击进入手臂系统 →</span>
            </div>
          </div>
        </div>
        </div>
        <div class="robot-container">
          <img :src="robotImg" alt="机器人" class="robot-image" id="robotImage" />
        </div>
        <div class="side-panel right-panel">
          <!-- 右侧三个系统 -->
          <div class="control-panel ears-panel" data-part="ears" @click="goAudioSystem">
            <div class="panel-header">
              <h3>听觉系统</h3>
              <div class="connection-status online"></div>
            </div>
            <div class="panel-description">
              <p class="system-intro">音频信号处理，支持语音识别和声源定位</p>
              <div class="panel-action">
                <span class="action-hint">点击进入听觉系统 →</span>
              </div>
            </div>
          </div>
          <div class="control-panel mouth-panel" data-part="mouth" @click="goVoiceSystem">
          <div class="panel-header">
            <h3>语音系统</h3>
            <div class="connection-status online"></div>
          </div>
          <div class="panel-description">
            <p class="system-intro">智能语音合成，支持多语言和情感表达</p>
            <div class="panel-action">
              <span class="action-hint">点击进入语音系统 →</span>
            </div>
          </div>
        </div>
          <div class="control-panel legs-panel" data-part="legs" @click="goLegSystem">
          <div class="panel-header">
            <h3>腿部系统</h3>
            <div class="connection-status online"></div>
          </div>
          <div class="panel-description">
            <p class="system-intro">稳定运动控制，实现平衡行走和地形适应</p>
            <div class="panel-action">
              <span class="action-hint">点击进入腿部系统 →</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import robotImg from '../assets/robot.png';
import { onMounted, ref, reactive } from 'vue';

const router = useRouter();

// 系统状态
const systemStatus = reactive({
  brain: 'online',
  eyes: 'online',
  ears: 'online',
  arms: 'online',
  mouth: 'online',
  legs: 'online'
});

function goAudioSystem() {
  router.push('/audio-system');
}
function goLegSystem() {
  router.push('/leg-system');
}
function goVisionSystem() {
  router.push('/vision-system');
}
function goBrainSystem() {
  router.push('/brain-system');
}
function goArmSystem() {
  router.push('/arm-system');
}
function goVoiceSystem() {
  router.push('/voice-system');
}
function goHealthReport() {
  router.push('/report');
}

// 更新连接状态
function updateConnectionStatus(part, status) {
  const panel = document.querySelector(`[data-part="${part}"]`);
  if (panel) {
    const statusIndicator = panel.querySelector('.connection-status');
    if (statusIndicator) {
      statusIndicator.className = `connection-status ${status}`;
    }
  }
}

// 添加交互效果
function addInteractiveEffects() {
  const panels = document.querySelectorAll('.control-panel');
  panels.forEach(panel => {
    panel.addEventListener('mouseenter', () => {
      const part = panel.getAttribute('data-part');
      highlightConnectionLine(part, true);
    });
    panel.addEventListener('mouseleave', () => {
      const part = panel.getAttribute('data-part');
      highlightConnectionLine(part, false);
    });
  });
}

// 高亮连接线（预留，当前无svg线条）
function highlightConnectionLine(part, highlight) {
  // 可扩展SVG动画
}

// 动画效果（如有SVG线条可扩展）
function animateConnectionLines() {
  // 可扩展SVG动画
}

// 状态导出（可扩展为按钮功能）
function exportSystemStatus() {
  const status = {
    timestamp: new Date().toISOString(),
    components: { ...systemStatus }
  };
  const dataStr = JSON.stringify(status, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = 'robot_status.json';
  link.click();
}

// 生命周期钩子
onMounted(() => {
  // 恢复状态
  const savedStatus = localStorage.getItem('robotSystemStatus');
  if (savedStatus) {
    const parsed = JSON.parse(savedStatus);
    Object.keys(systemStatus).forEach(k => {
      if (parsed[k]) systemStatus[k] = parsed[k];
    });
  }
  // 初始化各面板状态
  Object.keys(systemStatus).forEach(part => {
    updateConnectionStatus(part, systemStatus[part]);
  });
  // 动画和交互
  animateConnectionLines();
  addInteractiveEffects();
  // 错误处理
  window.addEventListener('error', (e) => {
    console.error('系统错误:', e.error);
  });
  // 卸载前保存状态
  window.addEventListener('beforeunload', () => {
    localStorage.setItem('robotSystemStatus', JSON.stringify(systemStatus));
  });
});
</script>

<style scoped>
/* 全局样式 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Orbitron', monospace;
    background: linear-gradient(135deg, #0a0a0a 0%, #181818 100%);
    color: #ffffff;
    min-height: 100vh;
    overflow-x: auto;
    overflow-y: auto;
    position: relative;
}

body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background:
        radial-gradient(circle at 20% 80%, rgba(0, 153, 255, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(77, 166, 255, 0.03) 0%, transparent 50%);
    pointer-events: none;
    z-index: -1;
}

.container {
  width: 100vw;
  height: 100vh;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  overflow: visible;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  position: relative;
  overflow: visible;
}

/* 新的flex布局 */
.robot-section {
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 0;
    position: relative;
    background: transparent;
}
.side-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  gap: 12px;
  flex: 1 1 0;
  min-width: 260px;
}
.left-panel {
  align-items: flex-end;
}
.right-panel {
  align-items: flex-start;
}
.robot-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 600px;   /* 更大尺寸，适应大屏 */
  height: 650px;  /* 更大尺寸，适应大屏 */
  margin: 0px 48px;
  flex-shrink: 0;
  transition: width 0.3s, height 0.3s;
}

.robot-image {
    width: 100%;
    height: 100%;
    max-width: 600px;
    max-height: 650px;
    object-fit: contain;
    filter:
        drop-shadow(0 0 40px rgba(0, 153, 255, 0.4))
        drop-shadow(0 0 80px rgba(77, 166, 255, 0.2))
        drop-shadow(0 0 120px rgba(255, 255, 255, 0.1));
    z-index: 10;
    transition: filter 0.3s ease, max-width 0.3s, max-height 0.3s;
}

/* 控制面板样式 */
.control-panel {
  margin: 8px;
  background: linear-gradient(135deg,
      rgba(26, 26, 26, 0.95) 0%,
      rgba(45, 45, 45, 0.9) 50%,
      rgba(26, 26, 26, 0.95) 100%);
  border: 1px solid rgba(102, 102, 102, 0.4);
  border-radius: 16px;
  padding: 20px 15px 30px 15px;
  min-width: 160px;
  max-width: 370px;
  width: 500px;
  min-height: 120px;
  max-height: 150px;
  height: 180px;
  backdrop-filter: blur(20px);
  box-shadow:
      0 4px 16px rgba(0, 0, 0, 0.25),
      0 0 0 1px rgba(255, 255, 255, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  z-index: 10;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch;
}

.control-panel::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg,
        transparent,
        rgba(0, 153, 255, 0.1),
        transparent);
    transition: left 0.6s ease;
}

.control-panel:hover {
    transform: translateY(-5px) scale(1.02);
    border-color: rgba(0, 153, 255, 0.6);
    box-shadow:
        0 20px 40px rgba(0, 0, 0, 0.5),
        0 0 60px rgba(0, 153, 255, 0.2),
        0 0 0 1px rgba(0, 153, 255, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.control-panel:hover::before {
    left: 100%;
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(136, 136, 136, 0.3);
}

.panel-header h3 {
  font-size: 1.25rem;
  margin: 0;
  font-weight: 700;
  letter-spacing: 0.5px;
  font-family: 'Orbitron', 'Microsoft YaHei', sans-serif;
}

.connection-status {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: radial-gradient(circle, #0099ff, #007acc);
    animation: statusPulse 2s infinite;
    box-shadow: 0 0 15px rgba(0, 153, 255, 0.6);
    position: relative;
}

.connection-status::after {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border-radius: 50%;
    border: 1px solid rgba(0, 153, 255, 0.3);
    animation: ripple 2s infinite;
}

.connection-status.offline {
    background: radial-gradient(circle, #ff6b6b, #ff0000);
    box-shadow: 0 0 15px rgba(255, 107, 107, 0.6);
}

.panel-description {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.system-intro {
    color: #e0e0e0;
    font-size: 1rem;
    line-height: 1.4;
    margin: 0;
    padding: 4px 6px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    border-left: 3px solid #00ffff;
    text-align: left;
    font-weight: 400;
    font-family: 'Orbitron', 'Microsoft YaHei', sans-serif;
}

.panel-action {
    margin-top: 4px;
    text-align: center;
}

.action-hint {
    color: #00ffff;
    font-size: 1rem;
    font-weight: 500;
    opacity: 0.8;
    transition: opacity 0.3s ease;
    font-family: 'Orbitron', 'Microsoft YaHei', sans-serif;
}

.ears-panel {
    cursor: pointer;
    transition: all 0.3s ease;
}

.ears-panel:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 255, 255, 0.3);
}

.ears-panel:hover .action-hint {
    opacity: 1;
}

/* 按钮样式 */
.btn {
    padding: 12px 20px;
    border: none;
    border-radius: 12px;
    font-family: 'Orbitron', monospace;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    text-transform: uppercase;
    letter-spacing: 1px;
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(10px);
}

.btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.6s ease;
}

.btn:hover::before {
    left: 100%;
}

.btn-test {
    background: linear-gradient(135deg, rgba(0, 153, 255, 0.2), rgba(77, 166, 255, 0.3));
    color: #4da6ff;
    border: 1px solid rgba(0, 153, 255, 0.4);
    box-shadow:
        0 4px 15px rgba(0, 153, 255, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.btn-test:hover {
    background: linear-gradient(135deg, rgba(0, 153, 255, 0.3), rgba(77, 166, 255, 0.4));
    border-color: rgba(0, 153, 255, 0.8);
    box-shadow:
        0 8px 25px rgba(0, 153, 255, 0.3),
        0 0 30px rgba(0, 153, 255, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
}

.btn-back {
    background: linear-gradient(135deg, rgba(100, 100, 100, 0.2), rgba(150, 150, 150, 0.3));
    color: #cccccc;
    border: 1px solid rgba(150, 150, 150, 0.4);
}

.btn-back:hover {
    background: linear-gradient(135deg, rgba(150, 150, 150, 0.3), rgba(200, 200, 200, 0.4));
    color: #ffffff;
    transform: translateY(-2px);
}

.btn-primary {
    background: linear-gradient(135deg, rgba(0, 153, 255, 0.2), rgba(77, 166, 255, 0.3));
    color: #4da6ff;
    border: 1px solid rgba(0, 153, 255, 0.4);
}

.btn-primary:hover {
    background: linear-gradient(135deg, rgba(0, 153, 255, 0.3), rgba(77, 166, 255, 0.4));
    border-color: rgba(0, 153, 255, 0.8);
    transform: translateY(-2px);
}

.btn-secondary {
    background: linear-gradient(135deg, rgba(120, 120, 120, 0.2), rgba(180, 180, 180, 0.3));
    color: #cccccc;
    border: 1px solid rgba(150, 150, 150, 0.4);
}

.btn-secondary:hover {
    background: linear-gradient(135deg, rgba(150, 150, 150, 0.3), rgba(200, 200, 200, 0.4));
    transform: translateY(-2px);
}

.btn-danger {
    background: linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(255, 51, 51, 0.3));
    color: #ff6b6b;
    border: 1px solid rgba(255, 107, 107, 0.4);
}

.btn-danger:hover {
    background: linear-gradient(135deg, rgba(255, 107, 107, 0.3), rgba(255, 51, 51, 0.4));
    transform: translateY(-2px);
}

/* 控制面板位置 */
/* 左侧面板组 */
.brain-panel {
    top: 18%;
    left: calc(51vw - 650px);
}

.eyes-panel {
    top: 43%;
    left: calc(51vw - 650px);
}

.arms-panel {
    top: 68%;
    left: calc(51vw - 650px);
}

/* 右侧面板组 */
.ears-panel {
    top: 18%;
    right: calc(49vw - 650px);
}

.mouth-panel {
    top: 43%;
    right: calc(49vw - 650px);
}

.legs-panel {
    top: 68%;
    right: calc(49vw - 650px);
}

/* 动画效果 */
@keyframes pulse {
    0%, 100% {
        opacity: 0.6;
        transform: scale(1);
    }
    50% {
        opacity: 1;
        transform: scale(1.05);
    }
}

@keyframes statusPulse {
    0%, 100% {
        opacity: 1;
        transform: scale(1);
        box-shadow: 0 0 15px rgba(0, 153, 255, 0.6);
    }
    50% {
        opacity: 0.8;
        transform: scale(1.2);
        box-shadow: 0 0 25px rgba(0, 153, 255, 0.8);
    }
}

@keyframes ripple {
    0% {
        transform: scale(1);
        opacity: 1;
    }
    100% {
        transform: scale(2);
        opacity: 0;
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 左上角主标题样式 */
.main-title {
  position: fixed;
  top: 18px;
  left: 32px;
  z-index: 1200;
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #00ccff, #0099ff, #ffffff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 2px;
  font-family: 'Orbitron', 'Microsoft YaHei', sans-serif;
  text-shadow: 0 0 15px rgba(0, 153, 255, 0.4);
  user-select: none;
  pointer-events: none;
}

.health-report-btn {
  position: fixed;
  top: 18px;
  right: 32px;
  z-index: 1200;
  font-size: 1.2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #00ccff, #0099ff, #ffffff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 2px;
  font-family: 'Orbitron', 'Microsoft YaHei', sans-serif;
  text-shadow: 0 0 15px rgba(0, 153, 255, 0.4);
  user-select: none;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid transparent;
  color: #fff;
}

.health-report-btn:hover {
  background: linear-gradient(135deg, #00ccff, #0099ff, #ffffff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 20px rgba(0, 153, 255, 0.6);
  border-color: rgba(0, 153, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 153, 255, 0.2);
}

@media (max-width: 1440px) {
  .robot-container {
    width: 480px;
    height: 520px;
  }
  .robot-image {
    max-width: 480px;
    max-height: 520px;
    }
}

@media (max-width: 1024px) {
    .robot-container {
    width: 350px;
    height: 380px;
    margin: 0 12px;
    }
    .robot-image {
    max-width: 350px;
    max-height: 380px;
    }
}

@media (max-width: 768px) {
  .robot-container {
    width: 90vw;
    height: 40vw;
    min-width: 180px;
    min-height: 180px;
    max-width: 320px;
    max-height: 320px;
    margin: 0 2vw;
  }
  .robot-image {
    max-width: 90vw;
    max-height: 40vw;
    min-width: 120px;
    min-height: 120px;
  }
  .main-title {
    font-size: 1.2rem;
    top: 10px;
    left: 12px;
  }
  .health-report-btn {
    font-size: 1rem;
    top: 10px;
    right: 12px;
    padding: 6px 12px;
  }
}

@media (max-width: 480px) {
    .robot-container {
    width: 98vw;
    height: 38vw;
    min-width: 120px;
    min-height: 120px;
    max-width: 200px;
    max-height: 200px;
    margin: 0 1vw;
    }
    .robot-image {
    max-width: 98vw;
    max-height: 38vw;
    min-width: 80px;
    min-height: 80px;
    }
}
</style>
