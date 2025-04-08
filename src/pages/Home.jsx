// Home.jsx
import React, { useState, useEffect } from 'react';
import Header from '../components/UI/Header';
import HomeIcons from '../components/UI/HomeIcons';
import FooterIcons from '../components/UI/FooterIcons'; 
import '../styles/Home.scss';

function Home() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.disableVerticalSwipes();
      
      // Важно сперва выполнить эти действия
      tg.expand();
      tg.ready();
      
      // Оставляем requestFullscreen, но в корректной последовательности
      // и с обработкой ошибок
      setTimeout(() => {
        try {
          // Запрашиваем полноэкранный режим у контейнера, а не всего приложения
          const container = document.getElementById('app-container');
          if (container && container.requestFullscreen) {
            container.requestFullscreen().catch(e => {
              console.warn('Полноэкранный режим не доступен:', e);
            });
          }
        } catch (e) {
          console.warn('requestFullscreen не поддерживается:', e);
        }
      }, 500);
    }
  
    document.addEventListener('touchmove', function(e) {
      if (e.scale !== 1) { e.preventDefault(); }
    }, { passive: false });
  
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      document.body.classList.add('ios');
    }
    
    // Добавляем класс для Telegram WebApp
    document.body.classList.add('telegram-webapp');
  }, []);
  
  const handleClick = () => {
    setAnimate(true);
    setTimeout(() => {
      setAnimate(false);
    }, 300);
  };

  return (
    <div id="app-container" className="home">
      <div className="content-wrapper">
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
    </div>
  );
}

export default Home;