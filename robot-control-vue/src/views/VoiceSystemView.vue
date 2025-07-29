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
              <div class="voice-status-indicator online"></div>
            </div>
            <div class="library-stats">
              <span>共 {{ voiceLibrary.length }} 条语音</span>
              <button class="btn btn-small btn-primary" @click="showAddDialog">+ 添加语音</button>
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
              <div class="voice-status-indicator online"></div>
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

          <!-- 播放历史 -->
          <section class="history-section">
            <div class="section-header">
              <h3>播放历史</h3>
              <div class="voice-status-indicator online"></div>
            </div>

            <div class="history-list">
              <div v-if="playHistory.length === 0" class="history-empty">
                <p>暂无播放历史</p>
              </div>
              <div v-else class="history-item" v-for="item in playHistory" :key="item.id">
                <div class="history-content">{{ item.content }}</div>
                <div class="history-time">{{ formatTimestamp(item.timestamp) }}</div>
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

// TTS API配置
const TTS_BASE_URL = '/api/tts'
const API_ENDPOINTS = {
  tts: {
    synthesize: `${TTS_BASE_URL}/synthesize`,
    voices: `${TTS_BASE_URL}/voices`,
    getFile: (fileId) => `${TTS_BASE_URL}/file/${fileId}`,
    deleteFile: (fileId) => `${TTS_BASE_URL}/file/${fileId}`,
    history: `${TTS_BASE_URL}/history`,  // 历史记录接口
    text: `${TTS_BASE_URL}/text`,  // 语音文本管理接口
    deleteText: (textId) => `${TTS_BASE_URL}/text/${textId}`  // 删除语音文本接口
  }
}

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

// TTS相关状态
const availableVoices = ref([])
const selectedVoice = ref('')
const isSynthesizing = ref(false)
const currentPlayingAudio = ref(null)
const generatedAudioFiles = ref([])




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

// 播放历史 - 从API获取真实数据
const playHistory = ref([])

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

// ==================== TTS API函数 ====================

