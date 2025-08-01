<template>
  <div class="container">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="nav-section">
        <button class="btn btn-back" @click="goBack">← 返回主页</button>
        <h1 class="title">机器人综合管理中心</h1>
      </div>
      <div class="header-controls">
        <div class="header-buttons">
          <button class="btn btn-small" @click="handleRefreshAllStatus">刷新状态</button>
          <button class="btn btn-small" @click="handleEmergencyStopAll">紧急停止</button>
          <button class="btn btn-small" @click="handleExportAllData">导出数据</button>
        </div>
      </div>
    </header>

    <main class="management-main">
      <!-- 第一层：机器人画面区域 -->
      <section class="camera-layer">
        <div class="camera-section">
          <!-- 视频显示区域 -->
          <div class="video-display" style="height: 500px !important; max-width: 900px !important; width: 100% !important; margin: 0 auto !important;">
            <!-- 视频模式 -->
            <video
              v-if="!useFallbackImage"
              ref="cameraVideo"
              class="camera-stream"
              style="object-fit: contain !important; width: 100% !important; height: 100% !important;"
              :src="cameraStreamUrl"
              autoplay
              muted
              playsinline
              controls
              preload="none"
              @loadstart="onVideoLoadStart"
              @loadeddata="onVideoLoaded"
              @play="onVideoPlay"
              @pause="onVideoPause"
              @ended="onVideoEnded"
              @error="onVideoError"
              @canplay="onVideoCanPlay"
              @waiting="onVideoWaiting"
            >
              <div class="video-placeholder">
                <div class="placeholder-icon">📹</div>
                <div class="placeholder-text">摄像头画面</div>
                <div class="placeholder-status">{{ cameraStatus }}</div>
              </div>
            </video>

            <!-- 图片模式（MJPEG流备用方案） -->
            <img
              v-else
              ref="cameraImage"
              class="camera-stream"
              style="object-fit: contain !important; width: 100% !important; height: 100% !important;"
              :src="cameraStreamUrl"
              @load="onImageLoad"
              @error="onImageError"
              alt="摄像头画面"
            />
            <div v-if="!cameraConnected" class="video-overlay">
              <div class="overlay-content">
                <div class="overlay-icon">📹</div>
                <div class="overlay-text">摄像头画面</div>
                <div class="overlay-status">{{ cameraStatus }}</div>
              </div>
            </div>
          </div>
          
          <!-- 摄像头控制按钮 -->
          <div class="camera-controls">
            <button class="camera-btn" @click="handleInitializeCamera" :disabled="cameraLoading">
              {{ cameraLoading ? '连接中...' : '刷新摄像头' }}
            </button>
            <button class="camera-btn" @click="handleToggleCamera" :disabled="cameraLoading">
              {{ cameraConnected ? '断开摄像头' : '连接摄像头' }}
            </button>
            <button class="camera-btn" @click="handleToggleFullscreen" :disabled="!cameraConnected">
              {{ isFullscreen ? '🔍 退出全屏' : '🔍 全屏' }}
            </button>
          </div>
        </div>
      </section>

      <!-- 第二层：三个功能模块水平排列 -->
      <section class="modules-layer">
        <div class="modules-grid">
          
          <!-- 左侧模块：语音库管理 -->
          <div class="module-section voice-module">
            <div class="module-header">
              <h3>🎤 语音库管理</h3>
              <div class="module-status" :class="voiceStatus">{{ voiceStatusText }}</div>
            </div>
            
            <div class="module-content">
              <!-- 语音库统计 -->
              <div class="library-stats">
                <span>共 {{ voiceLibrary.length }} 条语音</span>
                <button class="btn btn-small btn-primary" @click="handleShowAddDialog">+ 添加语音</button>
              </div>

              <!-- 搜索和筛选 -->
              <div class="voice-controls">
                <div class="search-box">
                  <input 
                    type="text" 
                    v-model="searchText" 
                    placeholder="搜索语音内容..."
                    class="search-input"
                  >
                </div>
                <div class="filter-controls">
                  <select v-model="selectedCategory" class="filter-select">
                    <option value="">所有分类</option>
                    <option value="greeting">问候语</option>
                    <option value="response">回应语</option>
                    <option value="notification">通知语</option>
                    <option value="emotion">情感表达</option>
                    <option value="system">系统提示</option>
                  </select>
                </div>
              </div>

              <!-- 语音列表 -->
              <div class="voice-list scrollable-list">
                <div 
                  class="voice-item" 
                  v-for="voice in filteredVoiceLibrary" 
                  :key="voice.id"
                  :class="{ playing: playingVoiceId === voice.id }"
                >
                  <div class="voice-header">
                    <div class="voice-info">
                      <span class="voice-title">{{ voice.title }}</span>
                      <div class="voice-meta">
                        <span class="voice-category">{{ getCategoryName(voice.category) }}</span>
                        <span class="voice-language">{{ voice.language }}</span>
                      </div>
                    </div>
                    <div class="voice-actions">
                      <button
                        class="btn btn-mini btn-play"
                        @click="handlePlayVoiceText(voice)"
                        :disabled="isSpeaking"
                      >
                        {{ playingVoiceId === voice.id ? '暂停' : '播放' }}
                      </button>
                      <button
                        class="btn btn-mini btn-edit"
                        @click="handleEditVoiceText(voice)"
                      >
                        编辑
                      </button>
                    </div>
                  </div>
                  <div class="voice-content">{{ voice.content }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 中间模块：上肢动作库管理 -->
          <div class="module-section arm-module">
            <div class="module-header">
              <h3>🦾 上肢动作库</h3>
              <div class="module-status" :class="armStatus">{{ armStatusText }}</div>
            </div>
            
            <div class="module-content">
              <!-- 动作库统计 -->
              <div class="library-stats">
                <span>共 {{ actionLibrary.length }} 个动作</span>
                <button class="btn btn-small btn-secondary" @click="handleLoadActionLibrary" :disabled="isLoadingActions">
                  {{ isLoadingActions ? '刷新中...' : '刷新' }}
                </button>
              </div>

              <!-- 搜索和筛选 -->
              <div class="action-controls">
                <div class="search-box">
                  <input 
                    type="text" 
                    v-model="actionSearchText" 
                    placeholder="搜索动作名称..."
                    class="search-input"
                  >
                </div>
                <div class="filter-controls">
                  <select v-model="selectedActionCategory" class="filter-select">
                    <option value="">所有分类</option>
                    <option value="basic">基础动作</option>
                    <option value="gesture">手势动作</option>
                    <option value="manipulation">操作动作</option>
                    <option value="expression">表达动作</option>
                  </select>
                </div>
              </div>

              <!-- 动作列表 -->
              <div class="action-list scrollable-list">
                <div 
                  class="action-item" 
                  v-for="action in filteredActionLibrary" 
                  :key="action.id"
                  :class="{ executing: executingActionId === action.id }"
                >
                  <div class="action-header">
                    <div class="action-info">
                      <span class="action-name">{{ action.name }}</span>
                      <div class="action-meta">
                        <span class="action-category">{{ getActionCategoryName(action.category) }}</span>
                        <span class="action-duration">{{ action.duration }}s</span>
                      </div>
                    </div>
                    <div class="action-actions">
                      <button
                        class="btn btn-mini btn-execute"
                        @click="handleExecuteAction(action)"
                        :disabled="isExecutingArmAction"
                      >
                        {{ executingActionId === action.id ? '执行中' : '执行' }}
                      </button>
                    </div>
                  </div>
                  <div class="action-description">{{ action.description }}</div>
                  <div v-if="executingActionId === action.id" class="action-progress">
                    <div class="progress-bar">
                      <div class="progress-fill" :style="{ width: armProgress + '%' }"></div>
                    </div>
                    <span class="progress-text">{{ armProgress }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧模块：下肢移动控制 -->
          <div class="module-section leg-module">
            <div class="module-header">
              <h3>🦵 下肢移动控制</h3>
              <div class="module-status" :class="legStatus">{{ legStatusText }}</div>
            </div>
            
            <div class="module-content">
              <!-- 方向控制 -->
              <div class="direction-control-panel">
                <h4>方向控制</h4>
                <div class="direction-pad-extended">
                  <!-- 左移按钮 -->
                  <button 
                    class="direction-btn side-btn left-move"
                    :class="{ active: currentDirection === 'left-move' }"
                    :disabled="isExecutingMovement"
                    @click="handleExecuteMovement('left-move')"
                  >
                    <span class="direction-icon">←</span>
                    <span class="direction-label">左移</span>
                  </button>

                  <!-- 中央控制区域 -->
                  <div class="center-controls">
                    <button 
                      class="direction-btn forward"
                      :class="{ active: currentDirection === 'forward' }"
                      @click="handleExecuteMovement('forward')"
                      :disabled="isExecutingMovement"
                    >
                      <span class="direction-icon">↑</span>
                      <span class="direction-label">前进</span>
                    </button>
                    <div class="direction-middle-row">
                      <button 
                        class="direction-btn left"
                        :class="{ active: currentDirection === 'left' }"
                        @click="handleExecuteMovement('left')"
                        :disabled="isExecutingMovement"
                      >
                        <span class="direction-icon">↺</span>
                        <span class="direction-label">左转</span>
                      </button>
                      <button 
                        class="direction-btn stop emergency"
                        :class="{ active: currentDirection === 'stop' }"
                        @click="handleExecuteMovement('stop')"
                      >
                        <span class="direction-icon">■</span>
                        <span class="direction-label">紧急停止</span>
                      </button>
                      <button 
                        class="direction-btn right"
                        :class="{ active: currentDirection === 'right' }"
                        @click="handleExecuteMovement('right')"
                        :disabled="isExecutingMovement"
                      >
                        <span class="direction-icon">↻</span>
                        <span class="direction-label">右转</span>
                      </button>
                    </div>
                    <button 
                      class="direction-btn backward"
                      :class="{ active: currentDirection === 'backward' }"
                      @click="handleExecuteMovement('backward')"
                      :disabled="isExecutingMovement"
                    >
                      <span class="direction-icon">↓</span>
                      <span class="direction-label">后退</span>
                    </button>
                  </div>

                  <!-- 右移按钮 -->
                  <button 
                    class="direction-btn side-btn right-move"
                    :class="{ active: currentDirection === 'right-move' }"
                    :disabled="isExecutingMovement"
                    @click="handleExecuteMovement('right-move')"
                  >
                    <span class="direction-icon">→</span>
                    <span class="direction-label">右移</span>
                  </button>
                </div>
              </div>

              <!-- 移动状态显示 -->
              <div class="movement-status-panel">
                <h4>移动状态</h4>
                <div class="status-display">
                  <div class="status-item">
                    <span class="status-label">当前动作:</span>
                    <span class="status-value">{{ currentMovement }}</span>
                  </div>
                  <div class="status-item">
                    <span class="status-label">位置信息:</span>
                    <span class="status-value">X: {{ position.x }}, Y: {{ position.y }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <!-- 调试信息面板 -->
      <section class="debug-panel" style="background: rgba(0, 20, 40, 0.6); border: 1px solid rgba(255, 255, 0, 0.3); border-radius: 8px; padding: 15px; margin-top: 20px;">
        <h4 style="color: #ffeb3b; margin: 0 0 10px 0;">🔧 系统状态监控</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; font-size: 13px;">
          <div style="background: rgba(0, 0, 0, 0.3); padding: 10px; border-radius: 5px;">
            <div style="color: #4da6ff; font-weight: bold; margin-bottom: 5px;">🎵 语音系统</div>
            <div style="color: #ffffff;">状态: {{ isSpeaking ? '播放中' : '空闲' }}</div>
            <div style="color: #ffffff;">语音库: {{ voiceLibrary.length }} 条</div>
            <div style="color: #ffffff;">当前播放: {{ playingVoiceId ? `ID ${playingVoiceId}` : '无' }}</div>
          </div>
          <div style="background: rgba(0, 0, 0, 0.3); padding: 10px; border-radius: 5px;">
            <div style="color: #4da6ff; font-weight: bold; margin-bottom: 5px;">🦾 上肢系统</div>
            <div style="color: #ffffff;">状态: {{ isExecutingArmAction ? '执行中' : '空闲' }}</div>
            <div style="color: #ffffff;">动作库: {{ actionLibrary.length }} 个</div>
            <div style="color: #ffffff;">执行进度: {{ armProgress }}%</div>
          </div>
          <div style="background: rgba(0, 0, 0, 0.3); padding: 10px; border-radius: 5px;">
            <div style="color: #4da6ff; font-weight: bold; margin-bottom: 5px;">🦵 下肢系统</div>
            <div style="color: #ffffff;">状态: {{ isExecutingMovement ? '执行中' : '空闲' }}</div>
            <div style="color: #ffffff;">当前动作: {{ currentMovement }}</div>
            <div style="color: #ffffff;">位置: X{{ position.x }}, Y{{ position.y }}</div>
          </div>
          <div style="background: rgba(0, 0, 0, 0.3); padding: 10px; border-radius: 5px;">
            <div style="color: #4da6ff; font-weight: bold; margin-bottom: 5px;">📹 摄像头</div>
            <div style="color: #ffffff;">状态: {{ cameraConnected ? '已连接' : '未连接' }}</div>
            <div style="color: #ffffff;">{{ cameraStatus }}</div>
            <div style="color: #ffffff;">全屏: {{ isFullscreen ? '是' : '否' }}</div>
          </div>
        </div>
        <div style="margin-top: 10px; padding: 8px; background: rgba(0, 0, 0, 0.2); border-radius: 4px; font-size: 11px; color: #cccccc;">
          <strong>API端点:</strong> TTS: /api/tts/* | 机器人: /api/robot/* | 移动: /api/robot_movement/* | 摄像头: /api/video/*
        </div>
      </section>
    </main>

    <!-- 添加/编辑语音对话框 -->
    <div v-if="showDialog" class="dialog-overlay" @click="handleCloseDialog">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h3>{{ dialogMode === 'add' ? '添加语音' : '编辑语音' }}</h3>
          <button class="dialog-close" @click="handleCloseDialog">×</button>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label>标题</label>
            <input type="text" v-model="dialogData.title" placeholder="输入语音标题">
          </div>
          <div class="form-group">
            <label>内容</label>
            <textarea v-model="dialogData.content" placeholder="输入语音内容" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>分类</label>
            <select v-model="dialogData.category">
              <option value="greeting">问候语</option>
              <option value="response">回应语</option>
              <option value="notification">通知语</option>
              <option value="emotion">情感表达</option>
              <option value="system">系统提示</option>
            </select>
          </div>
          <div class="form-group">
            <label>语言</label>
            <select v-model="dialogData.language">
              <option value="zh-CN">中文</option>
              <option value="en-US">English</option>
              <option value="ja-JP">日本語</option>
            </select>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-secondary" @click="handleCloseDialog">取消</button>
          <button class="btn btn-primary" @click="handleSaveVoiceData">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import {
  ttsApi,
  robotApi,
  movementApi,
  cameraApi,
  systemApi,
  utils
} from '../api/managementApi.js'

const router = useRouter()

// 摄像头相关数据
const cameraConnected = ref(false)
const cameraLoading = ref(false)
const cameraStatus = ref('摄像头未连接')
const cameraStreamUrl = ref('')
const cameraVideo = ref(null)
const cameraImage = ref(null)
const useFallbackImage = ref(true) // 默认使用图片模式显示MJPEG流
const isFullscreen = ref(false) // 全屏状态

// 语音控制相关
const voiceStatus = ref('online')
const voiceStatusText = ref('语音系统就绪')
const isSpeaking = ref(false)
const playingVoiceId = ref(null)

// 语音库数据和搜索筛选
const voiceLibrary = ref([])
const searchText = ref('')
const selectedCategory = ref('')

// 语音库过滤
const filteredVoiceLibrary = computed(() => {
  return voiceLibrary.value.filter(voice => {
    const matchesSearch = !searchText.value ||
      voice.title.toLowerCase().includes(searchText.value.toLowerCase()) ||
      voice.content.toLowerCase().includes(searchText.value.toLowerCase())
    const matchesCategory = !selectedCategory.value || voice.category === selectedCategory.value
    return matchesSearch && matchesCategory
  })
})

// 语音相关方法
const fetchVoiceTexts = async () => {
  try {
    voiceStatusText.value = '正在加载语音库...'
    const texts = await ttsApi.getVoiceTexts()
    voiceLibrary.value = texts
    voiceStatusText.value = `语音库已加载，共 ${texts.length} 条`
    console.log('✅ 语音文本加载完成')
  } catch (error) {
    console.error('❌ 获取语音文本失败:', error)
    voiceStatusText.value = `获取语音库失败: ${error.message}`
  }
}

const handlePlayVoiceText = async (voice) => {
  if (isSpeaking.value) {
    console.log('🎵 语音正在播放中，忽略新的播放请求')
    return
  }

  try {
    console.log('🎵 开始播放语音:', voice.content)
    playingVoiceId.value = voice.id
    isSpeaking.value = true
    voiceStatusText.value = '正在合成语音...'

    const result = await ttsApi.synthesizeText(voice.content)

    if (result && result.success) {
      console.log('✅ 语音合成成功，机器人开始说话')
      voiceStatusText.value = `正在播放: ${voice.title || voice.content.substring(0, 10)}...`

      // 模拟播放时间（根据文本长度估算）
      const estimatedDuration = Math.max(2000, voice.content.length * 200)

      setTimeout(() => {
        isSpeaking.value = false
        playingVoiceId.value = null
        voiceStatusText.value = '语音播放完成'
        console.log('✅ 语音播放完成')

        setTimeout(() => {
          voiceStatusText.value = `语音库已加载，共 ${voiceLibrary.value.length} 条`
        }, 2000)
      }, estimatedDuration)

    } else {
      throw new Error('语音合成失败')
    }
  } catch (error) {
    console.error('❌ 语音播放失败:', error)
    isSpeaking.value = false
    playingVoiceId.value = null
    voiceStatusText.value = `播放失败: ${error.message}`
    alert(`语音播放失败: ${error.message}`)
  }
}

// 对话框相关
const showDialog = ref(false)
const dialogMode = ref('add') // 'add' 或 'edit'
const dialogData = reactive({
  id: null,
  title: '',
  content: '',
  category: 'greeting',
  language: 'zh-CN'
})

// 上肢控制相关
const armStatus = ref('online')
const armStatusText = ref('上肢系统就绪')
const isExecutingArmAction = ref(false)
const executingActionId = ref(null)
const armProgress = ref(0)
const isLoadingActions = ref(false)

// 动作库数据和搜索筛选
const actionLibrary = ref([])
const actionSearchText = ref('')
const selectedActionCategory = ref('')

// 动作库过滤
const filteredActionLibrary = computed(() => {
  return actionLibrary.value.filter(action => {
    const matchesSearch = !actionSearchText.value ||
      action.name.toLowerCase().includes(actionSearchText.value.toLowerCase()) ||
      action.description.toLowerCase().includes(actionSearchText.value.toLowerCase())
    const matchesCategory = !selectedActionCategory.value || action.category === selectedActionCategory.value
    return matchesSearch && matchesCategory
  })
})

// 动作库相关方法
const handleLoadActionLibrary = async () => {
  isLoadingActions.value = true
  try {
    console.log('📚 正在从API加载动作库...')
    armStatusText.value = '正在加载动作库...'

    const actions = await robotApi.getActionList()
    actionLibrary.value = actions
    armStatusText.value = `动作库已加载，共 ${actions.length} 个动作`
    console.log('✅ 动作库加载完成')
  } catch (error) {
    console.error('❌ 加载动作库失败:', error)
    armStatusText.value = `加载动作库失败: ${error.message}`
  } finally {
    isLoadingActions.value = false
  }
}

const handleExecuteAction = async (action) => {
  if (isExecutingArmAction.value) return

  isExecutingArmAction.value = true
  executingActionId.value = action.id
  armProgress.value = 0

  console.log('🦾 开始执行上肢动作:', action.name)

  // 启动进度条动画
  const progressInterval = setInterval(() => {
    if (armProgress.value < 90) {
      armProgress.value += 5
    }
  }, (action.duration * 1000) / 18)

  try {
    const result = await robotApi.executeAction(action)

    if (result.success) {
      console.log('✅ 机器人动作执行成功')
      armProgress.value = 100

      setTimeout(() => {
        clearInterval(progressInterval)
        isExecutingArmAction.value = false
        executingActionId.value = null
        armProgress.value = 0
        console.log('🦾 上肢动作执行完成:', action.name)
      }, 500)
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    console.error('❌ 上肢动作执行异常:', error)
    clearInterval(progressInterval)
    isExecutingArmAction.value = false
    executingActionId.value = null
    armProgress.value = 0
    alert(`动作执行失败: ${error.message}`)
  }
}

// 下肢控制相关
const legStatus = ref('online')
const legStatusText = ref('下肢系统就绪')
const isExecutingMovement = ref(false)
const currentMovement = ref('静止')
const currentDirection = ref('stop')
const position = reactive({ x: 0, y: 0 })

// 基础方法
const goBack = () => {
  router.push('/')
}

// 系统控制方法
const handleRefreshAllStatus = async () => {
  try {
    console.log('🔄 开始刷新所有系统状态...')

    // 更新状态文本
    voiceStatusText.value = '正在刷新语音库...'
    armStatusText.value = '正在刷新动作库...'
    cameraStatus.value = '正在刷新摄像头...'

    const result = await systemApi.refreshAllStatus()

    if (result.success) {
      // 更新数据
      voiceLibrary.value = result.data.voiceTexts
      actionLibrary.value = result.data.actionList
      cameraConnected.value = result.data.cameraStatus.connected

      // 更新状态文本
      voiceStatusText.value = `语音库已加载，共 ${result.data.voiceTexts.length} 条`
      armStatusText.value = `动作库已加载，共 ${result.data.actionList.length} 个动作`
      cameraStatus.value = result.data.cameraStatus.connected ? '摄像头已连接' : '摄像头未连接'

      console.log('✅ 所有系统状态刷新完成')
    }
  } catch (error) {
    console.error('❌ 刷新系统状态时出现错误:', error)
    alert(`刷新失败: ${error.message}`)
  }
}

const handleEmergencyStopAll = async () => {
  try {
    console.log('🚨 执行紧急停止所有系统')

    // 本地状态重置
    isSpeaking.value = false
    playingVoiceId.value = null
    isExecutingArmAction.value = false
    executingActionId.value = null
    isExecutingMovement.value = false
    currentMovement.value = '紧急停止'
    currentDirection.value = 'stop'

    // 调用系统API
    await systemApi.emergencyStopAll()

    alert('所有系统已紧急停止')
  } catch (error) {
    console.error('❌ 紧急停止失败:', error)
    alert(`紧急停止失败: ${error.message}`)
  }
}

const handleExportAllData = async () => {
  try {
    await systemApi.exportAllData()
    alert('数据导出成功')
  } catch (error) {
    console.error('❌ 导出数据失败:', error)
    alert(`导出失败: ${error.message}`)
  }
}

// 对话框相关方法
const handleShowAddDialog = () => {
  dialogMode.value = 'add'
  dialogData.id = null
  dialogData.title = ''
  dialogData.content = ''
  dialogData.category = 'greeting'
  dialogData.language = 'zh-CN'
  showDialog.value = true
}

const handleEditVoiceText = (voice) => {
  dialogMode.value = 'edit'
  dialogData.id = voice.id
  dialogData.title = voice.title
  dialogData.content = voice.content
  dialogData.category = voice.category
  dialogData.language = voice.language
  showDialog.value = true
}

const handleCloseDialog = () => {
  showDialog.value = false
}

const handleSaveVoiceData = async () => {
  try {
    await ttsApi.saveVoiceText(dialogData)
    console.log('✅ 语音文本保存成功')
    await fetchVoiceTexts()
    handleCloseDialog()
    alert(dialogMode.value === 'add' ? '语音文本添加成功' : '语音文本更新成功')
  } catch (error) {
    console.error('❌ 保存语音文本失败:', error)
    alert(`保存失败: ${error.message}`)
  }
}

// 移动控制相关方法
const handleExecuteMovement = async (direction) => {
  if (isExecutingMovement.value && direction !== 'stop') return

  isExecutingMovement.value = true
  currentDirection.value = direction
  currentMovement.value = utils.getMovementLabel(direction)

  console.log('🦵 开始执行移动动作:', direction)

  try {
    const result = await movementApi.executeMovement(direction)

    if (result.success) {
      console.log(`✅ ${result.actionName}指令发送成功`)
      currentMovement.value = `${utils.getMovementLabel(direction)}中...`

      // 根据不同动作类型设置不同的执行时间
      let executionTime = 2000
      if (direction === 'stop') {
        executionTime = 500
      } else if (direction === 'left' || direction === 'right') {
        executionTime = 1500
      }

      setTimeout(() => {
        isExecutingMovement.value = false
        currentDirection.value = 'stop'
        currentMovement.value = '静止'

        if (direction !== 'stop') {
          updatePosition(direction)
        }

        console.log(`🦵 ${result.actionName}动作执行完成`)
      }, executionTime)

    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    console.error('❌ 移动动作执行异常:', error)
    currentMovement.value = '执行异常'
    alert(`移动控制失败: ${error.message}`)

    setTimeout(() => {
      isExecutingMovement.value = false
      currentDirection.value = 'stop'
      currentMovement.value = '静止'
    }, 1500)
  }
}

const updatePosition = (direction) => {
  const step = 10
  switch (direction) {
    case 'forward':
      position.y += step
      break
    case 'backward':
      position.y -= step
      break
    case 'left-move':
      position.x -= step
      break
    case 'right-move':
      position.x += step
      break
  }
}

// 摄像头相关方法
const handleInitializeCamera = async () => {
  cameraLoading.value = true
  cameraStatus.value = '正在连接摄像头...'

  try {
    const result = await cameraApi.testCameraConnection()

    if (result.success && result.connected) {
      cameraConnected.value = true
      cameraStatus.value = '摄像头已连接'
      cameraStreamUrl.value = cameraApi.getCameraStreamUrl()
      console.log('✅ 摄像头连接成功')
    } else {
      cameraConnected.value = false
      cameraStatus.value = result.error || '摄像头连接失败'
      console.log('❌ 摄像头连接失败:', result.error)
    }
  } catch (error) {
    console.error('❌ 摄像头初始化异常:', error)
    cameraConnected.value = false
    cameraStatus.value = `连接异常: ${error.message}`
  } finally {
    cameraLoading.value = false
  }
}

const handleToggleCamera = async () => {
  if (cameraConnected.value) {
    // 断开摄像头
    cameraConnected.value = false
    cameraStatus.value = '摄像头已断开'
    cameraStreamUrl.value = ''
  } else {
    // 连接摄像头
    await handleInitializeCamera()
  }
}

const handleToggleFullscreen = () => {
  if (!cameraConnected.value) return

  const videoElement = cameraVideo.value || cameraImage.value
  if (!videoElement) return

  if (!isFullscreen.value) {
    if (videoElement.requestFullscreen) {
      videoElement.requestFullscreen()
    } else if (videoElement.webkitRequestFullscreen) {
      videoElement.webkitRequestFullscreen()
    } else if (videoElement.mozRequestFullScreen) {
      videoElement.mozRequestFullScreen()
    }
    isFullscreen.value = true
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen()
    }
    isFullscreen.value = false
  }
}

// 视频事件处理方法
const onVideoLoadStart = () => {
  console.log('📹 视频开始加载')
}

const onVideoLoaded = () => {
  console.log('📹 视频数据加载完成')
}

const onVideoPlay = () => {
  console.log('📹 视频开始播放')
}

const onVideoPause = () => {
  console.log('📹 视频暂停')
}

const onVideoEnded = () => {
  console.log('📹 视频播放结束')
}

const onVideoError = (event) => {
  console.error('📹 视频播放错误:', event)
  cameraStatus.value = '视频播放错误'
}

const onVideoCanPlay = () => {
  console.log('📹 视频可以播放')
}

const onVideoWaiting = () => {
  console.log('📹 视频缓冲中')
}

const onImageLoad = () => {
  console.log('📹 图片加载成功')
}

const onImageError = () => {
  console.error('📹 图片加载失败')
  cameraStatus.value = '图片加载失败'
}

// 工具方法
const getCategoryName = (category) => {
  return utils.getCategoryName(category)
}

const getActionCategoryName = (category) => {
  return utils.getActionCategoryName(category)
}

// 生命周期钩子
onMounted(async () => {
  console.log('🚀 综合管理页面已加载，开始初始化...')

  try {
    // 初始化摄像头
    console.log('📹 开始初始化摄像头...')
    cameraStreamUrl.value = cameraApi.getCameraStreamUrl()
    await handleInitializeCamera()

    // 获取语音库数据
    console.log('📚 开始获取语音库数据...')
    await fetchVoiceTexts()

    // 加载动作库
    console.log('🦾 开始加载动作库...')
    await handleLoadActionLibrary()

    console.log('✅ 所有系统初始化完成')

    // 延迟1秒后检查数据状态
    setTimeout(() => {
      console.log('🔍 初始化后数据检查:')
      console.log('- 语音库数量:', voiceLibrary.value.length)
      console.log('- 动作库数量:', actionLibrary.value.length)
      console.log('- 摄像头状态:', cameraConnected.value)
    }, 1000)

  } catch (error) {
    console.error('❌ 页面初始化过程中出现错误:', error)
  }
})

onUnmounted(() => {
  // 停止所有语音播放
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel()
  }

  console.log('综合管理页面已卸载')
})
</script>

<style scoped>
@import '../assets/management.css';
</style>
