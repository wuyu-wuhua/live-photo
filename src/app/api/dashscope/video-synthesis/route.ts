import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { consumeCreditsForImageEdit, refundCreditsForFailedTask } from '@/lib/credits';
import { ImageEditService } from '@/services/databaseService';
import { randomUUID } from 'crypto';

// DashScope API配置
const DASHSCOPE_CONFIG = {
  BASE_URL: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis',
  API_KEY: process.env.DASHSCOPE_API_KEY,
  CREDIT_COST: 10, // 每次视频生成消耗10积分
} as const;

// 错误消息常量
const ERROR_MESSAGES = {
  UNAUTHORIZED: '未授权访问',
  MISSING_API_KEY: '缺少DashScope API密钥配置',
  MISSING_IMAGE_ID: '缺少图片ID',
  IMAGE_NOT_FOUND: '图片不存在',
  INSUFFICIENT_CREDITS: '积分不足',
  API_REQUEST_FAILED: 'DashScope API请求失败',
  TASK_UPDATE_FAILED: '更新任务状态失败',
  INTERNAL_ERROR: '服务器内部错误',
} as const;

type VideoSynthesisRequest = {
  imageId: string;
  prompt?: string;
  resolution?: '720P' | '1080P';
};

type VideoSynthesisResponse = {
  output: {
    task_status: string;
    task_id: string;
  };
  request_id: string;
};

/**
 * 验证图片URL是否可访问
 */
async function validateImageUrl(imageUrl: string): Promise<boolean> {
  try {
    // 使用AbortController来实现超时
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
    
    const response = await fetch(imageUrl, { 
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error('图片URL验证失败:', error);
    return false;
  }
}

/**
 * 下载图片并转换为base64
 */
async function downloadImageAsBase64(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`下载图片失败: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error('下载图片失败:', error);
    throw error;
  }
}

/**
 * 调用DashScope视频合成API
 */
async function callDashScopeVideoSynthesisAPI(
  imageUrl: string,
  prompt: string = '让图片动起来，自然的动作和表情',
  resolution: string = '720P'
): Promise<VideoSynthesisResponse> {
  if (!DASHSCOPE_CONFIG.API_KEY) {
    throw new Error(ERROR_MESSAGES.MISSING_API_KEY);
  }

  // 直接使用传入的图片URL（可能是base64或URL）
  const finalImageUrl = imageUrl;

  const requestBody = {
    model: 'wanx2.1-i2v-turbo',
    input: {
      prompt: prompt,
      img_url: finalImageUrl, // 使用验证过的图片URL
    },
    parameters: {
      resolution: resolution,
      prompt_extend: true,
    },
  };

  console.log('DashScope视频合成API调用信息:', {
    apiKey: DASHSCOPE_CONFIG.API_KEY.substring(0, 10) + '...',
    imageUrl: finalImageUrl.substring(0, 100) + (finalImageUrl.length > 100 ? '...' : ''),
    prompt: prompt,
    resolution: resolution,
    isBase64: finalImageUrl.startsWith('data:'),
  });

  const response = await fetch(DASHSCOPE_CONFIG.BASE_URL, {
    method: 'POST',
    headers: {
      'X-DashScope-Async': 'enable',
      'Authorization': `Bearer ${DASHSCOPE_CONFIG.API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  console.log('DashScope API响应状态:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('DashScope API错误响应:', errorText);
    throw new Error(`DashScope API请求失败: ${response.status} ${errorText}`);
  }

  const result = await response.json() as VideoSynthesisResponse;
  console.log('DashScope API成功响应:', result);
  
  return result;
}

/**
 * 轮询任务状态
 */
async function pollTaskStatus(taskId: string): Promise<any> {
  if (!DASHSCOPE_CONFIG.API_KEY) {
    throw new Error(ERROR_MESSAGES.MISSING_API_KEY);
  }

  const maxAttempts = 60; // 最多轮询60次
  const pollInterval = 5000; // 每5秒轮询一次

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    console.log(`轮询任务状态 - 第${attempt + 1}次, 任务ID: ${taskId}`);

    const response = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${DASHSCOPE_CONFIG.API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`轮询任务状态失败: ${response.status}`);
    }

    const result = await response.json() as any;
    console.log('轮询结果:', result);

    if (result.output?.task_status === 'SUCCEEDED') {
      console.log('任务完成:', result);
      return result;
    }

    if (result.output?.task_status === 'FAILED') {
      throw new Error('视频生成任务失败');
    }

    // 等待后继续轮询
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error('轮询超时，任务可能仍在处理中');
}

/**
 * 创建错误响应
 */
function createErrorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status },
  );
}

