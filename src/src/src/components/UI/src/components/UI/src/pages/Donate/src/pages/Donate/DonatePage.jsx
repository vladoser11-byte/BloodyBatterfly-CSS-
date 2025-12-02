import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, 
  Sparkles, 
  Crown, 
  Star, 
  Zap, 
  Shield, 
  Trophy,
  TrendingUp,
  Users,
  Clock,
  CheckCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { donateAPI } from '../../utils/api';
import './DonatePage.css';

const DonatePage = () => {
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);
  const [donationHistory, setDonationHistory] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState({
    totalDonated: 0,
    monthlyGoal: 10000,
    currentMonth: 0,
    topDonators: [],
    recentDonations: []
  });

  // Пакеты донатов
  const packages = [
    {
      id: 'starter',
      name: 'Новичок',
      price: 99,
      originalPrice: 149,
      color: 'var(--accent-blue)',
      icon: <Sparkles size={32} />,
      features: [
        'Значок "Поддержка"',
        '500 монет в игре',
        'Ранний доступ к обновлениям',
        'Спасибо в титрах'
      ],
      popular: false
    },
    {
      id: 'supporter',
      name: 'Поддержка',
      price: 299,
      originalPrice: 399,
      color: 'var(--accent-purple)',
      icon: <Gift size={32} />,
      features: [
        'Все из пакета "Новичок"',
        'Эксклюзивный скин',
        '2000 монет в игре',
        'Доступ к бета-тестам',
        'Имя в списке поддержки'
      ],
      popular: true
    },
    {
      id: 'vip',
      name: 'VIP',
      price: 699,
      originalPrice: 999,
      color: 'var(--accent-gold)',
      icon: <Crown size={32} />,
      features: [
        'Все из пакета "Поддержка"',
        'VIP значок в профиле',
        '5000 монет в игре',
        'Персональная помощь',
        'Возможность влиять на развитие',
        'Эксклюзивный Discord-роль'
      ],
      popular: false
    },
    {
      id: 'sponsor',
      name: 'Спонсор',
      price: 1499,
      originalPrice: 1999,
      color: 'var(--accent-rainbow)',
      icon: <Star size={32} />,
      features: [
        'Все из пакета "VIP"',
        'Значок "Спонсор"',
        '10000 монет в игре',
        'Реклама вашего проекта',
        'Прямая связь с разработчиками',
        'Упоминание в соцсетях'
      ],
      popular: false
    }
  ];

  // Методы оплаты
  const paymentMethods = [
    {
      id: 'telegram',
      name: 'Telegram',
      icon: '🤖',
      description: 'Оплата через Telegram-бота',
      fee: 0,
      instant: true
    },
    {
      id: 'crypto',
      name: 'Криптовалюта',
      icon: '₿',
      description: 'BTC, ETH, USDT',
      fee: 1.5,
      instant: false
    },
    {
      id: 'card',
      name: 'Карта',
      icon: '💳',
      description: 'Visa, Mastercard, Мир',
      fee: 2.9,
      instant: true
    },
    {
      id: 'qiwi',
      name: 'QIWI',
      icon: '🧡',
      description: 'Кошелек QIWI',
      fee: 0,
      instant: true
    },
    {
      id: 'yoomoney',
      name: 'ЮMoney',
      icon: '💰',
      description: 'ЮMoney кошелек',
      fee: 0.5,
      instant: true
    }
  ];

  // Загрузка данных
  useEffect(() => {
    loadDonationData();
    loadStats();
    
    // WebSocket подписка на новые донаты
    const socket = io(import.meta.env.VITE_WS_URL);
    socket.on('donate:notification', handleNewDonation);
    
    return () => {
      socket.disconnect();
    };
  }, []);

  const loadDonationData = async () => {
    try {
      const response = await donateAPI.getHistory();
      setDonationHistory(response.data);
    } catch (error) {
      toast.error('Ошибка загрузки истории донатов');
    }
  };

  const loadStats = async () => {
    try {
      const response = await donateAPI.getStats();
      setStats(response.data);
    } catch (error) {
      toast.error('Ошибка загрузки статистики');
    }
  };

  const handleNewDonation = (data) => {
    setDonationHistory(prev => [data, ...prev.slice(0, 9)]);
    setStats(prev => ({
      ...prev,
      totalDonated: prev.totalDonated + data.amount,
      currentMonth: prev.currentMonth + data.amount,
      recentDonations: [data, ...prev.recentDonations.slice(0, 4)]
    }));
    
    // Конфетти для больших донатов
    if (data.amount >= 1000) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  };

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
    setCustomAmount('');
  };

  const handleCustomAmount = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setCustomAmount(value);
    setSelectedPackage(null);
  };

  const handlePromoApply = async () => {
    if (!promoCode.trim()) {
      toast.error('Введите промокод');
      return;
    }
    
    try {
      const response = await donateAPI.validatePromo(promoCode);
      setDiscount(response.data.discount);
      toast.success(`Промокод применен! Скидка ${response.data.discount}%`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Неверный промокод');
    }
  };

  const calculateTotal = () => {
    let amount = selectedPackage ? selectedPackage.price : parseInt(customAmount) || 0;
    if (discount > 0) {
      amount = amount * (1 - discount / 100);
    }
    return Math.round(amount);
  };

  const handleDonate = async (method) => {
    if (calculateTotal() < 10) {
      toast.error('Минимальная сумма доната 10 рублей');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const donationData = {
        amount: calculateTotal(),
        package: selectedPackage?.id || 'custom',
        customAmount: selectedPackage ? null : parseInt(customAmount),
        promoCode: promoCode || null,
        paymentMethod: method
      };
      
      const response = await donateAPI.create(donationData);
      
      // Перенаправление в Telegram
      if (method === 'telegram') {
        window.open(response.data.telegramUrl, '_blank');
      } else {
        // Для других методов показываем реквизиты
        showPaymentDetails(response.data);
      }
      
      toast.success('Донат создан! Следуйте инструкциям для оплаты.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ошибка создания доната');
    } finally {
      setIsProcessing(false);
    }
  };

  const showPaymentDetails = (data) => {
    // Модалка с реквизитами
    toast.custom((t) => (
      <div className="payment-modal">
        <h3>Реквизиты для оплаты</h3>
        <div className="payment-details">
          <p><strong>Сумма:</strong> {data.amount} руб.</p>
          <p><strong>Реквизиты:</strong> {data.paymentDetails}</p>
          <p><strong>Комментарий:</strong> {data.comment}</p>
        </div>
        <button onClick={() => toast.dismiss(t.id)}>Закрыть</button>
      </div>
    ), { duration: 10000 });
  };

  return (
    <motion.div 
      className="donate-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Конфетти */}
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.1}
        />
      )}
      
      {/* Статистика */}
      <div className="stats-section">
        <motion.div 
          className="stat-card total"
          whileHover={{ scale: 1.02 }}
        >
          <TrendingUp size={24} />
          <h3>Всего собрано</h3>
          <p className="amount">{stats.totalDonated.toLocaleString()} ₽</p>
        </motion.div>
        
        <motion.div 
          className="stat-card goal"
          whileHover={{ scale: 1.02 }}
        >
          <Trophy size={24} />
          <h3>Цель месяца</h3>
          <p className="amount">{stats.currentMonth.toLocaleString()} / {stats.monthlyGoal.toLocaleString()} ₽</p>
          <div className="progress-bar">
            <div 
              className="progress" 
              style={{ width: `${(stats.currentMonth / stats.monthlyGoal) * 100}%` }}
            />
          </div>
        </motion.div>
        
        <motion.div 
          className="stat-card top"
          whileHover={{ scale: 1.02 }}
        >
          <Users size={24} />
          <h3>Топ донатеры</h3>
          <ul>
            {stats.topDonators.slice(0, 3).map((donator, idx) => (
              <li key={idx}>
                <span className="rank">{idx + 1}</span>
                <span className="name">{donator.username}</span>
                <span className="donated">{donator.amount} ₽</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
      
      {/* Основной контент */}
      <div className="donate-content">
        {/* Пакеты */}
        <section className="packages-section">
          <h2 className="section-title">
            <Gift size={28} />
            Выберите пакет поддержки
          </h2>
          
          <div className="packages-grid">
            {packages.map((pkg) => (
              <motion.div
                key={pkg.id}
                className={`package-card ${selectedPackage?.id === pkg.id ? 'selected' : ''} ${pkg.popular ? 'popular' : ''}`}
                style={{ borderColor: pkg.color }}
                whileHover={{ y: -5 }}
                onClick={() => handlePackageSelect(pkg)}
              >
                {pkg.popular && (
                  <div className="popular-badge" style={{ background: pkg.color }}>
                    Популярный
                  </div>
                )}
                
                <div className="package-header" style={{ background: pkg.color }}>
                  {pkg.icon}
                  <h3>{pkg.name}</h3>
                </div>
                
                <div className="package-price">
                  <span className="current">{pkg.price} ₽</span>
                  {pkg.originalPrice && (
                    <span className="original">{pkg.originalPrice} ₽</span>
                  )}
                </div>
                
                <ul className="package-features">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx}>
                      <CheckCircle size={16} />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button 
                  className="select-btn"
                  style={{ background: pkg.color }}
                >
                  {selectedPackage?.id === pkg.id ? 'Выбрано' : 'Выбрать'}
                </button>
              </motion.div>
            ))}
          </div>
        </section>
        
        {/* Кастомная сумма */}
        <section className="custom-section">
          <h2 className="section-title">
            <Zap size={28} />
            Или укажите свою сумму
          </h2>
          
          <div className="custom-amount">
            <input
              type="text"
              value={customAmount}
              onChange={handleCustomAmount}
              placeholder="Введите сумму в рублях"
              className="amount-input"
            />
            <span className="currency">₽</span>
          </div>
          
          <div className="quick-amounts">
            {[100, 300, 500, 1000, 5000].map((amount) => (
              <button
                key={amount}
                className="quick-btn"
                onClick={() => {
                  setCustomAmount(amount.toString());
                  setSelectedPackage(null);
                }}
              >
                {amount} ₽
              </button>
            ))}
          </div>
        </section>
        
        {/* Промокод */}
        <section className="promo-section">
          <h2 className="section-title">
            <Star size={28} />
            Промокод
          </h2>
          
          <div className="promo-input">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Введите промокод"
            />
            <button 
              className="apply-btn"
              onClick={handlePromoApply}
              disabled={!promoCode.trim()}
            >
              Применить
            </button>
          </div>
          
          {discount > 0 && (
            <div className="discount-info">
              <Shield size={20} />
              <span>Активна скидка {discount}%</span>
            </div>
          )}
        </section>
        
        {/* Итог */}
        <section className="summary-section">
          <div className="summary-card">
            <h3>Итого к оплате:</h3>
            <div className="total-amount">
              <span className="amount">{calculateTotal().toLocaleString()} ₽</span>
              {discount > 0 && (
                <span className="discount">-{discount}%</span>
              )}
            </div>
            
            <div className="payment-methods">
              <h4>Способы оплаты:</h4>
              <div className="methods-grid">
                {paymentMethods.map((method) => (
                  <motion.button
                    key={method.id}
                    className="method-btn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDonate(method.id)}
                    disabled={isProcessing || calculateTotal() < 10}
                  >
                    <span className="method-icon">{method.icon}</span>
                    <span className="method-name">{method.name}</span>
                    {method.fee > 0 && (
                      <span className="method-fee">+{method.fee}%</span>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
            
            <div className="security-info">
              <Shield size={20} />
              <span>Все платежи защищены. Возврат в течение 14 дней.</span>
            </div>
          </div>
        </section>
        
        {/* История донатов */}
        <section className="history-section">
          <h2 className="section-title">
            <Clock size={28} />
            Последние донаты
          </h2>
          
          <div className="history-list">
            <AnimatePresence>
              {donationHistory.slice(0, 10).map((donation, idx) => (
                <motion.div
                  key={donation.id || idx}
                  className="history-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div className="user-avatar">
                    {donation.username?.[0]?.toUpperCase() || 'A'}
                  </div>
                  <div className="donation-info">
                    <span className="username">{donation.username || 'Аноним'}</span>
                    <span className="amount">{donation.amount} ₽</span>
                  </div>
                  <span className="time">{donation.time}</span>
                  <span className={`status ${donation.status}`}>
                    {donation.status === 'completed' ? '✓' : '...'}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default DonatePage;
