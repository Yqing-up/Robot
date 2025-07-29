// src/api/index.js
import axios from 'axios';
import { API_CONFIG } from '../config/api.js';

// 创建 axios 实例
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    ...API_CONFIG.DEFAULT_HEADERS,
    // 添加绕过ngrok浏览器警告的请求头
    'ngrok-skip-browser-warning': 'true',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 添加请求前的调试信息
    console.log('API请求:', {
      method: config.method?.toUpperCase(),
      url: `${config.baseURL}${config.url}`,
      note: '通过Vite代理转发到后端服务器'
    });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API 请求错误:', error);
    return Promise.reject(error);
  }
);

// 通用 HTTP 方法
export const http = {
  get: (url, params = {}, config = {}) => api.get(url, { params, ...config }),
  post: (url, data = {}, config = {}) => api.post(url, data, config),
  put: (url, data = {}, config = {}) => api.put(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),
};

// 摄像头相关接口

/**
 * 检查摄像头状态
 * @returns {Promise<Object>} 返回摄像头状态信息
 * @example
 * ```javascript
 * const status = await checkCameraStatus();
 * console.log(status);
 * ```
 */
export function checkCameraStatus() {
  return http.get('/video/camera');
}

/**
 * 获取摄像头详细信息
 * @param {string} [fields=''] - 可选的字段掩码，用于指定返回的字段
 * @returns {Promise<Object>} 返回摄像头信息
 * @example
 * ```javascript
 * // 获取所有摄像头信息
 * const info = await getCameraInfo();
 * 
 * // 只获取特定字段
 * const basicInfo = await getCameraInfo('camera_type,resolution');
 * ```
 */
export function getCameraInfo(fields = '') {
  const config = {};
  if (fields) {
    config.headers = {
      'X-Fields': fields
    };
  }
  return http.get('/video/camera', {}, config);
}

/**
 * 获取原始摄像头视频流 URL
 * @returns {string} 返回 MJPEG 视频流 URL
 * @example
 * ```javascript
 * const videoUrl = getRawVideoFeed();
 * // 可以直接用于 video 标签的 src 属性
 * document.querySelector('video').src = videoUrl;
 * ```
 */
export function getRawVideoFeed() {
  return `${API_CONFIG.BASE_URL}/video/raw_video_feed`;
}

/**
 * 获取带骨骼检测的视频流 URL
 * @returns {string} 返回带骨骼检测的 MJPEG 视频流 URL
 * @example
 * ```javascript
 * const videoUrl = getSkeletonVideoFeed();
 * // 可以直接用于 video 标签的 src 属性，显示带骨骼检测的视频流
 * document.querySelector('video').src = videoUrl;
 * ```
 */
export function getSkeletonVideoFeed() {
  return `${API_CONFIG.BASE_URL}/video/video_feed`;
}

// 照片相关接口

/**
 * 获取已拍摄照片列表
 * @param {string} [fields=''] - 可选的字段掩码，用于指定返回的字段
 * @returns {Promise<Object>} 返回照片列表，包含 count 和 photos 数组
 * @example
 * ```javascript
 * // 获取所有照片信息
 * const result = await getPhotoList();
 * console.log(result.count); // 照片总数
 * console.log(result.photos); // 照片数组
 * 
 * // 只获取特定字段
 * const basicInfo = await getPhotoList('filename,size,date');
 * ```
 */
export function getPhotoList(fields = '') {
  const config = {};
  if (fields) {
    config.headers = {
      'X-Fields': fields
    };
  }
  return http.get('/photos/', {}, config);
}

/**
 * 下载拍摄的照片
 * @param {string} filename - 照片文件名
 * @returns {Promise<Object>} 返回照片下载信息
 * @example
 * ```javascript
 * const downloadInfo = await downloadPhoto('photo_2024-01-01.jpg');
 * ```
 */
export function downloadPhoto(filename) {
  return http.get(`/photos/${filename}`);
}

