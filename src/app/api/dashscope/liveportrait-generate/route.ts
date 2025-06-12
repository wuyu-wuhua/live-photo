import type { NextRequest } from 'next/server';
import type { ImageEditResultInsert } from '@/types/database';
import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { consumeCreditsForImageEdit, refundCreditsForFailedTask } from '@/lib/credits';
import { createClient } from '@/lib/supabase/server';
import { DashscopeImageService } from '@/services/DashscopeImageService';
import { ImageEditService } from '@/services/databaseService';

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
    const requestData: any = await request.json();

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

    if (!requestData.audioUrl) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必要参数: audioUrl (音频URL)',
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

    // 获取图像URL
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

    // 扣除积分 (对口型视频生成固定扣除15点积分)
    const creditCost = 15;
    const creditResult = await consumeCreditsForImageEdit(
      user.id,
      'liveportrait_video', // 使用一个标识对口型视频生成的类型
      creditCost,
      undefined,
    );

    if (!creditResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: creditResult.message || '积分不足，无法生成对口型视频',
        },
        { status: 402 },
      );
    }

    transactionId = creditResult.transactionId; // 保存交易ID

    // 生成新记录的 ID
    const newImageId = crypto.randomUUID();

    // 立即返回响应，后台异步处理视频生成
    // 启动异步处理
    processLivePortraitGeneration(
      imageUrl,
      requestData.audioUrl,
      requestData.imageId,
      user.id,
      newImageId, // 传递新生成的 ID
      transactionId, // 传递交易ID
    ).catch((error) => {
      console.error('对口型视频生成后台处理错误:', error);
    });

    // 立即返回成功响应，包含新记录 ID
    return NextResponse.json({
      success: true,
      data: {
        message: '对口型视频生成任务已创建，请稍后查看结果',
        imageId: newImageId, // 返回新记录 ID
        originalImageId: requestData.imageId, // 同时返回原始记录 ID
        creditCost, // 返回消耗的积分
      },
    });
  } catch (error) {
    console.error('LivePortrait视频生成API错误:', error);

    // 如果过程中出错，且已扣除积分，则退还积分
    if (transactionId) {
      try {
        await refundCreditsForFailedTask(
          transactionId,
          `对口型视频生成启动失败: ${error instanceof Error ? error.message : '未知错误'}`,
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
 * 异步处理对口型视频生成
 * 该函数在后台运行，不阻塞API响应
 */
async function processLivePortraitGeneration(
  imageUrl: string,
  audioUrl: string,
  imageId: string,
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

    // 创建新的图像编辑记录
    const newRecord: ImageEditResultInsert = {
      id: newImageId, // 使用传入的 ID
      user_id: userId,
      source_image_url: imageUrl,
      result_image_url: [], // 空数组，因为这是视频生成
      result_type: 'video',
      status: 'RUNNING', // 使用统一的 status 字段
      request_parameters: JSON.stringify({
        audioUrl,
        originalImageId: imageId,
        ...(transactionId && { creditTransactionId: transactionId }), // 将交易ID保存到request_parameters
      }),
    };

    // 创建新记录
    const createResult = await ImageEditService.create(newRecord, supabase);
    if (!createResult.success) {
      throw new Error(`创建新记录失败: ${createResult.error}`);
    }

    // 调用DashScope服务生成LivePortrait视频
    const videoUrl = await dashscopeService.generateLivePortrait(imageUrl, audioUrl);

    if (videoUrl) {
      // 更新新创建的记录
      await ImageEditService.updateStatus(
        newImageId,
        'SUCCEEDED',
        {
          liveportrait_result_url: videoUrl,
        },
        supabase,
      );
    } else {
      throw new Error('视频生成失败或未返回视频URL');
    }
  } catch (error) {
    console.error('对口型视频生成后台处理错误:', error);

    // 如果任务失败，退还积分
    if (transactionId) {
      try {
        await refundCreditsForFailedTask(
          transactionId,
          `对口型视频生成失败: ${error instanceof Error ? error.message : '未知错误'}`,
        );
      } catch (refundError) {
        console.error('退款失败:', refundError);
      }
    }

    // 创建失败状态的新记录
    try {
      const supabase = await createClient();

      // 创建新的失败状态记录
      const newRecord: ImageEditResultInsert = {
        id: newImageId, // 使用传入的 ID
        user_id: userId,
        source_image_url: imageUrl,
        result_image_url: [], // 空数组，因为这是视频生成
        result_type: 'video',
        status: 'FAILED', // 使用统一的 status 字段
        liveportrait_message: error instanceof Error ? error.message : '未知错误',
        request_parameters: JSON.stringify({
          audioUrl,
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
