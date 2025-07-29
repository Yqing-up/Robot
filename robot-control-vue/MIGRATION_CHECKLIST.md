# 机器人综合管理中心页面迁移检查清单

## 📋 迁移前准备

### ✅ 目标项目检查
- [ ] 确认目标项目是Vue 3项目
- [ ] 确认使用Vue Router 4
- [ ] 确认项目结构包含 `src/views`、`src/api`、`src/assets` 目录
- [ ] 备份目标项目（以防出现问题）

### ✅ 源文件准备
- [ ] `src/views/ManagementView.vue` - 主页面组件
- [ ] `src/api/managementApi.js` - API服务层
- [ ] `src/assets/management.css` - 样式文件

## 🚀 迁移步骤

### 1. 文件复制
```bash
# 使用迁移脚本（推荐）
node migrate-management-page.js /path/to/target/project

# 或手动复制
cp src/views/ManagementView.vue /target/src/views/
cp src/api/managementApi.js /target/src/api/
cp src/assets/management.css /target/src/assets/
```

### 2. 依赖检查
```bash
# 检查package.json中是否包含
npm list vue vue-router

# 如果缺少，安装依赖
npm install vue@^3.0.0 vue-router@^4.0.0
```

### 3. 路由配置
在目标项目的 `src/router/index.js` 中添加：
```javascript
{
  path: '/management',
  name: 'management',
  component: () => import('../views/ManagementView.vue')
}
```

### 4. API端点验证
确保后端支持以下端点：
- [ ] `POST /api/tts/synthesize` - TTS语音合成
- [ ] `GET /api/tts/text` - 获取语音文本列表
- [ ] `POST /api/tts/text` - 保存语音文本
- [ ] `DELETE /api/tts/text/:id` - 删除语音文本
- [ ] `GET /api/robot/actions` - 获取机器人动作列表
- [ ] `POST /api/robot/execute` - 执行机器人动作
- [ ] `POST /api/robot_movement/forward` - 前进
- [ ] `POST /api/robot_movement/backward` - 后退
- [ ] `POST /api/robot_movement/left` - 左移
- [ ] `POST /api/robot_movement/right` - 右移
- [ ] `POST /api/robot_movement/turn_left` - 左转
- [ ] `POST /api/robot_movement/turn_right` - 右转
- [ ] `POST /api/robot_movement/cancel` - 停止
- [ ] `GET /api/video/raw_video_feed` - 摄像头视频流

## 🔧 配置调整

### API基础URL配置
如果目标项目的API基础URL不同，需要修改 `managementApi.js`：
```javascript
const API_CONFIG = {
  BASE_URL: 'http://your-api-server:port', // 修改为实际API地址
  // ...
}
```

### 样式冲突处理
如果出现样式冲突：
1. 检查CSS类名冲突
2. 考虑使用CSS模块或scoped样式
3. 重命名冲突的样式类

### 代理配置（开发环境）
如果需要API代理，在 `vite.config.js` 中添加：
```javascript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://your-backend-server:port',
        changeOrigin: true
      }
    }
  }
})
```

## 🧪 测试验证

### 功能测试清单
- [ ] 页面能正常访问 (`/management`)
- [ ] 摄像头视频流显示正常
- [ ] 语音库加载和播放功能正常
- [ ] 动作库加载和执行功能正常
- [ ] 移动控制功能正常
- [ ] 添加/编辑语音文本功能正常
- [ ] 系统状态刷新功能正常
- [ ] 紧急停止功能正常
- [ ] 数据导出功能正常

### 错误排查
常见问题及解决方案：

1. **页面空白或组件未加载**
   - 检查路由配置是否正确
   - 检查组件文件路径是否正确

2. **API请求失败**
   - 检查API端点是否可访问
   - 检查CORS配置
   - 检查API基础URL配置

3. **样式显示异常**
   - 检查CSS文件是否正确导入
   - 检查样式类名冲突

4. **摄像头无法显示**
   - 检查视频流API是否可访问
   - 检查浏览器权限设置

## 📝 迁移完成后

### 文档更新
- [ ] 更新项目README
- [ ] 更新API文档
- [ ] 更新部署文档

### 代码审查
- [ ] 检查代码风格一致性
- [ ] 检查错误处理完整性
- [ ] 检查性能优化机会

### 部署准备
- [ ] 构建测试 (`npm run build`)
- [ ] 生产环境测试
- [ ] 备份和回滚方案

## 🆘 支持

如果遇到问题，请检查：
1. 控制台错误信息
2. 网络请求状态
3. API响应内容
4. Vue开发者工具

需要帮助时，请提供：
- 错误信息截图
- 控制台日志
- 网络请求详情
- 项目配置信息
