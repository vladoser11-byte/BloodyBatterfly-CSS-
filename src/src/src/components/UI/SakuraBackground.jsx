import React, { useEffect, useRef, useState, useCallback } from 'react';
import './SakuraBackground.css';

const SakuraBackground = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [particles, setParticles] = useState([]);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // Конфигурация
  const CONFIG = {
    PARTICLE_COUNT: Math.floor((dimensions.width * dimensions.height) / 12000),
    MAX_PARTICLES: 500,
    COLORS: [
      { r: 255, g: 182, b: 193, a: 0.4 }, // Light pink
      { r: 255, g: 218, b: 233, a: 0.3 }, // Pale pink
      { r: 255, g: 192, b: 203, a: 0.35 }, // Pink
      { r: 255, g: 200, b: 221, a: 0.3 }, // Soft pink
      { r: 255, g: 183, b: 197, a: 0.4 }, // Cherry blossom
    ],
    SHAPES: ['petal', 'circle', 'heart'],
    WIND: {
      base: 0.2,
      variation: 0.1,
      changeInterval: 3000,
      current: 0.2,
      target: 0.2
    },
    INTERACTIVITY: {
      enabled: true,
      mouseRadius: 100,
      repulsionForce: 0.05,
      attractionForce: 0.02
    }
  };

  // Класс частицы
  class SakuraParticle {
    constructor(id) {
      this.id = id;
      this.reset(true);
      this.history = [];
      this.maxHistory = 5;
      this.interaction = {
        influenced: false,
        force: { x: 0, y: 0 },
        timer: 0
      };
    }

    reset(initial = false) {
      const { width, height } = dimensions;
      
      this.x = initial ? Math.random() * width : Math.random() * width;
      this.y = initial ? Math.random() * -100 : -20;
      
      this.size = Math.random() * 12 + 4;
      this.speedX = (Math.random() * 0.6 - 0.3) + CONFIG.WIND.current;
      this.speedY = Math.random() * 0.8 + 0.3;
      
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() * 0.03 - 0.015);
      
      this.wobble = {
        offset: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.01,
        amount: Math.random() * 2 + 1
      };
      
      this.color = CONFIG.COLORS[Math.floor(Math.random() * CONFIG.COLORS.length)];
      this.shape = CONFIG.SHAPES[Math.floor(Math.random() * CONFIG.SHAPES.length)];
      
      this.opacity = Math.random() * 0.3 + 0.2;
      this.targetOpacity = this.opacity;
      
      this.life = 1;
      this.decay = Math.random() * 0.001 + 0.0005;
      
      this.shadow = {
        blur: Math.random() * 5 + 3,
        offsetX: Math.random() * 2 - 1,
        offsetY: Math.random() * 2 + 1
      };
      
      this.trail = Math.random() > 0.7;
      this.sparkle = Math.random() > 0.8;
      this.sparkleTimer = 0;
      
      this.history = [];
    }

    update(mouse) {
      // Сохраняем историю для трейлов
      this.history.push({ x: this.x, y: this.y });
      if (this.history.length > this.maxHistory) {
        this.history.shift();
      }

      // Ветер
      this.speedX += (CONFIG.WIND.target - this.speedX) * 0.01;
      
      // Вобблинг
      const wobbleX = Math.sin(Date.now() * 0.001 * this.wobble.speed + this.wobble.offset) * this.wobble.amount;
      
      // Взаимодействие с мышью
      if (CONFIG.INTERACTIVITY.enabled && mouse) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < CONFIG.INTERACTIVITY.mouseRadius) {
          const force = CONFIG.INTERACTIVITY.repulsionForce * (1 - distance / CONFIG.INTERACTIVITY.mouseRadius);
          const angle = Math.atan2(dy, dx);
          
          this.speedX += Math.cos(angle) * force;
          this.speedY += Math.sin(angle) * force;
          
          this.interaction.influenced = true;
          this.interaction.timer = 60;
          this.targetOpacity = Math.min(1, this.opacity * 1.5);
        }
      }
      
      // Сброс взаимодействия
      if (this.interaction.timer > 0) {
        this.interaction.timer--;
        if (this.interaction.timer === 0) {
          this.interaction.influenced = false;
          this.targetOpacity = this.opacity;
        }
      }
      
      // Движение
      this.x += this.speedX + wobbleX * 0.1;
      this.y += this.speedY;
      this.rotation += this.rotationSpeed;
      
      // Мерцание
      if (this.sparkle) {
        this.sparkleTimer++;
        if (this.sparkleTimer > 120) {
          this.sparkleTimer = 0;
        }
      }
      
      // Жизненный цикл
      this.life -= this.decay;
      this.opacity += (this.targetOpacity - this.opacity) * 0.05;
      
      // Проверка границ
      const { width, height } = dimensions;
      if (this.y > height + 50 || 
          this.x < -50 || 
          this.x > width + 50 ||
          this.life <= 0) {
        this.reset();
        this.y = Math.random() * -100;
        this.life = 1;
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.opacity * this.life;
      
      // Тень
      ctx.shadowColor = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.3)`;
      ctx.shadowBlur = this.shadow.blur;
      ctx.shadowOffsetX = this.shadow.offsetX;
      ctx.shadowOffsetY = this.shadow.offsetY;
      
      // Рисуем форму
      ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.color.a})`;
      
      switch (this.shape) {
        case 'petal':
          this.drawPetal(ctx);
          break;
        case 'heart':
          this.drawHeart(ctx);
          break;
        case 'circle':
          this.drawCircle(ctx);
          break;
      }
      
      // Мерцание
      if (this.sparkle && this.sparkleTimer < 30) {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Трейл
      if (this.trail && this.history.length > 1) {
        ctx.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.1)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        
        for (let i = this.history.length - 1; i >= 0; i--) {
          const point = this.history[i];
          const alpha = i / this.history.length * 0.1;
          ctx.lineTo(point.x - this.x, point.y - this.y);
        }
        
        ctx.stroke();
      }
      
      ctx.restore();
    }

    drawPetal(ctx) {
      const petalCount = 5;
      const petalLength = this.size * 2;
      const petalWidth = this.size * 1.2;
      
      ctx.beginPath();
      
      for (let i = 0; i < petalCount; i++) {
        const angle = (i * 2 * Math.PI) / petalCount;
        const nextAngle = ((i + 1) * 2 * Math.PI) / petalCount;
        
        // Вершины лепестка
        const x1 = Math.cos(angle) * petalLength;
        const y1 = Math.sin(angle) * petalLength;
        
        const x2 = Math.cos(nextAngle) * petalLength;
        const y2 = Math.sin(nextAngle) * petalLength;
        
        // Контрольные точки для кривых
        const cp1x = Math.cos(angle + 0.3) * petalWidth;
        const cp1y = Math.sin(angle + 0.3) * petalWidth;
        
        const cp2x = Math.cos(nextAngle - 0.3) * petalWidth;
        const cp2y = Math.sin(nextAngle - 0.3) * petalWidth;
        
        if (i === 0) {
          ctx.moveTo(x1, y1);
        }
        
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x2, y2);
      }
      
      ctx.closePath();
      ctx.fill();
      
      // Центр цветка
      ctx.fillStyle = `rgba(255, 255, 220, ${this.color.a})`;
      ctx.beginPath();
      ctx.arc(0, 0, this.size * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    drawHeart(ctx) {
      ctx.beginPath();
      
      // Верхняя часть сердца
      const topCurveHeight = this.size * 0.8;
      
      ctx.moveTo(0, this.size * 0.3);
      
      // Левая кривая
      ctx.bezierCurveTo(
        -this.size, -topCurveHeight,
        -this.size * 1.5, this.size,
        0, this.size * 1.5
      );
      
      // Правая кривая
      ctx.bezierCurveTo(
        this.size * 1.5, this.size,
        this.size, -topCurveHeight,
        0, this.size * 0.3
      );
      
      ctx.closePath();
      ctx.fill();
    }

    drawCircle(ctx) {
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Градиент внутри
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${this.color.a * 0.5})`);
      gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, this.size * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Инициализация
  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Создаем частицы
    const newParticles = [];
    for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
      newParticles.push(new SakuraParticle(i));
    }
    setParticles(newParticles);
    
    // Анимация ветра
    const updateWind = () => {
      CONFIG.WIND.target = CONFIG.WIND.base + (Math.random() * 2 - 1) * CONFIG.WIND.variation;
      setTimeout(updateWind, CONFIG.WIND.changeInterval);
    };
    updateWind();
    
    // Обработчик мыши
    let mouse = null;
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };
    
    const handleMouseLeave = () => {
      mouse = null;
    };
    
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    
    // Анимация
    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      
      // Градиентный фон
      const gradient = ctx.createLinearGradient(0, 0, 0, dimensions.height);
      gradient.addColorStop(0, 'rgba(15, 5, 30, 0.2)');
      gradient.addColorStop(1, 'rgba(25, 10, 40, 0.1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);
      
      // Обновляем и рисуем частицы
      newParticles.forEach(particle => {
        particle.update(mouse);
        particle.draw(ctx);
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationRef.current);
    };
  }, [dimensions]);

  // Эффекты
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    
    const cleanup = init();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (cleanup) cleanup();
      cancelAnimationFrame(animationRef.current);
    };
  }, [init]);

  return (
    <canvas
      ref={canvasRef}
      className="sakura-background"
      width={dimensions.width}
      height={dimensions.height}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: -1
      }}
    />
  );
};

export default SakuraBackground;
