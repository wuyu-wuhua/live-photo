'use client';

import { useState, useRef, useEffect, createContext, useContext } from 'react';
import { useTranslations } from 'next-intl';
import { X, Mail, Phone, Headphones } from 'lucide-react';

// 创建全局上下文
const ContactModalContext = createContext<{
  openContactModal: () => void;
} | null>(null);

// 自定义Hook
export const useContactModal = () => {
  const context = useContext(ContactModalContext);
  if (!context) {
    throw new Error('useContactModal must be used within ContactModalProvider');
  }
  return context;
};

interface Position {
  x: number;
  y: number;
}

// Provider组件
export function ContactModalProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations('contact');
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingButton, setIsDraggingButton] = useState(false);
  const [buttonPosition, setButtonPosition] = useState<Position>({ x: 0, y: 0 });
  const [modalPosition, setModalPosition] = useState<Position>({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  
  const modalRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 提供打开弹窗的方法给外部使用
  const openContactModal = () => {
    const newPosition = calculateModalPosition();
    setModalPosition(newPosition);
    setIsOpen(true);
  };

  // 计算弹窗位置 - 在悬浮球左侧展开
  const calculateModalPosition = () => {
    const modalWidth = 320; // w-80 = 320px
    const margin = 16; // 16px 间距
    
    let x = buttonPosition.x - margin - modalWidth;
    let y = buttonPosition.y - 200; // 弹窗垂直居中于悬浮球
    
    // 确保弹窗不会超出屏幕边界
    if (x < 0) x = buttonPosition.x + 40 + margin; // 如果左侧空间不够，放在右侧
    if (y < 0) y = 16; // 如果上方空间不够，放在顶部
    
    return { x, y };
  };

  // 处理弹窗拖拽开始
  const handleModalMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (headerRef.current?.contains(e.target as Node)) {
      setIsDragging(true);
      const rect = modalRef.current?.getBoundingClientRect();
      if (rect) {
        const clientX = 'touches' in e && e.touches[0] ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e && e.touches[0] ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        setDragOffset({
          x: clientX - rect.left,
          y: clientY - rect.top,
        });
      }
    }
  };

  // 处理悬浮球拖拽开始
  const handleButtonMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setIsDraggingButton(true);
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const clientX = 'touches' in e && e.touches[0] ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e && e.touches[0] ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
      setDragOffset({
        x: clientX - rect.left,
        y: clientY - rect.top,
      });
    }
  };

  // 处理拖拽移动
  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    const clientX = 'touches' in e && e.touches[0] ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e && e.touches[0] ? e.touches[0].clientY : (e as MouseEvent).clientY;
    
    if (isDragging && modalRef.current) {
      const newX = clientX - dragOffset.x;
      const newY = clientY - dragOffset.y;
      
      // 确保弹窗不会拖出屏幕
      const maxX = window.innerWidth - modalRef.current.offsetWidth;
      const maxY = window.innerHeight - modalRef.current.offsetHeight;
      
      setModalPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    }
    
    if (isDraggingButton && buttonRef.current) {
      const newX = clientX - dragOffset.x;
      const newY = clientY - dragOffset.y;
      
      // 确保悬浮球不会拖出屏幕
      const maxX = window.innerWidth - buttonRef.current.offsetWidth;
      const maxY = window.innerHeight - buttonRef.current.offsetHeight;
      
      const newButtonPosition = {
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      };
      
      setButtonPosition(newButtonPosition);
      
      // 如果弹窗是打开的，同时更新弹窗位置
      if (isOpen) {
        const modalWidth = 320; // w-80 = 320px
        const margin = 16; // 16px 间距
        
        let modalX = newButtonPosition.x - margin - modalWidth;
        let modalY = newButtonPosition.y - 200; // 弹窗垂直居中于悬浮球
        
        // 确保弹窗不会超出屏幕边界
        if (modalX < 0) modalX = newButtonPosition.x + 40 + margin; // 如果左侧空间不够，放在右侧
        if (modalY < 0) modalY = 16; // 如果上方空间不够，放在顶部
        
        setModalPosition({ x: modalX, y: modalY });
      }
    }
  };

  // 处理拖拽结束
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsDraggingButton(false);
  };

  // 添加全局鼠标和触摸事件监听
  useEffect(() => {
    if (isDragging || isDraggingButton) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleMouseMove, { passive: false });
      document.addEventListener('touchend', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleMouseMove);
        document.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, isDraggingButton, dragOffset]);

  // 初始化悬浮球位置
  useEffect(() => {
    setButtonPosition({
      x: window.innerWidth - 64,
      y: window.innerHeight / 2 - 20, // 页面右边中间位置
    });
  }, []);

  // 处理邮箱点击
  const handleEmailClick = () => {
    window.open(`mailto:${t('emailAddress')}`, '_blank');
  };

  // 处理电话点击
  const handlePhoneClick = () => {
    window.open(`tel:${t('phoneNumber')}`, '_blank');
  };

  // 打开弹窗时设置位置
  const handleOpenModal = () => {
    openContactModal();
  };

  return (
    <ContactModalContext.Provider value={{ openContactModal }}>
      {children}
      {/* 悬浮按钮 */}
      <button
        ref={buttonRef}
        onClick={handleOpenModal}
        className="fixed z-40 w-10 h-10 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-grab active:cursor-grabbing"
        style={{
          left: `${buttonPosition.x}px`,
          top: `${buttonPosition.y}px`,
        }}
        title={t('needHelp')}
        onMouseDown={handleButtonMouseDown}
        onTouchStart={handleButtonMouseDown}
      >
        <Headphones size={16} />
      </button>

      {/* 联系弹窗 */}
      {isOpen && (
        <div
          ref={modalRef}
          className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 w-80 max-w-[90vw]"
          style={{
            left: `${modalPosition.x}px`,
            top: `${modalPosition.y}px`,
            cursor: isDragging ? 'grabbing' : 'default',
          }}
          onMouseDown={handleModalMouseDown}
          onTouchStart={handleModalMouseDown}
        >
          {/* 弹窗头部 */}
          <div
            ref={headerRef}
            className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 cursor-grab active:cursor-grabbing"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('needHelp')}</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* 弹窗内容 */}
          <div className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {t('contactDescription')}
            </p>

            {/* 邮箱联系方式 */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
              <div className="flex items-center mb-2">
                <Mail className="text-blue-600 dark:text-blue-400 mr-2" size={16} />
                <span className="font-medium text-gray-900 dark:text-white">{t('customerServiceEmail')}</span>
              </div>
              <button
                onClick={handleEmailClick}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors"
              >
                {t('emailAddress')}
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('clickToSendEmail')}</p>
            </div>

            {/* 电话联系方式 */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex items-center mb-2">
                <Phone className="text-green-600 dark:text-green-400 mr-2" size={16} />
                <span className="font-medium text-gray-900 dark:text-white">{t('customerServicePhone')}</span>
              </div>
              <button
                onClick={handlePhoneClick}
                className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium transition-colors"
              >
                {t('phoneNumber')}
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('clickToCall')}</p>
            </div>

            {/* 底部说明 */}
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
              {t('responseTime')}
            </p>
          </div>
        </div>
      )}
    </ContactModalContext.Provider>
  );
} 