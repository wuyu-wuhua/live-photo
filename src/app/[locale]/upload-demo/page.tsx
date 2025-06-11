'use client';

import type { FileUploadResult } from '@/services/fileUploadService';
import { Button, Card, CardBody, CardHeader, Divider } from '@heroui/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { type FormUploadFile, PictureCardForm } from '@/components/upload/picture-card-form';

export default function UploadDemoPage() {
  const [singleFile, setSingleFile] = useState<FormUploadFile[]>([]);
  const [multipleFiles, setMultipleFiles] = useState<FormUploadFile[]>([]);
  const [uploadResults, setUploadResults] = useState<string[]>([]);

  const handleUploadComplete = (result: FileUploadResult) => {
    if (result.success && result.file) {
      setUploadResults(prev => [
        ...prev,
        `上传成功: ${result.file!.name} (${result.file!.url})`,
      ]);
      toast.success(`上传成功: ${result.file!.name}`);
    }
  };

  const handleUploadError = (error: string, file: File) => {
    setUploadResults(prev => [
      ...prev,
      `上传失败: ${file.name} - ${error}`,
    ]);
    toast.error(`上传失败: ${file.name} - ${error}`);
  };

  const handleRemove = (file: FormUploadFile) => {
    setUploadResults(prev => [
      ...prev,
      `删除文件: ${file.name}`,
    ]);
    toast.info(`删除文件: ${file.name}`);
  };

  const clearResults = () => {
    setUploadResults([]);
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">图片上传表单组件演示</h1>
        <p className="text-default-500 text-lg">
          使用 useFileUpload Hook 封装的图片上传表单组件
        </p>
      </div>

      <div className="space-y-8">
        {/* 单文件上传 */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold">单文件上传</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <PictureCardForm
              value={singleFile}
              onChange={setSingleFile}
              maxCount={1}
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              onRemove={handleRemove}
            />

            <div className="text-sm text-default-500">
              <p>
                当前文件数量:
                {singleFile.length}
              </p>
              {singleFile.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">文件信息:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {singleFile.map(file => (
                      <li key={file.id}>
                        {file.name}
                        {' '}
                        -
                        {file.status}
                        {file.status === 'done' && (
                          <span className="text-green-600 ml-2">✓</span>
                        )}
                        {file.status === 'error' && (
                          <span className="text-red-600 ml-2">
                            ✗
                            {file.error}
                          </span>
                        )}
                        {file.status === 'uploading' && (
                          <span className="text-blue-600 ml-2">
                            上传中...
                            {' '}
                            {file.progress}
                            %
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* 多文件上传 */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold">多文件上传</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <PictureCardForm
              value={multipleFiles}
              onChange={setMultipleFiles}
              maxCount={5}
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              onRemove={handleRemove}
            />

            <div className="text-sm text-default-500">
              <p>
                当前文件数量:
                {multipleFiles.length}
                {' '}
                / 5
              </p>
              {multipleFiles.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">文件列表:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {multipleFiles.map(file => (
                      <li key={file.id}>
                        {file.name}
                        {' '}
                        -
                        {file.status}
                        {file.status === 'done' && (
                          <span className="text-green-600 ml-2">✓</span>
                        )}
                        {file.status === 'error' && (
                          <span className="text-red-600 ml-2">
                            ✗
                            {file.error}
                          </span>
                        )}
                        {file.status === 'uploading' && (
                          <span className="text-blue-600 ml-2">
                            上传中...
                            {' '}
                            {file.progress}
                            %
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* 操作日志 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-2xl font-semibold">操作日志</h2>
            <Button
              size="sm"
              onPress={clearResults}
              isDisabled={uploadResults.length === 0}
            >
              清空日志
            </Button>
          </CardHeader>
          <CardBody>
            {uploadResults.length === 0
              ? (
                  <p className="text-default-500 text-center py-4">
                    暂无操作记录
                  </p>
                )
              : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {uploadResults.map((result, index) => (
                      <div
                        key={index}
                        className={`
                      text-sm p-2 rounded border-l-4
                      ${result.includes('成功')
                        ? 'bg-green-50 border-green-500 text-green-700'
                        : result.includes('失败')
                          ? 'bg-red-50 border-red-500 text-red-700'
                          : 'bg-blue-50 border-blue-500 text-blue-700'
                      }
                    `}
                      >
                        <span className="text-xs text-default-400 mr-2">
                          [
                          {new Date().toLocaleTimeString()}
                          ]
                        </span>
                        {result}
                      </div>
                    ))}
                  </div>
                )}
          </CardBody>
        </Card>

        {/* 使用说明 */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold">使用说明</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="text-sm space-y-2">
              <h3 className="font-medium">组件特性:</h3>
              <ul className="list-disc list-inside space-y-1 text-default-600">
                <li>支持单文件和多文件上传</li>
                <li>使用 useFileUpload Hook 进行文件上传</li>
                <li>支持拖拽上传</li>
                <li>实时显示上传进度</li>
                <li>支持上传失败重试</li>
                <li>自动清理内存中的 blob URLs</li>
                <li>支持图片预览</li>
                <li>完整的错误处理</li>
              </ul>
            </div>

            <Divider />

            <div className="text-sm space-y-2">
              <h3 className="font-medium">支持的文件格式:</h3>
              <p className="text-default-600">
                JPG, JPEG, PNG, GIF, WEBP
              </p>
            </div>

            <Divider />

            <div className="text-sm space-y-2">
              <h3 className="font-medium">主要 Props:</h3>
              <ul className="list-disc list-inside space-y-1 text-default-600">
                <li>
                  <code>value</code>
                  : 受控的文件列表
                </li>
                <li>
                  <code>onChange</code>
                  : 文件列表变化回调
                </li>
                <li>
                  <code>maxCount</code>
                  : 最大文件数量
                </li>
                <li>
                  <code>onUploadComplete</code>
                  : 上传成功回调
                </li>
                <li>
                  <code>onUploadError</code>
                  : 上传失败回调
                </li>
                <li>
                  <code>onRemove</code>
                  : 删除文件回调
                </li>
                <li>
                  <code>disabled</code>
                  : 是否禁用
                </li>
              </ul>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
