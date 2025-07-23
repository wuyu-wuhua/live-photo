'use client';

import { Accordion, AccordionItem, Button, Card, CardBody, CardHeader, Link } from '@heroui/react';
import {
  Facebook,
  Film,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Palette,
  Phone,
  Sparkles,
  Twitter,
  Wand2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function AboutPage() {
  const t = useTranslations('about');

  const features = [
    {
      title: t('features.aiColorization.title'),
      description: t('features.aiColorization.description'),
      icon: <Palette className="w-8 h-8 text-blue-500" />,
    },
    {
      title: t('features.smartEditing.title'),
      description: t('features.smartEditing.description'),
      icon: <Wand2 className="w-8 h-8 text-purple-500" />,
    },
    {
      title: t('features.videoAnimation.title'),
      description: t('features.videoAnimation.description'),
      icon: <Film className="w-8 h-8 text-pink-500" />,
    },
    {
      title: t('features.emojiEffects.title'),
      description: t('features.emojiEffects.description'),
      icon: <Sparkles className="w-8 h-8 text-yellow-500" />,
    },
  ];

  const teamMembers = [
    {
      name: t('team.alex.name'),
      role: t('team.alex.role'),
      bio: t('team.alex.bio'),
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    {
      name: t('team.sophia.name'),
      role: t('team.sophia.role'),
      bio: t('team.sophia.bio'),
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    {
      name: t('team.marcus.name'),
      role: t('team.marcus.role'),
      bio: t('team.marcus.bio'),
      image: 'https://randomuser.me/api/portraits/men/65.jpg',
    },
    {
      name: t('team.emma.name'),
      role: t('team.emma.role'),
      bio: t('team.emma.bio'),
      image: 'https://randomuser.me/api/portraits/women/68.jpg',
    },
  ];

  const faqs = [
    {
      question: t('faq.colorization.question'),
      answer: t('faq.colorization.answer'),
    },
    {
      question: t('faq.formats.question'),
      answer: t('faq.formats.answer'),
    },
    {
      question: t('faq.credits.question'),
      answer: t('faq.credits.answer'),
    },
    {
      question: t('faq.refund.question'),
      answer: t('faq.refund.answer'),
    },
    {
      question: t('faq.privacy.question'),
      answer: t('faq.privacy.answer'),
    },
  ];

  return (
    <div className="container mx-auto py-12 px-4">
      {/* Hero Section */}
      <section className="mb-16 text-center">
        <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
          <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            {t('title')}
          </span>
        </h1>
        <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-600 dark:text-gray-300">
          {t('subtitle')}
        </p>
        <div className="flex justify-center gap-4">
          <Button
            as={Link}
            href="/generate"
            color="primary"
            radius="full"
            size="lg"
          >
            {t('tryItNow')}
          </Button>
          <Button
            as={Link}
            href="/pricing"
            variant="bordered"
            radius="full"
            size="lg"
          >
            {t('viewPricing')}
          </Button>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="mb-16 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-8 rounded-3xl">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-3xl font-bold">{t('mission.title')}</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            {t('mission.description')}
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="mb-16">
        <h2 className="mb-12 text-center text-3xl font-bold">{t('features.title')}</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card key={index} className="border-none">
              <CardHeader className="flex flex-col items-center justify-center pb-2">
                <div className="rounded-full bg-primary-50 p-3 dark:bg-primary-900/20 flex items-center justify-center mx-auto">
                  {feature.icon}
                </div>
              </CardHeader>
              <CardBody className="text-center">
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="mb-16">
        <h2 className="mb-12 text-center text-3xl font-bold">{t('team.title')}</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((member, index) => (
            <Card key={index} className="border-none">
              <CardBody className="flex flex-col items-center text-center">
                <div className="mb-4 h-24 w-24 overflow-hidden rounded-full">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="mb-1 text-xl font-semibold">{member.name}</h3>
                <p className="mb-2 text-primary">{member.role}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{member.bio}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mb-16">
        <h2 className="mb-8 text-center text-3xl font-bold">{t('faq.title')}</h2>
        <div className="mx-auto max-w-3xl">
          <Accordion variant="splitted">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} title={faq.question}>
                <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Contact Section */}
      <section className="mb-16">
        <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-r from-blue-50 to-purple-50 p-8 dark:from-blue-900/20 dark:to-purple-900/20">
          <h2 className="mb-8 text-center text-3xl font-bold">{t('contact.title')}</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="mb-4 text-xl font-semibold">{t('contact.getInTouch.title')}</h3>
              <p className="mb-6 text-gray-600 dark:text-gray-300">
                {t('contact.getInTouch.description')}
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <span>q9425916@gmail.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <span>+023 6287 2229</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>123 AI Avenue, San Francisco, CA 94103</span>
                </div>
              </div>
              <div className="mt-6 flex gap-4">
                <Link href="#" aria-label="GitHub">
                  <Github className="h-6 w-6 text-gray-600 hover:text-primary dark:text-gray-400" />
                </Link>
                <Link href="#" aria-label="Twitter">
                  <Twitter className="h-6 w-6 text-gray-600 hover:text-primary dark:text-gray-400" />
                </Link>
                <Link href="#" aria-label="LinkedIn">
                  <Linkedin className="h-6 w-6 text-gray-600 hover:text-primary dark:text-gray-400" />
                </Link>
                <Link href="#" aria-label="Facebook">
                  <Facebook className="h-6 w-6 text-gray-600 hover:text-primary dark:text-gray-400" />
                </Link>
              </div>
            </div>
            <div>
              <h3 className="mb-4 text-xl font-semibold">{t('contact.businessHours.title')}</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{t('contact.businessHours.weekdays')}</span>
                  <span>{t('contact.businessHours.weekdaysTime')}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('contact.businessHours.saturday')}</span>
                  <span>{t('contact.businessHours.saturdayTime')}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('contact.businessHours.sunday')}</span>
                  <span>{t('contact.businessHours.sundayTime')}</span>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-gray-600 dark:text-gray-300">
                  {t('contact.businessHours.supportNote')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center">
        <h2 className="mb-6 text-3xl font-bold">{t('cta.title')}</h2>
        <p className="mx-auto mb-8 max-w-2xl text-gray-600 dark:text-gray-300">
          {t('cta.description')}
        </p>
        <Button
          as={Link}
          href="/generate"
          color="primary"
          radius="full"
          size="lg"
          className="px-8"
        >
          {t('cta.button')}
        </Button>
      </section>
    </div>
  );
}