/**
 * 查看照片内容
 * @param {string} filename - 照片文件名
 * @returns {Promise<Object>} 返回照片内容信息
 * @example
 * ```javascript
 * const photoContent = await getPhotoContent('photo_2024-01-01.jpg');
 * ```
 */
export function getPhotoContent(filename) {
  return http.get(`/photos/${filename}/content`);
}

/**
 * 拍照并保存
 * @param {string} [fields=''] - 可选的字段掩码，用于指定返回的字段
 * @returns {Promise<Object>} 返回拍照结果，包含 success, message, filename, url, download_url
 * @example
 * ```javascript
 * const result = await takePhoto();
 * if (result.success) {
 *   console.log('拍照成功:', result.filename);
 * } else {
 *   console.log('拍照失败:', result.message);
 * }
 * ```
 */
export function takePhoto(fields = '') {
  const config = {};
  if (fields) {
    config.headers = {
      'X-Fields': fields
    };
  }
  
  console.log('takePhoto API调用:', {
    url: '/photos/photo',
    method: 'POST',
    baseURL: API_CONFIG.BASE_URL,
    fullURL: `${API_CONFIG.BASE_URL}/photos/photo`,
    config: config
  });
  
  return http.post('/photos/photo', {}, config);
}

/**
 * 删除照片
 * @param {string} filename - 照片文件名
 * @param {string} [fields=''] - 可选的字段掩码，用于指定返回的字段
 * @returns {Promise<Object>} 返回删除结果，包含 success, message, filename, url, download_url
 * @example
 * ```javascript
 * const result = await deletePhoto('photo_2024-01-01.jpg');
 * console.log(result.success); // 是否删除成功
 * console.log(result.message); // 删除消息
 * ```
 */
export function deletePhoto(filename, fields = '') {
  const config = {};
  if (fields) {
    config.headers = {
      'X-Fields': fields
    };
  }
  return http.delete(`/photos/${filename}`, config);
}

/**
 * 开始连续拍照
 * @param {number} interval - 拍照间隔（秒）
 * @param {string} [fields=''] - 可选的字段掩码，用于指定返回的字段
 * @returns {Promise<Object>} 返回连续拍照启动结果
 * @example
 * ```javascript
 * const result = await startContinuousPhoto(5);
 * if (result.success) {
 *   console.log('连续拍照已启动:', result.message);
 * } else {
 *   console.log('启动失败:', result.message);
 * }
 * ```
 */
export function startContinuousPhoto(interval = 5, fields = '') {
  const config = {};
  if (fields) {
    config.headers = {
      'X-Fields': fields
    };
  }
  
  console.log('startContinuousPhoto API调用:', {
    url: '/photos/continuous',
    method: 'POST',
    data: { interval },
    baseURL: API_CONFIG.BASE_URL,
    fullURL: `${API_CONFIG.BASE_URL}/photos/continuous`,
    config: config
  });
  
  return http.post('/photos/continuous', { interval }, config);
}

/**
 * 停止连续拍照
 * @param {string} [fields=''] - 可选的字段掩码，用于指定返回的字段
 * @returns {Promise<Object>} 返回连续拍照停止结果
 * @example
 * ```javascript
 * const result = await stopContinuousPhoto();
 * if (result.success) {
 *   console.log('连续拍照已停止:', result.message);
 * } else {
 *   console.log('停止失败:', result.message);
 * }
 * ```
 */
export function stopContinuousPhoto(fields = '') {
  const config = {};
  if (fields) {
    config.headers = {
      'X-Fields': fields
    };
  }
  
  console.log('stopContinuousPhoto API调用:', {
    url: '/photos/continuous',
    method: 'DELETE',
    baseURL: API_CONFIG.BASE_URL,
    fullURL: `${API_CONFIG.BASE_URL}/photos/continuous`,
    config: config
  });
  
  return http.delete('/photos/continuous', config);
}

// 机器人动作相关接口

