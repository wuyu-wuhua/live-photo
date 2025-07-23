'use client';

import type { Tables } from '@/types/database';
import { Avatar, Button, Card, CardBody, CardHeader, Chip, Image, Spinner, Tab, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tabs } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import StripePayment from '@/components/payments/StripePayment';
import { useCredits } from '@/hooks/useCredits';
import { useUser } from '@/hooks/useUser';
import { createSupabaseClient } from '@/lib/supabase';

type ImageEditResult = Tables<'image_edit_results'>;

export default function ProfilePage() {
  const t = useTranslations();
  const { user } = useUser();
  const { credits, loading, recentTransactions, refresh } = useCredits();
  const [activeTab, setActiveTab] = useState('overview');
  const [generationHistory, setGenerationHistory] = useState<ImageEditResult[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showStripePayment, setShowStripePayment] = useState(false);

  const supabase = createSupabaseClient();

  // 积分套餐数据
  const creditPlans = [
    {
      id: 'basic',
      name: t('common.plans.basic.name'),
      description: t('common.plans.basic.description'),
      credits: 100,
      price: 9.99,
      popular: false,
      stripe_price_id: 'price_basic',
    },
    {
      id: 'standard',
      name: t('common.plans.standard.name'),
      description: t('common.plans.standard.description'),
      credits: 500,
      price: 29.99,
      popular: true,
      stripe_price_id: 'price_standard',
    },
    {
      id: 'premium',
      name: t('common.plans.premium.name'),
      description: t('common.plans.premium.description'),
      credits: 1000,
      price: 49.99,
      popular: false,
      stripe_price_id: 'price_premium',
    },
  ];

  // 获取生成历史记录
  useEffect(() => {
    const fetchGenerationHistory = async () => {
      if (!user?.id) {
        return;
      }

      setHistoryLoading(true);
      try {
        const { data, error } = await supabase
          .from('image_edit_results')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) {
          throw error;
        }
        setGenerationHistory(data || []);
      } catch (error) {
        console.error('获取生成历史失败:', error);
      } finally {
        setHistoryLoading(false);
      }
    };

    if (activeTab === 'history') {
      fetchGenerationHistory();
    }
  }, [activeTab, user?.id, supabase]);

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

  // 获取交易类型标签
  const getTransactionTypeLabel = (type: string) => {
    const key = `profile.transactionTypes.${type}` as any;
    return t(key) || type;
  };

  // 获取功能名称
  const getFeatureName = (metadata: any) => {
    if (!metadata || !metadata.feature_type) {
      return t('profile.features.unknown');
    }

    const key = `profile.features.${metadata.feature_type}` as any;
    return t(key) || metadata.feature_type;
  };

  // 处理充值
  const handleTopUp = (planId: string) => {
    const plan = creditPlans.find(p => p.id === planId);
    if (plan) {
      setSelectedPlan(plan);
      setShowStripePayment(true);
    }
  };

  // 支付成功处理
  const handlePaymentSuccess = () => {
    // 刷新积分数据
    refresh();
    setShowStripePayment(false);
    setSelectedPlan(null);
  };

  // 关闭支付弹窗
  const handleClosePayment = () => {
    setShowStripePayment(false);
    setSelectedPlan(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('profile.title')}</h1>
        <p className="text-default-500">{t('profile.description')}</p>
      </div>

      {/* 用户信息卡片 */}
      <Card className="mb-8">
        <CardBody className="p-6">
          <div className="flex items-center gap-4">
            <Avatar
              size="lg"
              src={user?.user_metadata?.avatar_url}
              name={user?.user_metadata?.full_name || user?.email}
            />
            <div>
              <h2 className="text-xl font-semibold">
                {user?.user_metadata?.full_name || t('profile.user')}
              </h2>
              <p className="text-default-500">{user?.email}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 积分概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon icon="iconamoon:wallet-duotone" className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-default-500">{t('profile.currentCredits')}</p>
                <p className="text-2xl font-bold">{credits?.balance || 0}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <Icon icon="iconamoon:trend-up-duotone" className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-default-500">{t('profile.totalEarned')}</p>
                <p className="text-2xl font-bold">{credits?.lifetime_earned || 0}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Icon icon="iconamoon:trend-down-duotone" className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-default-500">{t('profile.totalSpent')}</p>
                <p className="text-2xl font-bold">{credits?.lifetime_spent || 0}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 主要内容区域 */}
      <Tabs
        selectedKey={activeTab}
        onSelectionChange={key => setActiveTab(key as string)}
        className="w-full"
      >
        <Tab key="overview" title={t('profile.creditsOverview')}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 最近交易 */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Icon icon="iconamoon:history-duotone" className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">{t('profile.recentTransactions')}</h3>
                </div>
              </CardHeader>
              <CardBody>
                {recentTransactions.length > 0
                  ? (
                      <div className="space-y-3">
                        {recentTransactions.slice(0, 5).map(transaction => (
                          <div key={transaction.id} className="flex justify-between items-center p-3 bg-default-50 rounded-lg">
                            <div>
                              <p className="font-medium">{getTransactionTypeLabel(transaction.type)}</p>
                              <p className="text-sm text-default-500">
                                {formatTime(transaction.created_at)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`font-semibold ${
                                transaction.amount > 0 ? 'text-success' : 'text-danger'
                              }`}
                              >
                                {transaction.amount > 0 ? '+' : ''}
                                {transaction.amount}
                              </p>
                              <p className="text-sm text-default-500">
                                {t('profile.balance')}
                                :
                                {' '}
                                {transaction.balance_after}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  : (
                      <p className="text-center text-default-500 py-8">{t('profile.noTransactions')}</p>
                    )}
              </CardBody>
            </Card>

            {/* 充值套餐 */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Icon icon="iconamoon:credit-card-duotone" className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">{t('profile.creditPackages')}</h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {creditPlans.map(plan => (
                    <div key={plan.id} className="p-4 border rounded-lg hover:bg-default-50 transition-colors">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{plan.name}</h4>
                            {plan.popular && (
                              <Chip size="sm" color="primary">{t('profile.recommended')}</Chip>
                            )}
                          </div>
                          <p className="text-sm text-default-500">{plan.description}</p>
                          <p className="text-sm font-medium">
                            {plan.credits}
                            {' '}
                            {t('profile.credits')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">
                            $
                            {plan.price}
                          </p>
                          <Button
                            size="sm"
                            color="primary"
                            onPress={() => handleTopUp(plan.id)}
                          >
                            {t('profile.purchaseCredits')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </Tab>

        <Tab key="transactions" title={t('profile.transactionHistory')}>
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">{t('profile.transactionHistory')}</h3>
            </CardHeader>
            <CardBody>
              <Table aria-label={t('profile.transactionHistory')}>
                <TableHeader>
                  <TableColumn>{t('profile.type')}</TableColumn>
                  <TableColumn>{t('profile.description')}</TableColumn>
                  <TableColumn>{t('profile.amount')}</TableColumn>
                  <TableColumn>{t('profile.balance')}</TableColumn>
                  <TableColumn>{t('profile.date')}</TableColumn>
                  <TableColumn>{t('profile.status')}</TableColumn>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map(transaction => (
                    <TableRow key={transaction.id}>
                      <TableCell>{getTransactionTypeLabel(transaction.type)}</TableCell>
                      <TableCell>
                        {transaction.description
                        || (typeof transaction.metadata === 'object' && transaction.metadata && 'feature_type' in transaction.metadata ? getFeatureName(transaction.metadata) : '-')}
                      </TableCell>
                      <TableCell>
                        <span className={transaction.amount > 0 ? 'text-success' : 'text-danger'}>
                          {transaction.amount > 0 ? '+' : ''}
                          {transaction.amount}
                        </span>
                      </TableCell>
                      <TableCell>{transaction.balance_after}</TableCell>
                      <TableCell>{formatTime(transaction.created_at)}</TableCell>
                      <TableCell>
                        <Chip
                          size="sm"
                          color={transaction.status === 'COMPLETED' ? 'success' : 'warning'}
                        >
                          {transaction.status === 'COMPLETED' ? t('common.completed') : transaction.status}
                        </Chip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </Tab>

        <Tab key="history" title={t('profile.generationHistory')}>
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">{t('profile.generationHistory')}</h3>
            </CardHeader>
            <CardBody>
              {historyLoading
                ? (
                    <div className="flex justify-center py-8">
                      <Spinner />
                    </div>
                  )
                : (
                    <Table aria-label={t('profile.generationHistory')}>
                      <TableHeader>
                        <TableColumn>{t('profile.type')}</TableColumn>
                        <TableColumn>{t('profile.status')}</TableColumn>
                        <TableColumn>{t('profile.result')}</TableColumn>
                        <TableColumn>{t('profile.createdAt')}</TableColumn>
                        <TableColumn>{t('profile.actions')}</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {generationHistory.map(record => (
                          <TableRow key={record.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {record.result_type === 'video'
                                  ? (
                                      <Icon icon="iconamoon:video-duotone" className="w-4 h-4" />
                                    )
                                  : (
                                      <Icon icon="iconamoon:image-duotone" className="w-4 h-4" />
                                    )}
                                {record.result_type === 'video' ? t('profile.video') : t('profile.image')}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="sm"
                                color={
                                  record.status === 'SUCCEEDED'
                                    ? 'success'
                                    : record.status === 'FAILED'
                                      ? 'danger'
                                      : record.status === 'RUNNING' ? 'warning' : 'default'
                                }
                              >
                                {record.status === 'SUCCEEDED'
                                  ? t('profile.completed')
                                  : record.status === 'FAILED'
                                    ? t('profile.failed')
                                    : record.status === 'RUNNING' ? t('profile.pending') : t('profile.waiting')}
                              </Chip>
                            </TableCell>
                            <TableCell>
                              {record.result_image_url.length > 0
                                ? (
                                    <div className="flex gap-1">
                                      {record.result_image_url.slice(0, 3).map((url, index) => (
                                        <Image
                                          key={index}
                                          src={url}
                                          alt={t('profile.result')}
                                          className="w-8 h-8 object-cover rounded"
                                        />
                                      ))}
                                      {record.result_image_url.length > 3 && (
                                        <div className="w-8 h-8 bg-default-100 rounded flex items-center justify-center text-xs">
                                          +
                                          {record.result_image_url.length - 3}
                                        </div>
                                      )}
                                    </div>
                                  )
                                : (
                                    <span className="text-default-500">{t('profile.noResult')}</span>
                                  )}
                            </TableCell>
                            <TableCell>{formatTime(record.created_at)}</TableCell>
                            <TableCell>
                              <Button size="sm" variant="light">
                                {t('profile.view')}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
            </CardBody>
          </Card>
        </Tab>
      </Tabs>

      {/* Stripe 支付弹窗 */}
      {showStripePayment && selectedPlan && (
        <StripePayment
          isOpen={showStripePayment}
          onClose={handleClosePayment}
          plan={selectedPlan}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