// 获取TTS历史记录
const fetchTTSHistory = async () => {
  try {
    console.log('📚 获取TTS历史记录...')

    const response = await fetch(API_ENDPOINTS.tts.history, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, */*',
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    if (!response.ok) {
      throw new Error(`获取TTS历史记录失败: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('📚 TTS历史记录响应:', data)

    // 检查多种可能的数据结构
    let records = []

    if (data.success && data.data && data.data.records && Array.isArray(data.data.records)) {
      // API返回格式: { success: true, data: { records: [...] } }
      records = data.data.records
      console.log('📚 使用 data.data.records 格式，记录数:', records.length)
    } else if (data.success && data.data && Array.isArray(data.data)) {
      // API返回格式: { success: true, data: [...] }
      records = data.data
      console.log('📚 使用 data.data 格式，记录数:', records.length)
    } else if (data && Array.isArray(data)) {
      // 直接返回数组格式: [...]
      records = data
      console.log('📚 使用直接数组格式，记录数:', records.length)
    } else {
      console.log('⚠️ TTS历史记录响应格式异常:', data)
      playHistory.value = []
      return []
    }

    // 处理记录数据
    playHistory.value = records.map(record => ({
      id: record.id || record.file_id || Date.now() + Math.random(),
      title: record.title || record.original_text?.substring(0, 20) + '...' || '语音合成',
      content: record.original_text || record.text || record.content || '',
      timestamp: record.created_at ? new Date(record.created_at).getTime() : (record.timestamp || Date.now()),
      voice: record.voice_name || record.voice || record.voice_id || '',
      duration: record.duration || 0,
      file_id: record.file_id || record.id,
      file_size: record.file_size || 0
    }))

    console.log(`✅ 成功获取到 ${playHistory.value.length} 条TTS历史记录`)
    console.log('📚 处理后的历史记录:', playHistory.value)
    return playHistory.value
  } catch (error) {
    console.error('❌ 获取TTS历史记录失败:', error)
    playbackStatusText.value = `获取历史记录失败: ${error.message}`
    playHistory.value = []
    return []
  }
}

// 获取可用发音列表
const fetchAvailableVoices = async () => {
  try {
    console.log('🎵 获取可用发音列表...')

    const response = await fetch(API_ENDPOINTS.tts.voices, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, */*',
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    if (!response.ok) {
      throw new Error(`获取发音列表失败: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('🎵 发音列表响应:', data)

    if (data.success && data.data && Array.isArray(data.data.voices)) {
      availableVoices.value = data.data.voices
      console.log(`✅ 获取到 ${data.data.voices.length} 个可用发音`)

      // 设置默认发音
      if (data.data.voices.length > 0 && !selectedVoice.value) {
        selectedVoice.value = data.data.voices[0].id || data.data.voices[0].name
        console.log('🎵 设置默认发音:', selectedVoice.value)
      }

      return data.data.voices
    } else {
      console.log('⚠️ 发音列表响应格式异常')
      return []
    }
  } catch (error) {
    console.error('❌ 获取发音列表失败:', error)
    playbackStatusText.value = `获取发音列表失败: ${error.message}`
    return []
  }
}

// ==================== 语音文本管理API ====================

// 获取全部语音文本
const fetchVoiceTexts = async () => {
  try {
    console.log('📚 获取语音文本列表...')

    const response = await fetch(API_ENDPOINTS.tts.text, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, */*',
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    if (!response.ok) {
      throw new Error(`获取语音文本失败: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('📚 语音文本响应:', data)

    if (data.success && data.data) {
      // 检查数据结构
      const textsArray = data.data.texts || data.data || []
      console.log('🔍 服务器返回的文本数组:', textsArray)

      if (Array.isArray(textsArray) && textsArray.length > 0) {
        // 将服务器数据转换为前端格式
        const serverTexts = textsArray.map(item => ({
          id: item.text_id || item.id,  // 优先使用 text_id
          title: item.title || `语音文本${item.text_id || item.id}`,
          content: item.content || item.text,
          category: item.category || 'custom',
          language: item.language || 'zh-CN',
          created_at: item.created_at,
          updated_at: item.updated_at,
          duration: ((item.content || item.text)?.length || 0) * 0.1,
          volume: 80,
          speed: 1.0,
          pitch: 1.0,
          showSettings: false
        }))

        voiceLibrary.value = serverTexts
        console.log('✅ 语音文本加载成功，共', serverTexts.length, '条')
        return serverTexts
      } else {
        console.log('ℹ️ 服务器返回空的语音文本列表')
        voiceLibrary.value = []
        return []
      }
    } else {
      console.warn('⚠️ 服务器返回空数据或格式错误:', data)
      return []
    }
  } catch (error) {
    console.error('❌ 获取语音文本失败:', error)
    // 不清空现有数据，保持用户体验
    return voiceLibrary.value
  }
}

// 保存语音文本（新增或编辑）
const saveVoiceText = async (voiceData) => {
  try {
    console.log('💾 保存语音文本:', voiceData)

    const requestBody = {
      title: voiceData.title,
      content: voiceData.content,  // 使用 content 字段而不是 text
      category: voiceData.category || 'custom',
      language: voiceData.language || 'zh-CN'
    }

    // 如果有ID，说明是编辑操作，需要包含ID
    if (voiceData.id) {
      requestBody.id = voiceData.id
    }

    const response = await fetch(API_ENDPOINTS.tts.text, {
      method: 'POST',
      headers: {
        'Accept': 'application/json, */*',
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`保存语音文本失败: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('💾 保存响应:', data)

    if (data.success) {
      console.log('✅ 语音文本保存成功')

      // 保存成功后刷新列表
      await fetchVoiceTexts()

      return {
        success: true,
        message: voiceData.id ? '语音文本更新成功' : '语音文本添加成功',
        data: {
          id: data.data.text_id || data.data.id,  // 处理不同的ID字段
          ...data.data
        }
      }
    } else {
      throw new Error(data.message || '保存失败')
    }
  } catch (error) {
    console.error('❌ 保存语音文本失败:', error)
    return {
      success: false,
      message: `保存失败: ${error.message}`
    }
  }
}

// 删除语音文本
const deleteVoiceText = async (textId) => {
  try {
    console.log('🗑️ 删除语音文本:', textId)

    const response = await fetch(API_ENDPOINTS.tts.deleteText(textId), {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json, */*',
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    if (!response.ok) {
      throw new Error(`删除语音文本失败: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('🗑️ 删除响应:', data)

    if (data.success) {
      console.log('✅ 语音文本删除成功')

      // 删除成功后刷新列表
      await fetchVoiceTexts()

      return {
        success: true,
        message: '语音文本删除成功'
      }
    } else {
      throw new Error(data.message || '删除失败')
    }
  } catch (error) {
    console.error('❌ 删除语音文本失败:', error)
    return {
      success: false,
      message: `删除失败: ${error.message}`
    }
  }
}

// ==================== 语音合成API ====================

// 文本转语音合成
const synthesizeText = async (text, voiceId = null) => {
  try {
    if (!text || !text.trim()) {
      throw new Error('请输入要合成的文本')
    }

    console.log('🎤 开始文本转语音合成...')
    console.log('📝 合成文本:', text)
    console.log('🎵 使用发音:', voiceId || selectedVoice.value)

    isSynthesizing.value = true
    playbackStatusText.value = '正在合成语音...'

    const requestBody = {
      text: text.trim(),
      voice_id: voiceId || selectedVoice.value,
      format: 'mp3',
      speed: 1.0,
      pitch: 1.0,
      volume: 1.0
    }

    const response = await fetch(API_ENDPOINTS.tts.synthesize, {
      method: 'POST',
      headers: {
        'Accept': 'application/json, */*',
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`语音合成失败: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('🎤 语音合成响应:', data)

    if (data.success && data.data) {
      console.log('🔍 检查服务器返回的音频数据:', {
        file_id: data.data.file_id,
        audio_url: data.data.audio_url,
        duration: data.data.duration,
        file_size: data.data.file_size
      })

      // 检查是否为机器人直接发声模式（没有返回音频文件）
      if (!data.data.audio_url) {
        console.log('🤖 检测到机器人直接发声模式，服务器未返回音频文件')
        console.log('✅ 机器人已发出声音，前端无需播放音频文件')

        // 创建一个虚拟的音频文件对象用于记录
        const virtualAudioFile = {
          id: data.data.file_id || `robot_voice_${Date.now()}`,
          text: text,
          voice: voiceId || selectedVoice.value,
          url: null, // 标记为机器人直接发声
          duration: data.data.duration || 0,
          created_at: new Date().toISOString(),
          size: data.data.file_size || 0,
          isRobotDirect: true // 标记为机器人直接发声
        }

        generatedAudioFiles.value.unshift(virtualAudioFile)
        console.log('✅ 机器人语音合成完成，已记录到历史')
        playbackStatusText.value = '机器人语音播放完成'

        return virtualAudioFile
      }

      if (!data.data.file_id) {
        console.error('❌ 服务器返回的文件ID为空:', data.data)
        throw new Error('服务器返回的文件ID为空')
      }

      const audioFile = {
        id: data.data.file_id,
        text: text,
        voice: voiceId || selectedVoice.value,
        url: data.data.audio_url,
        duration: data.data.duration,
        created_at: new Date().toISOString(),
        size: data.data.file_size
      }

      generatedAudioFiles.value.unshift(audioFile)
      console.log('✅ 语音合成成功，文件ID:', audioFile.id)
      console.log('✅ 音频URL:', audioFile.url)
      playbackStatusText.value = '语音合成完成'

      return audioFile
    } else {
      console.error('❌ 语音合成API返回失败:', data)
      throw new Error(data.message || '语音合成失败')
    }
  } catch (error) {
    console.error('❌ 语音合成失败:', error)
    playbackStatusText.value = `合成失败: ${error.message}`
    throw error
  } finally {
    isSynthesizing.value = false
  }
}

// 播放音频文件
const playAudioFile = (audioFile) => {
  try {
    console.log('🔊 尝试播放音频文件...')
    console.log('🔍 音频文件对象:', audioFile)

    // 详细验证音频文件信息
    if (!audioFile) {
      console.error('❌ 音频文件对象为空')
      throw new Error('音频文件对象为空，无法播放')
    }

    // 检查是否为机器人直接发声模式
    if (audioFile.isRobotDirect) {
      console.log('🤖 机器人直接发声模式，跳过前端音频播放')
      console.log('ℹ️ 进度条更新已在playVoice函数中处理')
      return
    }

    if (!audioFile.url) {
      console.error('❌ 音频文件URL为空:', audioFile)
      throw new Error('音频文件URL为空，可能是TTS服务配置问题')
    }

    if (!audioFile.id) {
      console.error('❌ 音频文件ID为空:', audioFile)
      throw new Error('音频文件ID为空')
    }

    console.log('✅ 音频文件验证通过')
    console.log('🔊 播放音频文件ID:', audioFile.id)
    console.log('🔊 音频URL:', audioFile.url)

    // 停止当前播放的音频
    if (currentPlayingAudio.value) {
      console.log('⏹️ 停止当前播放的音频')
      currentPlayingAudio.value.pause()
      currentPlayingAudio.value.currentTime = 0
      currentPlayingAudio.value = null
    }

    // 更新播放状态
    playbackStatusText.value = '准备播放音频...'

    // 创建新的音频元素
    const audio = new Audio()
    currentPlayingAudio.value = audio

    // 设置音频属性
    audio.preload = 'auto'
    audio.volume = 1.0

    // 音频事件监听
    audio.onloadstart = () => {
      console.log('🔊 开始加载音频...')
      playbackStatusText.value = '正在加载音频...'
    }

    audio.oncanplay = () => {
      console.log('🔊 音频可以播放')
      playbackStatusText.value = '音频已准备就绪'
    }

    audio.onplay = () => {
      console.log('🔊 开始播放音频')
      const displayText = audioFile.text.length > 30
        ? audioFile.text.substring(0, 30) + '...'
        : audioFile.text
      playbackStatusText.value = `正在播放: ${displayText}`
    }

    audio.ontimeupdate = () => {
      if (audio.duration && audio.currentTime) {
        const progress = (audio.currentTime / audio.duration * 100)
        playProgress.value = Math.round(progress)
        currentTime.value = audio.currentTime
      }
    }

    audio.onended = () => {
      console.log('🔊 音频播放完成')
      playbackStatusText.value = '播放完成'
      currentPlayingAudio.value = null
      playingVoiceId.value = null
      currentVoice.value = null
      playProgress.value = 0
      currentTime.value = 0

      // 播放完成后刷新历史记录
      setTimeout(async () => {
        await fetchTTSHistory()
      }, 1000) // 等待1秒确保服务器记录已保存
    }

    audio.onerror = (error) => {
      console.error('❌ 音频播放失败:', error)
      playbackStatusText.value = '音频播放失败'
      currentPlayingAudio.value = null
      playingVoiceId.value = null
      currentVoice.value = null
      playProgress.value = 0
      currentTime.value = 0
    }

    // 设置音频源并开始播放
    audio.src = audioFile.url

    // 开始播放
    audio.play().then(() => {
      console.log('✅ 音频播放开始成功')
    }).catch(error => {
      console.error('❌ 播放音频失败:', error)
      playbackStatusText.value = `播放失败: ${error.message}`
      currentPlayingAudio.value = null
    })

  } catch (error) {
    console.error('❌ 播放音频文件失败:', error)
    playbackStatusText.value = `播放失败: ${error.message}`
  }
}

const playVoice = async (voice) => {
  try {
    console.log('🎤 开始播放语音:', voice.title, voice.content)

    if (playingVoiceId.value) {
      stopVoice()
    }

    playingVoiceId.value = voice.id
    currentVoice.value = voice
    playbackStatus.value = 'playing'
    playbackStatusText.value = '正在合成语音...'

    // 立即启动进度条模拟（假设3秒播放时长）
    const estimatedDuration = 3
    const updateInterval = 100
    const totalSteps = (estimatedDuration * 1000) / updateInterval
    let currentStep = 0
    let progressTimer = null

    const startProgressBar = () => {
      progressTimer = setInterval(() => {
        currentStep++
        const progress = (currentStep / totalSteps) * 100
        const currentTimeSeconds = (currentStep * updateInterval) / 1000

        playProgress.value = Math.min(Math.round(progress), 100)
        currentTime.value = Math.min(currentTimeSeconds, estimatedDuration)

        // 播放完成
        if (currentStep >= totalSteps) {
          clearInterval(progressTimer)
          console.log('🎤 播放完成')
          playbackStatusText.value = '播放完成'
          playingVoiceId.value = null
          currentVoice.value = null
          playProgress.value = 0
          currentTime.value = 0

          // 刷新历史记录
          setTimeout(() => {
            fetchTTSHistory()
          }, 500)
        }
      }, updateInterval)
    }

    // 立即启动进度条
    console.log('🚀 立即启动进度条')
    startProgressBar()

    // 使用真正的TTS接口进行语音合成（异步进行，不阻塞进度条）
    synthesizeText(voice.content, selectedVoice.value).then(audioFile => {
      if (audioFile) {
        console.log('✅ 语音合成成功:', audioFile.id)
        playbackStatusText.value = '正在播放: 机器人语音'

        // 如果有实际的播放时长，可以在这里调整进度条（可选）
        if (audioFile.duration && audioFile.duration !== estimatedDuration) {
          console.log('🔧 调整进度条时长从', estimatedDuration, '到', audioFile.duration)
          // 这里可以添加进度条时长调整逻辑，但为了简单起见暂时保持原样
        }
      }
    }).catch(error => {
      console.error('❌ 语音合成失败:', error)
      if (progressTimer) {
        clearInterval(progressTimer)
      }
      playbackStatusText.value = `合成失败: ${error.message}`
      playingVoiceId.value = null
      currentVoice.value = null
      playProgress.value = 0
      currentTime.value = 0
    })

    // 函数立即返回，进度条已经开始运行

  } catch (error) {
    console.error('❌ 播放语音失败:', error)
    playbackStatusText.value = `播放失败: ${error.message}`

    // 清理播放状态
    playingVoiceId.value = null
    currentVoice.value = null
    playbackStatus.value = 'idle'
    playProgress.value = 0
    currentTime.value = 0
  }
}

const pauseVoice = () => {
  try {
    if (currentPlayingAudio.value && !currentPlayingAudio.value.paused) {
      console.log('⏸️ 暂停音频播放')
      currentPlayingAudio.value.pause()
      playbackStatus.value = 'paused'
      playbackStatusText.value = '已暂停'
    }
  } catch (error) {
    console.error('❌ 暂停播放失败:', error)
  }
}

const stopVoice = () => {
  try {
    console.log('⏹️ 停止音频播放')

    // 停止真正的音频播放
    if (currentPlayingAudio.value) {
      currentPlayingAudio.value.pause()
      currentPlayingAudio.value.currentTime = 0
      currentPlayingAudio.value = null
    }

    // 停止Web Speech API（如果有的话）
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
    }

    // 清理播放状态
    playingVoiceId.value = null
    currentVoice.value = null
    playbackStatus.value = 'idle'
    playbackStatusText.value = '系统就绪'
    playProgress.value = 0
    currentTime.value = 0

    console.log('✅ 播放已完全停止')
  } catch (error) {
    console.error('❌ 停止播放失败:', error)
  }
}

const stopAllVoice = () => {
  console.log('🛑 停止所有语音播放')
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

const saveVoice = async () => {
  if (!dialogForm.title.trim() || !dialogForm.content.trim()) {
    alert('请填写完整信息')
    return
  }

  try {
    // 显示保存状态
    const originalButtonText = '保存'
    // 这里可以添加按钮状态更新逻辑

    console.log('💾 准备保存语音文本...')

    // 准备保存数据
    const voiceData = {
      title: dialogForm.title.trim(),
      content: dialogForm.content.trim(),
      category: dialogForm.category,
      language: dialogForm.language
    }

    // 如果是编辑模式，添加ID
    if (editingVoice.value) {
      voiceData.id = editingVoice.value.id
      console.log('📝 编辑语音文本，ID:', voiceData.id)
    } else {
      console.log('➕ 添加新语音文本')
    }

    // 调用API保存
    const result = await saveVoiceText(voiceData)

    if (result.success) {
      console.log('✅ 语音文本保存成功')

      // 显示成功消息
      alert(result.message)

      // 关闭对话框
      closeDialog()

      // 刷新语音库列表（saveVoiceText函数内部已经调用了fetchVoiceTexts）
      console.log('🔄 语音库列表已自动刷新')
    } else {
      console.error('❌ 保存失败:', result.message)
      alert(result.message)
    }
  } catch (error) {
    console.error('❌ 保存语音文本时发生错误:', error)
    alert(`保存失败: ${error.message}`)
  }
}

const deleteVoice = async (voiceId) => {
  if (!confirm('确定要删除这条语音吗？')) {
    return
  }

  try {
    console.log('🗑️ 准备删除语音文本，ID:', voiceId)

    // 调用API删除
    const result = await deleteVoiceText(voiceId)

    if (result.success) {
      console.log('✅ 语音文本删除成功')

      // 显示成功消息
      alert(result.message)

      // 刷新语音库列表（deleteVoiceText函数内部已经调用了fetchVoiceTexts）
      console.log('🔄 语音库列表已自动刷新')
    } else {
      console.error('❌ 删除失败:', result.message)
      alert(result.message)
    }
  } catch (error) {
    console.error('❌ 删除语音文本时发生错误:', error)
    alert(`删除失败: ${error.message}`)
  }
}

const clearHistory = async () => {
  if (confirm('确定要清空播放历史吗？')) {
    try {
      // 这里可以添加清空服务器端历史记录的API调用
      // const response = await fetch(`${TTS_BASE_URL}/history`, { method: 'DELETE' })

      // 暂时只清空本地显示
      playHistory.value = []
      console.log('✅ 播放历史已清空')
    } catch (error) {
      console.error('❌ 清空历史记录失败:', error)
    }
  }
}

const exportVoiceData = () => {
  const data = {
    voiceLibrary: voiceLibrary.value,
    playHistory: playHistory.value,
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

// 初始化TTS功能
const initializeTTS = async () => {
  try {
    console.log('🎵 初始化TTS功能...')
    playbackStatusText.value = '正在初始化TTS...'

    // 获取可用发音列表
    const voices = await fetchAvailableVoices()

    if (voices && voices.length > 0) {
      console.log(`✅ TTS初始化完成，可用发音: ${voices.length} 个`)
      playbackStatusText.value = `TTS就绪，可用发音: ${voices.length} 个`
    } else {
      console.log('⚠️ 未获取到可用发音列表')
      playbackStatusText.value = 'TTS就绪，但未获取到发音列表'
    }

  } catch (error) {
    console.error('❌ TTS初始化失败:', error)
    playbackStatusText.value = `TTS初始化失败: ${error.message}`
  }
}

// 生命周期
onMounted(async () => {
  console.log('🚀 语音系统组件已挂载')

  try {
    // 初始化TTS功能
    await initializeTTS()

    // 获取语音文本列表
    console.log('📚 加载语音文本列表...')
    await fetchVoiceTexts()

    // 获取TTS历史记录
    await fetchTTSHistory()

    // 如果没有错误，设置系统就绪状态
    if (!playbackStatusText.value.includes('失败')) {
      playbackStatusText.value = '系统就绪'
    }

    console.log('✅ 语音系统初始化完成')
  } catch (error) {
    console.error('❌ 语音系统初始化失败:', error)
    playbackStatusText.value = `初始化失败: ${error.message}`
  }
})

onUnmounted(() => {
  console.log('语音系统组件已卸载')
  stopAllVoice()
})
</script>

<style scoped>
/* 播放历史样式 */

.history-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(25, 118, 210, 0.5);
  border-radius: 6px;
  padding: 8px 12px;
  margin-bottom: 6px;
  transition: all 0.3s ease;
}

.history-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(25, 118, 210, 0.8);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.2);
}

.history-item:last-child {
  margin-bottom: 0;
}

.history-content {
  color: #e0e0e0;
  line-height: 1.4;
  font-size: 15px;
  margin-bottom: 4px;
  word-wrap: break-word;
}

.history-time {
  font-size: 12px;
  color: #1976d2;
  opacity: 0.9;
  text-align: right;
  font-family: 'Courier New', monospace;
}

.history-list {
  max-height: 600px; /* 增加高度从400px到600px，可以显示更多记录 */
  overflow-y: auto;
  padding-right: 8px;
}

.history-list::-webkit-scrollbar {
  width: 6px;
}

.history-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.history-list::-webkit-scrollbar-thumb {
  background: rgba(25, 118, 210, 0.5);
  border-radius: 3px;
}

.history-list::-webkit-scrollbar-thumb:hover {
  background: rgba(25, 118, 210, 0.7);
}

.history-empty {
  text-align: center;
  padding: 40px 20px;
  color: #666;
  font-style: italic;
}
</style>
