import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { consumeCreditsForImageEdit, refundCreditsForFailedTask } from '@/lib/credits';
import { createClient } from '@/lib/supabase/server';
import { ImageEditService } from '@/services/databaseService';
import { FileUploadService, IMAGE_UPLOAD_CONFIG } from '@/services/fileUploadService';

// 模拟配置
const MOCK_CONFIG = {
  CREDIT_COST: 6,
  PROCESSING_TIME_MS: 3000, // 3秒模拟处理时间
} as const;

// 错误消息常量
const ERROR_MESSAGES = {
  UNAUTHORIZED: '未授权访问',
  MISSING_IMAGE: '缺少图片文件',
  INVALID_IMAGE: '无效的图片文件',
  UPLOAD_FAILED: '上传图片失败',
  INTERNAL_ERROR: '服务器内部错误',
} as const;

type MockColorizeResponse = {
  id: string;
  model: string;
  created_at: string;
  completed_at: string;
  output: string;
  error: string;
};

/**
 * 模拟302.AI上色处理
 */
async function mockColorizeProcessing(): Promise<MockColorizeResponse> {
  // 模拟处理时间
  await new Promise(resolve => setTimeout(resolve, MOCK_CONFIG.PROCESSING_TIME_MS));

  const now = new Date();
  const completedAt = new Date(now.getTime() + MOCK_CONFIG.PROCESSING_TIME_MS);

  return {
    id: uuidv4(),
    model: 'Mock DDColor',
    created_at: now.toISOString(),
    completed_at: completedAt.toISOString(),
    output: 'https://via.placeholder.com/512x512/ff6b6b/ffffff?text=Mock+Colorized+Image',
    error: '',
  };
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
      console.warn('数据库更新失败，但继续执行');
    }
  } catch (error) {
    console.error('更新任务状态失败:', error);
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
  result: MockColorizeResponse,
  editTaskId: string,
  creditCost: number,
) {
  return NextResponse.json({
    success: true,
    data: {
      task_id: editTaskId,
      external_task_id: result.id,
      result_image_url: result.output,
      credit_cost: creditCost,
      processing_time_ms: MOCK_CONFIG.PROCESSING_TIME_MS,
    },
    message: '黑白照片上色成功(模拟)',
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
    const creditCheck = await consumeCreditsForImageEdit(user.id, 'colorization', MOCK_CONFIG.CREDIT_COST);
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
        model: 'Mock DDColor',
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

      // 7. 模拟302.AI处理
      console.log('开始模拟302.AI上色处理...');
      const mockResult = await mockColorizeProcessing();
      console.log('模拟处理完成，结果URL:', mockResult.output);

      // 7. 上传结果图片到我们的存储

      // 创建一个模拟的图片文件
      const mockImageBlob = await fetch(mockResult.output).then(r => r.blob());
      const mockImageFile = new File([mockImageBlob], `mock-colorized-${editTaskId}.jpg`, { type: 'image/jpeg' });

      const uploadResult = await fileUploadService.uploadFile(
        mockImageFile,
        user.id,
        IMAGE_UPLOAD_CONFIG,
      );

      if (!uploadResult.success || !uploadResult.file) {
        throw new Error('上传结果图片失败');
      }

      // 8. 更新任务状态
      const updateData = {
        status: 'SUCCEEDED',
        result_image_url: [uploadResult.file.url], // 必须是数组
        request_parameters: {
          function: 'colorization',
          model: 'Mock DDColor',
          strength: 1.0,
        },
      };

      await safeUpdateTaskStatus(editTaskId, 'SUCCEEDED', updateData, supabaseClient);

      // 9. 返回成功响应
      return createSuccessResponse(mockResult, editTaskId, MOCK_CONFIG.CREDIT_COST);
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
    console.error('模拟302.AI上色API错误:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : ERROR_MESSAGES.INTERNAL_ERROR,
      500,
    );
  }
}
