import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body: any = await request.json();
    const { inputs } = body;

    if (!inputs || !inputs.image) {
      return NextResponse.json(
        { error: '缺少必要的参数' },
        { status: 400 },
      );
    }

    // 302.AI API配置
    const API_URL = 'https://api.302.ai/glifapi/clz9yhrf7000010j2eg5zwlp3';
    const API_KEY = process.env.API_302AI_KEY;

    if (!API_KEY) {
      return NextResponse.json(
        { error: 'API密钥未配置' },
        { status: 500 },
      );
    }

    // 调用302.AI API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {
          'image': inputs.image,
          'add-prompt': inputs['add-prompt'] || '',
        },
      }),
    });

    const result: any = await response.json();
    console.log('302.AI GIF原始响应:', result); // 新增调试

    // 最大兼容性提取gif url
    let gifUrl = result.gif_url || result.url || result.output;
    if (!gifUrl && result.data) {
      gifUrl = result.data.gif_url || result.data.url || result.data.output;
    }
    if (!gifUrl) {
      return NextResponse.json({
        success: false,
        message: '未获取到GIF地址',
        raw: result,
      }, { status: 500 });
    }
    return NextResponse.json({
      success: true,
      url: gifUrl,
      gif_url: gifUrl,
      output: gifUrl,
      message: 'GIF生成成功',
    });
  } catch (error) {
    console.error('GIF generation error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 },
    );
  }
}
