'use client';

import { useTranslations } from 'next-intl';
import { TestimonialsSection } from '../testimonials/testimonials-with-marquee';

// 用户评价数据
const testimonials = [
  {
    author: {
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
      handle: '@john',
      name: 'John',
    },
    text: 'testimonials.testimonial4.text',
  },
  {
    author: {
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      handle: '@jack',
      name: 'Jack',
    },
    text: 'testimonials.testimonial5.text',
  },
  {
    author: {
      avatar:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
      handle: '@jill',
      name: 'Jill',
    },
    text: 'testimonials.testimonial6.text',
  },
  {
    author: {
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      handle: '@james',
      image: '/assets/image/user-work-2.png',
      name: 'James',
    },
    text: 'testimonials.testimonial1.text',
  },
  {
    author: {
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
      handle: '@jane',
      name: 'Jane',
    },
    text: 'testimonials.testimonial2.text',
  },
  {
    author: {
      avatar: 'linear-gradient(135deg,#f953c6,#b91d73)',
      handle: '@tom',
      image: '/assets/image/user-work-3.png',
      name: 'Tom',
    },
    text: 'testimonials.testimonial3.text',
  },
  // {
  //   author: {
  //     avatar: "linear-gradient(135deg,#667eea,#764ba2)",
  //     handle: "@sarah",
  //     name: "Sarah",
  //   },
  //   text: "Amazing technology! The results exceeded my expectations.",
  // },
  // {
  //   author: {
  //     avatar: "linear-gradient(135deg,#ff9a9e,#fecfef)",
  //     handle: "@mike",
  //     name: "Mike",
  //   },
  //   text: "Professional quality results. Highly recommend this service!",
  // },
];

export function HomeTestimonialsSection() {
  const t = useTranslations();

  // 将翻译键转换为实际文本
  const translatedTestimonials = testimonials.map(testimonial => ({
    ...testimonial,
    text: t(testimonial.text)
  }));

  return (
    <section className="bg-muted/50">
      {/* First Row - Scrolling Left */}
      <div className="relative overflow-hidden">
        <TestimonialsSection
          className="py-0"
          description={t('testimonials.subtitle')}
          testimonials={translatedTestimonials}
          title={t('testimonials.title')}
        />
      </div>
    </section>
  );
}
