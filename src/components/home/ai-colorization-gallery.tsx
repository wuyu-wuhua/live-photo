'use client';

import { Card } from '@heroui/react';
import { useTranslations } from 'next-intl';

import Image from 'next/image';
// 效果展示图片
const effectImages = [
  '/assets/image/effect-1.png',
  '/assets/image/effect-2.png',
  '/assets/image/effect-3.png',
  '/assets/image/effect-4.png',
  '/assets/image/effect-5.png',
  '/assets/image/effect-6.png',
];

export function AIColorizationGallery() {
  const t = useTranslations('common');

  return (
    <section className="py-20">
      <div className="mx-auto px-4">
        <div className="space-y-12 text-center">
          <div className="space-y-4">
            <h2
              className={`
                text-3xl font-bold text-foreground
                lg:text-4xl
              `}
            >
              {t('newGenerationAI')}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              {t('yearsOfResearch')}
            </p>
          </div>

          {/* Gallery Grid */}
          <div className="mx-auto max-w-6xl">
            <div
              className={`
                grid grid-cols-1 gap-6
                sm:grid-cols-2
                lg:grid-cols-3
              `}
            >
              {effectImages.map((image, index) => (
                <Card
                  className={`
                    overflow-hidden transition-all duration-300
                    hover:shadow-xl
                  `}
                  isPressable
                  key={index}
                >
                  <Image
                    alt={`Effect ${index + 1}`}
                    className={`
                        h-auto w-full object-cover transition-transform
                        duration-300
                        hover:scale-105
                      `}
                    height={250}
                    src={image}
                    width={200}
                  />
                  {/* <CardBody className="p-0">
                    <Image
                      alt={`Effect ${index + 1}`}
                      className={`
                        h-auto w-full object-cover transition-transform
                        duration-300
                        hover:scale-105
                      `}
                      height={250}
                      src={image}
                      width={200}
                    />
                  </CardBody> */}
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
