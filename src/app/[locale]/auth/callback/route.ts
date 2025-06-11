import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// 此路由处理Supabase身份验证回调
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();

    // 使用授权码交换会话
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    // 如果登录成功且用户存在，检查是否为新用户并赠送积分
    if (data.user && !error) {
      try {
        // 检查用户是否已有积分记录（判断是否为新用户）
        const { data: existingCredits } = await supabase
          .from('user_credits')
          .select('id')
          .eq('user_id', data.user.id)
          .single();

        // 如果没有积分记录，说明是新用户，赠送10点积分
        if (!existingCredits) {
          await supabase.rpc('add_user_credits', {
            p_user_id: data.user.id,
            p_amount: 10,
            p_type: 'BONUS',
            p_description: '新用户注册奖励',
            p_reference_id: `oauth_signup_${data.user.id}`,
            p_metadata: { source: 'oauth_new_user_registration' },
          });
        }
      } catch (creditError) {
        console.error('OAuth新用户积分赠送失败:', creditError);
        // 积分赠送失败不影响登录流程
      }
    }

    // 重定向到首页或仪表板
    return NextResponse.redirect(new URL('/', requestUrl.origin));
  }

  // 如果没有code参数，重定向到登录页面
  return NextResponse.redirect(new URL('/auth', requestUrl.origin));
}
