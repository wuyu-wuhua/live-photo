'use client';

import type { CreditPlan } from '@/types/database';
import { Button, Card, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Spinner, useDisclosure } from '@heroui/react';
import { Gift, History, Plus, Wallet } from 'lucide-react';
import { useState } from 'react';
import { useCredits } from '@/hooks/useCredits';

/**
 * 用户积分和充值界面
 */
export default function CreditsUI() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeTab, setActiveTab] = useState<'buy' | 'history'>('buy');
  const { credits, loading, recentTransactions, fetchTransactions, refresh } = useCredits();

  // 积分套餐模拟数据
  const creditPlans: CreditPlan[] = [
    {
      id: 'basic',
      name: '基础套餐',
      description: '适合轻度使用的用户',
      credits: 100,
      price: 19,
      currency: 'CNY',
      is_subscription: false,
      billing_period: null,
      stripe_price_id: 'price_basic',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'standard',
      name: '标准套餐',
      description: '适合中度使用的用户',
      credits: 500,
      price: 79,
      currency: 'CNY',
      is_subscription: false,
      billing_period: null,
      stripe_price_id: 'price_standard',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'premium',
      name: '高级套餐',
      description: '适合重度使用的用户',
      credits: 1200,
      price: 159,
      currency: 'CNY',
      is_subscription: false,
      billing_period: null,
      stripe_price_id: 'price_premium',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'subscription',
      name: '月度订阅',
      description: '每月自动充值，更加优惠',
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
      case 'PURCHASE': return '购买积分';
      case 'SUBSCRIPTION': return '订阅获得';
      case 'REFERRAL': return '推荐奖励';
      case 'BONUS': return '奖励积分';
      case 'ADMIN_ADJUSTMENT': return '管理员调整';
      case 'IMAGE_GENERATION': return '图片生成';
      case 'VIDEO_GENERATION': return '视频生成';
      case 'REFUND': return '退款';
      case 'EXPIRATION': return '积分过期';
      case 'PROMOTIONAL': return '促销赠送';
      default: return '未知类型';
    }
  };

  // 获取交易状态标签
  const getTransactionStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED': return '已完成';
      case 'PENDING': return '处理中';
      case 'FAILED': return '失败';
      case 'REFUNDED': return '已退款';
      default: return '未知状态';
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
        积分
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              <span>我的积分</span>
            </div>
          </ModalHeader>

          <ModalBody>
            {/* 积分信息卡片 */}
            <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white mb-6">
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium opacity-80">当前积分余额</div>
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
                    <div className="opacity-80 mb-1">累计获得</div>
                    <div>{credits?.lifetime_earned || 0}</div>
                  </div>
                  <div>
                    <div className="opacity-80 mb-1">累计消费</div>
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
                购买积分
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
                onClick={() => setActiveTab('history')}
              >
                交易记录
              </button>
            </div>

            {/* 购买积分内容 */}
            {activeTab === 'buy' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">选择套餐</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {creditPlans.map(plan => (
                    <Card key={plan.id} className="p-4">
                      <div className="flex flex-col h-full">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-bold text-lg">{plan.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{plan.description}</p>
                          </div>
                          {plan.is_subscription && (
                            <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                              订阅
                            </div>
                          )}
                        </div>
                        <div className="flex items-baseline mt-2 mb-4">
                          <span className="text-2xl font-bold">
                            ¥
                            {plan.price}
                          </span>
                          {plan.is_subscription && <span className="text-sm ml-1">/月</span>}
                        </div>
                        <div className="flex items-center mb-4 mt-auto">
                          <Gift className="w-5 h-5 text-green-500 mr-2" />
                          <span className="font-semibold">
                            {plan.credits}
                            {' '}
                            积分
                          </span>
                        </div>
                        <Button
                          color="primary"
                          className="w-full"
                          onClick={() => handlePayment(plan)}
                        >
                          {plan.is_subscription ? '订阅' : '购买'}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h4 className="font-medium mb-2">自定义金额</h4>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      type="number"
                      label="积分数量"
                      placeholder="输入需要购买的积分数量"
                      min={10}
                      step={10}
                      className="flex-1"
                    />
                    <Button color="primary" startContent={<Plus size={16} />}>
                      充值
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* 交易历史内容 */}
            {activeTab === 'history' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">最近交易</h3>
                  <Select
                    className="w-40"
                    size="sm"
                    label="类型"
                    placeholder="所有类型"
                  >
                    {/* SelectItem组件将根据实际的组件库类型定义调整 */}
                    <SelectItem key="all">所有类型</SelectItem>
                    <SelectItem key="in">收入</SelectItem>
                    <SelectItem key="out">支出</SelectItem>
                  </Select>
                </div>

                <div className="space-y-3">
                  {recentTransactions.length > 0
                    ? (
                        recentTransactions.map(transaction => (
                          <div
                            key={transaction.id}
                            className="p-3 border border-gray-200 dark:border-gray-800 rounded-lg"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="font-medium">{getTransactionTypeLabel(transaction.type)}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  {formatTime(transaction.created_at)}
                                </div>
                              </div>
                              <div className={getAmountClass(transaction.amount)}>
                                {transaction.amount > 0 ? '+' : ''}
                                {transaction.amount}
                              </div>
                            </div>
                            {transaction.description && (
                              <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                                {transaction.description}
                              </div>
                            )}
                            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                              <div>
                                余额:
                                {transaction.balance_after}
                              </div>
                              <div className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
                                {getTransactionStatusLabel(transaction.status)}
                              </div>
                            </div>
                          </div>
                        ))
                      )
                    : (
                        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                          <History className="w-10 h-10 mx-auto mb-2 opacity-50" />
                          <p>暂无交易记录</p>
                        </div>
                      )}
                </div>

                {recentTransactions.length > 0 && (
                  <div className="mt-4 text-center">
                    <Button
                      variant="flat"
                      color="primary"
                      onClick={() => fetchTransactions(1, 20)}
                    >
                      查看更多
                    </Button>
                  </div>
                )}
              </div>
            )}
          </ModalBody>

          <ModalFooter>
            <Button color="primary" variant="light" onClick={onClose}>
              关闭
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
