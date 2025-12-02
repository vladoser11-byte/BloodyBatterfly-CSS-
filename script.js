/**
 * BloodyButterfly V34 - Основной JavaScript файл
 * Новогодний аниме сервер 2026
 */

class BloodyButterfly {
    constructor() {
        this.init();
    }

    init() {
        console.log('🚀 BloodyButterfly V34 инициализирован');
        
        // Инициализация всех систем
        this.initNavigation();
        this.initAuth();
        this.initDonations();
        this.initPromoCodes();
        this.initReferrals();
        this.initAdmin();
        this.initAnimations();
        this.initSupport();
        this.initProfile();
        this.initMobileMenu();
        this.initModals();
        
        // Загрузка данных
        this.loadUserData();
        this.updateStats();
        this.initSakuraAnimation();
        this.initSnowAnimation();
        
        // Инициализация графиков
        this.initCharts();
        
        // Обработчики событий
        this.bindEvents();
    }

    // Навигация по разделам
    initNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('.content-section');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Удаляем активный класс у всех ссылок
                navLinks.forEach(l => l.classList.remove('active'));
                
                // Добавляем активный класс текущей ссылке
                link.classList.add('active');
                
                // Скрываем все секции
                sections.forEach(section => {
                    section.classList.remove('active');
                });
                
                // Показываем целевую секцию
                const targetId = link.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.classList.add('active');
                    
