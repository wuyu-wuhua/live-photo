import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { consumeCreditsForImageEdit, refundCreditsForFailedTask } from '@/lib/credits';
import { createClient } from '@/lib/supabase/server';
import { ImageEditService } from '@/services/databaseService';
import { FileUploadService, IMAGE_UPLOAD_CONFIG } from '@/services/fileUploadService';

// 302.AI API配置
const API_302AI_CONFIG = {
  BASE_URL: 'https://api.302.ai',
  COLORIZE_ENDPOINT: '/302/submit/colorize',
  FETCH_ENDPOINT: '/302/fetch',
  API_KEY: process.env.API_302AI_KEY, // 需要在.env.local中添加
  CREDIT_COST: 1, // 每次上色消耗1积分
} as const;

// 错误消息常量
const ERROR_MESSAGES = {
  UNAUTHORIZED: '未授权访问',
  MISSING_API_KEY: '缺少302.AI API密钥配置',
  MISSING_IMAGE: '缺少图片文件',
  INVALID_IMAGE: '无效的图片文件',
  UPLOAD_FAILED: '上传图片失败',
  API_REQUEST_FAILED: '302.AI API请求失败',
  TASK_UPDATE_FAILED: '更新任务状态失败',
  INTERNAL_ERROR: '服务器内部错误',
} as const;

type ColorizeResponse = {
  id: string;
  model: string;
  created_at: string;
  completed_at: string;
  output: string;
  error: string;
  status?: string;
  started_at?: string;
};

type UploadedImage = {
  originalUrl: string;
  uploadedFile: {
    url: string;
    [key: string]: any;
  };
};

/**
 * 调用302.AI上色API
 */
async function call302AIColorizeAPI(imageFile: File): Promise<ColorizeResponse> {
  if (!API_302AI_CONFIG.API_KEY) {
    throw new Error(ERROR_MESSAGES.MISSING_API_KEY);
  }

  const formData = new FormData();
  formData.append('image', imageFile);

  console.log('302.AI API调用信息:', {
    apiKey: `${API_302AI_CONFIG.API_KEY.substring(0, 10)}...`,
    imageSize: imageFile.size,
    imageType: imageFile.type,
  });

  // 先尝试最基本的调用方式
  try {
    const response = await fetch('https://api.302.ai/302/submit/colorize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_302AI_CONFIG.API_KEY}`,
      },
      body: formData,
    });

    console.log('302.AI API响应状态:', response.status);

    if (response.ok) {
      const result = await response.json() as any;
      console.log('302.AI API成功响应:', result);

      // 检查是否已经完成
      if (result.status === 'succeeded' && result.output) {
        console.log('302.AI API直接返回完成结果，无需轮询');
        return result as ColorizeResponse;
      }

      // 如果返回的是任务ID，需要轮询
      if (result.id) {
        console.log('302.AI API返回任务ID，需要轮询:', result.id);
        return result as ColorizeResponse;
      }

      throw new Error('302.AI API返回格式异常');
    } else {
      const errorText = await response.text();
      console.error('302.AI API错误响应:', errorText);

      // 如果Bearer认证失败，尝试其他认证方式
      const response2 = await fetch('https://api.302.ai/302/submit/colorize', {
        method: 'POST',
        headers: {
          'X-API-Key': API_302AI_CONFIG.API_KEY,
        },
        body: formData,
      });

      if (response2.ok) {
        const result = await response2.json();
        console.log('302.AI API成功响应(使用X-API-Key):', result);
        return result as ColorizeResponse;
      } else {
        const errorText2 = await response2.text();
        console.error('302.AI API错误响应(使用X-API-Key):', errorText2);
        throw new Error(`${ERROR_MESSAGES.API_REQUEST_FAILED}: ${errorText2}`);
      }
    }
  } catch (error) {
    console.error('302.AI API调用异常:', error);
    throw new Error(`${ERROR_MESSAGES.API_REQUEST_FAILED}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 轮询获取任务结果
 */
async function pollTaskResult(taskId: string, maxAttempts: number = 60): Promise<ColorizeResponse> {
  if (!API_302AI_CONFIG.API_KEY) {
    throw new Error(ERROR_MESSAGES.MISSING_API_KEY);
  }

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(`${API_302AI_CONFIG.BASE_URL}${API_302AI_CONFIG.FETCH_ENDPOINT}?id=${taskId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${API_302AI_CONFIG.API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`${ERROR_MESSAGES.API_REQUEST_FAILED}: ${response.status}`);
    }

    const result = await response.json();
    const typedResult = result as ColorizeResponse;

    // 检查任务是否完成
    if (typedResult.completed_at && typedResult.output) {
      return typedResult;
    }

    // 检查是否有错误
    if (typedResult.error) {
      throw new Error(`302.AI处理失败: ${typedResult.error}`);
    }

    // 等待5秒后重试
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  throw new Error('任务超时，请稍后重试');
}

/**
 * 下载并上传处理后的图片
 */
async function downloadAndUploadResultImage(
  imageUrl: string,
  taskId: string,
  userId: string,
  fileUploadService: FileUploadService,
): Promise<UploadedImage | null> {
  try {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`下载图片失败: ${imageResponse.statusText}`);
    }

    const imageBlob = await imageResponse.blob();
    const fileName = `302ai-colorize-${taskId}.jpg`;
    const imageFile = new File([imageBlob], fileName, { type: 'image/jpeg' });

    const uploadResult = await fileUploadService.uploadFile(
      imageFile,
      userId,
      IMAGE_UPLOAD_CONFIG,
    );

    if (uploadResult.success && uploadResult.file) {
      return {
        originalUrl: imageUrl,
        uploadedFile: uploadResult.file,
      };
    } else {
      console.error('上传图片失败:', uploadResult.error);
      return null;
    }
  } catch (error) {
    console.error('处理结果图片失败:', error);
    return null;
  }
}

