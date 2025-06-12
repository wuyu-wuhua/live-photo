import type { NextRequest } from 'next/server';
import type { ImageEditResultInsert } from '@/types/database';
import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { consumeCreditsForImageEdit, refundCreditsForFailedTask } from '@/lib/credits';
import { createClient } from '@/lib/supabase/server';
import { DashscopeImageService } from '@/services/DashscopeImageService';
import { ImageEditService } from '@/services/databaseService';
import { FileUploadService } from '@/services/fileUploadService';

export async function POST(request: NextRequest) {
  let transactionId: string | undefined; // 用于存储积分交易ID

  try {
    // 验证用户身份
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: '未授权访问',
        },
        { status: 401 },
      );
    }

    // 解析请求数据
    const requestData = (await request.json()) as any;

    // 验证必要参数
    if (!requestData.imageId) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必要参数: imageId',
        },
        { status: 400 },
      );
    }

    if (!requestData.drivenId) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必要参数: drivenId (表情包模板ID)',
        },
        { status: 400 },
      );
    }

    // 获取图像编辑记录
    const imageEditResult = await ImageEditService.getById(requestData.imageId, supabase);
    if (!imageEditResult.success || !imageEditResult.data) {
      return NextResponse.json(
        {
          success: false,
          error: '图像记录不存在',
        },
        { status: 404 },
      );
    }

    // 检查图像是否属于当前用户
    if (imageEditResult.data.user_id !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: '无权访问该图像',
        },
        { status: 403 },
      );
    }

    // 检查是否已经进行过表情包兼容性检测
    if (!imageEditResult.data.emoji_compatible) {
      return NextResponse.json(
        {
          success: false,
          error: '该图像不兼容表情包生成，请先进行表情包兼容性检测',
        },
        { status: 400 },
      );
    }

    // 获取图像URL和人脸检测结果
    const imageUrl = imageEditResult.data.source_image_url;
    if (!imageUrl) {
      return NextResponse.json(
        {
          success: false,
          error: '图像URL不存在',
        },
        { status: 400 },
      );
    }

    // 解析人脸边界框数据
    let faceBbox: number[] = [];
    let extBbox: number[] = [];

    try {
      if (imageEditResult.data.emoji_face_bbox) {
        faceBbox = JSON.parse(imageEditResult.data.emoji_face_bbox) as number[];
      }

      if (imageEditResult.data.emoji_ext_bbox) {
        extBbox = JSON.parse(imageEditResult.data.emoji_ext_bbox) as number[];
      }
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: '人脸边界框数据解析失败',
        },
        { status: 400 },
      );
    }

    if (!faceBbox.length || !extBbox.length) {
      return NextResponse.json(
        {
          success: false,
          error: '人脸边界框数据不完整',
        },
        { status: 400 },
      );
    }

    // 扣除积分 (表情视频生成固定扣除2点积分)
    const creditCost = 2;
    const creditResult = await consumeCreditsForImageEdit(
      user.id,
      'emoji_video', // 使用一个标识表情视频生成的类型
      creditCost,
      undefined,
    );

    if (!creditResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: creditResult.message || '积分不足，无法生成表情视频',
        },
        { status: 402 },
      );
    }

    transactionId = creditResult.transactionId; // 保存交易ID

    // 生成新记录的 ID
    const newImageId = crypto.randomUUID();

    // 立即返回响应，后台异步处理视频生成
    // 启动异步处理
    processEmojiVideoGeneration(
      imageUrl,
      faceBbox,
      extBbox,
      requestData.imageId,
      requestData.drivenId,
      user.id,
      newImageId, // 传递新生成的 ID
      transactionId, // 传递交易ID
    ).catch((error) => {
      console.error('表情包视频生成后台处理错误:', error);
    });

    // 立即返回成功响应，包含新记录 ID
    return NextResponse.json({
      success: true,
      data: {
        message: '表情包视频生成任务已创建，请稍后查看结果',
        imageId: newImageId, // 返回新记录 ID
        originalImageId: requestData.imageId, // 同时返回原始记录 ID
        creditCost, // 返回消耗的积分
      },
    });
  } catch (error) {
    console.error('表情包视频生成API错误:', error);

    // 如果过程中出错，且已扣除积分，则退还积分
    if (transactionId) {
      try {
        await refundCreditsForFailedTask(
          transactionId,
          `表情视频生成启动失败: ${error instanceof Error ? error.message : '未知错误'}`,
        );
      } catch (refundError) {
        console.error('退款失败:', refundError);
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '服务器内部错误',
      },
      { status: 500 },
    );
  }
}

/**
 * 异步处理表情包视频生成
 * 该函数在后台运行，不阻塞API响应
 */
