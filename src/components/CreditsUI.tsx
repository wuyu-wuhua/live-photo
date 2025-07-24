'use client';

import type { CreditPlan } from '@/types/database';
import { Button, Card, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Spinner, useDisclosure } from '@heroui/react';
import {  Wallet } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useCredits } from '@/hooks/useCredits';

/**
 * 用户积分和充值界面
 */
export default function CreditsUI() {
  const t = useTranslations();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeTab, setActiveTab] = useState<'buy' | 'history'>('buy');
  const { credits, loading, recentTransactions, refresh } = useCredits();

  // 积分套餐模拟数据
  const creditPlans: CreditPlan[] = [
    {
      id: 'basic',
      name: t('credits.plans.basic.name'),
      description: t('credits.plans.basic.description'),
      credits: 100,
      price: 9.99,
      currency: 'USD',
      is_subscription: false,
      billing_period: null,
      stripe_price_id: 'price_basic',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'standard',
      name: t('credits.plans.standard.name'),
      description: t('credits.plans.standard.description'),
      credits: 500,
      price: 29.99,
      currency: 'USD',
      is_subscription: false,
      billing_period: null,
      stripe_price_id: 'price_standard',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'premium',
      name: t('credits.plans.premium.name'),
      description: t('credits.plans.premium.description'),
      credits: 1000,
      price: 49.99,
      currency: 'USD',
      is_subscription: false,
      billing_period: null,
      stripe_price_id: 'price_premium',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'subscription',
      name: t('credits.plans.subscription.name'),
      description: t('credits.plans.subscription.description'),
      credits: 1000,
      price: 99,
      currency: 'CNY',
      is_subscription: true,
      billing_period: 'MONTHLY',
      stripe_price_id: 'price_subscription',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  // 处理支付
  const handlePayment = (plan: CreditPlan) => {
    console.warn('处理支付', plan);
    // TODO: 实现支付逻辑
  };

  // 格式化时间
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 获取交易类型描述
  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'PURCHASE': return t('credits.transactionTypes.purchase');
      case 'SUBSCRIPTION': return t('credits.transactionTypes.subscription');
      case 'REFERRAL': return t('credits.transactionTypes.referral');
      case 'BONUS': return t('credits.transactionTypes.bonus');
      case 'ADMIN_ADJUSTMENT': return t('credits.transactionTypes.adminAdjustment');
      case 'IMAGE_GENERATION': return t('credits.transactionTypes.imageGeneration');
      case 'VIDEO_GENERATION': return t('credits.transactionTypes.videoGeneration');
      case 'REFUND': return t('credits.transactionTypes.refund');
      case 'EXPIRATION': return t('credits.transactionTypes.expiration');
      case 'PROMOTIONAL': return t('credits.transactionTypes.promotional');
      default: return t('credits.transactionTypes.unknown');
    }
  };

  // 获取交易状态标签
  const getTransactionStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED': return t('credits.status.completed');
      case 'PENDING': return t('credits.status.pending');
      case 'FAILED': return t('credits.status.failed');
      case 'REFUNDED': return t('credits.status.refunded');
      default: return t('credits.status.unknown');
    }
  };

  // 获取交易金额CSS类
  const getAmountClass = (amount: number) => {
    return amount > 0
      ? 'text-green-600 dark:text-green-400 font-medium'
      : 'text-red-600 dark:text-red-400 font-medium';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Spinner color="primary" />
      </div>
    );
  }

  return (
    <>
      <Button
        variant="flat"
        color="primary"
        startContent={<Wallet size={16} />}
        onClick={onOpen}
        className="gap-1"
      >
        {credits?.balance || 0}
        {' '}
        {t('credits.credits')}
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              <span>{t('credits.title')}</span>
            </div>
          </ModalHeader>

          <ModalBody>
            {/* 积分信息卡片 */}
            <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white mb-6">
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium opacity-80">{t('credits.currentCredits')}</div>
                  <Button
                    size="sm"
                    color="default"
                    variant="flat"
                    isIconOnly
                    onClick={refresh}
                    className="bg-white/20"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                  </Button>
                </div>
                <div className="text-4xl font-bold mb-4">{credits?.balance || 0}</div>
                <div className="flex justify-between text-sm">
                  <div>
                    <div className="opacity-80 mb-1">{t('credits.totalEarned')}</div>
                    <div>{credits?.lifetime_earned || 0}</div>
                  </div>
                  <div>
                    <div className="opacity-80 mb-1">{t('credits.totalSpent')}</div>
                    <div>{credits?.lifetime_spent || 0}</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* 选项卡 */}
            <div className="flex border-b border-gray-200 dark:border-gray-800 mb-4">
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'buy'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
                onClick={() => setActiveTab('buy')}
              >
                {t('credits.buyCredits')}
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
                onClick={() => setActiveTab('history')}
              >
                {t('credits.transactionHistory')}
              </button>
            </div>

            {/* 购买积分 */}
            {activeTab === 'buy' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {creditPlans.map((plan) => (
                    <Card key={plan.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{plan.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{plan.description}</p>
                        </div>
                        {plan.is_subscription && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {t('credits.subscription')}
                          </span>
                        )}
                      </div>
                      <div className="mb-4">
                        <div className="text-2xl font-bold">
                          ${plan.price}
                          {plan.is_subscription && <span className="text-sm font-normal text-gray-500">/{t('credits.month')}</span>}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {plan.credits} {t('credits.credits')}
                        </div>
                      </div>
                      <Button
                        color="primary"
                        variant="flat"
                        className="w-full"
                        onClick={() => handlePayment(plan)}
                      >
                        {plan.is_subscription ? t('credits.subscribe') : t('credits.purchase')}
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* 交易历史 */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">{t('credits.recentTransactions')}</h3>
                  <Select
                    className="w-40"
                    size="sm"
                    label="类型"
                    placeholder="所有类型"
                  >
                    {/* SelectItem组件将根据实际的组件库类型定义调整 */}
                    <SelectItem key="all">{t('credits.allTypes')}</SelectItem>
                    <SelectItem key="in">{t('credits.income')}</SelectItem>
                    <SelectItem key="out">{t('credits.expense')}</SelectItem>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  {recentTransactions.map((transaction) => (
                    <Card key={transaction.id} className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{getTransactionTypeLabel(transaction.type)}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {formatTime(transaction.created_at)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={getAmountClass(transaction.amount)}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getTransactionStatusLabel(transaction.status)}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </ModalBody>

          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              {t('common.close')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
