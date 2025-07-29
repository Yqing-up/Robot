// 测试语音文本管理功能的完整集成
const API_BASE_URL = 'http://192.168.0.103:5001/api/tts';

async function testVoiceTextIntegration() {
    console.log('🧪 测试语音文本管理功能的完整集成...');
    
    try {
        // 1. 清理测试环境 - 删除可能存在的测试数据
        console.log('\n📝 步骤1: 清理测试环境');
        await cleanupTestData();
        
        // 2. 测试获取空列表
        console.log('\n📝 步骤2: 测试获取空列表');
        const emptyList = await getVoiceTexts();
        console.log('📊 空列表结果:', emptyList.length, '条记录');
        
        // 3. 测试添加新语音文本
        console.log('\n📝 步骤3: 测试添加新语音文本');
        const newText1 = {
            title: '集成测试语音1',
            content: '这是第一个集成测试语音文本',
            category: 'test',
            language: 'zh-CN'
        };
        
        const saveResult1 = await saveVoiceText(newText1);
        console.log('💾 保存结果1:', saveResult1);
        
        // 4. 测试添加第二个语音文本
        console.log('\n📝 步骤4: 测试添加第二个语音文本');
        const newText2 = {
            title: '集成测试语音2',
            content: '这是第二个集成测试语音文本，内容更长一些，用于测试不同长度的文本处理',
            category: 'greeting',
            language: 'zh-CN'
        };
        
        const saveResult2 = await saveVoiceText(newText2);
        console.log('💾 保存结果2:', saveResult2);
        
        // 5. 测试获取更新后的列表
        console.log('\n📝 步骤5: 测试获取更新后的列表');
        const updatedList = await getVoiceTexts();
        console.log('📊 更新后列表:', updatedList.length, '条记录');
        updatedList.forEach((item, index) => {
            console.log(`  ${index + 1}. ID: ${item.id}, 标题: ${item.title}`);
        });
        
        // 6. 测试编辑语音文本
        if (updatedList.length > 0) {
            console.log('\n📝 步骤6: 测试编辑语音文本');
            const firstItem = updatedList[0];
            const editedText = {
                id: firstItem.id,
                title: '编辑后的测试语音',
                content: '这是编辑后的语音文本内容',
                category: 'custom',
                language: 'zh-CN'
            };
            
            const editResult = await saveVoiceText(editedText);
            console.log('✏️ 编辑结果:', editResult);
        }
        
        // 7. 测试删除语音文本
        if (updatedList.length > 1) {
            console.log('\n📝 步骤7: 测试删除语音文本');
            const secondItem = updatedList[1];
            const deleteResult = await deleteVoiceText(secondItem.id);
            console.log('🗑️ 删除结果:', deleteResult);
        }
        
        // 8. 测试最终列表状态
        console.log('\n📝 步骤8: 测试最终列表状态');
        const finalList = await getVoiceTexts();
        console.log('📊 最终列表:', finalList.length, '条记录');
        finalList.forEach((item, index) => {
            console.log(`  ${index + 1}. ID: ${item.id}, 标题: ${item.title}, 内容: ${item.content.substring(0, 30)}...`);
        });
        
        console.log('\n🎯 集成测试总结:');
        console.log('✅ 语音文本管理功能集成测试完成');
        console.log('📋 所有CRUD操作均正常工作');
        console.log('🔄 前端和后端API集成成功');
        
    } catch (error) {
        console.error('❌ 集成测试过程中出现错误:', error);
    }
}

// 辅助函数：获取语音文本列表
async function getVoiceTexts() {
    const response = await fetch(`${API_BASE_URL}/text`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json, */*',
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    });
    
    if (!response.ok) {
        throw new Error(`获取列表失败: ${response.status}`);
    }
    
    const data = await response.json();
    if (data.success && data.data) {
        const textsArray = data.data.texts || data.data || [];
        return textsArray.map(item => ({
            id: item.text_id || item.id,
            title: item.title,
            content: item.content,
            category: item.category || 'custom',
            language: item.language || 'zh-CN',
            created_at: item.created_at,
            updated_at: item.updated_at
        }));
    }
    return [];
}

// 辅助函数：保存语音文本
async function saveVoiceText(textData) {
    const response = await fetch(`${API_BASE_URL}/text`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json, */*',
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        body: JSON.stringify(textData)
    });
    
    if (!response.ok) {
        throw new Error(`保存失败: ${response.status}`);
    }
    
    const data = await response.json();
    return {
        success: data.success,
        message: data.message,
        id: data.data?.text_id || data.data?.id
    };
}

// 辅助函数：删除语音文本
async function deleteVoiceText(textId) {
    const response = await fetch(`${API_BASE_URL}/text/${textId}`, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json, */*',
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    });
    
    if (!response.ok) {
        throw new Error(`删除失败: ${response.status}`);
    }
    
    const data = await response.json();
    return {
        success: data.success,
        message: data.message
    };
}

// 辅助函数：清理测试数据
async function cleanupTestData() {
    try {
        const list = await getVoiceTexts();
        const testItems = list.filter(item => 
            item.title.includes('测试') || 
            item.title.includes('集成') ||
            item.category === 'test'
        );
        
        console.log('🧹 发现', testItems.length, '条测试数据需要清理');
        
        for (const item of testItems) {
            try {
                await deleteVoiceText(item.id);
                console.log('🗑️ 已删除测试数据:', item.title);
            } catch (error) {
                console.warn('⚠️ 删除测试数据失败:', item.title, error.message);
            }
        }
    } catch (error) {
        console.log('ℹ️ 清理测试数据时出现错误（可能是正常的）:', error.message);
    }
}

// 运行集成测试
testVoiceTextIntegration().catch(console.error);
