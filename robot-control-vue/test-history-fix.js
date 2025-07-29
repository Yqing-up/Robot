// 测试播放历史修复
const API_BASE_URL = 'http://localhost:8000'

async function testHistoryAPI() {
  console.log('🧪 测试TTS历史记录API...')
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/tts/history`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, */*',
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('📚 API响应原始数据:', JSON.stringify(data, null, 2))
    
    // 模拟前端数据处理逻辑
    let records = []
    
    if (data.success && data.data && data.data.records && Array.isArray(data.data.records)) {
      records = data.data.records
      console.log('✅ 使用 data.data.records 格式，记录数:', records.length)
    } else if (data.success && data.data && Array.isArray(data.data)) {
      records = data.data
      console.log('✅ 使用 data.data 格式，记录数:', records.length)
    } else if (data && Array.isArray(data)) {
      records = data
      console.log('✅ 使用直接数组格式，记录数:', records.length)
    } else {
      console.log('❌ 无法识别的数据格式')
      return
    }

    // 处理记录数据
    const processedHistory = records.map(record => ({
      id: record.id || record.file_id || Date.now() + Math.random(),
      title: record.title || record.original_text?.substring(0, 20) + '...' || '语音合成',
      content: record.original_text || record.text || record.content || '',
      timestamp: record.created_at ? new Date(record.created_at).getTime() : (record.timestamp || Date.now()),
      voice: record.voice_name || record.voice || record.voice_id || '',
      duration: record.duration || 0,
      file_id: record.file_id || record.id,
      file_size: record.file_size || 0
    }))

    console.log('🔄 处理后的历史记录:')
    processedHistory.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.title}`)
      console.log(`     内容: ${item.content}`)
      console.log(`     发音: ${item.voice}`)
      console.log(`     时间: ${new Date(item.timestamp).toLocaleString()}`)
      console.log(`     文件ID: ${item.file_id}`)
      console.log('')
    })

    console.log(`✅ 成功处理 ${processedHistory.length} 条历史记录`)
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
  }
}

// 运行测试
testHistoryAPI()
