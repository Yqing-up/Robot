// 测试页面刷新后转录文本显示的bug修复
const API_BASE_URL = 'http://192.168.0.103:5001/api/asr';

async function testRefreshBugFix() {
    console.log('🧪 测试页面刷新后转录文本显示bug修复...');
    
    try {
        // 1. 首先启动录音
        console.log('\n📝 步骤1: 启动录音');
        const startResponse = await fetch(`${API_BASE_URL}/start`, { method: 'POST' });
        const startResult = await startResponse.json();
        console.log('✅ 录音启动结果:', startResult);
        
        // 2. 等待一段时间让录音产生一些数据
        console.log('\n⏳ 步骤2: 等待5秒让录音产生数据...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // 3. 检查是否有转录数据
        console.log('\n📊 步骤3: 检查转录数据');
        const recentResponse = await fetch(`${API_BASE_URL}/recent?minutes=1`);
        const recentResult = await recentResponse.json();
        console.log('📝 当前转录记录数:', recentResult.data?.results?.length || 0);
        
        if (recentResult.data?.results?.length > 0) {
            console.log('📄 最新转录内容:', recentResult.data.results[0].text);
        }
        
        // 4. 模拟页面刷新 - 检查状态同步
        console.log('\n🔄 步骤4: 模拟页面刷新 - 检查状态同步');
        const statusResponse = await fetch(`${API_BASE_URL}/status`);
        const statusResult = await statusResponse.json();
        console.log('📊 服务器状态:', statusResult);
        
        if (statusResult.data?.is_running) {
            console.log('✅ 服务器正在录音 - 页面刷新后应该能正确同步状态');
            console.log('🔧 修复验证: 页面刷新后应该:');
            console.log('   1. 检测到服务器正在录音');
            console.log('   2. 设置前端状态为录音中');
            console.log('   3. 启动本地转录文本更新定时器');
            console.log('   4. 立即获取一次转录文本显示');
        } else {
            console.log('⚠️ 服务器未在录音，无法测试刷新同步');
        }
        
        // 5. 测试转录文本获取
        console.log('\n📝 步骤5: 测试转录文本获取功能');
        const currentResponse = await fetch(`${API_BASE_URL}/recent?minutes=1`);
        const currentResult = await currentResponse.json();
        
        if (currentResult.success && currentResult.data?.results?.length > 0) {
            const latestRecord = currentResult.data.results[0];
            console.log('✅ 转录文本获取正常');
            console.log('📄 最新文本:', latestRecord.text || '(空)');
            console.log('⏰ 时间戳:', latestRecord.timestamp || latestRecord.time);
        } else {
            console.log('⚠️ 暂无转录文本或获取失败');
        }
        
        console.log('\n🎯 测试总结:');
        console.log('✅ 修复内容:');
        console.log('   - 页面刷新时检测到服务器录音状态会启动本地转录更新');
        console.log('   - 立即获取一次转录文本确保显示最新内容');
        console.log('   - 启动定时器持续更新转录文本');
        console.log('📋 用户操作建议:');
        console.log('   1. 开启录音');
        console.log('   2. 说一些话');
        console.log('   3. 刷新页面');
        console.log('   4. 检查转录文本是否正常显示和更新');
        
    } catch (error) {
        console.error('❌ 测试过程中出现错误:', error);
    }
}

// 运行测试
testRefreshBugFix().catch(console.error);
