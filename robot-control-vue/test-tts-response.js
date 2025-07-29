// 测试TTS API响应格式，诊断音频文件信息不完整的问题
const API_BASE_URL = 'http://192.168.0.103:5001/api/tts';

async function testTTSResponse() {
    console.log('🧪 测试TTS API响应格式...');
    
    try {
        // 1. 首先获取可用的语音列表
        console.log('\n📝 步骤1: 获取语音列表');
        const voicesResponse = await fetch(`${API_BASE_URL}/voices`);
        const voicesResult = await voicesResponse.json();
        console.log('🎵 语音列表响应:', voicesResult);
        
        if (!voicesResult.success || !voicesResult.data || voicesResult.data.length === 0) {
            console.error('❌ 无法获取语音列表');
            return;
        }
        
        const firstVoice = voicesResult.data[0];
        console.log('✅ 使用语音:', firstVoice.id, firstVoice.name);
        
        // 2. 测试语音合成
        console.log('\n📝 步骤2: 测试语音合成');
        const testText = '你好，这是一个测试';
        
        const synthesizeRequest = {
            text: testText,
            voice_id: firstVoice.id,
            format: 'mp3',
            speed: 1.0,
            pitch: 1.0,
            volume: 1.0
        };
        
        console.log('📤 发送合成请求:', synthesizeRequest);
        
        const synthesizeResponse = await fetch(`${API_BASE_URL}/synthesize`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json, */*',
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            body: JSON.stringify(synthesizeRequest)
        });
        
        console.log('📥 合成响应状态:', synthesizeResponse.status, synthesizeResponse.statusText);
        
        if (!synthesizeResponse.ok) {
            const errorText = await synthesizeResponse.text();
            console.error('❌ 合成请求失败:', errorText);
            return;
        }
        
        const synthesizeResult = await synthesizeResponse.json();
        console.log('📥 合成响应数据:', JSON.stringify(synthesizeResult, null, 2));
        
        // 3. 详细检查响应数据结构
        console.log('\n📝 步骤3: 检查响应数据结构');
        
        if (synthesizeResult.success) {
            console.log('✅ 合成成功标志: true');
            
            if (synthesizeResult.data) {
                console.log('✅ 数据对象存在');
                console.log('🔍 数据对象内容:');
                console.log('  - file_id:', synthesizeResult.data.file_id);
                console.log('  - audio_url:', synthesizeResult.data.audio_url);
                console.log('  - duration:', synthesizeResult.data.duration);
                console.log('  - file_size:', synthesizeResult.data.file_size);
                
                // 检查关键字段
                const issues = [];
                if (!synthesizeResult.data.file_id) {
                    issues.push('file_id 为空');
                }
                if (!synthesizeResult.data.audio_url) {
                    issues.push('audio_url 为空');
                }
                
                if (issues.length > 0) {
                    console.error('❌ 发现问题:', issues.join(', '));
                    console.error('🔧 这就是导致"音频文件信息不完整"错误的原因');
                } else {
                    console.log('✅ 所有必要字段都存在');
                    
                    // 4. 测试音频URL是否可访问
                    console.log('\n📝 步骤4: 测试音频URL可访问性');
                    try {
                        const audioResponse = await fetch(synthesizeResult.data.audio_url, { method: 'HEAD' });
                        console.log('🔊 音频URL状态:', audioResponse.status, audioResponse.statusText);
                        
                        if (audioResponse.ok) {
                            console.log('✅ 音频文件可以访问');
                            console.log('📊 音频文件大小:', audioResponse.headers.get('content-length'), '字节');
                            console.log('📊 音频文件类型:', audioResponse.headers.get('content-type'));
                        } else {
                            console.error('❌ 音频文件无法访问');
                        }
                    } catch (error) {
                        console.error('❌ 测试音频URL时出错:', error.message);
                    }
                }
            } else {
                console.error('❌ 响应中缺少 data 对象');
            }
        } else {
            console.error('❌ 合成失败:', synthesizeResult.message);
        }
        
        console.log('\n🎯 诊断总结:');
        console.log('如果看到"audio_url 为空"或"file_id 为空"，说明TTS服务配置有问题');
        console.log('如果音频URL无法访问，说明文件生成或路径配置有问题');
        console.log('请检查TTS服务的配置和文件存储路径');
        
    } catch (error) {
        console.error('❌ 测试过程中出现错误:', error);
    }
}

// 运行测试
testTTSResponse().catch(console.error);
