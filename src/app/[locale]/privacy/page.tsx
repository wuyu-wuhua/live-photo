import { ArrowLeft, Database, Eye, FileText, Lock, Server, Shield, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  const t = useTranslations('privacy');
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
            <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-4">
              <Shield className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
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
          {/* Information Collection */}
          <section className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-8 rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-blue-500 p-2">
                <Database className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold">{t('dataCollectionTitle')}</h2>
            </div>
            <div className="space-y-6">
              <p className="text-lg text-gray-700 dark:text-gray-300">{t('dataCollection')}</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('personalInfoTitle')}</h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      {t('personalInfo1')}
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      {t('personalInfo2')}
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      {t('personalInfo3')}
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      {t('personalInfo4')}
                    </li>
                  </ul>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('usageDataTitle')}</h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      {t('usageData1')}
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      {t('usageData2')}
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      {t('usageData3')}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Information Usage */}
          <section className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-8 rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-purple-500 p-2">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold">{t('dataUsageTitle')}</h2>
            </div>
            <div className="space-y-6">
              <p className="text-lg text-gray-700 dark:text-gray-300">{t('dataUsage')}</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('serviceProvisionTitle')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('serviceProvision')}</p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('improvementTitle')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('improvement')}</p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('communicationTitle')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('communication')}</p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('legalTitle')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('legal')}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Data Protection */}
          <section className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-8 rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-green-500 p-2">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold">{t('dataProtectionTitle')}</h2>
            </div>
            <div className="space-y-6">
              <p className="text-lg text-gray-700 dark:text-gray-300">{t('dataProtection')}</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('securityMeasuresTitle')}</h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      {t('securityMeasures1')}
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      {t('securityMeasures2')}
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      {t('securityMeasures3')}
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      {t('securityMeasures4')}
                    </li>
                  </ul>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('dataRetentionTitle')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('dataRetention')}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Third Party Services */}
          <section className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-8 rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-orange-500 p-2">
                <Server className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold">{t('thirdPartyTitle')}</h2>
            </div>
            <div className="space-y-6">
              <p className="text-lg text-gray-700 dark:text-gray-300">{t('thirdParty')}</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('aiServicesTitle')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('aiServices')}</p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('paymentServicesTitle')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('paymentServices')}</p>
                </div>
              </div>
            </div>
          </section>

          {/* User Rights */}
          <section className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-8 rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-indigo-500 p-2">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold">{t('userRightsTitle')}</h2>
            </div>
            <div className="space-y-6">
              <p className="text-lg text-gray-700 dark:text-gray-300">{t('userRights')}</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('accessTitle')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('access')}</p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('correctionTitle')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('correction')}</p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('deletionTitle')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('deletion')}</p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/20">
                  <h3 className="font-semibold mb-3 text-lg">{t('portabilityTitle')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('portability')}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
