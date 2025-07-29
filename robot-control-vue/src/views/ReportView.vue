<template>
  <div class="report-bg">
    <nav class="navbar">
      <div class="navbar-left">
        <button class="back-btn" @click="goHome">← 返回首页</button>
        <div class="logo">健康报告</div>
      </div>
      <div class="report-status">
        <span class="status-dot"></span>
        <span class="status-text">系统在线</span>
      </div>
    </nav>
    <div class="report-main">
      <div class="report-title-box">
        <h1 class="report-title">综合健康报告</h1>
        <p class="report-desc">基于您的骨骼和舌苔检测结果生成的健康评估报告</p>
      </div>
      <!-- 标签导航 -->
      <div class="tab-bar">
        <button :class="['tab-btn', activeTab==='overview' ? 'tab-btn-active' : '']" @click="activeTab='overview'">
          <i class="ri-dashboard-line"></i>
          <span>综合评估</span>
        </button>
        <button :class="['tab-btn', activeTab==='skeleton' ? 'tab-btn-active' : '']" @click="activeTab='skeleton'">
          <i class="ri-body-scan-line"></i>
          <span>骨骼分析</span>
        </button>
        <button :class="['tab-btn', activeTab==='tongue' ? 'tab-btn-active' : '']" @click="activeTab='tongue'">
          <i class="ri-scan-line"></i>
          <span>舌苔分析</span>
        </button>
        <button :class="['tab-btn', activeTab==='trends' ? 'tab-btn-active' : '']" @click="activeTab='trends'">
          <i class="ri-line-chart-line"></i>
          <span>趋势分析</span>
        </button>
      </div>
      <!-- 综合评估 -->
      <div v-show="activeTab==='overview'">
        <div class="overview-section">
          <!-- 总体得分 -->
          <div class="card score-card">
            <div class="score-center">
              <h2 class="score-title">总体健康评分</h2>
              <div class="score-circle-box">
                <div class="score-circle-bg">
                  <div class="score-num">82</div>
                </div>
                <div class="score-circle-progress" :style="circleStyle"></div>
              </div>
              <p class="score-tip">您的健康状况良好，建议继续保持</p>
            </div>
          </div>
          <!-- 各项指标 -->
          <div class="overview-indicators">
            <div class="card indicator-card">
              <div class="indicator-header">
                <h3 class="indicator-title">骨骼健康</h3>
                <div class="indicator-icon indicator-icon-blue">
                  <i class="ri-body-scan-line"></i>
                </div>
              </div>
              <div class="indicator-bar-box">
                <div class="indicator-bar-bg">
                  <div class="indicator-bar indicator-bar-blue" style="width: 85%"></div>
                </div>
                <span class="indicator-score indicator-score-blue">85分</span>
              </div>
              <p class="indicator-tip">体态良好，肩部需要适当调整</p>
            </div>
            <div class="card indicator-card">
              <div class="indicator-header">
                <h3 class="indicator-title">舌苔健康</h3>
                <div class="indicator-icon indicator-icon-red">
                  <i class="ri-scan-line"></i>
                </div>
              </div>
              <div class="indicator-bar-box">
                <div class="indicator-bar-bg">
                  <div class="indicator-bar indicator-bar-red" style="width: 78%"></div>
                </div>
                <span class="indicator-score indicator-score-red">78分</span>
              </div>
              <p class="indicator-tip">舌苔偏厚，建议调整饮食结构</p>
            </div>
          </div>
          <!-- 健康建议 -->
          <div class="card advice-card">
            <h3 class="advice-title">个性化健康建议</h3>
            <div class="advice-grid">
              <div class="advice-block">
                <h4 class="advice-block-title advice-block-title-blue">运动建议</h4>
                <ul class="advice-list">
                  <li>• 每天进行20-30分钟的拉伸运动</li>
                  <li>• 注意肩部和颈部的活动</li>
                  <li>• 适当进行有氧运动</li>
                </ul>
              </div>
              <div class="advice-block">
                <h4 class="advice-block-title advice-block-title-green">饮食建议</h4>
                <ul class="advice-list">
                  <li>• 减少油腻和辛辣食物</li>
                  <li>• 增加蔬菜和水果摄入</li>
                  <li>• 保持充足的水分摄入</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 骨骼分析 -->
      <div v-show="activeTab==='skeleton'">
        <div class="card detail-card">
          <h2 class="detail-title">骨骼健康详细分析</h2>
          <div class="detail-grid">
            <div class="detail-col">
              <div class="detail-block detail-block-blue">
                <h3 class="detail-block-title">体态评估</h3>
                <div class="detail-list">
                  <div class="detail-list-row">
                    <span>头部位置</span>
                    <span class="detail-tag detail-tag-green">正常</span>
                  </div>
                  <div class="detail-list-row">
                    <span>肩部平衡</span>
                    <span class="detail-tag detail-tag-yellow">轻微不平衡</span>
                  </div>
                  <div class="detail-list-row">
                    <span>脊柱弯曲</span>
                    <span class="detail-tag detail-tag-green">正常</span>
                  </div>
                  <div class="detail-list-row">
                    <span>骨盆位置</span>
                    <span class="detail-tag detail-tag-green">正常</span>
                  </div>
                </div>
              </div>
              <div class="detail-block detail-block-yellow">
                <h3 class="detail-block-title">改善建议</h3>
                <ul class="detail-list detail-list-ul detail-list-yellow">
                  <li>• 每小时起身活动5-10分钟</li>
                  <li>• 进行肩部拉伸和旋转运动</li>
                  <li>• 使用符合人体工学的办公设备</li>
                  <li>• 定期进行体态检查</li>
                </ul>
              </div>
            </div>
            <div class="detail-col">
              <div class="detail-block detail-block-green">
                <h3 class="detail-block-title">优势项目</h3>
                <ul class="detail-list detail-list-ul detail-list-green">
                  <li>• 脊柱弯曲度正常</li>
                  <li>• 头部位置良好</li>
                  <li>• 骨盆位置标准</li>
                  <li>• 整体体态较好</li>
                </ul>
              </div>
              <div class="detail-block detail-block-red">
                <h3 class="detail-block-title">注意事项</h3>
                <ul class="detail-list detail-list-ul detail-list-red">
                  <li>• 避免长时间单侧负重</li>
                  <li>• 注意睡眠姿势</li>
                  <li>• 定期更换背包肩带</li>
                  <li>• 关注肩部不适症状</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 舌苔分析 -->
      <div v-show="activeTab==='tongue'">
        <div class="card detail-card">
          <h2 class="detail-title">舌苔健康详细分析</h2>
          <div class="detail-grid">
            <div class="detail-col">
              <div class="detail-block detail-block-red">
                <h3 class="detail-block-title">舌苔特征</h3>
                <div class="detail-list">
                  <div class="detail-list-row">
                    <span>舌色</span>
                    <span class="detail-bold">淡红色</span>
                  </div>
                  <div class="detail-list-row">
                    <span>苔质</span>
                    <span class="detail-bold">薄白苔</span>
                  </div>
                  <div class="detail-list-row">
                    <span>舌形</span>
                    <span class="detail-bold">正常</span>
                  </div>
                  <div class="detail-list-row">
                    <span>润燥度</span>
                    <span class="detail-bold">润泽</span>
                  </div>
                </div>
              </div>
              <div class="detail-block detail-block-blue">
                <h3 class="detail-block-title">中医体质分析</h3>
                <div class="detail-list">
                  <div class="detail-list-row">
                    <span>主要体质</span>
                    <span class="detail-bold">平和质</span>
                  </div>
                  <div class="detail-list-row">
                    <span>次要体质</span>
                    <span class="detail-bold">湿热质</span>
                  </div>
                  <p class="detail-desc-blue">
                    您的体质以平和质为主，但有轻微湿热倾向，需要注意饮食调理。
                  </p>
                </div>
              </div>
            </div>
            <div class="detail-col">
              <div class="detail-block detail-block-green">
                <h3 class="detail-block-title">饮食建议</h3>
                <div class="detail-list">
                  <div>
                    <h4 class="detail-block-subtitle detail-block-subtitle-green">推荐食物</h4>
                    <p class="detail-desc-green">薏米、绿豆、冬瓜、丝瓜、苦瓜、荷叶茶</p>
                  </div>
                  <div>
                    <h4 class="detail-block-subtitle detail-block-subtitle-green">避免食物</h4>
                    <p class="detail-desc-green">辛辣、油腻、烧烤、甜腻食物</p>
                  </div>
                </div>
              </div>
              <div class="detail-block detail-block-purple">
                <h3 class="detail-block-title">调理方案</h3>
                <ul class="detail-list detail-list-ul detail-list-purple">
                  <li>• 早晨空腹喝温开水</li>
                  <li>• 餐后不要立即喝水</li>
                  <li>• 保持规律的作息时间</li>
                  <li>• 适当进行有氧运动</li>
                  <li>• 保持心情愉快</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 趋势分析 -->
      <div v-show="activeTab==='trends'">
        <div class="card detail-card">
          <h2 class="detail-title">健康趋势分析</h2>
          <div class="detail-grid">
            <div class="detail-col">
              <div class="detail-block detail-block-blue">
                <h3 class="detail-block-title">骨骼健康趋势</h3>
                <div class="trend-list">
                  <div class="trend-row">
                    <span>最近5次检测</span>
                    <span class="trend-up">↗ 呈上升趋势</span>
                  </div>
                  <div class="trend-bar-group">
                    <div class="trend-bar trend-bar-blue" style="height: 78%">78</div>
                    <div class="trend-bar trend-bar-blue" style="height: 80%">80</div>
                    <div class="trend-bar trend-bar-blue" style="height: 82%">82</div>
                    <div class="trend-bar trend-bar-blue" style="height: 85%">85</div>
                    <div class="trend-bar trend-bar-blue" style="height: 85%">85</div>
                  </div>
                </div>
              </div>
              <div class="detail-block detail-block-red">
                <h3 class="detail-block-title">舌苔健康趋势</h3>
                <div class="trend-list">
                  <div class="trend-row">
                    <span>最近5次检测</span>
                    <span class="trend-stable">→ 基本稳定</span>
                  </div>
                  <div class="trend-bar-group">
                    <div class="trend-bar trend-bar-red" style="height: 75%">75</div>
                    <div class="trend-bar trend-bar-red" style="height: 76%">76</div>
                    <div class="trend-bar trend-bar-red" style="height: 78%">78</div>
                    <div class="trend-bar trend-bar-red" style="height: 79%">79</div>
                    <div class="trend-bar trend-bar-red" style="height: 78%">78</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="detail-col">
              <div class="detail-block detail-block-green">
                <h3 class="detail-block-title">改善成果</h3>
                <div class="trend-list">
                  <div class="trend-row">
                    <span>骨骼健康提升</span>
                    <span class="trend-up">+7分</span>
                  </div>
                  <div class="trend-row">
                    <span>体态改善</span>
                    <span class="trend-up">显著</span>
                  </div>
                  <div class="trend-row">
                    <span>舌苔稳定性</span>
                    <span class="trend-up">良好</span>
                  </div>
                </div>
              </div>
              <div class="detail-block detail-block-yellow">
                <h3 class="detail-block-title">下阶段目标</h3>
                <ul class="detail-list detail-list-ul detail-list-yellow">
                  <li>• 骨骼健康评分提升至90分以上</li>
                  <li>• 完全纠正肩部不平衡问题</li>
                  <li>• 舌苔健康评分提升至85分</li>
                  <li>• 建立更规律的生活习惯</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
