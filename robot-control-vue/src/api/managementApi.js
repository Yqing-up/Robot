/**
 * 机器人综合管理中心 - API接口服务
 * 负责所有与后端API的交互
 */

// API配置 - 基于现有系统的实际端点
const API_CONFIG = {
  // 基础URL配置
  BASE_URL: '',

  // 超时配置
  TIMEOUT: 15000,

  // 重试配置
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,

  // 端点配置 - 基于现有系统的实际API端点
  ENDPOINTS: {
    // TTS语音相关
    TTS: {
      SYNTHESIZE: '/api/tts/synthesize',
      VOICES: '/api/tts/voices',
      TEXT: '/api/tts/text',
      DELETE_TEXT: (textId) => `/api/tts/text/${textId}`,
      HISTORY: '/api/tts/history',
      GET_FILE: (fileId) => `/api/tts/file/${fileId}`,
      DELETE_FILE: (fileId) => `/api/tts/file/${fileId}`
    },

    // 机器人动作相关
    ROBOT: {
      ACTIONS: '/api/robot/actions',
      EXECUTE: '/api/robot/execute'
    },

    // 机器人移动相关
    MOVEMENT: {
      FORWARD: '/api/robot_movement/forward',
      BACKWARD: '/api/robot_movement/backward',
      LEFT: '/api/robot_movement/left',
      RIGHT: '/api/robot_movement/right',
      TURN_LEFT: '/api/robot_movement/turn_left',
      TURN_RIGHT: '/api/robot_movement/turn_right',
      CANCEL: '/api/robot_movement/cancel'
    },

    // 摄像头相关
    CAMERA: {
      STREAM: '/api/video/raw_video_feed',
      STATUS: '/api/video/status'
    },

    // 系统状态
    SYSTEM: {
      STATUS: '/api/system/status',
      EMERGENCY_STOP: '/api/system/emergency-stop',
      REFRESH: '/api/system/refresh',
      EXPORT: '/api/system/export'
    }
  }
}

/**
 * HTTP请求工具类 - 增强版，支持现有系统的请求格式
 */
class ApiClient {
  constructor(config = {}) {
    this.baseURL = config.baseURL || API_CONFIG.BASE_URL
    this.timeout = config.timeout || API_CONFIG.TIMEOUT
    this.retryAttempts = config.retryAttempts || API_CONFIG.RETRY_ATTEMPTS
    this.retryDelay = config.retryDelay || API_CONFIG.RETRY_DELAY
  }

