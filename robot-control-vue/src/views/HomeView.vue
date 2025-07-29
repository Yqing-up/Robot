<template>
  <div class="container hide-scrollbar">
    <header class="header">
      <h1 class="title">机器人控制中心</h1>
      <nav class="home-nav">
        <router-link to="/management" active-class="active">管理</router-link>
        <router-link to="/report" active-class="active">健康报告</router-link>
      </nav>
    </header>
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
            <p class="system-intro">智能决策中心，负责处理信息和控制逻辑运算。</p>
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
            <p class="system-intro">高清图像采集，实现环境感知和目标动作识别。</p>
            <div class="panel-action">
                <span class="action-hint">点击进入视觉系统 →</span>
          </div>
            </div>
          </div>
          <div class="control-panel arms-panel" data-part="arms" @click="goArmSystem">
          <div class="panel-header">
            <h3>上肢系统</h3>
            <div class="connection-status online"></div>
          </div>
          <div class="panel-description">
            <p class="system-intro">精密动作执行，提供灵活的操作和力量的控制。</p>
            <div class="panel-action">
              <span class="action-hint">点击进入上肢系统 →</span>
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
              <p class="system-intro">音频信号精准处理，支持语音识别和声源定位。</p>
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
            <p class="system-intro">智能语音合成，支持多语言和多种情感的表达。</p>
            <div class="panel-action">
              <span class="action-hint">点击进入语音系统 →</span>
            </div>
          </div>
        </div>
          <div class="control-panel legs-panel" data-part="legs" @click="goLegSystem">
          <div class="panel-header">
            <h3>下肢系统</h3>
            <div class="connection-status online"></div>
          </div>
          <div class="panel-description">
            <p class="system-intro">稳定的运动控制，实现平衡行走和各种地形适应。</p>
            <div class="panel-action">
              <span class="action-hint">点击进入下肢系统 →</span>
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
    overflow-x: hidden;
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
}

/* 头部样式 */
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 30px;
    background: transparent;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;

    z-index: 1000;
    box-sizing: border-box;
}



