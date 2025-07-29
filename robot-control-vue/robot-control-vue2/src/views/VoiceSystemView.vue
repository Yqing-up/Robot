<template>
  <div class="container">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="nav-section">
        <button class="btn btn-back" @click="goBack">← 返回主页</button>
        <h1 class="title">语音系统控制中心</h1>
      </div>
      <div class="header-controls">
        <div class="header-buttons">
          <button class="btn btn-small" @click="stopAllVoice">停止播放</button>
          <button class="btn btn-small" @click="exportVoiceData">导出语音库</button>
        </div>
      </div>
    </header>

    <main class="voice-main">
      <!-- 使用左右布局容器 -->
      <div class="voice-layout-container">
        <!-- 左侧语音库管理区 -->
        <div class="voice-left-section">
          <!-- 语音库管理 -->
          <section class="voice-library-section">
            <div class="section-header">
              <h3>语音库管理</h3>
              <div class="library-stats">
                <span>共 {{ voiceLibrary.length }} 条语音</span>
                <button class="btn btn-small btn-primary" @click="showAddDialog">+ 添加语音</button>
              </div>
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
                <select v-model="selectedLanguage" class="filter-select">
                  <option value="">所有语言</option>
                  <option value="zh-CN">中文</option>
                  <option value="en-US">English</option>
                  <option value="ja-JP">日本語</option>
                </select>
              </div>
            </div>

            <!-- 语音列表 -->
            <div class="voice-list">
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
                      <span class="voice-duration">{{ voice.duration }}s</span>
                    </div>
                  </div>
                  <div class="voice-actions">
                    <button 
                      class="btn btn-mini btn-play" 
                      @click="playVoice(voice)"
                      :disabled="playingVoiceId === voice.id"
                    >
                      {{ playingVoiceId === voice.id ? '播放中' : '播放' }}
                    </button>
                    <button class="btn btn-mini btn-edit" @click="editVoice(voice)">编辑</button>
                    <button class="btn btn-mini btn-danger" @click="deleteVoice(voice.id)">删除</button>
                  </div>
                </div>
                <div class="voice-content">
                  {{ voice.content }}
                </div>
                <div class="voice-settings" v-if="voice.showSettings">
                  <div class="setting-item">
                    <label>音量:</label>
                    <input type="range" v-model="voice.volume" min="0" max="100" class="volume-slider">
                    <span>{{ voice.volume }}%</span>
                  </div>
                  <div class="setting-item">
                    <label>语速:</label>
                    <input type="range" v-model="voice.speed" min="0.5" max="2" step="0.1" class="speed-slider">
                    <span>{{ voice.speed }}x</span>
                  </div>
                  <div class="setting-item">
                    <label>音调:</label>
                    <input type="range" v-model="voice.pitch" min="0.5" max="2" step="0.1" class="pitch-slider">
                    <span>{{ voice.pitch }}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- 右侧控制面板区 -->
        <div class="voice-right-section">
          <!-- 播放控制面板 -->
          <section class="playback-section">
            <div class="section-header">
              <h3>播放控制</h3>
              <div class="playback-status" :class="playbackStatus">
                <div class="status-dot"></div>
                <span>{{ playbackStatusText }}</span>
              </div>
            </div>

            <div class="playback-controls">
              <!-- 当前播放信息 -->
              <div class="current-playing" v-if="currentVoice">
                <h4>正在播放</h4>
                <div class="playing-info">
                  <div class="playing-title">{{ currentVoice.title }}</div>
                  <div class="playing-content">{{ currentVoice.content }}</div>
                  <div class="playing-progress">
                    <div class="progress-bar">
                      <div class="progress-fill" :style="{ width: playProgress + '%' }"></div>
                    </div>
                    <div class="progress-time">
                      {{ formatTime(currentTime) }} / {{ formatTime(currentVoice.duration) }}
                    </div>
                  </div>
                </div>
                <div class="playback-buttons">
                  <button class="btn btn-secondary" @click="pauseVoice">暂停</button>
                  <button class="btn btn-danger" @click="stopVoice">停止</button>
                </div>
              </div>

              <!-- 快速播放按钮 -->
              <div class="quick-play">
                <h4>快速播放</h4>
                <div class="quick-buttons">
                  <button 
                    class="btn btn-quick" 
                    v-for="voice in quickPlayVoices" 
                    :key="voice.id"
                    @click="playVoice(voice)"
                  >
                    {{ voice.title }}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- 语音合成设置 -->
          <section class="synthesis-section">
            <div class="section-header">
              <h3>语音合成设置</h3>
            </div>

            <div class="synthesis-controls">
              <div class="setting-group">
                <label>默认语言:</label>
                <select v-model="defaultLanguage" class="setting-select">
                  <option value="zh-CN">中文</option>
                  <option value="en-US">English</option>
                  <option value="ja-JP">日本語</option>
                </select>
              </div>

              <div class="setting-group">
                <label>默认音量:</label>
                <input type="range" v-model="defaultVolume" min="0" max="100" class="setting-slider">
                <span>{{ defaultVolume }}%</span>
              </div>

              <div class="setting-group">
                <label>默认语速:</label>
                <input type="range" v-model="defaultSpeed" min="0.5" max="2" step="0.1" class="setting-slider">
                <span>{{ defaultSpeed }}x</span>
              </div>




            </div>
          </section>

          <!-- 播放历史 -->
          <section class="history-section">
            <div class="section-header">
              <h3>播放历史</h3>
              <button class="btn btn-small" @click="clearHistory">清空历史</button>
            </div>

            <div class="history-list">
              <div v-if="playHistory.length === 0" class="history-empty">
                <p>暂无播放历史</p>
              </div>
              <div v-else class="history-item" v-for="item in playHistory" :key="item.id">
                <div class="history-header">
                  <span class="history-title">{{ item.title }}</span>
                  <span class="history-time">{{ formatTimestamp(item.timestamp) }}</span>
                </div>
                <div class="history-content">{{ item.content }}</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>

    <!-- 添加/编辑语音对话框 -->
    <div class="modal" v-if="showDialog" @click="closeDialog">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editingVoice ? '编辑语音' : '添加语音' }}</h3>
          <button class="modal-close" @click="closeDialog">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>标题:</label>
            <input type="text" v-model="dialogForm.title" class="form-input">
          </div>
          <div class="form-group">
            <label>内容:</label>
            <textarea v-model="dialogForm.content" class="form-textarea"></textarea>
          </div>
          <div class="form-group">
            <label>分类:</label>
            <select v-model="dialogForm.category" class="form-select">
              <option value="greeting">问候语</option>
              <option value="response">回应语</option>
              <option value="notification">通知语</option>
              <option value="emotion">情感表达</option>
              <option value="system">系统提示</option>
            </select>
          </div>
          <div class="form-group">
            <label>语言:</label>
            <select v-model="dialogForm.language" class="form-select">
              <option value="zh-CN">中文</option>
              <option value="en-US">English</option>
              <option value="ja-JP">日本語</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeDialog">取消</button>
          <button class="btn btn-primary" @click="saveVoice">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 响应式数据
