import { AlertTriangle, ArrowLeft, CheckCircle, CreditCard, FileText, Scale, Settings, Shield, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
// import { Button } from '@heroui/react'; // 未使用，移除

export default function TermsPage() {
  const t = useTranslations('terms');
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
              <FileText className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              {t('title')}
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-600 dark:text-gray-300">
            {t('intro')}
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full text-sm text-muted-foreground">
            <FileText className="w-4 h-4" />
            {t('lastUpdated')}
            :
            {t('lastUpdatedDate')}
          </div>
        </section>

        {/* Content */}
        <div className="space-y-12">
          {/* Acceptance of Terms */}
          <section className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-8 rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-green-500 p-2">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold">{t('acceptanceTitle')}</h2>
            </div>
            <div className="space-y-6">
              <p className="text-lg text-gray-700 dark:text-gray-300">{t('acceptance')}</p>
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                <h3 className="font-semibold mb-3 text-lg">{t('ageRequirementTitle')}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t('ageRequirement')}</p>
              </div>
            </div>
          </section>

          {/* Service Description */}
          <section className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-8 rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-blue-500 p-2">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold">{t('serviceDescriptionTitle')}</h2>
            </div>
            <div className="space-y-6">
              <p className="text-lg text-gray-700 dark:text-gray-300">{t('serviceDescription')}</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('aiImageTitle')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('aiImage')}</p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('aiVideoTitle')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('aiVideo')}</p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('colorizationTitle')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('colorization')}</p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('ttsTitle')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('tts')}</p>
                </div>
              </div>
            </div>
          </section>

          {/* User Obligations */}
          <section className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-8 rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-purple-500 p-2">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold">{t('userObligationsTitle')}</h2>
            </div>
            <div className="space-y-6">
              <p className="text-lg text-gray-700 dark:text-gray-300">{t('userObligations')}</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('contentRequirementsTitle')}</h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      {t('contentRequirements1')}
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      {t('contentRequirements2')}
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      {t('contentRequirements3')}
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      {t('contentRequirements4')}
                    </li>
                  </ul>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('accountSecurityTitle')}</h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                      {t('accountSecurity1')}
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                      {t('accountSecurity2')}
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                      {t('accountSecurity3')}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Service Usage */}
          <section className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-8 rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-orange-500 p-2">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold">{t('serviceUsageTitle')}</h2>
            </div>
            <div className="space-y-6">
              <p className="text-lg text-gray-700 dark:text-gray-300">{t('serviceUsage')}</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('personalUseTitle')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('personalUse')}</p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('commercialUseTitle')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('commercialUse')}</p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('prohibitedUseTitle')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('prohibitedUse')}</p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('aiAccuracyTitle')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('aiAccuracy')}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Payment and Credits */}
          <section className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-8 rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-emerald-500 p-2">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold">{t('paymentTitle')}</h2>
            </div>
            <div className="space-y-6">
              <p className="text-lg text-gray-700 dark:text-gray-300">{t('payment')}</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('creditSystemTitle')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('creditSystem')}</p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('refundPolicyTitle')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('refundPolicy')}</p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('subscriptionTitle')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('subscription')}</p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('priceChangesTitle')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('priceChanges')}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-8 rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-indigo-500 p-2">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold">{t('intellectualPropertyTitle')}</h2>
            </div>
            <div className="space-y-6">
              <p className="text-lg text-gray-700 dark:text-gray-300">{t('intellectualProperty')}</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('userContentTitle')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('userContent')}</p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('platformRightsTitle')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('platformRights')}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 p-8 rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-red-500 p-2">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold">{t('limitationTitle')}</h2>
            </div>
            <div className="space-y-6">
              <p className="text-lg text-gray-700 dark:text-gray-300">{t('limitation')}</p>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('serviceInterruptionTitle')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('serviceInterruption')}</p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('dataLossTitle')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('dataLoss')}</p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('thirdPartyTitle')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('thirdParty')}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Termination */}
          <section className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 p-8 rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-gray-500 p-2">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold">{t('terminationTitle')}</h2>
            </div>
            <div className="space-y-6">
              <p className="text-lg text-gray-700 dark:text-gray-300">{t('termination')}</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('userTerminationTitle')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('userTermination')}</p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('platformTerminationTitle')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('platformTermination')}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