/**
 * 安全更新任务状态
 */
async function safeUpdateTaskStatus(
  editTaskId: string,
  status: 'SUCCEEDED' | 'FAILED',
  data: Record<string, any>,
  supabaseClient: any,
): Promise<void> {
  try {
    console.log(`更新任务状态 - ID: ${editTaskId}, Status: ${status}`);

    // 简化更新数据，只包含必要的字段
    const updateData = {
      status,
      result_image_url: data.result_image_url || [],
      request_parameters: data.request_parameters || {},
      ...(data.error_message && { error_message: data.error_message }),
    };

    const result = await ImageEditService.updateStatus(editTaskId, status, updateData, supabaseClient);

    if (result.success) {
      console.log('数据库更新成功:', result.message);
    } else {
      console.error('数据库更新失败:', result.error);
      // 不抛出错误，只记录日志
      console.warn('数据库更新失败，但继续执行');
    }
  } catch (error) {
    console.error('更新任务状态失败:', error);
    // 不抛出错误，只记录日志
    console.warn('任务状态更新失败，但继续执行');
  }
}

/**
 * 创建错误响应
 */
function createErrorResponse(error: string, status: number = 400) {
  return NextResponse.json(
    { error, success: false },
    { status },
  );
}

/**
 * 创建成功响应
 */
function createSuccessResponse(
  result: ColorizeResponse,
  editTaskData: any,
  creditCost: number,
) {
  return NextResponse.json({
    success: true,
    data: {
      task_id: editTaskData.id,
      external_task_id: result.id,
      result_image_url: result.output,
      credit_cost: creditCost,
      processing_time_ms: editTaskData.processing_time_ms,
    },
    message: '黑白照片上色成功',
  });
}