export async function POST(request: NextRequest) {
  let transactionId: string | undefined;

  try {
    // 1. 验证用户身份
    const supabaseClient = await createClient();
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      return createErrorResponse(ERROR_MESSAGES.UNAUTHORIZED, 401);
    }

    // 2. 解析请求数据
    const requestData = await request.json() as VideoSynthesisRequest;
    
    if (!requestData.imageId) {
      return createErrorResponse(ERROR_MESSAGES.MISSING_IMAGE_ID);
    }

    // 3. 获取图片数据
    const imageEditResult = await ImageEditService.getById(requestData.imageId, supabaseClient);
    if (!imageEditResult.success || !imageEditResult.data) {
      return createErrorResponse(ERROR_MESSAGES.IMAGE_NOT_FOUND);
    }

    // 4. 检查积分余额
    const creditCheck = await consumeCreditsForImageEdit(
      user.id, 
      'video_synthesis', 
      DASHSCOPE_CONFIG.CREDIT_COST
    );
    
    if (!creditCheck.success) {
      return createErrorResponse(creditCheck.message || ERROR_MESSAGES.INSUFFICIENT_CREDITS, 402);
    }

    transactionId = creditCheck.transactionId;

    // 5. 使用上色后的图片URL，而不是原图
    const imageUrl = imageEditResult.data.result_image_url && imageEditResult.data.result_image_url.length > 0 
      ? imageEditResult.data.result_image_url[0] 
      : imageEditResult.data.source_image_url;
      
    if (!imageUrl) {
      if (transactionId) {
        await refundCreditsForFailedTask(transactionId, '图片URL不存在');
      }
      return createErrorResponse('图片URL不存在');
    }

    console.log('原始图片URL:', imageUrl);

    // 6. 强制下载图片并转换为base64，避免DashScope API无法访问URL的问题
    console.log('开始下载图片并转换为base64...');
    let finalImageUrl = '';
    
    try {
      // 下载图片
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`无法下载图片: ${imageResponse.status}`);
      }
      
      const imageBuffer = await imageResponse.arrayBuffer();
      const buffer = Buffer.from(imageBuffer);
      
      // 检查图片大小
      const imageSizeInMB = buffer.length / (1024 * 1024);
      console.log(`图片大小: ${imageSizeInMB.toFixed(2)} MB`);
      
      // 如果图片太大，尝试重新上传到公开存储
      if (imageSizeInMB > 3) {
        console.log('图片过大，尝试重新上传到公开存储...');
      
      // 创建FormData
      const formData = new FormData();
      const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
      formData.append('file', blob, 'image.jpg');
      
        // 上传到公开API
      console.log('上传图片到公开API...');
      const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/upload-image`, {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        throw new Error(`上传API失败: ${uploadResponse.status}`);
      }
      
      const uploadResult = await uploadResponse.json() as { success: boolean; url: string };
      if (!uploadResult.success) {
        throw new Error('上传失败');
      }
      
        finalImageUrl = uploadResult.url;
        console.log('获取到新的公开访问URL:', finalImageUrl);
      
      // 等待一段时间确保文件可访问
        await new Promise(resolve => setTimeout(resolve, 5000));
      
        // 再次验证URL
        const testResponse = await fetch(finalImageUrl, { method: 'HEAD' });
      if (!testResponse.ok) {
          throw new Error(`新URL不可访问: ${testResponse.status}`);
      }
        console.log('新URL验证成功');
        
      } else {
        // 图片大小合适，直接转换为base64
        console.log('图片大小合适，转换为base64格式...');
        const base64 = buffer.toString('base64');
        finalImageUrl = `data:image/jpeg;base64,${base64}`;
        console.log('成功转换为base64格式，大小:', (base64.length / 1024 / 1024).toFixed(2), 'MB');
      }
      
    } catch (error) {
      console.error('处理图片失败:', error);
      if (transactionId) {
        await refundCreditsForFailedTask(transactionId, '图片处理失败');
      }
      return createErrorResponse(`图片处理失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }

    // 7. 调用DashScope API
    console.log('开始调用DashScope视频合成API...');
    const synthesisResult = await callDashScopeVideoSynthesisAPI(
      finalImageUrl,
      requestData.prompt,
      requestData.resolution
    );

    console.log('DashScope API调用成功，任务ID:', synthesisResult.output.task_id);

    // 7.1 新增：立即插入一条独立的视频记录（PENDING状态，任务完成后只更新）
    try {
      const imageEditResult = await ImageEditService.getById(requestData.imageId, supabaseClient);
      if (imageEditResult.success && imageEditResult.data) {
        const safeResultImageUrl = Array.isArray(imageEditResult.data.result_image_url) ? imageEditResult.data.result_image_url : [];
        const safeSourceImageUrl = imageEditResult.data.source_image_url || '';
        let safeRequestParameters: Record<string, any> = {};
        if (typeof imageEditResult.data.request_parameters === 'object' && imageEditResult.data.request_parameters !== null && !Array.isArray(imageEditResult.data.request_parameters)) {
          safeRequestParameters = { ...imageEditResult.data.request_parameters };
        }
        safeRequestParameters.function = 'video_synthesis';
        safeRequestParameters.task_id = synthesisResult.output.task_id;
        safeRequestParameters.prompt = requestData.prompt || '让图片动起来，自然的动作和表情';
        safeRequestParameters.resolution = requestData.resolution || '720P';
        // 生成唯一id
        const videoGalleryId = randomUUID();
        safeRequestParameters.video_gallery_id = videoGalleryId;
        await supabaseClient
          .from('image_edit_results')
          .insert({
            id: videoGalleryId,
            user_id: user.id,
            source_image_url: safeSourceImageUrl,
            result_image_url: [],
            result_type: 'video',
            status: 'PENDING',
            video_result_url: '',
            request_parameters: safeRequestParameters,
            created_at: new Date().toISOString(),
          });
        console.log('已立即插入PENDING状态视频画廊记录，id:', videoGalleryId);
      }
    } catch (e) {
      console.error('插入PENDING视频画廊记录失败:', e);
    }

    // 7.2 更新原图片记录状态
    const updateData = {
      status: 'RUNNING' as const,
      request_parameters: {
        function: 'video_synthesis',
        model: 'wanx2.1-i2v-turbo',
        task_id: synthesisResult.output.task_id,
        prompt: requestData.prompt || '让图片动起来，自然的动作和表情',
        resolution: requestData.resolution || '720P',
        creditTransactionId: transactionId,
      },
    };

    const updateResult = await ImageEditService.updateStatus(
      requestData.imageId,
      'RUNNING',
      updateData,
      supabaseClient
    );

    if (!updateResult.success) {
      if (transactionId) {
        await refundCreditsForFailedTask(transactionId, '更新任务状态失败');
      }
      return createErrorResponse('更新任务状态失败: ' + updateResult.error);
    }

    // 8. 返回成功响应
    return NextResponse.json({
      success: true,
      data: {
        task_id: synthesisResult.output.task_id,
        task_status: synthesisResult.output.task_status,
        message: '视频合成任务已创建，请稍后查看结果',
        credit_cost: DASHSCOPE_CONFIG.CREDIT_COST,
      },
    });

  } catch (error) {
    console.error('视频合成API错误:', error);

    // 如果已经扣除了积分，尝试退款
    if (transactionId) {
      await refundCreditsForFailedTask(
        transactionId, 
        error instanceof Error ? error.message : '未知错误'
      );
    }

    return createErrorResponse(
      error instanceof Error ? error.message : ERROR_MESSAGES.INTERNAL_ERROR,
      500
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const task_id = searchParams.get('task_id');
  if (!task_id) {
    return NextResponse.json({ success: false, error: '缺少task_id' }, { status: 400 });
  }
  try {
    const res = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${task_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${DASHSCOPE_CONFIG.API_KEY}`,
      }
    });
    const json = await res.json();
    if (!res.ok) {
      return NextResponse.json({ success: false, error: json }, { status: res.status });
    }
    const spreadObj = typeof json === 'object' && json !== null ? json : {};
    return NextResponse.json({ success: true, ...spreadObj });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || '服务器错误' }, { status: 500 });
  }
} 