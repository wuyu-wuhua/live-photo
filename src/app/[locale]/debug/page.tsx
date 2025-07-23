'use client';

import { useState } from 'react';
import { Button } from '@heroui/react';
import { createClient } from '@/lib/supabase/client';

export default function DebugPage() {
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [serverEnv, setServerEnv] = useState<Record<string, any>>({});

  // 添加查看数据库记录的功能
  const [dbRecords, setDbRecords] = useState<any[]>([]);
  const [dbLoading, setDbLoading] = useState(false);

  const testSupabaseConnection = async () => {
    try {
      const supabase = createClient();
      
      // 测试基本连接
      const { data, error } = await supabase.from('uploads').select('count').limit(1);
      
      setTestResults(prev => ({
        ...prev,
        connection: error ? { error: error.message } : { success: true, data }
      }));
      
      setUploadStatus(error ? `连接失败: ${error.message}` : '连接成功');
    } catch (error) {
      setUploadStatus(`测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const checkServerEnv = async () => {
    try {
      const response = await fetch('/api/debug-env');
      const envData = await response.json();
      setServerEnv(envData as Record<string, any>);
      setTestResults(prev => ({
        ...prev,
        serverEnv: envData
      }));
    } catch (error) {
      setUploadStatus(`服务器环境变量检查失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const testFileUpload = async () => {
    try {
      setUploadStatus('开始测试文件上传...');
      
      // 创建一个测试图片文件（1x1 像素的 PNG）
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 1, 1);
      }
      
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setUploadStatus('创建测试图片失败');
          return;
        }
        
        const testFile = new File([blob], 'test.png', { type: 'image/png' });
        
        // 使用 API 路由上传
        const formData = new FormData();
        formData.append('file', testFile);
        
        try {
          const response = await fetch('/api/upload-image', {
            method: 'POST',
            body: formData,
          });
          
          const result = await response.json() as { success?: boolean; error?: string };
          
          setTestResults(prev => ({
            ...prev,
            upload: result
          }));
          
          setUploadStatus(result.success ? '上传测试成功' : `上传测试失败: ${result.error}`);
        } catch (error) {
          setUploadStatus(`上传测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
      }, 'image/png');
      
    } catch (error) {
      setUploadStatus(`上传测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const checkDatabaseRecords = async () => {
    try {
      setDbLoading(true);
      const response = await fetch('/api/debug-db-records');
      const result = await response.json() as { success: boolean; data?: any[]; error?: string };
      if (result.success) {
        setDbRecords(result.data || []);
      } else {
        console.error('获取数据库记录失败:', result.error);
      }
    } catch (error) {
      console.error('检查数据库记录失败:', error);
    } finally {
      setDbLoading(false);
    }
  };

  const fixVideoRecords = async () => {
    try {
      setDbLoading(true);
      const response = await fetch('/api/debug-fix-video-records');
      const result = await response.json() as { success: boolean; data?: any; error?: string };
      if (result.success) {
        console.log('修复结果:', result.data);
        // 重新获取记录
        await checkDatabaseRecords();
      } else {
        console.error('修复视频记录失败:', result.error);
      }
    } catch (error) {
      console.error('修复视频记录失败:', error);
    } finally {
      setDbLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">调试页面</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">环境变量检查</h2>
          <div className="bg-gray-100 p-4 rounded">
            <p>客户端环境变量:</p>
            <p>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '已设置' : '未设置'}</p>
            <p>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已设置' : '未设置'}</p>
            <p>SUPABASE_SERVICE_ROLE_KEY: {process.env.SUPABASE_SERVICE_ROLE_KEY ? '已设置' : '未设置'}</p>
            
            {Object.keys(serverEnv).length > 0 && (
              <>
                <p className="mt-4">服务器端环境变量:</p>
                <p>NEXT_PUBLIC_SUPABASE_URL: {serverEnv.supabaseUrl}</p>
                <p>NEXT_PUBLIC_SUPABASE_ANON_KEY: {serverEnv.supabaseAnonKey}</p>
                <p>SUPABASE_SERVICE_ROLE_KEY: {serverEnv.supabaseServiceKey}</p>
                <p>NODE_ENV: {serverEnv.nodeEnv}</p>
              </>
            )}
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">测试功能</h2>
          <div className="space-y-2">
            <Button onClick={checkServerEnv} color="primary">
              检查服务器环境变量
            </Button>
            <Button onClick={testSupabaseConnection} color="secondary">
              测试 Supabase 连接
            </Button>
            <Button onClick={testFileUpload} color="warning">
              测试文件上传
            </Button>
          </div>
        </div>
      
        <div>
          <h2 className="text-lg font-semibold mb-2">状态</h2>
        <div className="bg-gray-100 p-4 rounded">
            <p>{uploadStatus || '等待测试...'}</p>
          </div>
        </div>
      
        <div>
          <h2 className="text-lg font-semibold mb-2">测试结果</h2>
          <div className="bg-gray-100 p-4 rounded">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(testResults, null, 2)}
          </pre>
          </div>
        </div>

        {/* 数据库记录检查 */}
        <div>
          <h2 className="text-lg font-semibold mb-2">数据库记录检查</h2>
          <div className="flex gap-2 mb-4">
            <Button
              color="primary"
              variant="flat"
              onPress={checkDatabaseRecords}
              isLoading={dbLoading}
            >
              查看数据库记录
            </Button>
            <Button
              color="secondary"
              variant="flat"
              onPress={fixVideoRecords}
              isLoading={dbLoading}
            >
              修复视频记录
            </Button>
          </div>
          
          {dbRecords.length > 0 && (
            <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
              <h3 className="font-semibold mb-2">image_edit_results 记录:</h3>
              {dbRecords.map((record, index) => (
                <div key={index} className="mb-4 p-3 bg-white rounded border">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><strong>ID:</strong> {record.id}</div>
                    <div><strong>类型:</strong> {record.result_type}</div>
                    <div><strong>状态:</strong> {record.status}</div>
                    <div><strong>创建时间:</strong> {new Date(record.created_at).toLocaleString()}</div>
                    <div><strong>视频URL:</strong> {record.video_result_url || '无'}</div>
                    <div><strong>表情包URL:</strong> {record.emoji_result_url || '无'}</div>
                    <div><strong>对口型URL:</strong> {record.liveportrait_result_url || '无'}</div>
                    <div><strong>图片URL:</strong> {record.result_image_url?.length > 0 ? record.result_image_url[0] : '无'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 