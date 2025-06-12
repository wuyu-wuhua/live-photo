'use client';

import { Card, CardBody } from '@heroui/react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

// 对比图片数据
const beforeAfterImages = [
  {
    after: '/assets/image/after-1.png',
    alt: 'Comparison 1',
    before: '/assets/image/before-1.png',
  },
  {
    after: '/assets/image/after-2.png',
    alt: 'Comparison 2',
    before: '/assets/image/before-2.png',
    hasNewPalette: true,
  },
  {
    after: '/assets/image/after-3.png',
    alt: 'Comparison 3',
    before: '/assets/image/before-3.png',
  },
  {
    after: '/assets/image/after-4.png',
    alt: 'Comparison 4',
    before: '/assets/image/before-4.png',
    hasNewPalette: true,
  },
  {
    after: '/assets/image/after-5.png',
    alt: 'Comparison 5',
    before: '/assets/image/before-5.png',
    hasNewPalette: true,
  },
];

export function ExperienceDifferenceSection() {
  const t = useTranslations();
  const [api, setApi] = useState<CarouselApi>();
  const [isPaused, setIsPaused] = useState(false);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 自动滚动功能
  useEffect(() => {
    if (!api) {
      return;
    }

    const startAutoScroll = () => {
      autoScrollIntervalRef.current = setInterval(() => {
        if (!isPaused) {
          api.scrollNext();
        }
      }, 3000); // 每3秒滚动一次
    };

    startAutoScroll();

    // 组件卸载时清除定时器
    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, [api, isPaused]);

  // 设置循环滚动
  useEffect(() => {
    if (!api) {
      return;
    }

    // 设置循环滚动
    api.on('select', () => {
      // 如果到达最后一个，自动回到第一个
      if (api.selectedScrollSnap() === api.scrollSnapList().length - 1) {
        // 使用setTimeout避免立即滚动造成的视觉跳跃
        setTimeout(() => {
          api.scrollTo(0, false);
        }, 500);
      }
    });

    return () => {
      api.off('select', () => {});
    };
  }, [api]);

  // 鼠标悬停处理函数
  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  return (
    <section className="py-20">
      <div className="container-fluid px-0 mx-auto">
        <div className="space-y-8 text-center">
          <h2
            className={`
              text-3xl font-bold text-foreground
              lg:text-4xl
            `}
          >
            {t('common.experienceTheDifference')}
          </h2>

          {/* Category Buttons */}
          {/* <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category, index) => (
              <Button
                className="capitalize"
                key={category}
                onClick={() => setActiveCategory(index)}
                variant={activeCategory === index ? 'default' : 'outline'}
              >
                {t(`common.${category}`)}
              </Button>
            ))}
          </div> */}

          {/* Before/After Slider */}
          <div
            className="relative w-full"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
            <Carousel
              setApi={setApi}
              opts={{
                align: 'center',
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="px-4">
                {beforeAfterImages.map((item, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <Card
                      className={`
                        relative transition-all duration-300
                        hover:z-10 hover:scale-105
                      `}
                    >
                      <CardBody className="p-2">
                        <div
                          className={`
                            grid grid-cols-2 gap-0 overflow-hidden rounded-xl
                          `}
                        >
                          <div className="relative">
                            <div
                              className={`
                                absolute top-2 left-2 z-10 rounded bg-black/70
                                px-2 py-1 text-xs font-semibold text-white
                              `}
                            >
                              {t('common.before')}
                            </div>
                            <Image
                              alt={`${item.alt} Before`}
                              className=""
                              height={300}
                              src={item.before}
                              width={250}
                            />
                          </div>
                          <div className="relative">
                            <div
                              className={`
                                absolute top-2 left-2 z-10 rounded bg-black/70
                                px-2 py-1 text-xs font-semibold text-white
                              `}
                            >
                              {t('common.after')}
                            </div>
                            <Image
                              alt={`${item.alt} After`}
                              className=""
                              height={300}
                              src={item.after}
                              width={250}
                            />
                            {/* {item.hasNewPalette && (
                              <Button
                                className="absolute right-2 bottom-2 text-xs"
                                variant="secondary"
                                size="sm"
                              >
                                {t('common.newPalette')}
                                {' '}
                                <span className="ml-1">🪄</span>
                              </Button>
                            )} */}
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden sm:block">
                <CarouselPrevious className="left-2 lg:left-6 bg-white/80 hover:bg-white" />
                <CarouselNext className="right-2 lg:right-6 bg-white/80 hover:bg-white" />
              </div>
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
}
