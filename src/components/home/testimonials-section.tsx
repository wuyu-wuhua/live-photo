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
    text: 'I\'m at a loss for words. This is amazing. I love it. The color is so vivid and the details are incredible!',
  },
  {
    author: {
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      handle: '@jack',
      name: 'Jack',
    },
    text: 'I\'ve never seen anything like this before. It\'s amazing. I love it.',
  },
  {
    author: {
      avatar:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
      handle: '@jill',
      name: 'Jill',
    },
    text: 'I don\'t know what to say. I\'m speechless.',
  },
  {
    author: {
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      handle: '@james',
      image: '/assets/image/user-work-2.png',
      name: 'James',
    },
    text: 'I\'m at a loss for words. This is amazing. I love it.',
  },
  {
    author: {
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
      handle: '@jane',
      name: 'Jane',
    },
    text: 'Love the results! Highly recommended. My family is amazed by the transformation.',
  },
  {
    author: {
      avatar: 'linear-gradient(135deg,#f953c6,#b91d73)',
      handle: '@tom',
      image: '/assets/image/user-work-3.png',
      name: 'Tom',
    },
    text: 'This is incredible! The AI colorization brought my old family photos back to life.',
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

  return (
    <section className="bg-muted/50">
      {/* First Row - Scrolling Left */}
      <div className="relative overflow-hidden">
        <TestimonialsSection
          className="py-0"
          description="Don't just take our word for it - hear from our satisfied customers"
          testimonials={testimonials}
          title={t('common.trustedByPhotographers')}
        />
      </div>
    </section>
  );
}
