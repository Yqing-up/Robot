#!/usr/bin/env node

/**
 * 机器人综合管理中心页面迁移脚本
 * 使用方法: node migrate-management-page.js <目标项目路径>
 */

const fs = require('fs');
const path = require('path');

// 源文件路径
const SOURCE_FILES = [
  {
    src: 'src/views/ManagementView.vue',
    dest: 'src/views/ManagementView.vue',
    required: true
  },
  {
    src: 'src/api/managementApi.js',
    dest: 'src/api/managementApi.js',
    required: true
  },
  {
    src: 'src/assets/management.css',
    dest: 'src/assets/management.css',
    required: true
  }
];

// 路由配置
const ROUTE_CONFIG = `    {
      path: '/management',
      name: 'management',
      component: () => import('../views/ManagementView.vue')
    }`;

// 必需的依赖
const REQUIRED_DEPENDENCIES = {
  "vue": "^3.0.0",
  "vue-router": "^4.0.0"
};

function main() {
  const targetPath = process.argv[2];
  
  if (!targetPath) {
    console.error('❌ 请提供目标项目路径');
    console.log('使用方法: node migrate-management-page.js <目标项目路径>');
    process.exit(1);
  }

  if (!fs.existsSync(targetPath)) {
    console.error(`❌ 目标路径不存在: ${targetPath}`);
    process.exit(1);
  }

  console.log('🚀 开始迁移机器人综合管理中心页面...');
  console.log(`📁 目标项目: ${targetPath}`);

  try {
    // 1. 检查目标项目结构
    checkProjectStructure(targetPath);
    
    // 2. 复制文件
    copyFiles(targetPath);
    
    // 3. 检查依赖
    checkDependencies(targetPath);
    
    // 4. 提供路由配置建议
    suggestRouteConfig(targetPath);
    
    // 5. 提供API端点检查建议
    suggestApiCheck();
    
    console.log('✅ 迁移完成！');
    console.log('\n📋 后续步骤:');
    console.log('1. 检查并安装缺失的依赖: npm install');
    console.log('2. 添加路由配置到 src/router/index.js');
    console.log('3. 确保后端API端点可用');
    console.log('4. 启动项目测试: npm run dev');
    
  } catch (error) {
    console.error('❌ 迁移失败:', error.message);
    process.exit(1);
  }
}

function checkProjectStructure(targetPath) {
  console.log('🔍 检查目标项目结构...');
  
  const requiredDirs = ['src', 'src/views', 'src/api', 'src/assets'];
  
  for (const dir of requiredDirs) {
    const dirPath = path.join(targetPath, dir);
    if (!fs.existsSync(dirPath)) {
      console.log(`📁 创建目录: ${dir}`);
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
  
  // 检查是否是Vue项目
  const packageJsonPath = path.join(targetPath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('目标路径不是有效的Node.js项目（缺少package.json）');
  }
}

function copyFiles(targetPath) {
  console.log('📄 复制文件...');
  
  for (const file of SOURCE_FILES) {
    const srcPath = path.resolve(file.src);
    const destPath = path.join(targetPath, file.dest);
    
    if (!fs.existsSync(srcPath)) {
      if (file.required) {
        throw new Error(`源文件不存在: ${srcPath}`);
      } else {
        console.log(`⚠️  跳过可选文件: ${file.src}`);
        continue;
      }
    }
    
    // 创建目标目录
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    // 复制文件
    fs.copyFileSync(srcPath, destPath);
    console.log(`✅ 复制: ${file.src} → ${file.dest}`);
  }
}

function checkDependencies(targetPath) {
  console.log('📦 检查依赖...');
  
  const packageJsonPath = path.join(targetPath, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  const missingDeps = [];
  
  for (const [dep, version] of Object.entries(REQUIRED_DEPENDENCIES)) {
    if (!dependencies[dep]) {
      missingDeps.push(`${dep}@${version}`);
    }
  }
  
  if (missingDeps.length > 0) {
    console.log('⚠️  缺少以下依赖:');
    missingDeps.forEach(dep => console.log(`   - ${dep}`));
    console.log('\n安装命令:');
    console.log(`npm install ${missingDeps.join(' ')}`);
  } else {
    console.log('✅ 所有必需依赖都已安装');
  }
}

function suggestRouteConfig(targetPath) {
  console.log('🛣️  路由配置建议...');
  
  const routerPath = path.join(targetPath, 'src/router/index.js');
  
  if (fs.existsSync(routerPath)) {
    console.log('📝 请在 src/router/index.js 的 routes 数组中添加:');
    console.log(ROUTE_CONFIG);
  } else {
    console.log('⚠️  未找到路由文件，请确保项目使用Vue Router');
  }
}

function suggestApiCheck() {
  console.log('🔌 API端点检查建议...');
  console.log('请确保后端支持以下API端点:');
  console.log('- /api/tts/synthesize (POST) - TTS语音合成');
  console.log('- /api/tts/text (GET/POST/DELETE) - 语音文本管理');
  console.log('- /api/robot/actions (GET) - 机器人动作列表');
  console.log('- /api/robot/execute (POST) - 执行机器人动作');
  console.log('- /api/robot_movement/* (POST) - 机器人移动控制');
  console.log('- /api/video/raw_video_feed (GET) - 摄像头视频流');
}

if (require.main === module) {
  main();
}

module.exports = { main, SOURCE_FILES, REQUIRED_DEPENDENCIES };
