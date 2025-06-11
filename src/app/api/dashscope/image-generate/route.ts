import type { NextRequest } from 'next/server';
import type { DashscopeImageEditRequest, DashscopeTaskQueryOutput } from '@/types/dashscope';
import type { ImageEditResultInsert } from '@/types/database';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { calculateCreditCost, consumeCreditsForImageEdit, refundCreditsForFailedTask } from '@/lib/credits';
import { createClient } from '@/lib/supabase/server';
import { DashscopeImageService } from '@/services/DashscopeImageService';
import { ImageEditService } from '@/services/databaseService';
import { FileUploadService, IMAGE_UPLOAD_CONFIG } from '@/services/fileUploadService';
// 常量定义
const DEFAULT_PARAMETERS = {
  n: 1,
  // 图像上色
  colorization: {
    strength: 0.5,
  },
  // 垫图，当前仅支持卡通形象
  control_cartoon_feature: {
    strength: 0.5,
  },
  // 指令编辑，通过指令即可编辑图像
  description_edit: {
    strength: 0.5,
  },
  // 局部重绘，需要指定编辑区域
  description_edit_with_mask: {
    strength: 0.5,
  },
  // 线稿生图
  doodle: {
    is_sketch: false,
  },
  // 扩图
  expand: {
    top_scale: 1.0,
    bottom_scale: 1.0,
    left_scale: 1.0,
    right_scale: 1.0,
  },
  // 去文字水印
  remove_watermark: {},
  // 全局风格化，当前支持2种风格
  stylization_all: {
    strength: 0.5,
  },
  // 局部风格化，当前支持8种风格
  stylization_local: {
    strength: 0.5,
  },
  // 图像超分
  super_resolution: {
    upscale_factor: 2,
  },
} as const;

// 错误消息常量
const ERROR_MESSAGES = {
  UNAUTHORIZED: '未授权访问',
  MISSING_FUNCTION: '缺少必要参数: function',
  MISSING_MASK_IMAGE: '使用inpainting功能时，mask_image_url是必需的',
  MISSING_PROMPT: '缺少必要参数: prompt',
  DOWNLOAD_FAILED: '下载图片失败',
  UPLOAD_FAILED: '上传图片失败',
  TASK_UPDATE_FAILED: '更新任务状态失败',
  INTERNAL_ERROR: '服务器内部错误',
} as const;

type UploadedImage = {
  originalUrl: string;
  uploadedFile: {
    url: string;
    [key: string]: any;
  };
};

type EmojiDetectionData = {
  emoji_compatible: boolean;
  emoji_message: string;
  emoji_detected_at: string;
  emoji_face_bbox?: string;
  emoji_ext_bbox?: string;
  emoji_request_id?: string;
};

/**
 * 下载并上传单个图片
 */
async function downloadAndUploadImage(
  imageUrl: string,
  taskId: string,
  index: number,
  userId: string,
  fileUploadService: FileUploadService,
): Promise<UploadedImage | null> {
  try {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`${ERROR_MESSAGES.DOWNLOAD_FAILED}: ${imageResponse.statusText}`);
    }

    const imageBlob = await imageResponse.blob();
    const fileName = `dashscope-${taskId}-${index + 1}.jpg`;
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
      console.error(`${ERROR_MESSAGES.UPLOAD_FAILED}:`, uploadResult.error);
      return null;
    }
  } catch (error) {
    console.error('处理图片失败:', error);
    return null;
  }
}

/**
 * 执行人脸检测
 */