export async function POST(request: NextRequest) {
  try {
    // 1. 验证用户身份
    const supabaseClient = await createClient();
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return createErrorResponse(ERROR_MESSAGES.UNAUTHORIZED, 401);
    }

    // 2. 检查积分余额
    const creditCheck = await consumeCreditsForImageEdit(user.id, 'colorization', API_302AI_CONFIG.CREDIT_COST);
    if (!creditCheck.success) {
      return createErrorResponse(creditCheck.message || '积分不足', 400);
    }

    // 3. 解析请求数据
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      if (creditCheck.transactionId) {
        await refundCreditsForFailedTask(creditCheck.transactionId, '缺少图片文件');
      }
      return createErrorResponse(ERROR_MESSAGES.MISSING_IMAGE);
    }

    // 4. 验证图片文件
    if (!imageFile.type.startsWith('image/')) {
      if (creditCheck.transactionId) {
        await refundCreditsForFailedTask(creditCheck.transactionId, '无效的图片文件');
      }
      return createErrorResponse(ERROR_MESSAGES.INVALID_IMAGE);
    }

    // 5. 创建任务记录
    const editTaskId = uuidv4();
    const initialTaskData = {
      id: editTaskId,
      user_id: user.id,
      source_image_url: '',
      result_image_url: [],
      result_type: 'image',
      status: 'RUNNING' as const,
      request_parameters: {
        function: 'colorization',
        model: '302.AI DDColor',
        strength: 1.0,
      },
    };

    const createResult = await ImageEditService.create(initialTaskData, supabaseClient);
    if (!createResult.success) {
      if (creditCheck.transactionId) {
        await refundCreditsForFailedTask(creditCheck.transactionId, '创建任务失败');
      }
      return createErrorResponse(`创建任务失败: ${createResult.error}`);
    }

    try {
      // 6. 上传原图到存储
      const fileUploadService = new FileUploadService(supabaseClient);
      const originalImageUploadResult = await fileUploadService.uploadFile(
        imageFile,
        user.id,
        IMAGE_UPLOAD_CONFIG,
      );

      if (!originalImageUploadResult.success || !originalImageUploadResult.file) {
        throw new Error('上传原图失败');
      }

      // 更新任务记录，保存原图URL
      await ImageEditService.updateStatus(editTaskId, 'RUNNING', {
        source_image_url: originalImageUploadResult.file.url,
      }, supabaseClient);

      // 7. 调用302.AI API
      console.log('开始调用302.AI上色API...');
      const colorizeResult = await call302AIColorizeAPI(imageFile);
      console.log('302.AI API调用成功，任务ID:', colorizeResult.id);

      // 8. 检查是否需要轮询
      let finalResult = colorizeResult;
      if (colorizeResult.status !== 'succeeded' || !colorizeResult.output) {
        console.log('开始轮询任务结果...');
        finalResult = await pollTaskResult(colorizeResult.id);
        console.log('任务完成，结果URL:', finalResult.output);
      } else {
        console.log('API直接返回完成结果，无需轮询');
      }

      // 9. 上传结果图片到我们的存储
      const uploadedResult = await downloadAndUploadResultImage(
        finalResult.output,
        editTaskId,
        user.id,
        fileUploadService,
      );

      if (!uploadedResult) {
        throw new Error('上传结果图片失败');
      }

      // 10. 更新任务状态
      const updateData = {
        status: 'SUCCEEDED',
        result_image_url: [uploadedResult.uploadedFile.url], // 必须是数组
        request_parameters: {
          function: 'colorization',
          model: '302.AI DDColor',
          strength: 1.0,
        },
      };

      await safeUpdateTaskStatus(editTaskId, 'SUCCEEDED', updateData, supabaseClient);

      // 11. 返回成功响应
      return createSuccessResponse(finalResult, { id: editTaskId }, API_302AI_CONFIG.CREDIT_COST);
    } catch (processingError) {
      console.error('处理过程中出错:', processingError);

      // 退款并更新任务状态
      if (creditCheck.transactionId) {
        await refundCreditsForFailedTask(creditCheck.transactionId, '处理失败');
      }
      await safeUpdateTaskStatus(editTaskId, 'FAILED', {
        error_message: processingError instanceof Error ? processingError.message : String(processingError),
      }, supabaseClient);

      return createErrorResponse(
        processingError instanceof Error ? processingError.message : ERROR_MESSAGES.INTERNAL_ERROR,
        500,
      );
    }
  } catch (error) {
    console.error('302.AI上色API错误:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : ERROR_MESSAGES.INTERNAL_ERROR,
      500,
    );
  }
}
