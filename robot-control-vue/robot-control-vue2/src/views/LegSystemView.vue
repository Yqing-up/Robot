<template>
  <div class="container">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="nav-section">
        <button class="btn btn-back" @click="goBack">← 返回主页</button>
        <h1 class="title">腿部系统控制中心</h1>
      </div>
      <div class="header-controls">
        <!-- 状态指示器已移除 -->
        <div class="header-buttons">
          <button class="btn btn-small" @click="resetSystem">重置系统</button>
          <button class="btn btn-small" @click="exportMovementData">导出数据</button>
        </div>
      </div>
    </header>

    <main class="leg-main">
      <!-- 使用左右布局容器 -->
      <div class="leg-layout-container">
        <!-- 左侧控制区 -->
        <div class="leg-left-section">
          <!-- 主控制区 -->
          <section class="control-section">
            <div class="main-controls">
              <!-- 方向控制 -->
              <div class="direction-control">
                <h3>方向控制</h3>
                <div class="direction-pad">
                  <button class="direction-btn forward" 
                          :class="{ active: currentDirection === 'forward' }"
                          @click="setDirection('forward')"
                          data-direction="forward">
                    <span class="arrow">↑</span>
                    <span class="label">前进</span>
                  </button>
                  <div class="middle-row">
                    <button class="direction-btn left" 
                            :class="{ active: currentDirection === 'left' }"
                            @click="setDirection('left')"
                            data-direction="left">
                      <span class="arrow">←</span>
                      <span class="label">左转</span>
                    </button>
                    <button class="direction-btn stop emergency" 
                            :class="{ active: currentDirection === 'stop' }"
                            @click="emergencyStop"
                            data-direction="stop">
                      <span class="stop-icon">■</span>
                      <span class="label">紧急停止</span>
                    </button>
                    <button class="direction-btn right" 
                            :class="{ active: currentDirection === 'right' }"
                            @click="setDirection('right')"
                            data-direction="right">
                      <span class="arrow">→</span>
                      <span class="label">右转</span>
                    </button>
                  </div>
                  <button class="direction-btn backward" 
                          :class="{ active: currentDirection === 'backward' }"
                          @click="setDirection('backward')"
                          data-direction="backward">
                    <span class="arrow">↓</span>
                    <span class="label">后退</span>
                  </button>
                </div>
              </div>

              <!-- 速度控制 -->
              <div class="speed-control">
                <h3>速度控制</h3>
                <div class="speed-selector">
                  <button class="speed-btn" 
                          :class="{ active: currentSpeed === 'slow' }"
                          @click="setSpeed('slow')"
                          data-speed="slow">
                    <span class="speed-icon">🐌</span>
                    <span class="speed-label">慢速</span>
                    <span class="speed-value">0.5 m/s</span>
                  </button>
                  <button class="speed-btn" 
                          :class="{ active: currentSpeed === 'medium' }"
                          @click="setSpeed('medium')"
                          data-speed="medium">
                    <span class="speed-icon">🚶</span>
                    <span class="speed-label">中速</span>
                    <span class="speed-value">1.0 m/s</span>
                  </button>
                  <button class="speed-btn" 
                          :class="{ active: currentSpeed === 'fast' }"
                          @click="setSpeed('fast')"
                          data-speed="fast">
                    <span class="speed-icon">🏃</span>
                    <span class="speed-label">快速</span>
                    <span class="speed-value">2.0 m/s</span>
                  </button>
                </div>
                <div class="speed-display">
                  <div class="current-speed">
                    <span class="speed-text">当前速度</span>
                    <span class="speed-number">{{ speedSettings[currentSpeed].value }}</span>
                    <span class="speed-unit">m/s</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        
        <!-- 右侧监控区 -->
        <div class="leg-right-section">
          <!-- 状态监控区 -->
          <section class="monitoring-section">
            <div class="monitor-grid">
              <!-- 平衡系统监控 -->
              <div class="monitor-panel balance-panel">
                <div class="panel-header">
                  <h3>平衡系统</h3>
                  <div class="status-indicator online"></div>
                </div>
                <div class="balance-display">
                  <div class="balance-meter">
                    <div class="balance-indicator" :style="{ transform: `translate3d(calc(-50% + ${balance.tilt * 3}px), -50%, 0)` }"></div>
                    <div class="balance-scale">
                      <span>-30°</span>
                      <span>0°</span>
                      <span>+30°</span>
                    </div>
                  </div>
                  <div class="balance-values">
                    <div class="balance-item">
                      <span class="label">倾斜角度</span>
                      <span class="value">{{ balance.tilt.toFixed(1) }}°</span>
                    </div>
                    <div class="balance-item">
                      <span class="label">稳定性</span>
                      <span class="value">{{ balance.stability.toFixed(2) }}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 移动状态监控 -->
              <div class="monitor-panel movement-panel">
                <div class="panel-header">
                  <h3>移动状态</h3>
                  <div class="status-indicator" :class="isMoving ? 'online' : 'offline'"></div>
                </div>
                <div class="movement-display">
                  <div class="position-info">
                    <div class="position-item">
                      <span class="label">X坐标</span>
                      <span class="value">{{ position.x.toFixed(1) }} m</span>
                    </div>
                    <div class="position-item">
                      <span class="label">Y坐标</span>
                      <span class="value">{{ position.y.toFixed(1) }} m</span>
                    </div>
                    <div class="position-item">
                      <span class="label">朝向</span>
                      <span class="value">{{ heading }}°</span>
                    </div>
                    <div class="position-item">
                      <span class="label">总距离</span>
                      <span class="value">{{ totalDistance.toFixed(1) }} m</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 步态选择 -->
              <div class="monitor-panel gait-panel">
                <div class="panel-header">
                  <h3>步态模式</h3>
                </div>
                <div class="gait-selector">
                  <button class="gait-btn" 
                          :class="{ active: currentGait === 'normal' }"
                          @click="setGait('normal')"
                          data-gait="normal">
                    <span class="gait-icon">👣</span>
                    <span class="gait-name">正常行走</span>
                    <span class="gait-desc">稳定平衡</span>
                  </button>
                  <button class="gait-btn" 
                          :class="{ active: currentGait === 'fast' }"
                          @click="setGait('fast')"
                          data-gait="fast">
                    <span class="gait-icon">⚡</span>
                    <span class="gait-name">快速移动</span>
                    <span class="gait-desc">高效率</span>
                  </button>
                  <button class="gait-btn" 
                          :class="{ active: currentGait === 'precise' }"
                          @click="setGait('precise')"
                          data-gait="precise">
                    <span class="gait-icon">🎯</span>
                    <span class="gait-name">精确定位</span>
                    <span class="gait-desc">高精度</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 响应式数据
