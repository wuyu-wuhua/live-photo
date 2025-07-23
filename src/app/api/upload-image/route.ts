import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

/**
 * 验证图片文件
 */
function validateImageFile(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!allowedTypes.includes(file.type)) {
    return false;
  }
  
  if (file.size > maxSize) {
    return false;
  }
  
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: '没有找到文件' }, { status: 400 });
    }

    // 验证文件
    if (!validateImageFile(file)) {
      return NextResponse.json({ 
        error: '文件格式不支持或文件过大。支持格式：JPEG, PNG, WebP，最大10MB' 
      }, { status: 400 });
    }

    // 生成唯一的文件名
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `public_${timestamp}_${randomId}.${fileExtension}`;
    
    // 转换为Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log('开始上传图片到Supabase:', {
      fileName,
      fileSize: buffer.length,
      fileType: file.type
    });
    
    // 上传到Supabase
    const { data, error } = await supabaseClient.storage
      .from('live-photos')
      .upload(`public-images/${fileName}`, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('上传失败:', error);
      return NextResponse.json({ 
        error: '上传失败: ' + error.message 
      }, { status: 500 });
    }
    
    console.log('图片上传成功:', data);
    
    // 获取公开URL
    const { data: publicUrlData } = supabaseClient.storage
      .from('live-photos')
      .getPublicUrl(`public-images/${fileName}`);
    
    const publicUrl = publicUrlData.publicUrl;
    console.log('获取到公开URL:', publicUrl);
    
    // 验证URL是否可访问
    try {
      const testResponse = await fetch(publicUrl, { method: 'HEAD' });
      if (!testResponse.ok) {
        console.warn('公开URL验证失败:', testResponse.status);
        // 不返回错误，因为URL可能稍后才能访问
      } else {
        console.log('公开URL验证成功');
      }
    } catch (error) {
      console.warn('公开URL验证异常:', error);
      // 不返回错误，继续处理
    }
    
    return NextResponse.json({ 
      url: publicUrl,
      success: true,
      fileName: fileName,
      fileSize: buffer.length
    });
    
  } catch (error) {
    console.error('处理上传失败:', error);
    return NextResponse.json({ 
      error: '处理失败: ' + (error instanceof Error ? error.message : '未知错误') 
    }, { status: 500 });
  }
} 