// 测试状态查询接口调用频率
const API_BASE_URL = 'http://192.168.0.103:5001/api/asr';

let statusCallCount = 0;
let recentCallCount = 0;

// 监控API调用
const originalFetch = global.fetch;
global.fetch = async (url, options) => {
    if (url.includes('/status')) {
        statusCallCount++;
        console.log(`🔍 状态查询调用 #${statusCallCount}: ${url}`);
    } else if (url.includes('/recent')) {
        recentCallCount++;
        console.log(`📚 历史记录调用 #${recentCallCount}: ${url}`);
    }
    
    return originalFetch(url, options);
};

async function testStatusPolling() {
    console.log('🎯 测试状态查询调用频率...');
    console.log('📋 预期：状态查询只在初始化时调用一次');
    console.log('📋 预期：历史记录接口会频繁调用（每500ms一次）');
    
    // 重置计数器
    statusCallCount = 0;
    recentCallCount = 0;
    
    // 模拟页面初始化
    console.log('\n🔄 模拟页面初始化...');
    try {
        const statusResponse = await fetch(`${API_BASE_URL}/status`);
        const statusData = await statusResponse.json();
        console.log('✅ 初始化状态查询完成');
    } catch (error) {
        console.error('❌ 初始化状态查询失败:', error.message);
    }
    
    // 等待10秒，监控是否有额外的状态查询调用
    console.log('\n⏳ 等待10秒，监控API调用情况...');
    
    const startTime = Date.now();
    const monitorInterval = setInterval(() => {
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        console.log(`⏱️  ${elapsed}秒 - 状态查询: ${statusCallCount}次, 历史记录: ${recentCallCount}次`);
    }, 2000);
    
    // 模拟一些历史记录调用（模拟前端的高频调用）
    const recentInterval = setInterval(async () => {
        try {
            await fetch(`${API_BASE_URL}/recent?minutes=1`);
        } catch (error) {
            // 忽略错误，只关注调用频率
        }
    }, 500);
    
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    clearInterval(monitorInterval);
    clearInterval(recentInterval);
    
    console.log('\n📊 最终统计:');
    console.log(`🔍 状态查询总调用次数: ${statusCallCount}`);
    console.log(`📚 历史记录总调用次数: ${recentCallCount}`);
    
    if (statusCallCount === 1) {
        console.log('✅ 状态查询调用频率正确 - 只在初始化时调用一次');
    } else if (statusCallCount > 1) {
        console.log('❌ 状态查询调用过于频繁 - 应该只调用一次');
    } else {
        console.log('⚠️  状态查询未调用 - 可能有问题');
    }
    
    if (recentCallCount > 10) {
        console.log('✅ 历史记录调用频率正常 - 高频调用正在工作');
    } else {
        console.log('⚠️  历史记录调用频率较低 - 可能需要检查');
    }
}

// 运行测试
testStatusPolling().catch(console.error);