const searchText = ref('')
const selectedCategory = ref('')
const selectedLanguage = ref('')
const playingVoiceId = ref(null)
const playbackStatus = ref('idle')
const playbackStatusText = ref('系统就绪')
const currentVoice = ref(null)
const playProgress = ref(0)
const currentTime = ref(0)

// 语音合成设置
const defaultLanguage = ref('zh-CN')
const defaultVolume = ref(80)
const defaultSpeed = ref(1.0)


// 对话框相关
const showDialog = ref(false)
const editingVoice = ref(null)
const dialogForm = reactive({
  title: '',
  content: '',
  category: 'greeting',
  language: 'zh-CN'
})

// 语音库数据
const voiceLibrary = ref([
  {
    id: 1,
    title: '欢迎问候',
    content: '您好，欢迎使用机器人系统！',
    category: 'greeting',
    language: 'zh-CN',
    duration: 3.5,
    volume: 80,
    speed: 1.0,
    pitch: 1.0,
    showSettings: false
  },
  {
    id: 2,
    title: '任务完成',
    content: '任务已成功完成，请查看结果。',
    category: 'notification',
    language: 'zh-CN',
    duration: 2.8,
    volume: 85,
    speed: 1.0,
    pitch: 1.0,
    showSettings: false
  },
  {
    id: 3,
    title: '系统错误',
    content: '系统检测到错误，正在尝试修复。',
    category: 'system',
    language: 'zh-CN',
    duration: 3.2,
    volume: 90,
    speed: 0.9,
    pitch: 1.0,
    showSettings: false
  },
  {
    id: 4,
    title: '感谢回应',
    content: '谢谢您的配合，祝您生活愉快！',
    category: 'response',
    language: 'zh-CN',
    duration: 3.0,
    volume: 75,
    speed: 1.1,
    pitch: 1.1,
    showSettings: false
  },
  {
    id: 5,
    title: 'Hello Greeting',
    content: 'Hello! Welcome to the robot control system!',
    category: 'greeting',
    language: 'en-US',
    duration: 4.2,
    volume: 80,
    speed: 1.0,
    pitch: 1.0,
    showSettings: false
  }
])

