import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabaseClient = await createClient();
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      console.log('删除API - 认证失败:', authError);
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 },
      );
    }

    // 修复参数解析问题
    let resultId: string | undefined;
    try {
      const resolvedParams = await params;
      resultId = resolvedParams.id;
    } catch (error) {
      console.error('参数解析失败:', error);
      // 尝试从URL中提取ID
      const url = new URL(request.url);
      const pathParts = url.pathname.split('/');
      resultId = pathParts[pathParts.length - 1];
    }

    if (!resultId) {
      console.error('删除API - 无法获取记录ID');
      return NextResponse.json(
        { error: 'Invalid record ID' },
        { status: 400 },
      );
    }

    console.log('删除API - 开始删除记录:', resultId, '用户ID:', user.id);

    // 获取要删除的记录
    const { data: result, error: fetchError } = await supabaseClient
      .from('image_edit_results')
      .select('*')
      .eq('id', resultId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !result) {
      console.log('删除API - 记录不存在:', { resultId, fetchError, result });
      return NextResponse.json(
        { error: 'Record not found or no permission to delete' },
        { status: 404 },
      );
    }

    // 删除记录
    const { error: deleteError } = await supabaseClient
      .from('image_edit_results')
      .delete()
      .eq('id', resultId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('删除记录失败:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, message: 'Deleted successfully' },
      { status: 200 },
    );
  } catch (error) {
    console.error('删除图片编辑结果错误:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