async function processEmojiVideoGeneration(
  imageUrl: string,
  faceBbox: number[],
  extBbox: number[],
  imageId: string,
  drivenId: string,
  userId: string,
  newImageId: string, // 新增参数，用于指定新记录的 ID
  transactionId?: string, // 新增参数，用于存储积分交易ID
): Promise<void> {
  try {
    const supabase = await createClient();
    const dashscopeService = new DashscopeImageService();

    // 获取原始图像编辑记录，用于获取必要信息
    const originalRecord = await ImageEditService.getById(imageId, supabase);
    if (!originalRecord.success || !originalRecord.data) {
      throw new Error('无法获取原始图像记录');
    }

    // 创建表情包视频任务
    const createResponse = await dashscopeService.createEmojiVideoTask(
      imageUrl,
      faceBbox,
      extBbox,
      drivenId,
    );

    const taskId = createResponse.output.task_id;

    // 创建新的图像编辑记录，而不是更新现有记录
    const newRecord: ImageEditResultInsert = {
      id: newImageId, // 使用传入的 ID
      user_id: userId,
      source_image_url: imageUrl,
      result_image_url: [], // 空数组，因为这是视频生成
      result_type: 'video',
      status: 'RUNNING', // 只使用 status 字段，不再使用 emoji_status
      emoji_request_id: taskId,
      emoji_compatible: true,
      emoji_face_bbox: JSON.stringify(faceBbox),
      emoji_ext_bbox: JSON.stringify(extBbox),
      request_parameters: JSON.stringify({
        drivenId,
        originalImageId: imageId,
        ...(transactionId && { creditTransactionId: transactionId }), // 将交易ID保存到request_parameters
      }),
    };

    // 创建新记录
    const createResult = await ImageEditService.create(newRecord, supabase);
    if (!createResult.success) {
      throw new Error(`创建新记录失败: ${createResult.error}`);
    }

    // const newImageId = createResult.data.id;

    // 等待任务完成
    const result = await dashscopeService.waitForEmojiVideoTaskCompletion(taskId);

    if (result.output.task_status === 'SUCCEEDED' && result.output.video_url) {
      // 下载并上传视频到Supabase
      const fileUploadService = new FileUploadService(supabase);
      const uploadedVideoUrl = await downloadAndUploadVideo(
        result.output.video_url,
        newImageId,
        userId,
        fileUploadService,
      );

      // 更新新创建的记录，只使用 status 字段
      await ImageEditService.updateStatus(
        newImageId,
        'SUCCEEDED',
        {
          emoji_result_url: uploadedVideoUrl || result.output.video_url,
          // 不再使用 emoji_status 字段
        },
        supabase,
      );
    } else {
      throw new Error('视频生成失败或未返回视频URL');
    }
  } catch (error) {
    console.error('表情包视频生成后台处理错误:', error);

    // 如果任务失败，退还积分
    if (transactionId) {
      try {
        await refundCreditsForFailedTask(
          transactionId,
          `表情视频生成失败: ${error instanceof Error ? error.message : '未知错误'}`,
        );
      } catch (refundError) {
        console.error('退款失败:', refundError);
      }
    }

    // 创建失败状态的新记录
    try {
      const supabase = await createClient();

      // 获取原始图像编辑记录，用于获取必要信息
      const originalRecord = await ImageEditService.getById(imageId, supabase);
      if (!originalRecord.success || !originalRecord.data) {
        console.error('无法获取原始图像记录');
        return;
      }

      // 创建新的失败状态记录，只使用 status 字段
      const newRecord: ImageEditResultInsert = {
        id: newImageId, // 使用传入的 ID
        user_id: userId,
        source_image_url: imageUrl,
        result_image_url: [], // 空数组，因为这是视频生成
        result_type: 'video',
        status: 'FAILED', // 只使用 status 字段，不再使用 emoji_status
        emoji_message: error instanceof Error ? error.message : '未知错误',
        emoji_compatible: true,
        emoji_face_bbox: JSON.stringify(faceBbox),
        emoji_ext_bbox: JSON.stringify(extBbox),
        request_parameters: JSON.stringify({
          drivenId,
          originalImageId: imageId,
          ...(transactionId && { creditTransactionId: transactionId }), // 将交易ID保存到request_parameters
        }),
      };

      await ImageEditService.create(newRecord, supabase);
    } catch (createError) {
      console.error('创建失败状态记录失败:', createError);
    }
  }
}

/**
 * 下载视频并上传到Supabase
 */
async function downloadAndUploadVideo(
  videoUrl: string,
  taskId: string,
  userId: string,
  fileUploadService: FileUploadService,
): Promise<string | null> {
  try {
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      throw new Error(`视频下载失败: ${videoResponse.statusText}`);
    }

    const videoBlob = await videoResponse.blob();
    const fileName = `emoji-video-${taskId}-${Date.now()}.mp4`;
    const videoFile = new File([videoBlob], fileName, { type: 'video/mp4' });

    // 配置视频上传参数
    const videoUploadConfig = {
      bucket: 'live-photos',
      folder: 'videos',
      maxFileSize: 50 * 1024 * 1024, // 50MB
      allowedTypes: ['video/mp4', 'video/webm', 'video/avi', 'video/mov'],
    };

    const uploadResult = await fileUploadService.uploadFile(
      videoFile,
      userId,
      videoUploadConfig,
    );

    if (uploadResult.success && uploadResult.file) {
      return uploadResult.file.url;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}