// 播放历史
const playHistory = ref([
  { id: 1, title: '欢迎问候', content: '您好，欢迎使用机器人系统！', timestamp: Date.now() - 300000 },
  { id: 2, title: '任务完成', content: '任务已成功完成，请查看结果。', timestamp: Date.now() - 600000 }
])

// 快速播放语音
const quickPlayVoices = computed(() => {
  return voiceLibrary.value.filter(voice => 
    ['greeting', 'response', 'notification'].includes(voice.category)
  ).slice(0, 6)
})

// 过滤后的语音库
const filteredVoiceLibrary = computed(() => {
  return voiceLibrary.value.filter(voice => {
    const matchesSearch = !searchText.value || 
      voice.title.toLowerCase().includes(searchText.value.toLowerCase()) ||
      voice.content.toLowerCase().includes(searchText.value.toLowerCase())
    
    const matchesCategory = !selectedCategory.value || voice.category === selectedCategory.value
    const matchesLanguage = !selectedLanguage.value || voice.language === selectedLanguage.value
    
    return matchesSearch && matchesCategory && matchesLanguage
  })
})

// 方法
const goBack = () => {
  router.push('/')
}

const getCategoryName = (category) => {
  const categoryMap = {
    greeting: '问候语',
    response: '回应语',
    notification: '通知语',
    emotion: '情感表达',
    system: '系统提示'
  }
  return categoryMap[category] || category
}

const playVoice = (voice) => {
  if (playingVoiceId.value) {
    stopVoice()
  }
  
  playingVoiceId.value = voice.id
  currentVoice.value = voice
  playbackStatus.value = 'playing'
  playbackStatusText.value = '正在播放'
  
  // 添加到播放历史
  playHistory.value.unshift({
    id: Date.now(),
    title: voice.title,
    content: voice.content,
    timestamp: Date.now()
  })
  
  // 模拟播放进度
  const duration = voice.duration * 1000
  const interval = 100
  let elapsed = 0
  
  const progressInterval = setInterval(() => {
    elapsed += interval
    currentTime.value = elapsed / 1000
    playProgress.value = (elapsed / duration) * 100
    
    if (elapsed >= duration) {
      clearInterval(progressInterval)
      stopVoice()
    }
  }, interval)
  
  // 使用Web Speech API进行语音合成
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(voice.content)
    utterance.lang = voice.language
    utterance.volume = voice.volume / 100
    utterance.rate = voice.speed
    utterance.pitch = voice.pitch
    
    utterance.onend = () => {
      clearInterval(progressInterval)
      stopVoice()
    }
    
    speechSynthesis.speak(utterance)
  }
}

