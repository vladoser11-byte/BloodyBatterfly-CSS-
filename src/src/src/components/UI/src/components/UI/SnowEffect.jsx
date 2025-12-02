import React, { useEffect, useRef } from 'react';
import './SnowEffect.css';

const SnowEffect = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Настройка размеров
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    
    // Класс снежинки
    class Snowflake {
      constructor() {
        this.reset();
      }
      
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * -100;
        this.size = Math.random() * 4 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 1 + 0.5;
        this.wind = Math.sin(Date.now() * 0.001) * 0.3;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 0.02 + 0.01;
        this.opacity = Math.random() * 0.7 + 0.3;
        this.shadow = Math.random() > 0.5;
        this.sparkle = Math.random() > 0.8;
        this.sparkleTimer = 0;
      }
      
      update() {
        this.x += this.speedX + this.wind;
        this.y += this.speedY;
        this.wobble += this.wobbleSpeed;
        
        // Эффект ветра
        this.wind = Math.sin(Date.now() * 0.001 + this.x * 0.01) * 0.3;
        
        // Мерцание
        if (this.sparkle) {
          this.sparkleTimer++;
          if (this.sparkleTimer > 60) this.sparkleTimer = 0;
        }
        
        // Перерождение
        if (this.y > canvas.height + 10) {
          this.reset();
          this.y = Math.random() * -100;
        }
      }
      
      draw() {
        ctx.save();
        ctx.translate(this.x + Math.sin(this.wobble) * 2, this.y);
        
        // Тень
        if (this.shadow) {
          ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
          ctx.shadowBlur = 5;
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 1;
        }
        
        // Основная снежинка
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        
        // Шестиугольная снежинка
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const x1 = Math.cos(angle) * this.size;
          const y1 = Math.sin(angle) * this.size;
          const x2 = Math.cos(angle + Math.PI / 6) * this.size * 0.5;
          const y2 = Math.sin(angle + Math.PI / 6) * this.size * 0.5;
          
          if (i === 0) {
            ctx.moveTo(x1, y1);
          } else {
            ctx.lineTo(x1, y1);
          }
          ctx.lineTo(x2, y2);
          ctx.lineTo(x1, y1);
        }
        
        ctx.closePath();
        ctx.fill();
        
        // Мерцание
        if (this.sparkle && this.sparkleTimer < 30) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.beginPath();
          ctx.arc(0, 0, this.size * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.restore();
      }
    }
    
    // Создание снежинок
    const snowflakes = [];
    const snowflakeCount = Math.floor((canvas.width * canvas.height) / 5000);
    
    for (let i = 0; i < snowflakeCount; i++) {
      snowflakes.push(new Snowflake());
    }
    
    // Анимация
    let animationId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Градиентное небо
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(10, 10, 40, 0.1)');
      gradient.addColorStop(1, 'rgba(20, 20, 60, 0.05)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      snowflakes.forEach(snowflake => {
        snowflake.update();
        snowflake.draw();
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(animationId);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      className="snow-effect"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: -2
      }}
    />
  );
};

export default SnowEffect;