async function performFaceDetection(
  imageUrl: string,
  dashscopeService: DashscopeImageService,
): Promise<EmojiDetectionData | null> {
  try {
    const detectResult = await dashscopeService.detectFace(imageUrl);
    const emojiDetectionData: EmojiDetectionData = {
      emoji_compatible: !detectResult.output.code,
      emoji_message: detectResult.output.message || '',
      emoji_detected_at: new Date().toISOString(),
    };

    if (emojiDetectionData.emoji_compatible) {
      emojiDetectionData.emoji_face_bbox = JSON.stringify(detectResult.output.bbox_face);
      emojiDetectionData.emoji_ext_bbox = JSON.stringify(detectResult.output.ext_bbox_face);
      emojiDetectionData.emoji_request_id = detectResult.request_id;
    }

    console.warn('检测到的emoji数据:', JSON.stringify(emojiDetectionData));
    return emojiDetectionData;
  } catch (error) {
    console.error('人脸检测失败:', error);
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
    console.warn(`开始更新任务状态 - ID: ${editTaskId}, Status: ${status}`);
    console.warn('更新数据:', JSON.stringify(data, null, 2));

    // 验证数据格式
    const validatedData = validateUpdateData(data);
    console.warn('验证后的数据:', JSON.stringify(validatedData, null, 2));

    const result = await ImageEditService.updateStatus(editTaskId, status, validatedData, supabaseClient);

    if (result.success) {
      console.warn('数据库更新成功:', result.message);
    } else {
      console.error('数据库更新失败:', result.error);
      throw new Error(result.error);
    }
  } catch (error) {
    console.error(`${ERROR_MESSAGES.TASK_UPDATE_FAILED}:`, error);
    console.error('错误详情:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // 如果更新失败，尝试标记为失败状态
    if (status !== 'FAILED') {
      try {
        console.warn('尝试标记任务为失败状态...');
        const fallbackResult = await ImageEditService.updateStatus(editTaskId, 'FAILED', {}, supabaseClient);
        if (fallbackResult.success) {
          console.warn('成功标记任务为失败状态');
        } else {
          console.error('标记任务失败状态也失败了:', fallbackResult.error);
        }
      } catch (fallbackError) {
        console.error('标记任务失败状态时发生异常:', fallbackError);
      }
    }

    // 重新抛出原始错误
    throw error;
  }
}

/**
 * 验证和清理更新数据
 */
function validateUpdateData(data: Record<string, any>): Record<string, any> {
  const validatedData: Record<string, any> = {};

  // 验证 result_image_url 字段
  if (data.result_image_url) {
    if (Array.isArray(data.result_image_url)) {
      // 确保数组中的所有元素都是字符串
      validatedData.result_image_url = data.result_image_url.filter(url =>
        typeof url === 'string' && url.trim().length > 0,
      );
    } else if (typeof data.result_image_url === 'string') {
      // 如果是字符串，转换为数组
      validatedData.result_image_url = [data.result_image_url];
    }
  }

  // 验证 emoji 相关字段
  const emojiFields = [
    'emoji_compatible',
    'emoji_detected_at',
    'emoji_message',
    'emoji_face_bbox',
    'emoji_ext_bbox',
    'emoji_request_id',
  ];

  emojiFields.forEach((field) => {
    if (data[field] !== undefined && data[field] !== null) {
      if (field === 'emoji_compatible') {
        validatedData[field] = Boolean(data[field]);
      } else if (field === 'emoji_detected_at') {
        // 确保时间戳格式正确
        if (typeof data[field] === 'string') {
          validatedData[field] = data[field];
        } else if (data[field] instanceof Date) {
          validatedData[field] = data[field].toISOString();
        }
      } else {
        // 其他字段确保是字符串
        validatedData[field] = String(data[field]);
      }
    }
  });

  // 验证 liveportrait 相关字段
  const liveportraitFields = [
    'liveportrait_compatible',
    'liveportrait_detected_at',
    'liveportrait_message',
    'liveportrait_request_id',
  ];

  liveportraitFields.forEach((field) => {
    if (data[field] !== undefined && data[field] !== null) {
      if (field === 'liveportrait_compatible') {
        validatedData[field] = Boolean(data[field]);
      } else if (field === 'liveportrait_detected_at') {
        // 确保时间戳格式正确
        if (typeof data[field] === 'string') {
          validatedData[field] = data[field];
        } else if (data[field] instanceof Date) {
          validatedData[field] = data[field].toISOString();
        }
      } else {
        // 其他字段确保是字符串
        validatedData[field] = String(data[field]);
      }
    }
  });

  return validatedData;
}

/**
 * 异步处理图片上传和数据库更新
 */
async function processImageUploadAsync(
  result: DashscopeTaskQueryOutput,
  userId: string,
  editTaskId?: string,
  supabaseClient?: any,
  transactionId?: string,
): Promise<void> {
  if (!editTaskId) {
    console.error('编辑任务ID不存在，无法更新记录');
    return;
  }

  if (result.code) {
    await safeUpdateTaskStatus(editTaskId, 'FAILED', {}, supabaseClient);

    // 如果生成失败且已扣除积分，则退还积分
    if (transactionId) {
      try {
        await refundCreditsForFailedTask(transactionId, '图像生成结果为空');
      } catch (error) {
        console.error('退款失败:', error);
      }
    }

    return;
  }

  const fileUploadService = new FileUploadService(supabaseClient);
  const dashscopeService = new DashscopeImageService();
  const uploadedImages: UploadedImage[] = [];
  let emojiDetectionData: EmojiDetectionData | null = null;

  // 并行处理所有图片上传
  const uploadPromises = result.results?.map((res, index) => {
    if (!res.url) {
      return Promise.resolve(null);
    }
    return downloadAndUploadImage(res.url, result.task_id, index, userId, fileUploadService);
  });

  const uploadResults = await Promise.allSettled(uploadPromises);

  // 收集成功上传的图片
  uploadResults.forEach((result) => {
    if (result.status === 'fulfilled' && result.value) {
      uploadedImages.push(result.value);
    }
  });

  // 对第一张成功上传的图片进行人脸检测
  if (result.results?.length && result.results[0]?.url) {
    emojiDetectionData = await performFaceDetection(
      result.results[0]?.url,
      dashscopeService,
    );
  }

  // 更新任务状态
  if (uploadedImages.length > 0) {
    const uploadedUrls = uploadedImages.map(img => img.uploadedFile.url);
    const updateData = {
      result_image_url: uploadedUrls,
      ...(emojiDetectionData || {}),
    };

    console.warn('准备更新数据库的数据:', JSON.stringify(updateData));
    await safeUpdateTaskStatus(editTaskId, 'SUCCEEDED', updateData, supabaseClient);
  } else {
    await safeUpdateTaskStatus(editTaskId, 'FAILED', {}, supabaseClient);

    // 如果上传失败且已扣除积分，则退还积分
    if (transactionId) {
      try {
        await refundCreditsForFailedTask(transactionId, '图像上传失败');
      } catch (error) {
        console.error('退款失败:', error);
      }
    }
  }
}

/**
 * 验证请求参数
 */
function validateRequestData(requestData: DashscopeImageEditRequest): string | null {
  if (!requestData.function) {
    return ERROR_MESSAGES.MISSING_FUNCTION;
  }

  if (requestData.function === 'description_edit_with_mask' && !requestData.mask_image_url) {
    return ERROR_MESSAGES.MISSING_MASK_IMAGE;
  }

  if (!requestData.prompt) {
    return ERROR_MESSAGES.MISSING_PROMPT;
  }

  return null;
}

/**
 * 设置请求参数的默认值
 */
function setDefaultParameters(requestData: DashscopeImageEditRequest): void {
  if (!requestData.parameters) {
    requestData.parameters = {};
  }

  // 设置默认的图片生成数量
  if (requestData.parameters.n === undefined) {
    requestData.parameters.n = DEFAULT_PARAMETERS.n;
  }

  // 根据不同功能设置默认参数
  switch (requestData.function) {
    case 'colorization':
      if (requestData.parameters.strength === undefined) {
        requestData.parameters.strength = DEFAULT_PARAMETERS.colorization.strength;
      }
      break;

    case 'control_cartoon_feature':
      if (requestData.parameters.strength === undefined) {
        requestData.parameters.strength = DEFAULT_PARAMETERS.control_cartoon_feature.strength;
      }
      break;

    case 'description_edit':
      if (requestData.parameters.strength === undefined) {
        requestData.parameters.strength = DEFAULT_PARAMETERS.description_edit.strength;
      }
      break;

    case 'description_edit_with_mask':
      if (requestData.parameters.strength === undefined) {
        requestData.parameters.strength = DEFAULT_PARAMETERS.description_edit_with_mask.strength;
      }
      break;

    case 'doodle':
      if (requestData.parameters.is_sketch === undefined) {
        requestData.parameters.is_sketch = DEFAULT_PARAMETERS.doodle.is_sketch;
      }
      break;

    case 'expand':
      {
        const expandDefaults = DEFAULT_PARAMETERS.expand;
        Object.entries(expandDefaults).forEach(([key, value]) => {
          if (requestData.parameters![key as keyof typeof expandDefaults] === undefined) {
            (requestData.parameters as any)[key] = value;
          }
        });
      }
      break;

    case 'remove_watermark':
      // 去文字水印功能无需特殊默认参数
      break;

    case 'stylization_all':
      if (requestData.parameters.strength === undefined) {
        requestData.parameters.strength = DEFAULT_PARAMETERS.stylization_all.strength;
      }
      break;

    case 'stylization_local':
      if (requestData.parameters.strength === undefined) {
        requestData.parameters.strength = DEFAULT_PARAMETERS.stylization_local.strength;
      }
      break;

    case 'super_resolution':
      if (requestData.parameters.upscale_factor === undefined) {
        requestData.parameters.upscale_factor = DEFAULT_PARAMETERS.super_resolution.upscale_factor;
      }
      break;

    default:
      // 对于未知功能类型，不设置特殊默认参数
      break;
  }
}

/**
 * 创建编辑任务数据
 */
function createEditTaskData(
  result: DashscopeTaskQueryOutput,
  requestData: DashscopeImageEditRequest,
  userId: string,
): ImageEditResultInsert {
  return {
    id: uuidv4(),
    user_id: userId,
    source_image_url: requestData.base_image_url,
    result_image_url: result.results?.map(r => r.url!) || [],
    request_parameters: {
      function: requestData.function,
      prompt: requestData.prompt,
      mask_image_url: requestData.mask_image_url,
      parameters: requestData.parameters || {},
    },
    status: 'PENDING',
    result_type: 'image',
  };
}

/**
 * 创建错误响应
 */
function createErrorResponse(error: string, status: number = 400) {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status },
  );
}