.title {
    font-size: 2rem;
    font-weight: 700;
    background: linear-gradient(135deg, #4da6ff, #ffffff);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: 2px;
    font-family: 'Orbitron', 'Microsoft YaHei', sans-serif;
}

.nav-section {
    display: flex;
    align-items: center;
    gap: 20px;
}

.home-nav {
  display: flex;
  gap: 24px;
  align-items: center;
}
.home-nav a {
  background: linear-gradient(135deg, #4da6ff, #ffffff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.home-nav a::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(77, 166, 255, 0.2), transparent);
  transition: left 0.6s ease;
}

.home-nav a.active {
  background: linear-gradient(135deg, #4da6ff, #ffffff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: bold;
  border-bottom: 2px solid #4da6ff;
}

.home-nav a:hover {
  background: linear-gradient(135deg, #00ccff, #ffffff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(77, 166, 255, 0.3);
}

.home-nav a:hover::before {
  left: 100%;
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
  /* 进一步增大机器人尺寸，使其更加突出醒目 */
  width: min(95vw, 2300px);
  height: min(92vh, 2300px);
  min-width: 570px;
  min-height: 570px;
  margin: 0 auto; /* 改为auto让机器人完全居中 */
  flex-shrink: 0;
}

.robot-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter:
        drop-shadow(0 0 40px rgba(0, 153, 255, 0.4))
        drop-shadow(0 0 80px rgba(77, 166, 255, 0.2))
        drop-shadow(0 0 120px rgba(255, 255, 255, 0.1));
    z-index: 10;
    transition: filter 0.3s ease;
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
  padding: 24px 18px 36px 18px;
  min-width: 192px;
  max-width: 384px;
  width: 600px;
  min-height: 144px;
  max-height: 192px;
  height: 216px;
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
    justify-content: center;
    align-items: center;
    margin-bottom: 18px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(136, 136, 136, 0.3);
    position: relative;
}

.panel-header h3 {
  font-size: 1.8rem;
  margin: 0;
  font-weight: 700;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #4da6ff, #ffffff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
}

.connection-status {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: radial-gradient(circle, #0099ff, #007acc);
    animation: statusPulse 2s infinite;
    box-shadow: 0 0 15px rgba(0, 153, 255, 0.6);
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
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
    color: #4da6ff;
    font-size: 1rem;
    line-height: 1.4;
    margin: 0;
    padding: 4px 6px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    border-left: 3px solid #4da6ff;
    text-align: center;
    font-weight: 400;
}

.panel-action {
    margin-top: 4px;
    text-align: center;
}

.action-hint {
    color: #4da6ff;
    font-size: 0.85rem;
    font-weight: 500;
    opacity: 0.8;
    transition: opacity 0.3s ease;
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
/* 左侧面板组 - 更靠近机器人的布局 */
.brain-panel {
    top: 13%;
    left: 8vw;
}

.eyes-panel {
    top: 41%;
    left: 8vw;
}

.arms-panel {
    top: 69%;
    left: 8vw;
}

/* 右侧面板组 - 更靠近机器人的布局 */
.ears-panel {
    top: 13%;
    right: 8vw;
}

.mouth-panel {
    top: 41%;
    right: 8vw;
}

.legs-panel {
    top: 69%;
    right: 8vw;
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

/* 平板适配 (768px-1023px) */
@media (max-width: 1023px) {
    .robot-section {
        flex-direction: column;
        min-height: auto;
        padding: 1rem 0;
    }

    .robot-container {
        position: relative;
        top: auto;
        left: auto;
        transform: none;
        width: min(90vw, 600px);
        height: min(60vh, 600px);
        margin: 1rem auto;
        order: 1;
    }

    .robot-image {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }

    .side-panel {
        position: static;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
        gap: 1rem;
        width: 100%;
        min-width: auto;
    }

    .left-panel {
        order: 0;
    }

    .right-panel {
        order: 2;
    }

    .control-panel {
        position: static;
        min-width: 280px;
        max-width: 320px;
        width: auto;
        margin: 0.5rem;
        padding: 1rem;
        height: auto;
        min-height: 180px;
        max-height: none;
    }

    .title {
        font-size: 1.8rem;
    }

    .main-content {
        padding-top: 1rem;
    }
}

/* 手机屏幕适配 (480px-767px) */
@media (max-width: 767px) {
    .container {
        padding: 0.5rem;
    }

    .header {
        padding: 0.8rem 1rem;
        flex-direction: column;
        gap: 0.5rem;
        text-align: center;
    }

    .title {
        font-size: 1.5rem;
    }

    .robot-container {
        width: min(95vw, 400px);
        height: min(50vh, 400px);
        margin: 1rem auto;
    }

    .side-panel {
        flex-direction: column;
        align-items: center;
    }

    .control-panel {
        min-width: 260px;
        max-width: 90vw;
        width: 90%;
        padding: 0.8rem;
        font-size: 0.9rem;
        margin: 0.5rem auto;
    }

    .panel-header h3 {
        font-size: 1.4rem;
    }

    .system-intro {
        font-size: 0.85rem;
        padding: 0.4rem 0.6rem;
    }

    .action-hint {
        font-size: 0.75rem;
    }
}

/* 小手机屏幕适配 (320px-479px) */
@media (max-width: 479px) {
    .container {
        padding: 0.3rem;
    }

    .header {
        padding: 0.5rem;
        gap: 0.3rem;
    }

    .title {
        font-size: 1.3rem;
        letter-spacing: 1px;
    }

    .robot-container {
        width: min(98vw, 320px);
        height: min(40vh, 320px);
        margin: 0.5rem auto;
    }

    .control-panel {
        min-width: 240px;
        max-width: 95vw;
        width: 95%;
        padding: 0.6rem;
        font-size: 0.8rem;
        margin: 0.3rem auto;
        min-height: 140px;
    }

    .panel-header h3 {
        font-size: 1.2rem;
    }

    .system-intro {
        font-size: 0.7rem;
        padding: 0.3rem 0.5rem;
        line-height: 1.3;
    }

    .action-hint {
        font-size: 0.65rem;
    }

    .home-nav a {
        font-size: 0.9rem;
        padding: 0.5rem 0.8rem;
    }
}

/* 超小屏幕适配 (最大320px) */
@media (max-width: 320px) {
    .title {
        font-size: 1.1rem;
    }

    .robot-container {
        width: 100%;
        height: min(35vh, 280px);
    }

    .control-panel {
        min-width: 220px;
        padding: 0.5rem;
        font-size: 0.75rem;
    }

    .panel-header h3 {
        font-size: 1rem;
    }

    .system-intro {
        font-size: 0.65rem;
    }

    .action-hint {
        font-size: 0.6rem;
    }
}
</style>
