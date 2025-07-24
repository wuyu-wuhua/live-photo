import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '已设置' : '未设置',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已设置' : '未设置',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '已设置' : '未设置',
    nodeEnv: process.env.NODE_ENV,
  });
}