const isMoving = ref(false)
const currentDirection = ref('stop')
const currentSpeed = ref('medium')
const currentGait = ref('normal')

// 使用reactive而非ref来避免不必要的响应式更新传播
const position = reactive({ x: 0, y: 0 })
const heading = ref(0)
const totalDistance = ref(0)
const stepCount = ref(0)
const balance = reactive({ 
  tilt: 0, // 初始值为0度
  stability: 98 
})
const runTime = ref(0)
const batteryLevel = ref(1.0)
const temperature = ref(45)

// 系统状态
const systemStatus = ref('online')
const statusText = ref('系统就绪')

// 速度设置
const speedSettings = {
  slow: { value: 0.5, label: '慢速', icon: '🐌' },
  medium: { value: 1.0, label: '中速', icon: '🚶' },
  fast: { value: 2.0, label: '快速', icon: '🏃' }
}

// 动画帧ID
let animationFrameId = null
let lastUpdateTime = 0
let isUpdating = false
let updateCount = 0

// 方法
const goBack = () => {
  router.push('/')
}

// 设置方向
const setDirection = (direction) => {
  currentDirection.value = direction
  isMoving.value = direction !== 'stop'
  
  if (direction === 'stop') {
    statusText.value = '系统就绪'
  } else {
    statusText.value = `正在${getDirectionLabel(direction)}`
  }
}

