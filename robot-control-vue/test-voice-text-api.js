// 测试语音文本管理API功能
const API_BASE_URL = 'http://192.168.0.103:5001/api/tts';

async function testVoiceTextAPI() {
    console.log('🧪 测试语音文本管理API功能...');
    
    try {
        // 1. 测试获取语音文本列表
        console.log('\n📝 步骤1: 测试获取语音文本列表');
        const getResponse = await fetch(`${API_BASE_URL}/text`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json, */*',
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        console.log('📥 获取列表响应状态:', getResponse.status, getResponse.statusText);
        
        if (getResponse.ok) {
            const getResult = await getResponse.json();
            console.log('📥 获取列表响应数据:', JSON.stringify(getResult, null, 2));
            
            if (getResult.success && getResult.data) {
                console.log('✅ 获取语音文本列表成功，共', getResult.data.length, '条');
            } else {
                console.log('⚠️ 获取列表成功但数据为空或格式异常');
            }
        } else {
            const errorText = await getResponse.text();
            console.error('❌ 获取列表失败:', errorText);
        }
        
        // 2. 测试保存新语音文本
        console.log('\n📝 步骤2: 测试保存新语音文本');
        const newVoiceText = {
            title: '测试语音文本',
            content: '这是一个测试语音文本，用于验证API功能',
            category: 'test',
            language: 'zh-CN'
        };
        
        console.log('📤 发送保存请求:', newVoiceText);
        
        const saveResponse = await fetch(`${API_BASE_URL}/text`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json, */*',
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            body: JSON.stringify(newVoiceText)
        });
        
        console.log('📥 保存响应状态:', saveResponse.status, saveResponse.statusText);
        
        let savedTextId = null;
        if (saveResponse.ok) {
            const saveResult = await saveResponse.json();
            console.log('📥 保存响应数据:', JSON.stringify(saveResult, null, 2));
            
            if (saveResult.success && saveResult.data) {
                savedTextId = saveResult.data.id;
                console.log('✅ 保存语音文本成功，ID:', savedTextId);
            } else {
                console.error('❌ 保存失败:', saveResult.message);
            }
        } else {
            const errorText = await saveResponse.text();
            console.error('❌ 保存请求失败:', errorText);
        }
        
        // 3. 测试更新语音文本（如果保存成功）
        if (savedTextId) {
            console.log('\n📝 步骤3: 测试更新语音文本');
            const updateVoiceText = {
                id: savedTextId,
                title: '更新后的测试语音文本',
                content: '这是更新后的测试语音文本内容',
                category: 'test',
                language: 'zh-CN'
            };
            
            console.log('📤 发送更新请求:', updateVoiceText);
            
            const updateResponse = await fetch(`${API_BASE_URL}/text`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json, */*',
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                body: JSON.stringify(updateVoiceText)
            });
            
            console.log('📥 更新响应状态:', updateResponse.status, updateResponse.statusText);
            
            if (updateResponse.ok) {
                const updateResult = await updateResponse.json();
                console.log('📥 更新响应数据:', JSON.stringify(updateResult, null, 2));
                
                if (updateResult.success) {
                    console.log('✅ 更新语音文本成功');
                } else {
                    console.error('❌ 更新失败:', updateResult.message);
                }
            } else {
                const errorText = await updateResponse.text();
                console.error('❌ 更新请求失败:', errorText);
            }
        }
        
        // 4. 再次获取列表验证变化
        console.log('\n📝 步骤4: 再次获取列表验证变化');
        const getResponse2 = await fetch(`${API_BASE_URL}/text`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json, */*',
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        if (getResponse2.ok) {
            const getResult2 = await getResponse2.json();
            console.log('📥 更新后的列表:', JSON.stringify(getResult2, null, 2));
        }
        
        // 5. 测试删除语音文本（如果有ID）
        if (savedTextId) {
            console.log('\n📝 步骤5: 测试删除语音文本');
            console.log('🗑️ 删除语音文本ID:', savedTextId);
            
            const deleteResponse = await fetch(`${API_BASE_URL}/text/${savedTextId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json, */*',
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            console.log('📥 删除响应状态:', deleteResponse.status, deleteResponse.statusText);
            
            if (deleteResponse.ok) {
                const deleteResult = await deleteResponse.json();
                console.log('📥 删除响应数据:', JSON.stringify(deleteResult, null, 2));
                
                if (deleteResult.success) {
                    console.log('✅ 删除语音文本成功');
                } else {
                    console.error('❌ 删除失败:', deleteResult.message);
                }
            } else {
                const errorText = await deleteResponse.text();
                console.error('❌ 删除请求失败:', errorText);
            }
        }
        
        console.log('\n🎯 测试总结:');
        console.log('✅ 语音文本管理API测试完成');
        console.log('📋 请检查以上各步骤的结果，确认API功能是否正常');
        
    } catch (error) {
        console.error('❌ 测试过程中出现错误:', error);
    }
}

// 运行测试
testVoiceTextAPI().catch(console.error);