const activeTab = ref('overview')
const router = useRouter()
function goHome() { router.push('/') }
const circleStyle = computed(() => {
  return {
    background: 'conic-gradient(#3b82f6 295.2deg, #e5e7eb 0deg)',
    mask: 'radial-gradient(circle at center, transparent 60%, black 60%)'
  }
})
</script>

<style scoped>
@import url('https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css');

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  height: 64px;
  background: rgba(10, 20, 40, 0.92);
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  border-bottom: 2px solid #1a4b7a;
  backdrop-filter: blur(8px);
}
.navbar-left {
  display: flex;
  align-items: center;
}
.back-btn {
  margin-right: 24px;
  padding: 8px 22px;
  font-size: 1rem;
  font-family: 'Microsoft YaHei', 'Orbitron', sans-serif;
  font-weight: 600;
  color: #2196f3;
  background: linear-gradient(90deg, rgba(20,30,50,0.8), rgba(30,60,120,0.6));
  border: 1.5px solid #1976d2;
  border-radius: 16px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
  outline: none;
}
.back-btn:hover {
  background: linear-gradient(90deg, #0d223a 60%, #1976d2 100%);
  color: #42a5f5;
  box-shadow: 0 4px 16px rgba(33,150,243,0.10);
}
.logo {
  font-size: 2rem;
  font-weight: 700;
  font-family: 'Microsoft YaHei', 'Orbitron', sans-serif;
  letter-spacing: 2px;
  background: linear-gradient(90deg, #00ccff 0%, #0099ff 50%, #4da6ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  text-shadow: none;
  margin-right: 32px;
}
.report-status {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(20, 30, 50, 0.85);
  border-radius: 20px;
  padding: 8px 18px;
  border: 1.5px solid #2196f3;
}
.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: radial-gradient(circle, #00eaff, #2196f3);
  box-shadow: 0 0 15px #00eaff99;
  animation: statusPulse 2s infinite;
}
.status-text {
  color: #42a5f5;
  font-weight: 600;
  font-size: 1rem;
}
@keyframes statusPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.2); }
}
.report-bg {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a1428 0%, #1a2740 100%);
  padding: 96px 0 32px 0;
}
.report-main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
}
.report-title-box {
  text-align: center;
  margin-bottom: 32px;
}
.report-title {
  font-size: 2.5rem;
  font-weight: bold;
  background: linear-gradient(90deg, #00ccff 0%, #0099ff 50%, #4da6ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  margin-bottom: 8px;
}
.report-desc {
  color: #42a5f5;
  font-size: 1.1rem;
}
.tab-bar {
  display: flex;
  gap: 8px;
  background: rgba(20, 30, 50, 0.85);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 4px;
  margin-bottom: 32px;
  justify-content: flex-start;
  border: 1.5px solid #1976d2;
}
.tab-btn {
  flex: 1;
  padding: 12px 0;
  border-radius: 8px;
  font-weight: 500;
  font-size: 1.08rem;
  color: #42a5f5;
  background: none;
  border: none;
  outline: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: background 0.2s, color 0.2s;
}
.tab-btn-active {
  background: linear-gradient(90deg, #1976d2 60%, #42a5f5 100%);
  color: #fff;
}

/* 综合评估 */
.overview-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.card {
  background: rgba(10, 20, 40, 0.92);
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.18);
  padding: 32px;
  border: 1.5px solid #1976d2;
}
.score-card {
  text-align: center;
}
.score-title {
  font-size: 1.5rem;
  font-weight: bold;
  background: linear-gradient(90deg, #00ccff 0%, #0099ff 50%, #4da6ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  margin-bottom: 18px;
}
.score-center {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.score-circle-box {
  position: relative;
  width: 128px;
  height: 128px;
  margin-bottom: 18px;
}
.score-circle-bg {
  width: 100%;
  height: 100%;
  background: #e5e7eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.score-num {
  font-size: 2.2rem;
  font-weight: bold;
  color: #42a5f5;
}
.score-circle-progress {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 4px solid #2563eb;
  pointer-events: none;
}
.score-tip {
  color: #6b7280;
  font-size: 1rem;
}
.overview-indicators {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
.indicator-card {
  padding: 24px;
}
.indicator-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.indicator-title {
  font-size: 1.1rem;
  font-weight: 600;
  background: linear-gradient(90deg, #00ccff 0%, #0099ff 50%, #4da6ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
}
.indicator-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}
.indicator-icon-blue {
  background: #101c2c;
  color: #42a5f5;
}
.indicator-icon-red {
  background: #1a2740;
  color: #ef4444;
}
.indicator-bar-box {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.indicator-bar-bg {
  flex: 1;
  background: #e5e7eb;
  border-radius: 8px;
  height: 8px;
  overflow: hidden;
}
.indicator-bar {
  height: 8px;
  border-radius: 8px;
}
.indicator-bar-blue {
  background: #1976d2;
}
.indicator-bar-red {
  background: #ef4444;
}
.indicator-score {
  font-weight: 600;
  font-size: 1rem;
}
.indicator-score-blue {
  color: #42a5f5;
}
.indicator-score-red {
  color: #ef4444;
}
.indicator-tip {
  color: #6b7280;
  font-size: 0.98rem;
}
.advice-card {
  padding: 24px;
}
.advice-title {
  font-size: 1.1rem;
  font-weight: 600;
  background: linear-gradient(90deg, #00ccff 0%, #0099ff 50%, #4da6ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  margin-bottom: 18px;
}
.advice-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
.advice-block-title {
  font-weight: 500;
  margin-bottom: 8px;
}
.advice-block-title-blue {
  color: #42a5f5;
}
.advice-block-title-green {
  color: #16a34a;
}
.advice-list {
  color: #6b7280;
  font-size: 0.98rem;
  list-style: none;
  padding-left: 0;
  margin: 0;
}

/* 详细分析 */
.detail-card {
  padding: 32px;
}
.detail-title {
  font-size: 1.5rem;
  font-weight: bold;
  background: linear-gradient(90deg, #00ccff 0%, #0099ff 50%, #4da6ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  margin-bottom: 24px;
}
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}
.detail-col {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.detail-block {
  border-radius: 12px;
  padding: 24px;
  background: #101c2c;
}
.detail-block-blue {
  background: #101c2c;
  border-left: 4px solid #42a5f5;
}
.detail-block-yellow {
  background: #1a2740;
  border-left: 4px solid #eab308;
}
.detail-block-green {
  background: #102c2c;
  border-left: 4px solid #16a34a;
}
.detail-block-red {
  background: #1a202c;
  border-left: 4px solid #ef4444;
}
.detail-block-purple {
  background: #191c2c;
  border-left: 4px solid #7c3aed;
}
.detail-block-title {
  font-weight: 600;
  color: #22334d;
  margin-bottom: 14px;
}
.detail-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.detail-list-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.detail-tag {
  font-size: 0.95rem;
  padding: 2px 10px;
  border-radius: 8px;
  font-weight: 500;
}
.detail-tag-green {
  background: #bbf7d0;
  color: #15803d;
}
.detail-tag-yellow {
  background: #fef08a;
  color: #b45309;
}
.detail-bold {
  font-weight: 500;
}
.detail-desc-blue {
  color: #2563eb;
  font-size: 0.98rem;
  margin-top: 8px;
}
.detail-block-subtitle {
  font-weight: 500;
  margin-bottom: 4px;
}
.detail-block-subtitle-green {
  color: #16a34a;
}
.detail-desc-green {
  color: #16a34a;
  font-size: 0.98rem;
}
.detail-list-ul {
  list-style: none;
  padding-left: 0;
  margin: 0;
  font-size: 0.98rem;
}
.detail-list-green {
  color: #15803d;
}
.detail-list-yellow {
  color: #b45309;
}
.detail-list-red {
  color: #dc2626;
}
.detail-list-purple {
  color: #7c3aed;
}

/* 趋势分析 */
.trend-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.trend-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.98rem;
}
.trend-up {
  color: #16a34a;
  font-weight: 500;
}
.trend-stable {
  color: #eab308;
  font-weight: 500;
}
.trend-bar-group {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 96px;
}
.trend-bar {
  flex: 1;
  background: #e5e7eb;
  border-radius: 6px 6px 0 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  color: #fff;
  font-size: 0.92rem;
  font-weight: 500;
  transition: background 0.2s;
}
.trend-bar-blue {
  background: #2563eb;
}
.trend-bar-red {
  background: #ef4444;
}

@media (max-width: 900px) {
  .detail-grid, .overview-indicators, .advice-grid {
    grid-template-columns: 1fr;
    gap: 18px;
  }
  .detail-card, .card {
    padding: 18px;
  }
}
@media (max-width: 600px) {
  .report-main {
    padding: 0 4px;
  }
  .score-circle-box {
    width: 90px;
    height: 90px;
  }
}
</style> 