// 紧急停止
const emergencyStop = () => {
  setDirection('stop')
  statusText.value = '紧急停止'
  console.log('紧急停止')
}

// 设置速度
const setSpeed = (speed) => {
  currentSpeed.value = speed
  console.log('速度设置为:', speedSettings[speed].label)
}

// 设置步态模式
const setGait = (gait) => {
  currentGait.value = gait
  console.log('步态模式设置为:', gait)
}

// 获取方向文本
const getDirectionLabel = (direction) => {
  switch (direction) {
    case 'forward': return '前进'
    case 'backward': return '后退'
    case 'left': return '左转'
    case 'right': return '右转'
    case 'stop': return '停止'
    default: return ''
  }
}

const resetSystem = () => {
  currentDirection.value = 'stop'
  currentSpeed.value = 'medium'
  currentGait.value = 'normal'
  isMoving.value = false
  position.value = { x: 0, y: 0 }
  heading.value = 0
  totalDistance.value = 0
  stepCount.value = 0
  console.log('系统已重置')
}

const exportMovementData = () => {
  const data = {
    position: position.value,
    heading: heading.value,
    totalDistance: totalDistance.value,
    stepCount: stepCount.value,
    currentSpeed: currentSpeed.value,
    currentGait: currentGait.value,
    balance: balance.value,
    timestamp: new Date().toISOString()
  }

  const dataStr = JSON.stringify(data, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })

  const link = document.createElement('a')
  link.href = URL.createObjectURL(dataBlob)
  link.download = 'leg_system_data.json'
  link.click()

  console.log('导出数据:', data)
}

// 键盘控制
const handleKeyDown = (event) => {
  switch (event.key.toLowerCase()) {
    case 'w':
    case 'arrowup':
      setDirection('forward')
      break
    case 's':
    case 'arrowdown':
      setDirection('backward')
      break
    case 'a':
    case 'arrowleft':
      setDirection('left')
      break
    case 'd':
    case 'arrowright':
      setDirection('right')
      break
    case ' ':
      event.preventDefault()
      emergencyStop()
      break
  }
}

const handleKeyUp = (event) => {
  // 松开按键时停止移动（除了空格键）
  if (event.key !== ' ') {
    setDirection('stop')
  }
}

