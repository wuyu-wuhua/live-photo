/**
 * 图片处理工具函数
 */

/**
 * 压缩图片到指定大小
 */
export async function compressImage(
  imageBuffer: ArrayBuffer,
  maxSizeInMB: number = 2
): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('无法创建canvas上下文'));
      return;
    }

    const img = new Image();
    img.onload = () => {
      // 计算压缩比例
      const originalSize = imageBuffer.byteLength / (1024 * 1024);
      let quality = 0.8;
      
      if (originalSize > maxSizeInMB) {
        quality = Math.max(0.1, maxSizeInMB / originalSize);
      }

      // 设置canvas尺寸
      canvas.width = img.width;
      canvas.height = img.height;

      // 绘制图片
      ctx.drawImage(img, 0, 0);

      // 转换为blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            blob.arrayBuffer().then(resolve).catch(reject);
          } else {
            reject(new Error('图片压缩失败'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => reject(new Error('图片加载失败'));
    
    const blob = new Blob([imageBuffer]);
    img.src = URL.createObjectURL(blob);
  });
}

/**
 * 检查图片大小是否合适
 */
export function isImageSizeSuitable(imageBuffer: ArrayBuffer, maxSizeInMB: number = 5): boolean {
  const sizeInMB = imageBuffer.byteLength / (1024 * 1024);
  return sizeInMB <= maxSizeInMB;
}

/**
 * 获取图片信息
 */
export function getImageInfo(imageBuffer: ArrayBuffer): {
  sizeInBytes: number;
  sizeInMB: number;
  sizeInKB: number;
} {
  const sizeInBytes = imageBuffer.byteLength;
  const sizeInKB = sizeInBytes / 1024;
  const sizeInMB = sizeInKB / 1024;
  
  return {
    sizeInBytes,
    sizeInKB,
    sizeInMB
  };
} 