const pauseVoice = () => {
  if ('speechSynthesis' in window) {
    speechSynthesis.pause()
    playbackStatus.value = 'paused'
    playbackStatusText.value = '已暂停'
  }
}

const stopVoice = () => {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel()
  }
  
  playingVoiceId.value = null
  currentVoice.value = null
  playbackStatus.value = 'idle'
  playbackStatusText.value = '系统就绪'
  playProgress.value = 0
  currentTime.value = 0
}

const stopAllVoice = () => {
  stopVoice()
}





const showAddDialog = () => {
  editingVoice.value = null
  dialogForm.title = ''
  dialogForm.content = ''
  dialogForm.category = 'greeting'
  dialogForm.language = 'zh-CN'
  showDialog.value = true
}

const editVoice = (voice) => {
  editingVoice.value = voice
  dialogForm.title = voice.title
  dialogForm.content = voice.content
  dialogForm.category = voice.category
  dialogForm.language = voice.language
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
  editingVoice.value = null
}

const saveVoice = () => {
  if (!dialogForm.title.trim() || !dialogForm.content.trim()) {
    alert('请填写完整信息')
    return
  }
  
  if (editingVoice.value) {
    // 编辑现有语音
    const index = voiceLibrary.value.findIndex(v => v.id === editingVoice.value.id)
    if (index !== -1) {
      voiceLibrary.value[index] = {
        ...voiceLibrary.value[index],
        title: dialogForm.title,
        content: dialogForm.content,
        category: dialogForm.category,
        language: dialogForm.language,
        duration: dialogForm.content.length * 0.1
      }
    }
  } else {
    // 添加新语音
    const newVoice = {
      id: Date.now(),
      title: dialogForm.title,
      content: dialogForm.content,
      category: dialogForm.category,
      language: dialogForm.language,
      duration: dialogForm.content.length * 0.1,
      volume: defaultVolume.value,
      speed: defaultSpeed.value,
      pitch: 1.0,
      showSettings: false
    }
    voiceLibrary.value.unshift(newVoice)
  }
  
  closeDialog()
}

const deleteVoice = (voiceId) => {
  if (confirm('确定要删除这条语音吗？')) {
    const index = voiceLibrary.value.findIndex(v => v.id === voiceId)
    if (index !== -1) {
      voiceLibrary.value.splice(index, 1)
    }
  }
}

const clearHistory = () => {
  if (confirm('确定要清空播放历史吗？')) {
    playHistory.value = []
  }
}

const exportVoiceData = () => {
  const data = {
    voiceLibrary: voiceLibrary.value,
    playHistory: playHistory.value,
    settings: {
      defaultLanguage: defaultLanguage.value,
      defaultVolume: defaultVolume.value,
      defaultSpeed: defaultSpeed.value
    },
    timestamp: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `voice-system-data-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - timestamp
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`

  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 生命周期
onMounted(() => {
  console.log('语音系统组件已挂载')
})

onUnmounted(() => {
  console.log('语音系统组件已卸载')
  stopAllVoice()
})
</script>

<style scoped>
.voice-system {
  min-height: 100vh;
  overflow: visible;
  padding-top: 80px; /* 为固定header留出空间 */
}

.voice-content {
  overflow: visible;
  min-height: calc(100vh - 80px);
}
/* 组件特定样式将在CSS文件中添加 */
.title {
  color: #fff !important;
  background: none !important;
  -webkit-background-clip: unset !important;
  -webkit-text-fill-color: unset !important;
  background-clip: unset !important;
  text-shadow: 0 0 15px rgba(0, 153, 255, 0.2);
}
</style>
