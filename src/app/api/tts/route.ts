import type { NextRequest } from 'next/server';
import type { TTSParams } from '@/services/EdgeTTSService';
import { NextResponse } from 'next/server';
import EdgeTTSService from '@/services/EdgeTTSService';

export async function POST(request: NextRequest) {
  try {
    // 解析JSON请求体
    const requestData = await request.json() as TTSParams;

    // 验证必要参数
    if (!requestData.text || requestData.text.trim() === '') {
      return NextResponse.json(
        { success: false, error: '缺少文本内容' },
        { status: 400 },
      );
    }

    // 文本长度限制
    if (requestData.text.length > 5000) {
      return NextResponse.json(
        { success: false, error: '文本内容过长，请限制在5000字符以内' },
        { status: 400 },
      );
    }

    // 设置默认参数
    if (!requestData.voice) {
      requestData.voice = 'zh-CN-XiaoxiaoNeural';
    }

    // 调用 EdgeTTS 服务生成语音
    const audioUrl = await EdgeTTSService.generateSpeech(requestData);

    return NextResponse.json({
      success: true,
      data: {
        audioUrl,
      },
    });
  } catch (error) {
    console.error('语音生成API错误:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '服务器内部错误',
      },
      { status: 500 },
    );
  }
}

export async function GET(_request: NextRequest) {
  try {
    // 获取所有可用的语音列表
    const voiceList = EdgeTTSService.getVoiceList();

    return NextResponse.json({
      success: true,
      data: {
        voices: voiceList,
      },
    });
  } catch (error) {
    console.error('获取语音列表错误:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '服务器内部错误',
      },
      { status: 500 },
    );
  }
}
