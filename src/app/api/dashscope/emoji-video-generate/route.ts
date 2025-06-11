import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DashscopeImageService } from '@/services/DashscopeImageService';
import { ImageEditService } from '@/services/databaseService';
import { FileUploadService } from '@/services/fileUploadService';

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

    // 更新表情视频状态为处理中
    await ImageEditService.updateStatus(
      requestData.imageId,
      'SUCCEEDED',
      {
        emoji_status: 'RUNNING',
      },
      supabase,
    );

    // 调用DashScope服务生成表情包视频
    const dashscopeService = new DashscopeImageService();
    const videoUrl = await dashscopeService.generateEmojiVideo(
      imageUrl,
      faceBbox,
      extBbox,
      requestData.drivenId,
    );

    // 下载并上传视频到Supabase
    const fileUploadService = new FileUploadService(supabase);
    const uploadedVideoUrl = await downloadAndUploadVideo(
      videoUrl,
      requestData.imageId,
      user.id,
      fileUploadService,
    );

    // 更新数据库记录
    await ImageEditService.updateStatus(
      requestData.imageId,
      'SUCCEEDED',
      {
        emoji_result_url: uploadedVideoUrl || videoUrl, // 表情视频结果URL
        emoji_status: 'SUCCEEDED', // 表情视频生成状态
      },
      supabase,
    );

    // 返回生成结果
    return NextResponse.json({
      success: true,
      data: {
        videoUrl,
        message: '表情包视频生成成功',
      },
    });
  } catch (error) {
    console.error('表情包视频生成API错误:', error);

    // 尝试更新表情视频状态为失败
    try {
      if (request.body) {
        const requestData = (await request.clone().json()) as { imageId: string };
        if (requestData.imageId) {
          const supabase = await createClient();
          await ImageEditService.updateStatus(
            requestData.imageId,
            'SUCCEEDED',
            {
              emoji_status: 'FAILED',
            },
            supabase,
          );
        }
      }
    } catch (updateError) {
      console.error('更新表情视频状态失败:', updateError);
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
