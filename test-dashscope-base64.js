import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const dashscopeApiKey = process.env.DASHSCOPE_API_KEY;

if (!supabaseUrl || !supabaseServiceKey || !dashscopeApiKey) {
  console.error('❌ 缺少必要的环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDashScopeWithBase64() {
  console.log('🔍 开始测试DashScope API与base64图片...\n');

  try {
    // 1. 获取一个测试图片
    console.log('1. 获取测试图片...');
    const { data: files, error: filesError } = await supabase.storage
      .from('live-photos')
      .list('public-images', {
        limit: 1,
        offset: 0
      });

    if (filesError || !files.length) {
      console.error('❌ 无法获取测试图片');
      return;
    }

    const testFile = files[0];
    console.log(`✅ 找到测试图片: ${testFile.name}`);

    // 2. 下载图片
    console.log('\n2. 下载图片...');
    const { data: imageData, error: downloadError } = await supabase.storage
      .from('live-photos')
      .download(`public-images/${testFile.name}`);

    if (downloadError) {
      console.error('❌ 下载图片失败:', downloadError.message);
      return;
    }

    const arrayBuffer = await imageData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log(`✅ 图片下载成功，大小: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);

    // 3. 转换为base64
    console.log('\n3. 转换为base64...');
    const base64 = buffer.toString('base64');
    const base64Url = `data:image/jpeg;base64,${base64}`;
    console.log(`✅ base64转换成功，大小: ${(base64.length / 1024 / 1024).toFixed(2)} MB`);

    // 4. 测试DashScope API
    console.log('\n4. 测试DashScope API...');
    const requestBody = {
      model: 'wanx2.1-i2v-turbo',
      input: {
        prompt: '让图片动起来，自然的动作和表情',
        img_url: base64Url,
      },
      parameters: {
        resolution: '720P',
        prompt_extend: true,
      },
    };

    console.log('发送请求到DashScope API...');
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis', {
      method: 'POST',
      headers: {
        'X-DashScope-Async': 'enable',
        'Authorization': `Bearer ${dashscopeApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('DashScope API响应状态:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ DashScope API错误响应:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ DashScope API成功响应:', result);

    if (result.output?.task_id) {
      console.log(`✅ 任务创建成功，任务ID: ${result.output.task_id}`);
      
      // 5. 轮询任务状态
      console.log('\n5. 开始轮询任务状态...');
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        attempts++;
        console.log(`轮询第${attempts}次...`);
        
        await new Promise(resolve => setTimeout(resolve, 5000)); // 等待5秒
        
        const statusResponse = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${result.output.task_id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${dashscopeApiKey}`,
          },
        });

        if (!statusResponse.ok) {
          console.error('❌ 获取任务状态失败:', statusResponse.status);
          break;
        }

        const statusResult = await statusResponse.json();
        console.log('任务状态:', statusResult.output?.task_status);

        if (statusResult.output?.task_status === 'SUCCEEDED') {
          console.log('🎉 任务成功完成！');
          console.log('结果:', statusResult);
          break;
        }

        if (statusResult.output?.task_status === 'FAILED') {
          console.error('❌ 任务失败:', statusResult);
          break;
        }
      }

      if (attempts >= maxAttempts) {
        console.log('⚠️  轮询超时，任务可能仍在处理中');
      }
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
}

// 运行测试
testDashScopeWithBase64(); 