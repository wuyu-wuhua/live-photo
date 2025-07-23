import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
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

    // 获取所有有视频URL但result_type不是video的记录
    const { data: records, error } = await supabase
      .from('image_edit_results')
      .select('*')
      .eq('user_id', user.id)
      .or('video_result_url.neq.null,emoji_result_url.neq.null,liveportrait_result_url.neq.null')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取记录失败:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 },
      );
    }

    // 修复需要修复的记录
    const recordsToFix = records?.filter(record => {
      const hasVideoUrl = record.video_result_url || record.emoji_result_url || record.liveportrait_result_url;
      return hasVideoUrl && record.result_type !== 'video';
    }) || [];

    if (recordsToFix.length > 0) {
      console.log(`找到 ${recordsToFix.length} 条需要修复的记录`);
      
      // 批量更新这些记录
      for (const record of recordsToFix) {
        const { error: updateError } = await supabase
          .from('image_edit_results')
          .update({
            result_type: 'video',
            updated_at: new Date().toISOString(),
          })
          .eq('id', record.id);
        
        if (updateError) {
          console.error(`修复记录 ${record.id} 失败:`, updateError);
        } else {
          console.log(`成功修复记录 ${record.id}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalRecords: records?.length || 0,
        recordsToFix: recordsToFix.length,
        records: records || [],
      },
    });
  } catch (error) {
    console.error('API错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 },
    );
  }
} 