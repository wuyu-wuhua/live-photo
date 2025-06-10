import type { NextRequest } from 'next/server';
import type { DashscopeImageEditRequest } from '@/types/dashscope';
import { NextResponse } from 'next/server';
import { DashscopeImageService } from '@/services/DashscopeImageService';

export async function POST(request: NextRequest) {
  try {
    // 解析JSON请求体
    const requestData: DashscopeImageEditRequest = await request.json();

    // 验证必要参数
    if (!requestData.base_image_url) {
      return NextResponse.json(
        { success: false, error: '缺少基础图像URL' },
        { status: 400 },
      );
    }

    if (!requestData.function) {
      return NextResponse.json(
        { success: false, error: '缺少功能类型' },
        { status: 400 },
      );
    }

    // 调用 DashScope 服务
    const dashscopeService = new DashscopeImageService();
    const result = await dashscopeService.editImage(requestData);

    return NextResponse.json({
      success: true,
      data: {
        output: result,
      },
    });
  } catch (error) {
    console.error('图像生成API错误:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '服务器内部错误',
      },
      { status: 500 },
    );
  }
}
