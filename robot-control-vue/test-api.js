// 测试ASR API接口
const API_BASE_URL = 'http://192.168.0.103:5001/api/asr';

// 测试可用的API端点
async function testAvailableEndpoints() {
    console.log('🔍 测试可用的API端点...');

    const endpoints = [
        '/status',
        '/start',
        '/stop',
        '/recent',
        '/upload',
        '/transcribe',
        '/audio'
    ];

    for (const endpoint of endpoints) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`);
            console.log(`${endpoint}: ${response.status} ${response.statusText}`);

            if (response.status === 200) {
                try {
                    const data = await response.json();
                    console.log(`  响应: ${JSON.stringify(data).substring(0, 100)}...`);
                } catch (e) {
                    console.log(`  响应: 非JSON格式`);
                }
            }
        } catch (error) {
            console.log(`${endpoint}: 连接失败 - ${error.message}`);
        }
    }
}

async function testAPI() {
    console.log('🔍 开始测试ASR API接口...');
    
    try {
        // 1. 测试状态接口
        console.log('\n📊 测试状态接口...');
        const statusResponse = await fetch(`${API_BASE_URL}/status`);
        const statusData = await statusResponse.json();
        console.log('状态响应:', JSON.stringify(statusData, null, 2));
        
        // 2. 测试历史记录接口
        console.log('\n📚 测试历史记录接口...');
        const recentResponse = await fetch(`${API_BASE_URL}/recent?minutes=60`);
        const recentData = await recentResponse.json();
        console.log('历史记录响应:', JSON.stringify(recentData, null, 2));
        
        // 3. 测试开始录音接口
        console.log('\n🎙️ 测试开始录音接口...');
        const startResponse = await fetch(`${API_BASE_URL}/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const startData = await startResponse.json();
        console.log('开始录音响应:', JSON.stringify(startData, null, 2));
        
        // 等待2秒
        console.log('\n⏳ 等待2秒...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 4. 再次检查状态
        console.log('\n📊 再次检查状态...');
        const statusResponse2 = await fetch(`${API_BASE_URL}/status`);
        const statusData2 = await statusResponse2.json();
        console.log('录音中状态响应:', JSON.stringify(statusData2, null, 2));
        
        // 5. 测试停止录音接口
        console.log('\n⏹️ 测试停止录音接口...');
        const stopResponse = await fetch(`${API_BASE_URL}/stop`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const stopData = await stopResponse.json();
        console.log('停止录音响应:', JSON.stringify(stopData, null, 2));
        
        // 6. 最终检查历史记录
        console.log('\n📚 最终检查历史记录...');
        const finalRecentResponse = await fetch(`${API_BASE_URL}/recent?minutes=1`);
        const finalRecentData = await finalRecentResponse.json();
        console.log('最终历史记录响应:', JSON.stringify(finalRecentData, null, 2));
        
    } catch (error) {
        console.error('❌ API测试失败:', error);
    }
}

// 测试实时转录功能
async function testRealTimeTranscription() {
    console.log('🎯 测试实时转录功能...');

    try {
        // 1. 开始录音
        console.log('\n🎙️ 开始录音...');
        const startResponse = await fetch(`${API_BASE_URL}/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const startData = await startResponse.json();
        console.log('开始录音响应:', JSON.stringify(startData, null, 2));

        // 2. 模拟高频获取转录文本（每500毫秒获取一次，持续10秒）
        console.log('\n📝 开始高频获取转录文本...');
        for (let i = 1; i <= 20; i++) {
            console.log(`\n--- 第 ${i} 次获取 (${i * 0.5}秒) ---`);

            const recentResponse = await fetch(`${API_BASE_URL}/recent?minutes=1`);
            const recentData = await recentResponse.json();

            if (recentData.success && recentData.data && recentData.data.results) {
                const results = recentData.data.results;
                console.log(`📊 获取到 ${results.length} 条记录`);

                if (results.length > 0) {
                    // 按时间排序获取最新记录
                    const sortedResults = results.sort((a, b) => {
                        const timeA = new Date(a.timestamp || a.time || 0).getTime();
                        const timeB = new Date(b.timestamp || b.time || 0).getTime();
                        return timeB - timeA;
                    });

                    const latestRecord = sortedResults[0];
                    const text = latestRecord.text || latestRecord.content || latestRecord.transcription || '';

                    console.log('🎯 最新转录文本:', text || '(空)');
                    console.log('⏰ 时间戳:', latestRecord.timestamp || latestRecord.time);
                    console.log('🎯 置信度:', latestRecord.confidence || 'N/A');
                } else {
                    console.log('⚪ 暂无转录结果');
                }
            } else {
                console.log('❌ 获取转录文本失败');
            }

            // 等待500毫秒
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // 3. 停止录音
        console.log('\n⏹️ 停止录音...');
        const stopResponse = await fetch(`${API_BASE_URL}/stop`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const stopData = await stopResponse.json();
        console.log('停止录音响应:', JSON.stringify(stopData, null, 2));

        // 4. 获取最终结果
        console.log('\n📚 获取最终转录结果...');
        await new Promise(resolve => setTimeout(resolve, 2000)); // 等待2秒

        const finalResponse = await fetch(`${API_BASE_URL}/recent?minutes=999999`);
        const finalData = await finalResponse.json();

        if (finalData.success && finalData.data && finalData.data.results) {
            console.log(`✅ 最终获取到 ${finalData.data.results.length} 条转录记录`);
            finalData.data.results.forEach((record, index) => {
                const text = record.text || record.content || record.transcription || '';
                console.log(`${index + 1}. [${record.timestamp || record.time}] ${text}`);
            });
        }

    } catch (error) {
        console.error('❌ 实时转录测试失败:', error);
    }
}

// 运行测试
async function runAllTests() {
    await testAvailableEndpoints();
    console.log('\n' + '='.repeat(50) + '\n');
    await testAPI();
    console.log('\n' + '='.repeat(50) + '\n');
    await testRealTimeTranscription();
}

runAllTests();