                    // Прокрутка к секции
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    // Система аутентификации
    initAuth() {
        this.currentUser = null;
        this.isLoggedIn = false;
        
        // Проверяем сохранённую сессию
        const savedUser = localStorage.getItem('bb_user');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                this.isLoggedIn = true;
                this.updateUserUI();
            } catch (e) {
                console.error('Ошибка загрузки пользователя:', e);
                localStorage.removeItem('bb_user');
            }
        }

        // Обработчики форм
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        const logoutBtn = document.querySelector('.logout-btn');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.showLoginModal());
        }
        
        if (registerBtn) {
            registerBtn.addEventListener('click', () => this.showRegisterModal());
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    }

    // Донаты и платежи
    initDonations() {
        this.donationPackages = [
            { id: 1, name: 'Базовый', price: 100, bonus: 100, features: ['Статус "Поддержка"', 'Цветной ник'] },
            { id: 2, name: 'Премиум', price: 500, bonus: 550, features: ['VIP доступ', 'Приоритетная поддержка', 'Эксклюзивные промокоды'] },
            { id: 3, name: 'Максимум', price: 1000, bonus: 1200, features: ['Статус "Легенда"', 'Персональный менеджер', '10% бонус', 'Кастомный профиль'] }
        ];

        // Обработка покупки пакетов
        document.querySelectorAll('.buy-package-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!this.isLoggedIn) {
                    alert('Для покупки необходимо войти в систему');
                    this.showLoginModal();
                    return;
                }
                
                const amount = parseInt(btn.dataset.amount);
                this.processDonation(amount);
            });
        });

        // Обработка кастомного доната
        const customDonateBtn = document.querySelector('.custom-donate-btn');
        if (customDonateBtn) {
            customDonateBtn.addEventListener('click', () => {
                const amountInput = document.getElementById('custom-amount');
                const amount = parseInt(amountInput.value);
                
                if (!amount || amount < 10) {
                    alert('Минимальная сумма 10 рублей');
                    return;
                }
                
                this.processDonation(amount);
            });
        }

        // Telegram платежи
        const telegramBtn = document.getElementById('telegram-payment-btn');
        if (telegramBtn) {
            telegramBtn.addEventListener('click', () => {
                this.openTelegramPayment();
            });
        }
    }

    // Промокоды
    initPromoCodes() {
        this.promoCodes = {
            'NEWYEAR2026': { reward: 100, expires: '2026-01-31', uses: 0, maxUses: 1000 },
            'BLOODYBUTTERFLY': { reward: 500, expires: '2026-12-31', uses: 0, maxUses: 100 },
            'SAKURA2026': { reward: 50, expires: '2026-03-31', uses: 0, maxUses: 5000 },
            'WELCOME': { reward: 20, expires: '2026-12-31', uses: 0, maxUses: 10000 },
            'VIP2026': { reward: 200, expires: '2026-06-30', uses: 0, maxUses: 500 }
        };

        this.userPromoCodes = JSON.parse(localStorage.getItem('bb_user_promos') || '[]');

        // Активация промокода
        const activateBtn = document.getElementById('activate-promo-btn');
        if (activateBtn) {
            activateBtn.addEventListener('click', () => {
                const promoInput = document.getElementById('promo-input');
                const code = promoInput.value.trim().toUpperCase();
                
                if (!code) {
                    alert('Введите промокод');
                    return;
                }
                
                this.activatePromoCode(code);
                promoInput.value = '';
            });
        }
    }

    // Реферальная система
    initReferrals() {
        this.referrals = JSON.parse(localStorage.getItem('bb_referrals') || '[]');
        this.referralStats = JSON.parse(localStorage.getItem('bb_ref_stats') || '{"total": 0, "today": 0, "week": 0, "month": 0, "earned": 0}');

        // Генерация реферальной ссылки
        this.generateReferralLink();

        // Копирование ссылки
        const copyBtn = document.querySelector('.copy-link-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                this.copyReferralLink();
            });
        }

        // Обновление статистики
        this.updateReferralStats();
    }

    // Админ панель
    initAdmin() {
        // Проверка админ прав
        this.isAdmin = this.currentUser?.role === 'admin';
        
        if (this.isAdmin) {
            document.querySelectorAll('.admin-only').forEach(el => {
                el.style.display = 'flex';
            });
            
            this.loadAdminData();
            this.initAdminCharts();
        } else {
            document.querySelectorAll('.admin-only').forEach(el => {
                el.style.display = 'none';
            });
        }
    }

    // Анимации
    initAnimations() {
        // Плавающая анимация для элементов
        const floatElements = document.querySelectorAll('.animate-float');
        floatElements.forEach(el => {
            el.style.animationDelay = `${Math.random() * 2}s`;
        });

        // Параллакс эффект
        this.initParallax();

        // Интерактивные элементы
        this.initInteractiveElements();
    }

    // Поддержка
    initSupport() {
        this.messages = [];
        this.supportOnline = true;

        // Отправка сообщения
        const sendBtn = document.querySelector('.send-message-btn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                this.sendSupportMessage();
            });
        }

        // FAQ
        this.initFAQ();
    }

    // Профиль пользователя
    initProfile() {
        // Сохранение профиля
        const saveBtn = document.querySelector('.save-profile-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveProfile();
            });
        }

        // Изменение пароля
        const changePassBtn = document.querySelector('.change-password-btn');
        if (changePassBtn) {
            changePassBtn.addEventListener('click', () => {
                this.showChangePasswordModal();
            });
        }

        // Загрузка аватара
        const avatarBtn = document.querySelector('.avatar-upload-btn');
        if (avatarBtn) {
            avatarBtn.addEventListener('click', () => {
                this.uploadAvatar();
            });
        }
    }

    // Мобильное меню
    initMobileMenu() {
        const menuBtn = document.createElement('button');
        menuBtn.className = 'mobile-menu-btn';
        menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        document.querySelector('.header-content').prepend(menuBtn);

        menuBtn.addEventListener('click', () => {
            document.querySelector('.main-nav').classList.toggle('active');
        });
    }

    // Модальные окна
    initModals() {
        // Закрытие модальных окон
        document.querySelectorAll('.modal .close').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.closest('.modal').style.display = 'none';
            });
        });

        // Закрытие по клику вне модального окна
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    // ========== ФУНКЦИОНАЛЬНЫЕ МЕТОДЫ ==========

    // Аутентификация
    showLoginModal() {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.style.display = 'flex';
            
            // Настраиваем форму для входа
            const form = modal.querySelector('#auth-form');
            form.onsubmit = (e) => {
                e.preventDefault();
                this.login();
            };
        }
    }

    showRegisterModal() {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.style.display = 'flex';
            modal.querySelector('h2').textContent = 'Регистрация';
            
            const form = modal.querySelector('#auth-form');
            form.onsubmit = (e) => {
                e.preventDefault();
                this.register();
            };
        }
    }

    login() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Валидация
        if (!email || !password) {
            alert('Заполните все поля');
            return;
        }

        // Симуляция API запроса
        setTimeout(() => {
            const user = {
                id: Math.random().toString(36).substr(2, 9),
                username: email.split('@')[0],
                email: email,
                balance: 1000,
                referrals: 5,
                role: email.includes('admin') ? 'admin' : 'user',
                registered: new Date().toISOString()
            };

            this.currentUser = user;
            this.isLoggedIn = true;
            
            // Сохраняем в localStorage
            localStorage.setItem('bb_user', JSON.stringify(user));
            
            // Обновляем UI
            this.updateUserUI();
            
            // Закрываем модальное окно
            document.getElementById('auth-modal').style.display = 'none';
            
            alert('Успешный вход!');
        }, 1000);
    }

    register() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!email || !password) {
            alert('Заполните все поля');
            return;
        }

        if (password.length < 6) {
            alert('Пароль должен содержать минимум 6 символов');
            return;
        }

        setTimeout(() => {
            const user = {
                id: Math.random().toString(36).substr(2, 9),
                username: email.split('@')[0],
                email: email,
                balance: 100,
                referrals: 0,
                role: 'user',
                registered: new Date().toISOString()
            };

            this.currentUser = user;
            this.isLoggedIn = true;
            
            localStorage.setItem('bb_user', JSON.stringify(user));
            this.updateUserUI();
            
            document.getElementById('auth-modal').style.display = 'none';
            
            alert('Регистрация успешна! На ваш баланс начислено 100 рублей.');
        }, 1000);
    }

    logout() {
        if (confirm('Вы уверены, что хотите выйти?')) {
            this.currentUser = null;
            this.isLoggedIn = false;
            localStorage.removeItem('bb_user');
            this.updateUserUI();
            alert('Вы вышли из системы');
        }
    }

    updateUserUI() {
        const userDropdown = document.getElementById('user-dropdown');
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        
        if (this.isLoggedIn && this.currentUser) {
            // Показываем дропдаун пользователя
            if (userDropdown) userDropdown.style.display = 'block';
            if (loginBtn) loginBtn.style.display = 'none';
            if (registerBtn) registerBtn.style.display = 'none';
            
            // Обновляем данные
            document.getElementById('username-display').textContent = this.currentUser.username;
            document.getElementById('balance-display').textContent = `${this.currentUser.balance} ₽`;
            document.getElementById('profile-username').textContent = this.currentUser.username;
            document.getElementById('profile-balance').textContent = `${this.currentUser.balance} ₽`;
            document.getElementById('profile-referrals').textContent = this.currentUser.referrals;
            document.getElementById('donate-balance').textContent = `${this.currentUser.balance} ₽`;
            document.getElementById('profile-email').value = this.currentUser.email;
            document.getElementById('profile-username-input').value = this.currentUser.username;
            
            // Форматируем дату регистрации
            const regDate = new Date(this.currentUser.registered);
            document.getElementById('profile-reg-date').textContent = 
                regDate.toLocaleDateString('ru-RU');
        } else {
            // Показываем кнопки входа/регистрации
            if (userDropdown) userDropdown.style.display = 'none';
            if (loginBtn) loginBtn.style.display = 'flex';
            if (registerBtn) registerBtn.style.display = 'flex';
            
            // Сбрасываем данные
            document.getElementById('username-display').textContent = 'Гость';
            document.getElementById('balance-display').textContent = '0 ₽';
        }
    }

    // Донаты
    processDonation(amount) {
        if (!this.isLoggedIn) {
            alert('Для доната необходимо войти в систему');
            this.showLoginModal();
            return;
        }

        // Подтверждение
        if (!confirm(`Подтвердить покупку на ${amount} рублей?`)) {
            return;
        }

        // Симуляция платежа
        const paymentMethods = document.querySelectorAll('.method-card.active');
        if (paymentMethods.length === 0) {
            alert('Выберите способ оплаты');
            return;
        }

        const method = paymentMethods[0].querySelector('span').textContent;
        
        if (method === 'Telegram') {
            this.openTelegramPayment(amount);
        } else {
            // Симуляция успешного платежа
            setTimeout(() => {
                // Обновляем баланс
                this.currentUser.balance += amount;
                localStorage.setItem('bb_user', JSON.stringify(this.currentUser));
                
                // Обновляем UI
                this.updateUserUI();
                this.updateStats();
                
                // Добавляем в историю
                this.addToHistory({
                    type: 'donation',
                    amount: amount,
                    method: method,
                    date: new Date().toISOString(),
                    status: 'success'
                });
                
                alert(`Платеж на ${amount} рублей успешно выполнен!`);
            }, 1500);
        }
    }

    openTelegramPayment(amount = null) {
        // Если сумма не указана, пытаемся получить из кастомного ввода
        if (!amount) {
            const customAmount = document.getElementById('custom-amount');
            if (customAmount && customAmount.value) {
                amount = parseInt(customAmount.value);
            }
        }
        
        const amountText = amount ? ` на сумму ${amount} рублей` : '';
        const message = `Хочу сделать донат${amountText}`;
        
        // Открываем Telegram с заранее заполненным сообщением
        const telegramUrl = `https://t.me/your_bot_username?start=${btoa(message)}`;
        window.open(telegramUrl, '_blank');
        
        // Сохраняем информацию о платеже
        if (amount) {
            localStorage.setItem('bb_pending_payment', JSON.stringify({
                amount: amount,
                timestamp: Date.now()
            }));
        }
    }

    // Промокоды
    activatePromoCode(code) {
        if (!this.isLoggedIn) {
            alert('Для активации промокода необходимо войти в систему');
            this.showLoginModal();
            return;
        }

        const promo = this.promoCodes[code];
        
        if (!promo) {
            alert('Промокод не найден');
            return;
        }

        // Проверка срока действия
        const now = new Date();
        const expires = new Date(promo.expires);
        if (now > expires) {
            alert('Промокод истёк');
            return;
        }

        // Проверка лимита использования
        if (promo.uses >= promo.maxUses) {
            alert('Лимит использования промокода исчерпан');
            return;
        }

        // Проверка, не использовал ли пользователь уже этот промокод
        if (this.userPromoCodes.includes(code)) {
            alert('Вы уже активировали этот промокод');
            return;
        }

        // Активация промокода
        setTimeout(() => {
            // Увеличиваем счётчик использования
            promo.uses++;
            
            // Начисляем награду
            this.currentUser.balance += promo.reward;
            localStorage.setItem('bb_user', JSON.stringify(this.currentUser));
            
            // Сохраняем использованный промокод
            this.userPromoCodes.push(code);
            localStorage.setItem('bb_user_promos', JSON.stringify(this.userPromoCodes));
            
            // Обновляем UI
            this.updateUserUI();
            this.updatePromoStats();
            
            // Добавляем в историю
            this.addToHistory({
                type: 'promo',
                code: code,
                reward: promo.reward,
                date: new Date().toISOString()
            });
            
            // Показываем уведомление
            this.showNotification(`Промокод активирован! Начислено ${promo.reward} рублей`, 'success');
            
            // Обновляем список активных промокодов
            this.updateActivePromos();
        }, 1000);
    }

    updatePromoStats() {
        const activePromos = Object.values(this.promoCodes).filter(p => {
            const expires = new Date(p.expires);
            return new Date() < expires && p.uses < p.maxUses;
        }).length;
        
        const usedPromos = this.userPromoCodes.length;
        
        document.getElementById('active-promos').textContent = activePromos;
        document.getElementById('used-promos').textContent = usedPromos;
    }

    updateActivePromos() {
        const promoGrid = document.querySelector('.promo-grid');
        if (!promoGrid) return;
        
        // Очищаем текущий список
        promoGrid.innerHTML = '';
        
        // Добавляем активные промокоды
        Object.entries(this.promoCodes).forEach(([code, data]) => {
            const expires = new Date(data.expires);
            if (new Date() < expires && data.uses < data.maxUses) {
                const promoCard = document.createElement('div');
                promoCard.className = 'promo-card';
                promoCard.innerHTML = `
                    <div class="promo-code">${code}</div>
                    <div class="promo-reward">+${data.reward} ₽</div>
                    <div class="promo-expires">до ${expires.toLocaleDateString('ru-RU')}</div>
                `;
                promoGrid.appendChild(promoCard);
            }
        });
    }

    // Реферальная система
    generateReferralLink() {
        if (!this.isLoggedIn || !this.currentUser) {
            return;
        }
        
        const refCode = btoa(this.currentUser.id).substr(0, 8);
        const link = `${window.location.origin}${window.location.pathname}?ref=${refCode}`;
        
        const linkInput = document.getElementById('referral-link');
        if (linkInput) {
            linkInput.value = link;
        }
        
        // Сохраняем реферальный код
        this.currentUser.refCode = refCode;
        localStorage.setItem('bb_user', JSON.stringify(this.currentUser));
        
        // Проверяем реферальный параметр в URL
        this.checkReferralParam();
    }

    checkReferralParam() {
        const urlParams = new URLSearchParams(window.location.search);
        const refCode = urlParams.get('ref');
        
        if (refCode && this.isLoggedIn) {
            // Не даём пользователю использовать свой же код
            if (this.currentUser.refCode !== refCode) {
                // Проверяем, не регистрировался ли уже пользователь по этой ссылке
                const usedRefs = JSON.parse(localStorage.getItem('bb_used_refs') || '[]');
                if (!usedRefs.includes(refCode)) {
                    // Сохраняем реферала
                    const referrer = Object.values(JSON.parse(localStorage.getItem('bb_users') || '{}'))
                        .find(u => u.refCode === refCode);
                    
                    if (referrer) {
                        // Добавляем реферала
                        this.referrals.push({
                            id: this.currentUser.id,
                            username: this.currentUser.username,
                            date: new Date().toISOString(),
                            referrer: referrer.id,
                            earnings: 0
                        });
                        
                        localStorage.setItem('bb_referrals', JSON.stringify(this.referrals));
                        
                        // Обновляем статистику
                        this.updateReferralStats();
                        
                        // Сохраняем, что этот код уже использован
                        usedRefs.push(refCode);
                        localStorage.setItem('bb_used_refs', JSON.stringify(usedRefs));
                        
                        // Показываем уведомление
                        this.showNotification('Вы зарегистрированы по реферальной ссылке!', 'success');
                    }
                }
            }
        }
    }

    copyReferralLink() {
        const linkInput = document.getElementById('referral-link');
        if (!linkInput) return;
        
        linkInput.select();
        linkInput.setSelectionRange(0, 99999);
        
        try {
            navigator.clipboard.writeText(linkInput.value);
            this.showNotification('Ссылка скопирована в буфер обмена', 'success');
        } catch (err) {
            // Fallback для старых браузеров
            document.execCommand('copy');
            this.showNotification('Ссылка скопирована', 'success');
        }
    }

    updateReferralStats() {
        const today = new Date().toDateString();
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        const stats = {
            today: 0,
            week: 0,
            month: 0,
            total: this.referrals.length,
            earned: this.referralStats.earned
        };
        
        this.referrals.forEach(ref => {
            const refDate = new Date(ref.date);
            
            if (refDate.toDateString() === today) {
                stats.today++;
            }
            
            if (refDate > weekAgo) {
                stats.week++;
            }
            
            if (refDate > monthAgo) {
                stats.month++;
            }
        });
        
        // Обновляем UI
        document.getElementById('ref-today').textContent = stats.today;
        document.getElementById('ref-week').textContent = stats.week;
        document.getElementById('ref-month').textContent = stats.month;
        document.getElementById('ref-total').textContent = stats.total;
        document.getElementById('referral-earned').textContent = `${stats.earned} ₽`;
        document.getElementById('referral-count').textContent = stats.total;
        
        // Сохраняем статистику
        this.referralStats = stats;
        localStorage.setItem('bb_ref_stats', JSON.stringify(stats));
    }

    // Админ панель
    loadAdminData() {
        if (!this.isAdmin) return;
        
        // Загрузка пользователей
        this.loadUsers();
        
        // Загрузка статистики
        this.loadAdminStats();
        
        // Обновление графиков
        this.updateAdminCharts();
    }

    loadUsers() {
        // В реальном проекте здесь был бы запрос к API
        const users = JSON.parse(localStorage.getItem('bb_users') || '{}');
        
        // Обновляем таблицу пользователей
        const usersTable = document.getElementById('admin-users-table');
        if (usersTable) {
            usersTable.innerHTML = '';
            
            Object.values(users).forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.id.substr(0, 8)}</td>
                    <td>${user.username}</td>
                    <td>${user.balance} ₽</td>
                    <td>${user.referrals || 0}</td>
                    <td><span class="status-success">Активен</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline" onclick="app.editUser('${user.id}')">Изменить</button>
                    </td>
                `;
                usersTable.appendChild(row);
            });
        }
    }

    loadAdminStats() {
        // В реальном проекте здесь была бы статистика с сервера
        const stats = {
            totalUsers: 1247,
            totalRevenue: 542890,
            todayRevenue: 12500,
            promosUsed: 4567
        };
        
        document.getElementById('admin-total-users').textContent = stats.totalUsers;
        document.getElementById('admin-total-revenue').textContent = `${stats.totalRevenue} ₽`;
        document.getElementById('admin-today-revenue').textContent = `${stats.todayRevenue} ₽`;
        document.getElementById('admin-promos-used').textContent = stats.promosUsed;
    }

    initAdminCharts() {
        // График доходов
        const revenueCtx = document.getElementById('revenue-chart')?.getContext('2d');
        if (revenueCtx) {
            this.revenueChart = new Chart(revenueCtx, {
                type: 'line',
                data: {
                    labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
                    datasets: [{
                        label: 'Доход',
                        data: [12000, 19000, 30000, 50000, 20000, 30000],
                        borderColor: '#00ff88',
                        backgroundColor: 'rgba(0, 255, 136, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            labels: { color: 'white' }
                        }
                    },
                    scales: {
                        x: {
                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                            ticks: { color: 'white' }
                        },
                        y: {
                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                            ticks: { color: 'white' }
                        }
                    }
                }
            });
        }
        
        // График пользователей
        const usersCtx = document.getElementById('users-chart')?.getContext('2d');
        if (usersCtx) {
            this.usersChart = new Chart(usersCtx, {
                type: 'bar',
                data: {
                    labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
                    datasets: [{
                        label: 'Новые пользователи',
                        data: [100, 150, 200, 300, 250, 400],
                        backgroundColor: 'rgba(255, 102, 204, 0.7)',
                        borderColor: '#ff66cc',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            labels: { color: 'white' }
                        }
                    },
                    scales: {
                        x: {
                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                            ticks: { color: 'white' }
                        },
                        y: {
                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                            ticks: { color: 'white' }
                        }
                    }
                }
            });
        }
    }

    updateAdminCharts() {
        // В реальном проекте здесь было бы обновление данных
        setTimeout(() => {
            if (this.revenueChart) {
                // Обновляем данные графика
                const newData = Array.from({length: 6}, () => Math.floor(Math.random() * 50000) + 10000);
                this.revenueChart.data.datasets[0].data = newData;
                this.revenueChart.update();
            }
            
            if (this.usersChart) {
                const newData = Array.from({length: 6}, () => Math.floor(Math.random() * 500) + 50);
                this.usersChart.data.datasets[0].data = newData;
                this.usersChart.update();
            }
        }, 2000);
    }

    // Анимация сакуры
    initSakuraAnimation() {
        const canvas = document.getElementById('sakura-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Устанавливаем размеры canvas
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Создаем лепестки сакуры
        const petals = [];
        const petalCount = 50;
        
        for (let i = 0; i < petalCount; i++) {
            petals.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 5 + 2,
                speedX: Math.random() * 2 - 1,
                speedY: Math.random() * 2 + 0.5,
                color: `rgba(255, ${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 100 + 155)}, 0.7)`,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.1
            });
        }
        
        // Функция анимации
        const animate = () => {
            // Очищаем canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Обновляем и рисуем каждый лепесток
            petals.forEach(petal => {
                // Обновляем позицию
                petal.x += petal.speedX;
                petal.y += petal.speedY;
                petal.rotation += petal.rotationSpeed;
                
                // Если лепесток упал за нижнюю границу, возвращаем его наверх
                if (petal.y > canvas.height) {
                    petal.y = -10;
                    petal.x = Math.random() * canvas.width;
                }
                
                // Если лепесток улетел за боковые границы
                if (petal.x > canvas.width) petal.x = 0;
                if (petal.x < 0) petal.x = canvas.width;
                
                // Рисуем лепесток
                ctx.save();
                ctx.translate(petal.x, petal.y);
                ctx.rotate(petal.rotation);
                
                // Форма лепестка сакуры (сердцевидная)
                ctx.beginPath();
                ctx.moveTo(0, -petal.radius);
                ctx.bezierCurveTo(
                    petal.radius * 1.5, -petal.radius * 0.5,
                    petal.radius * 0.5, petal.radius * 1.5,
                    0, petal.radius
                );
                ctx.bezierCurveTo(
                    -petal.radius * 0.5, petal.radius * 1.5,
                    -petal.radius * 1.5, -petal.radius * 0.5,
                    0, -petal.radius
                );
                
                // Закрашиваем лепесток
                ctx.fillStyle = petal.color;
                ctx.fill();
                
                ctx.restore();
            });
            
            // Запускаем следующий кадр
            requestAnimationFrame(animate);
        };
        
        // Запускаем анимацию
        animate();
        
        // Обработка изменения размера окна
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }

    // Анимация снега
    initSnowAnimation() {
        const snowContainer = document.getElementById('snow-container');
        if (!snowContainer) return;
        
        // Очищаем контейнер
        snowContainer.innerHTML = '';
        
        // Создаем снежинки
        const snowflakeCount = 100;
        
        for (let i = 0; i < snowflakeCount; i++) {
            const snowflake = document.createElement('div');
            snowflake.className = 'snowflake';
            snowflake.textContent = '❄';
            
            // Случайные параметры для снежинки
            const size = Math.random() * 20 + 10;
            const startX = Math.random() * 100;
            const duration = Math.random() * 10 + 10;
            const delay = Math.random() * 10;
            
            snowflake.style.cssText = `
                left: ${startX}vw;
                font-size: ${size}px;
                animation-duration: ${duration}s;
                animation-delay: ${delay}s;
                opacity: ${Math.random() * 0.5 + 0.3};
            `;
            
            snowContainer.appendChild(snowflake);
        }
    }

    // Параллакс эффект
    initParallax() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('[data-parallax]');
            
            parallaxElements.forEach(el => {
                const speed = el.dataset.parallaxSpeed || 0.5;
                const yPos = -(scrolled * speed);
                el.style.transform = `translateY(${yPos}px)`;
            });
        });
    }

    // Интерактивные элементы
    initInteractiveElements() {
        // Эффект при наведении на карточки
        const cards = document.querySelectorAll('.feature-card, .package-card, .social-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
        
        // Эффект для кнопок
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            btn.addEventListener('mousedown', () => {
                btn.style.transform = 'scale(0.95)';
            });
            
            btn.addEventListener('mouseup', () => {
                btn.style.transform = 'scale(1)';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'scale(1)';
            });
        });
    }

    // FAQ
    initFAQ() {
        const faqQuestions = document.querySelectorAll('.faq-question');
        
        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                const item = question.parentElement;
                const isActive = item.classList.contains('active');
                
                // Закрываем все FAQ
                document.querySelectorAll('.faq-item').forEach(faq => {
                    faq.classList.remove('active');
                });
                
                // Если текущий FAQ был неактивен, открываем его
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        });
    }

    // Поддержка
    sendSupportMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (!message) {
            alert('Введите сообщение');
            return;
        }
        
        if (!this.isLoggedIn) {
            alert('Для отправки сообщения необходимо войти в систему');
            this.showLoginModal();
            return;
        }
        
        // Добавляем сообщение пользователя
        this.addSupportMessage({
            type: 'user',
            text: message,
            time: new Date().toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'})
        });
        
        // Очищаем поле ввода
        input.value = '';
        
        // Симуляция ответа поддержки
        setTimeout(() => {
            const responses = [
                'Спасибо за ваше сообщение! Мы рассмотрим ваш вопрос в ближайшее время.',
                'Наш специалист уже занимается вашим вопросом.',
                'Мы получили ваше сообщение и скоро ответим.',
                'Для решения вашего вопроса нам потребуется дополнительная информация.'
            ];
            
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            
            this.addSupportMessage({
                type: 'support',
                text: randomResponse,
                time: new Date().toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'})
            });
        }, 1000);
    }

    addSupportMessage(message) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.type}`;
        
        messageElement.innerHTML = `
            <div class="message-content">
                <div class="message-text">${message.text}</div>
                <div class="message-time">${message.time}</div>
            </div>
        `;
        
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Сохраняем сообщение в истории
        this.messages.push(message);
    }

    // Профиль
    saveProfile() {
        if (!this.isLoggedIn) {
            alert('Для изменения профиля необходимо войти в систему');
            return;
        }
        
        const username = document.getElementById('profile-username-input').value;
        const email = document.getElementById('profile-email').value;
        const phone = document.getElementById('profile-phone').value;
        const birthday = document.getElementById('profile-birthday').value;
        const country = document.getElementById('profile-country').value;
        
        // Валидация
        if (!username || username.length < 3) {
            alert('Имя пользователя должно содержать минимум 3 символа');
            return;
        }
        
        if (!email || !this.validateEmail(email)) {
            alert('Введите корректный email');
            return;
        }
        
        // Обновляем данные пользователя
        this.currentUser.username = username;
        this.currentUser.email = email;
        this.currentUser.phone = phone;
        this.currentUser.birthday = birthday;
        this.currentUser.country = country;
        
        // Сохраняем
        localStorage.setItem('bb_user', JSON.stringify(this.currentUser));
        
        // Обновляем UI
        this.updateUserUI();
        
        this.showNotification('Профиль успешно сохранен', 'success');
    }

    showChangePasswordModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Изменение пароля</h2>
                <form id="change-password-form">
                    <input type="password" id="current-password" placeholder="Текущий пароль" required>
                    <input type="password" id="new-password" placeholder="Новый пароль" required>
                    <input type="password" id="confirm-password" placeholder="Подтвердите пароль" required>
                    <button type="submit" class="btn btn-primary">Изменить пароль</button>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'flex';
        
        // Закрытие модального окна
        const closeBtn = modal.querySelector('.close');
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });
        
        // Обработка формы
        const form = modal.querySelector('#change-password-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            if (newPassword !== confirmPassword) {
                alert('Пароли не совпадают');
                return;
            }
            
            if (newPassword.length < 6) {
                alert('Пароль должен содержать минимум 6 символов');
                return;
            }
            
            // В реальном проекте здесь была бы проверка текущего пароля и обновление
            setTimeout(() => {
                alert('Пароль успешно изменен');
                modal.remove();
            }, 1000);
        });
    }

    uploadAvatar() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            // Проверка размера файла
            if (file.size > 5 * 1024 * 1024) {
                alert('Размер файла не должен превышать 5MB');
                return;
            }
            
            // Создаем превью
            const reader = new FileReader();
            reader.onload = (event) => {
                const avatar = document.querySelector('.profile-avatar');
                if (avatar) {
                    avatar.src = event.target.result;
                }
                
                // Сохраняем в localStorage
                localStorage.setItem('bb_user_avatar', event.target.result);
                
                this.showNotification('Аватар успешно загружен', 'success');
            };
            
            reader.readAsDataURL(file);
        };
        
        input.click();
    }

    // Уведомления
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Стили уведомления
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'success' ? '#00ff88' : type === 'error' ? '#ff3366' : '#3399ff'};
            color: white;
            border-radius: 10px;
            z-index: 9999;
            animation: slideIn 0.3s ease-out;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        `;
        
        document.body.appendChild(notification);
        
        // Автоматическое удаление через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // История операций
    addToHistory(operation) {
        const history = JSON.parse(localStorage.getItem('bb_history') || '[]');
        history.push(operation);
        localStorage.setItem('bb_history', JSON.stringify(history));
    }

    // Загрузка данных пользователя
    loadUserData() {
        // Загружаем аватар
        const savedAvatar = localStorage.getItem('bb_user_avatar');
        if (savedAvatar) {
            const avatar = document.querySelector('.profile-avatar');
            if (avatar) {
                avatar.src = savedAvatar;
            }
        }
        
        // Загружаем историю
        this.loadHistory();
    }

    loadHistory() {
        const history = JSON.parse(localStorage.getItem('bb_history') || '[]');
        // Можно использовать для отображения истории операций
    }

    // Обновление статистики
    updateStats() {
        // Обновляем счетчики
        const onlineCount = Math.floor(Math.random() * 100) + 1200;
        const promoCount = Object.values(this.promoCodes).filter(p => {
            const expires = new Date(p.expires);
            return new Date() < expires;
        }).length;
        
        // Обновляем UI
        document.getElementById('online-count').textContent = onlineCount.toLocaleString();
        document.getElementById('promo-count').textContent = promoCount;
        
        // Футер статистика
        document.getElementById('footer-users').textContent = (onlineCount - 100).toLocaleString();
        document.getElementById('footer-online').textContent = onlineCount.toLocaleString();
    }

    // Валидация email
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Привязка событий
    bindEvents() {
        // Обновление статистики каждые 30 секунд
        setInterval(() => this.updateStats(), 30000);
        
        // Обновление времени
        setInterval(() => this.updateTime(), 60000);
        this.updateTime();
        
        // Обработка клавиши Enter в чате поддержки
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendSupportMessage();
                }
            });
        }
    }

    updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'});
        
        // Можно добавить отображение времени где-нибудь в интерфейсе
        const timeElement = document.querySelector('.current-time');
        if (timeElement) {
            timeElement.textContent = timeString;
        }
    }

    // Графики
    initCharts() {
        // Инициализация дополнительных графиков если нужно
    }
}

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.app = new BloodyButterfly();
    
    // Добавляем стили для уведомлений
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .notification {
            font-family: inherit;
            font-size: 14px;
            font-weight: 500;
        }
        
        .message {
            margin-bottom: 15px;
            max-width: 70%;
        }
        
        .message.user {
            margin-left: auto;
        }
        
        .message.support {
            margin-right: auto;
        }
        
        .message-content {
            padding: 15px;
            border-radius: 15px;
            background: rgba(255, 255, 255, 0.1);
        }
        
        .message.user .message-content {
            background: rgba(255, 102, 204, 0.2);
            border-bottom-right-radius: 5px;
        }
        
        .message.support .message-content {
            background: rgba(0, 255, 204, 0.2);
            border-bottom-left-radius: 5px;
        }
        
        .message-time {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.5);
            margin-top: 5px;
            text-align: right;
        }
    `;
    document.head.appendChild(style);
});