/**
 * 获取所有可用的机器人动作列表
 * @returns {Promise<Object>} 返回动作列表，包含 success, message, data
 * @example
 * ```javascript
 * const result = await getRobotActions();
 * if (result.success) {
 *   console.log('动作列表:', result.data);
 * } else {
 *   console.log('获取失败:', result.message);
 * }
 * ```
 */
export function getRobotActions() {
  console.log('getRobotActions API调用:', {
    url: '/robot/actions',
    method: 'GET',
    baseURL: API_CONFIG.BASE_URL,
    fullURL: `${API_CONFIG.BASE_URL}/robot/actions`
  });
  
  return http.get('/robot/actions')
    .then(response => {
      console.log('获取动作列表成功:', response);
      return response;
    })
    .catch(error => {
      console.error('获取动作列表失败:', error);
      return {
        success: false,
        message: error.message || '获取动作列表失败',
        error_code: error.response?.status || 'NETWORK_ERROR',
        data: null
      };
    });
}

/**
 * 执行指定的机器人动作
 * @param {string} actionName - 动作名称
 * @param {Object} [params={}] - 执行参数
 * @returns {Promise<Object>} 返回执行结果
 * @example
 * ```javascript
 * const result = await executeRobotAction('wave_hello');
 * if (result.success) {
 *   console.log('动作执行成功:', result.message);
 * } else {
 *   console.log('执行失败:', result.message);
 * }
 * ```
 */
export function executeRobotAction(actionName, params = {}) {
  // 构建请求载荷，确保格式正确
  const payload = {
    action_name: actionName,
    duration: params.duration || 3.0,
    file_path: params.filePath || null,
    ...params
  };
  
  // 移除空值
  Object.keys(payload).forEach(key => {
    if (payload[key] === null || payload[key] === undefined) {
      delete payload[key];
    }
  });
  
  console.log('executeRobotAction API调用:', {
    url: '/robot/execute',
    method: 'POST',
    data: payload,
    baseURL: API_CONFIG.BASE_URL,
    fullURL: `${API_CONFIG.BASE_URL}/robot/execute`,
    headers: API_CONFIG.DEFAULT_HEADERS
  });
  
  return http.post('/robot/execute', payload)
    .then(response => {
      console.log('动作执行成功:', response);
      return {
        success: true,
        message: '动作执行成功',
        data: response
      };
    })
    .catch(error => {
      console.error('动作执行失败:', error);
      
      // 提供更详细的错误信息
      let errorMessage = '动作执行失败';
      let errorCode = 'EXECUTION_ERROR';
      
      if (error.response) {
        // 服务器返回了错误响应
        errorCode = error.response.status;
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 400) {
          errorMessage = '请求参数错误，请检查动作名称和参数';
        } else if (error.response.status === 404) {
          errorMessage = '动作不存在或服务器未找到';
        } else if (error.response.status === 500) {
          errorMessage = '服务器内部错误';
        } else {
          errorMessage = `服务器错误 (${error.response.status})`;
        }
      } else if (error.request) {
        // 请求已发出但没有收到响应
        errorMessage = '无法连接到服务器，请检查网络连接';
        errorCode = 'NETWORK_ERROR';
      } else {
        // 请求设置时出错
        errorMessage = error.message || '请求配置错误';
        errorCode = 'REQUEST_ERROR';
      }
      
      return {
        success: false,
        message: errorMessage,
        error_code: errorCode,
        data: null,
        details: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          responseData: error.response?.data
        }
      };
    });
}

// 导出 axios 实例供其他模块使用
export default api;

/**
 * 测试API连接
 * @returns {Promise<Object>} 返回连接测试结果
 */
export function testApiConnection() {
  console.log('测试API连接...');
  console.log('API配置:', API_CONFIG);
  
  return http.get('/photos/')
    .then(response => {
      console.log('API连接成功:', response);
      return { success: true, message: 'API连接正常', data: response };
    })
    .catch(error => {
      console.error('API连接失败:', error);
      return { 
        success: false, 
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      };
    });
} 