import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DashscopeImageService } from '@/services/DashscopeImageService';
import { ImageEditService } from '@/services/databaseService';

export async function POST(request: NextRequest) {
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
    const requestData = await request.json();

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

    // 更新对口型视频状态为处理中
    await ImageEditService.updateStatus(
      requestData.imageId,
      {
        liveportrait_status: 'RUNNING',
      },
      supabase,
    );

    // 调用DashScope服务生成LivePortrait视频
    const dashscopeService = new DashscopeImageService();
    const videoUrl = await dashscopeService.generateLivePortrait(
      imageUrl,
      requestData.audioUrl,
    );

    // 更新数据库记录
    await ImageEditService.updateStatus(
      requestData.imageId,
      {
        liveportrait_result_url: videoUrl, // 对口型视频结果URL
        liveportrait_status: 'SUCCEEDED', // 对口型视频生成状态
      },
      supabase,
    );

    // 返回生成结果
    return NextResponse.json({
      success: true,
      data: {
        videoUrl,
        message: 'LivePortrait视频生成成功',
      },
    });
  } catch (error) {
    console.error('LivePortrait视频生成API错误:', error);

    // 尝试更新对口型视频状态为失败
    try {
      if (request.body) {
        const requestData = await request.clone().json();
        if (requestData.imageId) {
          const supabase = await createClient();
          await ImageEditService.updateStatus(
            requestData.imageId,
            {
              liveportrait_status: 'FAILED',
            },
            supabase,
          );
        }
      }
    } catch (updateError) {
      console.error('更新任务状态失败:', updateError);
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
