import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// DashScope API配置
const DASHSCOPE_CONFIG = {
  API_KEY: process.env.DASHSCOPE_API_KEY,
} as const;

export async function GET(request: NextRequest) {
  try {
    // 1. 验证用户身份
    const supabaseClient = await createClient();
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 },
      );
    }

    // 2. 获取任务ID
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: '缺少任务ID' },
        { status: 400 },
      );
    }

    // 3. 调用DashScope API查询任务状态
    if (!DASHSCOPE_CONFIG.API_KEY) {
      return NextResponse.json(
        { success: false, error: '缺少DashScope API密钥配置' },
        { status: 500 },
      );
    }

    const response = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${DASHSCOPE_CONFIG.API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DashScope API错误响应:', errorText);
      return NextResponse.json(
        { success: false, error: `查询任务状态失败: ${response.status}` },
        { status: response.status },
      );
    }

    const result = await response.json() as any;
    console.log('DashScope任务状态查询结果:', result);

    // 4. 如果任务完成，更新数据库记录
    if (result.output?.task_status === 'SUCCEEDED' && result.output?.video_url) {
      // 查找唯一视频记录（video_gallery_id）
      const { data: videoRecords, error: videoError } = await supabaseClient
        .from('image_edit_results')
        .select('*')
        .eq('user_id', user.id)
        .eq('result_type', 'video')
        .contains('request_parameters', { task_id: taskId });

      if (!videoError && videoRecords && videoRecords.length > 0 && videoRecords[0]) {
        const videoRecord = videoRecords[0];
        const videoRecordId = videoRecord.id;
        // 更新该视频记录
        const { error: updateVideoError } = await supabaseClient
          .from('image_edit_results')
          .update({
            status: 'SUCCEEDED',
            video_result_url: result.output?.video_url || '',
            updated_at: new Date().toISOString(),
          })
          .eq('id', videoRecordId);
        if (updateVideoError) {
          console.error('更新视频画廊记录失败:', updateVideoError);
        } else {
          console.log('唯一视频画廊记录已更新，id:', videoRecordId);
        }
      } else {
        console.error('未找到唯一视频画廊记录，taskId:', taskId);
      }
    }

    // 5. 返回任务状态
    return NextResponse.json({
      success: true,
      data: {
        task_id: result.output?.task_id,
        task_status: result.output?.task_status,
        video_url: result.output?.video_url,
        error: result.output?.error,
        usage: result.usage,
      },
    });
  } catch (error) {
    console.error('查询任务状态API错误:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 },
    );
  }
}
