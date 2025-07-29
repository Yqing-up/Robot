<template>
  <div class="container">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="nav-section">
        <button class="btn btn-back" @click="goBack">← 返回主页</button>
        <h1 class="title">听觉系统控制中心</h1>
      </div>
      <!-- 状态指示器已移除 -->
    </header>

    <main class="audio-main">
      <!-- 浏览器兼容性提示 -->
      <div v-if="!isRecognitionSupported" class="recognition-banner warning">
        <div class="banner-icon">⚠️</div>
        <div class="banner-text">
          <strong>语音识别不可用</strong>
          <p>您的浏览器不支持Web Speech API，请使用Chrome、Edge或Safari等现代浏览器。</p>
        </div>
      </div>
      




      <!-- 主控制区 -->
      <section class="audio-layout-container">
        <!-- 左侧控制面板区域 -->
        <div class="audio-left-section">
          <section class="control-section">
            <div class="main-controls horizontal-layout">
              <div class="record-control-container">
                <div class="record-control">
                  <button class="record-btn" :class="{ recording: isRecording }" @click="toggleRecording">
                    <div class="record-icon">
                      <div class="record-dot"></div>
                    </div>
                    <span class="record-text">{{ isRecording ? '停止录音' : '开始录音' }}</span>
                  </button>
                  <div class="record-timer">{{ formatTime(recordTime) }}</div>
                </div>
              </div>

              <div class="audio-level-container">
                <div class="audio-level">
                  <div class="level-label">音量</div>
                  <div class="level-meter">
                    <div class="level-bar" :style="{ width: audioLevel + '%' }"></div>
                  </div>
                  <div class="level-value">{{ audioLevel }}%</div>
                </div>
              </div>
            </div>
          </section>

          <!-- 可视化区域 -->
          <section class="visualization-section">
            <div class="viz-container">
              <div class="viz-panel waveform-panel">
                <h3>实时波形</h3>
                <div class="canvas-container">
                  <canvas ref="waveformCanvas" width="400" height="150"></canvas>
                </div>
              </div>
              <div class="viz-panel spectrum-panel">
                <h3>频谱分析</h3>
                <div class="canvas-container">
                  <canvas ref="spectrumCanvas" width="400" height="150"></canvas>
                </div>
              </div>
            </div>
          </section>
        </div>
        
        <!-- 右侧功能面板区 -->
        <div class="audio-right-section">
          <section class="panels-section">
            <div class="panel-grid">
              <!-- 语音转文字面板 -->
              <div class="function-panel speech-panel">
                <div class="panel-header">
                  <h3>语音转文字</h3>
                  <div class="panel-controls">
                    <select v-model="selectedLanguage">
                      <option value="zh-CN">中文</option>
                      <option value="en-US">English</option>
                      <option value="ja-JP">日本語</option>
                    </select>
                    <button class="btn btn-small" @click="clearText">清空</button>
                  </div>
                </div>
                <div class="speech-content">
                  <div class="text-output">
                    <div v-if="speechText" class="speech-text">{{ speechText }}</div>
                    <div v-else class="placeholder">开始录音后，语音将实时转换为文字显示在这里...</div>
                  </div>
                  <div class="text-actions">
                    <button class="btn btn-small" @click="copyText">复制文本</button>
                    <button class="btn btn-small" @click="saveText">保存文本</button>
                    <button class="btn btn-small" @click="editText">编辑文本</button>
                  </div>
                </div>
              </div>

              <!-- 历史记录面板 -->
              <div class="function-panel history-panel">
                <div class="panel-header">
                  <h3>历史记录</h3>
                  <div class="panel-controls">
                    <div class="tab-controls">
                      <button class="tab-btn" 
                              :class="{ active: activeTab === 'audio' }"
                              @click="setActiveTab('audio')">音频记录</button>
                      <button class="tab-btn" 
                              :class="{ active: activeTab === 'text' }"
                              @click="setActiveTab('text')">文本记录</button>
                    </div>
                    <button class="btn btn-small" @click="clearHistory">清空当前</button>
                  </div>
                </div>
                <div class="history-content">
                  <!-- 音频历史标签页 -->
                  <div v-show="activeTab === 'audio'" class="tab-content active">
                    <div class="history-list">
                      <div v-if="audioHistory.length === 0" class="placeholder">
                        <p>暂无录音记录</p>
                        <p class="hint-text">点击"开始录音"按钮来创建您的第一条录音</p>
                      </div>
                      <div v-else>
                        <div v-for="(record, index) in sortedAudioHistory" :key="record.timestamp + index" class="history-item">
                          <div class="history-header">
                            <span class="history-time">{{ formatDateTime(record.timestamp) }}</span>
                            <span class="history-duration">{{ formatTime(record.duration) }}</span>
                          </div>
                          <div class="history-actions">
                            <button class="btn btn-small" @click="playRecord(record)">
                              <span class="btn-icon">▶</span> 播放
                            </button>
                            <button class="btn btn-small" @click="downloadRecord(record)">
                              <span class="btn-icon">⬇</span> 下载
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 文本记录标签页 -->
                  <div v-show="activeTab === 'text'" class="tab-content active">
                    <div class="text-controls">
                      <div class="search-box">
                        <input type="text" v-model="searchText" placeholder="搜索文本内容...">
                        <button class="btn btn-small" @click="searchTextRecords">搜索</button>
                      </div>
                      <div class="display-mode-controls">
                        <label for="textDisplayMode">显示模式：</label>
                        <select v-model="textDisplayMode">
                          <option value="sentences">按句子显示</option>
                          <option value="grouped">按音频分组</option>
                        </select>
                      </div>
                      <div class="export-controls">
                        <select v-model="exportFormat">
                          <option value="txt">TXT格式</option>
                          <option value="json">JSON格式</option>
                          <option value="csv">CSV格式</option>
                        </select>
                        <button class="btn btn-small" @click="exportText">导出</button>
                      </div>
                    </div>
                    <div class="text-list">
                      <div v-if="textHistory.length === 0" class="placeholder">
                        <p>暂无文本记录</p>
                        <p class="hint-text">说话时，您的语音将被转换为文字并保存在这里</p>
                      </div>
                      <div v-else>
                        <div v-for="(record, index) in filteredTextHistory" :key="record.timestamp + index" class="text-item">
                          <div class="text-header">
                            <span class="text-time">{{ formatDateTime(record.timestamp) }}</span>
                            <span class="text-confidence" v-if="record.confidence">
                              准确率: {{ Math.round(record.confidence * 100) }}%
                            </span>
                          </div>
                          <div class="text-content">{{ record.text }}</div>
                          <div class="text-actions">
                            <button class="btn btn-small" @click="copyTextRecord(record)">复制</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>


            </div>
          </section>
        </div>
      </section>

      <!-- 底部信息区 -->
      <section class="info-section">
        <div class="info-stats">
          <div class="stat-item">
            <span class="stat-label">总录音时长</span>
            <span class="stat-value">{{ formatTime(totalRecordTime) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">音频记录数</span>
            <span class="stat-value">{{ audioHistory.length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">文本记录数</span>
            <span class="stat-value">{{ textHistory.length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">总字符数</span>
            <span class="stat-value">{{ totalCharacters }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">识别准确率</span>
            <span class="stat-value">{{ accuracy }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">存储空间</span>
            <span class="stat-value">{{ storageUsed }}MB</span>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

// Web Speech API 在JavaScript中可以直接使用

const router = useRouter()

// 响应式数据
const isRecording = ref(false)
const recordTime = ref(0)
const audioLevel = ref(0)
const systemStatus = ref('online')
const statusText = ref('系统就绪')
const selectedLanguage = ref('zh-CN')
const speechText = ref('')
const activeTab = ref('audio')
const searchText = ref('')
const textDisplayMode = ref('sentences')
const exportFormat = ref('txt')

const micPermissionGranted = ref(false)
const showMicPermissionDialog = ref(false)

// 音频处理相关变量
let audioContext = null
let audioStream = null
let audioSource = null
let audioAnalyser = null
let audioDataArray = null
let mediaRecorder = null
let audioChunks = []
// 语音识别相关变量
let recognition = null
// Canvas上下文变量
let waveformCtx = null
let spectrumCtx = null
const isRecognitionSupported = ref(true)

// 数据存储
const audioHistory = ref([])
const textHistory = ref([])
const totalRecordTime = ref(0)
const accuracy = ref(95)
const storageUsed = ref(0)

// Canvas引用
const waveformCanvas = ref()
const spectrumCanvas = ref()

// 计算属性
const totalCharacters = computed(() => {
  return textHistory.value.reduce((total, record) => total + record.text.length, 0)
})

const filteredTextHistory = computed(() => {
  if (!searchText.value) return sortedTextHistory.value
  return sortedTextHistory.value.filter(record => 
    record.text.toLowerCase().includes(searchText.value.toLowerCase())
  )
})

// 添加排序的计算属性
const sortedAudioHistory = computed(() => {
  // 对音频历史记录进行反序排列，最新的在前面
  return [...audioHistory.value].sort((a, b) => b.timestamp - a.timestamp)
})

const sortedTextHistory = computed(() => {
  // 对文本历史记录进行反序排列，最新的在前面
  return [...textHistory.value].sort((a, b) => b.timestamp - a.timestamp)
})

// 请求麦克风权限
const requestMicrophonePermission = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    micPermissionGranted.value = true
    audioStream = stream
    setupAudioContext(stream)
    initSpeechRecognition() // 初始化语音识别
    statusText.value = '系统就绪，麦克风已连接'
    return true
  } catch (error) {
    console.error('获取麦克风权限失败:', error)
    statusText.value = '麦克风访问被拒绝，请在浏览器设置中允许麦克风权限'
    micPermissionGranted.value = false
    return false
  }
}

// 设置音频上下文
const setupAudioContext = (stream) => {
  // 创建音频上下文
  audioContext = new (window.AudioContext || window.webkitAudioContext)()
  
  // 创建音频源和分析器
  audioSource = audioContext.createMediaStreamSource(stream)
  audioAnalyser = audioContext.createAnalyser()
  
  // 配置分析器
  audioAnalyser.fftSize = 2048
  const bufferLength = audioAnalyser.frequencyBinCount
  audioDataArray = new Uint8Array(bufferLength)
  
  // 连接音频节点
  audioSource.connect(audioAnalyser)
}

// 初始化语音识别
const initSpeechRecognition = () => {
  // 检查浏览器支持
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  
  if (!SpeechRecognition) {
    isRecognitionSupported.value = false
    console.error('此浏览器不支持语音识别')
    return
  }
  
  recognition = new SpeechRecognition()
  
  // 配置语音识别
  recognition.continuous = true       // 持续识别
  recognition.interimResults = true   // 返回临时结果
  recognition.maxAlternatives = 1     // 返回最可能的识别结果
  
  // 设置语言
  recognition.lang = selectedLanguage.value
  
  // 监听识别结果
  recognition.onresult = (event) => {
    let interimTranscript = ''
    let finalTranscript = ''
    
    console.log('收到语音识别结果:', event.results.length, '个结果')
    
    // 处理识别结果
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript
      console.log('转写结果:', i, transcript, '是否最终:', event.results[i].isFinal)
      
      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' '
        
        // 更新识别准确度
        accuracy.value = Math.round(event.results[i][0].confidence * 100)
        
        // 即时将最终识别结果添加到文本历史
        if (transcript.trim()) {
          const textRecord = {
            text: transcript.trim(),
            timestamp: Date.now(),
            language: selectedLanguage.value,
            confidence: event.results[i][0].confidence
          }
          
          // 将新识别的句子添加到历史记录
          textHistory.value.push(textRecord)
        }
      } else {
        interimTranscript += transcript
      }
    }
    
    // 更新文本显示
    if (finalTranscript) {
      console.log('添加最终识别文本:', finalTranscript)
      speechText.value += finalTranscript
    } else if (interimTranscript) {
      // 显示临时结果
      console.log('临时识别结果:', interimTranscript)
      // 创建一个临时显示元素
      const textOutput = document.querySelector('.text-output')
      if (textOutput) {
        const interimElement = document.createElement('div')
        interimElement.className = 'interim-text'
        interimElement.textContent = interimTranscript
        
        // 查找现有的临时元素
        const existingInterim = textOutput.querySelector('.interim-text')
        if (existingInterim) {
          existingInterim.textContent = interimTranscript
        } else {
          textOutput.appendChild(interimElement)
        }
      }
    }
  }
  
  recognition.onerror = (event) => {
    console.error('语音识别错误:', event.error)
    if (isRecording.value) {
      // 尝试重启识别
      setTimeout(() => {
        if (isRecording.value && recognition) {
          try {
            recognition.start()
          } catch (e) {
            console.log('重启识别失败', e)
          }
        }
      }, 1000)
    }
  }
  
  recognition.onend = () => {
    // 如果仍然在录音，则重启识别
    if (isRecording.value) {
      try {
        recognition.start()
      } catch (e) {
        console.log('重启识别失败', e)
      }
    }
  }
}

// 方法
const goBack = () => {
  router.push('/')
}

const toggleRecording = async () => {
  // 如果没有麦克风权限，先请求权限
  if (!micPermissionGranted.value) {
    const granted = await requestMicrophonePermission()
    if (!granted) return
  }

  isRecording.value = !isRecording.value
  if (isRecording.value) {
    startRecording()
  } else {
    stopRecording()
  }
}

const startRecording = () => {
  console.log('开始录音')
  recordTime.value = 0
  statusText.value = '正在录音...'
  speechText.value = ''
  audioChunks = []
  
  // 开始语音识别
  if (recognition && isRecognitionSupported.value) {
    // 更新语言设置
    recognition.lang = selectedLanguage.value
    
    try {
      console.log('启动语音识别...')
      recognition.start()
      console.log('语音识别已启动')
    } catch (e) {
      console.error('启动语音识别失败:', e)
    }
  } else {
    console.warn('语音识别不可用', { 
      isSupported: isRecognitionSupported.value, 
      hasRecognitionObj: !!recognition 
    })
    
    // 如果识别不可用，尝试重新初始化
    if (!recognition && isRecognitionSupported.value) {
      console.log('尝试重新初始化语音识别...')
      initSpeechRecognition()
      
      // 如果初始化成功，延迟启动识别
      if (recognition) {
        setTimeout(() => {
          try {
            recognition.start()
            console.log('延迟启动语音识别成功')
          } catch (e) {
            console.error('延迟启动语音识别失败:', e)
          }
        }, 500)
      }
    }
  }

  // 开始录音
  if (audioStream) {
    mediaRecorder = new MediaRecorder(audioStream)
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data)
      }
    }
    
    mediaRecorder.start()
    console.log('MediaRecorder已启动')
  } else {
    console.error('无法启动录音，audioStream不存在')
  }

  // 录音计时器
  const recordingTimer = setInterval(() => {
    recordTime.value++
    
    // 更新音频电平
    if (audioAnalyser && audioDataArray) {
      audioAnalyser.getByteTimeDomainData(audioDataArray)
      
      // 计算音频电平
      let sum = 0
      for (let i = 0; i < audioDataArray.length; i++) {
        const value = (audioDataArray[i] - 128) / 128
        sum += value * value
      }
      
      const rms = Math.sqrt(sum / audioDataArray.length)
      audioLevel.value = Math.min(100, Math.round(rms * 100 * 3)) // 乘以3来放大效果
    }
  }, 1000)

  // 存储计时器ID以便停止时清除
  window.recordingTimer = recordingTimer
}

const stopRecording = () => {
  console.log('停止录音')
  statusText.value = '系统就绪'
  
  // 停止语音识别
  if (recognition && isRecognitionSupported.value) {
    try {
      recognition.stop()
    } catch (e) {
      console.error('停止语音识别失败:', e)
    }
  }

  // 停止录音
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
    
    // 确保录音数据被处理
    mediaRecorder.onstop = async (event) => {
      try {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
        const audioUrl = URL.createObjectURL(audioBlob)
        
        console.log('录音已结束，blob大小:', audioBlob.size, '字节')
        
        // 计算录音大小（MB）
        const audioSize = audioBlob.size / (1024 * 1024)
        storageUsed.value += parseFloat(audioSize.toFixed(2))
        
        // 保存录音记录
        if (recordTime.value > 0) {
          const audioIndex = audioHistory.value.length
          const timestamp = Date.now()
          
          console.log('保存录音到历史记录, 时长:', recordTime.value, '秒')
          
          // 保存真实录音数据
          audioHistory.value.push({
            timestamp: timestamp,
            duration: recordTime.value,
            quality: 'medium',
            blob: audioBlob,
            url: audioUrl
          })
          
          // 保存识别到的文本
          if (speechText.value.trim()) {
            console.log('保存文本到历史记录:', speechText.value.trim())
            textHistory.value.push({
              text: speechText.value.trim(),
              timestamp: timestamp,
              language: selectedLanguage.value,
              audioIndex: audioIndex,
              confidence: accuracy.value / 100
            })
          }
          
          totalRecordTime.value += recordTime.value
          
          // 立即保存到本地存储
          saveToLocalStorage()
        }
        
        audioChunks = []
      } catch (error) {
        console.error('处理录音数据时出错:', error)
      }
    }
  }

  // 清除录音计时器
  if (window.recordingTimer) {
    clearInterval(window.recordingTimer)
    window.recordingTimer = null
  }

  audioLevel.value = 0
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const formatDateTime = (timestamp) => {
  return new Date(timestamp).toLocaleString()
}

const clearText = () => {
  speechText.value = ''
}

const copyText = () => {
  if (speechText.value) {
    navigator.clipboard.writeText(speechText.value)
    console.log('文本已复制')
  }
}

const saveText = () => {
  if (speechText.value) {
    textHistory.value.push({
      text: speechText.value,
      timestamp: Date.now(),
      language: selectedLanguage.value
    })
    console.log('文本已保存')
  }
}

const editText = () => {
  console.log('编辑文本')
}

const setActiveTab = (tab) => {
  activeTab.value = tab
}

const clearHistory = () => {
  if (activeTab.value === 'audio') {
    audioHistory.value = []
  } else {
    textHistory.value = []
  }
}

const playRecord = (record) => {
  if (record.url) {
    // 创建一个新的音频元素进行播放
    const audio = new Audio(record.url)
    audio.play()
    console.log('播放录音:', record)
  } else {
    console.log('无法播放录音，URL不存在')
  }
}

const searchTextRecords = () => {
  console.log('搜索文本:', searchText.value)
}

const exportText = () => {
  console.log('导出文本，格式:', exportFormat.value)
}

const viewTextDetail = (record) => {
  console.log('查看文本详情:', record)
  // 这里可以打开模态框显示详细信息
}

// 添加下载录音功能
const downloadRecord = (record) => {
  if (!record.blob || !record.url) {
    console.error('录音数据不存在')
    return
  }
  
  // 创建下载链接
  const downloadLink = document.createElement('a')
  downloadLink.href = record.url
  
  // 格式化时间作为文件名
  const date = new Date(record.timestamp)
  const fileName = `录音_${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2,'0')}${date.getDate().toString().padStart(2,'0')}_${date.getHours().toString().padStart(2,'0')}${date.getMinutes().toString().padStart(2,'0')}${date.getSeconds().toString().padStart(2,'0')}.webm`
  
  downloadLink.download = fileName
  document.body.appendChild(downloadLink)
  downloadLink.click()
  document.body.removeChild(downloadLink)
  
  console.log('下载录音:', fileName)
}



// 调整canvas尺寸以适应容器
const resizeCanvas = () => {
  if (waveformCanvas.value && spectrumCanvas.value) {
    const waveformContainer = waveformCanvas.value.parentElement
    const spectrumContainer = spectrumCanvas.value.parentElement

    if (waveformContainer && spectrumContainer) {
      const containerWidth = waveformContainer.clientWidth - 20 // 减去padding
      const containerHeight = 150

      // 设置canvas的实际尺寸
      waveformCanvas.value.width = containerWidth
      waveformCanvas.value.height = containerHeight
      spectrumCanvas.value.width = containerWidth
      spectrumCanvas.value.height = containerHeight

      // 设置canvas的显示尺寸
      waveformCanvas.value.style.width = containerWidth + 'px'
      waveformCanvas.value.style.height = containerHeight + 'px'
      spectrumCanvas.value.style.width = containerWidth + 'px'
      spectrumCanvas.value.style.height = containerHeight + 'px'
    }
  }
}

// 初始化音频可视化
const initializeAudioVisualization = () => {
  // 延迟执行以确保DOM已渲染
  setTimeout(() => {
    // 首先调整canvas尺寸
    resizeCanvas()

    // 启动可视化
    initVisualization()
  }, 100)
}

// 初始化可视化
const initVisualization = () => {
  console.log('初始化可视化...')
  waveformCtx = waveformCanvas.value && waveformCanvas.value.getContext('2d')
  spectrumCtx = spectrumCanvas.value && spectrumCanvas.value.getContext('2d')

  console.log('Canvas上下文:', { waveformCtx, spectrumCtx })

  if (waveformCtx && spectrumCtx) {
    console.log('开始动画循环...')
    // 绘制波形
    const drawWaveform = () => {
      if (!audioAnalyser || !audioDataArray || !waveformCanvas.value) return

      const canvas = waveformCanvas.value
      const width = canvas.width
      const height = canvas.height

      waveformCtx.clearRect(0, 0, width, height)
      waveformCtx.strokeStyle = '#00ffff'
      waveformCtx.lineWidth = 2
      waveformCtx.beginPath()

      // 获取实时音频数据
      audioAnalyser.getByteTimeDomainData(audioDataArray)

      const sliceWidth = width / audioDataArray.length
      let x = 0

      for (let i = 0; i < audioDataArray.length; i++) {
        const v = audioDataArray[i] / 128.0
        const y = v * (height / 2) + (height / 2) // 缩放到画布高度
        
        if (i === 0) {
          waveformCtx.moveTo(x, y)
        } else {
          waveformCtx.lineTo(x, y)
        }
        
        x += sliceWidth
      }
      
      waveformCtx.stroke()
    }

    // 绘制频谱
    const drawSpectrum = () => {
      if (!spectrumCanvas.value) return

      const canvas = spectrumCanvas.value
      const width = canvas.width
      const height = canvas.height

      // 清除画布
      spectrumCtx.clearRect(0, 0, width, height)

      if (!audioAnalyser) {
        // 如果没有音频分析器，显示静态频谱
        drawStaticSpectrum(width, height)
        return
      }

      // 获取频域数据
      const frequencyData = new Uint8Array(audioAnalyser.frequencyBinCount)
      audioAnalyser.getByteFrequencyData(frequencyData)

      spectrumCtx.fillStyle = '#00ffff'

      // 计算合适的条数和宽度
      const numBars = Math.min(64, frequencyData.length) // 限制条数
      const barWidth = (width / numBars) * 0.8 // 留一些间隙
      const barSpacing = (width / numBars) * 0.2

      for (let i = 0; i < numBars; i++) {
        const dataIndex = Math.floor((i / numBars) * frequencyData.length)
        const barHeight = (frequencyData[dataIndex] / 255) * height * 0.9 // 留一些顶部空间
        const x = i * (barWidth + barSpacing)

        spectrumCtx.fillRect(x, height - barHeight, barWidth, barHeight)
      }
    }

    // 绘制静态频谱（当没有音频输入时）
    const drawStaticSpectrum = (width, height) => {
      spectrumCtx.fillStyle = 'rgba(0, 255, 255, 0.3)'
      const numBars = 32
      const barWidth = (width / numBars) * 0.8
      const barSpacing = (width / numBars) * 0.2

      for (let i = 0; i < numBars; i++) {
        // 创建一些随机的静态高度
        const barHeight = Math.random() * height * 0.3 + 10
        const x = i * (barWidth + barSpacing)

        spectrumCtx.fillRect(x, height - barHeight, barWidth, barHeight)
      }
    }

    // 动画循环
    const animate = () => {
      // 始终绘制频谱，即使没有录音
      drawSpectrum()

      // 只有在录音时才绘制实时波形
      if (isRecording.value && audioAnalyser && audioDataArray) {
        drawWaveform()
      } else {
        // 没有录音时绘制静态波形
        drawStaticWaveform()
      }

      requestAnimationFrame(animate)
    }

    // 绘制静态波形（当没有音频输入时）
    const drawStaticWaveform = () => {
      if (!waveformCanvas.value) return

      const canvas = waveformCanvas.value
      const width = canvas.width
      const height = canvas.height

      waveformCtx.clearRect(0, 0, width, height)
      waveformCtx.strokeStyle = 'rgba(0, 255, 255, 0.3)'
      waveformCtx.lineWidth = 2
      waveformCtx.beginPath()

      // 绘制一条平直的线表示静默状态
      const centerY = height / 2
      waveformCtx.moveTo(0, centerY)
      waveformCtx.lineTo(width, centerY)
      waveformCtx.stroke()
    }

    animate()
  }
}

// 保存到本地存储
const saveToLocalStorage = () => {
  const data = {
    audioHistory: audioHistory.value,
    textHistory: textHistory.value,
    totalRecordTime: totalRecordTime.value,
    selectedLanguage: selectedLanguage.value
  }
  localStorage.setItem('audioSystemData', JSON.stringify(data))
}

// 从本地存储加载
const loadFromLocalStorage = () => {
  const savedData = localStorage.getItem('audioSystemData')
  if (savedData) {
    try {
      const data = JSON.parse(savedData)
      audioHistory.value = data.audioHistory || []
      textHistory.value = data.textHistory || []
      totalRecordTime.value = data.totalRecordTime || 0
      selectedLanguage.value = data.selectedLanguage || 'zh-CN'
    } catch (error) {
      console.error('加载数据失败:', error)
    }
  }
}

// 复制文本记录
const copyTextRecord = (record) => {
  if (record.text) {
    navigator.clipboard.writeText(record.text)
    console.log('文本已复制:', record.text)
    // 可以在这里添加一个提示，告诉用户复制成功
  }
}

// 窗口大小变化处理函数
const handleResize = () => {
  setTimeout(resizeCanvas, 100) // 延迟执行以确保DOM更新完成
}

onMounted(() => {
  console.log('听觉系统组件已挂载')
  loadFromLocalStorage()
  initializeAudioVisualization()

  // 确保canvas尺寸正确
  setTimeout(resizeCanvas, 100)

  // 添加窗口大小变化监听器
  window.addEventListener('resize', handleResize)

  // 模拟语音识别（每3秒触发一次）
  // const speechInterval = setInterval(() => {
  //   if (isRecording.value) {
  //     simulateSpeechRecognition()
  //   }
  // }, 3000)

  // 定期保存数据
  const saveInterval = setInterval(saveToLocalStorage, 30000)

  onUnmounted(() => {
    console.log('听觉系统组件已卸载')
    // clearInterval(speechInterval) // 移除模拟语音识别的定时器
    clearInterval(saveInterval)
    if (window.recordingTimer) {
      clearInterval(window.recordingTimer)
    }

    // 移除事件监听器
    window.removeEventListener('resize', handleResize)

    // 清理音频资源
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop())
    }
    if (audioSource) {
      audioSource.disconnect()
    }
    if (audioContext) {
      audioContext.close()
    }

    saveToLocalStorage() // 最后保存一次
  })
})
</script>

<style scoped>
.audio-system {
  min-height: 100vh;
  overflow: visible;
  padding-top: 80px; /* 为固定header留出空间 */
}

.audio-content {
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