// 模拟数据更新 - 使用requestAnimationFrame替代setInterval
const startMonitoring = () => {
  // 初始化时间
  lastUpdateTime = performance.now()
  isUpdating = true
  
  // 创建平滑的更新函数
  const updateFrame = (timestamp) => {
    if (!isUpdating) return
    
    // 计算经过的时间（毫秒）
    const elapsed = timestamp - lastUpdateTime
    
    // 控制更新频率，每200ms更新一次数据
    if (elapsed > 200) {
      updateCount++
      
      // 平衡系统数据 - 使用平滑的变化算法
      // 使用更小更平滑的变化量
      const tiltChange = (Math.random() - 0.5) * 0.3 // 更小的变化
      let newTilt = balance.tilt + tiltChange
      
      // 模拟一种自然的平衡恢复效果 - 向0回归
      newTilt = newTilt * 0.95 // 缓慢向中心位置靠近
      
      // 限制在合理范围内
      newTilt = Math.max(-5, Math.min(5, newTilt))
      
      // 保留1位小数，减少频繁微小更新
      balance.tilt = parseFloat(newTilt.toFixed(1))
      
      // 稳定性只使用较小的变化，并立即格式化为2位小数
      const stabilityChange = (Math.random() - 0.5) * 0.1
      let newStability = Math.max(95, Math.min(99, balance.stability + stabilityChange))
      balance.stability = parseFloat(newStability.toFixed(2)) // 直接保留2位小数，避免显示过多小数位

      // 只有需要更新的数据才在这里更新
      // 如果正在移动，更新位置
      if (isMoving.value && currentDirection.value !== 'stop') {
        const speed = speedSettings[currentSpeed.value].value
        const deltaTime = 0.1 // 100ms
        
        switch (currentDirection.value) {
          case 'forward':
            position.y += speed * deltaTime
            break
          case 'backward':
            position.y -= speed * deltaTime
            break
          case 'left':
            heading.value = (heading.value - 5) % 360
            break
          case 'right':
            heading.value = (heading.value + 5) % 360
            break
        }

        stepCount.value++
        totalDistance.value += speed * deltaTime
      }

      // 只在每10次更新才处理这些不太重要的数据，减少页面重绘
      if (updateCount % 10 === 0) {
        // 更新运行时间
        runTime.value++
        
        // 模拟电池消耗
        if (isMoving.value) {
          batteryLevel.value = Math.max(0, batteryLevel.value - 0.001)
        }
        
        // 模拟温度变化
        temperature.value = Math.round((40 + Math.random() * 10) * 10) / 10 // 保留1位小数
      }
      
      lastUpdateTime = timestamp
    }
    
    // 继续下一帧
    animationFrameId = requestAnimationFrame(updateFrame)
  }
  
  // 开始动画循环
  animationFrameId = requestAnimationFrame(updateFrame)
  
  // 返回一个停止函数
  return () => {
    isUpdating = false
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
  }
}

// 保存到本地存储
const saveToLocalStorage = () => {
  const data = {
    position: position.value,
    heading: heading.value,
    totalDistance: totalDistance.value,
    stepCount: stepCount.value,
    currentSpeed: currentSpeed.value,
    currentGait: currentGait.value,
    runTime: runTime.value,
    batteryLevel: batteryLevel.value
  }
  localStorage.setItem('legSystemData', JSON.stringify(data))
}

// 从本地存储加载
const loadFromLocalStorage = () => {
  const savedData = localStorage.getItem('legSystemData')
  if (savedData) {
    try {
      const data = JSON.parse(savedData)
      position.value = data.position || { x: 0, y: 0 }
      heading.value = data.heading || 0
      totalDistance.value = data.totalDistance || 0
      stepCount.value = data.stepCount || 0
      currentSpeed.value = data.currentSpeed || 'medium'
      currentGait.value = data.currentGait || 'normal'
      runTime.value = data.runTime || 0
      batteryLevel.value = data.batteryLevel || 85
    } catch (error) {
      console.error('加载数据失败:', error)
    }
  }
}

onMounted(() => {
  console.log('腿部系统组件已挂载')
  loadFromLocalStorage()

  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('keyup', handleKeyUp)

  // 开始监控
  const stopMonitoring = startMonitoring()

  // 定期保存数据
  const saveInterval = setInterval(saveToLocalStorage, 30000)

  onUnmounted(() => {
    console.log('腿部系统组件已卸载')
    document.removeEventListener('keydown', handleKeyDown)
    document.removeEventListener('keyup', handleKeyUp)
    stopMonitoring() // 停止动画帧
    clearInterval(saveInterval)
    saveToLocalStorage() // 最后保存一次
  })
})
</script>

<style scoped>
.leg-system {
  min-height: 100vh;
  overflow: visible;
  padding-top: 80px; /* 为固定header留出空间 */
}

.leg-content {
  overflow: visible;
  min-height: calc(100vh - 80px);
}
/* 组件特定样式将在这里添加 */
.title {
  color: #fff !important;
  background: none !important;
  -webkit-background-clip: unset !important;
  -webkit-text-fill-color: unset !important;
  background-clip: unset !important;
  text-shadow: 0 0 15px rgba(0, 153, 255, 0.2);
}
</style>
