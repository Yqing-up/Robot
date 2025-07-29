// API配置文件
export const API_CONFIG = {
  // API基础URL - 使用相对路径，通过Vite代理转发
  BASE_URL: '/api',
  
  // 超时时间（毫秒）
  TIMEOUT: 10000,
  
  // 默认请求头
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  }
}; 