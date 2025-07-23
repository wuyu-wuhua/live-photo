import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 加载.env.local文件
dotenv.config({ path: '.env.local' });

// 从环境变量获取配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少Supabase配置');
  console.log('请确保设置了以下环境变量:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSupabaseStorage() {
  console.log('🔍 开始测试Supabase存储配置...\n');

  try {
    // 1. 测试连接
    console.log('1. 测试Supabase连接...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.log('⚠️  认证测试失败（这是正常的，因为我们使用的是服务密钥）');
    } else {
      console.log('✅ 连接测试成功');
    }

    // 2. 检查存储桶
    console.log('\n2. 检查存储桶...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ 获取存储桶列表失败:', bucketsError.message);
      return;
    }

    console.log('📦 找到的存储桶:');
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name} (${bucket.public ? '公开' : '私有'})`);
    });

    // 3. 检查live-photos存储桶
    console.log('\n3. 检查live-photos存储桶...');
    const livePhotosBucket = buckets.find(b => b.name === 'live-photos');
    
    if (!livePhotosBucket) {
      console.error('❌ 未找到live-photos存储桶');
      console.log('请确保在Supabase中创建了名为"live-photos"的存储桶');
      return;
    }

    console.log('✅ 找到live-photos存储桶');
    console.log(`   公开访问: ${livePhotosBucket.public ? '是' : '否'}`);

    // 4. 检查存储桶内容
    console.log('\n4. 检查存储桶内容...');
    const { data: files, error: filesError } = await supabase.storage
      .from('live-photos')
      .list('public-images', {
        limit: 10,
        offset: 0
      });

    if (filesError) {
      console.error('❌ 获取文件列表失败:', filesError.message);
      return;
    }

    console.log(`📁 public-images文件夹中有 ${files.length} 个文件:`);
    files.forEach(file => {
      console.log(`   - ${file.name} (${file.metadata?.size || '未知大小'} bytes)`);
    });

    // 5. 测试上传功能
    console.log('\n5. 测试上传功能...');
    const testFileName = `test_${Date.now()}.txt`;
    const testContent = '这是一个测试文件，用于验证存储桶配置。';
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('live-photos')
      .upload(`public-images/${testFileName}`, testContent, {
        contentType: 'text/plain',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ 上传测试失败:', uploadError.message);
      return;
    }

    console.log('✅ 上传测试成功');
    console.log(`   文件路径: ${uploadData.path}`);

    // 6. 测试公开URL访问
    console.log('\n6. 测试公开URL访问...');
    const { data: publicUrlData } = supabase.storage
      .from('live-photos')
      .getPublicUrl(`public-images/${testFileName}`);

    const publicUrl = publicUrlData.publicUrl;
    console.log(`   公开URL: ${publicUrl}`);

    // 测试URL可访问性
    try {
      const response = await fetch(publicUrl);
      if (response.ok) {
        console.log('✅ 公开URL访问测试成功');
      } else {
        console.log(`⚠️  公开URL访问测试失败: ${response.status}`);
      }
    } catch (error) {
      console.log('⚠️  公开URL访问测试异常:', error.message);
    }

    // 7. 清理测试文件
    console.log('\n7. 清理测试文件...');
    const { error: deleteError } = await supabase.storage
      .from('live-photos')
      .remove([`public-images/${testFileName}`]);

    if (deleteError) {
      console.error('⚠️  清理测试文件失败:', deleteError.message);
    } else {
      console.log('✅ 测试文件清理成功');
    }

    console.log('\n🎉 Supabase存储测试完成！');
    console.log('\n📋 配置检查结果:');
    console.log('✅ 存储桶存在且可访问');
    console.log('✅ 上传功能正常');
    console.log('✅ 公开URL生成正常');
    
    if (livePhotosBucket.public) {
      console.log('✅ 存储桶已设置为公开访问');
    } else {
      console.log('⚠️  存储桶未设置为公开访问，可能影响外部API访问');
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
}

// 运行测试
testSupabaseStorage(); 