'use client';

import { Button } from '@heroui/react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { toast } from 'sonner';

// 示例图片数据
const sampleImages = [
  { alt: 'Sample 1', src: '/assets/image/simple-1.png' },
  { alt: 'Sample 2', src: '/assets/image/simple-2.png' },
  { alt: 'Sample 3', src: '/assets/image/simple-3.png' },
  { alt: 'Sample 4', src: '/assets/image/simple-4.png' },
];

export function HeroSection() {
  const t = useTranslations();
  const [activePhoto, setActivePhoto] = useState<number | null>(null);
  const { user, loading } = useUser();
  const router = useRouter();

  const handleColorizeButtonClick = () => {
    if (loading) {
      return;
    }
    
    if (!user) {
      toast.info('请先登录后再使用照片上色功能');
      router.push('/auth/sign-in');
    } else {
      router.push('/generate');
    }
  };

  return (
    <section className="text-gray-900 text-white dark:bg-black dark:text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 lg:flex-row lg:gap-8">
        {/* 移动端图片展示区域 - 在标题上方 */}
        <div className="md:hidden relative w-full h-[280px] flex items-center justify-center mb-2">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* 原始黑白照片 - 移动端（左侧，稍微倾斜） */}
            <div
              className="absolute z-10 overflow-hidden rounded-xl bg-white shadow-2xl grayscale"
              style={{
                height: '180px',
                left: '20%',
                top: '50%',
                transform: 'translateX(-50%) translateY(-50%) rotate(-6deg)',
                width: '120px',
              }}
            >
              <Image
                alt="Original Black and White Photo"
                className="object-cover"
                fill
                src="/assets/image/original-bw.png"
                priority
              />
            </div>

            {/* 移动端彩色照片堆叠容器 */}
            <div
              className="group absolute flex items-center justify-center transition-all duration-500"
              style={{
                height: '200px',
                left: '75%',
                top: '50%',
                transform: 'translateX(-50%) translateY(-50%)',
                width: '240px',
              }}
              onMouseLeave={() => setActivePhoto(null)}
            >
              {/* 彩色照片1 - 左侧 */}
              <button
                type="button"
                className={`absolute overflow-hidden rounded-xl bg-white shadow-xl transition-transform duration-300 cursor-pointer ${
                  activePhoto === 0 ? 'scale-[1.2] z-10' : activePhoto !== null ? 'translate-x-[-12%] rotate-[-35deg]' : 'group-hover:translate-x-[-12%] group-hover:rotate-[-35deg]'
                }`}
                style={{
                  backfaceVisibility: 'hidden',
                  height: '130px',
                  transform: activePhoto === 0
                    ? 'scale(1.22) translateZ(15px)'
                    : 'translateX(-30px) translateY(10px) rotate(-40deg) translateZ(-30px)',
                  transformOrigin: 'center center',
                  width: '80px',
                  zIndex: activePhoto === 0 ? 10 : 2,
                  boxShadow: activePhoto === 0 ? '0 18px 35px rgba(0,0,0,0.3), 0 12px 12px rgba(0,0,0,0.25)' : '0 8px 20px rgba(0,0,0,0.2)',
                  border: 'none',
                  padding: 0,
                }}
                onClick={() => setActivePhoto(0)}
                aria-label="View colorized photo 1"
              >
                <Image
                  alt="Colorized Photo 1"
                  className="object-cover"
                  fill
                  src="/assets/image/colorized-1.png"
                />
              </button>

              {/* 彩色照片2 - 中间突出 */}
              <button
                type="button"
                className={`absolute overflow-hidden rounded-xl bg-white transition-all duration-300 cursor-pointer ${
                  activePhoto === 1 ? 'scale-[1.2] z-10' : activePhoto !== null ? '' : 'group-hover:scale-[1.15]'
                }`}
                style={{
                  backfaceVisibility: 'hidden',
                  boxShadow: '0 18px 35px rgba(0,0,0,0.3), 0 12px 12px rgba(0,0,0,0.25)',
                  height: '160px',
                  transform: activePhoto === 1 || (activePhoto === null)
                    ? 'scale(1.22) translateZ(15px)'
                    : 'translateZ(0)',
                  transformOrigin: 'center center',
                  width: '100px',
                  zIndex: activePhoto === 1 ? 10 : (activePhoto === null ? 3 : 1),
                  border: 'none',
                  padding: 0,
                }}
                onClick={() => setActivePhoto(1)}
                aria-label="View colorized photo 2"
              >
                <Image
                  alt="Colorized Photo 2"
                  className="object-cover"
                  fill
                  src="/assets/image/colorized-2.png"
                />
              </button>

              {/* 彩色照片3 - 右侧 */}
              <button
                type="button"
                className={`absolute overflow-hidden rounded-xl bg-white shadow-xl transition-transform duration-300 cursor-pointer ${
                  activePhoto === 2 ? 'scale-[1.2] z-10' : activePhoto !== null ? 'translate-x-[12%] rotate-[35deg]' : 'group-hover:translate-x-[12%] group-hover:rotate-[35deg]'
                }`}
                style={{
                  backfaceVisibility: 'hidden',
                  height: '130px',
                  transform: activePhoto === 2
                    ? 'scale(1.22) translateZ(15px)'
                    : 'translateX(30px) translateY(10px) rotate(40deg) translateZ(-30px)',
                  transformOrigin: 'center center',
                  width: '80px',
                  zIndex: activePhoto === 2 ? 10 : 2,
                  boxShadow: activePhoto === 2 ? '0 18px 35px rgba(0,0,0,0.3), 0 12px 12px rgba(0,0,0,0.25)' : '0 8px 20px rgba(0,0,0,0.2)',
                  border: 'none',
                  padding: 0,
                }}
                onClick={() => setActivePhoto(2)}
                aria-label="View colorized photo 3"
              >
                <Image
                  alt="Colorized Photo 3"
                  className="object-cover"
                  fill
                  src="/assets/image/colorized-3.png"
                />
              </button>
            </div>
          </div>
        </div>

        {/* 桌面端图片展示区域 */}
        <div className="hidden md:block relative flex h-[555px] flex-[1.2] items-center justify-center">
          <div className="image-showcase relative flex h-full w-full items-center justify-center">
            {/* 桌面端复杂显示 */}
            <div>
              {/* 原始黑白照片 */}
              <div
                className="absolute z-10 overflow-hidden rounded-xl bg-white shadow-2xl grayscale"
                style={{
                  height: 'clamp(220px, 25vw, 352px)',
                  left: '20%',
                  top: '50%',
                  transform: 'translateX(-50%) translateY(-50%) rotate(-6deg)',
                  width: 'clamp(140px, 16vw, 224px)',
                }}
              >
                <Image
                  alt="Original Black and White Photo"
                  className="object-cover"
                  fill
                  src="/assets/image/original-bw.png"
                />
              </div>

              {/* 彩色照片堆叠容器 */}
              <div
                className="group absolute flex items-center justify-center transition-all duration-500 hover:scale-103"
                style={{
                  height: 'clamp(232px, 26.1vw, 387px)',
                  left: '75%',
                  perspective: '1800px',
                  top: '50%',
                  transform: 'translateX(-50%) translateY(-50%)',
                  width: 'clamp(350px, 40vw, 500px)',
                }}
                onMouseLeave={() => setActivePhoto(null)}
              >
                {/* 彩色照片1 - 左侧 */}
                <button
                  type="button"
                  className={`absolute overflow-hidden rounded-xl bg-white shadow-xl transition-transform duration-300 cursor-pointer ${
                    activePhoto === 0 ? 'scale-[1.2] z-10' : activePhoto !== null ? 'translate-x-[-12%] rotate-[-35deg]' : 'group-hover:translate-x-[-12%] group-hover:rotate-[-35deg]'
                  }`}
                  style={{
                    backfaceVisibility: 'hidden',
                    height: 'clamp(186px, 21vw, 310px)',
                    transform: activePhoto === 0
                      ? 'scale(1.22) translateZ(clamp(15px, 1.8vw, 25px))'
                      : 'translateX(clamp(-75px, -8.5vw, -115px)) translateY(clamp(10px, 1.2vw, 20px)) rotate(-40deg) translateZ(clamp(-50px, -6vw, -85px))',
                    transformOrigin: 'center center',
                    width: 'clamp(120px, 13.5vw, 200px)',
                    zIndex: activePhoto === 0 ? 10 : 2,
                    boxShadow: activePhoto === 0 ? '0 18px 35px rgba(0,0,0,0.3), 0 12px 12px rgba(0,0,0,0.25)' : '',
                    border: 'none',
                    padding: 0,
                  }}
                  onClick={() => setActivePhoto(0)}
                  aria-label="View colorized photo 1"
                >
                  <Image
                    alt="Colorized Photo 1"
                    className="object-cover"
                    fill
                    src="/assets/image/colorized-1.png"
                  />
                </button>

                {/* 彩色照片2 - 中间突出 */}
                <button
                  type="button"
                  className={`absolute overflow-hidden rounded-xl bg-white transition-all duration-300 cursor-pointer ${
                    activePhoto === 1 ? 'scale-[1.2] z-10' : activePhoto !== null ? '' : 'group-hover:scale-[1.15]'
                  }`}
                  style={{
                    backfaceVisibility: 'hidden',
                    boxShadow: '0 18px 35px rgba(0,0,0,0.3), 0 12px 12px rgba(0,0,0,0.25)',
                    height: 'clamp(186px, 21vw, 310px)',
                    transform: activePhoto === 1 || (activePhoto === null)
                      ? 'scale(1.22) translateZ(clamp(15px, 1.8vw, 25px))'
                      : 'translateZ(0)',
                    transformOrigin: 'center center',
                    width: 'clamp(120px, 13.5vw, 200px)',
                    zIndex: activePhoto === 1 ? 10 : (activePhoto === null ? 3 : 1),
                    border: 'none',
                    padding: 0,
                  }}
                  onClick={() => setActivePhoto(1)}
                  aria-label="View colorized photo 2"
                >
                  <Image
                    alt="Colorized Photo 2"
                    className="object-cover"
                    fill
                    src="/assets/image/colorized-2.png"
                  />
                </button>

                {/* 彩色照片3 - 右侧 */}
                <button
                  type="button"
                  className={`absolute overflow-hidden rounded-xl bg-white shadow-xl transition-transform duration-300 cursor-pointer ${
                    activePhoto === 2 ? 'scale-[1.2] z-10' : activePhoto !== null ? 'translate-x-[12%] rotate-[35deg]' : 'group-hover:translate-x-[12%] group-hover:rotate-[35deg]'
                  }`}
                  style={{
                    backfaceVisibility: 'hidden',
                    height: 'clamp(186px, 21vw, 310px)',
                    transform: activePhoto === 2
                      ? 'scale(1.22) translateZ(clamp(15px, 1.8vw, 25px))'
                      : 'translateX(clamp(75px, 8.5vw, 115px)) translateY(clamp(10px, 1.2vw, 20px)) rotate(40deg) translateZ(clamp(-50px, -6vw, -85px))',
                    transformOrigin: 'center center',
                    width: 'clamp(120px, 13.5vw, 200px)',
                    zIndex: activePhoto === 2 ? 10 : 2,
                    boxShadow: activePhoto === 2 ? '0 18px 35px rgba(0,0,0,0.3), 0 12px 12px rgba(0,0,0,0.25)' : '',
                    border: 'none',
                    padding: 0,
                  }}
                  onClick={() => setActivePhoto(2)}
                  aria-label="View colorized photo 3"
                >
                  <Image
                    alt="Colorized Photo 3"
                    className="object-cover"
                    fill
                    src="/assets/image/colorized-3.png"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 文字内容区域 */}
        <div className="mx-auto flex max-w-md flex-[0.8] flex-col items-center justify-center gap-4 text-center lg:mx-0 lg:-translate-x-4 lg:transform">
          <h1 className="animate-gradient-x bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-3xl leading-tight font-bold text-transparent md:text-4xl lg:text-5xl">
            {t('common.heroTitle')}
          </h1>
          <p className="max-w-sm text-base text-gray-600 md:text-lg dark:text-gray-300">
            {t('common.heroDescription')}
          </p>
          <div className="my-1 flex items-center gap-2">
            <div className="flex text-yellow-400">
              <span>★★★★★</span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {t('common.rating')}
            </span>
          </div>
          <Button
            className="px-12 py-4 text-lg font-semibold"
            color="primary"
            radius="full"
            size="lg"
            onPress={handleColorizeButtonClick}
            isDisabled={loading}
          >
            {t('common.colorizePhoto')}
          </Button>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {t('common.sampleText')}
          </p>
          <div className="flex space-x-3">
            {sampleImages.map(item => (
              <button
                type="button"
                className="h-16 w-16 cursor-pointer overflow-hidden rounded-lg border border-default-200 transition-transform duration-200 hover:scale-110 hover:border-primary dark:border-default-100"
                key={item.src}
                aria-label={`View sample ${item.alt}`}
                style={{ border: 'none', padding: 0 }}
              >
                <Image
                  alt={item.alt}
                  className="h-full w-full object-cover"
                  height={80}
                  src={item.src}
                  width={80}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}