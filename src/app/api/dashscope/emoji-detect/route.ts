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

    // 调用DashScope服务进行表情包人脸检测
    const dashscopeService = new DashscopeImageService();
    const detectResult = await dashscopeService.detectFace(imageUrl);

    // 检查是否检测成功
    const isCompatible = !detectResult.output.code
      && detectResult.output.bbox_face
      && detectResult.output.ext_bbox_face;

    // 更新数据库记录
    await ImageEditService.updateStatus(
      requestData.imageId,
      imageEditResult.data.status, // 保持原状态不变
      {
        emoji_compatible: isCompatible,
        emoji_detected_at: new Date().toISOString(),
        emoji_message: detectResult.output.message || null,
        emoji_face_bbox: isCompatible ? JSON.stringify(detectResult.output.bbox_face) : null,
        emoji_ext_bbox: isCompatible ? JSON.stringify(detectResult.output.ext_bbox_face) : null,
        emoji_request_id: detectResult.request_id,
      },
      supabase,
    );

    // 返回检测结果
    return NextResponse.json({
      success: true,
      data: {
        compatible: isCompatible,
        message: detectResult.output.message,
        face_bbox: detectResult.output.bbox_face,
        ext_bbox: detectResult.output.ext_bbox_face,
        request_id: detectResult.request_id,
      },
    });
  } catch (error) {
    console.error('表情包人脸检测API错误:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '服务器内部错误',
      },
      { status: 500 },
    );
  }
}
