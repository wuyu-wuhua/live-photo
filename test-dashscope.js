const fetch = require('node-fetch');

async function testDashscopeAPI() {
  const apiKey = 'sk-3cb6d446b035484ea0b5ebaf56837bb2';
  
  console.log('🔍 测试Dashscope API密钥...');
  console.log('密钥:', apiKey.substring(0, 10) + '...');
  
  try {
    // 测试一个简单的API调用
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/text2image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'wanx-v1',
        input: {
          prompt: 'test'
        }
      })
    });
    
    const result = await response.text();
    console.log('状态码:', response.status);
    console.log('响应:', result);
    
    if (response.ok) {
      console.log('✅ API密钥有效！');
    } else {
      console.log('❌ API密钥无效或账户有问题');
    }
  } catch (error) {
    console.log('❌ 请求失败:', error.message);
  }
}

testDashscopeAPI(); 