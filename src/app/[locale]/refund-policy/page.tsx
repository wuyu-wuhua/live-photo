'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Clock, Shield, XCircle, Mail, CheckCircle} from 'lucide-react';

export default function RefundPolicyPage() {
  const t = useTranslations('refundPolicy');
  const commonT = useTranslations('common');
  
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Back to Home Button */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {commonT('backToHome')}
          </Link>
        </div>

        {/* Hero Section */}
        <section className="mb-16 text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-gradient-to-r from-green-500 to-blue-500 p-4">
              <CreditCard className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              {t('title')}
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-600 dark:text-gray-300">
            {t('subtitle')}
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            最后更新: 2025年1月
          </div>
        </section>

        {/* Content */}
        <div className="space-y-12">
          {/* Policy Overview */}
          <section className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-8 rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-blue-500 p-2">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold">{t('overview.title')}</h2>
            </div>
            <div className="space-y-6">
              <p className="text-lg text-gray-700 dark:text-gray-300">{t('overview.description')}</p>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-lg">{t('overview.timeLimit')}</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">7天</p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-lg">{t('overview.conditions')}</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('overview.conditionsDesc')}</p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <CreditCard className="w-5 h-5 text-orange-600" />
                    <h3 className="font-semibold text-lg">{t('overview.refundMethod')}</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('overview.refundMethodDesc')}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Refund Conditions */}
          <section className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-8 rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-green-500 p-2">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold">{t('conditions.title')}</h2>
            </div>
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('conditions.eligible.title')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('conditions.eligible.description')}</p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('conditions.unused.title')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('conditions.unused.description')}</p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('conditions.technical.title')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('conditions.technical.description')}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Non-Refundable Situations */}
          <section className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-8 rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-red-500 p-2">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold">{t('nonRefundable.title')}</h2>
            </div>
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('nonRefundable.usedCredits.title')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('nonRefundable.usedCredits.description')}</p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('nonRefundable.subscription.title')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('nonRefundable.subscription.description')}</p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('nonRefundable.promotional.title')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('nonRefundable.promotional.description')}</p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('nonRefundable.violation.title')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('nonRefundable.violation.description')}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Refund Process */}
          <section className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-8 rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-purple-500 p-2">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold">{t('process.title')}</h2>
            </div>
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-semibold">1</div>
                      <div>
                        <h3 className="font-semibold mb-2">{t('process.step1.title')}</h3>
                        <p className="text-gray-600 dark:text-gray-400">{t('process.step1.description')}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-semibold">2</div>
                      <div>
                        <h3 className="font-semibold mb-2">{t('process.step2.title')}</h3>
                        <p className="text-gray-600 dark:text-gray-400">{t('process.step2.description')}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-semibold">3</div>
                      <div>
                        <h3 className="font-semibold mb-2">{t('process.step3.title')}</h3>
                        <p className="text-gray-600 dark:text-gray-400">{t('process.step3.description')}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-semibold">4</div>
                      <div>
                        <h3 className="font-semibold mb-2">{t('process.step4.title')}</h3>
                        <p className="text-gray-600 dark:text-gray-400">{t('process.step4.description')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-8 rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-indigo-500 p-2">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold">{t('contact.title')}</h2>
            </div>
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('contact.email.title')}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">{t('contact.email.description')}</p>
                  <a 
                    href="mailto:q9425916@gmail.com" 
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    q9425916@gmail.com
                  </a>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('contact.response.title')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('contact.response.description')}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
} 