// Глобальные функции для использования в HTML
function showLogin() {
    if (window.app) window.app.showLoginModal();
}

function showRegister() {
    if (window.app) window.app.showRegisterModal();
}

function activatePromo() {
    const input = document.getElementById('promo-input');
    if (input && window.app) {
        window.app.activatePromoCode(input.value.trim().toUpperCase());
        input.value = '';
    }
}

function buyPackage(amount) {
    if (window.app) window.app.processDonation(amount);
}

function copyReferralLink() {
    if (window.app) window.app.copyReferralLink();
}

// Обработка PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker зарегистрирован');
            })
            .catch(error => {
                console.log('Ошибка регистрации ServiceWorker:', error);
            });
    });
}

// Offline функциональность
window.addEventListener('online', () => {
    if (window.app) {
        window.app.showNotification('Соединение восстановлено', 'success');
    }
});

window.addEventListener('offline', () => {
    if (window.app) {
        window.app.showNotification('Отсутствует соединение', 'error');
    }
});

// Новогодний таймер
function updateNewYearTimer() {
    const now = new Date();
    const newYear = new Date(now.getFullYear() + 1, 0, 1);
    const diff = newYear - now;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    const timerElement = document.getElementById('new-year-timer');
    if (timerElement) {
        timerElement.innerHTML = `
            <div class="timer-item">
                <span class="timer-number">${days}</span>
                <span class="timer-label">дней</span>
            </div>
            <div class="timer-item">
                <span class="timer-number">${hours}</span>
                <span class="timer-label">часов</span>
            </div>
            <div class="timer-item">
                <span class="timer-number">${minutes}</span>
                <span class="timer-label">минут</span>
            </div>
            <div class="timer-item">
                <span class="timer-number">${seconds}</span>
                <span class="timer-label">секунд</span>
            </div>
        `;
    }
}

// Запуск таймера
setInterval(updateNewYearTimer, 1000);
updateNewYearTimer();

// Добавление новогоднего таймера в DOM если его нет
document.addEventListener('DOMContentLoaded', () => {
    const timerContainer = document.createElement('div');
    timerContainer.id = 'new-year-timer';
    timerContainer.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: rgba(0,0,0,0.7);
        padding: 15px;
        border-radius: 15px;
        color: white;
        display: flex;
        gap: 15px;
        z-index: 1000;
        backdrop-filter: blur(10px);
    `;
    
    const timerTitle = document.createElement('div');
    timerTitle.innerHTML = '🎄 До Нового 2026 года:';
    timerTitle.style.fontWeight = 'bold';
    timerTitle.style.marginBottom = '10px';
    
    timerContainer.appendChild(timerTitle);
    document.body.appendChild(timerContainer);
    
    updateNewYearTimer();
});