  /**
   * 发送HTTP请求 - 兼容现有系统的请求格式
   */
  async request(url, options = {}) {
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`

    const defaultOptions = {
      method: 'GET',
      headers: {
        'Accept': 'application/json, */*',
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      ...options
    }

    let lastError = null

    // 重试机制
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        console.log(`🌐 API请求 (尝试 ${attempt}/${this.retryAttempts}):`, fullUrl)

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.timeout)

        const response = await fetch(fullUrl, {
          ...defaultOptions,
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`HTTP错误 ${response.status}:`, errorText)
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        console.log(`✅ API请求成功:`, data)
        return data

      } catch (error) {
        lastError = error
        console.warn(`⚠️ API请求失败 (尝试 ${attempt}/${this.retryAttempts}):`, error.message)

        if (attempt < this.retryAttempts) {
          await this.delay(this.retryDelay * attempt)
        }
      }
    }

    console.error(`❌ API请求最终失败:`, lastError)
    throw lastError
  }

  /**
   * GET请求
   */
  async get(url, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const fullUrl = queryString ? `${url}?${queryString}` : url
    return this.request(fullUrl, { method: 'GET' })
  }

  /**
   * POST请求
   */
  async post(url, data = {}) {
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  /**
   * PUT请求
   */
  async put(url, data = {}) {
    return this.request(url, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  /**
   * DELETE请求
   */
  async delete(url) {
    return this.request(url, { method: 'DELETE' })
  }

  /**
   * 延迟工具函数
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// 创建API客户端实例
const apiClient = new ApiClient()

/**
 * TTS语音相关API - 基于现有系统的实际接口
 */
export const ttsApi = {
  /**
   * 获取语音文本列表
   */
  async getVoiceTexts() {
    try {
      console.log('📚 正在从API获取语音文本列表...')
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.TTS.TEXT)

      let texts = []

      // 处理不同的响应格式
      if (response.success && response.data && Array.isArray(response.data)) {
        texts = response.data
      } else if (Array.isArray(response)) {
        texts = response
      } else if (response.texts && Array.isArray(response.texts)) {
        texts = response.texts
      } else if (response.data && response.data.texts && Array.isArray(response.data.texts)) {
        texts = response.data.texts
      }

      // 确保每个语音文本都有必要的字段
      return texts.map((text, index) => ({
        id: text.id || text._id || index + 1,
        file_id: text.file_id || text.fileId || text.id || text._id,
        title: text.title || text.name || `语音${index + 1}`,
        content: text.content || text.text || text.message || '',
        category: text.category || text.type || 'custom',
        language: text.language || text.lang || 'zh-CN',
        originalData: text
      }))
    } catch (error) {
      console.error('❌ 获取语音文本失败:', error)
      // 返回备用数据
      return [
        { id: 1, title: '问候语', content: '你好，欢迎使用机器人系统', category: 'greeting', language: 'zh-CN' },
        { id: 2, title: '感谢语', content: '谢谢您的使用', category: 'response', language: 'zh-CN' },
        { id: 3, title: '再见语', content: '再见，期待下次见面', category: 'greeting', language: 'zh-CN' }
      ]
    }
  },

  /**
   * 语音合成 - 让机器人说话
   */
  async synthesizeText(text, options = {}) {
    try {
      if (!text || !text.trim()) {
        throw new Error('文本内容不能为空')
      }

      console.log('🎵 开始语音合成:', text)

      const requestBody = {
        text: text.trim(),
        voice_id: options.voice_id || 'zh-CN',
        format: options.format || 'mp3',
        speed: options.speed || 1.0,
        pitch: options.pitch || 1.0,
        volume: options.volume || 1.0
      }

      const response = await apiClient.post(API_CONFIG.ENDPOINTS.TTS.SYNTHESIZE, requestBody)

      if (response.success) {
        console.log('✅ 语音合成成功，机器人将开始说话')
        return response
      } else {
        throw new Error(response.message || response.error || '语音合成失败')
      }
    } catch (error) {
      console.error('❌ 语音合成失败:', error)
      throw error
    }
  },

  /**
   * 保存语音文本
   */
  async saveVoiceText(voiceData) {
    try {
      const requestBody = {
        title: voiceData.title,
        content: voiceData.content,
        category: voiceData.category,
        language: voiceData.language
      }

      if (voiceData.id) {
        requestBody.id = voiceData.id
      }

      const response = await apiClient.post(API_CONFIG.ENDPOINTS.TTS.TEXT, requestBody)

      if (response.success) {
        console.log('✅ 语音文本保存成功')
        return response
      } else {
        throw new Error(response.message || '保存失败')
      }
    } catch (error) {
      console.error('❌ 保存语音文本失败:', error)
      throw error
    }
  },

  /**
   * 删除语音文本
   */
  async deleteVoiceText(textId) {
    try {
      console.log('🗑️ 删除语音文本，ID:', textId)
      const response = await apiClient.delete(API_CONFIG.ENDPOINTS.TTS.DELETE_TEXT(textId))

      if (response.success) {
        console.log('✅ 语音文本删除成功')
        return response
      } else {
        throw new Error(response.message || '删除失败')
      }
    } catch (error) {
      console.error('❌ 删除语音文本失败:', error)
      throw error
    }
  }
}

/**
 * 机器人动作相关API - 基于现有系统的实际接口
 */
export const robotApi = {
  /**
   * 获取动作库列表
   */
  async getActionList() {
    try {
      console.log('📚 正在从API加载动作库...')
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.ROBOT.ACTIONS)

      let actions = []

      // 处理不同的响应格式
      if (response.success && response.data && Array.isArray(response.data)) {
        actions = response.data
      } else if (Array.isArray(response)) {
        actions = response
      } else if (response.actions && Array.isArray(response.actions)) {
        actions = response.actions
      } else if (response.data && response.data.actions && Array.isArray(response.data.actions)) {
        actions = response.data.actions
      }

      // 处理动作数据，确保格式统一
      return actions.map((action, index) => ({
        id: action.id || action.action_id || action._id || index + 1,
        name: action.name || action.action_name || action.title || '未知动作',
        description: action.description || action.desc || action.info || '无描述',
        category: action.category || action.type || action.group || 'basic',
        duration: action.duration || action.time || action.seconds || 3,
        originalData: action
      }))
    } catch (error) {
      console.error('❌ 加载动作库失败:', error)
      // 返回备用数据
      return [
        { id: 1, name: '挥手', description: '友好挥手动作', category: 'gesture', duration: 3 },
        { id: 2, name: '点赞', description: '竖起大拇指', category: 'gesture', duration: 2 },
        { id: 3, name: '握手', description: '伸出手握手', category: 'basic', duration: 4 },
        { id: 4, name: '抓取', description: '抓取物体动作', category: 'manipulation', duration: 5 },
        { id: 5, name: '停止', description: '举手停止手势', category: 'basic', duration: 2 },
        { id: 6, name: '鼓掌', description: '双手鼓掌动作', category: 'expression', duration: 3 }
      ]
    }
  },

  /**
   * 执行机器人动作
   */
  async executeAction(action) {
    try {
      console.log(`🤖 调用机器人动作执行API: ${action.name}`)

      const requestBody = {
        action_name: action.name,
        // 如果有原始数据，使用原始的action_name
        ...(action.originalData && { action_name: action.originalData.action_name || action.name }),
        duration: action.duration,
        category: action.category
      }

      const response = await apiClient.post(API_CONFIG.ENDPOINTS.ROBOT.EXECUTE, requestBody)

      if (response) {
        console.log(`✅ 动作执行API调用成功:`, response)
        return { success: true, data: response }
      } else {
        return { success: false, error: '执行失败' }
      }
    } catch (error) {
      console.error(`❌ 动作执行API调用异常:`, error)
      return { success: false, error: error.message }
    }
  }
}

/**
 * 机器人移动控制API - 基于现有系统的实际接口
 */
export const movementApi = {
  /**
   * 执行移动动作
   */
  async executeMovement(direction) {
    let endpoint = ''
    let actionName = ''

    // 根据方向选择对应的API端点
    switch (direction) {
      case 'forward':
        endpoint = API_CONFIG.ENDPOINTS.MOVEMENT.FORWARD
        actionName = '前进'
        break
      case 'backward':
        endpoint = API_CONFIG.ENDPOINTS.MOVEMENT.BACKWARD
        actionName = '后退'
        break
      case 'left-move':
        endpoint = API_CONFIG.ENDPOINTS.MOVEMENT.LEFT
        actionName = '左移'
        break
      case 'right-move':
        endpoint = API_CONFIG.ENDPOINTS.MOVEMENT.RIGHT
        actionName = '右移'
        break
      case 'left':
        endpoint = API_CONFIG.ENDPOINTS.MOVEMENT.TURN_LEFT
        actionName = '左转'
        break
      case 'right':
        endpoint = API_CONFIG.ENDPOINTS.MOVEMENT.TURN_RIGHT
        actionName = '右转'
        break
      case 'stop':
        endpoint = API_CONFIG.ENDPOINTS.MOVEMENT.CANCEL
        actionName = '停止'
        break
      default:
        console.warn('⚠️ 未知的移动方向:', direction)
        return { success: false, error: '未知方向' }
    }

    try {
      console.log(`🦵 调用${actionName}API:`, endpoint)
      const response = await apiClient.post(endpoint, {})

      if (response) {
        console.log(`✅ ${actionName}成功:`, response)
        return { success: true, data: response, actionName }
      } else {
        return { success: false, error: `${actionName}失败`, actionName }
      }
    } catch (error) {
      console.error(`❌ ${actionName}API调用异常:`, error)
      return { success: false, error: error.message, actionName }
    }
  }
}

/**
 * 摄像头相关API - 基于现有系统的实际接口
 */
export const cameraApi = {
  /**
   * 获取摄像头流URL
   */
  getCameraStreamUrl() {
    return API_CONFIG.ENDPOINTS.CAMERA.STREAM
  },

  /**
   * 测试摄像头连接
   */
  async testCameraConnection() {
    try {
      console.log('🔍 正在测试摄像头连接...')

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(API_CONFIG.ENDPOINTS.CAMERA.STREAM, {
        method: 'HEAD',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        console.log('✅ 摄像头连接测试成功')
        return { success: true, connected: true }
      } else {
        console.log('❌ 摄像头连接测试失败:', response.status)
        return { success: false, connected: false, error: `HTTP ${response.status}` }
      }
    } catch (error) {
      console.error('❌ 摄像头连接测试异常:', error)
      return { success: false, connected: false, error: error.message }
    }
  },

  /**
   * 获取摄像头状态
   */
  async getCameraStatus() {
    try {
      const testResult = await this.testCameraConnection()
      return {
        connected: testResult.connected,
        status: testResult.connected ? '摄像头已连接' : '摄像头未连接',
        error: testResult.error
      }
    } catch (error) {
      console.error('获取摄像头状态失败:', error)
      return { connected: false, status: '获取状态失败', error: error.message }
    }
  }
}

/**
 * 系统相关API - 综合管理功能
 */
export const systemApi = {
  /**
   * 获取系统状态
   */
  async getSystemStatus() {
    try {
      // 并行获取各个系统的状态
      const [voiceTexts, actionList, cameraStatus] = await Promise.allSettled([
        ttsApi.getVoiceTexts(),
        robotApi.getActionList(),
        cameraApi.getCameraStatus()
      ])

      return {
        voice: {
          status: voiceTexts.status === 'fulfilled' ? 'online' : 'offline',
          count: voiceTexts.status === 'fulfilled' ? voiceTexts.value.length : 0,
          error: voiceTexts.status === 'rejected' ? voiceTexts.reason.message : null
        },
        action: {
          status: actionList.status === 'fulfilled' ? 'online' : 'offline',
          count: actionList.status === 'fulfilled' ? actionList.value.length : 0,
          error: actionList.status === 'rejected' ? actionList.reason.message : null
        },
        camera: {
          status: cameraStatus.status === 'fulfilled' && cameraStatus.value.connected ? 'online' : 'offline',
          connected: cameraStatus.status === 'fulfilled' ? cameraStatus.value.connected : false,
          error: cameraStatus.status === 'rejected' ? cameraStatus.reason.message : cameraStatus.value?.error
        }
      }
    } catch (error) {
      console.error('获取系统状态失败:', error)
      return {
        voice: { status: 'unknown', error: error.message },
        action: { status: 'unknown', error: error.message },
        camera: { status: 'unknown', error: error.message }
      }
    }
  },

  /**
   * 紧急停止所有系统
   */
  async emergencyStopAll() {
    try {
      console.log('🚨 执行紧急停止所有系统')

      // 停止语音合成
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel()
      }

      // 发送停止移动指令
      await movementApi.executeMovement('stop')

      console.log('✅ 紧急停止执行完成')
      return { success: true, message: '所有系统已紧急停止' }
    } catch (error) {
      console.error('❌ 紧急停止失败:', error)
      throw error
    }
  },

  /**
   * 刷新所有系统状态
   */
  async refreshAllStatus() {
    try {
      console.log('🔄 开始刷新所有系统状态...')

      // 并行刷新所有系统数据
      const [voiceTexts, actionList, cameraStatus] = await Promise.allSettled([
        ttsApi.getVoiceTexts(),
        robotApi.getActionList(),
        cameraApi.testCameraConnection()
      ])

      console.log('✅ 所有系统状态刷新完成')

      return {
        success: true,
        data: {
          voiceTexts: voiceTexts.status === 'fulfilled' ? voiceTexts.value : [],
          actionList: actionList.status === 'fulfilled' ? actionList.value : [],
          cameraStatus: cameraStatus.status === 'fulfilled' ? cameraStatus.value : { connected: false }
        }
      }
    } catch (error) {
      console.error('❌ 刷新系统状态时出现错误:', error)
      throw error
    }
  },

  /**
   * 导出系统数据
   */
  async exportAllData() {
    try {
      console.log('📤 开始导出系统数据...')

      const systemStatus = await this.getSystemStatus()
      const voiceTexts = await ttsApi.getVoiceTexts()
      const actionList = await robotApi.getActionList()

      const exportData = {
        timestamp: new Date().toISOString(),
        systemStatus,
        voiceLibrary: voiceTexts,
        actionLibrary: actionList
      }

      // 创建下载链接
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)

      const link = document.createElement('a')
      link.href = url
      link.download = `robot-management-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      console.log('✅ 系统数据导出完成')
      return { success: true, message: '数据导出成功' }
    } catch (error) {
      console.error('❌ 导出数据失败:', error)
      throw error
    }
  }
}

// 导出API配置和工具函数
export { API_CONFIG }

/**
 * 工具函数 - 分类名称映射
 */
export const utils = {
  getCategoryName(category) {
    const categoryMap = {
      greeting: '问候语',
      response: '回应语',
      notification: '通知语',
      emotion: '情感表达',
      system: '系统提示',
      custom: '自定义'
    }
    return categoryMap[category] || category
  },

  getActionCategoryName(category) {
    const categoryMap = {
      basic: '基础动作',
      gesture: '手势动作',
      manipulation: '操作动作',
      expression: '表达动作'
    }
    return categoryMap[category] || category
  },

  getMovementLabel(direction) {
    const labels = {
      forward: '前进',
      backward: '后退',
      left: '左转',
      right: '右转',
      'left-move': '左移',
      'right-move': '右移',
      stop: '停止'
    }
    return labels[direction] || '未知动作'
  }
}
