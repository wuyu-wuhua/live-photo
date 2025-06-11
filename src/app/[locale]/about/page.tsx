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
// import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function AboutPage() {
  // const t = useTranslations('common');

  const features = [
    {
      title: 'AI Image Colorization',
      description: 'Transform black and white photos into vibrant, realistic colorized images using our advanced AI technology.',
      icon: <Palette className="w-8 h-8 text-blue-500" />,
    },
    {
      title: 'Smart Editing',
      description: 'Edit and enhance your images with AI-powered tools for removing watermarks, expanding images, and more.',
      icon: <Wand2 className="w-8 h-8 text-purple-500" />,
    },
    {
      title: 'Video Animation',
      description: 'Bring your still images to life with facial animation and lip-sync technology.',
      icon: <Film className="w-8 h-8 text-pink-500" />,
    },
    {
      title: 'Emoji Effects',
      description: 'Create fun emoji animations from your portraits with our specialized AI technology.',
      icon: <Sparkles className="w-8 h-8 text-yellow-500" />,
    },
  ];

  const teamMembers = [
    {
      name: 'Alex Thompson',
      role: 'Founder & CEO',
      bio: 'Computer vision expert with 10+ years of experience in AI and machine learning.',
      image: '/assets/image/placeholder-avatar.png',
    },
    {
      name: 'Sophia Chen',
      role: 'Chief Technology Officer',
      bio: 'PhD in Computer Science, specialized in deep learning and neural networks.',
      image: '/assets/image/placeholder-avatar.png',
    },
    {
      name: 'Marcus Johnson',
      role: 'Lead AI Engineer',
      bio: 'Former research scientist at OpenAI with expertise in generative models.',
      image: '/assets/image/placeholder-avatar.png',
    },
    {
      name: 'Emma Rodriguez',
      role: 'Product Manager',
      bio: 'Passionate about creating intuitive user experiences for advanced technology.',
      image: '/assets/image/placeholder-avatar.png',
    },
  ];

  const faqs = [
    {
      question: 'How does the AI colorization work?',
      answer: 'Our AI uses deep learning algorithms trained on millions of color images to intelligently analyze black and white photos and predict realistic colors. It recognizes objects, lighting conditions, and contextual information to apply appropriate colors to different parts of the image.',
    },
    {
      question: 'What image formats are supported?',
      answer: 'We support JPG, PNG, and WEBP formats. Images should be less than 10MB in size for optimal processing.',
    },
    {
      question: 'How many credits do I need for different features?',
      answer: 'Image colorization requires 1 credit per image. Video animations require 12-15 credits depending on the complexity. You can check the exact credit costs on our pricing page.',
    },
    {
      question: 'Can I get a refund if I\'m not satisfied?',
      answer: 'If you\'re not satisfied with the results, please contact our support team. We offer refunds for failed generations, and our team will review other requests on a case-by-case basis.',
    },
    {
      question: 'How is my data handled?',
      answer: 'We prioritize your privacy. Your images are processed securely and not used for training our AI without explicit consent. For more details, please refer to our Privacy Policy.',
    },
  ];

  return (
    <div className="container mx-auto py-12 px-4">
      {/* Hero Section */}
      <section className="mb-16 text-center">
        <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
          <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            About SmartPhoto
          </span>
        </h1>
        <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-600 dark:text-gray-300">
          SmartPhoto is an AI-powered platform for image editing and animation,
          designed to help you bring your photos to life with state-of-the-art technology.
        </p>
        <div className="flex justify-center gap-4">
          <Button
            as={Link}
            href="/generate"
            color="primary"
            radius="full"
            size="lg"
          >
            Try It Now
          </Button>
          <Button
            as={Link}
            href="/pricing"
            variant="bordered"
            radius="full"
            size="lg"
          >
            View Pricing
          </Button>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="mb-16 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-8 rounded-3xl">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-3xl font-bold">Our Mission</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            At SmartPhoto, we're on a mission to democratize advanced image editing technology.
            We believe that everyone should have access to powerful AI tools that can transform
            their photos and preserve memories in new and exciting ways. By combining cutting-edge
            research with intuitive design, we're making professional-grade image enhancement
            accessible to all.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="mb-16">
        <h2 className="mb-12 text-center text-3xl font-bold">Our Features</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card key={index} className="border-none">
              <CardHeader className="flex items-center pb-2">
                <div className="rounded-full bg-primary-50 p-3 dark:bg-primary-900/20">
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
        <h2 className="mb-12 text-center text-3xl font-bold">Meet Our Team</h2>
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
        <h2 className="mb-8 text-center text-3xl font-bold">Frequently Asked Questions</h2>
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
          <h2 className="mb-8 text-center text-3xl font-bold">Contact Us</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="mb-4 text-xl font-semibold">Get In Touch</h3>
              <p className="mb-6 text-gray-600 dark:text-gray-300">
                Have questions or feedback? We'd love to hear from you. Our team is always
                ready to assist with any inquiries about our services.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <span>support@smartphoto.example.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <span>+1 (555) 123-4567</span>
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
              <h3 className="mb-4 text-xl font-semibold">Business Hours</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Monday - Friday:</span>
                  <span>9:00 AM - 6:00 PM PST</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday:</span>
                  <span>10:00 AM - 4:00 PM PST</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday:</span>
                  <span>Closed</span>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-gray-600 dark:text-gray-300">
                  Support tickets are monitored 24/7, and our team will respond
                  as soon as possible, even outside business hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center">
        <h2 className="mb-6 text-3xl font-bold">Ready to transform your photos?</h2>
        <p className="mx-auto mb-8 max-w-2xl text-gray-600 dark:text-gray-300">
          Join thousands of satisfied users who are already bringing their photos to life with SmartPhoto.
        </p>
        <Button
          as={Link}
          href="/generate"
          color="primary"
          radius="full"
          size="lg"
          className="px-8"
        >
          Get Started Now
        </Button>
      </section>
    </div>
  );
}