/**
 * 创建成功响应
 */
function createSuccessResponse(
  result: DashscopeTaskQueryOutput,
  editTaskData: any,
  creditCost?: number,
) {
  return NextResponse.json({
    success: true,
    data: {
      output: result,
      editTask: editTaskData,
      imageEditResultId: editTaskData?.id, // 添加 imageEditResultId
      message: '图片生成成功，正在后台上传到云存储...',
      creditCost,
    },
  });
}

export async function POST(request: NextRequest) {
  let transactionId: string | undefined;

  try {
    // 验证用户身份
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return createErrorResponse(ERROR_MESSAGES.UNAUTHORIZED, 401);
    }

    // 解析和验证请求数据
    const requestData: DashscopeImageEditRequest = (await request.json()) as DashscopeImageEditRequest;
    const validationError = validateRequestData(requestData);

    if (validationError) {
      return createErrorResponse(validationError);
    }

    // 设置默认参数
    setDefaultParameters(requestData);

    // 计算所需积分并进行扣除
    const creditCost = calculateCreditCost(requestData.function, {
      count: requestData.parameters?.n || 1,
    });

    // 扣除积分
    const creditResult = await consumeCreditsForImageEdit(
      user.id,
      requestData.function,
      { count: requestData.parameters?.n || 1 },
    );

    if (!creditResult.success) {
      return createErrorResponse(creditResult.message || '积分不足，无法生成图片', 402);
    }

    transactionId = creditResult.transactionId;

    // 调用 DashScope 服务
    const dashscopeService = new DashscopeImageService();
    const result = await dashscopeService.editImage(requestData);

    // 创建编辑任务记录
    const editTaskData = createEditTaskData(result, requestData, user.id);

    // 将积分交易ID保存到任务记录中
    if (transactionId) {
      editTaskData.request_parameters = {
        ...editTaskData.request_parameters,
        creditTransactionId: transactionId,
      };
    }

    const editTaskResult = await ImageEditService.create(editTaskData, supabase);

    if (!editTaskResult.success) {
      console.error('创建编辑任务记录失败:', editTaskResult.error);

      // 如果创建任务失败，退还积分
      if (transactionId) {
        await refundCreditsForFailedTask(transactionId, '创建编辑任务记录失败');
      }

      return createErrorResponse(`创建编辑任务记录失败: ${editTaskResult.error}`);
    } else {
      // 异步处理图片上传和数据库更新
      processImageUploadAsync(result, user.id, editTaskResult.data?.id, supabase, transactionId)
        .catch((error) => {
          console.error('异步处理图片上传失败:', error);
        });
    }

    // 立即返回结果，不等待上传完成
    return createSuccessResponse(result, editTaskResult.data, creditCost);
  } catch (error) {
    console.error('图像生成API错误:', error);

    // 如果过程中出错，且已扣除积分，则退还积分
    if (transactionId) {
      try {
        await refundCreditsForFailedTask(
          transactionId,
          `图像生成失败: ${error instanceof Error ? error.message : '未知错误'}`,
        );
      } catch (refundError) {
        console.error('退款失败:', refundError);
      }
    }

    return createErrorResponse(
      error instanceof Error ? error.message : ERROR_MESSAGES.INTERNAL_ERROR,
      500,
    );
  }
}
