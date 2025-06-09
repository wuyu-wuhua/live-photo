'use client';

import { Button, Card, CardBody } from '@heroui/react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';

// 分类数据
const categories = ['light', 'flowers', 'interior', 'history', 'clothes'];

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
  const [activeCategory, setActiveCategory] = useState(0);
  const [activeSlide, setActiveSlide] = useState(1);

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
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
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category, index) => (
              <Button
                className="capitalize"
                key={category}
                onClick={() => setActiveCategory(index)}
                variant={activeCategory === index ? 'solid' : 'bordered'}
              >
                {t(`common.${category}`)}
              </Button>
            ))}
          </div>

          {/* Before/After Slider */}
          <div className="relative overflow-hidden">
            <div className="flex justify-center">
              <div
                className="flex space-x-6 transition-transform duration-300"
              >
                {beforeAfterImages.map((item, index) => {
                  const isActive = index === activeSlide;
                  const isFaded = Math.abs(index - activeSlide) > 1;

                  return (
                    <Card
                      className={`
                        relative flex-shrink-0 transition-all duration-300
                        hover:z-10 hover:scale-105
                        ${
                    isActive
                      ? 'z-[5] scale-100 opacity-100'
                      : isFaded
                        ? `scale-90 opacity-30`
                        : `scale-95 opacity-70`
                    }
                      `}
                      key={index}
                    >
                      <CardBody className="p-0">
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
                              height={250}
                              src={item.before}
                              width={200}
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
                              height={250}
                              src={item.after}
                              width={200}
                            />
                            {item.hasNewPalette && (
                              <Button
                                className="absolute right-2 bottom-2 text-xs"
                                color="secondary"
                                size="sm"
                              >
                                {t('common.newPalette')}
                                {' '}
                                <span className="ml-1">🪄</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Navigation Arrows */}
            <Button
              className="absolute top-1/2 left-4 -translate-y-1/2 transform"
              disabled={activeSlide === 0}
              isIconOnly
              onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))}
              size="sm"
              variant="bordered"
            >
              ←
            </Button>
            <Button
              className="absolute top-1/2 right-4 -translate-y-1/2 transform"
              disabled={activeSlide === beforeAfterImages.length - 1}
              isIconOnly
              onClick={() =>
                setActiveSlide(
                  Math.min(beforeAfterImages.length - 1, activeSlide + 1),
                )}
              size="sm"
              variant="bordered"
            >
              →
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
