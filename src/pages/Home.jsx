import React, { useState, useEffect } from 'react';
import Header from '../components/UI/Header';
import HomeIcons from '../components/UI/HomeIcons';
import FooterIcons from '../components/UI/FooterIcons'; 
import '../styles/Home.scss';

function Home() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Функция для максимального расширения и запроса полноэкранного режима
    const setupFullscreen = () => {
      if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        
        // Расширяем WebApp на весь доступный экран
        tg.expand();
        
        // Отключаем свайпы в Telegram
        tg.disableVerticalSwipes();
        tg.disableClosingConfirmation();
        
        // Отключаем обновление данных о высоте
        tg.onEvent('viewportChanged', () => {
          tg.expand();
        });
        
        // Сообщаем Telegram что приложение готово
        tg.ready();
        
        // Небольшая задержка перед запросом полноэкранного режима
        setTimeout(() => {
          try {
            // На iOS и некоторых Android устройствах запрос должен следовать за пользовательским действием
            // Поэтому добавляем обработчик клика на всё тело документа
            const handleClick = () => {
              document.removeEventListener('click', handleClick);
              if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(() => {
                  console.log('Fullscreen request failed');
                });
              }
            };
            document.addEventListener('click', handleClick);
          } catch (e) {
            console.warn('Fullscreen not supported:', e);
          }
        }, 1000);
      }
    };

    // Вызываем функцию настройки
    setupFullscreen();
    
    // Определяем iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      document.body.classList.add('ios');
    }
    
    // Предотвращаем масштабирование
    document.addEventListener('touchmove', function(e) {
      if (e.scale !== 1) { e.preventDefault(); }
    }, { passive: false });
    
    // Устанавливаем высоту viewport на 100vh
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    
    return () => {
      window.removeEventListener('resize', setViewportHeight);
    };
  }, []);
  
  const handleClick = () => {
    setAnimate(true);
    setTimeout(() => {
      setAnimate(false);
    }, 300);
    
    // Дополнительно пытаемся запросить полноэкранный режим при клике на кнопку
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (e) {}
  };

  return (
    <div className="home">
      <Header showShare={true} />
      <h1 className="home__title">Название раздела</h1>

      <HomeIcons/>

      <div className="home__buttons">
        <button
          className={`home__button home__button--primary ${animate ? 'animate' : ''}`}
          onClick={handleClick}>
          Обмен &nbsp; опытом
        </button>
        <button className="home__button home__button--secondary">
          Описание
        </button>
        <button className="home__button home__button--tertiary">
          Идеальный результат
        </button>
        <button className="home__button home__button--quaternary">
          Модули проекта
        </button>
      </div>

      <FooterIcons/>
    </div>
  );
}

export default Home;